import {
  Button,
  FormTextArea,
  Modal,
} from '@talent-connect/shared-atomic-design-components'
import { useFormik } from 'formik'
import { useState } from 'react'
import { Content, Notification } from 'react-bulma-components'
import { useQueryClient } from 'react-query'
import { useHistory } from 'react-router-dom'
import * as Yup from 'yup'
import {
  ConfirmMentorshipMatchPropFragment,
  useAcceptMentorshipMutation,
} from './ConfirmMentorship.generated'

interface ConfirmMentorshipProps {
  match: ConfirmMentorshipMatchPropFragment
  menteeName?: string
  hasReachedDesiredMenteeLimit?: boolean
  menteeCountCapacity?: number
}

interface ConfirmMentorshipFormValues {
  mentorReplyMessageOnAccept: string
}

const initialValues = {
  mentorReplyMessageOnAccept: '',
}

const MIN_CHARS_COUNT = 250
const MAX_CHARS_COUNT = 600
const MAX_MENTEE_LIMIT = 2

const validationSchema = Yup.object({
  mentorReplyMessageOnAccept: Yup.string()
    .required()
    .min(MIN_CHARS_COUNT)
    .max(MAX_CHARS_COUNT),
})

const ConfirmMentorship = ({
  match,
  hasReachedDesiredMenteeLimit,
  menteeCountCapacity,
}: ConfirmMentorshipProps) => {
  const queryClient = useQueryClient()
  const acceptMentorshipMutation = useAcceptMentorshipMutation()
  const [isModalActive, setModalActive] = useState(false)
  const history = useHistory()
  const { mentee = { firstName: null } } = match

  const submitForm = async (values: ConfirmMentorshipFormValues) => {
    try {
      await acceptMentorshipMutation.mutateAsync({
        input: {
          mentorReplyMessageOnAccept: values.mentorReplyMessageOnAccept,
          mentorshipMatchId: match.id,
        },
      })
      setModalActive(false)
      history.push(`/app/mentorships/${match.id}`)
      queryClient.invalidateQueries()
    } catch (error) {
      console.log('error ', error)
      // Very crude
      alert('An error occurred. The page will now reload.')
      window.location.reload()
    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: submitForm,
  })

  const isFormSubmittable = formik.dirty && formik.isValid

  return (
    <>
      {hasReachedDesiredMenteeLimit ? (
        <>
          {menteeCountCapacity === MAX_MENTEE_LIMIT ? (
            <Notification color="info" className="is-light">
              You've reached our recommended maximum number of mentees. If you
              wish to mentor more than 2 mentees at the same time, please reach
              out to us at{' '}
              <a href="mailto:career@redi-school.org">career@redi-school.org</a>
              . Otherwise, please decline the application.
            </Notification>
          ) : (
            <Notification color="info" className="is-light">
              You've reached your desired number of mentees. If you wish to
              accept another mentee, please go to the{' '}
              <a onClick={() => history.push('/app/me')}>My Profile</a> page and
              increase the mentee count value. Otherwise, please decline the
              application.
            </Notification>
          )}
          <Button disabled={hasReachedDesiredMenteeLimit}>Accept</Button>
        </>
      ) : (
        <Button onClick={() => setModalActive(true)}>Accept</Button>
      )}

      <Modal
        show={isModalActive}
        stateFn={setModalActive}
        title="Accept Application"
      >
        <Modal.Body>
          <form>
            <Content>
              <p>
                Please write a few welcoming words to your future mentee and
                give some information on your first meeting (250-600
                characters).
              </p>
            </Content>
            <FormTextArea
              name="mentorReplyMessageOnAccept"
              rows={4}
              placeholder={`Dear ${mentee.firstName}...`}
              minChar={MIN_CHARS_COUNT}
              maxLength={MAX_CHARS_COUNT}
              formik={formik}
            />
          </form>
        </Modal.Body>

        <Modal.Foot>
          <Button
            disabled={!isFormSubmittable}
            onClick={() => formik.handleSubmit()}
          >
            Accept mentorship request
          </Button>
        </Modal.Foot>
      </Modal>
    </>
  )
}

export default ConfirmMentorship
