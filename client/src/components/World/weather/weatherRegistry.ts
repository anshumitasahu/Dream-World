import type { WorldEnvironmentConfig } from "../WorldTypes";

export type WeatherKind = NonNullable<WorldEnvironmentConfig['weather']>
export type TimeOfDay = NonNullable<WorldEnvironmentConfig['time']>

export interface WeatherTheme {
    sky: string
    fog: string
    fogNear: number,
    fogFar: number
    sunIntensity: number
    sunColor: string
    sunPosition: [number, number, number]
    hemiIntensity: number
    hemiSky: string
    hemiGround: string
    rain: boolean
}

type ThemeTable = Record<WeatherKind, Record<TimeOfDay, WeatherTheme>>

const DAY_SUN: [number, number, number] = [0, 150, 0]
const NIGHT_SUN: [number, number, number] = [-40, 120, 60]

export const WEATHER_REGISTRY: ThemeTable = {
    clear:
    {
        day:
        {
            sky: '#bcc0fe',
            fog: '#bcc0fe',
            fogNear: 0,
            fogFar: 100,
            sunIntensity: 0.5,
            sunColor: '#ffffff',
            sunPosition: DAY_SUN,
            hemiIntensity: 0.5,
            hemiSky: '#ffffff',
            hemiGround: '#d9e7ff',
            rain: false,
        },
        night:
        {
            sky: '#0a0f24',
            fog: '#0a0f24',
            fogNear: 0,
            fogFar: 90,
            sunIntensity: 0.18,
            sunColor: '#a8c0ff',
            sunPosition: NIGHT_SUN,
            hemiIntensity: 0.18,
            hemiSky: '#8ea2ff',
            hemiGround: '#1a2038',
            rain: false,
        },
    },
    rain:
    {
        day:
        {
            sky: '#7d8699',
            fog: '#7d8699',
            fogNear: 0,
            fogFar: 60,
            sunIntensity: 0.1,
            sunColor: '#93a7ff',
            sunPosition: NIGHT_SUN,
            hemiIntensity: 0.2,
            hemiSky: '#7787c9',
            hemiGround: '#141a28',
            rain: true,
        },
        night:
        {
            sky: '#0d121d',
            fog: '#0d121d',
            fogNear: 0,
            fogFar: 60,
            sunIntensity: 0.1,
            sunColor: '#93a7ff',
            sunPosition: NIGHT_SUN,
            hemiIntensity: 0.2,
            hemiSky: '#7787c9',
            hemiGround: '#141a28',
            rain: true,
        }
    },
    snow: {
        day:
        {
            sky: '#cfd8ea',
            fog: '#cfd8ea',
            fogNear: 0,
            fogFar: 80,
            sunIntensity: 0.45,
            sunColor: '#f4f8ff',
            sunPosition: DAY_SUN,
            hemiIntensity: 0.55,
            hemiSky: '#ffffff',
            hemiGround: '#cfd8ea',
            rain: false,
        },
        night: {
            sky: '#11161f',
            fog: '#11161f',
            fogNear: 0,
            fogFar: 70,
            sunIntensity: 0.14,
            sunColor: '#a8coff',
            sunPosition: NIGHT_SUN,
            hemiIntensity: 0.22,
            hemiSky: '#e8f0dc',
            hemiGround: '#4a5a44',
            rain: false,
        },
    },
    forest: {
        day: {
            sky: '#a8c3a0',
            fog: '#a8c3a0',
            fogNear: 0,
            fogFar: 85,
            sunIntensity: 0.4,
            sunColor: '#fff8e0',
            sunPosition: DAY_SUN,
            hemiIntensity: 0.5,
            hemiSky: '#e8f0dc',
            hemiGround: '#4a5a44',
            rain: false,
        },
        night: {
            sky: '#0c1410',
            fog: '#a8c3a0',
            fogNear: 0,
            fogFar: 85,
            sunIntensity: 0.22,
            sunColor: 'fff8e0',
            sunPosition: DAY_SUN,
            hemiIntensity: 0.5,
            hemiSky: '#e8f0dc',
            hemiGround: '#4a5a44',
            rain: false
        },
    },
    desert: {
        day: {
            sky: '#e8d5a8',
            fog: '#e8d5a8',
            fogNear: 0,
            fogFar: 120,
            sunIntensity: 0.45,
            sunColor: '#ffedd0',
            sunPosition: DAY_SUN,
            hemiIntensity: 0.45,
            hemiSky: '#fff4dd',
            hemiGround: '#c9a87a',
            rain: false;
        },
        night: {
            sky: '#141021',
            fog: '#141021',
            fogNear: 0,
            fogFar: 100,
            sunIntensity: 0.12,
            sunColor: '#a8d6c9',
            sunPosition: NIGHT_SUN,
            hemiIntensity: 0.15,
            hemiSky: '#8d86c9',
            hemiGround: '#1d1830',
            rain: false,
        },
    },
}

export function getWeatherTheme(
    weather: WeatherKind = 'clear',
    time: TimeOfDay = 'day',
    fogColor?: string,
): WeatherTheme {
    const base = WEATHER_REGISTRY(weather)[time]
    if (!fogColor) return base
    return { ...base, sky: fogColor, fog: fogColor }
}