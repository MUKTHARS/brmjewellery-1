'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    sapleUser?: {
      email: string | null;
      name: string | null;
    };
    sapleBot?: (cmd: string, data?: any) => void;
  }
}

export default function LiveChat() {
  const { user } = useAuth();

  // Keep window.sapleUser in sync with the logged-in user
  useEffect(() => {
    if (user) {
      window.sapleUser = {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
      };
      
      // If the bot is already ready and loaded, identify the user immediately
      if (window.sapleBot) {
        window.sapleBot('identify', {
          customer_id: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
        });
      }
    } else {
      window.sapleUser = undefined;
    }
  }, [user]);

  useEffect(() => {
    let ready = false;
    const q: [string, any][] = [];

    // Define the global sapleBot control function
    window.sapleBot = (cmd: string, data?: any) => {
      if (ready && iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          Object.assign({ type: `saple:${cmd}` }, data),
          '*'
        );
      } else {
        q.push([cmd, data]);
      }
    };

    // Helper to get identify payload
    const getIdentifyPayload = () => {
      const email = window.sapleUser?.email || null;
      const name = window.sapleUser?.name || null;
      return email ? { customer_id: email, name: name || '' } : null;
    };

    // Create the iframe using initial dimensions from the updated script
    const w = window.innerWidth;
    const iframe = document.createElement('iframe');
    iframe.src = 'https://bot.saple.ai/d5b6596d-a77b-4442-bc34-a7978ae082d3/dd44b343-f2b7-4371-b341-2638236d4784';
    iframe.style.position = 'fixed';
    iframe.style.bottom = '0px';
    iframe.style.right = '0px';
    iframe.style.width = '100px';
    iframe.style.height = '100px';
    iframe.style.zIndex = '999';
    iframe.style.border = 'none';
    iframe.style.background = 'transparent';
    iframe.setAttribute('allowtransparency', 'true');
    iframe.allow = 'microphone';

    // Append to document
    document.body.appendChild(iframe);

    // Event listener for postMessage dynamic updates
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'saple:ready') {
        ready = true;
        const identity = getIdentifyPayload();
        if (identity) {
          iframe.contentWindow?.postMessage(
            Object.assign({ type: 'saple:identify' }, identity),
            '*'
          );
        }
        q.forEach((item) => {
          iframe.contentWindow?.postMessage(
            Object.assign({ type: `saple:${item[0]}` }, item[1]),
            '*'
          );
        });
        q.length = 0;
      }

      if (e.data && e.data.width && e.data.height) {
        iframe.style.width = w >= 600 ? e.data.width : `${Math.min(w, 460)}px`;
        iframe.style.height = `${Math.min(
          parseInt(e.data.height),
          Math.floor(window.innerHeight * 0.92)
        )}px`;
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup when component unmounts
    return () => {
      window.removeEventListener('message', handleMessage);
      window.sapleBot = undefined;
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    };
  }, []);

  return null;
}



