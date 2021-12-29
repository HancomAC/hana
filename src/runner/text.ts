import {
    JudgeRequest,
    JudgeSourceType,
    JudgeType,
    OutputOnly,
} from '../types/request'
import { sendMessage } from '../socket'
import { WebSocketResponseType } from '../types/response'
import { isSame } from './index'

export default function (
    data: JudgeRequest<JudgeType.OutputOnly, JudgeSourceType.TEXT, OutputOnly>
) {
    let match = Array(data.dataSet.data.length).fill(false)
    for (const s in data.source) {
        for (const i in data.dataSet.data) {
            if (isSame(data.source[s].source, data.dataSet.data[i].output)) {
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
        reason: match.reduce((a, b) => a + b, 0) === match.length ? 'AC' : 'WA',
        time: 0,
        memory: 0,
    }
}