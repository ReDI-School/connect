// THIS FILE IS GENERATED, DO NOT EDIT!
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: any;
};

export enum CompanyTalentPoolState {
  DraftingProfile = 'DRAFTING_PROFILE',
  ProfileApproved = 'PROFILE_APPROVED',
  SubmittedForReview = 'SUBMITTED_FOR_REVIEW'
}

export type ConMenteeFavoritedMentor = {
  __typename?: 'ConMenteeFavoritedMentor';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  menteeId: Scalars['ID'];
  mentorId: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
};

export type ConMenteeFavoritedMentorCreateMutationInputDto = {
  mentorId: Scalars['String'];
};

export type ConMenteeFavoritedMentorCreateMutationOutputDto = {
  __typename?: 'ConMenteeFavoritedMentorCreateMutationOutputDto';
  ok: Scalars['Boolean'];
};

export type ConMenteeFavoritedMentorDeleteMutationInputDto = {
  mentorId: Scalars['String'];
};

export type ConMenteeFavoritedMentorDeleteMutationOutputDto = {
  __typename?: 'ConMenteeFavoritedMentorDeleteMutationOutputDto';
  ok: Scalars['Boolean'];
};

export type ConMentoringSession = {
  __typename?: 'ConMentoringSession';
  createdAt: Scalars['DateTime'];
  date: Scalars['DateTime'];
  id: Scalars['ID'];
  menteeId: Scalars['ID'];
  mentorId: Scalars['ID'];
  mentorshipMatchId: Scalars['ID'];
  minuteDuration: MentoringSessionDuration;
  updatedAt: Scalars['DateTime'];
};

export type ConMentorshipMatch = {
  __typename?: 'ConMentorshipMatch';
  applicationText?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  expectationText?: Maybe<Scalars['String']>;
  hasMenteeDismissedMentorshipApplicationAcceptedNotification?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  ifDeclinedByMentor_chosenReasonForDecline?: Maybe<Scalars['String']>;
  ifDeclinedByMentor_dateTime?: Maybe<Scalars['DateTime']>;
  ifDeclinedByMentor_ifReasonIsOther_freeText?: Maybe<Scalars['String']>;
  ifDeclinedByMentor_optionalMessageToMentee?: Maybe<Scalars['String']>;
  matchMadeActiveOn?: Maybe<Scalars['DateTime']>;
  mentee: ConProfile;
  menteeId: Scalars['String'];
  mentor: ConProfile;
  mentorId: Scalars['String'];
  mentorMessageOnComplete?: Maybe<Scalars['String']>;
  mentorReplyMessageOnAccept?: Maybe<Scalars['String']>;
  mentoringSessions: Array<ConMentoringSession>;
  status: MentorshipMatchStatus;
  updatedAt: Scalars['DateTime'];
};

export type ConMentorshipMatchesAcceptMentorshipInputDto = {
  mentorReplyMessageOnAccept: Scalars['String'];
  mentorshipMatchId: Scalars['String'];
};

export type ConMentorshipMatchesAcceptMentorshipOutputDto = {
  __typename?: 'ConMentorshipMatchesAcceptMentorshipOutputDto';
  id: Scalars['String'];
  ok: Scalars['Boolean'];
};

export type ConMentorshipMatchesApplyForMentorshipInputDto = {
  applicationText: Scalars['String'];
  expectationText: Scalars['String'];
  mentorId: Scalars['String'];
};

export type ConMentorshipMatchesApplyForMentorshipOutputDto = {
  __typename?: 'ConMentorshipMatchesApplyForMentorshipOutputDto';
  id: Scalars['String'];
  ok: Scalars['Boolean'];
};

export type ConMentorshipMatchesCompleteMentorshipInputDto = {
  mentorMessageOnComplete: Scalars['String'];
  mentorshipMatchId: Scalars['String'];
};

export type ConMentorshipMatchesCompleteMentorshipOutputDto = {
  __typename?: 'ConMentorshipMatchesCompleteMentorshipOutputDto';
  id: Scalars['String'];
  ok: Scalars['Boolean'];
};

export type ConMentorshipMatchesDeclineMentorshipInputDto = {
  ifDeclinedByMentor_chosenReasonForDecline: DeclineReason;
  ifDeclinedByMentor_ifReasonIsOther_freeText: Scalars['String'];
  ifDeclinedByMentor_optionalMessageToMentee: Scalars['String'];
  mentorshipMatchId: Scalars['String'];
};

export type ConMentorshipMatchesDeclineMentorshipOutputDto = {
  __typename?: 'ConMentorshipMatchesDeclineMentorshipOutputDto';
  id: Scalars['String'];
  ok: Scalars['Boolean'];
};

export type ConProfile = {
  __typename?: 'ConProfile';
  age?: Maybe<Scalars['Float']>;
  birthDate?: Maybe<Scalars['DateTime']>;
  categories: Array<MentoringTopic>;
  createdAt: Scalars['DateTime'];
  doesNotHaveAvailableMentorshipSlot: Scalars['Boolean'];
  email: Scalars['String'];
  expectations?: Maybe<Scalars['String']>;
  firstName: Scalars['String'];
  fullName: Scalars['String'];
  gender?: Maybe<Gender>;
  githubProfileUrl?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  isSubscribedToCONMarketingEmails: Scalars['Boolean'];
  languages?: Maybe<Array<Language>>;
  lastName: Scalars['String'];
  linkedInProfileUrl?: Maybe<Scalars['String']>;
  loopbackUserId: Scalars['String'];
  menteeCountCapacity?: Maybe<Scalars['Int']>;
  mentee_highestEducationLevel?: Maybe<EducationLevel>;
  mentee_occupationCategoryId?: Maybe<OccupationCategory>;
  mentee_occupationJob_placeOfEmployment?: Maybe<Scalars['String']>;
  mentee_occupationJob_position?: Maybe<Scalars['String']>;
  mentee_occupationLookingForJob_what?: Maybe<Scalars['String']>;
  mentee_occupationOther_description?: Maybe<Scalars['String']>;
  mentee_occupationStudent_studyName?: Maybe<Scalars['String']>;
  mentee_occupationStudent_studyPlace?: Maybe<Scalars['String']>;
  mentor_isPartnershipMentor?: Maybe<Scalars['Boolean']>;
  mentor_occupation?: Maybe<Scalars['String']>;
  mentor_workPlace?: Maybe<Scalars['String']>;
  mentoringSessions: Array<ConMentoringSession>;
  mentorshipMatches: Array<ConMentorshipMatch>;
  optOutOfMenteesFromOtherRediLocation: Scalars['Boolean'];
  personalDescription?: Maybe<Scalars['String']>;
  profileAvatarImageS3Key?: Maybe<Scalars['String']>;
  profileStatus: ConnectProfileStatus;
  rediLocation: RediLocation;
  slackUsername?: Maybe<Scalars['String']>;
  telephoneNumber?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  userActivatedAt?: Maybe<Scalars['DateTime']>;
  userId: Scalars['String'];
  userType: UserType;
};

export type ConProfileSignUpInput = {
  email: Scalars['String'];
  mentor_isPartnershipMentor?: InputMaybe<Scalars['Boolean']>;
  mentor_workPlace?: InputMaybe<Scalars['String']>;
  rediLocation: RediLocation;
  userType: UserType;
};

export enum ConnectProfileStatus {
  Approved = 'APPROVED',
  Deactivated = 'DEACTIVATED',
  DraftingProfile = 'DRAFTING_PROFILE',
  Rejected = 'REJECTED',
  SubmittedForReview = 'SUBMITTED_FOR_REVIEW'
}

export type CreateConMentoringSessionInput = {
  date: Scalars['DateTime'];
  menteeId: Scalars['ID'];
  mentorshipMatchId: Scalars['ID'];
  minuteDuration: MentoringSessionDuration;
};

export type CreateConProblemReportInput = {
  ifFromMentor_cancelMentorshipImmediately?: InputMaybe<Scalars['Boolean']>;
  problemDescription: Scalars['String'];
  reporteeProfileId: Scalars['String'];
};

export enum DeclineReason {
  AnotherMentorMoreSuitable = 'anotherMentorMoreSuitable',
  NotEnoughTimeNowToBeMentor = 'notEnoughTimeNowToBeMentor',
  NotRightExpertise = 'notRightExpertise',
  Other = 'other'
}

export enum EducationLevel {
  Apprenticeship = 'apprenticeship',
  HighSchool = 'highSchool',
  MiddleSchool = 'middleSchool',
  UniversityBachelor = 'universityBachelor',
  UniversityMaster = 'universityMaster',
  UniversityPhd = 'universityPhd'
}

export enum FederalState {
  BadenWuerttemberg = 'BADEN_WUERTTEMBERG',
  Bayern = 'BAYERN',
  Berlin = 'BERLIN',
  Brandenburg = 'BRANDENBURG',
  Bremen = 'BREMEN',
  Hamburg = 'HAMBURG',
  Hessen = 'HESSEN',
  MecklenburgVorpommern = 'MECKLENBURG_VORPOMMERN',
  Niedersachsen = 'NIEDERSACHSEN',
  NordrheinWestfalen = 'NORDRHEIN_WESTFALEN',
  OutsideGermany = 'OUTSIDE_GERMANY',
  RheinlandPfalz = 'RHEINLAND_PFALZ',
  Saarland = 'SAARLAND',
  Sachsen = 'SACHSEN',
  SachsenAnhalt = 'SACHSEN_ANHALT',
  SchleswigHolstein = 'SCHLESWIG_HOLSTEIN',
  Thueringen = 'THUERINGEN'
}

export type FindAllVisibleTpJobListingsArgsFilter = {
  datePosted?: InputMaybe<Scalars['String']>;
  employmentTypes?: InputMaybe<Array<TpEmploymentType>>;
  federalStates?: InputMaybe<Array<FederalState>>;
  isRemotePossible?: InputMaybe<Scalars['Boolean']>;
  relatesToPositions?: InputMaybe<Array<TpDesiredPosition>>;
  skills?: InputMaybe<Array<TpTechnicalSkill>>;
};

export type FindAllVisibleTpJobseekerDirectoryEntriesFilter = {
  desiredLanguages?: InputMaybe<Array<Language>>;
  desiredPositions?: InputMaybe<Array<TpDesiredPosition>>;
  employmentTypes?: InputMaybe<Array<TpEmploymentType>>;
  federalStates?: InputMaybe<Array<FederalState>>;
  name?: InputMaybe<Scalars['String']>;
  skills?: InputMaybe<Array<TpTechnicalSkill>>;
};

export type FindConProfilesArgsFilter = {
  categories?: InputMaybe<Array<MentoringTopic>>;
  languages?: InputMaybe<Array<Language>>;
  locations?: InputMaybe<Array<RediLocation>>;
  name?: InputMaybe<Scalars['String']>;
};

export type FindMentorshipMatchesArgsFilter = {
  status?: InputMaybe<MentorshipMatchStatus>;
};

export type FindOneTpJobListingArgsFilter = {
  id: Scalars['ID'];
};

export type FindOneVisibleTpJobseekerDirectoryEntry = {
  tpJobseekerProfileId: Scalars['ID'];
};

export enum FirstPointOfTpContactOption {
  AlreadyVolunteerAtRedi = 'ALREADY_VOLUNTEER_AT_REDI',
  Collegue = 'COLLEGUE',
  InternetSearch = 'INTERNET_SEARCH',
  Other = 'OTHER',
  RediStudentAlumni = 'REDI_STUDENT_ALUMNI',
  RediTeamMember = 'REDI_TEAM_MEMBER',
  RediWebsite = 'REDI_WEBSITE',
  SocialMedia = 'SOCIAL_MEDIA'
}

export enum Gender {
  Female = 'Female',
  Male = 'Male',
  Other = 'Other'
}

export enum ImmigrationStatus {
  EuBlueCardBlaueKarte = 'euBlueCardBlaueKarte',
  EuCitizenshipOrUnlimitedResidencePermissionNiederlassungserlaubnis = 'euCitizenshipOrUnlimitedResidencePermissionNiederlassungserlaubnis',
  SchengenVisa = 'schengenVisa',
  StudentVisa = 'studentVisa',
  TemporaryResidencePermissionAufenthaltstitel = 'temporaryResidencePermissionAufenthaltstitel',
  VisaNationalvisumOrJobseekerVisum = 'visaNationalvisumOrJobseekerVisum'
}

export enum JobseekerProfileStatus {
  DraftingProfile = 'DRAFTING_PROFILE',
  ProfileApproved = 'PROFILE_APPROVED',
  SubmittedForReview = 'SUBMITTED_FOR_REVIEW'
}

export enum Language {
  Afrikaans = 'Afrikaans',
  Albanian = 'Albanian',
  Amharic = 'Amharic',
  Arabic = 'Arabic',
  Aramaic = 'Aramaic',
  Armenian = 'Armenian',
  Assamese = 'Assamese',
  Aymara = 'Aymara',
  Azerbaijani = 'Azerbaijani',
  Balochi = 'Balochi',
  Bamanankan = 'Bamanankan',
  BashkortBashkir = 'BashkortBashkir',
  Basque = 'Basque',
  Belarusan = 'Belarusan',
  Bengali = 'Bengali',
  Bhojpuri = 'Bhojpuri',
  Bislama = 'Bislama',
  Bosnian = 'Bosnian',
  Brahui = 'Brahui',
  Bulgarian = 'Bulgarian',
  Burmese = 'Burmese',
  Cantonese = 'Cantonese',
  Catalan = 'Catalan',
  Cebuano = 'Cebuano',
  Chechen = 'Chechen',
  Cherokee = 'Cherokee',
  Croatian = 'Croatian',
  Czech = 'Czech',
  Dakota = 'Dakota',
  Danish = 'Danish',
  Dari = 'Dari',
  Dholuo = 'Dholuo',
  Dutch = 'Dutch',
  English = 'English',
  Esperanto = 'Esperanto',
  Estonian = 'Estonian',
  Ewe = 'Ewe',
  Finnish = 'Finnish',
  French = 'French',
  Georgian = 'Georgian',
  German = 'German',
  Gikuyu = 'Gikuyu',
  Greek = 'Greek',
  Guarani = 'Guarani',
  Gujarati = 'Gujarati',
  HaitianCreole = 'HaitianCreole',
  Hausa = 'Hausa',
  Hawaiian = 'Hawaiian',
  HawaiianCreole = 'HawaiianCreole',
  Hebrew = 'Hebrew',
  Hiligaynon = 'Hiligaynon',
  Hindi = 'Hindi',
  Hungarian = 'Hungarian',
  Icelandic = 'Icelandic',
  Igbo = 'Igbo',
  Ilocano = 'Ilocano',
  IndonesianBahasaIndonesia = 'IndonesianBahasaIndonesia',
  InuitInupiaq = 'InuitInupiaq',
  IrishGaelic = 'IrishGaelic',
  Italian = 'Italian',
  Japanese = 'Japanese',
  Jarai = 'Jarai',
  Javanese = 'Javanese',
  Kabyle = 'Kabyle',
  Kannada = 'Kannada',
  Kashmiri = 'Kashmiri',
  Kazakh = 'Kazakh',
  Khmer = 'Khmer',
  Khoekhoe = 'Khoekhoe',
  Kiche = 'Kiche',
  Korean = 'Korean',
  Kurdish = 'Kurdish',
  Kyrgyz = 'Kyrgyz',
  Lao = 'Lao',
  Latin = 'Latin',
  Latvian = 'Latvian',
  Lingala = 'Lingala',
  Lithuanian = 'Lithuanian',
  Macedonian = 'Macedonian',
  Maithili = 'Maithili',
  Malagasy = 'Malagasy',
  MalayBahasaMelayu = 'MalayBahasaMelayu',
  Malayalam = 'Malayalam',
  MandarinChinese = 'MandarinChinese',
  Marathi = 'Marathi',
  Mende = 'Mende',
  Mongolian = 'Mongolian',
  Nahuatl = 'Nahuatl',
  Navajo = 'Navajo',
  Nepali = 'Nepali',
  Norwegian = 'Norwegian',
  Ojibwa = 'Ojibwa',
  Oriya = 'Oriya',
  Oromo = 'Oromo',
  Pashto = 'Pashto',
  Persian = 'Persian',
  Polish = 'Polish',
  Portuguese = 'Portuguese',
  Punjabi = 'Punjabi',
  Quechua = 'Quechua',
  Romani = 'Romani',
  Romanian = 'Romanian',
  Russian = 'Russian',
  Rwanda = 'Rwanda',
  Samoan = 'Samoan',
  Sanskrit = 'Sanskrit',
  Serbian = 'Serbian',
  Shona = 'Shona',
  Sindhi = 'Sindhi',
  Sinhala = 'Sinhala',
  Slovak = 'Slovak',
  Slovene = 'Slovene',
  Somali = 'Somali',
  Spanish = 'Spanish',
  Swahili = 'Swahili',
  Swedish = 'Swedish',
  Tachelhit = 'Tachelhit',
  Tagalog = 'Tagalog',
  Tajiki = 'Tajiki',
  Tamil = 'Tamil',
  Tatar = 'Tatar',
  Telugu = 'Telugu',
  Thai = 'Thai',
  TibeticLanguages = 'TibeticLanguages',
  Tigrigna = 'Tigrigna',
  TokPisin = 'TokPisin',
  Turkish = 'Turkish',
  Turkmen = 'Turkmen',
  Ukrainian = 'Ukrainian',
  Urdu = 'Urdu',
  Uyghur = 'Uyghur',
  Uzbek = 'Uzbek',
  Vietnamese = 'Vietnamese',
  Warlpiri = 'Warlpiri',
  Welsh = 'Welsh',
  Wolof = 'Wolof',
  Xhosa = 'Xhosa',
  Yakut = 'Yakut',
  Yiddish = 'Yiddish',
  Yoruba = 'Yoruba',
  Yucatec = 'Yucatec',
  Zapotec = 'Zapotec',
  Zulu = 'Zulu'
}

export enum LanguageProficiencyLevel {
  ElementaryProficiency = 'elementaryProficiency',
  FullWorkingProficiency = 'fullWorkingProficiency',
  LimitedWorkingProficiency = 'limitedWorkingProficiency',
  NativeOrBilingualProficiency = 'nativeOrBilingualProficiency'
}

export enum MentoringSessionDuration {
  Min15 = 'MIN15',
  Min30 = 'MIN30',
  Min45 = 'MIN45',
  Min60 = 'MIN60',
  Min75 = 'MIN75',
  Min90 = 'MIN90',
  Min105 = 'MIN105',
  Min120 = 'MIN120',
  Min135 = 'MIN135',
  Min150 = 'MIN150',
  Min165 = 'MIN165',
  Min180 = 'MIN180'
}

export enum MentoringTopic {
  BasicGerman = 'basicGerman',
  BasicProgrammingSkills = 'basicProgrammingSkills',
  Blockchain = 'blockchain',
  BuildingProfessionalNetwork = 'buildingProfessionalNetwork',
  BusinessDevelopment = 'businessDevelopment',
  BusinessGerman = 'businessGerman',
  CareerOrientationAndPlanning = 'careerOrientationAndPlanning',
  CodingChallengePreparation = 'codingChallengePreparation',
  ComputerNetworking = 'computerNetworking',
  Cybersecurity = 'cybersecurity',
  DataAnalytics = 'dataAnalytics',
  DevOpsCloud = 'devOpsCloud',
  DigitalMarketing = 'digitalMarketing',
  DontKnowYet = 'dontKnowYet',
  English = 'english',
  Entrepreneurship = 'entrepreneurship',
  Freelancing = 'freelancing',
  FriendAndHelp = 'friendAndHelp',
  GraphicDesign = 'graphicDesign',
  HtmlCss = 'htmlCss',
  InternshipOrWorkingStudent = 'internshipOrWorkingStudent',
  InterviewPreparation = 'interviewPreparation',
  Iot = 'iot',
  Java = 'java',
  Javascript = 'javascript',
  JobApplicationsCvPreparationEnglish = 'jobApplicationsCvPreparationEnglish',
  JobApplicationsCvPreparationGerman = 'jobApplicationsCvPreparationGerman',
  JobSearch = 'jobSearch',
  MachineLearning = 'machineLearning',
  MobileDevelopmentAndroid = 'mobileDevelopmentAndroid',
  MobileDevelopmentIos = 'mobileDevelopmentIos',
  MotivationAndEncouragement = 'motivationAndEncouragement',
  ProductManagement = 'productManagement',
  ProjectManagement = 'projectManagement',
  Python = 'python',
  QualityAssurance = 'qualityAssurance',
  React = 'react',
  Sales = 'sales',
  Salesforce = 'salesforce',
  Swedish = 'swedish',
  UserExperienceDesign = 'userExperienceDesign',
  UserInterfaceDesign = 'userInterfaceDesign'
}

export enum MentorshipMatchStatus {
  Accepted = 'ACCEPTED',
  Applied = 'APPLIED',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  DeclinedByMentor = 'DECLINED_BY_MENTOR',
  InvalidatedAsOtherMentorAccepted = 'INVALIDATED_AS_OTHER_MENTOR_ACCEPTED'
}

export type Mutation = {
  __typename?: 'Mutation';
  conMatchMarkMentorshipAcceptedNotificationDismissed: OkResponseMutationOutputDto;
  conMenteeFavoritedMentorCreate: ConMenteeFavoritedMentorCreateMutationOutputDto;
  conMenteeFavoritedMentorDelete: ConMenteeFavoritedMentorDeleteMutationOutputDto;
  conMentorshipMatchesAcceptMentorship: ConMentorshipMatchesAcceptMentorshipOutputDto;
  conMentorshipMatchesApplyForMentorship: ConMentorshipMatchesApplyForMentorshipOutputDto;
  conMentorshipMatchesCompleteMentorship: ConMentorshipMatchesCompleteMentorshipOutputDto;
  conMentorshipMatchesDeclineMentorship: ConMentorshipMatchesDeclineMentorshipOutputDto;
  conProblemReportCreate: OkResponseMutationOutputDto;
  conProfileSignUp: OkIdResponseMutationOutputDto;
  conProfileSubmitForReview: ConProfile;
  createConMentoringSession: ConMentoringSession;
  patchConProfile: ConProfile;
  tpCompanyFavoritedJobseekerProfileCreate: TpCompanyFavoritedJobseekerProfileCreateMutationOutputDto;
  tpCompanyFavoritedJobseekerProfileDelete: TpCompanyFavoritedJobseekerProfileDeleteMutationOutputDto;
  tpCompanyProfilePatch: OkResponseMutationOutputDto;
  tpCompanyProfileSignUp: TpCompanyProfileSignUpInputOutputDto;
  tpJobListingCreate: OkResponseMutationOutputDto;
  tpJobListingDelete: OkResponseMutationOutputDto;
  tpJobListingPatch: OkResponseMutationOutputDto;
  tpJobseekerCreateFromCurrentUserJobseekerProfile: OkIdResponseMutationOutputDto;
  tpJobseekerCvCreate: OkIdResponseMutationOutputDto;
  tpJobseekerCvDelete: OkResponseMutationOutputDto;
  tpJobseekerCvEducationRecordCreate: OkResponseMutationOutputDto;
  tpJobseekerCvEducationRecordDelete: OkResponseMutationOutputDto;
  tpJobseekerCvEducationRecordPatch: OkResponseMutationOutputDto;
  tpJobseekerCvExperienceRecordCreate: OkResponseMutationOutputDto;
  tpJobseekerCvExperienceRecordDelete: OkResponseMutationOutputDto;
  tpJobseekerCvExperienceRecordPatch: OkResponseMutationOutputDto;
  tpJobseekerCvLanguageRecordCreate: OkResponseMutationOutputDto;
  tpJobseekerCvLanguageRecordDelete: OkResponseMutationOutputDto;
  tpJobseekerCvLanguageRecordPatch: OkResponseMutationOutputDto;
  tpJobseekerCvPatch: OkResponseMutationOutputDto;
  tpJobseekerFavoritedJobListingCreate: TpJobseekerFavoritedJobListingCreateMutationOutputDto;
  tpJobseekerFavoritedJobListingDelete: TpJobseekerFavoritedJobListingDeleteMutationOutputDto;
  tpJobseekerProfileEducationRecordCreate: OkResponseMutationOutputDto;
  tpJobseekerProfileEducationRecordDelete: OkResponseMutationOutputDto;
  tpJobseekerProfileEducationRecordPatch: OkResponseMutationOutputDto;
  tpJobseekerProfileExperienceRecordCreate: OkResponseMutationOutputDto;
  tpJobseekerProfileExperienceRecordDelete: OkResponseMutationOutputDto;
  tpJobseekerProfileExperienceRecordPatch: OkResponseMutationOutputDto;
  tpJobseekerProfileLanguageRecordCreate: OkResponseMutationOutputDto;
  tpJobseekerProfileLanguageRecordDelete: OkResponseMutationOutputDto;
  tpJobseekerProfileLanguageRecordPatch: OkResponseMutationOutputDto;
  tpJobseekerProfilePatch: OkResponseMutationOutputDto;
  tpJobseekerProfileSignUp: OkResponseMutationOutputDto;
  userContactPatch: OkResponseMutationOutputDto;
};


export type MutationConMatchMarkMentorshipAcceptedNotificationDismissedArgs = {
  conMentorshipMatchId: Scalars['String'];
};


export type MutationConMenteeFavoritedMentorCreateArgs = {
  input: ConMenteeFavoritedMentorCreateMutationInputDto;
};


export type MutationConMenteeFavoritedMentorDeleteArgs = {
  input: ConMenteeFavoritedMentorDeleteMutationInputDto;
};


export type MutationConMentorshipMatchesAcceptMentorshipArgs = {
  input: ConMentorshipMatchesAcceptMentorshipInputDto;
};


export type MutationConMentorshipMatchesApplyForMentorshipArgs = {
  input: ConMentorshipMatchesApplyForMentorshipInputDto;
};


export type MutationConMentorshipMatchesCompleteMentorshipArgs = {
  input: ConMentorshipMatchesCompleteMentorshipInputDto;
};


export type MutationConMentorshipMatchesDeclineMentorshipArgs = {
  input: ConMentorshipMatchesDeclineMentorshipInputDto;
};


export type MutationConProblemReportCreateArgs = {
  input: CreateConProblemReportInput;
};


export type MutationConProfileSignUpArgs = {
  input: ConProfileSignUpInput;
};


export type MutationCreateConMentoringSessionArgs = {
  createConMentoringSessionInput: CreateConMentoringSessionInput;
};


export type MutationPatchConProfileArgs = {
  patchConProfileInput: UpdateConProfileInput;
};


export type MutationTpCompanyFavoritedJobseekerProfileCreateArgs = {
  input: TpCompanyFavoritedJobseekerProfileCreateMutationInputDto;
};


export type MutationTpCompanyFavoritedJobseekerProfileDeleteArgs = {
  input: TpCompanyFavoritedJobseekerProfileDeleteMutationInputDto;
};


export type MutationTpCompanyProfilePatchArgs = {
  tpCompanyProfilePatchInput: TpCompanyProfilePatchInput;
};


export type MutationTpCompanyProfileSignUpArgs = {
  input: TpCompanyProfileSignUpInputDto;
};


export type MutationTpJobListingCreateArgs = {
  tpJobListingCreateInput: TpJobListingCreateInput;
};


export type MutationTpJobListingDeleteArgs = {
  tpJobListingDeleteInput: TpJobListingDeleteInput;
};


export type MutationTpJobListingPatchArgs = {
  tpJobListingPatchInput: TpJobListingPatchInput;
};


export type MutationTpJobseekerCreateFromCurrentUserJobseekerProfileArgs = {
  input: TpJobseekerCvCreateFromCurrentUserJobseekerProfileInput;
};


export type MutationTpJobseekerCvCreateArgs = {
  tpJobseekerCvCreateInput: TpJobseekerCvCreateInput;
};


export type MutationTpJobseekerCvDeleteArgs = {
  tpJobseekerCvDeleteInput: TpJobseekerCvDeleteInput;
};


export type MutationTpJobseekerCvEducationRecordCreateArgs = {
  tpJobseekerCvEducationRecordCreateInput: TpJobseekerCvEducationRecordCreateInput;
};


export type MutationTpJobseekerCvEducationRecordDeleteArgs = {
  tpJobseekerCvEducationRecordDeleteInput: TpJobseekerCvEducationRecordDeleteInput;
};


export type MutationTpJobseekerCvEducationRecordPatchArgs = {
  tpJobseekerCvEducationRecordPatchInput: TpJobseekerCvEducationRecordPatchInput;
};


export type MutationTpJobseekerCvExperienceRecordCreateArgs = {
  tpJobseekerCvExperienceRecordCreateInput: TpJobseekerCvExperienceRecordCreateInput;
};


export type MutationTpJobseekerCvExperienceRecordDeleteArgs = {
  tpJobseekerCvExperienceRecordDeleteInput: TpJobseekerCvExperienceRecordDeleteInput;
};


export type MutationTpJobseekerCvExperienceRecordPatchArgs = {
  tpJobseekerCvExperienceRecordPatchInput: TpJobseekerCvExperienceRecordPatchInput;
};


export type MutationTpJobseekerCvLanguageRecordCreateArgs = {
  tpJobseekerCvLanguageRecordCreateInput: TpJobseekerCvLanguageRecordCreateInput;
};


export type MutationTpJobseekerCvLanguageRecordDeleteArgs = {
  tpJobseekerCvLanguageRecordDeleteInput: TpJobseekerCvLanguageRecordDeleteInput;
};


export type MutationTpJobseekerCvLanguageRecordPatchArgs = {
  tpJobseekerCvLanguageRecordPatchInput: TpJobseekerCvLanguageRecordPatchInput;
};


export type MutationTpJobseekerCvPatchArgs = {
  tpJobseekerCvPatchInput: TpJobseekerCvPatchInput;
};


export type MutationTpJobseekerFavoritedJobListingCreateArgs = {
  input: TpJobseekerFavoritedJobListingCreateMutationInputDto;
};


export type MutationTpJobseekerFavoritedJobListingDeleteArgs = {
  input: TpJobseekerFavoritedJobListingDeleteMutationInputDto;
};


export type MutationTpJobseekerProfileEducationRecordCreateArgs = {
  tpJobseekerProfileEducationRecordCreateInput: TpJobseekerProfileEducationRecordCreateInput;
};


export type MutationTpJobseekerProfileEducationRecordDeleteArgs = {
  tpJobseekerProfileEducationRecordDeleteInput: TpJobseekerProfileEducationRecordDeleteInput;
};


export type MutationTpJobseekerProfileEducationRecordPatchArgs = {
  tpJobseekerProfileEducationRecordPatchInput: TpJobseekerProfileEducationRecordPatchInput;
};


export type MutationTpJobseekerProfileExperienceRecordCreateArgs = {
  tpJobseekerProfileExperienceRecordCreateInput: TpJobseekerProfileExperienceRecordCreateInput;
};


export type MutationTpJobseekerProfileExperienceRecordDeleteArgs = {
  tpJobseekerProfileExperienceRecordDeleteInput: TpJobseekerProfileExperienceRecordDeleteInput;
};


export type MutationTpJobseekerProfileExperienceRecordPatchArgs = {
  tpJobseekerProfileExperienceRecordPatchInput: TpJobseekerProfileExperienceRecordPatchInput;
};


export type MutationTpJobseekerProfileLanguageRecordCreateArgs = {
  tpJobseekerProfileLanguageRecordCreateInput: TpJobseekerProfileLanguageRecordCreateInput;
};


export type MutationTpJobseekerProfileLanguageRecordDeleteArgs = {
  tpJobseekerProfileLanguageRecordDeleteInput: TpJobseekerProfileLanguageRecordDeleteInput;
};


export type MutationTpJobseekerProfileLanguageRecordPatchArgs = {
  tpJobseekerProfileLanguageRecordPatchInput: TpJobseekerProfileLanguageRecordPatchInput;
};


export type MutationTpJobseekerProfilePatchArgs = {
  tpJobseekerProfilePatchInput: TpJobseekerProfilePatchInput;
};


export type MutationTpJobseekerProfileSignUpArgs = {
  input: TpJobseekerProfileSignUpDto;
};


export type MutationUserContactPatchArgs = {
  userContactPatchInput: UserContactPatchInput;
};

export enum OccupationCategory {
  Job = 'job',
  LookingForJob = 'lookingForJob',
  Other = 'other',
  Student = 'student'
}

export type OkIdResponseMutationOutputDto = {
  __typename?: 'OkIdResponseMutationOutputDto';
  id: Scalars['String'];
  ok: Scalars['Boolean'];
};

export type OkResponseMutationOutputDto = {
  __typename?: 'OkResponseMutationOutputDto';
  ok: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
  conMenteeFavoritedMentors: Array<ConMenteeFavoritedMentor>;
  conMentorshipMatch: ConMentorshipMatch;
  conMentorshipMatches: Array<ConMentorshipMatch>;
  conProfile: ConProfile;
  conProfilesAvailableMentors: Array<ConProfile>;
  myConProfile: ConProfile;
  publicTpCompanyProfiles: Array<TpCompanyProfile>;
  tpCompanyFavoritedJobseekerProfiles: Array<TpCompanyFavoritedJobseekerProfile>;
  tpCompanyProfile: TpCompanyProfile;
  tpCompanyProfiles: Array<TpCompanyProfile>;
  tpCurrentUserDataGet: TpCurrentUserData;
  tpJobListing: TpJobListing;
  tpJobListings: Array<TpJobListing>;
  tpJobseekerCv: TpJobseekerCv;
  tpJobseekerCvEducationRecords: Array<TpJobseekerCvEducationRecord>;
  tpJobseekerCvExperienceRecords: Array<TpJobseekerCvExperienceRecord>;
  tpJobseekerCvLanguageRecords: Array<TpJobseekerCvLanguageRecord>;
  tpJobseekerCvs: Array<TpJobseekerCv>;
  tpJobseekerDirectoryEntriesVisible: Array<TpJobseekerDirectoryEntry>;
  tpJobseekerDirectoryEntryVisible: TpJobseekerDirectoryEntry;
  tpJobseekerFavoritedJobListings: Array<TpJobseekerFavoritedJobListing>;
  tpJobseekerProfile: TpJobseekerProfile;
  tpJobseekerProfileEducationRecords: Array<TpJobseekerProfileEducationRecord>;
  tpJobseekerProfileExperienceRecords: Array<TpJobseekerProfileExperienceRecord>;
  tpJobseekerProfileLanguageRecords: Array<TpJobseekerProfileLanguageRecord>;
};


export type QueryConMentorshipMatchArgs = {
  id: Scalars['ID'];
};


export type QueryConMentorshipMatchesArgs = {
  filter?: InputMaybe<FindMentorshipMatchesArgsFilter>;
};


export type QueryConProfileArgs = {
  id?: InputMaybe<Scalars['ID']>;
  loopbackUserId?: InputMaybe<Scalars['ID']>;
};


export type QueryConProfilesAvailableMentorsArgs = {
  filter: FindConProfilesArgsFilter;
};


export type QueryTpCompanyProfileArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryTpJobListingArgs = {
  filter: FindOneTpJobListingArgsFilter;
};


export type QueryTpJobListingsArgs = {
  filter: FindAllVisibleTpJobListingsArgsFilter;
};


export type QueryTpJobseekerCvArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryTpJobseekerCvEducationRecordsArgs = {
  tpJobseekerCvId?: InputMaybe<Scalars['ID']>;
};


export type QueryTpJobseekerCvExperienceRecordsArgs = {
  tpJobseekerCvId?: InputMaybe<Scalars['ID']>;
};


export type QueryTpJobseekerCvLanguageRecordsArgs = {
  tpJobseekerCvId?: InputMaybe<Scalars['ID']>;
};


export type QueryTpJobseekerDirectoryEntriesVisibleArgs = {
  filter: FindAllVisibleTpJobseekerDirectoryEntriesFilter;
};


export type QueryTpJobseekerDirectoryEntryVisibleArgs = {
  filter: FindOneVisibleTpJobseekerDirectoryEntry;
};


export type QueryTpJobseekerProfileArgs = {
  id?: InputMaybe<Scalars['ID']>;
};

export enum RediLocation {
  Berlin = 'BERLIN',
  Cyberspace = 'CYBERSPACE',
  Hamburg = 'HAMBURG',
  Malmo = 'MALMO',
  Munich = 'MUNICH',
  Nrw = 'NRW'
}

export enum TpAvailabilityOption {
  Date = 'date',
  Immediately = 'immediately',
  OneMonthNotice = 'oneMonthNotice',
  ThreeMonthNotice = 'threeMonthNotice',
  TwoMonthNotice = 'twoMonthNotice'
}

export type TpCompanyFavoritedJobseekerProfile = {
  __typename?: 'TpCompanyFavoritedJobseekerProfile';
  createdAt: Scalars['DateTime'];
  favoritedTpJobseekerProfileId: Scalars['ID'];
  id: Scalars['ID'];
  tpCompanyProfileId: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
};

export type TpCompanyFavoritedJobseekerProfileCreateMutationInputDto = {
  tpJobseekerProfileId: Scalars['String'];
};

export type TpCompanyFavoritedJobseekerProfileCreateMutationOutputDto = {
  __typename?: 'TpCompanyFavoritedJobseekerProfileCreateMutationOutputDto';
  ok: Scalars['Boolean'];
};

export type TpCompanyFavoritedJobseekerProfileDeleteMutationInputDto = {
  tpJobseekerProfileId: Scalars['String'];
};

export type TpCompanyFavoritedJobseekerProfileDeleteMutationOutputDto = {
  __typename?: 'TpCompanyFavoritedJobseekerProfileDeleteMutationOutputDto';
  ok: Scalars['Boolean'];
};

export type TpCompanyProfile = {
  __typename?: 'TpCompanyProfile';
  about?: Maybe<Scalars['String']>;
  companyName: Scalars['String'];
  companyRepresentatives: Array<UserContact>;
  /**
   * Job Fair Boolean Field(s)
   * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
   * Duplicate if there are multiple Job Fairs coming
   */
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  industry?: Maybe<Scalars['String']>;
  isCareerPartner: Scalars['Boolean'];
  isProfileVisibleToJobseekers: Scalars['Boolean'];
  linkedInUrl?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
  profileAvatarImageS3Key?: Maybe<Scalars['String']>;
  state: CompanyTalentPoolState;
  tagline?: Maybe<Scalars['String']>;
  telephoneNumber?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  website?: Maybe<Scalars['String']>;
};

export type TpCompanyProfilePatchInput = {
  about?: InputMaybe<Scalars['String']>;
  companyName?: InputMaybe<Scalars['String']>;
  industry?: InputMaybe<Scalars['String']>;
  isProfileVisibleToJobseekers?: InputMaybe<Scalars['Boolean']>;
  linkedInUrl?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<Scalars['String']>;
  profileAvatarImageS3Key?: InputMaybe<Scalars['String']>;
  state?: InputMaybe<CompanyTalentPoolState>;
  tagline?: InputMaybe<Scalars['String']>;
  telephoneNumber?: InputMaybe<Scalars['String']>;
  website?: InputMaybe<Scalars['String']>;
};

export type TpCompanyProfileSignUpInputDto = {
  companyIdOrName: Scalars['String'];
  firstPointOfContact: FirstPointOfTpContactOption;
  firstPointOfContactOther?: InputMaybe<Scalars['String']>;
  isMicrosoftPartner: Scalars['Boolean'];
  operationType: TpCompanyProfileSignUpOperationType;
};

export type TpCompanyProfileSignUpInputOutputDto = {
  __typename?: 'TpCompanyProfileSignUpInputOutputDto';
  ok: Scalars['Boolean'];
};

export enum TpCompanyProfileSignUpOperationType {
  ExistingCompany = 'EXISTING_COMPANY',
  NewCompany = 'NEW_COMPANY'
}

export type TpCompanyRepresentativeRelationship = {
  __typename?: 'TpCompanyRepresentativeRelationship';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  status: TpCompanyRepresentativeRelationshipStatus;
  tpCompanyProfileId: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  userId: Scalars['String'];
};

export enum TpCompanyRepresentativeRelationshipStatus {
  Approved = 'APPROVED',
  Deactivated = 'DEACTIVATED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type TpCurrentUserData = {
  __typename?: 'TpCurrentUserData';
  companyRepresentativeRelationship?: Maybe<TpCompanyRepresentativeRelationship>;
  jobListings?: Maybe<Array<TpJobListing>>;
  representedCompany?: Maybe<TpCompanyProfile>;
  tpJobseekerDirectoryEntry?: Maybe<TpJobseekerDirectoryEntry>;
  userContact: UserContact;
};

export enum TpDesiredPosition {
  AdministrativeAssistant = 'administrativeAssistant',
  AgileScrumCoach = 'agileScrumCoach',
  AzureSpecialist = 'azureSpecialist',
  BackendDeveloper = 'backendDeveloper',
  BlockchainDeveloper = 'blockchainDeveloper',
  BusinessAnalyst = 'businessAnalyst',
  CloudEngineer = 'cloudEngineer',
  CloudSpecialist = 'cloudSpecialist',
  DataAnalyst = 'dataAnalyst',
  DataScientist = 'dataScientist',
  DevOpsSpecialist = 'devOpsSpecialist',
  DigitalMarketer = 'digitalMarketer',
  EmbeddedSystemsEngineer = 'embeddedSystemsEngineer',
  FrontendDeveloper = 'frontendDeveloper',
  FullstackDeveloper = 'fullstackDeveloper',
  HardwareDeveloper = 'hardwareDeveloper',
  IotDeveloper = 'iotDeveloper',
  ItAdministrator = 'itAdministrator',
  ItSpecialist = 'itSpecialist',
  ItSupportTechnician = 'itSupportTechnician',
  JavaDeveloper = 'javaDeveloper',
  LinuxSystemAdministrator = 'linuxSystemAdministrator',
  MarketingAssistant = 'marketingAssistant',
  MobileDeveloperAndroid = 'mobileDeveloperAndroid',
  MobileDeveloperIos = 'mobileDeveloperIos',
  NodeJsDeveloper = 'nodeJsDeveloper',
  OperationsManager = 'operationsManager',
  ProductDesigner = 'productDesigner',
  ProductManager = 'productManager',
  ProjectAssistant = 'projectAssistant',
  ProjectManager = 'projectManager',
  PythonDeveloper = 'pythonDeveloper',
  QaEngineer = 'qaEngineer',
  ReactDeveloper = 'reactDeveloper',
  RequirementsEngineer = 'requirementsEngineer',
  SalesManager = 'salesManager',
  SalesforceAdministrator = 'salesforceAdministrator',
  SecurityAdministrator = 'securityAdministrator',
  SeoManager = 'seoManager',
  SystemEngineer = 'systemEngineer',
  TechnicalArchitect = 'technicalArchitect',
  UiDesigner = 'uiDesigner',
  UiDeveloper = 'uiDeveloper',
  UiUxDesigner = 'uiUxDesigner',
  Usabilityengineer = 'usabilityengineer',
  UserResearcher = 'userResearcher',
  UxDesigner = 'uxDesigner'
}

export enum TpEducationCertificationType {
  ConfirmationOfAttendance = 'confirmationOfAttendance',
  Other = 'other',
  ProfessionalCertification = 'professionalCertification',
  RediSchoolCourse = 'rediSchoolCourse',
  UniversityDegreeDiploma = 'universityDegreeDiploma'
}

export enum TpEmploymentType {
  Internship = 'Internship',
  ApprenticeshipAusbildung = 'apprenticeshipAusbildung',
  Contract = 'contract',
  DualStudyBachelor = 'dualStudyBachelor',
  DualStudyMaster = 'dualStudyMaster',
  Freelance = 'freelance',
  FullTime = 'fullTime',
  PartTime = 'partTime',
  ProjectBased = 'projectBased',
  Traineeship = 'traineeship',
  Werkstudium = 'werkstudium'
}

export type TpJobListing = {
  __typename?: 'TpJobListing';
  companyName: Scalars['String'];
  companyProfile: TpCompanyProfile;
  companyProfileId: Scalars['ID'];
  contactEmailAddress?: Maybe<Scalars['String']>;
  contactFirstName?: Maybe<Scalars['String']>;
  contactLastName?: Maybe<Scalars['String']>;
  contactPhoneNumber?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  employmentType?: Maybe<TpEmploymentType>;
  expiresAt?: Maybe<Scalars['DateTime']>;
  federalState?: Maybe<FederalState>;
  id: Scalars['ID'];
  idealTechnicalSkills?: Maybe<Array<TpTechnicalSkill>>;
  isFromCareerPartner: Scalars['Boolean'];
  isRemotePossible?: Maybe<Scalars['Boolean']>;
  languageRequirements?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
  profileAvatarImageS3Key?: Maybe<Scalars['String']>;
  relatesToPositions?: Maybe<Array<TpDesiredPosition>>;
  salaryRange?: Maybe<Scalars['String']>;
  status?: Maybe<TpJobListingStatus>;
  summary?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};

export type TpJobListingCreateInput = {
  contactEmailAddress?: InputMaybe<Scalars['String']>;
  contactFirstName?: InputMaybe<Scalars['String']>;
  contactLastName?: InputMaybe<Scalars['String']>;
  contactPhoneNumber?: InputMaybe<Scalars['String']>;
  employmentType?: InputMaybe<TpEmploymentType>;
  federalState?: InputMaybe<FederalState>;
  idealTechnicalSkills?: InputMaybe<Array<TpTechnicalSkill>>;
  isRemotePossible?: InputMaybe<Scalars['Boolean']>;
  languageRequirements?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<Scalars['String']>;
  relatesToPositions?: InputMaybe<Array<TpDesiredPosition>>;
  salaryRange?: InputMaybe<Scalars['String']>;
  summary?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
};

export type TpJobListingDeleteInput = {
  id: Scalars['ID'];
};

export type TpJobListingPatchInput = {
  contactEmailAddress?: InputMaybe<Scalars['String']>;
  contactFirstName?: InputMaybe<Scalars['String']>;
  contactLastName?: InputMaybe<Scalars['String']>;
  contactPhoneNumber?: InputMaybe<Scalars['String']>;
  employmentType?: InputMaybe<TpEmploymentType>;
  expiresAt?: InputMaybe<Scalars['DateTime']>;
  federalState?: InputMaybe<FederalState>;
  id: Scalars['ID'];
  idealTechnicalSkills?: InputMaybe<Array<TpTechnicalSkill>>;
  isRemotePossible?: InputMaybe<Scalars['Boolean']>;
  languageRequirements?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<Scalars['String']>;
  relatesToPositions?: InputMaybe<Array<TpDesiredPosition>>;
  salaryRange?: InputMaybe<Scalars['String']>;
  summary?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
};

export enum TpJobListingStatus {
  Active = 'ACTIVE',
  Expired = 'EXPIRED'
}

export type TpJobseekerCv = {
  __typename?: 'TpJobseekerCv';
  aboutYourself?: Maybe<Scalars['String']>;
  availability?: Maybe<TpAvailabilityOption>;
  behanceUrl?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  cvName: Scalars['String'];
  desiredEmploymentType?: Maybe<Array<TpEmploymentType>>;
  desiredPositions?: Maybe<Array<TpDesiredPosition>>;
  dribbbleUrl?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  githubUrl?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  ifAvailabilityIsDate_date?: Maybe<Scalars['DateTime']>;
  immigrationStatus?: Maybe<ImmigrationStatus>;
  lastName?: Maybe<Scalars['String']>;
  linkedInUrl?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
  personalWebsite?: Maybe<Scalars['String']>;
  postalMailingAddress?: Maybe<Scalars['String']>;
  profileAvatarImageS3Key?: Maybe<Scalars['String']>;
  stackOverflowUrl?: Maybe<Scalars['String']>;
  telephoneNumber?: Maybe<Scalars['String']>;
  topSkills?: Maybe<Array<TpTechnicalSkill>>;
  twitterUrl?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  userId: Scalars['ID'];
  willingToRelocate: Scalars['Boolean'];
};

export type TpJobseekerCvCreateFromCurrentUserJobseekerProfileInput = {
  cvName?: InputMaybe<Scalars['String']>;
};

export type TpJobseekerCvCreateInput = {
  aboutYourself?: InputMaybe<Scalars['String']>;
  availability?: InputMaybe<TpAvailabilityOption>;
  behanceUrl?: InputMaybe<Scalars['String']>;
  cvName?: InputMaybe<Scalars['String']>;
  desiredEmploymentType?: InputMaybe<Array<TpEmploymentType>>;
  desiredPositions?: InputMaybe<Array<TpDesiredPosition>>;
  dribbbleUrl?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  githubUrl?: InputMaybe<Scalars['String']>;
  ifAvailabilityIsDate_date?: InputMaybe<Scalars['DateTime']>;
  immigrationStatus?: InputMaybe<ImmigrationStatus>;
  lastName?: InputMaybe<Scalars['String']>;
  linkedInUrl?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<Scalars['String']>;
  personalWebsite?: InputMaybe<Scalars['String']>;
  postalMailingAddress?: InputMaybe<Scalars['String']>;
  profileAvatarImageS3Key?: InputMaybe<Scalars['String']>;
  stackOverflowUrl?: InputMaybe<Scalars['String']>;
  telephoneNumber?: InputMaybe<Scalars['String']>;
  topSkills?: InputMaybe<Array<TpTechnicalSkill>>;
  twitterUrl?: InputMaybe<Scalars['String']>;
  willingToRelocate?: InputMaybe<Scalars['Boolean']>;
};

export type TpJobseekerCvDeleteInput = {
  id: Scalars['ID'];
};

export type TpJobseekerCvEducationRecord = {
  __typename?: 'TpJobseekerCvEducationRecord';
  certificationType?: Maybe<TpEducationCertificationType>;
  createdAt: Scalars['DateTime'];
  current?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
  endDateMonth?: Maybe<Scalars['Float']>;
  endDateYear?: Maybe<Scalars['Float']>;
  id: Scalars['ID'];
  institutionCity?: Maybe<Scalars['String']>;
  institutionCountry?: Maybe<Scalars['String']>;
  institutionName?: Maybe<Scalars['String']>;
  sortIndex: Scalars['Int'];
  startDateMonth?: Maybe<Scalars['Float']>;
  startDateYear?: Maybe<Scalars['Float']>;
  title?: Maybe<Scalars['String']>;
  tpJobseekerCvId: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
  userId: Scalars['String'];
};

export type TpJobseekerCvEducationRecordCreateInput = {
  certificationType?: InputMaybe<TpEducationCertificationType>;
  current?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  endDateMonth?: InputMaybe<Scalars['Float']>;
  endDateYear?: InputMaybe<Scalars['Float']>;
  institutionCity?: InputMaybe<Scalars['String']>;
  institutionCountry?: InputMaybe<Scalars['String']>;
  institutionName?: InputMaybe<Scalars['String']>;
  sortIndex?: InputMaybe<Scalars['Int']>;
  startDateMonth?: InputMaybe<Scalars['Float']>;
  startDateYear?: InputMaybe<Scalars['Float']>;
  title?: InputMaybe<Scalars['String']>;
  tpJobseekerCvId: Scalars['ID'];
};

export type TpJobseekerCvEducationRecordDeleteInput = {
  id: Scalars['ID'];
};

export type TpJobseekerCvEducationRecordPatchInput = {
  certificationType?: InputMaybe<TpEducationCertificationType>;
  current?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  endDateMonth?: InputMaybe<Scalars['Float']>;
  endDateYear?: InputMaybe<Scalars['Float']>;
  id: Scalars['ID'];
  institutionCity?: InputMaybe<Scalars['String']>;
  institutionCountry?: InputMaybe<Scalars['String']>;
  institutionName?: InputMaybe<Scalars['String']>;
  sortIndex?: InputMaybe<Scalars['Int']>;
  startDateMonth?: InputMaybe<Scalars['Float']>;
  startDateYear?: InputMaybe<Scalars['Float']>;
  title?: InputMaybe<Scalars['String']>;
};

export type TpJobseekerCvExperienceRecord = {
  __typename?: 'TpJobseekerCvExperienceRecord';
  city?: Maybe<Scalars['String']>;
  company?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  current?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
  endDateMonth?: Maybe<Scalars['Float']>;
  endDateYear?: Maybe<Scalars['Float']>;
  id: Scalars['ID'];
  sortIndex: Scalars['Int'];
  startDateMonth?: Maybe<Scalars['Float']>;
  startDateYear?: Maybe<Scalars['Float']>;
  title?: Maybe<Scalars['String']>;
  tpJobseekerCvId: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
  userId: Scalars['String'];
};

export type TpJobseekerCvExperienceRecordCreateInput = {
  city?: InputMaybe<Scalars['String']>;
  company?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  current?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  endDateMonth?: InputMaybe<Scalars['Float']>;
  endDateYear?: InputMaybe<Scalars['Float']>;
  sortIndex?: InputMaybe<Scalars['Int']>;
  startDateMonth?: InputMaybe<Scalars['Float']>;
  startDateYear?: InputMaybe<Scalars['Float']>;
  title?: InputMaybe<Scalars['String']>;
  tpJobseekerCvId: Scalars['ID'];
};

export type TpJobseekerCvExperienceRecordDeleteInput = {
  id: Scalars['ID'];
};

export type TpJobseekerCvExperienceRecordPatchInput = {
  city?: InputMaybe<Scalars['String']>;
  company?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  current?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  endDateMonth?: InputMaybe<Scalars['Float']>;
  endDateYear?: InputMaybe<Scalars['Float']>;
  id: Scalars['ID'];
  sortIndex?: InputMaybe<Scalars['Int']>;
  startDateMonth?: InputMaybe<Scalars['Float']>;
  startDateYear?: InputMaybe<Scalars['Float']>;
  title?: InputMaybe<Scalars['String']>;
};

export type TpJobseekerCvLanguageRecord = {
  __typename?: 'TpJobseekerCvLanguageRecord';
  id: Scalars['ID'];
  language: Language;
  proficiencyLevelId: LanguageProficiencyLevel;
  tpJobseekerCvId: Scalars['ID'];
  userId: Scalars['String'];
};

export type TpJobseekerCvLanguageRecordCreateInput = {
  language?: InputMaybe<Language>;
  proficiencyLevelId?: InputMaybe<LanguageProficiencyLevel>;
  tpJobseekerCvId: Scalars['ID'];
};

export type TpJobseekerCvLanguageRecordDeleteInput = {
  id: Scalars['ID'];
};

export type TpJobseekerCvLanguageRecordPatchInput = {
  id: Scalars['ID'];
  language?: InputMaybe<Language>;
  proficiencyLevelId?: InputMaybe<LanguageProficiencyLevel>;
};

export type TpJobseekerCvPatchInput = {
  aboutYourself?: InputMaybe<Scalars['String']>;
  cvName?: InputMaybe<Scalars['String']>;
  desiredPositions?: InputMaybe<Array<TpDesiredPosition>>;
  email?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  lastName?: InputMaybe<Scalars['String']>;
  postalMailingAddress?: InputMaybe<Scalars['String']>;
  telephoneNumber?: InputMaybe<Scalars['String']>;
  topSkills?: InputMaybe<Array<TpTechnicalSkill>>;
};

export type TpJobseekerDirectoryEntry = {
  __typename?: 'TpJobseekerDirectoryEntry';
  aboutYourself?: Maybe<Scalars['String']>;
  availability?: Maybe<TpAvailabilityOption>;
  behanceUrl?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  desiredEmploymentType?: Maybe<Array<TpEmploymentType>>;
  desiredPositions?: Maybe<Array<TpDesiredPosition>>;
  dribbbleUrl?: Maybe<Scalars['String']>;
  education?: Maybe<Array<TpJobseekerProfileEducationRecord>>;
  email: Scalars['String'];
  experience?: Maybe<Array<TpJobseekerProfileExperienceRecord>>;
  federalState?: Maybe<FederalState>;
  firstName: Scalars['String'];
  fullName: Scalars['String'];
  genderPronouns?: Maybe<Scalars['String']>;
  githubUrl?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  ifAvailabilityIsDate_date?: Maybe<Scalars['DateTime']>;
  immigrationStatus?: Maybe<ImmigrationStatus>;
  /**
   * Job Fair Boolean Field(s)
   * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
   * Duplicate if there are multiple Job Fairs coming
   */
  isProfileVisibleToCompanies: Scalars['Boolean'];
  isSubscribedToTPMarketingEmails: Scalars['Boolean'];
  lastName: Scalars['String'];
  linkedInUrl?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
  loopbackUserId: Scalars['String'];
  personalWebsite?: Maybe<Scalars['String']>;
  postalMailingAddress?: Maybe<Scalars['String']>;
  profileAvatarImageS3Key?: Maybe<Scalars['String']>;
  rediLocation?: Maybe<Scalars['String']>;
  stackOverflowUrl?: Maybe<Scalars['String']>;
  state: JobseekerProfileStatus;
  telephoneNumber?: Maybe<Scalars['String']>;
  topSkills?: Maybe<Array<TpTechnicalSkill>>;
  twitterUrl?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  userId: Scalars['String'];
  willingToRelocate: Scalars['Boolean'];
  workingLanguages?: Maybe<Array<TpJobseekerProfileLanguageRecord>>;
};

export type TpJobseekerFavoritedJobListing = {
  __typename?: 'TpJobseekerFavoritedJobListing';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  tpJobListingId: Scalars['ID'];
  tpJobseekerProfileId: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
};

export type TpJobseekerFavoritedJobListingCreateMutationInputDto = {
  tpJoblistingId: Scalars['String'];
};

export type TpJobseekerFavoritedJobListingCreateMutationOutputDto = {
  __typename?: 'TpJobseekerFavoritedJobListingCreateMutationOutputDto';
  ok: Scalars['Boolean'];
};

export type TpJobseekerFavoritedJobListingDeleteMutationInputDto = {
  tpJobListingId: Scalars['String'];
};

export type TpJobseekerFavoritedJobListingDeleteMutationOutputDto = {
  __typename?: 'TpJobseekerFavoritedJobListingDeleteMutationOutputDto';
  ok: Scalars['Boolean'];
};

export type TpJobseekerProfile = {
  __typename?: 'TpJobseekerProfile';
  aboutYourself?: Maybe<Scalars['String']>;
  availability?: Maybe<TpAvailabilityOption>;
  createdAt: Scalars['DateTime'];
  desiredEmploymentType?: Maybe<Array<TpEmploymentType>>;
  desiredPositions?: Maybe<Array<TpDesiredPosition>>;
  federalState?: Maybe<FederalState>;
  id: Scalars['ID'];
  ifAvailabilityIsDate_date?: Maybe<Scalars['DateTime']>;
  immigrationStatus?: Maybe<ImmigrationStatus>;
  /**
   * Job Fair Boolean Field(s)
   * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
   * Duplicate if there are multiple Job Fairs coming
   */
  isProfileVisibleToCompanies: Scalars['Boolean'];
  isSubscribedToTPMarketingEmails: Scalars['Boolean'];
  location?: Maybe<Scalars['String']>;
  profileAvatarImageS3Key?: Maybe<Scalars['String']>;
  rediLocation?: Maybe<RediLocation>;
  state: JobseekerProfileStatus;
  topSkills?: Maybe<Array<TpTechnicalSkill>>;
  updatedAt: Scalars['DateTime'];
  userId: Scalars['ID'];
  willingToRelocate: Scalars['Boolean'];
};

export type TpJobseekerProfileEducationRecord = {
  __typename?: 'TpJobseekerProfileEducationRecord';
  certificationType?: Maybe<TpEducationCertificationType>;
  createdAt: Scalars['DateTime'];
  current?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
  endDateMonth?: Maybe<Scalars['Float']>;
  endDateYear?: Maybe<Scalars['Float']>;
  id: Scalars['ID'];
  institutionCity?: Maybe<Scalars['String']>;
  institutionCountry?: Maybe<Scalars['String']>;
  institutionName?: Maybe<Scalars['String']>;
  sortIndex: Scalars['Int'];
  startDateMonth?: Maybe<Scalars['Float']>;
  startDateYear?: Maybe<Scalars['Float']>;
  title?: Maybe<Scalars['String']>;
  tpJobseekerProfileId: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
  userId: Scalars['ID'];
};

export type TpJobseekerProfileEducationRecordCreateInput = {
  certificationType?: InputMaybe<TpEducationCertificationType>;
  current?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  endDateMonth?: InputMaybe<Scalars['Float']>;
  endDateYear?: InputMaybe<Scalars['Float']>;
  institutionCity?: InputMaybe<Scalars['String']>;
  institutionCountry?: InputMaybe<Scalars['String']>;
  institutionName?: InputMaybe<Scalars['String']>;
  sortIndex?: InputMaybe<Scalars['Int']>;
  startDateMonth?: InputMaybe<Scalars['Float']>;
  startDateYear?: InputMaybe<Scalars['Float']>;
  title?: InputMaybe<Scalars['String']>;
};

export type TpJobseekerProfileEducationRecordDeleteInput = {
  id: Scalars['ID'];
};

export type TpJobseekerProfileEducationRecordPatchInput = {
  certificationType?: InputMaybe<TpEducationCertificationType>;
  current?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  endDateMonth?: InputMaybe<Scalars['Float']>;
  endDateYear?: InputMaybe<Scalars['Float']>;
  id: Scalars['ID'];
  institutionCity?: InputMaybe<Scalars['String']>;
  institutionCountry?: InputMaybe<Scalars['String']>;
  institutionName?: InputMaybe<Scalars['String']>;
  sortIndex?: InputMaybe<Scalars['Int']>;
  startDateMonth?: InputMaybe<Scalars['Float']>;
  startDateYear?: InputMaybe<Scalars['Float']>;
  title?: InputMaybe<Scalars['String']>;
};

export type TpJobseekerProfileExperienceRecord = {
  __typename?: 'TpJobseekerProfileExperienceRecord';
  city?: Maybe<Scalars['String']>;
  company?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  current?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
  endDateMonth?: Maybe<Scalars['Float']>;
  endDateYear?: Maybe<Scalars['Float']>;
  id: Scalars['ID'];
  sortIndex: Scalars['Int'];
  startDateMonth?: Maybe<Scalars['Float']>;
  startDateYear?: Maybe<Scalars['Float']>;
  title?: Maybe<Scalars['String']>;
  tpJobseekerProfileId: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
  userId: Scalars['ID'];
};

export type TpJobseekerProfileExperienceRecordCreateInput = {
  city?: InputMaybe<Scalars['String']>;
  company?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  current?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  endDateMonth?: InputMaybe<Scalars['Float']>;
  endDateYear?: InputMaybe<Scalars['Float']>;
  sortIndex?: InputMaybe<Scalars['Int']>;
  startDateMonth?: InputMaybe<Scalars['Float']>;
  startDateYear?: InputMaybe<Scalars['Float']>;
  title?: InputMaybe<Scalars['String']>;
};

export type TpJobseekerProfileExperienceRecordDeleteInput = {
  id: Scalars['ID'];
};

export type TpJobseekerProfileExperienceRecordPatchInput = {
  city?: InputMaybe<Scalars['String']>;
  company?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  current?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  endDateMonth?: InputMaybe<Scalars['Float']>;
  endDateYear?: InputMaybe<Scalars['Float']>;
  id: Scalars['ID'];
  sortIndex?: InputMaybe<Scalars['Int']>;
  startDateMonth?: InputMaybe<Scalars['Float']>;
  startDateYear?: InputMaybe<Scalars['Float']>;
  title?: InputMaybe<Scalars['String']>;
};

export type TpJobseekerProfileLanguageRecord = {
  __typename?: 'TpJobseekerProfileLanguageRecord';
  id: Scalars['ID'];
  language: Language;
  proficiencyLevelId: LanguageProficiencyLevel;
  userId: Scalars['ID'];
};

export type TpJobseekerProfileLanguageRecordCreateInput = {
  language?: InputMaybe<Language>;
  proficiencyLevelId?: InputMaybe<LanguageProficiencyLevel>;
};

export type TpJobseekerProfileLanguageRecordDeleteInput = {
  id: Scalars['ID'];
};

export type TpJobseekerProfileLanguageRecordPatchInput = {
  id: Scalars['ID'];
  language?: InputMaybe<Language>;
  proficiencyLevelId?: InputMaybe<LanguageProficiencyLevel>;
};

export type TpJobseekerProfilePatchInput = {
  aboutYourself?: InputMaybe<Scalars['String']>;
  availability?: InputMaybe<TpAvailabilityOption>;
  desiredEmploymentType?: InputMaybe<Array<TpEmploymentType>>;
  desiredPositions?: InputMaybe<Array<TpDesiredPosition>>;
  federalState?: InputMaybe<FederalState>;
  ifAvailabilityIsDate_date?: InputMaybe<Scalars['DateTime']>;
  immigrationStatus?: InputMaybe<ImmigrationStatus>;
  /**
   * Job Fair Boolean Field(s)
   * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
   * Duplicate if there are multiple Job Fairs coming
   */
  isProfileVisibleToCompanies?: InputMaybe<Scalars['Boolean']>;
  isSubscribedToTPMarketingEmails?: InputMaybe<Scalars['Boolean']>;
  location?: InputMaybe<Scalars['String']>;
  profileAvatarImageS3Key?: InputMaybe<Scalars['String']>;
  rediLocation?: InputMaybe<RediLocation>;
  state?: InputMaybe<JobseekerProfileStatus>;
  topSkills?: InputMaybe<Array<TpTechnicalSkill>>;
  willingToRelocate?: InputMaybe<Scalars['Boolean']>;
};

export type TpJobseekerProfileSignUpDto = {
  rediLocation: RediLocation;
};

export enum TpTechnicalSkill {
  AdobeCreativeSuite = 'adobeCreativeSuite',
  AdobePhotoshop = 'adobePhotoshop',
  AgileMethodology = 'agileMethodology',
  ApplicationOperation = 'applicationOperation',
  ArtificialIntellegence = 'artificialIntellegence',
  AspNet = 'aspNet',
  AtlassianConfluence = 'atlassianConfluence',
  AtlassianJira = 'atlassianJira',
  AtlassianSuite = 'atlassianSuite',
  Aws = 'aws',
  BalsamiqMockup = 'balsamiqMockup',
  Bpmn = 'bpmn',
  C = 'c',
  CPlusPlus = 'cPlusPlus',
  Cad = 'cad',
  Camunda = 'camunda',
  CloudApplications = 'cloudApplications',
  CloudComputing = 'cloudComputing',
  ConceptDevelopment = 'conceptDevelopment',
  Crm = 'crm',
  Css = 'css',
  CustomerService = 'customerService',
  CustomerSupport = 'customerSupport',
  DataAnalysis = 'dataAnalysis',
  DatabaseDesign = 'databaseDesign',
  DesignThinking = 'designThinking',
  DevOps = 'devOps',
  DomainDrivenDesign = 'domainDrivenDesign',
  DomainModelling = 'domainModelling',
  EmbeddedSystems = 'embeddedSystems',
  Figma = 'figma',
  Git = 'git',
  GoogleCloudPlatform = 'googleCloudPlatform',
  GraphicDesign = 'graphicDesign',
  Hardware = 'hardware',
  HpAlm = 'hpAlm',
  HpQualityCenter = 'hpQualityCenter',
  Html = 'html',
  Illustrator = 'illustrator',
  InformationArchitecture = 'informationArchitecture',
  InteractionDesign = 'interactionDesign',
  Invision = 'invision',
  Iot = 'iot',
  ItServiceManagement = 'itServiceManagement',
  Itil = 'itil',
  Java = 'java',
  JavaScript = 'javaScript',
  Kafka = 'kafka',
  Kanban = 'kanban',
  LeanPrinciples = 'leanPrinciples',
  Linux = 'linux',
  MacOsServer = 'macOsServer',
  MicrosoftAzure = 'microsoftAzure',
  MicrosoftOffice = 'microsoftOffice',
  NetFramework = 'netFramework',
  NetworkAdministration = 'networkAdministration',
  NetworkDesign = 'networkDesign',
  NetworkSecurity = 'networkSecurity',
  NodeJs = 'nodeJs',
  OperationsManagement = 'operationsManagement',
  OracleDatabase = 'oracleDatabase',
  Php = 'php',
  ProblemSolving = 'problemSolving',
  ProcessModelling = 'processModelling',
  ProcessOptimization = 'processOptimization',
  ProductDevelopment = 'productDevelopment',
  ProductManagement = 'productManagement',
  ProgramManagement = 'programManagement',
  ProjectManagement = 'projectManagement',
  Prototyping = 'prototyping',
  Python = 'python',
  QualitativeResearch = 'qualitativeResearch',
  QualityAssurance = 'qualityAssurance',
  QualityManagement = 'qualityManagement',
  QuantitativeResearch = 'quantitativeResearch',
  RProgrammingLanguage = 'rProgrammingLanguage',
  ReactJs = 'reactJs',
  RequirementsAnalysis = 'requirementsAnalysis',
  ResponsiveWebDesign = 'responsiveWebDesign',
  Salesforce = 'salesforce',
  SapProducts = 'sapProducts',
  Scrum = 'scrum',
  Sketch = 'sketch',
  Sketching = 'sketching',
  SoftwareArchitecture = 'softwareArchitecture',
  SoftwareDevelopmentLifecycle = 'softwareDevelopmentLifecycle',
  Sql = 'sql',
  TeamLeadership = 'teamLeadership',
  TechnicalSupport = 'technicalSupport',
  Testing = 'testing',
  Troubleshooting = 'troubleshooting',
  Typography = 'typography',
  Uml = 'uml',
  UsabilityTesting = 'usabilityTesting',
  UserCenteredDesign = 'userCenteredDesign',
  UserExperience = 'userExperience',
  UserStoryMapping = 'userStoryMapping',
  VisualBasic = 'visualBasic',
  VmWare = 'vmWare',
  WebApplications = 'webApplications',
  WebDesign = 'webDesign',
  WebDevelopment = 'webDevelopment',
  WebServices = 'webServices',
  WindowsServer = 'windowsServer',
  Wireframes = 'wireframes',
  XRay = 'xRay',
  Xml = 'xml',
  Zephyr = 'zephyr'
}

export type UpdateConProfileInput = {
  birthDate?: InputMaybe<Scalars['DateTime']>;
  categories?: InputMaybe<Array<MentoringTopic>>;
  expectations?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  gender?: InputMaybe<Gender>;
  githubProfileUrl?: InputMaybe<Scalars['String']>;
  isSubscribedToCONMarketingEmails?: InputMaybe<Scalars['Boolean']>;
  languages?: InputMaybe<Array<Language>>;
  lastName?: InputMaybe<Scalars['String']>;
  linkedInProfileUrl?: InputMaybe<Scalars['String']>;
  menteeCountCapacity?: InputMaybe<Scalars['Int']>;
  mentee_highestEducationLevel?: InputMaybe<EducationLevel>;
  mentee_occupationCategoryId?: InputMaybe<OccupationCategory>;
  mentee_occupationJob_placeOfEmployment?: InputMaybe<Scalars['String']>;
  mentee_occupationJob_position?: InputMaybe<Scalars['String']>;
  mentee_occupationLookingForJob_what?: InputMaybe<Scalars['String']>;
  mentee_occupationOther_description?: InputMaybe<Scalars['String']>;
  mentee_occupationStudent_studyName?: InputMaybe<Scalars['String']>;
  mentee_occupationStudent_studyPlace?: InputMaybe<Scalars['String']>;
  mentor_isPartnershipMentor?: InputMaybe<Scalars['Boolean']>;
  mentor_occupation?: InputMaybe<Scalars['String']>;
  mentor_workPlace?: InputMaybe<Scalars['String']>;
  optOutOfMenteesFromOtherRediLocation?: InputMaybe<Scalars['Boolean']>;
  personalDescription?: InputMaybe<Scalars['String']>;
  profileAvatarImageS3Key?: InputMaybe<Scalars['String']>;
  slackUsername?: InputMaybe<Scalars['String']>;
  telephoneNumber?: InputMaybe<Scalars['String']>;
};

export type UserContact = {
  __typename?: 'UserContact';
  behanceUrl?: Maybe<Scalars['String']>;
  birthDate?: Maybe<Scalars['DateTime']>;
  createdAt: Scalars['DateTime'];
  dribbbleUrl?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  firstName: Scalars['String'];
  gender?: Maybe<Gender>;
  genderPronouns?: Maybe<Scalars['String']>;
  githubProfileUrl?: Maybe<Scalars['String']>;
  howDidHearAboutRediKey?: Maybe<FirstPointOfTpContactOption>;
  howDidHearAboutRediOtherText?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  lastName: Scalars['String'];
  linkedInProfileUrl?: Maybe<Scalars['String']>;
  loopbackUserId: Scalars['String'];
  personalDescription?: Maybe<Scalars['String']>;
  personalWebsite?: Maybe<Scalars['String']>;
  postalMailingAddress?: Maybe<Scalars['String']>;
  slackUsername?: Maybe<Scalars['String']>;
  stackOverflowUrl?: Maybe<Scalars['String']>;
  telephoneNumber?: Maybe<Scalars['String']>;
  twitterUrl?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};

export type UserContactPatchInput = {
  behanceUrl?: InputMaybe<Scalars['String']>;
  birthDate?: InputMaybe<Scalars['DateTime']>;
  dribbbleUrl?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  gender?: InputMaybe<Gender>;
  genderPronouns?: InputMaybe<Scalars['String']>;
  githubProfileUrl?: InputMaybe<Scalars['String']>;
  howDidHearAboutRediKey?: InputMaybe<FirstPointOfTpContactOption>;
  howDidHearAboutRediOtherText?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  linkedInProfileUrl?: InputMaybe<Scalars['String']>;
  personalDescription?: InputMaybe<Scalars['String']>;
  personalWebsite?: InputMaybe<Scalars['String']>;
  postalMailingAddress?: InputMaybe<Scalars['String']>;
  slackUsername?: InputMaybe<Scalars['String']>;
  stackOverflowUrl?: InputMaybe<Scalars['String']>;
  telephoneNumber?: InputMaybe<Scalars['String']>;
  twitterUrl?: InputMaybe<Scalars['String']>;
};

export enum UserType {
  Mentee = 'MENTEE',
  Mentor = 'MENTOR'
}
