import {
    CommonDataSet,
    JudgeRequest,
    JudgeSourceType,
    JudgeType,
    OutputOnly,
} from '../types/request'
import { sendMessage } from '../socket'
import { WebSocketResponseType } from '../types/response'
import { execute, isSame } from './index'
import * as fs from 'fs'
import { execSync } from 'child_process'

export default function (
    data: JudgeRequest<
        JudgeType.CommonJudge,
        JudgeSourceType.CPP,
        CommonDataSet
    >
) {
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

    try {
        execSync(
            `g++ ${tmpPath}/main.cpp -o ${exePath} -O2 -Wall -lm --static -pipe -std=c++14`
        )
    } catch (err) {
        fs.rmdirSync(tmpPath, { recursive: true })
        return {
            uid: data.uid,
            result: match,
            reason: 'CE',
            time: 0,
            memory: 0,
            message: (err as any).stderr.toString(),
        }
    }

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
            progress: (i as unknown as number) / data.dataSet.data.length,
            reason: 'RUN',
        })
    }
    fs.rmdirSync(tmpPath, { recursive: true })
    return {
        uid: data.uid,
        result: match,
        reason: match.reduce((a, b) => a + b, 0) === match.length ? 'AC' : 'WA',
        time: 0,
        memory: 0,
    }
}
