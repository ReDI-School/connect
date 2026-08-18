import 'reflect-metadata'
import { RediLocation } from '@talent-connect/common-types'
import { ConProfilesService } from './con-profiles.service'

describe('ConProfilesService', () => {
  let service: ConProfilesService
  let api: { getAllConProfiles: jest.Mock }

  beforeEach(() => {
    api = { getAllConProfiles: jest.fn().mockResolvedValue([]) }
    service = new ConProfilesService(api as any, {} as any)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  const currentUser = {
    userId: 'current-user-id',
    loopbackUserId: 'current-loopback-user-id',
  } as any

  const findAvailableMentors = async (
    rediLocation: RediLocation,
    locations: RediLocation[] = []
  ) => {
    jest.spyOn(service, 'findOneByLoopbackUserId').mockResolvedValue({
      props: { rediLocation },
    } as any)

    await service.findAllAvailableMentors(
      {
        filter: {
          name: undefined,
          categories: [],
          languages: [],
          locations,
        },
      },
      currentUser
    )

    return api.getAllConProfiles.mock.calls[0][0]
  }

  it.each([
    [
      RediLocation.BERLIN,
      [
        RediLocation.BERLIN,
        RediLocation.HAMBURG,
        RediLocation.MUNICH,
        RediLocation.NRW,
        RediLocation.CYBERSPACE,
      ],
    ],
    [RediLocation.MALMO, [RediLocation.MALMO]],
    [RediLocation.COPENHAGEN, [RediLocation.COPENHAGEN]],
  ])('limits %s users to their matching pool', async (location, pool) => {
    const filter = await findAvailableMentors(location, [])

    expect(filter.ReDI_Location__c).toEqual({ $in: pool })
  })

  it('intersects requested locations with the current matching pool', async () => {
    const filter = await findAvailableMentors(RediLocation.COPENHAGEN, [
      RediLocation.COPENHAGEN,
      RediLocation.BERLIN,
      RediLocation.MALMO,
    ])

    expect(filter.ReDI_Location__c).toEqual({
      $in: [RediLocation.COPENHAGEN],
    })
  })

  it('returns no mentors for foreign-only location filters', async () => {
    jest.spyOn(service, 'findOneByLoopbackUserId').mockResolvedValue({
      props: { rediLocation: RediLocation.COPENHAGEN },
    } as any)

    const result = await service.findAllAvailableMentors(
      {
        filter: {
          name: undefined,
          categories: [],
          languages: [],
          locations: [RediLocation.BERLIN, RediLocation.MALMO],
        },
      },
      currentUser
    )

    expect(result).toEqual([])
    expect(api.getAllConProfiles).not.toHaveBeenCalled()
  })

  it('rejects profiles outside configured matching pools', async () => {
    jest.spyOn(service, 'findOneByLoopbackUserId').mockResolvedValue({
      props: { rediLocation: 'UNKNOWN' },
    } as any)

    await expect(
      service.findAllAvailableMentors(
        {
          filter: {
            name: undefined,
            categories: [],
            languages: [],
            locations: [],
          },
        },
        currentUser
      )
    ).rejects.toThrow('ReDI location matching pool')
  })
})
