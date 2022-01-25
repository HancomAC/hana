import {JudgeSourceType, JudgeType} from '../../types/request'

export function build(path: string, uid: string, sourceName: string = 'Main') {
    return `javac --release 11 -J-Xms1024m -J-Xmx1920m -J-Xss512m -encoding UTF-8 ${sourceName}.${getExtension()}`
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
