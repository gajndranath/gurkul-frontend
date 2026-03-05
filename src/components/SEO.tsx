import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Gurukul Self Study Center | Smart Library & Digital Hub in Varanasi',
  description = 'Gurukul Self Study Center in Sarnath, Varanasi. A hybrid study sanctuary offering a peaceful green environment, 24/7 access, and a digital member app for payments, community chat, and PDF sharing.',
  keywords = 'Gurukul Self Study Center, Library in Varanasi, Digital Library Varanasi, Smart Library App, Sarnath Study Hub, Library for Students Varanasi, Student Community Chat, PDF Sharing Library, Payment Tracking Library, Best Library Sarnath, Shakti Pith Library',
  canonical = 'https://www.gurukulselfstudycentre.in',
  ogType = 'website',
  ogImage = '/og-image.jpg',
}) => {
  const siteTitle = title.includes('Varanasi') ? title : `${title} | Library Varanasi`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph tags (Facebook/LinkidIn) */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />

      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;
