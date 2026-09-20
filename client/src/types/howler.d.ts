declare module 'howler' {
    export interface HowlOptions {
        src: string | string[]
        volume?: number
        loop?: boolean
        preload?: boolean
        html5?: boolean
    }
    export class Howl {
        constructor(options: HowlOptions)
        play(id?: number): number
        stop(id?: number): this
        unload(): void
        volume(volume?: number, id?: number): this | number
        once(event: 'end' | 'load' | 'play' | 'stop' | 'pause', callback: (id: number) => void, id?: number): this
        on(event: string, callback: (id: number) => void, id?: number): this
    }
}