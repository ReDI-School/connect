export const formSelectStyles = {
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
      '& path': {
        fill: 'black',
      },
    },
  }),
  dropdownIndicator: (provided: any, state: any) => ({
    ...provided,
    transition: 'ease-in-out all 0.2s',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'none',
    svg: {
      margin: '0 0.1rem',
      '& path': {
        fill: 'black',
      },
    },
  }),
  control: (provided: any, state: any) => ({
    ...provided,
    borderColor: state.isFocused ? 'black' : '#A0A0A0',
    minHeight: '48px',
    boxShadow: 'inset 0 2px 6px rgba(178, 180, 181, 0.3)',
    '&:hover': {
      borderColor: 'black',
    },
  }),
  multiValue: (provided: any) => ({
    ...provided,
    color: 'black',
    fontSize: '14px',
    borderRadius: '8px',
    backgroundColor: '#daf0f4',
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    fontSize: 'inherit',
    color: 'black',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    fontStyle: 'italic',
    color: '#a0a0a0',
  }),
  multiValueRemove: (provided: any) => ({
    ...provided,
    '&:hover': {
      backgroundColor: '#84c5d2',
    },
    svg: {
      padding: '0 2px',
      '& path': {
        fill: 'black',
      },
    },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
}
