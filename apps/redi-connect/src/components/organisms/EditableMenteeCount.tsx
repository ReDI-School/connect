import {
  useLoadMyProfileQuery,
  usePatchMyProfileMutation,
} from '@talent-connect/data-access'
import {
  Editable,
  FormSelect,
} from '@talent-connect/shared-atomic-design-components'
import { MENTEE_COUNT_CAPACITY_OPTIONS } from '@talent-connect/shared-config'
import { FormikValues, useFormik } from 'formik'
import { useQueryClient } from 'react-query'
import * as Yup from 'yup'
import { getAccessTokenFromLocalStorage } from '../../services/auth/auth'
import { ReadMenteeCount } from '../molecules'

const menteeCountExplanation = (amount: number) => {
  switch (amount) {
    case 0:
      return '(Select this option if you need a break from mentoring)'
    case 1:
      return 'mentee'
    default:
      return 'mentees'
  }
}

const formMenteeCountCapacityOptions = MENTEE_COUNT_CAPACITY_OPTIONS.map(
  (option) => ({
    value: option,
    label: `${option} ${menteeCountExplanation(option)}`,
  })
)

export interface AboutFormValues {
  menteeCountCapacity: number
  // optOutOfMenteesFromOtherRediLocation: boolean
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
// props: FormikProps<AboutFormValues>
function EditableMenteeCount() {
  const loopbackUserId = getAccessTokenFromLocalStorage().userId
  const queryClient = useQueryClient()
  const myProfileQuery = useLoadMyProfileQuery({ loopbackUserId })
  const patchMyProfileMutation = usePatchMyProfileMutation()

  const profile = myProfileQuery.data?.conProfile

  const menteeCountCapacity = profile?.menteeCountCapacity
  // const optOutOfMenteesFromOtherRediLocation =
  //   profile?.optOutOfMenteesFromOtherRediLocation
  // const rediLocation = profile?.rediLocation

  const submitForm = async (values: FormikValues) => {
    const mutationResult = await patchMyProfileMutation.mutateAsync({
      input: values,
    })
    queryClient.setQueryData(useLoadMyProfileQuery.getKey({ loopbackUserId }), {
      conProfile: mutationResult.patchConProfile,
    })
  }

  const initialValues: AboutFormValues = {
    menteeCountCapacity,
    // optOutOfMenteesFromOtherRediLocation,
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: submitForm,
  })

  if (!myProfileQuery.isSuccess) return null

  return (
    <Editable
      title="Mentee Count"
      onSave={() => formik.handleSubmit()}
      onClose={() => formik.resetForm()}
      savePossible={formik.dirty && formik.isValid}
      read={<ReadMenteeCount.Me />}
    >
      <FormSelect
        label="How many mentees would you be willing to mentor this semester?*"
        name="menteeCountCapacity"
        placeholder="Mentee count"
        items={formMenteeCountCapacityOptions}
        formik={formik}
      />
      {/* We decided to temporary hide this as the majority of students are taking classes online
     <Checkbox.Form
        name="optOutOfMenteesFromOtherRediLocation"
        checked={formik.values.optOutOfMenteesFromOtherRediLocation}
        {...formik}
      >
        Only let mentees from my own city/location apply for mentorship (i.e.
        people in {REDI_LOCATION_NAMES[rediLocation]})
      </Checkbox.Form> */}
    </Editable>
  )
}

export default EditableMenteeCount
