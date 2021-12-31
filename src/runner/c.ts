import { JudgeRequest } from '../types/request'
import { execute, getLimitString } from './util'
import commonJudge from './common'

export default function (data: JudgeRequest) {
    return commonJudge(
        data,
        (path) =>
            execute(
                `p-${data.uid}`,
                getLimitString(
                    { cpuLimit: 50 },
                    `gcc ${path}/Main.c -o ${path}/Main -O2 -Wall -lm --static -std=c99 -DONLINE_JUDGE`
                )
            ),
        (path) => path + '/Main'
    )
}
