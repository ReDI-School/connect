import { Caption } from '@talent-connect/shared-atomic-design-components'
import { COURSES } from '@talent-connect/shared-config'
import { RedProfile } from '@talent-connect/shared-types'
import { Content } from 'react-bulma-components'
import { connect } from 'react-redux'
import { RootState } from '../../redux/types'

interface Props {
  profile: RedProfile
  shortInfo?: boolean
}

const ReadRediClass = ({ profile, shortInfo }: Props) => {
  const { mentee_currentlyEnrolledInCourse } = profile

  const COURSES_MAP = Object.fromEntries(
    COURSES.map((course) => [course.id, course.label])
  )

  return (
    <>
      {shortInfo && <Caption>Redi Class</Caption>}
      <Content>
        {mentee_currentlyEnrolledInCourse && (
          <p>{COURSES_MAP[mentee_currentlyEnrolledInCourse]}</p>
        )}
      </Content>
    </>
  )
}

const mapStateToProps = (state: RootState) => ({
  profile: state.user.profile as RedProfile,
})

export default {
  Me: connect(mapStateToProps, {})(ReadRediClass),
  Some: ({ profile }: Props) => <ReadRediClass profile={profile} shortInfo />,
}
