import {
    CommonDataSet,
    JudgeRequest,
    JudgeSourceType,
    JudgeType,
} from '../types/request'
import { sendMessage } from '../socket'
import { JudgeResult, WebSocketResponseType } from '../types/response'
import { execute, isSame } from './index'
import * as fs from 'fs'
import { spawn, execSync } from 'child_process'

export default function (
    data: JudgeRequest<
        JudgeType.CommonJudge,
        JudgeSourceType.CPP,
        CommonDataSet
    >
) {
    return new Promise<JudgeResult>(async (resolve) => {
        let match = Array(data.dataSet.data.length).fill(false)
        const tmpPath = '/tmp/' + data.uid
        const exePath = tmpPath + '/main'

        sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
            uid: data.uid,
            progress: 0,
            reason: 'CP',
        })

        execSync(`adduser --disabled-password --no-create-home p-${data.uid}`)

        fs.mkdirSync(tmpPath)
        execSync(`chmod 777 ${tmpPath}`)

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
            const result = await execute(
                `p-${data.uid}`,
                exePath,
                data.dataSet.data[i].input
            )
            if (isSame(result.stdout, data.dataSet.data[i].output))
                match[i] = true
            sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
                uid: data.uid,
                progress: (i as unknown as number) / data.dataSet.data.length,
                reason: 'RUN',
            })
        }
        fs.rmSync(tmpPath, { recursive: true })
        execSync(`deluser p-${data.uid}`)
        resolve({
            uid: data.uid,
            result: match,
            reason:
                match.reduce((a, b) => a + b, 0) === match.length ? 'AC' : 'WA',
            time: 0,
            memory: 0,
        })
    })
}
