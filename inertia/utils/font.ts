import type { BaseFontSize, FontSize, SingleFontSize } from '~/types/font'

export const getFontSizeClass = (size: FontSize): string => {
  if (Array.isArray(size)) {
    return size.map((s) => convertSingleSize(s)).join(' ')
  }

  return convertSingleSize(size)
}

export const convertSingleSize = (size: SingleFontSize): string => {
  if (size.includes(':')) {
    const [breakpoint, textSize] = size.split(':') as [string, BaseFontSize]
    return `${breakpoint}:text-${textSize}`
  }

  return `text-${size}`
}
