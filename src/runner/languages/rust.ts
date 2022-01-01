import { JudgeRequest, JudgeSourceType, JudgeType } from '../../types/request'
import { execute, getLimitString } from '../util'
import commonJudge from '../common'

export function judge(data: JudgeRequest) {
    return commonJudge(
        data,
        (path) =>
            execute(
                `p-${data.uid}`,
                getLimitString({ cpuLimit: 50 }, `rustc Main.rs`),
                { cwd: path }
            ),
        (path) => path + '/Main'
    )
}

export function getLanguage() {
    return JudgeSourceType.RUST
}

export function getSupportedType() {
    return [JudgeType.CommonJudge, JudgeType.Interactive]
}
