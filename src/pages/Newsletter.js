/**
 * Newsletter page wrapper
 * Delegates to components/newsletter/NewsletterRoot for nested routing.
 */
import React from 'react';
import NewsletterRoot from '../components/newsletter/NewsletterRoot';

// Wrapper component so routing pattern matches other top-level pages (e.g., Explore.js)
export default function Newsletter() {
  return <NewsletterRoot />;
}
