/**
 * TODO: This component is only used in CvListPage, thus it makes sense to
 * have it located here. However, upon further discussion, this co-locating
 * must be standardized within the project.
 */

import React from 'react'
import { format as formatDate } from 'date-fns'
import { useHistory } from 'react-router-dom'
import { PDFDownloadLink } from '@react-pdf/renderer'

import {
  Modal,
  FormInput,
  Button,
} from '@talent-connect/shared-atomic-design-components'
import { Box, Content } from 'react-bulma-components'
import { Chip } from '@material-ui/core'
import { AWS_PROFILE_AVATARS_BUCKET_BASE_URL } from '@talent-connect/shared-config'
import placeholderImage from '../../../../assets/img-placeholder.png'

import { useTpJobseekerCvByIdQuery } from '../../../../react-query/use-tpjobseekercv-query'
import {
  useTpjobseekerCvCreateMutation,
  useTpjobseekerCvDeleteMutation,
  useTpjobseekerCvUpdateMutation,
} from '../../../../react-query/use-tpjobseekercv-mutation'

import { CvListItemMoreOptionsMenu } from './CvListItemMoreOptionsMenu'
import { CVPDF } from '../../../../components/molecules/CvPdfPreview'
import { useTpJobseekerProfileQuery } from '../../../../react-query/use-tpjobseekerprofile-query'

const CREATED_AT_DATE_FORMAT = 'dd.MM.yyyy'

interface CvListItemProps {
  id: string
  name: string
  createdAt: Date
}

interface CvListItemBoxProps {
  children: React.ReactNode
}

export function CvListItemBox({ children }: CvListItemBoxProps) {
  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '24px 32px',
        color: '#000000',
      }}
    >
      {children}
    </Box>
  )
}

interface CvListItemChipProps {
  label: string
  onClick?(): void
  disabled?: boolean
  className?: string
}

function CvListItemChip(props: CvListItemChipProps) {
  return (
    <Chip
      style={{ width: 128, height: 40, marginRight: 32, fontSize: 16 }}
      {...props}
    />
  )
}

const CvListItem = (props: CvListItemProps) => {
  const [showCvNameModal, setShowCvNameModal] = React.useState(false)
  const [newCvName, setNewCvName] = React.useState(props.name || '')
  const [profileImageLoaded, setProfileImageLoaded] = React.useState(false)

  const history = useHistory()

  const { data: cvData, isSuccess: cvLoadSuccess } = useTpJobseekerCvByIdQuery(
    props.id
  )
  const {
    data: profileData,
    isSuccess: profileLoadSuccess,
  } = useTpJobseekerProfileQuery()

  const createMutation = useTpjobseekerCvCreateMutation()
  const updateMutation = useTpjobseekerCvUpdateMutation(props.id)
  const deleteMutation = useTpjobseekerCvDeleteMutation(props.id)

  const setFocusOnRef = (ref: HTMLInputElement) => ref?.focus()

  React.useEffect(() => {
    if (profileLoadSuccess && cvLoadSuccess) {
      cvData.profileAvatarImageS3Key = profileData.profileAvatarImageS3Key
        ? AWS_PROFILE_AVATARS_BUCKET_BASE_URL +
          profileData.profileAvatarImageS3Key
        : placeholderImage

      setProfileImageLoaded(true)
    }
  }, [profileLoadSuccess, cvLoadSuccess, cvData, profileData])

  const handleShowCvNameModal = () => {
    setShowCvNameModal(true)
  }

  const handleEditClick = (): void => {
    history.push(`/app/cv-builder/${props.id}`)
  }

  const handleDelete = (): void => {
    deleteMutation.mutate()
  }

  const handleRename = (): void => {
    if (newCvName !== props.name) {
      updateMutation
        .mutateAsync({ cvName: newCvName })
        .then(() => setShowCvNameModal(false))
    }
  }

  const handleDuplicate = (): void => {
    createMutation.mutate({
      ...cvData,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      cvName: `${props.name} - Duplicate`,
    })
  }

  return (
    <>
      <CvListItemBox>
        <Content style={{ display: 'flex', alignItems: 'center' }} marginless>
          <Content
            marginless
            style={{ borderRight: '1px solid black', paddingRight: 10 }}
          >
            {props.name}
          </Content>
          <Content marginless style={{ paddingLeft: 10 }}>
            {formatDate(new Date(props.createdAt), CREATED_AT_DATE_FORMAT)}
          </Content>
        </Content>
        <Content style={{ display: 'flex', alignItems: 'center' }}>
          <CvListItemChip label="Edit" onClick={handleEditClick} />
          {cvData && (
            <PDFDownloadLink
              document={<CVPDF cvData={cvData} />}
              fileName={`${cvData?.firstName}_${cvData?.lastName}_CV.pdf`}
            >
              {({ blob, url, loading, error }) =>
                loading || !profileImageLoaded ? (
                  <CvListItemChip label="Export" disabled />
                ) : (
                  <CvListItemChip
                    label="Export"
                    className="MuiButtonBase-root MuiChip-root MuiChip-clickable"
                  />
                )
              }
            </PDFDownloadLink>
          )}
          <CvListItemMoreOptionsMenu
            handleDeleteClick={handleDelete}
            handleRenameClick={handleShowCvNameModal}
            handleDuplicateClick={handleDuplicate}
          />
        </Content>
      </CvListItemBox>
      <Modal
        show={showCvNameModal}
        stateFn={setShowCvNameModal}
        title="Rename CV"
      >
        <Modal.Body>
          <FormInput
            name="newCvNameInput"
            label="Name of the CV"
            placeholder="CV for Microsoft Frontend Developer Internship"
            values={{ newCvNameInput: newCvName }}
            handleChange={(e) => setNewCvName(e.target.value)}
            domRef={setFocusOnRef}
          />
        </Modal.Body>
        <Modal.Foot>
          <Button disabled={!newCvName} onClick={handleRename}>
            Save
          </Button>
        </Modal.Foot>
      </Modal>
    </>
  )
}

export default CvListItem
