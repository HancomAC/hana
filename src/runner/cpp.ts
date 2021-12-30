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
import { execute, isSame, ResultType } from './index'
import * as fs from 'fs'
import { execSync } from 'child_process'

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
        const tmpPath = '/tmp/' + data.uid
        const exePath = tmpPath + '/main'

        sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
            uid: data.uid,
            progress: 0,
            reason: 'CP',
        })

        execSync(
            `adduser -g execute --disabled-password --no-create-home p-${data.uid}`,
            {
                stdio: 'ignore',
            }
        )

        fs.mkdirSync(tmpPath)
        execSync(`chmod 777 ${tmpPath}`, { stdio: 'ignore' })

        for (const i of data.source)
            fs.writeFileSync(tmpPath + '/' + i.name, i.source)

        const result = await execute(
            `p-${data.uid}`,
            `g++ ${tmpPath}/main.cpp -o ${exePath} -O2 -Wall -lm --static -pipe -std=c++17`,
            ''
        )

        if (result.code !== 0) {
            fs.rmSync(tmpPath, { recursive: true })
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
            const { code, stdout, stderr, resultType } = await execute(
                `p-${data.uid}`,
                `ulimit -m ${data.memoryLimit * 1024};ulimit -v ${
                    data.memoryLimit * 1024
                };ulimit -n 2;cpulimit -l 6 -- time -v ${exePath}`,
                data.dataSet.data[i].input,
                data.timeLimit || 1
            )
            if (code) {
                let errorMsg = ''
                switch (resultType) {
                    case ResultType.normal:
                        errorMsg = stderr.split('\n').slice(0, -23).join('\n')
                        if (judgeResult === 'AC')
                            judgeResult = 'RE' as JudgeResultCode
                        break
                    case ResultType.timeLimitExceeded:
                        errorMsg = stderr
                        judgeResult = 'TLE' as JudgeResultCode
                }
                if (!message) message = errorMsg
            } else {
                const errorMsg = stderr.split('\n').slice(0, -23).join('\n')
                const info = stderr.split('\n').slice(-23).join('\n')
                const memUsage = info.match(/max resident set size: (\d+)/)?.[1]
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
        fs.rmSync(tmpPath, { recursive: true })
        execSync(`deluser p-${data.uid}`, { stdio: 'ignore' })
        resolve({
            uid: data.uid,
            result: match,
            reason: judgeResult,
            time: 0,
            memory: 0,
            message: message,
        })
    })
}
