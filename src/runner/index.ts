import { JudgeRequest, JudgeType } from '../types/request'
import { JudgeResult } from '../types/response'
import * as fs from 'fs'
import * as path from 'path'

let importedLanguages: null | Map<
    string,
    {
        getSupportedType: () => JudgeType[]
        judge: (data: JudgeRequest) => Promise<JudgeResult>
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
                        init?: () => Promise<void>
                    } = require(path.join(__dirname, 'languages', file))
                    if (module.init) await module.init()
                    importedLanguages?.set(module.getLanguage(), {
                        getSupportedType: module.getSupportedType,
                        judge: module.judge,
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
            return await language.judge(data)
        }
    }
    return {
        uid: data.uid,
        result: Array(data.dataSet.data.length).fill(0),
        reason: 'CE',
        message: 'Unknown judge type',
        time: 0,
        memory: 0,
    }
}
