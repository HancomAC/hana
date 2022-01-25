const config = {
    MultiJudgeCount: 1,
    RunCpuLimit: 98,
    BuildCpuLimit: 98
} as any

type Config = 'MultiJudgeCount' | 'BuildCpuLimit' | 'RunCpuLimit'

export function getConfig(key: Config) {
    return config[key]
}

export function setConfig(key: Config, value: any) {
    config[key] = value
}

export function getAllConfig() {
    return config
}
