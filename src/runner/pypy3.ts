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
                    `pypy3 -m compileall -b ${path}`
                )
            ),
        (path) => `pypy3 ${path}/Main.py`
    )
}
