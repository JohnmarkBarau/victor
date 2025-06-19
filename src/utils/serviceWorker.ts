import { Workbox } from 'workbox-window';

export function registerSW() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js');

    // Add event listeners to handle updates
    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        console.log('New content is available; please refresh.');
        // Optionally show a notification to the user
        if (confirm('New version available! Click OK to refresh.')) {
          window.location.reload();
        }
      } else {
        console.log('Content is now available offline!');
      }
    });

    wb.addEventListener('waiting', () => {
      console.log('A new service worker has installed, but it can\'t activate until all tabs running the current version have been closed.');
      // Optionally show a notification to the user
    });

    wb.addEventListener('activated', (event) => {
      if (event.isUpdate) {
        console.log('New service worker activated after a page refresh.');
      } else {
        console.log('Service worker activated for the first time!');
        // Claim clients and update caches
        wb.messageSW({ type: 'CACHE_ASSETS' });
      }
    });

    wb.addEventListener('controlling', () => {
      console.log('Service worker is now controlling the page.');
    });

    wb.addEventListener('message', (event) => {
      console.log('Message from service worker:', event.data);
    });

    // Register the service worker
    wb.register()
      .then((registration) => {
        console.log('Service worker registered successfully:', registration);
      })
      .catch((error) => {
        console.error('Service worker registration failed:', error);
      });
  } else {
    console.log('Service workers are not supported in this browser.');
  }
}

// Function to check if the app is online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Function to check if the app is installed (PWA)
export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.matchMedia('(display-mode: fullscreen)').matches || 
         window.matchMedia('(display-mode: minimal-ui)').matches;
}

// Function to prompt user to install the PWA
export function promptPWAInstall(
  deferredPrompt: BeforeInstallPromptEvent,
  onSuccess?: () => void,
  onFailure?: (error?: Error) => void
) {
  if (!deferredPrompt) {
    onFailure?.(new Error('No installation prompt available'));
    return;
  }

  // Show the install prompt
  deferredPrompt.prompt();

  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice
    .then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA installation');
        onSuccess?.();
      } else {
        console.log('User dismissed the PWA installation');
        onFailure?.();
      }
    })
    .catch((error) => {
      console.error('Error during PWA installation prompt:', error);
      onFailure?.(error);
    });
}

// Function to check for app updates
export function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        registration.update();
      }
    });
  }
}

// Add a custom type for the BeforeInstallPromptEvent
declare global {
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
    prompt(): Promise<void>;
  }
  
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}