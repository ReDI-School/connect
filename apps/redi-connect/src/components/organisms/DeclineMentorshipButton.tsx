import { FC, useState } from 'react'
import { connect } from 'react-redux'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { Content } from 'react-bulma-components'
import {
  TextArea,
  Button,
  FormSelect,
  TextInput,
} from '@talent-connect/shared-atomic-design-components'
import { Modal } from '@talent-connect/shared-atomic-design-components'
import { matchesDeclineMentorshipStart } from '../../redux/matches/actions'
import { RedMatch } from '@talent-connect/shared-types'
import { MENTOR_DECLINES_MENTORSHIP_REASON_FOR_DECLINING } from '@talent-connect/shared-config'
import { mapOptionsObject, objectEntries } from '@talent-connect/typescript-utilities';

type DeclineMentorshipFormValues = {
  ifDeclinedByMentor_chosenReasonForDecline: string
  ifDeclinedByMentor_ifReasonIsOther_freeText: string
  ifDeclinedByMentor_optionalMessageToMentee: string
}

interface DeclineMentorshipButtonProps {
  match: RedMatch
  menteeName?: string
  matchesDeclineMentorshipStart: (options: DeclineMentorshipFormValues & { redMatchId: string }) => void
}


const validationSchema = Yup.object({
  ifDeclinedByMentor_chosenReasonForDecline: Yup.string()
    .required('Please pick an option'),
})

// TODO: This throws a TS error: { dispatch, matchId }: ConnectButtonProps
// What to replace with instead of below hack?
const DeclineMentorshipButton: FC<DeclineMentorshipButtonProps> = ({
  match: { id: redMatchId },
  matchesDeclineMentorshipStart,
}) => {
  const [isModalActive, setModalActive] = useState(false)

  const formik = useFormik<DeclineMentorshipFormValues>({
    initialValues: {
      ifDeclinedByMentor_chosenReasonForDecline: '',
      ifDeclinedByMentor_ifReasonIsOther_freeText: '',
      ifDeclinedByMentor_optionalMessageToMentee: '',
    },
    validationSchema,
    onSubmit: (values) => {
      try {
        matchesDeclineMentorshipStart({ redMatchId, ...values })
        setModalActive(false)
      } catch (error) {
        console.log('error ', error)
      }
    },
  })

  const isFormSubmittable = formik.dirty && formik.isValid

  return (
    <>
      <Button onClick={() => setModalActive(true)} simple>
        Decline
      </Button>
      <Modal
        show={isModalActive}
        stateFn={setModalActive}
        title="Decline Application"
      >
        <Modal.Body>
          <form>
            <Content>
              <p>
                Please let the mentee know why you cannot accept their
                mentorship application at this time:
              </p>
            </Content>
            <FormSelect
              name="ifDeclinedByMentor_chosenReasonForDecline"
              label=""
              items={formDeclineOptions}
              {...formik}
            />
            {formik.values.ifDeclinedByMentor_chosenReasonForDecline ===
            'other' ? (
              <TextInput
                name="ifDeclinedByMentor_ifReasonIsOther_freeText"
                label="You chose other. Please specify:"
                {...formik}
              />
            ) : null}
            <TextArea
              name="ifDeclinedByMentor_optionalMessageToMentee"
              rows={4}
              label="Would you like to send the mentee a short message with your cancellation?"
              placeholder={`Hi there, thanks for sending me a mentorship application. Unfortunately I am declining since ...`}
              {...formik}
            />
          </form>
        </Modal.Body>

        <Modal.Foot>
          <Button
            disabled={!isFormSubmittable}
            onClick={() => formik.handleSubmit()}
          >
            Decline mentorship
          </Button>
        </Modal.Foot>
      </Modal>
    </>
  )
}

const formDeclineOptions = mapOptionsObject(MENTOR_DECLINES_MENTORSHIP_REASON_FOR_DECLINING)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatchToProps = (dispatch: Function) => ({
  matchesDeclineMentorshipStart: (options: DeclineMentorshipFormValues & { redMatchId: string; }) =>
    dispatch(matchesDeclineMentorshipStart(options)),
})

export default connect(null, mapDispatchToProps)(DeclineMentorshipButton)
