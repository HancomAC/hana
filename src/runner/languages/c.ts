import { JudgeSourceType, JudgeType } from '../../types/request'

export function build(path: string, uid: string, sourceName: string = 'Main') {
    return `gcc ${sourceName}.${getExtension()} -o ${sourceName} -O2 -Wall -lm --static -std=c99 -DONLINE_JUDGE`
}

export function getExecuteCommand(
    path: string,
    uid: string,
    sourceName: string = 'Main'
) {
    return `${path}/${sourceName}`
}

export function getLanguage() {
    return JudgeSourceType.C
}

export function getExtension() {
    return 'c'
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
