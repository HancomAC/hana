import { JudgeSourceType, JudgeType } from '../../types/request'
import { execute, getLimitString, ResultType } from '../util'
import { getConfig } from '../../config'

export async function build(
    path: string,
    uid: string,
    sourceName: string = 'Main'
) {
    await execute(
        `p-${uid}`,
        getLimitString(
            { cpuLimit: getConfig('BuildCpuLimit') },
            `dotnet new console --force -o ${sourceName} && dotnet publish ${sourceName} --configuration Release --self-contained true --runtime linux-x64`
        ),
        { cwd: path }
    )
    return {
        resultType: ResultType.normal,
        code: 0,
        stderr: '',
        stdout: '',
    }
}

export function getExecuteCommand(
    path: string,
    uid: string,
    sourceName: string = 'Main'
) {
    return `${path}/${sourceName}`
}

export function getLanguage() {
    return JudgeSourceType.CSHARP
}

export function getExtension() {
    return 'cs'
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
