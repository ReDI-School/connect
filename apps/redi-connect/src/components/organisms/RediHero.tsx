import {
  Button,
  Heading,
  SVGImage,
} from '@talent-connect/shared-atomic-design-components'
import { REDI_LOCATION_NAMES } from '@talent-connect/shared-config'
import {
  Columns,
  Container,
  Content,
  Element,
  Section,
} from 'react-bulma-components'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { ReactComponent as Deloitte } from '../../assets/images/deloitte.svg'
import { envRediLocation } from '../../utils/env-redi-location'
import './RediHero.scss'

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
              {REDI_LOCATION_NAMES[envRediLocation()]}
            </Heading>
            <Deloitte className="oneandhalf-bs redi-hero__icon" />
            <Columns.Column responsive={{ tablet: { hide: { value: true } } }}>
              <SVGImage image="hero" className="redi-hero__image" />
            </Columns.Column>
            <Element
              renderAs="p"
              textSize={4}
              responsive={{ mobile: { textSize: { value: 5 } } }}
              className="oneandhalf-bs"
            >
              {t('loggedOutArea.homePage.hero.about.content1')}
              <br />
              {t('loggedOutArea.homePage.hero.about.content2')}
            </Element>
            <Content>
              <Button
                size="large"
                onClick={() => history.push('/front/signup-landing')}
              >
                {t('button.signUpNow')}
              </Button>
            </Content>
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
