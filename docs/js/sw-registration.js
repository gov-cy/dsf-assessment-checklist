// sw-registration.js
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js',{ scope: '/dsf-assessment-checklist/' })
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }
  