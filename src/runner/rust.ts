import { JudgeRequest } from '../types/request'
import { execute, getLimitString } from './util'
import commonJudge from './common'

export default function (data: JudgeRequest) {
    return commonJudge(
        data,
        (path) =>
            execute(
                `root`,
                getLimitString(
                    { cpuLimit: 50 },
                    `rustc ${path}/Main.rs`
                )
            ),
        (path) => path + '/Main'
    )
}
