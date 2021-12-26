import { FunctionComponent } from 'react';
import classnames from 'classnames'
import { Form } from 'react-bulma-components'
import { get } from 'lodash'
import { FormInputProps } from './FormInput.props';


const FormInput: FunctionComponent<FormInputProps> = ({
  name,
  placeholder,
  type = 'text',
  label,
  dirty,
  values,
  handleChange,
  isSubmitting,
  handleBlur,
  touched,
  errors,
  disabled,
  domRef,
  startAddon = null,
}) => {

  const hasError = !!get(touched, name) && !!get(errors, name)
  const isValidField = dirty && !!get(touched, name) && !get(errors, name)

  return (
    <Form.Field>
      {label && <Form.Label size="small">{label}</Form.Label>}
      {startAddon}
      <Form.Control className={classnames({ 'field-clean': isValidField })}>
        <Form.Input
          id={name}
          name={name}
          type={type}
          color={hasError ? 'danger' : null}
          placeholder={placeholder}
          // use lodash's so we can access stuff like experience[0].title
          value={get(values, name)}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting || disabled}
          domRef={domRef}
        />
      </Form.Control>

      <Form.Help
        color="danger"
        className={classnames({ 'help--show': hasError })}
      >
        {hasError && <>{get(errors, name)}</>}
      </Form.Help>
    </Form.Field>
  )
}

export default FormInput