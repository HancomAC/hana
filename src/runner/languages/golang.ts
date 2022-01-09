import { JudgeSourceType, JudgeType } from '../../types/request'
import { execute, getLimitString } from '../util'
import { getConfig } from '../../config'

export function build(path: string, uid: string, sourceName: string = 'Main') {
    return execute(
        `p-${uid}`,
        getLimitString(
            { cpuLimit: getConfig('BuildCpuLimit') },
            `go build ${sourceName}.${getExtension()}`
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
