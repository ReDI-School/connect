import { useMediaQuery } from '@mui/material'
import { debounce } from 'lodash'
import React, { useEffect, useState } from 'react'
import './CardTags.scss'

export interface CardTagsProps {
  items: string[]
  shortList?: boolean
  formatter?: (item: string) => string
}

const SinglelineTags = ({ items }: { items: CardTagsProps['items'] }) => {
  const [visibleChips, setVisibleChips] = useState([])
  const [remainingChips, setRemainingChips] = useState([])
  const parentRefDesktop = React.useRef<HTMLDivElement>()

  useEffect(() => {
    const calculateChips = () => {
      const parentWidth = parentRefDesktop.current?.offsetWidth
      const gapSize = 16 // Adjust this based on the design (16px gap)
      const sidePadding = 12 // Adjust this based on the design (12px padding each side )
      const chipTotalMargin = 2 * sidePadding + gapSize

      const chipWidths = items.map((chip) => {
        const chipSpan = document.createElement('span')
        chipSpan.style.visibility = 'hidden'
        chipSpan.classList.add('card-tag')
        chipSpan.innerHTML = chip

        parentRefDesktop.current?.appendChild(chipSpan)

        const width = chipSpan.offsetWidth + chipTotalMargin

        parentRefDesktop.current?.removeChild(chipSpan)

        return width
      })

      let totalWidth = 0
      let visibleChipsCount = 0

      for (let i = 0; i < chipWidths.length; i++) {
        totalWidth += chipWidths[i]

        if (totalWidth <= parentWidth) {
          visibleChipsCount = i + 1
        } else {
          break
        }
      }

      setVisibleChips(items.slice(0, visibleChipsCount))
      setRemainingChips(items.slice(visibleChipsCount))
    }

    const throttledCalculateChips = debounce(calculateChips, 100)

    throttledCalculateChips()

    // Recalculate on window resize
    window.addEventListener('resize', throttledCalculateChips)

    return () => {
      window.removeEventListener('resize', throttledCalculateChips)
    }
  }, [items])
  return (
    <div className="wrapper__desktop" ref={parentRefDesktop}>
      {visibleChips.map((chip) => (
        <p key={chip} className="card-tag">
          {chip}
        </p>
      ))}
      {remainingChips.length > 0 && (
        <p className="card-tag">+{remainingChips.length}</p>
      )}
    </div>
  )
}

const MultilineTags = ({ items }: { items: CardTagsProps['items'] }) => {
  const additionalTagsCount = items.length - 3
  const shortItemsList = items.slice(0, 3)
  const hasAdditionalTags = additionalTagsCount > 0

  return (
    <div className="wrapper__profile">
      {shortItemsList.map((chip, i) => {
        const currentTag = (
          <p key={chip} className="card-tag">
            {chip}
          </p>
        )
        const isLastVisibleTag = i === 2

        return hasAdditionalTags && isLastVisibleTag ? (
          <div className="wrapper__profile last_row" key={chip}>
            {currentTag}
            <p key={`restNr-${i}`} className="card-tag plus">
              {'+' + additionalTagsCount}
            </p>
          </div>
        ) : (
          currentTag
        )
      })}
    </div>
  )
}

const CardTags = ({ items, shortList = false, formatter }: CardTagsProps) => {
  const isMobile = useMediaQuery('(max-width:768px)')
  const formattedItems = formatter ? items.map(formatter) : items

  return isMobile || shortList ? (
    <MultilineTags items={formattedItems} />
  ) : (
    <SinglelineTags items={formattedItems} />
  )
}
export default CardTags
