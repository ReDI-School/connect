import { Test, TestingModule } from '@nestjs/testing'
import { ConProfilesService } from './con-profiles.service'

describe('ConProfilesService', () => {
  let service: ConProfilesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConProfilesService],
    }).compile()

    service = module.get<ConProfilesService>(ConProfilesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
