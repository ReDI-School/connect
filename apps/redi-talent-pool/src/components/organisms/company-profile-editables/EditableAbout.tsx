import {
  useMyTpDataQuery,
  usePatchTpCompanyProfileMutation,
} from '@talent-connect/data-access'
import {
  Button,
  Caption,
  FormTextArea,
} from '@talent-connect/shared-atomic-design-components'
import { useFormik } from 'formik'
import { useEffect, useMemo, useState } from 'react'
import { Content, Element } from 'react-bulma-components'
import ReactMarkdown from 'react-markdown'
import { useQueryClient } from 'react-query'
import { Editable } from '../../molecules/Editable'
import { EmptySectionPlaceholder } from '../../molecules/EmptySectionPlaceholder'
import { EditableAboutProfilePropFragment } from './EditableAbout.generated'

interface Props {
  companyProfile: EditableAboutProfilePropFragment
  disableEditing?: boolean
}
export function EditableAbout({ companyProfile, disableEditing }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  const isEmpty = EditableAbout.isSectionEmpty(companyProfile)

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
                {companyProfile?.about?.replace(/\n/g, `\n\n`)}
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

EditableAbout.isSectionFilled = (
  profile: Partial<EditableAboutProfilePropFragment>
) => !!profile?.about
EditableAbout.isSectionEmpty = (
  profile: Partial<EditableAboutProfilePropFragment>
) => !EditableAbout.isSectionFilled(profile)

function ModalForm({
  setIsEditing,
  setIsFormDirty,
}: {
  setIsEditing: (boolean) => void
  setIsFormDirty: (boolean) => void
}) {
  const queryClient = useQueryClient()
  const myData = useMyTpDataQuery()
  const { representedCompany: companyProfile } =
    myData?.data?.tpCurrentUserDataGet

  const mutation = usePatchTpCompanyProfileMutation()
  const initialValues: Partial<EditableAboutProfilePropFragment> = useMemo(
    () => ({
      about: companyProfile?.about ?? '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const onSubmit = async (
    values: Partial<EditableAboutProfilePropFragment>
  ) => {
    formik.setSubmitting(true)
    await mutation.mutateAsync({ input: { id: companyProfile.id, ...values } })
    formik.setSubmitting(false)
    setIsEditing(false)
    queryClient.invalidateQueries()
  }
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit,
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
      <FormTextArea label="About you" name="about" rows={7} formik={formik} />

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
