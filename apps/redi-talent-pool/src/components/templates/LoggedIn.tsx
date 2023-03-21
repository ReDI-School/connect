import {
  CompanyTalentPoolState,
  JobseekerProfileStatus,
  useMyTpDataQuery,
} from '@talent-connect/data-access'
import { Loader } from '@talent-connect/shared-atomic-design-components'
import { ReactNode } from 'react'
import { Columns, Container } from 'react-bulma-components'
import { useIsBusy } from '../../hooks/useIsBusy'
import { TpMainNavItem } from '../molecules/TpMainNavItem'
import { Navbar } from '../organisms'
import Footer from '../organisms/Footer'
import './LoggedIn.scss'

interface Props {
  hideNavigation?: boolean
  children?: ReactNode
}

const LoggedIn = ({ children, hideNavigation }: Props) => {
  const myTpData = useMyTpDataQuery()

  const companyProfile = myTpData.data?.tpCurrentUserDataGet?.representedCompany
  const tpJobseekerDirectoryEntry =
    myTpData.data?.tpCurrentUserDataGet?.tpJobseekerDirectoryEntry

  const isBusy = useIsBusy()

  return (
    <>
      <Navbar />
      <Container className="main-container">
        <div style={{ display: 'flex' }}>
          {hideNavigation ? null : (
            <>
              <div className="tp-side-menu">
                <TpMainNavItem
                  page="profile-page"
                  pageName="My profile"
                  to="/app/me"
                  isActive={location.pathname === '/app/me'}
                />
                {companyProfile?.state ===
                  CompanyTalentPoolState.ProfileApproved ||
                tpJobseekerDirectoryEntry?.state ===
                  JobseekerProfileStatus.ProfileApproved ? (
                  <TpMainNavItem
                    page="browse-page"
                    pageName="Browse"
                    to="/app/browse"
                    isActive={location.pathname === '/app/browse'}
                  />
                ) : null}
                {tpJobseekerDirectoryEntry ? (
                  <TpMainNavItem
                    page="cv-builder-page"
                    pageName="CV Builder"
                    to="/app/cv-builder"
                    isActive={location.pathname.includes('/app/cv-builder')}
                  />
                ) : null}
              </div>
              <div className="main-container--horizontal-spacer"></div>
            </>
          )}
          <Columns style={{ width: '100%', marginTop: '2rem' }}>
            <Columns.Column
              desktop={{ size: 12 }}
              className="column--main-content"
            >
              <Loader loading={isBusy} />
              {children}
            </Columns.Column>
          </Columns>
          {hideNavigation ? null : (
            <div className="main-container--horizontal-spacer is-hidden-desktop"></div>
          )}
        </div>
      </Container>
      <Footer />
    </>
  )
}

export default LoggedIn
