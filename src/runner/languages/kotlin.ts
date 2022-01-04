import { JudgeRequest, JudgeSourceType, JudgeType } from '../../types/request'
import { execute, getLimitString } from '../util'
import commonJudge from '../common'

export function build(path: string, uid: string) {
    return execute(
        `root`,
        getLimitString(
            { cpuLimit: 50 },
            `ls;kotlinc-native -o Main -opt Main.kt`
        ),
        { cwd: path }
    )
}

export function getExecuteCommand(path: string, uid: string) {
    return path + '/Main'
}

export function getLanguage() {
    return JudgeSourceType.KOTLIN
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
