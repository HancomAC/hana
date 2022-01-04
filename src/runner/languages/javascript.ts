import { JudgeRequest, JudgeSourceType, JudgeType } from '../../types/request'
import commonJudge from '../common'

export function getExecuteCommand(path: string, uid: string) {
    return `node ${path}/Main.js`
}

export function getLanguage() {
    return JudgeSourceType.JAVASCRIPT
}

export function getSupportedType() {
    return [JudgeType.CommonJudge, JudgeType.Interactive, JudgeType.SpecialJudge]
}

export function getTimeLimit(baseTime: number) {
    return baseTime
}

export function getMemoryLimit(baseMemory: number) {
    return baseMemory
}
