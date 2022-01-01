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
        let match = Array(data.dataSet.data.length).fill(false)
        for (const s in data.source) {
            for (const i in data.dataSet.data) {
                if (
                    isSame(data.source[s].source, data.dataSet.data[i].output)
                ) {
                    match[i] = true
                }
            }
            sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
                uid: data.uid,
                progress: (s as unknown as number) / data.source.length,
                reason: 'RUN',
            })
        }
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

export function getLanguage() {
    return JudgeSourceType.TEXT
}

export function getSupportedType() {
    return [JudgeType.OutputOnly]
}
