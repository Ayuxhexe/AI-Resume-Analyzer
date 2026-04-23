import { AlertCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

const GoogleSignInButton = ({ mode, isBusy = false, onCredential }) => {
  const { theme } = useTheme();
  const [isReady, setIsReady] = useState(Boolean(window.google?.accounts?.id));
  const containerRef = useRef(null);
  const handlerRef = useRef(onCredential);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  handlerRef.current = onCredential;

  useEffect(() => {
    if (window.google?.accounts?.id) {
      setIsReady(true);
      return undefined;
    }

    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);

    if (existingScript) {
      existingScript.addEventListener('load', () => setIsReady(true));
      return undefined;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsReady(true);
    document.body.appendChild(script);

    return undefined;
  }, []);

  useEffect(() => {
    if (!clientId || !isReady || !containerRef.current || !window.google?.accounts?.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: ({ credential }) => {
        if (credential) {
          handlerRef.current?.(credential);
        }
      },
      ux_mode: 'popup',
      auto_select: false,
    });

    containerRef.current.innerHTML = '';

    window.google.accounts.id.renderButton(containerRef.current, {
      theme: theme === 'dark' ? 'filled_black' : 'outline',
      size: 'large',
      text: mode === 'register' ? 'signup_with' : 'signin_with',
      shape: 'pill',
      width: Math.min(containerRef.current.offsetWidth || 360, 360),
      logo_alignment: 'left',
    });
  }, [clientId, isReady, mode, theme]);

  if (!clientId) {
    return (
      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5" size={16} />
          <p>
            Google sign-in is ready in code, but `VITE_GOOGLE_CLIENT_ID` is not configured yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={isBusy ? 'pointer-events-none opacity-70' : ''}>
      <div ref={containerRef} className="flex justify-center" />
    </div>
  );
};

export default GoogleSignInButton;
