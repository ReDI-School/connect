import React, { useState } from 'react'
import { Navbar, Container } from 'react-bulma-components'
import Button from '../atoms/Button'
import Logo from '../atoms/Logo'

const LoggedOutNavbar = () => {
  const [active, setActive] = useState(false)

  return (
    <Navbar active={active}>
      <Container>
        <Navbar.Brand>
          <Navbar.Item>
            <Logo />
          </Navbar.Item>
          <Navbar.Burger
            className="center"
            active={active}
            onClick={() => setActive(!active)}
          />
        </Navbar.Brand>
        <Navbar.Menu>
          <Navbar.Container position="end">
            <Navbar.Item>
              <Button size="small" text="log-in" type="simple" />
            </Navbar.Item>
            <Navbar.Item>
              <Button size="small" text="Sign-up" />
            </Navbar.Item>
          </Navbar.Container>
        </Navbar.Menu>
      </Container>
    </Navbar>
  )
}

export default LoggedOutNavbar
