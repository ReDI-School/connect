import { FC } from 'react'
import { connect } from 'react-redux'
import * as Yup from 'yup'
import { useFormik } from 'formik'

import { FormSelect } from '@talent-connect/shared-atomic-design-components'
import { Editable } from '@talent-connect/shared-atomic-design-components'
import { RedProfile } from '@talent-connect/shared-types'

import { profileSaveStart } from '../../redux/user/actions'
import { ReadRediClass } from '../molecules'
import { courses } from '../../config/config'
import { mapOptions } from '@talent-connect/typescript-utilities';
import { mapStateToProps } from '../../helpers';

const formCourses = mapOptions(courses)

export interface RediClassFormValues {
  mentee_currentlyEnrolledInCourse: string
}

const validationSchema = Yup.object({
  mentee_currentlyEnrolledInCourse: Yup.string()
    .required()
    .oneOf(courses.map(({ id }) => id))
    .label('Currently enrolled in course'),
})

interface Props {
  profile: RedProfile
  profileSaveStart: (arg: RediClassFormValues & { id: string }) => void
}

const EditableRediClass: FC<Props> = ({
  profile: { id, mentee_currentlyEnrolledInCourse },
  profileSaveStart
}) => {
  
  const formik = useFormik<RediClassFormValues>({
    initialValues: {
      mentee_currentlyEnrolledInCourse,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (rediClass: RediClassFormValues) => {
      profileSaveStart({ ...rediClass, id })
    },
  })

  return (
    <Editable
      title="Redi Class"
      onSave={() => formik.handleSubmit()}
      onClose={() => formik.resetForm()}
      savePossible={formik.dirty && formik.isValid}
      read={<ReadRediClass.Me />}
    >
      <FormSelect
        label="Which course are you taking at ReDI?"
        name="mentee_currentlyEnrolledInCourse"
        items={formCourses}
        {...formik}
      />
    </Editable>
  )
}

const mapDispatchToProps = (dispatch: Function) => ({
  profileSaveStart: (profile: Partial<RedProfile>) =>
    dispatch(profileSaveStart(profile)),
})

export default connect(mapStateToProps, mapDispatchToProps)(EditableRediClass)
