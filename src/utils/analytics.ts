import ReactGA from 'react-ga4';

// Check if browser supports Google Analytics
const isGASupported = () => {
  // Check if the browser is Chrome or Edge
  const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
  const isEdge = /Edge/.test(navigator.userAgent);
  
  // Check if content blockers are likely present
  const hasContentBlocker = window.navigator.userAgent.includes('AdBlock') || 
                           window.navigator.userAgent.includes('uBlock');
  
  return (isChrome || isEdge) && !hasContentBlocker;
};

// Initialize Google Analytics
export const initGA = (measurementId: string) => {
  if (isGASupported()) {
    ReactGA.initialize(measurementId);
  }
};

// Track page views
export const trackPageView = (path: string) => {
  if (isGASupported()) {
    ReactGA.send({ hitType: "pageview", page: path });
  }
};

// Track events
export const trackEvent = (category: string, action: string, label?: string) => {
  if (isGASupported()) {
    ReactGA.event({
      category,
      action,
      label,
    });
  }
}; 