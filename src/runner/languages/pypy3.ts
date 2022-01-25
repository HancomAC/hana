import { JudgeSourceType, JudgeType } from '../../types/request'

export function build(
    path: string,
    uid: string,
    sourceName: string = 'Main'
) {
    return `pypy3 -m compileall -b .`
}

export function getExecuteCommand(
    path: string,
    uid: string,
    sourceName: string = 'Main'
) {
    return `pypy3 ${path}/${sourceName}.${getExtension()}`
}

export function getLanguage() {
    return JudgeSourceType.PYPY3
}

export function getExtension() {
    return 'py'
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
