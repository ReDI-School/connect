import { forwardRef, Module } from '@nestjs/common'
import { ConProfileMapper } from '@talent-connect/common-types'
import { AuthModule } from '../auth/auth.module'
import { ConMentoringSessionsModule } from '../con-mentoring-sessions/con-mentoring-sessions.module'
import { ConMentorshipMatchesModule } from '../con-mentorship-matches/con-mentorship-matches.module'
import { EmailModule } from '../email/email.module'
import { SfApiModule } from '../salesforce-api/sf-api.module'
import { ConProfilesSalesforceEventHandlerService } from './con-profiles-salesforce-event-handler.service'
import { ConProfilesResolver } from './con-profiles.resolver'
import { ConProfilesService } from './con-profiles.service'

@Module({
  imports: [
    AuthModule,
    SfApiModule,
    ConMentoringSessionsModule,
    forwardRef(() => ConMentorshipMatchesModule),
    EmailModule,
  ],
  providers: [
    ConProfileMapper,
    ConProfilesResolver,
    ConProfilesService,
    ConProfilesSalesforceEventHandlerService,
  ],
  exports: [ConProfilesService],
})
export class ConProfilesModule {}
