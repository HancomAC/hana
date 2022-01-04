import { JudgeRequest, JudgeSourceType, JudgeType } from '../../types/request'
import { execute, getLimitString } from '../util'
import commonJudge from '../common'

export async function build(path: string, uid: string) {
    const res = await execute(
        `p-${uid}`,
        getLimitString(
            { cpuLimit: 50 },
            `cp -a /include/TYPESCRIPT/. ${path}/;tsc Main.ts`
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

export function judge(data: JudgeRequest) {
    return commonJudge(
        data,
        (path) => build(path, data.uid),
        (path) => `node ${path}/Main.js`
    )
}

export function getLanguage() {
    return JudgeSourceType.TYPESCRIPT
}

export function getSupportedType() {
    return [JudgeType.CommonJudge, JudgeType.Interactive]
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
