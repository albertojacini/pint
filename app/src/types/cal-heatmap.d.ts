declare module 'cal-heatmap' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type CalHeatmapOptions = any

  export interface Dimensions {
    width: number
    height: number
  }

  export default class CalHeatmap {
    constructor()
    paint(options?: CalHeatmapOptions, plugins?: unknown): Promise<unknown>
    next(n?: number): Promise<unknown>
    previous(n?: number): Promise<unknown>
    jumpTo(date: Date, reset?: boolean): Promise<unknown>
    fill(dataSource?: unknown): Promise<unknown>
    on(name: string, fn: (...args: unknown[]) => void): void
    dimensions(): Dimensions
    destroy(): Promise<unknown>
  }
}

declare module 'cal-heatmap/cal-heatmap.css'
