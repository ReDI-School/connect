import { ConfigService } from '@nestjs/config'
import { Cache, caching } from 'cache-manager'
import { EventEmitter } from 'events'
import * as jsforce from 'jsforce'
import { SfApiRepository } from './sf-api.repository'

jest.mock('jsforce', () => ({ Connection: jest.fn() }))
jest.mock('readline', () => ({ createInterface: jest.fn() }))

describe('SfApiRepository query caching', () => {
  let repository: SfApiRepository
  let cache: Cache
  let upstreamRecords: { Id: string }[]
  let querySalesforce: jest.Mock

  const query = {
    objectName: 'Mentorship_Match__c',
    objectFields: ['Id'],
    filter: { Mentee__c: 'mentee', Status__c: 'ACCEPTED' },
  }

  beforeEach(() => {
    cache = caching({ store: 'memory' })
    upstreamRecords = []
    const builder = {
      find: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      toSOQL: jest.fn().mockResolvedValue('SELECT Id FROM Mentorship_Match__c'),
    }
    querySalesforce = jest.fn(() => {
      const response = new EventEmitter() as EventEmitter & { run: () => void }
      response.run = () => {
        setImmediate(() => {
          upstreamRecords.forEach((record) => response.emit('record', record))
          response.emit('end')
        })
      }
      return response
    })
    ;(jsforce.Connection as jest.Mock).mockImplementation(() => ({
      login: jest.fn().mockResolvedValue(undefined),
      sobject: jest.fn().mockReturnValue(builder),
      query: querySalesforce,
    }))
    jest.spyOn(console, 'log').mockImplementation()
    const stdinOn = jest
      .spyOn(process.stdin, 'on')
      .mockReturnValue(process.stdin)
    repository = new SfApiRepository(new ConfigService(), cache)
    stdinOn.mockRestore()
  })

  afterEach(() => jest.restoreAllMocks())

  it('preserves cached queries by default', async () => {
    await expect(repository.findRecordsOfObject(query)).resolves.toEqual([])
    upstreamRecords = [{ Id: 'newly-accepted' }]
    await expect(repository.findRecordsOfObject(query)).resolves.toEqual([])
    expect(querySalesforce).toHaveBeenCalledTimes(1)
  })

  it('bypasses cached absence of an accepted mentorship when a fresh read is requested', async () => {
    await repository.findRecordsOfObject(query)
    upstreamRecords = [{ Id: 'newly-accepted' }]
    const cacheGet = jest.spyOn(cache, 'get')
    const cacheSet = jest.spyOn(cache, 'set')

    await expect(
      repository.findRecordsOfObject({ ...query, skipCache: true })
    ).resolves.toEqual([{ Id: 'newly-accepted' }])

    expect(querySalesforce).toHaveBeenCalledTimes(2)
    expect(cacheGet).not.toHaveBeenCalled()
    expect(cacheSet).not.toHaveBeenCalled()
  })
})
