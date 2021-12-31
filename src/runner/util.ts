import { execSync, spawn } from 'child_process'
import fs from 'fs'
import { JudgeRequest, SourceFile } from '../types/request'

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

export function execute(
    userName: string,
    exePath: string,
    option: { input?: string; timeout?: number; cwd?: string } = {}
) {
    option = Object.assign({ input: '', timeout: 0, cwd: '' }, option)
    return new Promise<ExecuteResult>((resolve) => {
        const child = spawn(`su`, [userName, '-c', exePath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            ...(option.cwd ? { cwd: option.cwd } : {}),
        })
        child.stdin.on('error', () => {
            resolve({
                resultType: ResultType.stdioError,
                code: -1,
                stdout: '',
                stderr: '',
            })
        })
        child.on('error', () => {
            resolve({
                resultType: ResultType.stdioError,
                code: -1,
                stdout: '',
                stderr: '',
            })
        })

        let timeHandler: NodeJS.Timeout,
            timeouted = false

        if (option.timeout)
            timeHandler = setTimeout(() => {
                timeouted = true
                child.kill()
                resolve({
                    resultType: ResultType.timeLimitExceeded,
                    code: -1,
                    stdout: '',
                    stderr: 'Time Limit Exceed',
                })
            }, option.timeout + 1000)

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
        `adduser -g execute --disabled-password --no-create-home p-${uid}`,
        {
            stdio: 'ignore',
        }
    )
    fs.mkdirSync(tmpPath, { recursive: true })
    execSync(`chown p-${uid} ${tmpPath}`, { stdio: 'ignore' })

    for (const i of sources) fs.writeFileSync(tmpPath + '/' + i.name, i.source)
    return tmpPath
}

export function clearTempEnv(uid: string) {
    const tmpPath = getTmpPath(uid)
    fs.rmSync(tmpPath, { recursive: true })
    execSync(`deluser p-${uid}`, { stdio: 'ignore' })
}

export function getLimitString(
    limit: { memoryLimit?: number; cpuLimit?: number },
    command: string
) {
    return `${
        limit.memoryLimit
            ? `ulimit -m ${limit.memoryLimit * 1024};ulimit -v ${
                  limit.memoryLimit * 1024
              };`
            : ''
    }${limit.cpuLimit ? `cpulimit -i -l ${limit.cpuLimit} -- ` : ''}${command}`
}

export function executeJudge(
    data: JudgeRequest,
    exePath: string,
    input: string
) {
    return execute(
        `p-${data.uid}`,
        getLimitString(
            { memoryLimit: data.memoryLimit, cpuLimit: 10 },
            `/usr/bin/time -f "%E|%M" ${exePath}`
        ),
        { input, timeout: data.timeLimit || 0, cwd: getTmpPath(data.uid) }
    )
}
