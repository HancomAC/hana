import { JudgeRequest } from '../types/request'
import commonJudge from './common'
import { execute, getLimitString, ResultType } from './util'

export default function (data: JudgeRequest) {
    return commonJudge(
        data,
        async (path) => {
            await execute(
                `p-${data.uid}`,
                getLimitString(
                    { cpuLimit: 50 },
                    `python3 -m compileall -b ${path}`
                )
            )
            return {
                resultType: ResultType.normal,
                code: 0,
                stderr: '',
                stdout: '',
            }
        },
        (path) => `python3 ${path}/Main.py`
    )
}
