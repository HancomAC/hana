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
import { spawn } from 'child_process'

export default function (
    data: JudgeRequest<
        JudgeType.CommonJudge,
        JudgeSourceType.CPP,
        CommonDataSet
    >
) {
    return new Promise<JudgeResult>((resolve) => {
        let match = Array(data.dataSet.data.length).fill(false)
        const tmpPath = '/tmp/' + data.uid
        const exePath = tmpPath + '/main'

        sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
            uid: data.uid,
            progress: 0,
            reason: 'CP',
        })

        fs.mkdirSync(tmpPath)

        for (const i of data.source)
            fs.writeFileSync(tmpPath + '/' + i.name, i.source)

        const cp = spawn('g++', [
            `${tmpPath}/main.cpp`,
            '-o',
            exePath,
            '-O2',
            '-Wall',
            '-lm',
            '--static',
            '-pipe',
            '-std=c++17',
        ])
        let stderr = ''

        cp.stderr.on('data', (data) => {
            if (data) stderr += data.toString()
        })

        cp.on('exit', (code) => {
            if (code !== 0) {
                fs.rmdirSync(tmpPath, { recursive: true })
                resolve({
                    uid: data.uid,
                    result: match,
                    reason: 'CE',
                    time: 0,
                    memory: 0,
                    message: stderr,
                })
                return
            } else {
                sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
                    uid: data.uid,
                    progress: 0,
                    reason: 'RUN',
                })

                for (const i in data.dataSet.data) {
                    if (
                        isSame(
                            execute(exePath, data.dataSet.data[i].input),
                            data.dataSet.data[i].output
                        )
                    ) {
                        match[i] = true
                    }
                    sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
                        uid: data.uid,
                        progress:
                            (i as unknown as number) / data.dataSet.data.length,
                        reason: 'RUN',
                    })
                }
                fs.rmdirSync(tmpPath, { recursive: true })
                resolve({
                    uid: data.uid,
                    result: match,
                    reason:
                        match.reduce((a, b) => a + b, 0) === match.length
                            ? 'AC'
                            : 'WA',
                    time: 0,
                    memory: 0,
                })
            }
        })
    })
}
