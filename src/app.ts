import express from 'express'
import expressWs from 'express-ws'
import { v4 as uuid } from 'uuid'
import { getMessageList, initWS } from './socket'
import { requestJudge } from './judge'
import { JudgeRequest } from './types/request'
import { is } from 'typescript-is'
import * as os from 'os'

import bodyParser from 'body-parser'
import favicon from 'serve-favicon'
import path from 'path'
import { LanguageModule, loadLanguage } from './runner/loader'
import { clearTempEnv, executeJudge, initTempEnv } from './runner/util'
import * as console from 'console'
import { getAllConfig, getConfig, setConfig } from './config'

process.on('uncaughtException', (e) => {
    console.log('uncaughtException:', e)
})

const PORT = 80

async function init() {
    console.log('Preloading languages...')

    const cpp = (await loadLanguage('CPP')) as LanguageModule

    if (!cpp.build) return

    console.log('Preparing sandbox...')

    const uid = uuid(),
        tempEnv = initTempEnv(uid, [
            {
                name: 'Main.cpp',
                source: `#include<iostream>
                int main() {
                    int i, j, sum = 0;
                    for (j = 0; j < 10; j++) for (i = 0; i < 1700000000; i++)
                        sum += i;
                    std::cout << sum;
                    return 0;
                }`,
            },
        ])

    console.log('Building test program...')

    await cpp.build(tempEnv, uid)

    console.log('Calculating time...')

    const { stderr } = await executeJudge(
        { uid, timeLimit: 0, memoryLimit: 1024 },
        cpp.getExecuteCommand(tempEnv, uid),
        ''
    )

    let info = '',
        err = stderr.split('\n'),
        timeUsage = 0
    while (!info.includes('|') && err.length) info = err.pop() || ''
    try {
        timeUsage = parseFloat(info.split('m ')[1].split('s')[0]) * 1000
    } catch {}

    setConfig('RunCpuLimit', (getConfig('RunCpuLimit') / 10000) * timeUsage)

    console.log(`CPU Restriction set to ${getConfig('RunCpuLimit')}%.`)

    setConfig(
        'MultiJudgeCount',
        os.cpus().length *
            Math.floor(
                100 /
                    Math.max(
                        getConfig('RunCpuLimit'),
                        getConfig('BuildCpuLimit')
                    )
            ) -
            2
    )

    console.log(
        `Parallel judgement count set to ${getConfig('MultiJudgeCount')}.`
    )

    console.log('Starting Server...')

    clearTempEnv(uid)

    const app = expressWs(express()).app

    initWS(app)

    app.use(
        bodyParser.json({
            limit: '100mb',
        })
    )

    app.post('/judge', (req, res) => {
        try {
            const problem = {
                uid: uuid(),
                language: req.body.language,
                judgeType: req.body.judgeType,
                source: req.body.source,
                dataSet: req.body.dataSet,
                timeLimit: req.body.timeLimit,
                memoryLimit: req.body.memoryLimit,
                specialJudge: req.body.specialJudge,
            } as JudgeRequest
            if (is<JudgeRequest>(problem)) {
                requestJudge(problem)
                res.send({ success: true, uid: problem.uid })
            } else {
                res.status(400)
                res.send({ success: false })
            }
        } catch (e) {
            console.log(e)
            res.status(400)
            res.send({ success: false })
        }
    })

    app.get('/poll', (req, res) => {
        res.set('Cache-Control', 'no-store')
        res.send({ success: true, data: getMessageList() })
    })

    app.get('/config', (req, res) => {
        res.send({ success: true, data: getAllConfig() })
    })

    app.get('/test', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'res', 'test.html'))
    })

    app.get('/res/logo', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'res', 'logo.png'))
    })

    app.get('/res/github', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'res', 'github.png'))
    })

    app.get('/res/docs', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'res', 'docs.png'))
    })

    app.get('/res/test', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'res', 'test.png'))
    })

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'res', 'index.html'))
    })

    app.use(favicon(__dirname + '/../res/logo.ico'))

    app.use('*', (req, res) => {
        res.redirect('http://jungol.co.kr')
    })

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`)
    })
}

init().catch((e) => {
    console.log(e)
})
