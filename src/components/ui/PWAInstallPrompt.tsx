import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './Button';

interface PWAInstallPromptProps {
  className?: string;
}

export function PWAInstallPrompt({ className = '' }: PWAInstallPromptProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if the user has already dismissed the prompt
    const hasUserDismissedPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
    if (hasUserDismissedPrompt === 'true') {
      setDismissed(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
      // Show the prompt if not dismissed
      if (hasUserDismissedPrompt !== 'true') {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    };
  }, []);

  const handleInstall = () => {
    if (!installPrompt) return;

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond to the prompt
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // Clear the saved prompt as it can't be used again
      setInstallPrompt(null);
      setShowPrompt(false);
    });
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
  };

  if (!showPrompt || dismissed) return null;

  return (
    <div className={`fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50 ${className}`}>
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">Install SocialSync AI</h3>
          <p className="text-sm text-gray-600 mb-3">
            Install our app for a better experience and offline access.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleInstall} className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              Install
            </Button>
            <Button size="sm" variant="outline" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}