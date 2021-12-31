import { JudgeRequest } from '../types/request'
import commonJudge from './common'
import { execute, getLimitString } from './util'

export default function (data: JudgeRequest) {
    return commonJudge(
        data,
        (path) =>
            execute(
                `p-${data.uid}`,
                getLimitString(
                    { cpuLimit: 50 },
                    `python3 -m compileall -b ${path}`
                )
            ),
        (path) => `python3 ${path}/Main.py`
    )
}
