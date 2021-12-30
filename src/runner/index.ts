import {
    CommonDataSet,
    JudgeRequest,
    JudgeSourceType,
    JudgeType,
    OutputOnly,
} from '../types/request'
import { JudgeResult } from '../types/response'

import judgeText from './text'
import judgeCPP from './cpp'
import judgePython3 from './python3'
import judgePypy3 from './pypy3'

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
                case JudgeSourceType.CPP:
                    return judgeCPP(
                        data as JudgeRequest<
                            JudgeType.CommonJudge,
                            JudgeSourceType.CPP,
                            CommonDataSet
                        >
                    )
                case JudgeSourceType.PYTHON3:
                    return judgePython3(
                        data as JudgeRequest<
                            JudgeType.CommonJudge,
                            JudgeSourceType.PYTHON3,
                            CommonDataSet
                        >
                    )
                case JudgeSourceType.PYPY3:
                    return judgePypy3(
                        data as JudgeRequest<
                            JudgeType.CommonJudge,
                            JudgeSourceType.PYPY3,
                            CommonDataSet
                        >
                    )
            }
    }
    return Promise.resolve({
        uid: data.uid,
        result: Array(data.dataSet.data.length).fill(false),
        reason: 'CE',
        time: 0,
        memory: 0,
    })
}
