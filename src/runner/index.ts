import {
    CommonDataSet,
    JudgeRequest,
    JudgeSourceType,
    JudgeType,
    OutputOnly,
} from '../types/request'
import { JudgeResult } from '../types/response'

import judgeText from './text'
import judgeC from './c'
import judgeCPP from './cpp'
import judgePython3 from './python3'
import judgePypy3 from './pypy3'
import judgeJava from './java'
import judgeRust from './rust'

export default function (data: JudgeRequest): Promise<JudgeResult> {
    switch (data.judgeType) {
        case JudgeType.OutputOnly:
            return judgeText(
                data as JudgeRequest<
                    JudgeType.OutputOnly,
                    JudgeSourceType.TEXT,
                    OutputOnly
                >
            )
        case JudgeType.CommonJudge:
            switch (data.language) {
                case JudgeSourceType.C:
                    return judgeC(data)
                case JudgeSourceType.CPP:
                    return judgeCPP(data)
                case JudgeSourceType.PYTHON3:
                    return judgePython3(data)
                case JudgeSourceType.PYPY3:
                    return judgePypy3(data)
                case JudgeSourceType.JAVA:
                    return judgeJava(data)
                case JudgeSourceType.RUST:
                    return judgeRust(data)
            }
            return Promise.resolve({
                uid: data.uid,
                result: Array(data.dataSet.data.length).fill(false),
                reason: 'CE',
                message: 'Unknown language',
                time: 0,
                memory: 0,
            })
    }
    return Promise.resolve({
        uid: data.uid,
        result: Array(data.dataSet.data.length).fill(false),
        reason: 'CE',
        message: 'Unknown judge type',
        time: 0,
        memory: 0,
    })
}
