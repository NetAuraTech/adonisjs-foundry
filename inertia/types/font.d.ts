export type BaseFontSize =
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | '8xl'
  | '9xl'

export type SingleFontSize =
  | BaseFontSize
  | `sm:${BaseFontSize}`
  | `md:${BaseFontSize}`
  | `lg:${BaseFontSize}`
  | `xl:${BaseFontSize}`
  | `2xl:${BaseFontSize}`

export type FontSize = SingleFontSize | SingleFontSize[]
