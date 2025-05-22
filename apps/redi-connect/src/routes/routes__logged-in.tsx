import { lazy } from 'react'
import { RouteDefinition } from './index'

const Applications = lazy(
  () =>
    import(
      /* webpackChunkName: "Applications", webpackPreload: true  */ '../pages/app/applications/Applications'
    )
)
const Mentorship = lazy(
  () =>
    import(
      /* webpackChunkName: "Mentorship", webpackPreload: true  */ '../pages/app/mentorship/Mentorship'
    )
)
const MentorshipsList = lazy(
  () =>
    import(
      /* webpackChunkName: "MentorshipList", webpackPreload: true  */ '../pages/app/mentorship/MentorshipsList'
    )
)
const FindAMentor = lazy(
  () =>
    import(
      /* webpackChunkName: "FindAMentor", webpackPreload: true  */ '../pages/app/find-a-mentor/FindAMentor'
    )
)
const ProfileViewer = lazy(
  () =>
    import(
      /* webpackChunkName: "ProfileViewer", webpackPreload: true  */ '../pages/app/profile/profile-viewer/ProfileViewer'
    )
)
const RedirectToOwnProfile = lazy(
  () =>
    import(
      /* webpackChunkName: "ProfileEditor", webpackPreload: true  */ '../pages/app/profile/RedirectToOwnProfile'
    )
)
const ProfilePage = lazy(
  () =>
    import(
      /* webpackChunkName: "ProfilePage", webpackPreload: true  */ '../pages/app/profile/ProfilePage'
    )
)
const FourOFour = lazy(
  () => import(/* webpackChunkName: "404" */ '../pages/app/404/404')
)

const routes: RouteDefinition[] = [
  {
    path: '/app/find-a-mentor',
    component: FindAMentor,
    exact: true,
  },
  {
    path: '/app/find-a-mentor/profile/:profileId',
    component: ProfileViewer,
    exact: true,
  },
  {
    path: '/app/applications',
    component: Applications,
    exact: true,
    name: 'mentee-applicants',
  },
  {
    path: '/app/applications/profile/:profileId',
    component: ProfileViewer,
    exact: true,
  },
  {
    path: '/app/mentorships',
    component: MentorshipsList,
    exact: true,
  },
  {
    path: '/app/mentorships/:matchId',
    component: Mentorship,
    exact: true,
  },
  {
    path: '/app/mentorships/profile/:profileId',
    component: ProfileViewer,
    exact: true,
  },
  {
    path: '/app/profile/:profileId',
    component: ProfilePage,
    exact: true,
  },
  {
    path: '/app/me',
    component: RedirectToOwnProfile,
    exact: true,
  },
  {
    path: '/app/404',
    component: FourOFour,
    exact: true,
  },
]

const routesRequiringLoggedIn = routes.map((route) =>
  Object.assign(route, { requiresLoggedIn: true })
)

export const routes__loggedIn = routesRequiringLoggedIn
