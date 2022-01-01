import { JudgeRequest } from '../types/request'
import { execute, getLimitString } from './util'
import commonJudge from './common'

export default function (data: JudgeRequest) {
    return commonJudge(
        data,
        (path) =>
            execute(
                `p-${data.uid}`,
                getLimitString({ cpuLimit: 50 }, `javac --release 11 -J-Xms1024m -J-Xmx1920m -J-Xss512m -encoding UTF-8 ${path}/Main.java`),
                { cwd: path }
            ),
        (path) => `java -Xms64m -Xmx512m -Xss64m -Dfile.encoding=UTF-8 -XX:+UseSerialGC -DONLINE_JUDGE=1 Main`
    )
}
