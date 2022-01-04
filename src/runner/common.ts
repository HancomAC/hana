import { JudgeRequest, ScoringType } from '../types/request'
import { sendMessage } from '../socket'
import {
    JudgeResult,
    JudgeResultCode,
    WebSocketResponseType,
} from '../types/response'
import {
    initTempEnv,
    isSame,
    ResultType,
    executeJudge,
    clearTempEnv,
    ExecuteResult,
    getTmpPath,
    representativeResult,
} from './util'

export default function commonJudge(
    data: JudgeRequest,
    build: ((path: string) => Promise<ExecuteResult>) | null,
    getExePath: (path: string) => string
) {
    return new Promise<JudgeResult>(async (resolve) => {
        sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
            uid: data.uid,
            progress: 0,
            resultCode: 'CP',
        })

        const tmpPath = initTempEnv(data.uid, data.source)

        let message = ''
        const result: (number | number[])[] = [],
            judgeResult: JudgeResultCode[] = [],
            maxMemoryUsage: number[] = [],
            maxTimeUsage: number[] = []

        if (build) {
            const buildResult = await build(tmpPath)

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
                    getExePath(tmpPath),
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
                    if (subtask.scoringType === ScoringType.QUANTIZED) break
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
                        if (subtask.scoringType === ScoringType.QUANTIZED) break
                    } else if (isSame(stdout, subtask.data[i].output)) {
                        subtaskJudgeResult.push('AC')
                        subtaskResult[i as any] = 1
                    } else {
                        subtaskJudgeResult.push('WA')
                        if (subtask.scoringType === ScoringType.QUANTIZED) break
                    }
                }
                sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
                    uid: data.uid,
                    progress:
                        (parseInt(i) + 1) /
                            subtask.data.length /
                            data.dataSet.length +
                        parseInt(subtaskI) / data.dataSet.length,
                    resultCode: 'RUN',
                })
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
        }
        clearTempEnv(data.uid)
        resolve({
            uid: data.uid,
            result,
            resultCode: representativeResult(judgeResult),
            reason: judgeResult,
            time: maxTimeUsage,
            memory: maxMemoryUsage,
            message,
        })
    })
}
