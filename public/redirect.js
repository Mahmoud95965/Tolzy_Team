// Automatic redirect to main domain: tolzy.vercel.app
(function() {
  'use strict';
  
  const MAIN_DOMAIN = 'tolzy.me';
  const ALTERNATE_DOMAINS = ['tolzy.me', 'tolzy.me'];
  
  const currentHost = window.location.hostname;
  
  // Check if current domain is one of the alternate domains
  if (ALTERNATE_DOMAINS.includes(currentHost)) {
    const currentPath = window.location.pathname + window.location.search + window.location.hash;
    const newUrl = `https://${MAIN_DOMAIN}${currentPath}`;
    
    // Redirect to main domain with 301 (permanent redirect)
    console.log(`Redirecting from ${currentHost} to ${MAIN_DOMAIN}`);
    window.location.replace(newUrl);
  }
})();
