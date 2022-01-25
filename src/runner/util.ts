import { execSync, spawn } from 'child_process'
import fs from 'fs'
import { ExecuteRequest, SourceFile } from '../types/request'
import { JudgeResultCode } from '../types/response'
import { getConfig } from '../config'
import base32 from 'hi-base32'

export const enum ResultType {
    normal,
    timeLimitExceeded,
    stdioError,
}

export interface ExecuteResult {
    resultType: ResultType
    stdout: string
    stderr: string
    code: number
}

async function abort(pid: number | undefined, userName: string) {
    if (!pid) return
    const { stdout } = await execute(`${userName}`, 'ps -o pid= --ppid ' + pid)
    const pids = stdout.split('\n').map((line) => parseInt(line.trim()))
    for (const cpid of pids) {
        if (cpid) {
            try {
                await abort(cpid, userName)
            } catch (e) {}
        }
    }
    await execute(`${userName}`, `pkill -9 -P ${pid}`)
}

export function execute(
    userName: string,
    exePath: string,
    option: { input?: string; timeout?: number; cwd?: string } = {},
    recursive = 0
) {
    console.log(exePath)
    option = Object.assign({ input: '', timeout: 0, cwd: '' }, option)
    return new Promise<ExecuteResult>(async (resolve) => {
        if (recursive > 3) {
            resolve({
                resultType: ResultType.stdioError,
                stdout: '',
                stderr: '',
                code: -1,
            })
            return
        }
        const child = spawn(`su`, [userName, '-c', exePath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            ...(option.cwd ? { cwd: option.cwd } : {}),
            detached: true,
        })
        child.stdin.on('error', async () => {
            if (!timeouted) {
                await abort(child.pid, userName)
                resolve(await execute(userName, exePath, option))
            }
        })
        child.on('error', async () => {
            if (!timeouted) {
                await abort(child.pid, userName)
                resolve(await execute(userName, exePath, option))
            }
        })
        child.on('exit', function () {
            child.kill()
        })

        let timeHandler: NodeJS.Timeout,
            timeouted = false

        if (option.timeout)
            timeHandler = setTimeout(async () => {
                timeouted = true
                await abort(child.pid, userName)
                resolve({
                    resultType: ResultType.timeLimitExceeded,
                    code: -1,
                    stdout: '',
                    stderr: 'Time Limit Exceed',
                })
            }, option.timeout + 500)

        child.stdin.write(option.input || '')
        child.stdin.end()

        let stdout = '',
            stderr = ''

        child.stdout.on('data', (data: any) => {
            stdout += data
        })

        child.stderr.on('data', (data: any) => {
            stderr += data
        })

        child.on('close', (code) => {
            if (timeouted) return
            if (timeHandler) clearTimeout(timeHandler)
            resolve({
                resultType: ResultType.normal,
                code: code || 0,
                stdout,
                stderr,
            })
        })
    })
}

export function isSame(in1: string, in2: string): boolean {
    let res1 = in1
            .split('\n')
            .map((str) => str.trimEnd())
            .filter((x) => x),
        res2 = in2
            .split('\n')
            .map((str) => str.trimEnd())
            .filter((x) => x)
    return res1.length === res2.length && res1.every((x, i) => x === res2[i])
}

export function getTmpPath(uid: string) {
    return '/tmp/HANA/' + uid
}

export function initTempEnv(uid: string, sources: SourceFile[]) {
    const tmpPath = getTmpPath(uid)
    execSync(
        `adduser -g execute --disabled-password --no-create-home ${getUserName(uid)}`,
        {
            stdio: 'ignore',
        }
    )
    fs.mkdirSync(tmpPath, { recursive: true })
    execSync(`chown ${getUserName(uid)} ${tmpPath}`, { stdio: 'ignore' })

    for (const i of sources) fs.writeFileSync(tmpPath + '/' + i.name, i.source)
    return tmpPath
}

export function clearTempEnv(uid: string) {
    const tmpPath = getTmpPath(uid)
    fs.rmSync(tmpPath, { recursive: true })
    execSync(`deluser ${getUserName(uid)}`, { stdio: 'ignore' })
}

export function getLimitString(
    limit: { memoryLimit?: number; cpuLimit?: number },
    command: string
) {
    return `${
        limit.memoryLimit ? `ulimit -v ${limit.memoryLimit * 1024};` : ''
    }${limit.cpuLimit ? `cpulimit -i -l ${limit.cpuLimit} -- ` : ''}${command}`
}

export function executeJudge(
    data: ExecuteRequest,
    exePath: string,
    input: string
) {
    return execute(
        getUserName(data.uid),
        getLimitString(
            {
                memoryLimit: data.memoryLimit,
                cpuLimit: getConfig('RunCpuLimit'),
            },
            `/usr/bin/time -f "%E|%M" ${exePath}`
        ),
        { input, timeout: data.timeLimit || 0, cwd: getTmpPath(data.uid) }
    )
}

export function representativeResult(results: JudgeResultCode[]) {
    if (results.includes('CE')) return 'CE'
    if (results.includes('RE')) return 'RE'
    if (results.includes('TLE')) return 'TLE'
    if (results.includes('MLE')) return 'MLE'
    if (results.includes('WA')) return 'WA'
    return 'AC'
}

export function tryIt(command: any) {
    try {
        command()
    } catch (e) {}
}

export function getUserName(uid: string) {
    return (
        'p_' +
        base32
            .encode(Buffer.from(uid.replaceAll('-', ''), 'hex'))
            .replaceAll('=', '')
            .toLowerCase()
    )
}