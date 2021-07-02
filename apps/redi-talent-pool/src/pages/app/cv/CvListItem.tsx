/**
 * TODO: This component is only used in CvListPage, thus it makes sense to
 * have it located here. However, upon further discussion, this co-locating
 * must be standardized within the project.
 */

import React from 'react'
import { format as formatDate } from 'date-fns'

import {
  Modal,
  FormInput,
  Button,
} from '@talent-connect/shared-atomic-design-components'
import { Box, Content } from 'react-bulma-components'
import { Chip } from '@material-ui/core'

import {
  useTpjobseekerCvCreateMutation,
  useTpjobseekerCvDeleteMutation,
  useTpjobseekerCvUpdateMutation,
} from '../../../react-query/use-tpjobseekercv-mutation'

import { CvListItemMoreOptionsMenu } from './CvListItemMoreOptionsMenu'

const CREATED_AT_DATE_FORMAT = 'dd.MM.yyyy'

interface CvListItemProps {
  id: string
  name: string
  createdAt: Date
  handleEdit?(): void
  handleExport?(): void
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
  onClick(): void
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

  const createMutation = useTpjobseekerCvCreateMutation()
  const updateMutation = useTpjobseekerCvUpdateMutation(props.id)
  const deleteMutation = useTpjobseekerCvDeleteMutation(props.id)

  const setFocusOnRef = (ref: HTMLInputElement) => ref?.focus()

  const handleShowCvNameModal = () => {
    setShowCvNameModal(true)
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
    createMutation.mutate({ cvName: `${props.name} - Duplicate` })
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
          <CvListItemChip label="Edit" onClick={props.handleEdit} />
          <CvListItemChip label="Export" onClick={props.handleExport} />
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
