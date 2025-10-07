import classnames from 'classnames'
import React from 'react'
import { ReactComponent as Account } from '../../assets/images/account.svg'
import { ReactComponent as ArrowLeft } from '../../assets/images/arrow-left.svg'
import { ReactComponent as ArrowRight } from '../../assets/images/arrow-right.svg'
import { ReactComponent as Arrow } from '../../assets/images/arrow-step.svg'
import { ReactComponent as BadgeCP } from '../../assets/images/badge-cp.svg'
import { ReactComponent as Calendar } from '../../assets/images/calendar.svg'
import { ReactComponent as Cancel } from '../../assets/images/cancel.svg'
import { ReactComponent as Career } from '../../assets/images/career.svg'
import { ReactComponent as Certificate } from '../../assets/images/certificate.svg'
import { ReactComponent as Chat } from '../../assets/images/chat.svg'
import { ReactComponent as Checkmark } from '../../assets/images/checkmark.svg'
import { ReactComponent as ChevronDown } from '../../assets/images/chevron-down.svg'
import { ReactComponent as ChevronLeft } from '../../assets/images/chevron-left.svg'
import { ReactComponent as ChevronRight } from '../../assets/images/chevron-right.svg'
import { ReactComponent as Clipboard } from '../../assets/images/clipboard.svg'
import { ReactComponent as Delete } from '../../assets/images/delete.svg'
import { ReactComponent as EditLightGrey } from '../../assets/images/edit-lightgrey.svg'
import { ReactComponent as Edit } from '../../assets/images/edit.svg'
import { ReactComponent as EllipsisHorizontal } from '../../assets/images/ellipsis-horizontal.svg'
import { ReactComponent as Ellipsis } from '../../assets/images/ellipsis.svg'
import { ReactComponent as Fb } from '../../assets/images/fb.svg'
import { ReactComponent as Hamburger } from '../../assets/images/hamburger.svg'
import { ReactComponent as Handshake } from '../../assets/images/handshake.svg'
import { ReactComponent as HeartFilled } from '../../assets/images/heart-filled.svg'
import { ReactComponent as Heart } from '../../assets/images/heart.svg'
import { ReactComponent as Instagram } from '../../assets/images/instagram.svg'
import { ReactComponent as Link } from '../../assets/images/link.svg'
import { ReactComponent as Linkedin } from '../../assets/images/linkedin.svg'
import { ReactComponent as Loader } from '../../assets/images/loader.svg'
import { ReactComponent as Location } from '../../assets/images/location.svg'
import { ReactComponent as Mail } from '../../assets/images/mail.svg'
import { ReactComponent as MapPin } from '../../assets/images/map-pin.svg'
import { ReactComponent as Meetup } from '../../assets/images/meetup.svg'
import { ReactComponent as Plus } from '../../assets/images/plus.svg'
import { ReactComponent as Refresh } from '../../assets/images/refresh.svg'
import { ReactComponent as Search } from '../../assets/images/search.svg'
import { ReactComponent as StepDisabled } from '../../assets/images/step-disabled.svg'
import { ReactComponent as StepDone } from '../../assets/images/step-done.svg'
import { ReactComponent as StepProgress } from '../../assets/images/step-progress.svg'
import { ReactComponent as TpPlus } from '../../assets/images/tp-plus.svg'
import { ReactComponent as Twitter } from '../../assets/images/twitter.svg'
import './Icon.scss'

const Icons = {
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  account: Account,
  careerPartnerBadge: BadgeCP,
  hamburger: Hamburger,
  check: Checkmark,
  edit: Edit,
  editLightGrey: EditLightGrey,
  ellipsis: Ellipsis,
  ellipsisHorizontal: EllipsisHorizontal,
  delete: Delete,
  refresh: Refresh,
  link: Link,
  cancel: Cancel,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  heart: Heart,
  heartFilled: HeartFilled,
  clipboard: Clipboard,
  calendar: Calendar,
  certificate: Certificate,
  search: Search,
  career: Career,
  arrow: Arrow,
  handshake: Handshake,
  chat: Chat,
  mail: Mail,
  plus: Plus,
  tpPlus: TpPlus,
  instagram: Instagram,
  meetup: Meetup,
  twitter: Twitter,
  fb: Fb,
  linkedin: Linkedin,
  loader: Loader,
  location: Location,
  mapPin: MapPin,
  stepDisabled: StepDisabled,
  stepProgress: StepProgress,
  stepDone: StepDone,
} as const

type IconKey = keyof typeof Icons

export interface IconProps {
  icon: IconKey
  size?: 'small' | 'medium' | 'large' | 'x-large'
  space?: 'left' | 'right'
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

const Icon = ({
  icon,
  space,
  size,
  className,
  onClick,
  style = {},
}: IconProps) => {
  const Icon = icon ? Icons[icon] : undefined

  const iconSize = size || 'medium'

  return Icon ? (
    <Icon
      className={classnames('icon', {
        [`icon--space-${space}`]: space,
        [`icon--${iconSize}`]: iconSize,
        'icon--active': onClick,
        [`${className}`]: className,
      })}
      onClick={onClick}
      style={style}
    />
  ) : null
}

export default Icon
