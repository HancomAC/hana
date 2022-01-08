import { JudgeSourceType, JudgeType } from '../../types/request'
import { execute, getLimitString, ResultType } from '../util'

export async function build(
    path: string,
    uid: string,
    sourceName: string = 'Main'
) {
    await execute(
        `p-${uid}`,
        getLimitString({ cpuLimit: 50 }, `ruby -c ${path}`),
        { cwd: path }
    )
    return {
        resultType: ResultType.normal,
        code: 0,
        stderr: '',
        stdout: '',
    }
}

export function getExecuteCommand(
    path: string,
    uid: string,
    sourceName: string = 'Main'
) {
    return `ruby ${path}/${sourceName}.${getExtension()}`
}

export function getLanguage() {
    return JudgeSourceType.RUBY
}

export function getExtension() {
    return 'rb'
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