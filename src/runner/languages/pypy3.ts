import { JudgeRequest, JudgeSourceType, JudgeType } from '../../types/request'
import commonJudge from '../common'
import { execute, getLimitString, ResultType } from '../util'

export async function build(path: string, uid: string) {
    await execute(
        `p-${uid}`,
        getLimitString({ cpuLimit: 50 }, `pypy3 -m compileall -b ${path}`),
        { cwd: path }
    )
    return {
        resultType: ResultType.normal,
        code: 0,
        stderr: '',
        stdout: '',
    }
}

export function judge(data: JudgeRequest) {
    return commonJudge(
        data,
        (path) => build(path, data.uid),
        (path) => `pypy3 ${path}/Main.py`
    )
}

export function getLanguage() {
    return JudgeSourceType.PYPY3
}

export function getSupportedType() {
    return [JudgeType.CommonJudge, JudgeType.Interactive]
}

export function getTimeLimit(baseTime: number) {
    return baseTime
}

export function getMemoryLimit(baseMemory: number) {
    return baseMemory
}
