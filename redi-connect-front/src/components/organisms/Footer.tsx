import React from 'react'
import { Columns, Container, Section } from 'react-bulma-components'
import Icons from '../atoms/MediaIcons'
import './Footer.scss'

const RediFooter = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <Section>
        <Container>
          <Columns>
            <Columns.Column className="is-hidden-mobile">
              <p>
                <a href="https://www.redi-school.org/">ReDI School Website</a>
              </p>
              <p>&copy; {year} By ReDI School</p>
            </Columns.Column>
            <Columns.Column className="is-hidden-tablet footer--headline">
              <p className="is-size-5">Follow us</p>
              <Icons />
            </Columns.Column>
            <Columns.Column className="footer--links">
              <p>
                <a
                  href="https://www.redi-school.org/imprint"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact
                </a>
              </p>
              <p>
                <a href="/" target="_blank" rel="noopener noreferrer">
                  FAQ
                </a>
              </p>
              <p>
                <a
                  href="https://www.redi-school.org/berlin-transparency/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Transparency
                </a>
              </p>
              <p>
                <a href="/">Cookie policy</a>
              </p>
              <p>
                <a
                  href="https://www.redi-school.org/data-privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Data privacy policy
                </a>
              </p>
            </Columns.Column>
            <Columns.Column className="is-hidden-mobile is-narrow footer--headline">
              <p>Follow us</p>
              <Icons />
            </Columns.Column>
            <Columns.Column
              mobile={{
                size: 'four-fifths'
              }}
              className="is-hidden-tablet"
            >
              <span>
                <a href="https://www.redi-school.org/">ReDI School Website</a>
              </span>
              <span className="is-pulled-right">
                &copy; {year} By ReDI School
              </span>
            </Columns.Column>
          </Columns>
        </Container>
      </Section>
    </footer>
  )
}

export default RediFooter
