import { JudgeSourceType, JudgeType } from '../../types/request'
import { execute, getLimitString, getUserName } from '../util'
import { getConfig } from '../../config'

export function build(path: string, uid: string, sourceName: string = 'Main') {
    return execute(
        getUserName(uid),
        getLimitString(
            { cpuLimit: getConfig('BuildCpuLimit') },
            `javac --release 11 -J-Xms1024m -J-Xmx1920m -J-Xss512m -encoding UTF-8 ${sourceName}.${getExtension()}`
        ),
        { cwd: path }
    )
}

export function getExecuteCommand(
    path: string,
    uid: string,
    sourceName: string = 'Main'
) {
    return `java -XX:ReservedCodeCacheSize=64m -XX:-UseCompressedClassPointers -Xmx32m -Xss16m -Dfile.encoding=UTF-8 -XX:+UseSerialGC -DONLINE_JUDGE=1 ${sourceName}`
}

export function getLanguage() {
    return JudgeSourceType.JAVA
}

export function getExtension() {
    return 'java'
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
