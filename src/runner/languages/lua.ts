import { JudgeSourceType, JudgeType } from '../../types/request'

export function build(path: string, uid: string, sourceName: string = 'Main') {
    return `luac5.3 -p ${sourceName}.${getExtension()}`
}

export function getExecuteCommand(
    path: string,
    uid: string,
    sourceName: string = 'Main'
) {
    return `lua5.3 ${path}/${sourceName}.${getExtension()}`
}

export function getLanguage() {
    return JudgeSourceType.LUA
}

export function getExtension() {
    return 'lua'
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
