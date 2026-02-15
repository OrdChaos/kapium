import { useEffect } from 'react';
import {
  updateMetaTags,
  setCanonical,
  addStructuredData,
  removeStructuredData,
  SEOMetadata,
  StructuredData,
  getBaseMetadata,
  mergeMetadata,
} from '@/lib/seo';

interface UseSEOOptions {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterImage?: string;
  keywords?: string[];
  robots?: string;
  structuredData?: StructuredData;
  structuredDataId?: string;
}

/**
 * Hook to manage SEO metadata for a page
 */
export function useSEO(options: UseSEOOptions = {}): void {
  const {
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    ogType,
    twitterCard = 'summary_large_image',
    twitterImage,
    keywords,
    robots,
    structuredData,
    structuredDataId = 'page-schema',
  } = options;

  useEffect(() => {
    const baseMetadata = getBaseMetadata();
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    
    const metadata: SEOMetadata = mergeMetadata(baseMetadata, {
      title: title ? `${title} - ${baseMetadata.title}` : baseMetadata.title,
      description: description || baseMetadata.description,
      ogTitle: ogTitle || title || baseMetadata.ogTitle,
      ogDescription: ogDescription || description || baseMetadata.ogDescription,
      ogImage: ogImage || baseMetadata.ogImage,
      ogUrl: ogUrl || currentUrl,
      ogType: ogType || 'website',
      twitterCard,
      twitterTitle: ogTitle || title || baseMetadata.ogTitle,
      twitterDescription: ogDescription || description || baseMetadata.ogDescription,
      twitterImage: twitterImage || ogImage || baseMetadata.ogImage,
      keywords,
      robots,
    });

    // Update meta tags
    updateMetaTags(metadata);

    // Update canonical
    if (canonical) {
      setCanonical(canonical);
    } else {
      setCanonical(currentUrl);
    }

    // Add structured data if provided
    if (structuredData) {
      // Remove existing structured data with same ID
      removeStructuredData(structuredDataId);
      // Add new structured data
      addStructuredData(structuredData, structuredDataId);
    }

    return () => {
      // Cleanup structured data on unmount
      if (structuredData) {
        removeStructuredData(structuredDataId);
      }
    };
  }, [
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    ogType,
    twitterCard,
    twitterImage,
    keywords,
    robots,
    structuredData,
    structuredDataId,
  ]);
}

/**
 * Hook to set page title only
 */
export function usePageTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} - ${import.meta.env.VITE_SITE_TITLE}`;
  }, [title]);
}
