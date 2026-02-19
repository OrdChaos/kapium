/**
 * SEO utilities for unified meta tag and structured data management
 * 统一管理SEO、Meta标签和结构化数据的工具
 */

/**
 * SEO元数据接口，与之前兼容
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

/**
 * 结构化数据接口
 */
export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

/**
 * SEO配置接口
 */
export interface SEOConfig {
  title?: string;
  titleTemplate?: string;
  defaultTitle?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  robots?: string;
  lang?: string;
  ogType?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: StructuredData[];
  author?: string;
}

/**
 * 将SEOMetadata转换为SEO配置
 */
export function seoMetadataToSEOConfig(
  metadata: SEOMetadata,
  titleTemplate = '%s - Kapium'
): SEOConfig {
  const keywords = metadata.keywords?.join(', ');

  return {
    title: metadata.title,
    titleTemplate,
    description: metadata.description,
    keywords,
    canonical: metadata.canonical,
    robots: metadata.robots,
    lang: metadata.lang,
    ogType: metadata.ogType,
    ogTitle: metadata.ogTitle,
    ogDescription: metadata.ogDescription,
    ogImage: metadata.ogImage,
    ogUrl: metadata.ogUrl,
    twitterCard: metadata.twitterCard,
    twitterTitle: metadata.twitterTitle,
    twitterDescription: metadata.twitterDescription,
    twitterImage: metadata.twitterImage,
    author: metadata.author,
  };
}

/**
 * 生成meta标签配置
 */
export function generateMetaTags(config: SEOConfig): Array<Record<string, string>> {
  const meta: Array<Record<string, string>> = [];

  if (config.description) {
    meta.push({ name: 'description', content: config.description });
  }

  if (config.keywords) {
    meta.push({ name: 'keywords', content: config.keywords });
  }

  if (config.robots) {
    meta.push({ name: 'robots', content: config.robots });
  }

  if (config.author) {
    meta.push({ name: 'author', content: config.author });
  }

  // Open Graph标签
  if (config.ogType) {
    meta.push({ property: 'og:type', content: config.ogType });
  }

  if (config.ogTitle) {
    meta.push({ property: 'og:title', content: config.ogTitle });
  }

  if (config.ogDescription) {
    meta.push({ property: 'og:description', content: config.ogDescription });
  }

  if (config.ogImage) {
    meta.push({ property: 'og:image', content: config.ogImage });
  }

  if (config.ogUrl) {
    meta.push({ property: 'og:url', content: config.ogUrl });
  }

  // Twitter Card标签
  if (config.twitterCard) {
    meta.push({ name: 'twitter:card', content: config.twitterCard });
  }

  if (config.twitterTitle) {
    meta.push({ name: 'twitter:title', content: config.twitterTitle });
  }

  if (config.twitterDescription) {
    meta.push({ name: 'twitter:description', content: config.twitterDescription });
  }

  if (config.twitterImage) {
    meta.push({ name: 'twitter:image', content: config.twitterImage });
  }

  return meta;
}

/**
 * 生成link标签配置
 */
export function generateLinkTags(config: SEOConfig): Array<Record<string, string>> {
  const link: Array<Record<string, string>> = [];

  if (config.canonical) {
    link.push({ rel: 'canonical', href: config.canonical });
  }

  return link;
}

/**
 * 生成script标签配置（用于结构化数据）
 */
export function generateScriptTags(structuredData: StructuredData[]): Array<Record<string, any>> {
  return structuredData.map((data) => ({
    type: 'application/ld+json',
    innerHTML: JSON.stringify(data),
  }));
}

/**
 * 获取基础SEO元数据
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
 * 合并基础元数据与页面特定元数据
 */
export function mergeMetadata(base: SEOMetadata, page: SEOMetadata): SEOMetadata {
  return {
    ...base,
    ...page,
    title: page.title || base.title,
    description: page.description || base.description,
    ogTitle: page.ogTitle || page.title || base.ogTitle,
    ogDescription: page.ogDescription || page.description || base.ogDescription,
    ogImage: page.ogImage || base.ogImage,
    ogUrl: page.ogUrl || base.ogUrl,
    ogType: page.ogType || base.ogType,
    twitterCard: page.twitterCard || base.twitterCard,
    twitterTitle: page.twitterTitle || page.ogTitle || page.title || base.twitterTitle,
    twitterDescription: page.twitterDescription || page.ogDescription || page.description || base.twitterDescription,
    twitterImage: page.twitterImage || page.ogImage || base.twitterImage,
    keywords: page.keywords || base.keywords,
    robots: page.robots || base.robots,
    author: page.author || base.author,
  };
}

/**
 * 创建文章结构化数据 (BlogPosting)
 */
export function createArticleSchema(article: {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  author: string;
  url: string;
  keywords?: string[];
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.datePublished,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: import.meta.env.VITE_SITE_TITLE || 'Kapium',
      logo: {
        '@type': 'ImageObject',
        url: import.meta.env.VITE_SITE_LOGO || '',
      },
    },
    keywords: article.keywords?.join(', '),
    url: article.url,
  };
}

/**
 * 创建网站结构化数据 (WebSite)
 */
export function createWebsiteSchema(website: {
  name: string;
  description: string;
  url: string;
  logo?: string;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: website.name,
    description: website.description,
    url: website.url,
    logo: website.logo,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${website.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * 创建面包屑结构化数据 (BreadcrumbList)
 */
export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>): StructuredData {
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
