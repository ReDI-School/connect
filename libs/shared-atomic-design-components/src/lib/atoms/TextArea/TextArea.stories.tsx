import { Meta } from '@storybook/react/types-6-0'
import { storybookTemplate } from '../../helpers/StorybookTemplate'

import { TextArea } from '.'
import 'bulma/css/bulma.min.css'

export default {
  title: 'Atoms/TextArea',
  component: TextArea,
} as Meta

const template = storybookTemplate(TextArea)

export const Default = template({
  name: 'about',
  className: '',
  label: 'Enter something about you',
  placeholder: 'Enter something about you',
  minChar: 100,
  maxChar: 500,
  rows: 2,
  values: {
    about: '',
  },
  handleChange: () => { return },
  handleBlur: () => { return },
  disabled: false,
})
