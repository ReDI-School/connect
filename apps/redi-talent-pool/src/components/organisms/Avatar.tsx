import {
  AWS_PROFILE_AVATARS_BUCKET_BASE_URL,
  S3_UPLOAD_SIGN_URL,
} from '@talent-connect/shared-config'
import {
  TpJobseekerProfile,
  TpCompanyProfile,
} from '@talent-connect/shared-types'
import classnames from 'classnames'
import { FormikValues, useFormik } from 'formik'
import { Element } from 'react-bulma-components'
import ReactS3Uploader from 'react-s3-uploader'
import * as Yup from 'yup'
import placeholderImage from '../../assets/img-placeholder.png'
import { ReactComponent as UploadImage } from '../../assets/uploadImage.svg'
import './Avatar.scss'

interface AvatarProps {
  profile: Partial<TpJobseekerProfile> | Partial<TpCompanyProfile>
}
interface AvatarEditable {
  profile: Partial<TpJobseekerProfile> | Partial<TpCompanyProfile>
  profileSaveStart: (
    profile: Partial<TpJobseekerProfile> | Partial<TpCompanyProfile>
  ) => void
  callToActionText?: string
}

interface AvatarFormValues {
  profileAvatarImageS3Key: string
}

const validationSchema = Yup.object({
  profileAvatarImageS3Key: Yup.string().max(255),
})

const Avatar = ({ profile }: AvatarProps) => {
  const { profileAvatarImageS3Key } = profile
  const imgSrc = profileAvatarImageS3Key
    ? AWS_PROFILE_AVATARS_BUCKET_BASE_URL + profileAvatarImageS3Key
    : placeholderImage

  return (
    <div
      className={classnames('avatar', {
        'avatar--placeholder': !profileAvatarImageS3Key,
      })}
    >
      <img
        src={imgSrc}
        alt={`${profile.firstName} ${profile.lastName}`}
        className="avatar__image"
      />
    </div>
  )
}

const AvatarEditable = ({
  profile,
  profileSaveStart,
  callToActionText = 'Add your picture',
}: AvatarEditable) => {
  const { profileAvatarImageS3Key } = profile
  const imgURL = AWS_PROFILE_AVATARS_BUCKET_BASE_URL + profileAvatarImageS3Key

  const submitForm = async (values: FormikValues) => {
    const profileMe = values as Partial<TpJobseekerProfile>
    profileSaveStart({ ...profileMe, id: profile.id })
  }

  const initialValues: AvatarFormValues = {
    profileAvatarImageS3Key: profileAvatarImageS3Key,
  }

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema,
    onSubmit: submitForm,
  })

  const onUploadSuccess = (result: any) => {
    formik.setFieldValue('profileAvatarImageS3Key', result.fileKey)
    formik.handleSubmit()
  }

  return (
    <div
      className={classnames('avatar avatar--editable', {
        'avatar--placeholder': !profileAvatarImageS3Key,
      })}
    >
      {profileAvatarImageS3Key && (
        <>
          <img
            src={imgURL}
            alt={`${profile.firstName} ${profile.lastName}`}
            className="avatar__image"
          />
          <Element
            renderAs="span"
            className="avatar__button"
            textSize={7}
            textTransform="uppercase"
          >
            Edit Photo
          </Element>
        </>
      )}

      {!profileAvatarImageS3Key && (
        <div className="avatar__placeholder">
          <UploadImage className="avatar__placeholder__image" />
          <Element
            textSize={6}
            className="avatar__placeholder__text"
            responsive={{ mobile: { hide: { value: true } } }}
          >
            {callToActionText}
          </Element>
        </div>
      )}

      <ReactS3Uploader
        name="avatar-upload"
        id="avatar-upload"
        className="avatar__input"
        signingUrl={S3_UPLOAD_SIGN_URL}
        accept="image/*"
        uploadRequestHeaders={{ 'x-amz-acl': 'public-read' }}
        onSignedUrl={(c: any) => console.log(c)}
        onError={(c: any) => console.log(c)}
        onFinish={onUploadSuccess}
        contentDisposition="auto"
      />
    </div>
  )
}

Avatar.Some = (profile: TpJobseekerProfile) => <Avatar profile={profile} />
Avatar.Editable = AvatarEditable

export default Avatar
