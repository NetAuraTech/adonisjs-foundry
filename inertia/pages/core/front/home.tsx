import { Section } from '~/components/atoms/section'
import { Heading } from '~/components/atoms/heading'
import { Paragraph } from '~/components/atoms/paragraph'

/**
 * Blank home page for the hand-written front.
 *
 * The `inertia` flavor ships this as the canonical starting point: a minimal
 * page wired through the public layout, so a developer cloning the flavor
 * sees the expected `front.home` pattern from the first file they open.
 * Replace this with your own content.
 */
export default function HomePage() {
  return (
    <Section className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <Heading level={1}>Welcome</Heading>
        <Paragraph variant="muted" spacing="base">
          This is the blank home page of your hand-written front. Edit
          inertia/pages/core/front/home.tsx to get started.
        </Paragraph>
      </div>
    </Section>
  )
}
