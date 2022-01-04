import { JudgeRequest, JudgeSourceType, JudgeType } from '../../types/request'
import { execute, getLimitString } from '../util'
import commonJudge from '../common'

export function build(path: string, uid: string) {
    return execute(
        `p-${uid}`,
        getLimitString(
            { cpuLimit: 50 },
            `javac --release 11 -J-Xms1024m -J-Xmx1920m -J-Xss512m -encoding UTF-8 Main.java`
        ),
        { cwd: path }
    )
}

export function getExecuteCommand(path: string, uid: string) {
    return `java -XX:ReservedCodeCacheSize=64m -XX:-UseCompressedClassPointers -Xmx32m -Xss16m -Dfile.encoding=UTF-8 -XX:+UseSerialGC -DONLINE_JUDGE=1 Main`
}

export function getLanguage() {
    return JudgeSourceType.JAVA
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
