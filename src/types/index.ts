export type ClubInfo = {
  clubName: string;
  shortName: string;
  established: number;
  district: string;
  clubId: string;
  group: number;
  zone: number;
  location: string;
  sponsorClub: string;
  rotaryYear: string;
  currentTheme: string;
  themeStatementPlaceholder: string;
  president: {
    name: string;
    title: string;
    term: string;
  };
  contact: {
    phones: string[];
    email: string;
    instagram: string;
    instagramUrl: string;
    linkedin: string;
    linkedinUrl: string;
    address: string;
  };
  links: {
    joinUrl: string;
    volunteerUrl: string;
  };
};

export type Event = {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  date?: string;
  displayDate?: string;
  year: number;
  category: string;
  status: "completed" | "upcoming";
  location?: string;
  description: string;
  shortDescription: string;
  image?: string;
  featured: boolean;
  organizerType: "LIA" | "LIA_COLLABORATION" | "DISTRICT" | "EXTERNAL";
  liaRole: "ORGANIZER" | "CO_ORGANIZER" | "PARTICIPANT" | "REPRESENTATIVE";
  organizer?: string;
  collaborators?: string[];
  tags: string[];
  source?: {
    platform: "Instagram" | "LinkedIn" | "External";
    url?: string;
    verified: boolean;
  };
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  year: number;
  description: string;
  shortDescription: string;
  image: string;
  featured: boolean;
  impactMetrics?: {
    label: string;
    value: string;
  }[];
  collaborators?: string[];
  source?: {
    platform: "Instagram" | "LinkedIn" | "External";
    url?: string;
    verified: boolean;
  };
};

export type TeamMember = {
  id: string;
  name: string;
  position: string;
  term: string;
  image?: string;
  letterImage?: string;
  bio?: string;
  collegeOrCompany?: string;
  bloodGroup?: string;
  isExecutive?: boolean;
};

export type Milestone = {
  year: string;
  title: string;
  description: string;
  image?: string;
  category?: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  category: "EVENTS" | "PROJECTS" | "COMMUNITY" | "LEADERSHIP";
  image: string;
  date: string;
  caption?: string;
};
