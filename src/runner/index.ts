import {JudgeRequest, JudgeSourceType, JudgeType, OutputOnly} from "../types/request";

import judgeText from './text';

export default function (data: JudgeRequest) {
    switch (data.judgeType) {
        case JudgeType.OutputOnly:
            return judgeText(data as JudgeRequest<JudgeType.OutputOnly, JudgeSourceType.TEXT, OutputOnly>);
        case JudgeType.CommonJudge:
            switch (data.language) {

            }
    }
}