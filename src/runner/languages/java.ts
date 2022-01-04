import { JudgeRequest, JudgeSourceType, JudgeType } from '../../types/request'
import { execute, getLimitString } from '../util'
import commonJudge from '../common'

export function judge(data: JudgeRequest) {
    return commonJudge(
        data,
        (path) =>
            execute(
                `p-${data.uid}`,
                getLimitString(
                    { cpuLimit: 50 },
                    `javac --release 11 -J-Xms1024m -J-Xmx1920m -J-Xss512m -encoding UTF-8 Main.java`
                ),
                { cwd: path }
            ),
        (path) =>
            `java -XX:ReservedCodeCacheSize=64m -XX:-UseCompressedClassPointers -Xmx32m -Xss16m -Dfile.encoding=UTF-8 -XX:+UseSerialGC -DONLINE_JUDGE=1 Main`
    )
}

export function getLanguage() {
    return JudgeSourceType.JAVA
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
