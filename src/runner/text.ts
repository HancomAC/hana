import {
    JudgeRequest,
    JudgeSourceType,
    JudgeType,
    OutputOnly,
} from '../types/request'
import { sendMessage } from '../socket'
import { WebSocketResponseType } from '../types/response'

export default function (
    data: JudgeRequest<JudgeType.OutputOnly, JudgeSourceType.TEXT, OutputOnly>
) {
    let match = Array(data.dataSet.data.length).fill(false)
    for (const s in data.source) {
        for (const i in data.dataSet.data) {
            if (data.source[s].source === data.dataSet.data[i].output) {
                match[i] = true
            }
        }
        sendMessage(WebSocketResponseType.JUDGE_PROGRESS, {
            uid: data.uid,
            progress: (s as unknown as number) / data.source.length,
            reason: 'RUN',
        })
    }
    return {
        uid: data.uid,
        result: match,
        reason: match.length === data.source.length ? 'AC' : 'WA',
        time: 0,
        memory: 0,
    }
}
