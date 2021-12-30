import {
    CommonDataSet,
    JudgeRequest,
    JudgeSourceType,
    JudgeType,
    OutputOnly,
} from '../types/request'

import judgeText from './text'
import judgeCPP from './cpp'
import { JudgeResult } from '../types/response'
import { spawn } from 'child_process'

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
