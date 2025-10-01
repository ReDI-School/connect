export const REDI_LOCATION_NAMES = {
  BERLIN: 'ReDI Berlin',
  HAMBURG: 'ReDI Hamburg',
  MALMO: 'ReDI Malmö',
  MUNICH: 'ReDI Munich',
  NRW: 'ReDI NRW',
  CYBERSPACE: 'ReDI Online in Germany',
} as const

export const CATEGORY_GROUPS = {
  softwareEngineering: 'Software Engineering',
  design: 'Design',
  otherProfessions: 'Other Professions',
  careerSupport: 'Career Support',
  language: 'Language Support',
  other: 'Other',
} as const

export const CATEGORIES = [
  {
    id: 'basicProgrammingSkills',
    label: 'Basic programming skills',
    group: 'softwareEngineering',
  },
  { id: 'htmlCss', label: 'HTML & CSS', group: 'softwareEngineering' },
  { id: 'javascript', label: 'JavaScript', group: 'softwareEngineering' },
  { id: 'react', label: 'React', group: 'softwareEngineering' },
  { id: 'java', label: 'Java', group: 'softwareEngineering' },
  { id: 'python', label: 'Python', group: 'softwareEngineering' },
  {
    id: 'dataAnalytics',
    label: 'Data Analytics',
    group: 'softwareEngineering',
  },
  {
    id: 'machineLearning',
    label: 'Machine Learning',
    group: 'softwareEngineering',
  },
  {
    id: 'mobileDevelopmentIos',
    label: 'iOS Mobile Development',
    group: 'softwareEngineering',
  },
  {
    id: 'mobileDevelopmentAndroid',
    label: 'Android Mobile Development',
    group: 'softwareEngineering',
  },
  { id: 'salesforce', label: 'Salesforce', group: 'softwareEngineering' },
  {
    id: 'devOpsCloud',
    label: 'DevOps and Cloud (e.g. Azure, AWS)',
    group: 'softwareEngineering',
  },
  { id: 'iot', label: 'IoT', group: 'softwareEngineering' },
  {
    id: 'computerNetworking',
    label: 'Computer Networking',
    group: 'softwareEngineering',
  },
  { id: 'blockchain', label: 'Blockchain', group: 'softwareEngineering' },
  { id: 'cybersecurity', label: 'Cybersecurity', group: 'softwareEngineering' },
  {
    id: 'productManagement',
    label: 'Product Management',
    group: 'otherProfessions',
  },
  {
    id: 'projectManagement',
    label: 'Project Management',
    group: 'otherProfessions',
  },
  {
    id: 'digitalMarketing',
    label: 'Digital Marketing',
    group: 'otherProfessions',
  },
  {
    id: 'businessDevelopment',
    label: 'Business Development',
    group: 'otherProfessions',
  },
  { id: 'sales', label: 'Sales', group: 'otherProfessions' },
  {
    id: 'qualityAssurance',
    label: 'Quality Assurance',
    group: 'otherProfessions',
  },
  { id: 'basicGerman', label: 'Basic German 🇩🇪', group: 'language' },
  { id: 'businessGerman', label: 'Business German 🇩🇪', group: 'language' },
  { id: 'english', label: 'English 🇬🇧', group: 'language' },
  { id: 'swedish', label: 'Swedish 🇸🇪', group: 'language' },
  { id: 'graphicDesign', label: 'Graphic Design', group: 'design' },
  {
    id: 'userInterfaceDesign',
    label: 'User Interface Design',
    group: 'design',
  },
  {
    id: 'userExperienceDesign',
    label: 'User Experience Design',
    group: 'design',
  },
  {
    id: 'motivationAndEncouragement',
    label: 'Motivation & encouragement',
    group: 'other',
  },
  { id: 'friendAndHelp', label: 'Be a friend and help', group: 'other' },
  { id: 'dontKnowYet', label: "I don't know yet", group: 'other' },
  {
    id: 'careerOrientationAndPlanning',
    label: 'Career orientation & planning',
    group: 'careerSupport',
  },
  {
    id: 'internshipOrWorkingStudent',
    label: 'Internship / working student position search',
    group: 'careerSupport',
  },
  { id: 'jobSearch', label: 'Job search', group: 'careerSupport' },
  {
    id: 'jobApplicationsCvPreparationEnglish',
    label: 'Job applications and CV preparation in English',
    group: 'careerSupport',
  },
  {
    id: 'jobApplicationsCvPreparationGerman',
    label: 'Job applications and CV preparation in German',
    group: 'careerSupport',
  },
  {
    id: 'interviewPreparation',
    label: 'Interview preparation',
    group: 'careerSupport',
  },
  {
    id: 'codingChallengePreparation',
    label: 'Coding challenge preparation',
    group: 'careerSupport',
  },
  {
    id: 'buildingProfessionalNetwork',
    label: 'Building a professional network',
    group: 'careerSupport',
  },
  { id: 'entrepreneurship', label: 'Entrepreneurship', group: 'careerSupport' },
  { id: 'freelancing', label: 'Freelancing', group: 'careerSupport' },
] as const
export type CategoryKey = typeof CATEGORIES[number]['id']
export type CategoryLabel = typeof CATEGORIES[number]['label']

export const CATEGORIES_MAP = Object.fromEntries(
  CATEGORIES.map((cat) => [cat.id, cat.label])
) as Record<CategoryKey, CategoryLabel>

export const LANGUAGES = {
  Afrikaans: 'Afrikaans',
  Albanian: 'Albanian',
  Amharic: 'Amharic',
  Arabic: 'Arabic',
  Aramaic: 'Aramaic',
  Armenian: 'Armenian',
  Assamese: 'Assamese',
  Aymara: 'Aymara',
  Azerbaijani: 'Azerbaijani',
  Balochi: 'Balochi',
  Bamanankan: 'Bamanankan',
  BashkortBashkir: 'Bashkort (Bashkir)',
  Basque: 'Basque',
  Belarusan: 'Belarusan',
  Bengali: 'Bengali',
  Bhojpuri: 'Bhojpuri',
  Bislama: 'Bislama',
  Bosnian: 'Bosnian',
  Brahui: 'Brahui',
  Bulgarian: 'Bulgarian',
  Burmese: 'Burmese',
  Cantonese: 'Cantonese',
  Catalan: 'Catalan',
  Cebuano: 'Cebuano',
  Chechen: 'Chechen',
  Cherokee: 'Cherokee',
  Croatian: 'Croatian',
  Czech: 'Czech',
  Dakota: 'Dakota',
  Danish: 'Danish',
  Dari: 'Dari',
  Dholuo: 'Dholuo',
  Dutch: 'Dutch',
  English: 'English',
  Esperanto: 'Esperanto',
  Estonian: 'Estonian',
  Ewe: 'Éwé',
  Finnish: 'Finnish',
  French: 'French',
  Georgian: 'Georgian',
  German: 'German',
  Gikuyu: 'Gikuyu',
  Greek: 'Greek',
  Guarani: 'Guarani',
  Gujarati: 'Gujarati',
  HaitianCreole: 'Haitian Creole',
  Hausa: 'Hausa',
  Hawaiian: 'Hawaiian',
  HawaiianCreole: 'Hawaiian Creole',
  Hebrew: 'Hebrew',
  Hiligaynon: 'Hiligaynon',
  Hindi: 'Hindi',
  Hungarian: 'Hungarian',
  Icelandic: 'Icelandic',
  Igbo: 'Igbo',
  Ilocano: 'Ilocano',
  IndonesianBahasaIndonesia: 'Indonesian (Bahasa Indonesia)',
  InuitInupiaq: 'Inuit/Inupiaq',
  IrishGaelic: 'Irish Gaelic',
  Italian: 'Italian',
  Japanese: 'Japanese',
  Jarai: 'Jarai',
  Javanese: 'Javanese',
  Kiche: 'K’iche’',
  Kabyle: 'Kabyle',
  Kannada: 'Kannada',
  Kashmiri: 'Kashmiri',
  Kazakh: 'Kazakh',
  Khmer: 'Khmer',
  Khoekhoe: 'Khoekhoe',
  Korean: 'Korean',
  Kurdish: 'Kurdish',
  Kyrgyz: 'Kyrgyz',
  Lao: 'Lao',
  Latin: 'Latin',
  Latvian: 'Latvian',
  Lingala: 'Lingala',
  Lithuanian: 'Lithuanian',
  Macedonian: 'Macedonian',
  Maithili: 'Maithili',
  Malagasy: 'Malagasy',
  MalayBahasaMelayu: 'Malay (Bahasa Melayu)',
  Malayalam: 'Malayalam',
  MandarinChinese: 'Mandarin (Chinese)',
  Marathi: 'Marathi',
  Mende: 'Mende',
  Mongolian: 'Mongolian',
  Nahuatl: 'Nahuatl',
  Navajo: 'Navajo',
  Nepali: 'Nepali',
  Norwegian: 'Norwegian',
  Ojibwa: 'Ojibwa',
  Oriya: 'Oriya',
  Oromo: 'Oromo',
  Pashto: 'Pashto',
  Persian: 'Persian',
  Polish: 'Polish',
  Portuguese: 'Portuguese',
  Punjabi: 'Punjabi',
  Quechua: 'Quechua',
  Romani: 'Romani',
  Romanian: 'Romanian',
  Russian: 'Russian',
  Rwanda: 'Rwanda',
  Samoan: 'Samoan',
  Sanskrit: 'Sanskrit',
  Serbian: 'Serbian',
  Shona: 'Shona',
  Sindhi: 'Sindhi',
  Sinhala: 'Sinhala',
  Slovak: 'Slovak',
  Slovene: 'Slovene',
  Somali: 'Somali',
  Spanish: 'Spanish',
  Swahili: 'Swahili',
  Swedish: 'Swedish',
  Tachelhit: 'Tachelhit',
  Tagalog: 'Tagalog',
  Tajiki: 'Tajiki',
  Tamil: 'Tamil',
  Tatar: 'Tatar',
  Telugu: 'Telugu',
  Thai: 'Thai',
  TibeticLanguages: 'Tibetic languages',
  Tigrigna: 'Tigrigna',
  TokPisin: 'Tok Pisin',
  Turkish: 'Turkish',
  Turkmen: 'Turkmen',
  Ukrainian: 'Ukrainian',
  Urdu: 'Urdu',
  Uyghur: 'Uyghur',
  Uzbek: 'Uzbek',
  Vietnamese: 'Vietnamese',
  Warlpiri: 'Warlpiri',
  Welsh: 'Welsh',
  Wolof: 'Wolof',
  Xhosa: 'Xhosa',
  Yakut: 'Yakut',
  Yiddish: 'Yiddish',
  Yoruba: 'Yoruba',
  Yucatec: 'Yucatec',
  Zapotec: 'Zapotec',
  Zulu: 'Zulu',
} as const
export type LanguageKey = keyof typeof LANGUAGES

export const GENDERS = {
  Male: 'Male',
  Female: 'Female',
  Other: 'Other',
} as const
export type GenderKey = keyof typeof GENDERS

export const EDUCATION_LEVELS = {
  middleSchool: 'Middle School',
  highSchool: 'High School',
  apprenticeship: 'Apprenticeship',
  universityBachelor: 'University Degree (Bachelor)',
  universityMaster: 'University Degree (Master)',
  universityPhd: 'University Degree (PhD)',
} as const
export type EducationLevelKey = keyof typeof EDUCATION_LEVELS

export const REPORT_PROBLEM_CATEGORIES = [
  { id: 'wantToQuit', label: 'I want to quit' },
] as const

export const MENTORING_SESSION_DURATION_OPTIONS = [
  15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180,
] as const
export type MentoringSessionDurationOption =
  typeof MENTORING_SESSION_DURATION_OPTIONS[number]

export const MENTEE_OCCUPATION_CATEGORY = {
  job: 'Job (full-time/part-time)',
  student: 'Student (enrolled at university)',
  lookingForJob: 'Looking for a job',
  other: 'Other',
} as const
export type MenteeOccupationCategoryKey =
  keyof typeof MENTEE_OCCUPATION_CATEGORY

export const MENTEE_COUNT_CAPACITY_OPTIONS = [0, 1, 2] as const
export type MenteeCountCapacityOption =
  typeof MENTEE_COUNT_CAPACITY_OPTIONS[number]

// TODO: a duplicate lives in apps/api/lib/email/email.js, keep this
// in sync with it!
export const MENTOR_DECLINES_MENTORSHIP_REASON_FOR_DECLINING = {
  notEnoughTimeNowToBeMentor:
    "I don't have enough time right now to be a mentor",
  notRightExpertise: "I don't have the right expertise",
  anotherMentorMoreSuitable: 'I think another mentor would be more suitable',
  other: 'Other',
}

export const RED_MATCH_STATUSES = {
  ACCEPTED: 'Accepted',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  APPLIED: 'Applied',
  DECLINED_BY_MENTOR: 'Declined by mentor',
  INVALIDATED_AS_OTHER_MENTOR_ACCEPTED:
    'Invalidated due to other mentor accepting',
} as const

export const MENTORSHIP_MATCH_STATUS_LABELS: any = {
  APPLIED: 'Pending',
  ACCEPTED: 'Accepted',
  COMPLETED: 'Accepted',
  CANCELLED: 'Cancelled',
  DECLINED_BY_MENTOR: 'Declined',
  INVALIDATED_AS_OTHER_MENTOR_ACCEPTED: 'Cancelled',
}

export const API_URL = process.env.NX_API_URL
  ? process.env.NX_API_URL
  : 'http://localhost:3003/api'
export const S3_UPLOAD_SIGN_URL = process.env.NX_S3_UPLOAD_SIGN_URL
  ? process.env.NX_S3_UPLOAD_SIGN_URL
  : 'http://localhost:3003/s3/sign'
export const TALENT_POOL_URL = (() => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'https://talent-pool.redi-school.org'
    case 'demonstration':
      return 'https://app.demo.talent-pool.redi-school.org'
    default:
      return 'http://localhost:2999'
  }
})()
