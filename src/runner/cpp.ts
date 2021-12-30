import {
    CommonDataSet,
    JudgeRequest,
    JudgeSourceType,
    JudgeType,
} from '../types/request'
import { execute, getLimitString } from './util'
import commonJudge from './common'

export default function (
    data: JudgeRequest<
        JudgeType.CommonJudge,
        JudgeSourceType.CPP,
        CommonDataSet
    >
) {
    return commonJudge(
        data,
        (path) =>
            execute(
                `p-${data.uid}`,
                getLimitString(
                    { cpuLimit: 50 },
                    `g++ ${path}/main.cpp -o ${path}/main -O2 -Wall -lm --static -pipe -std=c++17`
                )
            ),
        (path) => path + '/main'
    )
}
