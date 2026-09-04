import type { Project } from "../types";

export const PROJECTS: Project[] = [
  {
    id: "kids-football-project",
    title: "5-A-Side Kids Football Tournament & Awareness",
    slug: "kids-football-anti-drug-campaign",
    category: "COMMUNITY SERVICE & SPORTS",
    date: "June 2026",
    year: 2026,
    description:
      'Organized in association with Coimbatore Eagles – New Life Sports Football Academy and Rotary Club of Coimbatore Texcity. The tournament brought together 120+ young footballers across 12 teams to champion grassroots sports alongside active social advocacy: "Say No to Drugs" and "Say No to Gender-Based Violence". Over 30 coaches and 300 spectators participated, creating positive community engagement through the power of athletic teamwork.',
    shortDescription:
      "Grassroots youth sports championship combining athletic competition with anti-drug and anti-violence awareness.",
    image: "/assets/events/football.jpg",
    featured: true,
    impactMetrics: [
      { label: "Young Athletes", value: "120+" },
      { label: "Participating Teams", value: "12" },
      { label: "Mentors & Coaches", value: "30+" },
      { label: "Community Spectators", value: "300+" },
    ],
    collaborators: [
      "Coimbatore Eagles – New Life Sports Academy",
      "Rotary Club of Coimbatore Texcity",
    ],
    source: {
      platform: "Instagram",
      url: "https://www.instagram.com/rotaract.clubof.lia/",
      verified: true,
    },
  },
  {
    id: "dheema-health-drive",
    title: "Project DHEEMA — Viral Hepatitis Awareness",
    slug: "project-dheema-hepatitis-prevention",
    category: "HEALTH & WELLNESS",
    date: "July 2026",
    year: 2026,
    description:
      "A flagship public health initiative conducted on World Hepatitis Day 2026 in collaboration with Rotaract Club of SNS College of Technology and Rotaract Club of Coimbatore Unity. The campaign educated youth and families on viral hepatitis transmission, liver wellness habits, vaccination importance, and early clinical screening protocols.",
    shortDescription:
      "Public health education drive on World Hepatitis Day focusing on liver wellness and prevention.",
    image: "/assets/events/dheema.jpg",
    featured: false,
    impactMetrics: [
      { label: "Health Focus", value: "Hepatitis Prevention" },
      { label: "Reach", value: "Community Wide" },
      { label: "Partner Clubs", value: "3 Clubs" },
    ],
    collaborators: [
      "Rotaract Club of SNS College of Technology",
      "Rotaract Club of Coimbatore Unity",
    ],
    source: {
      platform: "Instagram",
      url: "https://www.instagram.com/rotaract.clubof.lia/",
      verified: true,
    },
  },
  {
    id: "mind-matters-wellness",
    title: "Project Mind Matters — Breaking the Pressure to Fit In",
    slug: "mind-matters-youth-mental-health",
    category: "HEALTH & WELLBEING",
    date: "August 2025",
    year: 2025,
    description:
      'Conducted under the District Priority Project "Mann Shakthi" on International Youth Day in partnership with Coimbatore Gaalaxy, HICAS, Madras Cosmos, and SBSEC. The forum provided students a safe and structured dialogue around peer pressure, academic anxiety, digital media fatigue, and practical self-care techniques.',
    shortDescription:
      "Youth mental wellness forum addressing academic stress and social pressure under project Mann Shakthi.",
    image: "/assets/events/mind-matters.jpg",
    featured: false,
    impactMetrics: [
      { label: "Attendees", value: "45+" },
      { label: "Participating Clubs", value: "5 Clubs" },
      { label: "Initiative", value: "Mann Shakthi" },
    ],
    collaborators: [
      "Rotaract Club of Coimbatore Gaalaxy",
      "Rotaract Club of HICAS",
      "Rotaract Club of Madras Cosmos",
      "Rotaract Club of SBSEC",
    ],
    source: {
      platform: "Instagram",
      url: "https://www.instagram.com/rotaract.clubof.lia/",
      verified: true,
    },
  },
  {
    id: "nalaya-vidiyal-training",
    title: "Nalaya Vidiyal 2.0 — Football Coaching Clinic",
    slug: "nalaya-vidiyal-youth-football-clinic",
    category: "SPORTS & YOUTH DEVELOPMENT",
    date: "August 2025",
    year: 2025,
    description:
      "A high-impact youth coaching workshop conducted on Independence Day featuring AFC B-License holder and Tamil Nadu Sub-Junior National Team Coach Mr. Elavazhagan. 35 students from Under-10, Under-15, and Under-19 Girls categories received professional athletic drills, leadership building, and tactical football fundamentals.",
    shortDescription:
      "Professional coaching workshop led by national coach Mr. Elavazhagan for 35 promising players.",
    image: "/assets/events/nalaya-vidiyal.jpg",
    featured: true,
    impactMetrics: [
      { label: "Students Trained", value: "35" },
      { label: "Categories", value: "U10, U15, U19" },
      { label: "Certified Coach", value: "AFC B-License" },
    ],
    collaborators: [],
    source: {
      platform: "Instagram",
      url: "https://www.instagram.com/rotaract.clubof.lia/",
      verified: true,
    },
  },
];
