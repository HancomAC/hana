import * as path from 'path'
import { execSync } from 'child_process'

const rootPath = path.join(__dirname, '..')
const appPath = path.join(__dirname, 'app.js')
const appCommand = `node --es-module-specifier-resolution=node ${appPath}`

while (true) {
    try {
        execSync(appCommand, { cwd: rootPath, stdio: 'inherit' })
    } catch (e) {}
}
