import { JudgeRequest, JudgeSourceType, JudgeType } from '../../types/request'
import { execute, getLimitString } from '../util'
import commonJudge from '../common'

export function build(path: string, uid: string) {
    return execute(
        `p-${uid}`,
        getLimitString(
            { cpuLimit: 50 },
            `g++ Main.cpp -o Main -O2 -Wall -lm --static -pipe -std=c++17 -DONLINE_JUDGE`
        ),
        { cwd: path }
    )
}

export function judge(data: JudgeRequest) {
    return commonJudge(
        data,
        (path) => build(path, data.uid),
        (path) => path + '/Main'
    )
}

export function getLanguage() {
    return JudgeSourceType.CPP
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
