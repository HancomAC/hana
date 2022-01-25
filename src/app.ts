import koa from 'koa'
import Router from 'koa-router'
import webSockify from 'koa-websocket'
import send from 'koa-send'
import bodyParser from 'koa-bodyparser'

import {v4 as uuid} from 'uuid'
import {is} from 'typescript-is'
import * as os from 'os'

import {getMessageList, initWS} from './socket'
import {requestJudge} from './judge'
import {JudgeRequest} from './types/request'
import {LanguageModule, loadLanguage, loadLanguages} from './runner/loader'
import {clearTempEnv, executeJudge, initTempEnv} from './runner/util'
import * as console from 'console'
import {getAllConfig, getConfig, setConfig} from './config'

process.on('uncaughtException', (e) => {
    console.log('uncaughtException:', e)
})

const PORT = 80

async function init() {
    console.log('Preloading languages...')

    await loadLanguages()

    setConfig('MultiJudgeCount', os.cpus().length - 1)

    console.log(
        `Parallel judgement count set to ${getConfig('MultiJudgeCount')}.`
    )

    console.log('Starting Server...')

    const app = webSockify(new koa())
    const router = new Router()

    app.use(
        bodyParser({
            jsonLimit: '10mb',
        })
    )

    initWS(app)

    router.post('/judge', (ctx) => {
        try {
            const problem = {
                uid: uuid(),
                language: ctx.request.body.language,
                judgeType: ctx.request.body.judgeType,
                source: ctx.request.body.source,
                dataSet: ctx.request.body.dataSet,
                timeLimit: ctx.request.body.timeLimit,
                memoryLimit: ctx.request.body.memoryLimit,
                specialJudge: ctx.request.body.specialJudge,
            } as JudgeRequest
            if (is<JudgeRequest>(problem)) {
                requestJudge(problem)
                ctx.body = {success: true, uid: problem.uid}
            } else {
                ctx.status = 400
                ctx.body = {success: false}
            }
        } catch (e) {
            console.log(e)
            ctx.status = 400
            ctx.body = {success: false}
        }
    })

    router
        .get('/poll', (ctx) => {
            ctx.set('Cache-Control', 'no-store')
            ctx.body = {success: true, data: getMessageList()}
        })
        .get('/config', (ctx) => {
            ctx.body = {success: true, data: getAllConfig()}
        })
        .get('/test', async (ctx) => {
            await send(ctx, 'res/test.html')
        })
        .get('/res/logo', async (ctx) => {
            await send(ctx, 'res/logo.png')
        })
        .get('/res/github', async (ctx) => {
            await send(ctx, 'res/github.png')
        })
        .get('/res/docs', async (ctx) => {
            await send(ctx, 'res/docs.png')
        })
        .get('/res/test', async (ctx) => {
            await send(ctx, 'res/test.png')
        })
        .get('favicon.ico', async (ctx) => {
            await send(ctx, 'res/logo.ico')
        })
        .get('/', async (ctx) => {
            await send(ctx, 'res/index.html')
        })
        .use((ctx) => {
            ctx.redirect('http://jungol.co.kr')
        })

    app.use(router.routes()).use(router.allowedMethods())

    await app.listen(PORT)

    console.log(`Server is running on port ${PORT}.`)
}

init().catch((e) => {
    console.log(e)
})
