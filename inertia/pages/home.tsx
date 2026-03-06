import { Section } from '~/components/atoms/section'
import { Heading } from '~/components/atoms/heading'

export default function Home() {
  return (
    <>
      <Section>
        <div className="container">
          <Heading
            level={1}
          >
            Hello, world !
          </Heading>
        </div>
      </Section>
    </>
  )
}
