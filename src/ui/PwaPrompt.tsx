import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PwaPromptProps {
  onInstallStatusChange?: (installed: boolean) => void;
}

export function PwaPrompt({ onInstallStatusChange }: PwaPromptProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [dismissedInstall, setDismissedInstall] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [waitingWorker, setWaitingWorker] =
    useState<ServiceWorker | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      setShowInstall(false);
      setDismissedInstall(true);
    };
    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            setNeedRefresh(true);
            setWaitingWorker(newWorker);
          }
        });
      });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onInstallStatusChange?.(true);
      }
    } catch {
      // user dismissed or error
    }
    setDeferredPrompt(null);
    setShowInstall(false);
  }, [deferredPrompt, onInstallStatusChange]);

  const handleDismissInstall = useCallback(() => {
    setShowInstall(false);
    setDismissedInstall(true);
  }, []);

  const handleUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setNeedRefresh(false);
  }, [waitingWorker]);

  const handleDismissUpdate = useCallback(() => {
    setNeedRefresh(false);
  }, []);

  if (!showInstall && !needRefresh) return null;

  return (
    <>
      {showInstall && !dismissedInstall && (
        <div className="pwa-prompt pwa-prompt-install">
          <div className="pwa-prompt-content">
            <span className="pwa-prompt-icon">&#128309;</span>
            <span className="pwa-prompt-text">
              Install Draw Tool for offline use
            </span>
            <button
              className="pwa-prompt-btn pwa-prompt-btn-primary"
              onClick={handleInstall}
            >
              Install
            </button>
            <button
              className="pwa-prompt-btn pwa-prompt-btn-dismiss"
              onClick={handleDismissInstall}
            >
              &#x2715;
            </button>
          </div>
        </div>
      )}

      {needRefresh && (
        <div className="pwa-prompt pwa-prompt-update">
          <div className="pwa-prompt-content">
            <span className="pwa-prompt-icon">&#128260;</span>
            <span className="pwa-prompt-text">
              A new version is available
            </span>
            <button
              className="pwa-prompt-btn pwa-prompt-btn-primary"
              onClick={handleUpdate}
            >
              Update
            </button>
            <button
              className="pwa-prompt-btn pwa-prompt-btn-dismiss"
              onClick={handleDismissUpdate}
            >
              &#x2715;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
