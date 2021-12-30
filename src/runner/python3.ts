import { JudgeRequest } from '../types/request'
import commonJudge from './common'

export default function (data: JudgeRequest) {
    return commonJudge(data, null, (path) => `python3 ${path}/main.py`)
}
