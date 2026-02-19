import { ReactNode, useEffect } from 'react';
import {
  SEOMetadata,
  StructuredData,
  seoMetadataToSEOConfig,
  generateMetaTags,
  generateLinkTags,
  generateScriptTags,
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
  structuredData?: StructuredData | StructuredData[];
  structuredDataId?: string;
  author?: string;
}

/**
 * Hook to manage SEO metadata using native React effects
 * 使用原生React效果管理SEO元数据的Hook
 * 
 * @example
 * const seoElement = useSEO({
 *   title: '页面标题',
 *   description: '页面描述',
 *   structuredData: createWebsiteSchema(...)
 * });
 * 
 * return (
 *   <>
 *     {seoElement}
 *     page content
 *   </>
 * );
 */
export function useSEO(options: UseSEOOptions = {}): ReactNode {
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
    author,
  } = options;

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
    author,
  });

  const seoConfig = seoMetadataToSEOConfig(metadata);
  const metaTags = generateMetaTags(seoConfig);
  const linkTags = generateLinkTags({ ...seoConfig, canonical: canonical || currentUrl });

  // 处理structuredData - 支持单个对象或数组
  let structuredDataArray: StructuredData[] = [];
  if (structuredData) {
    if (Array.isArray(structuredData)) {
      structuredDataArray = structuredData;
    } else {
      structuredDataArray = [structuredData];
    }
  }
  const scriptTags = generateScriptTags(structuredDataArray);

  // 使用useEffect直接操作DOM来设置SEO标签
  useEffect(() => {
    // 设置title
    if (seoConfig.title) {
      document.title = seoConfig.title;
    }

    // 设置meta标签
    metaTags.forEach(tag => {
      const existingTag = document.querySelector(`meta[name="${tag.name}"], meta[property="${tag.property}"]`);
      if (existingTag) {
        if (tag.content) existingTag.setAttribute('content', tag.content);
      } else {
        const meta = document.createElement('meta');
        if (tag.name) meta.name = tag.name;
        if (tag.property) meta.setAttribute('property', tag.property);
        if (tag.content) meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });

    // 设置link标签
    linkTags.forEach(tag => {
      const existingLink = document.querySelector(`link[rel="${tag.rel}"][href="${tag.href}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        Object.entries(tag).forEach(([key, value]) => {
          if (value) link.setAttribute(key, value.toString());
        });
        document.head.appendChild(link);
      }
    });

    // 设置script标签 (JSON-LD)
    scriptTags.forEach(tag => {
      const existingScript = document.querySelector(`script[type="${tag.type}"]`);
      if (existingScript) {
        existingScript.textContent = tag.innerHTML;
      } else {
        const script = document.createElement('script');
        Object.entries(tag).forEach(([key, value]) => {
          if (key === 'innerHTML' && value) {
            script.textContent = value.toString();
          } else if (value) {
            script.setAttribute(key, value.toString());
          }
        });
        document.head.appendChild(script);
      }
    });

    // 设置html lang属性
    if (seoConfig.lang) {
      document.documentElement.lang = seoConfig.lang;
    }

    // 清理函数
    return () => {
      // 清理meta标签
      metaTags.forEach(tag => {
        const selector = tag.name 
          ? `meta[name="${tag.name}"]` 
          : `meta[property="${tag.property}"]`;
        const existingTag = document.querySelector(selector);
        if (existingTag) {
          existingTag.remove();
        }
      });

      // 清理link标签
      linkTags.forEach(tag => {
        const existingLink = document.querySelector(`link[rel="${tag.rel}"][href="${tag.href}"]`);
        if (existingLink) {
          existingLink.remove();
        }
      });

      // 清理script标签
      scriptTags.forEach(tag => {
        const existingScript = document.querySelector(`script[type="${tag.type}"]`);
        if (existingScript) {
          existingScript.remove();
        }
      });
    };
  }, [seoConfig, metaTags, linkTags, scriptTags]);

  return null; // 不再返回JSX元素，因为直接操作DOM
}

/**
 * Hook to set page title only (deprecated, use useSEO instead)
 * @deprecated Use useSEO instead
 */
export function usePageTitle(title: string): ReactNode {
  return useSEO({ title });
}

// Export SEO utilities for direct use
export type { SEOMetadata, StructuredData } from '@/lib/seo';
export {
  createArticleSchema,
  createWebsiteSchema,
  createBreadcrumbSchema,
  getBaseMetadata,
  mergeMetadata,
  seoMetadataToSEOConfig,
} from '@/lib/seo';