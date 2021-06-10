import classnames from 'clsx'
import React, { useState } from 'react'
import { Columns, Element } from 'react-bulma-components'
import { Icon } from '../atoms'
import './FormDraggableAccordion.scss'

import { ReactComponent as AccordionHandleIcon } from '../../assets/images/accordion-handle.svg'

interface Props {
  title: string
  children: React.ReactNode
  initialOpen?: boolean
  onRemove?: () => void
}

function FormDraggableAccordion({
  title,
  children,
  onRemove = null,
  initialOpen = false,
}: Props) {
  const [showAnswer, setShowAnswer] = useState(initialOpen)
  return (
    <div className="form-draggable-accordion">
      <Columns
        breakpoint="mobile"
        className="form-draggable-accordion__title"
        onClick={() => setShowAnswer(!showAnswer)}
      >
        <Columns.Column>
          <Element style={{ display: 'flex' }}>
            <AccordionHandleIcon style={{ marginRight: '.8rem' }} /> {title}
          </Element>
        </Columns.Column>
        <Columns.Column narrow>
          <Icon
            icon="chevron"
            size="small"
            className={classnames({ 'icon--rotate': showAnswer })}
          />
        </Columns.Column>
        <Columns.Column narrow>
          <Icon icon="cancel" size="small" onClick={onRemove} />
        </Columns.Column>
      </Columns>
      <Element
        className={classnames('form-draggable-accordion__answer', {
          'form-draggable-accordion__answer--show': showAnswer,
        })}
      >
        {children}
      </Element>
    </div>
  )
}

export default FormDraggableAccordion
