import {
    JudgeRequest,
    JudgeSourceType,
    JudgeType,
    OutputOnly,
} from '../../types/request'
import { sendMessage } from '../../socket'
import { JudgeResult, WebSocketResponseType } from '../../types/response'
import { isSame } from '../util'

export function judge(
    data: JudgeRequest<JudgeType.OutputOnly, JudgeSourceType.TEXT, OutputOnly>
) {
    return new Promise<JudgeResult>((resolve) => {
        let match = Array(data.dataSet.length).fill(0)
        for (const s in data.source) {
            for (const i in data.dataSet) {
                if (
                    isSame(
                        data.source[s].source,
                        data.dataSet[i].data[0].output
                    )
                ) {
                    match[i] = true
                }
            }
            sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
                uid: data.uid,
                progress: (parseInt(s) + 1) / data.source.length,
                reason: 'RUN',
            })
        }
        resolve({
            uid: data.uid,
            result: match,
            resultCode: 'WA',
            reason: match.map((m) => (m ? 'AC' : 'WA')),
            time: Array(data.dataSet.length).fill(0),
            memory: Array(data.dataSet.length).fill(0),
        })
    })
}

export function getLanguage() {
    return JudgeSourceType.TEXT
}

export function getExtension() {
    return 'txt'
}

export function getSupportedType() {
    return [JudgeType.OutputOnly]
}

export function getTimeLimit(baseTime: number) {
    return 0
}

export function getMemoryLimit(baseMemory: number) {
    return 0
}
