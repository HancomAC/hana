import { JudgeSourceType, JudgeType } from '../../types/request'
import { execute, getLimitString } from '../util'

export async function build(
    path: string,
    uid: string,
    sourceName: string = 'Main'
) {
    const res = await execute(
        `p-${uid}`,
        getLimitString(
            { cpuLimit: 50 },
            `cp -a /include/TYPESCRIPT/. ${path}/;tsc ${sourceName}.${getExtension()}`
        ),
        { cwd: path }
    )
    return {
        resultType: res.resultType,
        code: res.code,
        stdout: '',
        stderr: res.stdout + '\n' + res.stderr,
    }
}

export function getExecuteCommand(
    path: string,
    uid: string,
    sourceName: string = 'Main'
) {
    return `node ${path}/${sourceName}.js`
}

export function getLanguage() {
    return JudgeSourceType.TYPESCRIPT
}

export function getExtension() {
    return 'ts'
}

export function getSupportedType() {
    return [
        JudgeType.CommonJudge,
        JudgeType.Interactive,
        JudgeType.SpecialJudge,
    ]
}

export function getTimeLimit(baseTime: number) {
    return baseTime
}

export function getMemoryLimit(baseMemory: number) {
    return baseMemory
}

export async function init() {
    await execute('root', 'yarn', { cwd: '/include/TYPESCRIPT' })
}
