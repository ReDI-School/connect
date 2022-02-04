import { FC } from 'react'
import classnames from 'classnames'

import './Icon.scss'
import { IconProps, ICONS } from './Icon.props';

const Icon: FC<IconProps> = ({
  icon,
  space,
  size,
  className,
  onClick,
  style = {},
}) => {
  const Icon = icon ? ICONS[icon] : null

  const iconSize = size || 'medium'

  return Icon && (
    <Icon
      {...{ onClick, style }}
      className={classnames('icon', {
        [`icon--space-${space}`]: space,
        [`icon--${iconSize}`]: iconSize,
        'icon--active': onClick,
        [`${className}`]: className,
      })}
    />
  )
}

export default Icon
