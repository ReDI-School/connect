import classnames from 'classnames'
import './Chip.scss'

export type ChipVariant = 'default' | 'pending' | 'neutral'
export interface ChipProps {
  chip: string
  variant?: ChipVariant
}

const Chip = ({ chip, variant = 'default' }: ChipProps) => {
  return <p className={classnames('chip', `chip--${variant}`)}>{chip}</p>
}

export default Chip
