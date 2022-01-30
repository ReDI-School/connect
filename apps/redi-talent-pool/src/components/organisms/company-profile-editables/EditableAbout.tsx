import { FC, useEffect, useMemo, useState } from 'react'
import { useFormik } from 'formik'
import ReactMarkdown from 'react-markdown'
import {
  Button,
  Caption,
  TextArea,
} from '@talent-connect/shared-atomic-design-components'
import { TpCompanyProfile } from '@talent-connect/shared-types'
import { Content, Element } from 'react-bulma-components'
import { useTpCompanyProfileUpdateMutation } from '../../../react-query/use-tpcompanyprofile-mutation'
import { useTpCompanyProfileQuery } from '../../../react-query/use-tpcompanyprofile-query'
import { Editable } from '../../molecules/Editable'
import { EmptySectionPlaceholder } from '../../molecules/EmptySectionPlaceholder'

interface Props {
  profile: Partial<TpCompanyProfile>
  disableEditing?: boolean
}
export const EditableAbout: FC<Props> = ({ profile, disableEditing }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  const isEmpty = EditableAbout.isSectionEmpty(profile)

  return (
    <Editable
      disableEditing={disableEditing}
      isEditing={isEditing}
      isFormDirty={isFormDirty}
      setIsEditing={setIsEditing}
      title="About"
      readComponent={
        <>
          <Caption>Summary</Caption>
          <Content>
            {!isEmpty ? (
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p style={{ marginBottom: '0' }}>{children}</p>
                  ),
                }}
              >
                {profile.about?.replace(/\n/g, `\n\n`)}
              </ReactMarkdown>
            ) : (
              <EmptySectionPlaceholder
                height="tall"
                onClick={() => setIsEditing(true)}
              >
                Tell us about the company
              </EmptySectionPlaceholder>
            )}
          </Content>
        </>
      }
      modalTitle="About"
      modalHeadline="Summary"
      modalBody={
        <ModalForm
          setIsEditing={setIsEditing}
          setIsFormDirty={setIsFormDirty}
        />
      }
    />
  )
}

EditableAbout.isSectionFilled = (profile: Partial<TpCompanyProfile>) =>
  !!profile?.about
EditableAbout.isSectionEmpty = (profile: Partial<TpCompanyProfile>) =>
  !EditableAbout.isSectionFilled(profile)

interface ModalFormProps {
  setIsEditing: (boolean: boolean) => void
  setIsFormDirty: (boolean: boolean) => void
}

const ModalForm: FC<ModalFormProps> = ({
  setIsEditing,
  setIsFormDirty,
}) => {
  const { data: profile } = useTpCompanyProfileQuery()
  const mutation = useTpCompanyProfileUpdateMutation()
  const initialValues = useMemo(() => ({
      about: profile?.about || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const formik = useFormik<{ about: string }>({
    initialValues,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) => {
      setSubmitting(true)
      mutation.mutate(values, {
        onSettled: () => setSubmitting(false),
        onSuccess: () => setIsEditing(false),
      })
    },
  })

  useEffect(() => setIsFormDirty(formik.dirty), [formik.dirty, setIsFormDirty])

  return (
    <>
      <Element
        renderAs="p"
        textSize={4}
        responsive={{ mobile: { textSize: { value: 5 } } }}
        className="oneandhalf-bs"
      >
        Tell us a bit about your company — what are your values, what makes you
        stand out, what are you passionate about and what are your future
        aspirations.
      </Element>
      <TextArea
        label="About you"
        name="about"
        rows={7}
        {...formik}
      />

      <Button
        disabled={!formik.isValid || mutation.isLoading}
        onClick={formik.submitForm}
      >
        Save
      </Button>
      <Button
        simple
        disabled={mutation.isLoading}
        onClick={() => setIsEditing(false)}
      >
        Cancel
      </Button>
    </>
  )
}
