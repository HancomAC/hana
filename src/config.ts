const config = {
    MultiJudgeCount: 1,
    BuildCpuLimit: 50,
    RunCpuLimit: 100,
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
