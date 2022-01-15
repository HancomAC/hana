import { JudgeSourceType, JudgeType } from '../../types/request'
import { execute, getLimitString, getUserName } from '../util'
import { getConfig } from '../../config'

export function build(path: string, uid: string, sourceName: string = 'Main') {
    return execute(
        getUserName(uid),
        getLimitString(
            { cpuLimit: getConfig('BuildCpuLimit') },
            `g++ ${sourceName}.${getExtension()} -o ${sourceName} -O2 -Wall -lm --static -pipe -std=c++17 -DONLINE_JUDGE`
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
    return JudgeSourceType.CPP
}

export function getExtension() {
    return 'cpp'
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
