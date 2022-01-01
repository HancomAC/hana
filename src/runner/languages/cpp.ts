import { JudgeRequest, JudgeSourceType, JudgeType } from '../../types/request'
import { execute, getLimitString } from '../util'
import commonJudge from '../common'

export function judge(data: JudgeRequest) {
    return commonJudge(
        data,
        (path) =>
            execute(
                `p-${data.uid}`,
                getLimitString(
                    { cpuLimit: 50 },
                    `g++ Main.cpp -o Main -O2 -Wall -lm --static -pipe -std=c++17 -DONLINE_JUDGE`
                ),
                { cwd: path }
            ),
        (path) => path + '/Main'
    )
}

export function getLanguage() {
    return JudgeSourceType.CPP
}

export function getSupportedType() {
    return [JudgeType.CommonJudge, JudgeType.Interactive]
}
