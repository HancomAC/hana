import { JudgeSourceType, JudgeType } from '../../types/request'

export function build(
    path: string,
    uid: string,
    sourceName: string = 'Main'
) {
    return `dotnet new console --force -o ${sourceName} && dotnet publish ${sourceName} --configuration Release --self-contained true --runtime linux-x64`
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
