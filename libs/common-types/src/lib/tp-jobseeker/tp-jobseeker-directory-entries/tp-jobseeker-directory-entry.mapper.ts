import { Injectable, NotImplementedException } from '@nestjs/common'
import { Mapper } from '../../base-interfaces-types-classes'
import {
  FederalState,
  ImmigrationStatus,
  Language,
  LanguageProficiencyLevel,
  TpDesiredPosition,
  TpEmploymentType,
  TpTechnicalSkill,
} from '../../common-objects'
import { TpAvailabilityOption } from '../../tp-common-objects'
import { TpJobseekerProfileEducationRecordEntityProps } from '../common-objects/tp-jobseeker-profile-education-record.entityprops'
import { TpJobseekerProfileExperienceRecordEntityProps } from '../common-objects/tp-jobseeker-profile-experience-record.entityprops'
import { TpJobseekerProfileLanguageRecordEntityProps } from '../common-objects/tp-jobseeker-profile-language-record.entityprops'
import { JobseekerProfileStatus } from '../enums'
import { TpJobseekerDirectoryEntryEntity } from './tp-jobseeker-directory-entry.entity'
import { TpJobseekerDirectoryEntryEntityProps } from './tp-jobseeker-directory-entry.entityprops'
import { TpJobseekerDirectoryEntryRecord } from './tp-jobseeker-directory-entry.record'

@Injectable()
export class TpJobseekerDirectoryEntryMapper
  implements
    Mapper<TpJobseekerDirectoryEntryEntity, TpJobseekerDirectoryEntryRecord>
{
  fromPersistence(
    raw: TpJobseekerDirectoryEntryRecord
  ): TpJobseekerDirectoryEntryEntity {
    const props = new TpJobseekerDirectoryEntryEntityProps()

    // Properties on SF Contact object
    props.userId = raw.props.Id
    props.email = raw.props.ReDI_Email_Address__c
    props.firstName = String(raw.props.FirstName)
    props.lastName = raw.props.LastName
    props.linkedInUrl = raw.props.LinkedIn_Profile__c
    props.personalWebsite = raw.props.ReDI_Website_Portfolio__c
    props.githubUrl = raw.props.ReDI_GitHub_Profile__c
    props.behanceUrl = raw.props.ReDI_Behance_URL__c
    props.dribbbleUrl = raw.props.ReDI_Dribbble_URL__c
    props.stackOverflowUrl = raw.props.ReDI_Stack_Overflow_URL__c
    props.postalMailingAddress = raw.props.CON_TP_Mailing_Address__c
    props.telephoneNumber = raw.props.MobilePhone
    props.genderPronouns = raw.props.ReDI_Gender_Pronouns__c
    props.loopbackUserId = raw.props.Loopback_User_ID__c

    // Properties on SF Jobseeker Profile object
    const jobseekerProfileRecord = raw.props.Jobseeker_Profiles__r.records[0]

    props.id = jobseekerProfileRecord.Id

    props.rediLocation = jobseekerProfileRecord.ReDI_Location__c
    props.profileAvatarImageS3Key = jobseekerProfileRecord.Avatar_Image_URL__c
    props.desiredPositions =
      (jobseekerProfileRecord.Desired_Positions__c?.split(
        ';'
      ) as TpDesiredPosition[]) ?? undefined
    props.location = jobseekerProfileRecord.Location__c
    props.desiredEmploymentType =
      (jobseekerProfileRecord.Desired_Employment_Type__c?.split(
        ';'
      ) as TpEmploymentType[]) ?? undefined
    props.availability =
      jobseekerProfileRecord.Availability__c as TpAvailabilityOption
    props.ifAvailabilityIsDate_date =
      jobseekerProfileRecord.Availability_Date__c
    props.aboutYourself = jobseekerProfileRecord.About_Yourself__c
    props.topSkills =
      (jobseekerProfileRecord.Top_Skills__c?.split(
        ';'
      ) as TpTechnicalSkill[]) ?? undefined
    props.state =
      jobseekerProfileRecord.Profile_Status__c as JobseekerProfileStatus

    /**
     * Job Fair Boolean Field(s)
     * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
     * Duplicate if there are multiple Job Fairs coming
     */
    // props.joins25WinterTalentSummit =
    //   jobseekerProfileRecord.ReDI_Joins_25_Winter_Talent_Summit__c

    props.isProfileVisibleToCompanies =
      jobseekerProfileRecord.Is_Visible_to_Companies__c
    props.federalState = jobseekerProfileRecord.Federal_State__c as FederalState
    props.willingToRelocate = jobseekerProfileRecord.Willing_to_Relocate__c
    //! TODO: this "as unknown as OneType | undefined" was needed to get around TS
    // errors. It's very strange that simply "as ImmigrationStatus" wasn't possible...
    // just take a look at all the casting goinn on above here. Resolve this issue,
    // and simultaneously fix the mapping in both toPersistence and fromPersistence
    // in this mappe rand the tp-jobseeker-profile.mapper.ts.
    props.immigrationStatus =
      jobseekerProfileRecord.Immigration_Status__c as unknown as
        | ImmigrationStatus
        | undefined
    props.isSubscribedToTPMarketingEmails =
      jobseekerProfileRecord.Subscribed_to_TP_Marketing_Emails__c

    props.updatedAt = jobseekerProfileRecord.LastModifiedDate
    props.createdAt = jobseekerProfileRecord.CreatedDate

    // Handling any (if any) child Lineseeker objects
    props.experience = []
    props.education = []
    if (raw.props.Jobseeker_Line_Items__r?.records?.length) {
      const records = raw.props.Jobseeker_Line_Items__r?.records
      for (let i = 0; i < records.length; i++) {
        const record = records[i]
        const baseRecord = {} as
          | TpJobseekerProfileExperienceRecordEntityProps
          | TpJobseekerProfileEducationRecordEntityProps
        baseRecord.id = record.Id
        baseRecord.sortIndex = record.Frontend_View_Index__c
        baseRecord.userId = raw.props.Id
        baseRecord.tpJobseekerProfileId = jobseekerProfileRecord.Id
        baseRecord.title = record.Title__c
        baseRecord.description = record.Description__c
        baseRecord.startDateMonth = record.Start_Date_Month__c
        baseRecord.startDateYear = record.Start_Date_Year__c
        baseRecord.endDateMonth = record.End_Date_Month__c
        baseRecord.endDateYear = record.End_Date_Year__c
        baseRecord.current = record.Current__c
        baseRecord.createdAt = record.CreatedDate
        baseRecord.updatedAt = record.LastModifiedDate
        if (record.RecordType.DeveloperName === 'Education') {
          const educationRecord =
            baseRecord as TpJobseekerProfileEducationRecordEntityProps
          educationRecord.institutionCity = record.Institution_City__c
          educationRecord.institutionCountry = record.Institution_Country__c
          educationRecord.institutionName = record.Institution_Name__c
          educationRecord.certificationType = record.Certification_Type__c
          props.education.push(educationRecord)
        } else if (record.RecordType.DeveloperName === 'Experience') {
          const experienceRecord =
            baseRecord as TpJobseekerProfileExperienceRecordEntityProps
          experienceRecord.city = record.City__c
          experienceRecord.country = record.Country__c
          experienceRecord.company = record.Company__c
          props.experience.push(experienceRecord)
        } else {
          throw new Error(
            '[TpJobseekerDirectoryEntryMapper] Unknown Jobseeker_Line_Item__c RecordType'
          )
        }
      }
    }

    // Handling any (if any) child Contact Language objects
    props.workingLanguages = []
    if (raw.props.hed__Contact_Languages__r?.records?.length) {
      const records = raw.props.hed__Contact_Languages__r?.records
      for (let i = 0; i < records.length; i++) {
        const record = records[i]
        const workingLanguage: TpJobseekerProfileLanguageRecordEntityProps = {
          id: record.Id,
          userId: raw.props.Id,
          language: record.hed__Language__r.Slug__c as Language,
          proficiencyLevelId:
            record.hed__Fluency__c as LanguageProficiencyLevel,
        }
        props.workingLanguages.push(workingLanguage)
      }
    }

    // The next ones are computed fields in Salesforce
    props.fullName = raw.props.Name

    const entity = TpJobseekerDirectoryEntryEntity.create(props)

    return entity
  }

  public toPersistence(
    source: TpJobseekerDirectoryEntryEntity
  ): TpJobseekerDirectoryEntryRecord {
    throw new NotImplementedException(
      'TpJobseekerDirectoryEntryMapper.toPersistence() not implemented'
    )
  }
}
