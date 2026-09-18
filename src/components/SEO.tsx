import React, { useEffect } from 'react';
import { SITE_CONFIG, getCanonicalUrl, getAbsoluteImageUrl } from '../config/site';

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string | null;
  noindex?: boolean;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

/**
 * Safe JSON-LD serialization that protects against script-tag breakout.
 * Replaces '<' with unicode '\u003c' to prevent '</script>' injection attacks.
 */
function safeJsonLdStringify(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * Reusable SEO and head metadata manager.
 * Updates document.title, canonical link, Open Graph, Twitter cards, and JSON-LD structured data.
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description = SITE_CONFIG.defaultDescription,
  canonicalPath,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  noindex = false,
  jsonLd,
}) => {
  const fullTitle = title
    ? `${title} | ${SITE_CONFIG.shortName}`
    : SITE_CONFIG.defaultTitle;

  const resolvedCanonical = canonicalUrl
    ? canonicalUrl
    : canonicalPath
      ? getCanonicalUrl(canonicalPath)
      : typeof window !== 'undefined'
        ? window.location.href.split('?')[0].split('#')[0]
        : getCanonicalUrl('/');

  const resolvedOgImage = getAbsoluteImageUrl(ogImage);

  useEffect(() => {
    // 1. Update Document Title
    const originalTitle = document.title;
    document.title = fullTitle;

    // Helper: update or create <meta> tag
    const setMetaTag = (attributeName: string, attributeValue: string, content: string): HTMLMetaElement => {
      let element = document.querySelector<HTMLMetaElement>(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.content = content;
      return element;
    };

    // Helper: update or create <link rel="...">
    const setLinkTag = (rel: string, href: string): HTMLLinkElement => {
      let element = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.rel = rel;
        document.head.appendChild(element);
      }
      element.href = href;
      return element;
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setLinkTag('canonical', resolvedCanonical);

    // 3. Robots meta
    if (noindex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      setMetaTag('name', 'robots', 'index, follow, max-image-preview:large');
    }

    // 4. Open Graph Meta Tags
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', resolvedCanonical);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', resolvedOgImage);
    setMetaTag('property', 'og:site_name', SITE_CONFIG.name);
    setMetaTag('property', 'og:locale', SITE_CONFIG.locale);

    // 5. Twitter / X Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', resolvedOgImage);

    // 6. JSON-LD Structured Data
    const scriptId = 'lia-seo-structured-data';
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (jsonLd) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = scriptId;
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = safeJsonLdStringify(jsonLd);
    } else if (scriptElement) {
      scriptElement.remove();
    }

    return () => {
      // Revert title
      document.title = originalTitle;
      // Clean up injected structured data
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [fullTitle, description, resolvedCanonical, ogType, resolvedOgImage, noindex, jsonLd]);

  return null;
};
