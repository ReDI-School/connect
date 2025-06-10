import {
  useLoadMyProfileQuery,
  usePatchMyProfileMutation,
  UserType,
} from '@talent-connect/data-access'
import {
  Editable,
  FormTextArea,
} from '@talent-connect/shared-atomic-design-components'
import { FormikValues, useFormik } from 'formik'
import { useQueryClient } from 'react-query'
import * as Yup from 'yup'
import { getAccessTokenFromLocalStorage } from '../../services/auth/auth'
import { ReadAbout } from '../molecules'

export interface AboutFormValues {
  personalDescription: string
  expectations: string
}

const MIN_CHARS_COUNT = 100
const MAX_CHARS_COUNT = 600

const validationSchema = Yup.object({
  personalDescription: Yup.string()
    .required()
    .min(MIN_CHARS_COUNT)
    .max(MAX_CHARS_COUNT)
    .label('Personal description'),
})
// props: FormikProps<AboutFormValues>
function EditableAbout() {
  const loopbackUserId = getAccessTokenFromLocalStorage().userId
  const queryClient = useQueryClient()
  const myProfileQuery = useLoadMyProfileQuery({ loopbackUserId })
  const patchMyProfileMutation = usePatchMyProfileMutation()

  const profile = myProfileQuery.data?.conProfile

  const userType = profile?.userType
  const personalDescription = profile?.personalDescription
  const expectations = profile?.expectations

  const submitForm = async (values: FormikValues) => {
    const mutationResult = await patchMyProfileMutation.mutateAsync({
      input: values,
    })
    queryClient.setQueryData(useLoadMyProfileQuery.getKey({ loopbackUserId }), {
      conProfile: mutationResult.patchConProfile,
    })
  }

  const initialValues: AboutFormValues = {
    personalDescription,
    expectations,
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
      title="About You"
      onSave={() => formik.handleSubmit()}
      onClose={() => formik.resetForm()}
      savePossible={formik.dirty && formik.isValid}
      read={<ReadAbout.Me />}
    >
      <FormTextArea
        label="Tell us a few words about yourself (this will be displayed on your profile)* (100-600 characters)"
        name="personalDescription"
        rows={4}
        placeholder="About you"
        minChar={MIN_CHARS_COUNT}
        maxLength={MAX_CHARS_COUNT}
        formik={formik}
      />
      <FormTextArea
        label={expectationsFieldLabel(userType)}
        name="expectations"
        rows={4}
        placeholder={expectationsFieldPlaceholder(userType)}
        maxLength={MAX_CHARS_COUNT}
        formik={formik}
      />
    </Editable>
  )
}

const expectationsFieldLabel = (userType: UserType): string => {
  switch (userType) {
    case 'MENTEE':
      return 'What do you expect from a mentorship and which short- to medium-term goals would you like to achieve in about 5-6 mentoring sessions? (max 600 characters)'

    case 'MENTOR':
      return 'Feel free to share how you can best support your mentees and any expectations you may have towards them (max 600 characters)'

    default:
      return null
  }
}

const expectationsFieldPlaceholder = (userType: UserType): string => {
  switch (userType) {
    case 'MENTEE':
      return 'Support with finding a job, get better with my tech skills, build a portfolio, etc.'

    case 'MENTOR':
      return 'Providing career or technical support, expecting commitment, etc.'

    default:
      return null
  }
}

export default EditableAbout
