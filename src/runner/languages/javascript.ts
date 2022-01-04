import { JudgeSourceType, JudgeType } from '../../types/request'

export function getExecuteCommand(
    path: string,
    uid: string,
    sourceName: string = 'Main'
) {
    return `node ${path}/${sourceName}.${getExtension()}`
}

export function getLanguage() {
    return JudgeSourceType.JAVASCRIPT
}

export function getExtension() {
    return 'js'
}

export function getSupportedType() {
    return [
        JudgeType.CommonJudge,
        JudgeType.Interactive,
        JudgeType.SpecialJudge,
    ]
}

export function getTimeLimit(baseTime: number) {
    return baseTime
}

export function getMemoryLimit(baseMemory: number) {
    return baseMemory
}
