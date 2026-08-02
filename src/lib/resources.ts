export interface Resource {
  title: string
  url: string
}

export interface ResourceGroup {
  title: string
  resources: Resource[]
}

export const RESOURCE_GROUPS: ResourceGroup[] = [
  {
    title: 'WKF Official Rules & Regulations',
    resources: [
      {
        title: 'WKF Kumite Competition Rules 2026',
        url: 'https://www.wkf.net/files/pdf/documents/WKF%202026%20Kumite%20Competition%20Rules%20MASTER%20COPY_V11.pdf',
      },
      {
        title: 'WKF Kata Competition Rules 2026',
        url: 'https://www.wkf.net/files/pdf/documents/WKF%20KATA%202026.pdf',
      },
      {
        title: 'WKF Para Karate Competition Rules 2026',
        url: 'https://www.wkf.net/files/pdf/documents/WKF%202026%20Para%20Karate%20Competition%20Rules%20MASTER%20COPY_V2.pdf',
      },
      {
        title: 'WKF Competition Rules Bulletin 2026',
        url: 'https://www.wkf.net/files/pdf/documents/WKF%20Competition%20Rules%20Bulletin%202026_V2.pdf',
      },
      {
        title: 'WKF Kumite Examination Questions 2025',
        url: 'https://www.wkf.net/files/pdf/documents/KumiteQuestions_English_Dec2025.pdf',
      },
    ],
  },
  {
    title: 'Karate Canada — Technical & Dan Grading',
    resources: [
      {
        title: 'Shotokan Dan Evaluation Guidelines',
        url: 'http://karatecanada.org/wp-content/uploads/2018/07/KC_SHOTOKAN_Dan-Test-Guideline_ENG-20120221.pdf',
      },
      {
        title: 'Goju-Ryu Dan Evaluation Guidelines',
        url: 'https://karatecanada.org/wp-content/uploads/2018/07/KC_GOJU-RYU_Dan-Test-Guideline_ENG-20120221.pdf',
      },
      {
        title: 'Wado-Ryu Dan Evaluation Guidelines',
        url: 'http://karatecanada.org/wp-content/uploads/2018/07/KC_WADO-RYU_Dan-Test-Guideline_ENG-20120221.pdf',
      },
      {
        title: 'Shito-Ryu Dan Evaluation Guidelines',
        url: 'http://karatecanada.org/wp-content/uploads/2018/07/KC_SHITO-RYU_Dan-Test-Guideline_ENG-20120221.pdf',
      },
      {
        title: 'Chito-Ryu Dan Evaluation Guidelines',
        url: 'https://karatecanada.org/wp-content/uploads/2022/02/KC_CHITO-RYU_Dan-Test-Guidelines_ENG_2022-02-01_FINAL.pdf',
      },
      {
        title: 'Other Styles Dan Evaluation Guidelines',
        url: 'https://karatecanada.org/wp-content/uploads/2018/07/KC_OTHERSTYLES_Dan-Test-Guideline_ENG20120223.pdf',
      },
    ],
  },
  {
    title: 'Karate Canada — Coaching & Development',
    resources: [
      {
        title: 'Karate for Life — Long Term Athlete Development (LTAD)',
        url: 'https://karatemanitoba.ca/wp-content/uploads/2012/09/Karate-for-Life-LTAD.pdf',
      },
      {
        title: 'Instruction Beginner Pathway',
        url: 'https://karatecanada.org/wp-content/uploads/2018/02/Karate-Canada_Inst-Beg-Pathway_EN_24Aug2020_Final.pdf',
      },
    ],
  },
  {
    title: 'Karate Canada — Officials & Referees',
    resources: [
      { title: "Officials' Handbook", url: 'https://karatecanada.org/resources/officials/' },
      {
        title: 'National Referee Clinic Hosting Guidelines',
        url: 'https://karatecanada.org/resources/officials/',
      },
    ],
  },
  {
    title: 'Karate Canada — Governance & Policy',
    resources: [
      {
        title: 'Code of Conduct and Ethics (March 2023)',
        url: 'https://karatecanada.org/resources/governance-policies/',
      },
      {
        title: 'Discipline and Complaints Policy (March 2023)',
        url: 'https://karatecanada.org/resources/governance-policies/',
      },
      {
        title: 'General By-Laws (Sept 2020)',
        url: 'https://karatecanada.org/resources/governance-policies/',
      },
    ],
  },
  {
    title: 'Karate Canada — Health & Medical',
    resources: [
      {
        title: 'Recommended Protocols for Return to Karate Training',
        url: 'https://karatecanada.org/recommended-protocols-for-return-to-karate-training/',
      },
      {
        title: 'Sport Integrity Canada (formerly CCES) — Anti-Doping Resources',
        url: 'https://sportintegrity.ca/',
      },
      { title: 'True Sport Clean Course', url: 'https://sportintegrity.ca/true-sport' },
      { title: 'Global DRO (Drug Reference Online)', url: 'https://www.globaldro.com' },
    ],
  },
  {
    title: 'Karate Canada — Long Term Development',
    resources: [{ title: 'Karate LTD Poster', url: 'https://karatecanada.org/resources/ltad/' }],
  },
]
