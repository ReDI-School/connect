import React from 'react'
import {
  Container,
  Section,
  Columns,
  Level,
  Element,
} from 'react-bulma-components'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './RediHero.scss'
import { rediLocationNames } from '@talent-connect/shared-config'
import { envRediLocation } from '../../utils/env-redi-location'
import {
  Button,
  Heading,
  SVGImage,
} from '@talent-connect/shared-atomic-design-components'

const RediHero = () => {
  const history = useHistory()
  const { t } = useTranslation()

  return (
    <Section className="default-background">
      <Container>
        <Columns vCentered>
          <Columns.Column size={5}>
            <Heading>
              {t('loggedOutArea.homePage.hero.about.headline')}{' '}
              {rediLocationNames[envRediLocation()]}
            </Heading>
            <Columns.Column responsive={{ tablet: { hide: { value: true } } }}>
              <SVGImage image="hero" className="redi-hero__image" />
            </Columns.Column>
            <Element
              renderAs="p"
              textSize={4}
              responsive={{ mobile: { textSize: { value: 5 } } }}
              className="oneandhalf-bs"
            >
              <strong>{t('loggedOutArea.homePage.hero.about.content1')}</strong>
              <br />
              {t('loggedOutArea.homePage.hero.about.content2')}
            </Element>
            <Level>
              <Button
                size="large"
                // onClick={() => history.push('/front/signup-landing')}
                onClick={() => history.push('/app/cv-wizard')}
              >
                {/* {t('button.signUpNow')} */}
                Build my CV!
              </Button>

              {/* <Button onClick={() => history.push('/front/login')} simple>
                {t('button.login')}
              </Button> */}
            </Level>
          </Columns.Column>
          <Columns.Column
            offset={1}
            responsive={{ mobile: { hide: { value: true } } }}
          >
            <SVGImage image="hero" className="redi-hero__image" />
          </Columns.Column>
        </Columns>
      </Container>
    </Section>
  )
}
export default RediHero
