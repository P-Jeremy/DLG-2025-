declare global {
  interface Window {
    __ENV__?: { VITE_API_URL?: string };
  }
}

export const API_BASE_URL: string = window.__ENV__?.VITE_API_URL ?? '';
