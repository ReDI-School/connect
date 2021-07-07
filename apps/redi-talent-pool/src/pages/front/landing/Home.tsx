import React from 'react'
import { useTranslation } from 'react-i18next'
import Hero from '../../../components/organisms/RediHero'
import Landing from '../../../components/templates/Landing'

import { useConfetti } from '../../../utils/useConfetti'

export default function Home() {
  const { t } = useTranslation()

  useConfetti({ keybind: 'r u r e d i' })

  return (
    <Landing>
      <Hero />
    </Landing>
  )
}
