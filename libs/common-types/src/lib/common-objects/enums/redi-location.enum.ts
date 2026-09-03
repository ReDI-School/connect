import { registerEnumType } from '@nestjs/graphql'

export enum RediLocation {
  BERLIN = 'BERLIN',
  COPENHAGEN = 'COPENHAGEN',
  HAMBURG = 'HAMBURG',
  MALMO = 'MALMO',
  MUNICH = 'MUNICH',
  NRW = 'NRW',
  CYBERSPACE = 'CYBERSPACE',
}
registerEnumType(RediLocation, { name: 'RediLocation' })
