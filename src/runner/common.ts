import { JudgeRequest, JudgeType, ScoringType } from '../types/request'
import { sendMessage } from '../socket'
import {
    JudgeResult,
    JudgeResultCode,
    WebSocketResponseType,
} from '../types/response'
import {
    clearTempEnv,
    executeJudge,
    ExecuteResult,
    getTmpPath,
    initTempEnv,
    isSame,
    representativeResult,
    ResultType,
} from './util'
import { initSpecialJudge, clearSpecialJudge, runSpecialJudge } from './special'

export default function commonJudge(
    data: JudgeRequest,
    build: ((path: string, uid: string) => Promise<ExecuteResult>) | null,
    getExecuteCommand: (path: string, uid: string) => string
) {
    return new Promise<JudgeResult>(async (resolve) => {
        sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
            uid: data.uid,
            progress: 0,
            resultCode: 'CP',
        })

        const tmpPath = initTempEnv(data.uid, data.source)

        let message = '',
            judgedProblemCount = 0,
            specialJudgeUID = '',
            example

        const result: (number | number[])[] = [],
            judgeResult: JudgeResultCode[] = [],
            maxMemoryUsage: number[] = [],
            maxTimeUsage: number[] = []
        const problemCount = data.dataSet.reduce(
            (acc, cur) => acc + cur.data.length,
            0
        )

        if (build) {
            const buildResult = await build(tmpPath, data.uid)

            if (buildResult.code) {
                clearTempEnv(data.uid)
                resolve({
                    uid: data.uid,
                    result: data.dataSet.map((subtask) => {
                        switch (subtask.scoringType) {
                            case ScoringType.QUANTIZED:
                                return 0
                            case ScoringType.PROPORTIONAL:
                                return Array(subtask.data.length).fill(0)
                        }
                    }),
                    resultCode: 'CE',
                    reason: Array(data.dataSet.length).fill('CE'),
                    time: Array(data.dataSet.length).fill(0),
                    memory: Array(data.dataSet.length).fill(0),
                    message: buildResult.stderr
                        .replaceAll(getTmpPath(data.uid), '~')
                        .replaceAll(`/p-${data.uid}`, ''),
                })
                return
            }
        }

        if (data.specialJudge) {
            specialJudgeUID = await initSpecialJudge(
                data.specialJudge.language,
                data.specialJudge.source
            )
            if (!specialJudgeUID) {
                resolve({
                    uid: data.uid,
                    result: data.dataSet.map((subtask) => {
                        switch (subtask.scoringType) {
                            case ScoringType.QUANTIZED:
                                return 0
                            case ScoringType.PROPORTIONAL:
                                return Array(subtask.data.length).fill(0)
                        }
                    }),
                    resultCode: 'CE',
                    reason: Array(data.dataSet.length).fill('CE'),
                    time: Array(data.dataSet.length).fill(0),
                    memory: Array(data.dataSet.length).fill(0),
                    message: 'Initialize special judge failed',
                })
                return
            }
        }

        sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
            uid: data.uid,
            progress: 0,
            resultCode: 'RUN',
        })

        for (const subtaskI in data.dataSet) {
            const subtask = data.dataSet[subtaskI]

            let subtaskResult = Array(subtask.data.length).fill(0),
                subtaskJudgeResult = [] as JudgeResultCode[],
                subtaskMaxMemoryUsage = 0,
                subtaskMaxTimeUsage = 0

            for (const i in subtask.data) {
                const { code, stdout, stderr, resultType } = await executeJudge(
                    data,
                    getExecuteCommand(tmpPath, data.uid),
                    subtask.data[i].input
                )
                if (code) {
                    let errorMsg = ''
                    switch (resultType) {
                        case ResultType.normal:
                            errorMsg = stderr
                                .split('\n')
                                .slice(0, -2)
                                .join('\n')
                            subtaskJudgeResult.push('RE')
                            break
                        case ResultType.timeLimitExceeded:
                            errorMsg = stderr
                            subtaskJudgeResult.push('TLE')
                    }
                    if (!message)
                        message = errorMsg.replaceAll(getTmpPath(data.uid), '~')
                    if (subtask.scoringType === ScoringType.QUANTIZED)
                        judgedProblemCount += subtask.data.length - parseInt(i)
                } else {
                    let info = '',
                        err = stderr.split('\n')
                    while (!info.includes('|') && err.length)
                        info = err.pop() || ''
                    const timeUsage =
                        parseFloat(info.split('m ')[1].split('s')[0]) * 1000
                    const memUsage = parseInt(info.split('|')[1])
                    subtaskMaxTimeUsage = Math.max(
                        subtaskMaxTimeUsage,
                        timeUsage
                    )
                    subtaskMaxMemoryUsage = Math.max(
                        subtaskMaxMemoryUsage,
                        memUsage
                    )
                    if (timeUsage > data.timeLimit) {
                        subtaskJudgeResult.push('TLE')
                        if (subtask.scoringType === ScoringType.QUANTIZED) {
                            if (subtask.scoringType === ScoringType.QUANTIZED)
                                judgedProblemCount +=
                                    subtask.data.length - parseInt(i)
                            break
                        }
                    } else {
                        sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
                            uid: data.uid,
                            progress: ++judgedProblemCount / problemCount,
                            resultCode: 'RUN',
                        })
                        if (
                            (data.judgeType === JudgeType.CommonJudge ||
                                data.judgeType === JudgeType.Interactive) &&
                            isSame(stdout, subtask.data[i].output)
                        ) {
                            subtaskJudgeResult.push('AC')
                            subtaskResult[i as any] = 1
                            continue
                        }
                        if (
                            data.judgeType === JudgeType.SpecialJudge &&
                            data.specialJudge &&
                            (await runSpecialJudge(
                                specialJudgeUID,
                                data.specialJudge.language,
                                {
                                    input: subtask.data[i].input,
                                    solution: subtask.data[i].output,
                                    output: stdout,
                                }
                            ))
                        ) {
                            subtaskJudgeResult.push('AC')
                            subtaskResult[i as any] = 1
                            continue
                        }
                        subtaskJudgeResult.push('WA')
                        if (!example) {
                            example = {
                                case: parseInt(subtaskI),
                                no: parseInt(i),
                                output: stdout,
                            }
                        }
                        if (subtask.scoringType === ScoringType.QUANTIZED) {
                            judgedProblemCount +=
                                subtask.data.length - parseInt(i)
                            break
                        }
                    }
                }
            }

            subtaskMaxTimeUsage = Math.min(
                Math.round(subtaskMaxTimeUsage),
                data.timeLimit
            )
            subtaskMaxMemoryUsage = Math.min(
                Math.round(subtaskMaxMemoryUsage),
                data.memoryLimit
            )

            if (subtask.scoringType === ScoringType.QUANTIZED) {
                subtaskResult = subtaskResult.slice(-1)[0]
            }
            result.push(subtaskResult)
            judgeResult.push(representativeResult(subtaskJudgeResult))
            maxTimeUsage.push(subtaskMaxTimeUsage)
            maxMemoryUsage.push(subtaskMaxMemoryUsage)

            sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
                uid: data.uid,
                progress: judgedProblemCount / problemCount,
                resultCode: 'RUN',
            })
        }
        clearTempEnv(data.uid)
        if (data.specialJudge) clearSpecialJudge(specialJudgeUID)
        resolve({
            uid: data.uid,
            result,
            resultCode: representativeResult(judgeResult),
            reason: judgeResult,
            time: maxTimeUsage,
            memory: maxMemoryUsage,
            message,
            example,
        })
    })
}
