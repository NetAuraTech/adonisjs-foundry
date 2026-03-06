import {ReactNode} from "react";
import type {FontSize} from "~/types/font";
import {getFontSizeClass} from "~/utils/font";

interface ParagraphProps {
  children: ReactNode
  fs?: FontSize
  variant?: 'foreground' | 'muted' | 'error' | 'custom'
  color?: string
  spacing?: 'xs' | 'sm' | 'base' | 'xl'
}

export function Paragraph(props: ParagraphProps) {
  const { children, variant = 'foreground', color, fs = 'base', spacing = 'base' } = props

  const fontSizeClass = getFontSizeClass(fs);

  const variants = {
    'foreground': 'text-foreground',
    'muted': 'text-muted',
    'error': 'text-red-700',
    'custom': `${color}`
  }

  const spacings = {
    xs: '',
    sm: '[&:not(:first-child)]:mt-2',
    base: '[&:not(:first-child)]:mt-4',
    xl: '[&:not(:first-child)]:mt-6',
  }

  return <p className={`${variants[variant]} ${fontSizeClass} text-balance leading-7 ${spacings[spacing]}`}>
    { children }
  </p>
}
