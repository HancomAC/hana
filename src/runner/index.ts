import {
    JudgeRequest,
    JudgeSourceType,
    JudgeType,
    OutputOnly,
} from '../types/request'

import judgeText from './text'

export function isSame(in1: string, in2: string): boolean {
    let res1 = in1
            .split('\n')
            .map((str) => str.trimEnd())
            .filter((x) => x),
        res2 = in2
            .split('\n')
            .map((str) => str.trimEnd())
            .filter((x) => x)
    return res1.length === res2.length && res1.every((x, i) => x === res2[i])
}

export default function (data: JudgeRequest) {
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
            }
    }
}
