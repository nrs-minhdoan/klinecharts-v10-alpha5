```typescript
(
  options?: {
    id?: string
    height?: number
    minHeight?: number
    dragEnabled?: boolean
    order?: number
    state?: 'normal' | 'maximize' | 'minimize'
    axis?: {
      name?: string
      reverse?: boolean
      inside?: boolean
      position?: 'left' | 'right'
      scrollZoomEnabled?: boolean
      gap?: {
        top?: number
        bottom?: number
      }
      createRange?: (params: object) => ({
        from: number
        to: number
        range: number
        realFrom: number
        realTo: number
        realRange: number
        displayFrom: number
        displayTo: number
        displayRange: number
      })
      createTicks?: (params: object) => Array<{
        coord: number
        value: number | string
        text: string
      }>
    }
  }
) => void
```