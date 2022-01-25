import { JudgeSourceType, JudgeType } from '../../types/request'

export function build(path: string, uid: string, sourceName: string = 'Main') {
    return `go build ${sourceName}.${getExtension()}`
}

export function getExecuteCommand(
    path: string,
    uid: string,
    sourceName: string = 'Main'
) {
    return `${path}/${sourceName}`
}

export function getLanguage() {
    return JudgeSourceType.GO
}

export function getExtension() {
    return 'go'
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
