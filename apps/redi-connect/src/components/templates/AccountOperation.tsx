import Footer from '../organisms/Footer'
import { RediConnectLogo } from '@talent-connect/shared-atomic-design-components'

import { Container, Section } from 'react-bulma-components'

function AccountOperation ({ children }) {
  return (
    <>
      <Section className="navbar color-half-desktop">
        <Container className="navbar__wrapper">
          <RediConnectLogo />
        </Container>
      </Section>
      <Section className="color-half-desktop section--bottom-large-spacing">
        <Container>{children}</Container>
      </Section>
      <Footer />
    </>
  );
}

export default AccountOperation
