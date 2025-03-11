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
const Profile = lazy(
  () =>
    import(
      /* webpackChunkName: "Profile", webpackPreload: true  */ '../pages/app/profile/Profile'
    )
)
const Me = lazy(
  () =>
    import(
      /* webpackChunkName: "Me", webpackPreload: true  */ '../pages/app/me/Me'
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
    component: Profile,
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
    component: Profile,
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
    component: Profile,
    exact: true,
  },
  {
    path: '/app/profile/:profileId',
    component: Profile,
    exact: true,
  },
  {
    path: '/app/me',
    component: Me,
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
