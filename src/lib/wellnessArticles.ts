export interface WellnessArticle {
  title: string
  source: string
  url: string
}

// Curated for athlete-specific burnout/stress/self-compassion content,
// same "verify before linking" standard as resources.ts - every one of
// these is a real, credible sport-psychology source (a university sport
// psych program, a national sport science body, or a licensed sport
// psychologist), not a generic wellness blog.
export const WELLNESS_ARTICLES: WellnessArticle[] = [
  {
    title: 'Understanding Student-Athlete Burnout',
    source: 'Association for Applied Sport Psychology',
    url: 'https://appliedsportpsych.org/blog/2015/01/understanding-student-athlete-burnout/',
  },
  {
    title: 'Overtraining Syndrome / Burnout',
    source: "Rady Children's Health, Sports Medicine",
    url: 'https://www.rchsd.org/programs-services/sports-medicine/conditions-treated/overtraining-syndromeburnout/',
  },
  {
    title: 'From Burnout to Breakthrough: Strategies for Managing Athlete Anxiety and Burnout',
    source: 'Kent State University',
    url: 'https://onlinedegrees.kent.edu/blog/from-burnout-to-breakthrough-strategies-for-managing-athlete-anxiety-and-burnout',
  },
  {
    title: 'Mental Health and Athletic Performance: Anxiety, Burnout, and Recovery',
    source: 'Sports Medicine Weekly',
    url: 'https://sportsmedicineweekly.com/blog/mental-health-and-athletic-performance-understanding-anxiety-burnout-and-when-to-seek-medical-help/',
  },
  {
    title: 'Self-Compassion in Sport 101',
    source: 'SIRC (Sport Information Resource Centre)',
    url: 'https://sirc.ca/articles/self-compassion-in-sport-101/',
  },
  {
    title: 'How to Build Self-Compassion in Sports: A Guide for Athletes',
    source: 'Dr. Paul McCarthy, Sport Psychologist',
    url: 'https://www.drpaulmccarthy.com/post/how-to-build-self-compassion-in-sports-a-guide-for-athletes',
  },
  {
    title: 'Youth Sports Burnout: Signs, Causes & Psychologist Help',
    source: 'sportspsychology.org',
    url: 'https://www.sportspsychology.org/articles/youth-sports-burnout/',
  },
]
