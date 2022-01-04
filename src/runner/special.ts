import { JudgeSourceType } from '../types/request'
import { loadLanguage } from './loader'
import { clearTempEnv, executeJudge, getTmpPath, initTempEnv } from './util'
import fs from 'fs'
import { v4 as uuid } from 'uuid'

const specialJudgeSource = 'Main',
    specialJudgeIn = '_special_judge__HANA__INPUT',
    specialJudgeOut = '_special_judge__HANA__OUTPUT',
    specialJudgeSolution = '_special_judge__HANA__SOLUTION'

export async function initSpecialJudge(
    language: JudgeSourceType,
    source: string
) {
    const uid = uuid()
    const tmpPath = initTempEnv(uid, [])
    const languageModule = await loadLanguage(language)
    if (!languageModule) return ''

    fs.writeFileSync(
        tmpPath +
            '/' +
            specialJudgeSource +
            '.' +
            languageModule.getExtension(),
        source
    )

    if (languageModule.build) {
        const buildResult = await languageModule.build(
            tmpPath,
            uid,
            specialJudgeSource
        )
        if (buildResult.code) return ''
    }

    return uid
}

export function clearSpecialJudge(uid: string) {
    clearTempEnv(uid)
}

export async function runSpecialJudge(
    uid: string,
    language: JudgeSourceType,
    data: { input: string; solution: string; output: string }
) {
    const tmpPath = getTmpPath(uid)
    const languageModule = await loadLanguage(language)
    if (!languageModule) return false

    fs.writeFileSync(tmpPath + '/' + specialJudgeIn, data.input)
    fs.writeFileSync(tmpPath + '/' + specialJudgeSolution, data.solution)
    fs.writeFileSync(tmpPath + '/' + specialJudgeOut, data.output)

    const result = await executeJudge(
        {
            uid,
            timeLimit: languageModule.getTimeLimit(3000),
            memoryLimit: languageModule.getMemoryLimit(1024),
        },
        languageModule.getExecuteCommand(tmpPath, uid, specialJudgeSource) +
            ' ' +
            specialJudgeIn +
            ' ' +
            specialJudgeSolution +
            ' ' +
            specialJudgeOut,
        ''
    )

    return result.code === 0
}
