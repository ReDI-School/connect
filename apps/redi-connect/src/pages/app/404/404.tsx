import FourOhFour from '../../../assets/images/404.png'
import { LoggedIn } from '../../../components/templates'

export default () => (
  <LoggedIn hideNavigation>
    <div className="tw-max-w-[240px] md:tw-max-w-[342px] tw-flex tw-justify-center tw-h-full tw-flex-col tw-m-auto tw-min-h-[40rem]">
      <img src={FourOhFour} alt="404" className="tw-mb-6" />
      <span className="tw-text-sm md:tw-text-base">
        <b>Hey!</b> This page isn't available. We're sorry about that. Please go
        back to our <a href="/">Homepage</a>.
      </span>
    </div>
  </LoggedIn>
)
