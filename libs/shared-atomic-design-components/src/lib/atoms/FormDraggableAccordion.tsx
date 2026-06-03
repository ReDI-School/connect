import classnames from 'clsx'
import React, { useEffect, useState } from 'react'
import { Columns, Element } from 'react-bulma-components'
import { Subject } from 'rxjs'
import { Icon } from '../atoms'
import './FormDraggableAccordion.scss'

import { ReactComponent as AccordionHandleIcon } from '../../assets/images/accordion-handle.svg'

interface Props {
  title: string
  children: React.ReactNode
  initialOpen?: boolean
  onRemove?: () => void
  closeAccordionSignalSubject?: Subject<void>
  entryCategory?: string
  showDragHandle?: boolean
}

function FormDraggableAccordion({
  title,
  children,
  onRemove = null,
  initialOpen = false,
  closeAccordionSignalSubject = null,
  entryCategory,
  showDragHandle = true,
}: Props) {
  const [showAnswer, setShowAnswer] = useState(initialOpen)

  useEffect(() => {
    const sub = closeAccordionSignalSubject?.subscribe(() =>
      setShowAnswer(false)
    )

    return () => sub?.unsubscribe()
  }, [closeAccordionSignalSubject])

  return (
    <div className="form-draggable-accordion">
      <Columns breakpoint="mobile" className="form-draggable-accordion__title">
        <Columns.Column onClick={() => setShowAnswer(!showAnswer)}>
          <Element style={{ display: 'flex' }}>
            {showDragHandle ? (
              <AccordionHandleIcon style={{ marginRight: '.8rem' }} />
            ) : null}{' '}
            {title}
          </Element>
        </Columns.Column>
        <Columns.Column onClick={() => setShowAnswer(!showAnswer)} narrow>
          <Icon
            icon="chevronDown"
            size="small"
            className={classnames({ 'icon--rotate': showAnswer })}
          />
        </Columns.Column>
        <Columns.Column narrow>
          {onRemove ? (
            <Icon icon="cancel" size="small" onClick={onRemove} />
          ) : null}
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
