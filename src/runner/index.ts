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
    importedLanguages = new Map()
    const files = fs.readdirSync(path.join(__dirname, 'languages'))
    files.forEach(async (file) => {
        if (file.endsWith('.js')) {
            const module: {
                getLanguage: () => string
                getSupportedType: () => JudgeType[]
                judge: (data: JudgeRequest) => Promise<JudgeResult>
            } = require(path.join(__dirname, 'languages', file))
            importedLanguages?.set(module.getLanguage(), {
                getSupportedType: module.getSupportedType,
                judge: module.judge,
            })
        }
    })
}

export default function (data: JudgeRequest): Promise<JudgeResult> {
    if (!importedLanguages) {
        loadLanguages()
    }
    if (importedLanguages && importedLanguages.has(data.language)) {
        const language = importedLanguages.get(data.language)
        if (language && language.getSupportedType().includes(data.judgeType)) {
            return language.judge(data)
        }
    }
    return Promise.resolve({
        uid: data.uid,
        result: Array(data.dataSet.data.length).fill(0),
        reason: 'CE',
        message: 'Unknown judge type',
        time: 0,
        memory: 0,
    })
}
