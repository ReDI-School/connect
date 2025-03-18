import { Injectable } from '@nestjs/common'
import {
  AccountRecord,
  AccountRecordProps,
  CompanyTalentPoolState,
  Mapper,
  TpCompanyProfileEntity,
  TpCompanyProfileEntityProps,
} from '@talent-connect/common-types'

@Injectable()
export class TpCompanyProfileMapper
  implements Mapper<TpCompanyProfileEntity, AccountRecord>
{
  fromPersistence(raw: AccountRecord): TpCompanyProfileEntity {
    const props = new TpCompanyProfileEntityProps()

    props.id = raw.props.Id

    props.profileAvatarImageS3Key = raw.props.ReDI_Avatar_Image_URL__c
    props.companyName = raw.props.Name
    props.location = raw.props.Location__c
    props.tagline = raw.props.ReDI_Tagline__c
    props.industry = raw.props.Industry
    props.website = raw.props.Website
    props.linkedInUrl = raw.props.ReDI_LinkedIn_Page__c
    props.telephoneNumber = raw.props.Phone
    props.about = raw.props.Description
    props.state = raw.props.ReDI_Talent_Pool_State__c as CompanyTalentPoolState
    props.isProfileVisibleToJobseekers = raw.props.ReDI_Visible_to_Jobseekers__c
    props.isCareerPartner = raw.props.ReDI_Career_Partner__c

    /**
     * Job Fair Boolean Field(s)
     * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
     * Duplicate if there are multiple Job Fairs coming
     */
    // props.joins25WinterTalentSummit =
    //   raw.props.ReDI_Joins_25_Winter_Talent_Summit__c

    props.createdAt = raw.props.CreatedDate
    props.updatedAt = raw.props.LastModifiedDate

    const entity = TpCompanyProfileEntity.create(props)

    return entity
  }

  public toPersistence(source: TpCompanyProfileEntity): AccountRecord {
    const props = new AccountRecordProps()
    const srcProps = source.props

    props.Id = srcProps.id

    props.ReDI_Avatar_Image_URL__c = srcProps.profileAvatarImageS3Key
    props.Name = srcProps.companyName
    props.Location__c = srcProps.location
    props.ReDI_Tagline__c = srcProps.tagline
    props.Industry = srcProps.industry
    props.Website = srcProps.website
    props.ReDI_LinkedIn_Page__c = srcProps.linkedInUrl
    props.Phone = srcProps.telephoneNumber
    props.Description = srcProps.about
    props.ReDI_Talent_Pool_State__c = srcProps.state
    props.ReDI_Visible_to_Jobseekers__c = srcProps.isProfileVisibleToJobseekers

    /**
     * Job Fair Boolean Field(s)
     * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
     * Duplicate if there are multiple Job Fairs coming
     */
    // props.ReDI_Joins_25_Winter_Talent_Summit__c =
    //   srcProps.joins25WinterTalentSummit

    props.CreatedDate = srcProps.createdAt
    props.LastModifiedDate = srcProps.updatedAt

    const record = AccountRecord.create(props)

    return record
  }
}
