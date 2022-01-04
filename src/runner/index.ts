import { JudgeRequest, ScoringType } from '../types/request'
import { JudgeResult } from '../types/response'
import { loadLanguage } from './loader'
import commonJudge from './common'
import { ExecuteResult } from './util'

export default async function (data: JudgeRequest): Promise<JudgeResult> {
    const languageModule = await loadLanguage(data.language)
    let judge = null
    if (
        languageModule &&
        languageModule.getSupportedType().includes(data.judgeType)
    ) {
        if (languageModule.judge) judge = languageModule.judge
        else
            judge = (data: JudgeRequest) =>
                commonJudge(
                    data,
                    languageModule.build as (
                        path: string,
                        uid: string
                    ) => Promise<ExecuteResult>,
                    languageModule.getExecuteCommand as (
                        path: string,
                        uid: string
                    ) => string
                )
        return await judge({
            ...data,
            timeLimit: languageModule.getTimeLimit(data.timeLimit),
            memoryLimit: languageModule.getMemoryLimit(data.memoryLimit),
        })
    }

    return {
        uid: data.uid,
        result: data.dataSet.map((subtask) => {
            switch (subtask.scoringType) {
                case ScoringType.QUANTIZED:
                    return 0
                case ScoringType.PROPORTIONAL:
                    return Array(subtask.data.length).fill(0)
            }
        }),
        resultCode: 'CE',
        reason: Array(data.dataSet.length).fill('CE'),
        message: 'Unknown judge type',
        time: Array(data.dataSet.length).fill(0),
        memory: Array(data.dataSet.length).fill(0),
    }
}
