import { JudgeSourceType, JudgeType } from '../../types/request'

export function build(path: string, uid: string, sourceName: string = 'Main') {
    return `php -l ${sourceName}.${getExtension()}`
}

export function getExecuteCommand(
    path: string,
    uid: string,
    sourceName: string = 'Main'
) {
    return `php -d display_errors=stderr ${path}/${sourceName}.${getExtension()}`
}

export function getLanguage() {
    return JudgeSourceType.PHP
}

export function getExtension() {
    return 'php'
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
