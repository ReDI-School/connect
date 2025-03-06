import {
  useMyTpDataQuery,
  usePatchTpCompanyProfileMutation,
  usePatchUserContactMutation
} from '@talent-connect/data-access'
import {
  Button,
  Caption,
  FormInput
} from '@talent-connect/shared-atomic-design-components'
import { toPascalCaseAndTrim } from '@talent-connect/shared-utils'
import { useFormik } from 'formik'
import { useEffect, useMemo, useState } from 'react'
import { Content, Element } from 'react-bulma-components'
import { useQueryClient } from 'react-query'
import * as Yup from 'yup'
import { useIsBusy } from '../../../hooks/useIsBusy'
import { Editable } from '../../molecules/Editable'
import { EmptySectionPlaceholder } from '../../molecules/EmptySectionPlaceholder'
import {
  EditableContactCompanyProfilePropFragment,
  EditableContactUserContactPropFragment
} from './EditableContact.generated'

interface Props {
  companyProfile: EditableContactCompanyProfilePropFragment
  userContact: EditableContactUserContactPropFragment
  disableEditing?: boolean
}

export function EditableContact({
  companyProfile,
  userContact,
  disableEditing,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  const isEmpty = EditableContact.isSectionEmpty(companyProfile, userContact)

  if (disableEditing && isEmpty) return null

  return (
    <Editable
      disableEditing={disableEditing}
      isEditing={isEditing}
      isFormDirty={isFormDirty}
      setIsEditing={setIsEditing}
      title="Contact"
      readComponent={
        isEmpty ? (
          <EmptySectionPlaceholder
            height="tall"
            onClick={() => setIsEditing(true)}
          >
            Add your contact details
          </EmptySectionPlaceholder>
        ) : (
          <div
            style={{
              display: 'grid',
              width: '100%',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gridColumnGap: '32px',
              gridRowGap: '32px',
            }}
          >
            {userContact?.firstName || userContact?.lastName ? (
              <div>
                <Caption>Name</Caption>
                <Content>
                  <p>
                    {userContact?.firstName} {userContact?.lastName}
                  </p>
                </Content>
              </div>
            ) : null}
            {!userContact.telephoneNumber && companyProfile.telephoneNumber ? (
              <div>
                <Caption>Company Phone</Caption>
                <Content>
                  <p>{companyProfile?.telephoneNumber}</p>
                </Content>
              </div>
            ) : null}
            {userContact.email ? (
              <div>
                <Caption>E-mail</Caption>
                <Content>
                  <p>{userContact.email}</p>
                </Content>
              </div>
            ) : null}
            {userContact.telephoneNumber ? (
              <div>
                <Caption>Phone Number</Caption>
                <Content>
                  <p>{userContact.telephoneNumber}</p>
                </Content>
              </div>
            ) : null}
          </div>
        )
      }
      modalTitle="Help applicants get in touch"
      modalHeadline="Contact"
      modalBody={
        <ModalForm
          setIsEditing={setIsEditing}
          setIsFormDirty={setIsFormDirty}
        />
      }
      modalStyles={{ minHeight: '40rem' }}
    />
  )
}

EditableContact.isSectionFilled = (
  companyProfile: EditableContactCompanyProfilePropFragment,
  userContact: EditableContactUserContactPropFragment
) =>
  userContact?.firstName ||
  userContact?.lastName ||
  userContact?.email ||
  companyProfile?.telephoneNumber
EditableContact.isSectionEmpty = (
  companyProfile: EditableContactCompanyProfilePropFragment,
  userContact: EditableContactUserContactPropFragment
) => !EditableContact.isSectionFilled(companyProfile, userContact)

const validationSchema = Yup.object({
  firstName: Yup.string()
    .transform(toPascalCaseAndTrim)
    .required('Your first name is required')
    .max(255),
  lastName: Yup.string()
    .transform(toPascalCaseAndTrim)
    .required('Your last name is required')
    .max(255),
  telephoneNumber: Yup.string().nullable().max(255).label('Phone Number'),
})

type FormValues = EditableContactCompanyProfilePropFragment &
  EditableContactUserContactPropFragment

function ModalForm({
  setIsEditing,
  setIsFormDirty,
}: {
  setIsEditing: (boolean) => void
  setIsFormDirty: (boolean) => void
}) {
  const queryClient = useQueryClient()
  const myData = useMyTpDataQuery()
  const companyProfile = myData?.data?.tpCurrentUserDataGet?.representedCompany
  const userContact = myData?.data?.tpCurrentUserDataGet?.userContact
  const companyProfileMutation = usePatchTpCompanyProfileMutation()
  const userContactMutation = usePatchUserContactMutation()
  const isBusy = useIsBusy()

  const initialValues: FormValues = useMemo(
    () => ({
      firstName: userContact?.firstName ?? '',
      lastName: userContact?.lastName ?? '',
      telephoneNumber: companyProfile?.telephoneNumber ?? '',
      email: userContact?.email ?? '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const onSubmit = async (values: FormValues) => {
    formik.setSubmitting(true)
    const transformedValues = validationSchema.cast(values)
    const pendingCompanyProfilePatch = companyProfileMutation.mutateAsync({
      input: {
        telephoneNumber: transformedValues.telephoneNumber,
      },
    })
    const pendingUserContactPatch = userContactMutation.mutateAsync({
      input: {
        firstName: transformedValues.firstName,
        lastName: transformedValues.lastName,
      },
    })
    await Promise.all([pendingCompanyProfilePatch, pendingUserContactPatch])
    queryClient.invalidateQueries()
    formik.setSubmitting(false)
    setIsEditing(false)
  }
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
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
        Let ReDI Jobseekers know how to get in touch.
      </Element>
      <FormInput
        name="firstName"
        placeholder="Erika"
        label="First name*"
        {...formik}
      />
      <FormInput
        name="lastName"
        placeholder="Mustermann"
        label="Last name*"
        {...formik}
      />
      <FormInput
        name="email"
        placeholder="your.name@company.com"
        label="E-mail*"
        {...formik}
        disabled
      />
      <FormInput
        name="telephoneNumber"
        placeholder="0176 01234567"
        label="Company Phone Number"
        {...formik}
      />

      <Button disabled={!formik.isValid || isBusy} onClick={formik.submitForm}>
        Save
      </Button>
      <Button simple disabled={isBusy} onClick={() => setIsEditing(false)}>
        Cancel
      </Button>
    </>
  )
}
