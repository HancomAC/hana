import { JudgeRequest, JudgeType } from '../types/request'
import { JudgeResult } from '../types/response'
import fs from 'fs'
import path from 'path'
import { ExecuteResult } from './util'

export interface LanguageModule {
    getSupportedType: () => JudgeType[]
    judge?: (data: JudgeRequest) => Promise<JudgeResult>
    getTimeLimit: (baseTime: number) => number
    getMemoryLimit: (baseMemory: number) => number
    build?: (
        path: string,
        uid: string,
        sourceName?: string
    ) => string
    getExecuteCommand: (
        path: string,
        uid: string,
        sourceName?: string
    ) => string
    getExtension: () => string
}

export interface LanguageModuleBase extends LanguageModule {
    getLanguage: () => string
    init?: () => Promise<void>
}

let importedLanguages: null | Map<string, LanguageModule>

export function loadLanguages() {
    return new Promise<Map<string, LanguageModule>>(async (resolve) => {
        if (importedLanguages) {
            resolve(importedLanguages)
            return
        }
        importedLanguages = new Map()
        const files = fs.readdirSync(path.join(__dirname, 'languages'))
        await Promise.all(
            files.map(async (file) => {
                if (file.endsWith('.js')) {
                    const module: LanguageModuleBase = require(path.join(
                        __dirname,
                        'languages',
                        file
                    ))
                    if (module.init) await module.init()
                    importedLanguages?.set(module.getLanguage(), {
                        getSupportedType: module.getSupportedType,
                        judge: module.judge,
                        build: module.build,
                        getExecuteCommand: module.getExecuteCommand,
                        getTimeLimit: module.getTimeLimit,
                        getMemoryLimit: module.getMemoryLimit,
                        getExtension: module.getExtension,
                    })
                }
            })
        )
        resolve(importedLanguages)
    })
}

export async function loadLanguage(language: string) {
    const importedLanguages = await loadLanguages()
    if (importedLanguages.has(language)) return importedLanguages.get(language)
    return null
}
