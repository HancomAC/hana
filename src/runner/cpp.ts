import {
    CommonDataSet,
    JudgeRequest,
    JudgeSourceType,
    JudgeType,
} from '../types/request'
import { sendMessage } from '../socket'
import {
    JudgeResult,
    JudgeResultCode,
    WebSocketResponseType,
} from '../types/response'
import {
    initTempEnv,
    execute,
    isSame,
    ResultType,
    executeJudge,
    clearTempEnv,
    getLimitString,
} from './util'

export default function (
    data: JudgeRequest<
        JudgeType.CommonJudge,
        JudgeSourceType.CPP,
        CommonDataSet
    >
) {
    return new Promise<JudgeResult>(async (resolve) => {
        let match = Array(data.dataSet.data.length).fill(false),
            judgeResult = 'AC' as JudgeResultCode,
            message = ''

        sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
            uid: data.uid,
            progress: 0,
            reason: 'CP',
        })

        const tmpPath = initTempEnv(data.uid, data.source)
        const exePath = tmpPath + '/main'
        let maxMemoryUsage = 0,
            maxTimeUsage = 0

        const result = await execute(
            `p-${data.uid}`,
            getLimitString(
                { cpuLimit: 50 },
                `g++ ${tmpPath}/main.cpp -o ${exePath} -O2 -Wall -lm --static -pipe -std=c++17`
            )
        )

        if (result.code !== 0) {
            clearTempEnv(data.uid)
            resolve({
                uid: data.uid,
                result: match,
                reason: 'CE',
                time: 0,
                memory: 0,
                message: result.stderr,
            })
            return
        }

        sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
            uid: data.uid,
            progress: 0,
            reason: 'RUN',
        })

        for (const i in data.dataSet.data) {
            const { code, stdout, stderr, resultType } = await executeJudge(
                data,
                exePath,
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
                if (!message) message = errorMsg
            } else {
                const info = stderr.split('\n').slice(-2)[0]
                const timeUsage =
                    parseFloat(info.split('m ')[1].split('s')[0]) * 1000
                const memUsage = parseInt(info.split('|')[1])
                maxTimeUsage = Math.max(maxTimeUsage, timeUsage)
                maxMemoryUsage = Math.max(maxMemoryUsage, memUsage)
                if (isSame(stdout, data.dataSet.data[i].output)) match[i] = true
                else if (judgeResult === 'AC')
                    judgeResult = 'WA' as JudgeResultCode
            }
            sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
                uid: data.uid,
                progress: (i as unknown as number) / data.dataSet.data.length,
                reason: 'RUN',
            })
        }
        clearTempEnv(data.uid)
        resolve({
            uid: data.uid,
            result: match,
            reason: judgeResult,
            time: maxTimeUsage,
            memory: maxMemoryUsage,
            message: message,
        })
    })
}
