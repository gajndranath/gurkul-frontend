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
  title = 'Gurukul Self Study Centre | Best Library in Varanasi & Sarnath',
  description = 'Join Gurukul Self Study Centre, the best library in Varanasi and Sarnath. Our digital library offers a peaceful study environment, high-speed internet, and comfortable seating for students.',
  keywords = 'Gurukul Self Study Centre, Library in Varanasi, Best Library in Sarnath, Digital Library Varanasi, Study Center Varanasi, Student Library Sarnath',
  canonical = 'https://gurukulselfstudycentre.com',
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
