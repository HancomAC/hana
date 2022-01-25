import { JudgeSourceType } from '../types/request'
import { loadLanguage } from './loader'
import {
    clearTempEnv, execute,
    executeJudge, getLimitString,
    getTmpPath, getUserName,
    initTempEnv,
    tryIt,
} from './util'
import fs from 'fs'
import { v4 as uuid } from 'uuid'
import {getConfig} from "../config";

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

        const buildResult = await execute(getUserName(uid), getLimitString({
            cpuLimit: getConfig('BuildCpuLimit')
        }, languageModule.build(tmpPath, uid, 'Main')), {cwd: tmpPath})

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

    tryIt(() => fs.rmSync(tmpPath + '/' + specialJudgeIn))
    tryIt(() => fs.rmSync(tmpPath + '/' + specialJudgeSolution))
    tryIt(() => fs.rmSync(tmpPath + '/' + specialJudgeOut))

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
            tmpPath +
            '/' +
            specialJudgeIn +
            ' ' +
            tmpPath +
            '/' +
            specialJudgeSolution +
            ' ' +
            tmpPath +
            '/' +
            specialJudgeOut,
        ''
    )

    return result.code === 0
}
