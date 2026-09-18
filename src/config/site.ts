import { CLUB_INFO } from '../data/club';

/**
 * Centralized Site Configuration for Rotaract Club of Lead India Ahead (LIA)
 * Supports VITE_SITE_URL environment override for production or custom domains.
 */
export const SITE_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) ||
  'https://lia-website-six.vercel.app'
).replace(/\/+$/, '');

export const SITE_CONFIG = {
  name: 'Rotaract Club of Lead India Ahead',
  shortName: 'Rotaract LIA',
  theme: 'MAAYON 2026–27',
  siteUrl: SITE_URL,
  defaultTitle: 'Rotaract Club of Lead India Ahead | MAAYON 2026–27',
  titleTemplate: '%s | Rotaract Club of LIA',
  defaultDescription:
    'Official website of the Rotaract Club of Lead India Ahead (LIA), chartered in 2012 under Rotary Club of Coimbatore Texcity, Rotaract District 3206. Dedicated to youth leadership, community service, fellowship, and professional development.',
  defaultOgImage: `${SITE_URL}/assets/logos/lia-shield.png`,
  locale: 'en_IN',
  social: {
    instagram: CLUB_INFO.contact.instagramUrl,
    linkedin: CLUB_INFO.contact.linkedinUrl,
    email: CLUB_INFO.contact.email,
  },
  organization: {
    name: CLUB_INFO.clubName,
    alternateName: CLUB_INFO.shortName,
    clubId: CLUB_INFO.clubId,
    district: CLUB_INFO.district,
    sponsorClub: CLUB_INFO.sponsorClub,
    established: CLUB_INFO.established,
    location: CLUB_INFO.location,
    president: CLUB_INFO.president,
  },
};

/**
 * Generates an absolute canonical URL from a relative path.
 */
export function getCanonicalUrl(path: string = '/'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

/**
 * Resolves an image path to an absolute URL suitable for Open Graph and Twitter cards.
 */
export function getAbsoluteImageUrl(imagePath?: string | null): string {
  if (!imagePath) return SITE_CONFIG.defaultOgImage;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${SITE_URL}${cleanPath}`;
}
