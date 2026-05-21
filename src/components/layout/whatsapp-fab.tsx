'use client';

import { analytics } from '@/lib/analytics';

export function WhatsAppFab({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      onClick={() => analytics.whatsappClick('floating_button')}
      className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/40"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="currentColor"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M19.11 17.21c-.27-.14-1.61-.79-1.86-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.44-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3 0 1.36.98 2.67 1.12 2.86.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.55.58.65.2 1.24.17 1.7.1.52-.08 1.61-.66 1.84-1.3.23-.64.23-1.18.16-1.3-.07-.11-.25-.18-.52-.32z" />
        <path d="M16 3C8.82 3 3 8.82 3 16c0 2.28.6 4.51 1.74 6.47L3 29l6.69-1.74A12.94 12.94 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.56c-2.04 0-4.04-.54-5.78-1.57l-.41-.24-3.97 1.03 1.06-3.87-.27-.42A10.7 10.7 0 0 1 5.3 16C5.3 10.08 10.08 5.3 16 5.3S26.7 10.08 26.7 16 21.92 26.56 16 26.56z" />
      </svg>
    </a>
  );
}
