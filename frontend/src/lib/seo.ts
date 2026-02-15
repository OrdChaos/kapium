/**
 * SEO utilities for managing meta tags and structured data
 */

export interface SEOMetadata {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  keywords?: string[];
  author?: string;
  robots?: string;
  lang?: string;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

/**
 * Update document meta tags
 */
export function updateMetaTags(metadata: SEOMetadata): void {
  // Update or create title tag
  if (metadata.title) {
    document.title = metadata.title;
  }

  // Helper function to update or create meta tags
  const updateMeta = (name: string, content: string, isProperty = false): void => {
    const attrName = isProperty ? 'property' : 'name';
    let meta = document.querySelector(`meta[${attrName}="${name}"]`) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attrName, name);
      document.head.appendChild(meta);
    }
    meta.content = content;
  };

  if (metadata.description) updateMeta('description', metadata.description);
  if (metadata.keywords?.length) updateMeta('keywords', metadata.keywords.join(', '));
  if (metadata.author) updateMeta('author', metadata.author);
  if (metadata.robots) updateMeta('robots', metadata.robots);

  // OG tags
  if (metadata.ogTitle) updateMeta('og:title', metadata.ogTitle, true);
  if (metadata.ogDescription) updateMeta('og:description', metadata.ogDescription, true);
  if (metadata.ogImage) updateMeta('og:image', metadata.ogImage, true);
  if (metadata.ogUrl) updateMeta('og:url', metadata.ogUrl, true);
  if (metadata.ogType) updateMeta('og:type', metadata.ogType, true);

  // Twitter Card tags
  if (metadata.twitterCard) updateMeta('twitter:card', metadata.twitterCard);
  if (metadata.twitterTitle) updateMeta('twitter:title', metadata.twitterTitle);
  if (metadata.twitterDescription) updateMeta('twitter:description', metadata.twitterDescription);
  if (metadata.twitterImage) updateMeta('twitter:image', metadata.twitterImage);
}

/**
 * Update canonical link
 */
export function setCanonical(url: string): void {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  
  canonical.href = url;
}

/**
 * Add structured data (JSON-LD) to the page
 */
export function addStructuredData(data: StructuredData, id?: string): HTMLScriptElement {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  if (id) script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
  return script;
}

/**
 * Remove structured data by ID
 */
export function removeStructuredData(id: string): void {
  const script = document.getElementById(id);
  if (script) {
    script.remove();
  }
}

/**
 * Create Article structured data
 */
export function createArticleSchema(data: {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
  keywords?: string[];
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.description,
    image: data.image,
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    author: {
      '@type': 'Person',
      name: data.author,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url,
    },
    ...(data.keywords && { keywords: data.keywords.join(', ') }),
  };
}

/**
 * Create WebSite structured data
 */
export function createWebsiteSchema(data: {
  name: string;
  description: string;
  url: string;
  logo?: string;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.name,
    description: data.description,
    url: data.url,
    ...(data.logo && { image: data.logo }),
  };
}

/**
 * Create BreadcrumbList structured data
 */
export function createBreadcrumbSchema(items: Array<{
  name: string;
  url: string;
}>): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Get base SEO metadata from environment
 */
export function getBaseMetadata(): SEOMetadata {
  return {
    title: import.meta.env.VITE_SITE_TITLE || 'Blog',
    description: import.meta.env.VITE_SITE_DESCRIPTION || 'Welcome',
    ogTitle: import.meta.env.VITE_SITE_TITLE || 'Blog',
    ogDescription: import.meta.env.VITE_SITE_DESCRIPTION || 'Welcome',
    ogImage: import.meta.env.VITE_SITE_OG_IMAGE,
    lang: 'zh-CN',
  };
}

/**
 * Merge base metadata with page-specific metadata
 */
export function mergeMetadata(base: SEOMetadata, page: SEOMetadata): SEOMetadata {
  return {
    ...base,
    ...page,
    keywords: page.keywords || base.keywords,
    robots: page.robots || base.robots,
  };
}
