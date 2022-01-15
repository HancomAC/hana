import { JudgeSourceType, JudgeType } from '../../types/request'
import { execute, getLimitString, getUserName } from '../util'
import { getConfig } from '../../config'

export function build(path: string, uid: string, sourceName: string = 'Main') {
    return execute(
        getUserName(uid),
        getLimitString(
            { cpuLimit: getConfig('BuildCpuLimit') },
            `luac5.3 -p ${sourceName}.${getExtension()}`
        ),
        { cwd: path }
    )
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
