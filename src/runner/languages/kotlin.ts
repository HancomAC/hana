import { JudgeSourceType, JudgeType } from '../../types/request'
import { execute, getLimitString } from '../util'

export function build(path: string, uid: string, sourceName: string = 'Main') {
    return execute(
        `root`,
        getLimitString(
            { cpuLimit: 50 },
            `ls;kotlinc-native -o ${sourceName} -opt ${sourceName}.${getExtension()}`
        ),
        { cwd: path }
    )
}

export function getExecuteCommand(
    path: string,
    uid: string,
    sourceName: string = 'Main'
) {
    return `${path}/${sourceName}`
}

export function getLanguage() {
    return JudgeSourceType.KOTLIN
}

export function getExtension() {
    return 'kt'
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
