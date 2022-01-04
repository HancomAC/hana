import { JudgeRequest, JudgeType, ScoringType } from '../types/request'
import { JudgeResult } from '../types/response'
import * as fs from 'fs'
import * as path from 'path'

let importedLanguages: null | Map<
    string,
    {
        getSupportedType: () => JudgeType[]
        judge: (data: JudgeRequest) => Promise<JudgeResult>
        getTimeLimit: (baseTime: number) => number
        getMemoryLimit: (baseMemory: number) => number
    }
>

function loadLanguages() {
    return new Promise<void>(async (resolve) => {
        importedLanguages = new Map()
        const files = fs.readdirSync(path.join(__dirname, 'languages'))
        await Promise.all(
            files.map(async (file) => {
                if (file.endsWith('.js')) {
                    const module: {
                        getLanguage: () => string
                        getSupportedType: () => JudgeType[]
                        judge: (data: JudgeRequest) => Promise<JudgeResult>
                        getTimeLimit: (baseTime: number) => number
                        getMemoryLimit: (baseMemory: number) => number
                        init?: () => Promise<void>
                    } = require(path.join(__dirname, 'languages', file))
                    if (module.init) await module.init()
                    importedLanguages?.set(module.getLanguage(), {
                        getSupportedType: module.getSupportedType,
                        judge: module.judge,
                        getTimeLimit: module.getTimeLimit,
                        getMemoryLimit: module.getMemoryLimit,
                    })
                }
            })
        )
        resolve()
    })
}

export default async function (data: JudgeRequest): Promise<JudgeResult> {
    if (!importedLanguages) await loadLanguages()

    if (importedLanguages && importedLanguages.has(data.language)) {
        const language = importedLanguages.get(data.language)
        if (language && language.getSupportedType().includes(data.judgeType)) {
            return await language.judge({
                ...data,
                timeLimit: language.getTimeLimit(data.timeLimit),
                memoryLimit: language.getMemoryLimit(data.memoryLimit),
            })
        }
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
