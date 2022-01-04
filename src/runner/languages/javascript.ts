import { JudgeRequest, JudgeSourceType, JudgeType } from '../../types/request'
import commonJudge from '../common'

export function judge(data: JudgeRequest) {
    return commonJudge(data, null, (path) => `node ${path}/Main.js`)
}

export function getLanguage() {
    return JudgeSourceType.JAVASCRIPT
}

export function getSupportedType() {
    return [JudgeType.CommonJudge, JudgeType.Interactive]
}

export function getTimeLimit(baseTime: number) {
    return baseTime
}

export function getMemoryLimit(baseMemory: number) {
    return baseMemory
}
