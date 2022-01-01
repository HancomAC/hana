import { JudgeRequest } from '../types/request'
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
} from './util'

export default function commonJudge(
    data: JudgeRequest,
    build: ((path: string) => Promise<ExecuteResult>) | null,
    getExePath: (path: string) => string
) {
    return new Promise<JudgeResult>(async (resolve) => {
        let result = Array(data.dataSet.data.length).fill(0),
            judgeResult = 'AC' as JudgeResultCode,
            message = ''

        sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
            uid: data.uid,
            progress: 0,
            reason: 'CP',
        })

        const tmpPath = initTempEnv(data.uid, data.source)

        let maxMemoryUsage = 0,
            maxTimeUsage = 0

        if (build) {
            const buildResult = await build(tmpPath)

            if (buildResult.code) {
                clearTempEnv(data.uid)
                resolve({
                    uid: data.uid,
                    result,
                    reason: 'CE',
                    time: 0,
                    memory: 0,
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
            reason: 'RUN',
        })

        for (const i in data.dataSet.data) {
            const { code, stdout, stderr, resultType } = await executeJudge(
                data,
                getExePath(tmpPath),
                data.dataSet.data[i].input
            )
            if (code) {
                let errorMsg = ''
                switch (resultType) {
                    case ResultType.normal:
                        errorMsg = stderr.split('\n').slice(0, -2).join('\n')
                        if (judgeResult === 'AC')
                            judgeResult = 'RE' as JudgeResultCode
                        break
                    case ResultType.timeLimitExceeded:
                        errorMsg = stderr
                        judgeResult = 'TLE' as JudgeResultCode
                }
                if (!message)
                    message = errorMsg.replaceAll(getTmpPath(data.uid), '~')
            } else {
                let info = '',
                    err = stderr.split('\n')
                while (!info.includes('|') && err.length) info = err.pop() || ''
                const timeUsage =
                    parseFloat(info.split('m ')[1].split('s')[0]) * 1000
                const memUsage = parseInt(info.split('|')[1])
                maxTimeUsage = Math.max(maxTimeUsage, timeUsage)
                maxMemoryUsage = Math.max(maxMemoryUsage, memUsage)
                if (isSame(stdout, data.dataSet.data[i].output))
                    result[i as any] = 1
                else if (judgeResult === 'AC')
                    judgeResult = 'WA' as JudgeResultCode
            }
            sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
                uid: data.uid,
                progress: (i as any) / data.dataSet.data.length,
                reason: 'RUN',
            })
        }
        clearTempEnv(data.uid)
        resolve({
            uid: data.uid,
            result,
            reason: judgeResult,
            time: Math.round(maxTimeUsage),
            memory: maxMemoryUsage,
            message,
        })
    })
}
