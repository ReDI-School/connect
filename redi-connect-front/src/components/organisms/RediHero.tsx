import React from 'react'
import {
  Container,
  Section,
  Columns,
  Heading,
  Content
} from 'react-bulma-components'
import { withRouter } from 'react-router-dom'
import Button from '../atoms/Button'
import team from '../../assets/images/hero.svg'
import teamMobile from '../../assets/images/hero-mobile.svg'
import './RediHero.scss'

interface Props {
  history: any
}

const RediHero = ({ history }: Props) => (
  <Section className="hero">
    <Container>
      <Columns>
        <Columns.Column size={5} className="hero-column">
          <Heading size={1} className="hero-column-heading has-text-black">
            Welcome to ReDI Connect
          </Heading>
          <Columns.Column className="is-hidden-tablet">
            <img src={teamMobile} alt="team" className="hero-column-img" />
          </Columns.Column>
          <Content className="hero-column-content">
            Are you ready for the future of work?<br />We connect thriving
              professionals from the digital industry with students and alumni
              of our Digital Career Program.{' '}
          </Content>
          <Button size="large" text="sign-up now!" onButtonPress={() => history.push('/front/signup/landing')} />
        </Columns.Column>
        <Columns.Column offset={1} className="is-hidden-mobile">
          <img src={team} alt="team" className="hero-column-img" />
        </Columns.Column>
      </Columns>
    </Container>
  </Section>
)

export default withRouter(RediHero)
