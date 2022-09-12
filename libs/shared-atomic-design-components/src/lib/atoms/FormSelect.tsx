import { get } from 'lodash'
import { Form } from 'react-bulma-components'
import Select, { components } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { Icon } from '../atoms'

const DropdownIndicator = (props: any) => (
  <components.DropdownIndicator {...props}>
    <Icon icon="chevron" size="small" />
  </components.DropdownIndicator>
)

const ClearIndicator = (props: any) => (
  <components.ClearIndicator {...props}>
    <Icon icon="cancel" size="small" />
  </components.ClearIndicator>
)

const MultiValueRemove = (props: any) => (
  <components.MultiValueRemove {...props}>
    <Icon icon="cancel" size="small" />
  </components.MultiValueRemove>
)

// TODO add typed safe props
function FormSelect(props: any) {
  const {
    name,
    items,
    placeholder,
    label,
    customOnChange,
    values,
    setFieldTouched,
    handleBlur,
    multiselect,
    isSubmitting,
    setFieldValue,
    touched,
    errors,
    disabled,
    creatable = false,
    customOnCreate,
    isLoading,
  } = props

  const SelectComponent = creatable ? CreatableSelect : Select

  const customStyles = {
    option: (provided: any, state: any) => ({
      ...provided,
      padding: '13px',
      color: state.isFocused ? 'black' : '',
      backgroundColor: state.isFocused ? '#dadada' : '',
      '&:active': {
        color: 'black',
        backgroundColor: '#dadada',
      },
    }),
    clearIndicator: (provided: any) => ({
      ...provided,
      svg: {
        margin: '0 0.1rem',
      },
    }),
    dropdownIndicator: (provided: any, state: any) => ({
      ...provided,
      color: state.isFocused ? '#ea5b29' : '#a0a0a0',
      transform: state.menuIsOpen ? 'rotate(180deg)' : 'none',
      svg: {
        margin: '0 0.1rem',
      },
    }),
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: state.isFocused ? '#ea5b29' : '#a0a0a0',
      minHeight: '48px',
      boxShadow: 'inset 0 2px 6px rgba(178, 180, 181, 0.3)',
      '&:hover': {
        borderColor: state.isFocused ? '#ea5b29' : '#f6b9a2',
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      color: '#FFB298',
      borderRadius: '4px',
      backgroundColor: '#FFEAE2',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      fontSize: 'inherit',
      color: '#FF7D55',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      fontStyle: 'italic',
      color: '#a0a0a0',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      svg: {
        padding: '0 2px',
      },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  }

  const handleOnChangeDefault = (option: any = []) => {
    // option is null when clearing the select
    if (!option) {
      setFieldValue(name, '', true)
    } else {
      setFieldValue(
        name,
        multiselect
          ? option
            ? option.map((item: any) => item.value)
            : []
          : option.value,
        true
      )
    }
    setFieldTouched(name, true, false)
  }

  const handleOnCreateDefault = (inputValue: string) => {
    setFieldValue(name, inputValue, true)
    setFieldTouched(name, true, false)
  }

  const handleIsValidNewOption = (inputValue: string) => {
    return !items.find((item: any) => item.label === inputValue)
  }

  const handleOnBlur = (e: any) => {
    e.target.name = name
    handleBlur(e)
  }

  const hasError = !!get(touched, name) && !!get(errors, name)
  const handleOnChange = customOnChange || handleOnChangeDefault
  const handleOnCreate = customOnCreate || handleOnCreateDefault

  // If multiselect is true, we need to convert the values to an array of objects
  // with the value and label properties. Otherwise, we check if the value is already
  // in the items. If not (case of creatable select), we set the selecter value manually
  const selectedValues = multiselect
    ? get(values, name)
        ?.map((selValue: any) =>
          items.filter((availItem: any) => availItem.value === selValue)
        )
        .flat()
    : items.find((item: any) => item.value === get(values, name))
    ? items.find((item: any) => item.value === get(values, name))
    : get(values, name)
    ? { label: get(values, name) }
    : undefined

  return (
    <Form.Field>
      {label && <Form.Label size="small">{label}</Form.Label>}
      <Form.Control>
        <SelectComponent
          value={selectedValues}
          components={{ DropdownIndicator, ClearIndicator, MultiValueRemove }}
          options={items}
          onChange={handleOnChange}
          placeholder={placeholder}
          onBlur={handleOnBlur}
          isDisabled={isSubmitting || disabled}
          isMulti={multiselect}
          styles={customStyles}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          isLoading={isLoading}
          {...(creatable
            ? {
                isValidNewOption: handleIsValidNewOption,
                onCreateOption: handleOnCreate,
                isClearable: true,
              }
            : {})}
        />
      </Form.Control>
      <Form.Help color="danger" className={hasError ? 'help--show' : ''}>
        {hasError && <>{get(errors, name)}</>}
      </Form.Help>
    </Form.Field>
  )
}

export default FormSelect
