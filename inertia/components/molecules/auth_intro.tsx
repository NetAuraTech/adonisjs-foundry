import { ReactNode } from 'react'
import {Heading} from "~/components/atoms/heading";
import {Paragraph} from "~/components/atoms/paragraph";

interface AuthIntroProps {
  title: string,
  text: string,
  icon: ReactNode
}


export function AuthIntro(props: AuthIntroProps) {
  const { title, text, icon } = props


  return <div className="text-center mb-8">
    <div className="inline-flex items-center justify-center bg-primary-400 text-neutral-900 rounded-2xl p-4 margin-block-end-4 mb-4">
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        { icon }
      </svg>
    </div>
    <Heading
      level={1}
    >
      {title}
    </Heading>
    <Paragraph
      variant="muted"
    >
      {text}
    </Paragraph>
  </div>
}
