import { JudgeRequest, JudgeSourceType, JudgeType } from '../../types/request'
import commonJudge from '../common'
import { execute, getLimitString, ResultType } from '../util'

export function judge(data: JudgeRequest) {
    return commonJudge(
        data,
        async (path) => {
            await execute(
                `p-${data.uid}`,
                getLimitString(
                    { cpuLimit: 50 },
                    `pypy3 -m compileall -b ${path}`
                ),
                { cwd: path }
            )
            return {
                resultType: ResultType.normal,
                code: 0,
                stderr: '',
                stdout: '',
            }
        },
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
