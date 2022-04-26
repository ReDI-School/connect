import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import {
  ConMentorshipMatchEntityProps,
  ConProfileEntityProps,
} from '@talent-connect/common-types'
import { ConProfilesService } from '../con-profiles/con-profiles.service'
import { ConMentorshipMatchesService } from './con-mentorship-matches.service'
import { CreateConMentorshipMatchInput } from './dto/create-con-mentorship-match.input'
import { UpdateConMentorshipMatchInput } from './dto/update-con-mentorship-match.input'

@Resolver(() => ConMentorshipMatchEntityProps)
export class ConMentorshipMatchesResolver {
  constructor(
    private readonly conMentorshipMatchesService: ConMentorshipMatchesService,
    private readonly conProfilesService: ConProfilesService
  ) {}

  // @Mutation(() => ConMentorshipMatch)
  // createConMentorshipMatch(
  //   @Args('createConMentorshipMatchInput')
  //   createConMentorshipMatchInput: CreateConMentorshipMatchInput
  // ) {
  //   return this.conMentorshipMatchesService.create(
  //     createConMentorshipMatchInput
  //   )
  // }

  @Query(() => [ConMentorshipMatchEntityProps], {
    name: 'conMentorshipMatches',
  })
  async findAll() {
    const entities = await this.conMentorshipMatchesService.findAll()
    const props = entities.map((entity) => entity.props)
    return props
  }

  // @Query(() => ConMentorshipMatch, { name: 'conMentorshipMatch' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.conMentorshipMatchesService.findOne(id)
  // }

  // @Mutation(() => ConMentorshipMatch)
  // updateConMentorshipMatch(
  //   @Args('updateConMentorshipMatchInput')
  //   updateConMentorshipMatchInput: UpdateConMentorshipMatchInput
  // ) {
  //   return this.conMentorshipMatchesService.update(
  //     updateConMentorshipMatchInput.id,
  //     updateConMentorshipMatchInput
  //   )
  // }

  // @Mutation(() => ConMentorshipMatch)
  // removeConMentorshipMatch(@Args('id', { type: () => Int }) id: number) {
  //   return this.conMentorshipMatchesService.remove(id)
  // }

  @ResolveField((of) => ConProfileEntityProps)
  async mentee(
    @Parent() conMentorshipMatch: ConMentorshipMatchEntityProps
  ): Promise<ConProfileEntityProps> {
    const { menteeId } = conMentorshipMatch
    const conProfiles = await this.conProfilesService.findAll({
      'Contact__r.Id': menteeId,
    })
    const conProfile = conProfiles[0]

    return conProfile.props
  }
}
