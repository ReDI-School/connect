import { connect } from 'react-redux'
import * as Yup from 'yup'
import { useFormik } from 'formik'

import {
  Checkbox,
  FormSelect,
} from '@talent-connect/shared-atomic-design-components'
import { Editable } from '@talent-connect/shared-atomic-design-components'
import { RedProfile } from '@talent-connect/shared-types'
import { profileSaveStart } from '../../redux/user/actions'


import {
  MENTEE_COUNT_CAPACITY_OPTIONS,
  REDI_LOCATION_NAMES,
} from '@talent-connect/shared-config'
import { RediLocation } from '@talent-connect/shared-types'
import { ReadMenteeCount } from '../molecules'
import { mapStateToProps } from '../../helpers';

const menteeCountExplanation = (amount: number) => {
  switch (amount) {
    case 0: return '(Select this option if you need a break from mentoring)'
    case 1: return 'mentee'
    default: return 'mentees'
  }
}

const formMenteeCountCapacityOptions = MENTEE_COUNT_CAPACITY_OPTIONS
  .map((option) => ({
    value: option,
    label: `${option} ${menteeCountExplanation(option)}`,
  }))

export interface AboutFormValues {
  menteeCountCapacity: number
  optOutOfMenteesFromOtherRediLocation: boolean
}

const validationSchema = Yup.object({
  menteeCountCapacity: Yup.number().when('userType', {
    is: 'mentor',
    then: Yup.number()
      .required('Please specify the number of mentees you can take on')
      .min(0)
      .max(2),
  }),
})

interface Props {
  profile: RedProfile
  profileSaveStart: (arg: AboutFormValues & { id: string; }) => void
}

function EditableMenteeCount ({
  profile: { id, menteeCountCapacity, optOutOfMenteesFromOtherRediLocation, rediLocation },
  profileSaveStart
}: Props) {

  const formik = useFormik<AboutFormValues>({
    initialValues: {
      menteeCountCapacity,
      optOutOfMenteesFromOtherRediLocation,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (profileMenteeCount) => {
      profileSaveStart({ ...profileMenteeCount, id })
    },
  })

  return (
    <Editable
      title="Mentee Count and Location"
      onSave={() => formik.handleSubmit()}
      onClose={() => formik.resetForm()}
      savePossible={formik.dirty && formik.isValid}
      read={<ReadMenteeCount.Me />}
    >
      <FormSelect
        label="How many mentees would you be willing to mentor this semester?"
        name="menteeCountCapacity"
        placeholder="Mentee count"
        items={formMenteeCountCapacityOptions}
        {...formik}
      />
      <Checkbox.Form
        name="optOutOfMenteesFromOtherRediLocation"
        checked={formik.values.optOutOfMenteesFromOtherRediLocation}
        {...formik}
      >
        Only let mentees from my own city/location apply for mentorship (i.e.
        people in {REDI_LOCATION_NAMES[rediLocation as RediLocation]})
      </Checkbox.Form>
    </Editable>
  )
}

const mapDispatchToProps = (dispatch: Function) => ({
  profileSaveStart: (profile: Partial<RedProfile>) =>
    dispatch(profileSaveStart(profile)),
})

export default connect(mapStateToProps, mapDispatchToProps)(EditableMenteeCount)
