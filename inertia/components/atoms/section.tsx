import {ReactNode} from "react";

interface SectionProps {
  children: ReactNode
}

export function Section(props: SectionProps) {
  const { children } = props

  return <section className="py-8">
    { children }
  </section>
}