/* icons.js — monochrome SVG icon library (measured from mock).
   Outline: stroke currentColor 1.8, round. Filled: fill currentColor. */
(function(){
const O=(p,vb)=>`<svg viewBox="${vb||'0 0 24 24'}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const F=(p,vb)=>`<svg viewBox="${vb||'0 0 24 24'}" fill="currentColor">${p}</svg>`;
const S=(p,vb,st)=>`<svg viewBox="${vb||'0 0 24 24'}" fill="none" stroke="currentColor" stroke-width="${st||1.8}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const L={
 /* navigation */
 'chev-l':O('<path d="M14.5 5.5 8 12l6.5 6.5"/>'),
 'chev-r':O('<path d="M9.5 5.5 16 12l-6.5 6.5"/>'),
 'chev-d':O('<path d="M5.5 9.5 12 16l6.5-6.5"/>'),
 'chev-u':O('<path d="M5.5 14.5 12 8l6.5 6.5"/>'),
 'arr-l':O('<path d="M19 12H5m0 0 6-6m-6 6 6 6"/>'),
 'arr-r':O('<path d="M5 12h14m0 0-6-6m6 6-6 6"/>'),
 /* tab bar */
 'home':F('<path d="M12 3.2c.4 0 .8.13 1.08.4l7 6.6c.23.2.35.5.35.8v8.2a1.8 1.8 0 0 1-1.8 1.8H14v-6h-4v6H5.43a1.8 1.8 0 0 1-1.8-1.8V11c0-.3.12-.6.35-.8l7-6.6c.29-.27.68-.4 1.02-.4Zm-2 16.8h4v-7h-4v7Z"/>'),
 'home-o':O('<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.5Z"/>'),
 'cart':O('<path d="M2.8 3h2.4l2.2 11.2a1.6 1.6 0 0 0 1.6 1.3h7.6a1.6 1.6 0 0 0 1.6-1.3L20 7.2H5.1"/><circle cx="9.5" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/>'),
 'cart-f':F('<path d="M2.7 2h2.3c.5 0 .96.34 1.08.83l1.9 9.84c.1.5.53.83 1.03.83h6.96c.5 0 .94-.34 1.03-.84L18.9 5.4a1.1 1.1 0 0 0-1.08-1.37H5.4L4.7 1.2A1.1 1.1 0 0 0 3.62.2H1.1a1.1 1.1 0 1 0 0 2.2Zm7.3 14.6a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8Zm6.9 0a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8Z"/>'),
 'heart':O('<path d="M12 20.4S3.6 15.5 2 10.9C.9 7.6 3 4 6.6 4c2.1 0 3.9 1.2 5.4 3.2C13.5 5.2 15.3 4 17.4 4c3.6 0 5.7 3.6 4.6 6.9-1.6 4.6-10 9.5-10 9.5Z"/>'),
 'heart-f':F('<path d="M12 21.2S3.1 15.9 1.5 10.8C.4 7.3 2.7 3.4 6.5 3.4c2.3 0 4.1 1.2 5.5 3.1 1.4-1.9 3.2-3.1 5.5-3.1 3.8 0 6.1 3.9 5 7.4-1.6 5.1-10.5 10.4-10.5 10.4Z"/>'),
 'chatb':O('<path d="M12 3.5c-5 0-9 3.2-9 7.2s4 7.2 9 7.2c.9 0 1.8-.1 2.6-.3l4 1.7-1.2-3.3c2-1.3 3.1-3 3.1-4.8 0-4-4-7.2-9-7.2Z"/><circle cx="8.3" cy="10.7" r=".9" fill="currentColor" stroke="none"/><circle cx="12" cy="10.7" r=".9" fill="currentColor" stroke="none"/><circle cx="15.7" cy="10.7" r=".9" fill="currentColor" stroke="none"/>'),
 'chatb-f':F('<path d="M12 2.5C6.5 2.5 2.5 6 2.5 10.1c0 4.1 4 7.6 9 7.6.8 0 1.6-.1 2.4-.3l3.9 2.1c.4.2.8-.1.7-.5l-1-3.5c2-1.4 3-3.1 3-5.4 0-4.1-4-7.6-8.5-7.6Zm-4.7 8.8a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Zm4.7 0a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Zm4.7 0a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z"/>'),
 'user':O('<circle cx="12" cy="7.6" r="3.7"/><path d="M4.6 20c1.2-3.6 4-5.4 7.4-5.4s6.2 1.8 7.4 5.4"/>'),
 'user-f':F('<circle cx="12" cy="7.5" r="4.2"/><path d="M12 13.8c-4.2 0-7.5 2.2-8.6 6.1-.1.5.2 1 .8 1h15.6c.6 0 .9-.5.8-1-1.1-3.9-4.4-6.1-8.6-6.1Z"/>'),
 /* actions */
 'search':O('<circle cx="10.8" cy="10.8" r="6.6"/><path d="m15.8 15.8 4.7 4.7"/><circle cx="14.6" cy="16.6" r="1.6"/>'),
 'sliders':O('<path d="M7 4v4m0 0a2.2 2.2 0 1 0 0 4.4A2.2 2.2 0 0 0 7 8Zm0 4.4V20M17 4v8m0 0a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Zm0 4.4V20"/>'),
 'bell':O('<path d="M12 3.5a5 5 0 0 0-5 5c0 5-1.8 6.3-1.8 6.3h13.6S17 13.5 17 8.5a5 5 0 0 0-5-5Z"/><path d="M10 18.5a2.2 2.2 0 0 0 4 0"/><path d="M12 6.4v2.4"/>'),
 'pin':O('<path d="M12 21s-6.6-5.4-6.6-10.4A6.6 6.6 0 0 1 12 4a6.6 6.6 0 0 1 6.6 6.6C18.6 15.6 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.1"/>'),
 'pin-f':F('<path d="M12 2.8a6.8 6.8 0 0 0-6.8 6.8C5.2 15 11.2 21 11.6 21.4c.2.2.6.2.8 0 .4-.4 6.4-6.4 6.4-11.8A6.8 6.8 0 0 0 12 2.8Zm0 9.4a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2Z"/>'),
 'nav-arrow':F('<path d="M20.8 3.2 3.7 10.6c-.7.3-.6 1.2.1 1.4l7 1.9 1.9 7c.3.7 1.2.8 1.4.1l6.7-17c.3-.7-.3-1.3-1-.8Z"/>'),
 'star':F('<path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9L12 2.6Z"/>'),
 'star-o':O('<path d="m12 3.2 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.7l6.1-.9L12 3.2Z"/>'),
 'eye-off':O('<path d="M4 4l16 16M9.9 5.4A9 9 0 0 1 12 5c5 0 9 4.5 10 7-.3.8-1.4 2.4-3.1 3.9M6.1 7.6C3.9 9.4 2.5 11.4 2 12c1 2.5 5 7 10 7 1.2 0 2.3-.3 3.3-.7"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
 'pencil':O('<path d="m14.5 5 4.5 4.5L8 20.5l-5 .5.5-5L14.5 5Z"/><path d="m12.5 7 4.5 4.5"/>'),
 'trash':O('<path d="M4 6.5h16M9.5 6V4.3c0-.7.6-1.3 1.3-1.3h2.4c.7 0 1.3.6 1.3 1.3V6M6.5 6.5 7.4 19c.1 1 .9 1.9 2 1.9h5.2c1.1 0 1.9-.9 2-1.9l.9-12.5"/><path d="M10 10.5v6M14 10.5v6"/>'),
 'check':S('<path d="m4.5 12.5 5 5L19.5 7"/>',null,2.2),
 'plus':S('<path d="M12 5v14M5 12h14"/>',null,2),
 'minus':S('<path d="M5 12h14"/>',null,2),
 'x':S('<path d="M6 6l12 12M18 6 6 18"/>',null,1.8),
 'x-c':O('<circle cx="12" cy="12" r="8.2"/><path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6" stroke-width="1.5"/>'),
 'wallet':O('<path d="M19 7.5V6a2 2 0 0 0-2-2H5.5A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20H19a2 2 0 0 0 2-2v-1.5"/><path d="M21 7.5h-9a2.5 2.5 0 0 0 0 5h9v-5Z"/><circle cx="15.5" cy="10" r=".9" fill="currentColor" stroke="none"/>'),
 'card':O('<rect x="2.8" y="5" width="18.4" height="14" rx="2.2"/><path d="M2.8 9.4h18.4M6 15.2h4"/>'),
 'box':O('<path d="m12 2.8 8 3.4v9.6l-8 3.4-8-3.4V6.2l8-3.4Z"/><path d="M4.3 6.4 12 9.8l7.7-3.4M12 9.8v9.9"/>'),
 'box-check':O('<path d="m12 2.8 8 3.4v9.6l-8 3.4-8-3.4V6.2l8-3.4Z"/><path d="M4.3 6.4 12 9.8l7.7-3.4M12 9.8v9.9"/><circle cx="17.5" cy="17.5" r="3.4" fill="#fff"/><path d="m15.9 17.4 1.2 1.2 2.1-2.2"/>'),
 'scooter':O('<circle cx="5.5" cy="17.5" r="2.3"/><circle cx="18.5" cy="17.5" r="2.3"/><path d="M8 17.5h8l1.8-8.7A2 2 0 0 0 15.9 7H13"/><path d="m5.4 15.2 1.9-6.4A2 2 0 0 1 9.2 7h.6"/><path d="M7.5 4h3.4l1 3H8.5"/>'),
 'bicycle':O('<circle cx="5.8" cy="16.5" r="3.3"/><circle cx="18.2" cy="16.5" r="3.3"/><path d="m5.8 16.5 3.6-8h4.4l4.4 8M12 8.2 9.4 3.8h2.4M18.2 16.5 15 8.5"/>'),
 'walk':O('<circle cx="13" cy="3.6" r="1.7"/><path d="m9 8.5 2.5-1.8 3 1.3 1.8 3.3M11.5 6.7l-1 4.5 3 2.5v6M10.5 11.2 8 14.5v2.5m5.5-3.3 2 3.3 1 4.5M7 9.5l1.5 2.2"/>'),
 'clock':O('<circle cx="12" cy="12" r="8.2"/><path d="M12 7.5V12l3 2"/>'),
 'cal':O('<rect x="3.5" y="5" width="17" height="16" rx="2.2"/><path d="M3.5 9.7h17M8 2.8v4M16 2.8v4"/><circle cx="8" cy="14" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="14" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="14" r="1" fill="currentColor" stroke="none"/><circle cx="8" cy="17.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="17.5" r="1" fill="currentColor" stroke="none"/>'),
 'clipboard':O('<rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9 4.5V3h6v1.5M8.7 10h6.6M8.7 13.6h6.6M8.7 17.2h4" />'),
 'ticket':O('<path d="M19 8V6.5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2V8a2.5 2.5 0 0 1 0 5v1.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V13a2.5 2.5 0 0 1 0-5Z" transform="rotate(-45 12 10.5)"/><path d="m10 10.5 4 4M13.5 9l.8.8M9.7 12.8l.8.8"/>'),
 'headset':O('<path d="M4.5 13.5v-2a7.5 7.5 0 0 1 15 0v2"/><rect x="3.6" y="13" width="3.6" height="6" rx="1.6"/><rect x="16.8" y="13" width="3.6" height="6" rx="1.6"/>'),
 'wa':O('<path d="M12 3a8.6 8.6 0 0 0-7.4 12.9L3.5 20.5l4.7-1.2A8.6 8.6 0 1 0 12 3Z"/><path d="M9 8.5c-.4 0-.8.4-.8.9 0 2.6 3 5.6 5.9 5.9.5.1.9-.3.9-.8v-1l-1.7-.8-.7.7c-1-.4-2-1.4-2.3-2.2l.7-.8L9 8.5h0Z"/>'),
 'globe':O('<circle cx="12" cy="12" r="8.4"/><path d="M3.6 12h16.8M12 3.6c-5.2 5.2-5.2 11.6 0 16.8 5.2-5.2 5.2-11.6 0-16.8Z"/>'),
 'fb':F('<path d="M13.5 21v-6.8h2.3l.4-2.7h-2.7V9.8c0-.8.3-1.3 1.4-1.3h1.4V6.1c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7v1.9H8.2v2.7h2.4V21h2.9Z"/>'),
 'xlogo':F('<path d="M17.6 3h3.1l-6.8 7.8L21.9 21h-6.3l-4.9-6.4L5 21H1.9l7.3-8.3L2.1 3h6.4l4.4 5.9L17.6 3Zm-1.1 16.1h1.7L7.7 4.7H5.8l10.7 14.4Z"/>'),
 'ig':O('<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.9"/><circle cx="17.1" cy="6.9" r="1.1" fill="currentColor" stroke="none"/>'),
 'gear':O('<circle cx="12" cy="12" r="3.1"/><path d="M12 2.9 13 5.2a7 7 0 0 1 2.1.9l2.4-.9 2 3.4-1.9 1.7c0 .3.1.7.1 1s0 .7-.1 1l1.9 1.7-2 3.4-2.4-.9a7 7 0 0 1-2.1.9L12 21.1 11 18.8a7 7 0 0 1-2.1-.9l-2.4.9-2-3.4L6.4 13.7 6.3 12l.1-1.7-1.9-1.7 2-3.4 2.4.9a7 7 0 0 1 2.1-.9l1-2.3h0Z" transform="scale(.9) translate(1.3 1.3)"/>'),
 'key':O('<circle cx="8" cy="13" r="4.2"/><path d="m11 10 8.5-5.5M17 6.5l2 2.5M14.2 8.8l2 2.5"/>'),
 'sun':O('<circle cx="12" cy="12" r="4.3"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>'),
 'download':O('<path d="M12 4v9.5m0 0 3.7-3.7M12 13.5 8.3 9.8"/><rect x="4.5" y="15.5" width="15" height="5" rx="1.6"/>'),
 'share':O('<circle cx="6" cy="12" r="2.6"/><circle cx="17.5" cy="5.5" r="2.6"/><circle cx="17.5" cy="18.5" r="2.6"/><path d="m8.4 10.8 6.8-4M8.4 13.2l6.8 4"/>'),
 'more':F('<circle cx="12" cy="5.2" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="18.8" r="1.6"/>'),
 'mic':O('<rect x="9" y="3" width="6" height="10.5" rx="3"/><path d="M5.8 10.8a6.2 6.2 0 0 0 12.4 0M12 17v3.5"/>'),
 'smile':O('<circle cx="12" cy="12" r="8.4"/><path d="M8.3 14.2a4.6 4.6 0 0 0 7.4 0M8.6 9.5h.01M15.4 9.5h.01" stroke-width="2"/>'),
 'link2':O('<path d="m10 14.5 4.5-5M8.5 11 7 12.5a4.2 4.2 0 0 0 6 6L14.5 17M15.5 13 17 11.5a4.2 4.2 0 0 0-6-6L9.5 7"/>'),
 'phone':O('<path d="M6.9 3.5H9l1.7 4.2-2 1.7a12.4 12.4 0 0 0 6 6l1.7-2 4.2 1.7v2.1c0 1.1-.9 2-2 2C10.6 19.2 4.8 13.4 4.8 5.5c0-1.1.9-2 2-2Z" transform="scale(.92) translate(1 1)"/><path d="M14.5 8a3.4 3.4 0 0 1 3 3.5M14.5 4.5a7 7 0 0 1 6.5 6.8" stroke-width="1.6"/>'),
 'msgsq':O('<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4.3 3.1c-.4.3-.9 0-.9-.5L4 6Z"/><circle cx="8.6" cy="10.5" r=".9" fill="currentColor" stroke="none"/><circle cx="12.4" cy="10.5" r=".9" fill="currentColor" stroke="none"/><circle cx="16.2" cy="10.5" r=".9" fill="currentColor" stroke="none"/>'),
 'cash':O('<rect x="2.8" y="6.5" width="18.4" height="11" rx="2"/><path d="M6 12h.01M18 12h.01" stroke-width="2.2"/><circle cx="12" cy="12" r="2.6"/>'),
 'percent':O('<circle cx="12" cy="12" r="8.2"/><path d="m15 9-6 6M9.3 9.3h.01M14.7 14.7h.01" stroke-width="1.9"/>'),
 'spark':F('<path d="M12 1.5c.5 4.8 1.8 6.7 7 8-5.2 1.3-6.5 3.2-7 8-.5-4.8-1.8-6.7-7-8 5.2-1.3 6.5-3.2 7-8Z"/>', '0 0 24 24'),
 'sparkle2':F('<path d="M9 0c.4 4 1.5 5.6 5.8 6.7C10.5 7.9 9.4 9.5 9 14c-.4-4.5-1.5-6.1-5.8-7.3C7.2 5.6 8.6 4 9 0Z"/><path d="M17.5 13c.25 2.3.9 3.2 3.3 3.8-2.4.7-3 1.6-3.3 4.2-.3-2.6-.9-3.5-3.3-4.2 2.4-.6 3.05-1.5 3.3-3.8Z"/>','0 0 21 21'),
 'play':F('<path d="M8 5.5v13l11-6.5-11-6.5Z"/>'),
 'pause':F('<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>'),
 'ff':F('<path d="M4 5.5v13l8.5-6.5L4 5.5Zm9.5 0v13l8.5-6.5-8.5-6.5Z"/>'),
 'rr':F('<path d="M20 5.5v13l-8.5-6.5 8.5-6.5Zm-9.5 0v13L2 12l8.5-6.5Z"/>'),
 'expand':O('<path d="M4 4v4M4 4h4M4 4l5 5M20 20v-4m0 4h-4m4 0-5-5"/>'),
 'vsetting':O('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3h.1A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z"/>'),
 'cast':O('<path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M3 10a11 11 0 0 1 11 11M3 14.5A6.5 6.5 0 0 1 9.5 21M3 19a2 2 0 0 1 2 2"/>'),
 'badge-check':F('<path d="M12 1.8 14.3 4l3.1-.4 1 3 3 1.1-.4 3.1 2.2 2.3-2.2 2.3.4 3.1-3 1.1-1 3-3.1-.4L12 24l-2.3-2.2-3.1.4-1-3-3-1.1.4-3.1L.8 12 3 9.7l-.4-3.1 3-1.1 1-3 3.1.4L12 1.8Z" transform="scale(.92)"/><path d="m8.6 12.3 2.3 2.3 4.5-4.6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
 'logo':`<svg viewBox="0 0 150 130" fill="none">
  <path d="M14 22h18l9 39" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M50 78a34 34 0 1 1 31-19" stroke="#fff" stroke-width="15" stroke-linecap="round"/>
  <path d="M84 49h19v12" stroke="#fff" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M48 79c10 8 22 10 33 5" stroke="#fff" stroke-width="10" stroke-linecap="round"/>
  <path d="M66 84c0-10 7-17 17-18-1 10-7 17-17 18Z" fill="#fff"/>
  <path d="M66 84c4-6 9-11 15-14" stroke="#909090" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="47" cy="101" r="7.6" fill="#fff"/><circle cx="83" cy="101" r="7.6" fill="#fff"/>
 </svg>`,
 /* status bar parts */
 'signal':F('<rect x="1" y="14" width="3.4" height="5" rx="1"/><rect x="6.2" y="11" width="3.4" height="8" rx="1"/><rect x="11.4" y="8" width="3.4" height="11" rx="1"/><rect x="16.6" y="5" width="3.4" height="14" rx="1"/>','0 0 21 24'),
 'wifi':F('<path d="M12 17.6a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8Zm0-5.6c2.4 0 4.6.9 6.2 2.5l-2 2a6.7 6.7 0 0 0-8.4 0l-2-2A9 9 0 0 1 12 12Zm0-5.4c3.9 0 7.4 1.5 10 4l-2 2a11.4 11.4 0 0 0-16 0l-2-2c2.6-2.5 6.1-4 10-4Z"/>','0 0 24 24'),
 'batt':F('<rect x="1.5" y="7" width="18" height="10" rx="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3.7" y="9.2" width="11" height="5.6" rx="1.2"/><path d="M22 10.5v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>','0 0 25 24'),
 /* social brand (monochrome as in mock) */
 'apple':F('<path d="M16.8 12.9c0-2.5 2.1-3.7 2.2-3.8-1.2-1.7-3-2-3.7-2-1.6-.1-3 .9-3.8.9-.8 0-2-.9-3.4-.8-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.8 1.3 10.3.9 1.2 1.9 2.6 3.2 2.5 1.3 0 1.8-.8 3.4-.8s2 .8 3.3.8c1.4 0 2.2-1.2 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.8-4.3ZM14.3 5.3c.7-.8 1.1-1.9 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.5 2.9-1.4Z"/>'),
 'gpay':F('<path d="M12 11.1v3.7h6.1c-.3 2.8-3 4.6-6.1 4.6a6.8 6.8 0 1 1 0-13.6c1.7 0 3.2.6 4.4 1.6l2.8-2.8A10.3 10.3 0 1 0 12 22.3c5.9 0 9.8-4.1 9.8-9.9v-1.3H12Z"/>'),
 'paypal':F('<path d="M7.2 21 9.4 6.6A2.4 2.4 0 0 1 11.8 4.6h4.4c3.6 0 5.9 2.3 5.3 5.6-.7 3.6-3.3 5.5-6.9 5.5h-2.6l-.9 5.3H7.2Zm4.7-8.2h1.9c2.2 0 3.6-1.2 3.9-3.3.2-1.8-.9-3-2.9-3h-2.4l-.5 3.3Z"/>'),
 /* small extras */
 'q-dot':O('<circle cx="12" cy="12" r="7.6"/><circle cx="12" cy="12" r="2.6"/>'),
 'target':O('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.8"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/>'),
 'cam':O('<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1.5-2.3h5.6L16.3 6h1.2A2.5 2.5 0 0 1 20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-9Z"/><circle cx="12" cy="13" r="3.4"/><circle cx="12" cy="13" r="1.1" fill="currentColor" stroke="none"/>'),
 'doc':O('<path d="M7 3.5h7.5L19 8.3V19a1.7 1.7 0 0 1-1.7 1.7H7A1.7 1.7 0 0 1 5.3 19V5.2A1.7 1.7 0 0 1 7 3.5Z"/><path d="M14.5 3.5V8H19M8.5 12.5h7M8.5 16h5"/>'),
};
/* ------- category filled glyphs ------- */
const C={
 'vegetables':F('<path d="M4 10.5h16a8 8 0 0 1-16 0Z"/><path d="M12 3.2c.4 0 2 .7 2.2 2.4 1.3-.3 2.6.3 3 1.3 1.2-.2 2.3.7 2.3 2.1H4.5c0-1.8 1.3-3 3-3.1C8 4.7 9.4 3.2 12 3.2Zm-1.5 1c-1.2.7-1.9 1.7-2 3l.1 1.3h2.2l-.4-4c0-.2.1-.3.1-.3Z"/><path d="M6 19h12l-.8 1.6H6.8L6 19Z"/>'),
 'fruits':F('<path d="M8.5 8.3c.8-1.6 2.5-2.5 3.7-2.3 0-1.5.7-2.7 2-3.3.3 1.4-.2 2.8-1.1 3.6 1.6-.3 3.2.2 4.2 1.5"/><path d="M3.5 10.5c0-1.1.9-2 2-2h13c1.1 0 2 .9 2 2s-.9 2-2 2h-13c-1.1 0-2-.9-2-2Z"/><path d="M4.7 13.2h14.6l-1.6 6.1a2 2 0 0 1-2 1.5H8.3a2 2 0 0 1-2-1.5l-1.6-6.1Z"/><path d="m8 15.5 1 3.5M12 15.5v3.5m4-3.5-1 3.5" stroke="#f4f4f4" stroke-width="1.2" fill="none"/>'),
 'drinks':F('<path d="M6 6.5h12l-1.3 12.1a2.2 2.2 0 0 1-2.2 2H9.5a2.2 2.2 0 0 1-2.2-2L6 6.5Z"/><path d="M5.6 6.5h12.8v1.8H5.6z"/><path d="M13.5 2 12 6.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="12" cy="12" rx="3" ry="2.4" fill="#f4f4f4"/>'),
 'milk':F('<path d="M9 2.8h5v2.4l1.9 2.6v11.5a1.7 1.7 0 0 1-1.7 1.7H8.8a1.7 1.7 0 0 1-1.7-1.7V7.8L9 5.2V2.8Z"/><path d="M9 2.8h5v1.8H9zM13.9 10.5c.9 1.3 1.4 2.3 1.4 3a1.9 1.9 0 1 1-3.8 0c0-.7.5-1.7 1.4-3a.7.7 0 0 1 1 0Z" fill="#f4f4f4"/>'),
 'cakes':F('<path d="M8 9.2a4 4 0 1 1 8 0H8Z"/><path d="M6.2 9.2h11.6a1.2 1.2 0 0 1 0 2.4H6.2a1.2 1.2 0 0 1 0-2.4Z"/><path d="M7 11.6 8.6 19a1.6 1.6 0 0 0 1.6 1.3h3.6A1.6 1.6 0 0 0 15.4 19L17 11.6l-1 3.2-1.6-2.1-1.4 2.4-1-2-1 2-1.4-2.4L9 14.8 7 11.6Z"/>'),
 'icecream':F('<path d="M7.5 10a4.5 4.5 0 1 1 9 0Z"/><circle cx="9" cy="6.5" r="3"/><circle cx="15" cy="6.8" r="2.8"/><path d="M5.8 11.5h12.4l-1 7.6a2 2 0 0 1-2 1.7H8.8a2 2 0 0 1-2-1.7l-1-7.6Z"/>'),
 'bakery':F('<path d="M7 3h10l1 3.2H6L7 3Z"/><path d="M6 6.2h12v11.3a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 17.5V6.2Z"/><path d="M6 6.2h12v2.6H6zM9.4 9.8v7.4M12 9.8v7.4M14.6 9.8v7.4" stroke="#f4f4f4" stroke-width="1.15" fill="none"/>'),
 'snacks':F('<path d="M4 11h16a8 8 0 0 1-16 0Z"/><path d="M8.5 10.8 5.4 6.9c-.4-.5-.1-1.3.5-1.4 1.6-.3 3.3.8 3.8 2.4L10.5 10h1.5l2.2-3.6c.7-1.1 2-1.5 3.1-.9.5.3.7.9.4 1.4l-2.5 4M11 13l6.5 1.5c.8.2 1.3-.6 1-1.3-.9-1.8-2.7-2.4-4.4-1.7"/><path d="M6 19.5h12l-.8 1.5H6.8l-.8-1.5Z"/>'),
 'grain':F('<path d="M5.5 5.5h13a1.8 1.8 0 0 1 0 3.6h-13a1.8 1.8 0 0 1 0-3.6Z"/><path d="M6.2 9.7h11.6v8.6a2.7 2.7 0 0 1-2.7 2.7H8.9a2.7 2.7 0 0 1-2.7-2.7V9.7Z"/><path d="M12 12.2c-1.8.5-2.5 1.8-2.3 3.3.5 1.4 1.7 2.2 2.3 2.2s1.8-.8 2.3-2.2c.2-1.5-.5-2.8-2.3-3.3Zm0-4.7v3M12 4.5c-.8 0-1.4-.6-1.4-1.3h2.8c0 .7-.6 1.3-1.4 1.3Z"/>'),
 'skincare':F('<rect x="3.5" y="8.5" width="5" height="11" rx="1.6"/><path d="M4.5 8.5V6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2.5"/><rect x="10" y="5" width="5.5" height="14.5" rx="1.6"/><rect x="11.5" y="2.5" width="2.5" height="2.5" rx=".8"/><rect x="16.7" y="10.5" width="4" height="9" rx="1.4"/><path d="M20.7 5.5c1 1.4 1.5 2.4 1.5 3a1.8 1.8 0 1 1-3.6 0c0-.6.5-1.6 1.5-3a.4.4 0 0 1 .6 0Z"/>'),
 'soap':F('<rect x="5" y="6.5" width="14" height="11" rx="3.2"/><ellipse cx="12" cy="12" rx="4.4" ry="2.4" fill="#f4f4f4"/>'),
 'dryfruit':F('<path d="M8 20.5c-2.8-.7-4.5-2.6-4.3-4.9.2-2 2-3 4.4-3.4-1-1.9-.5-4 .8-5 .9.9 1.5 2 1.7 3.4.3-2.1 1.8-3.6 4-4 .4 2.2-.5 4.2-2 5.3 1.9-.4 3.8.2 4.6 1.8-.7.8-1.7 1.4-2.9 1.7 1.5 1 2 2.7 1.2 4.1-1.2.5-2.6.3-3.8-.6.4 1-.1 2.1-1.1 2.6-.8-.8-1.2-1.9-1-3Z"/>'),
 'coffee':F('<path d="M7 4.2C4.7 5.4 3.4 7.9 4.1 10.6c.7 2.6 3 4.3 5.6 4.4.3-1.7 1.2-3.4 2.6-4.6C11 9.3 9.2 8.6 8 7.3c-.6-.7-1-1.6-1-3.1Zm10.2 1c2.3 1.4 3.4 4 2.6 6.7-.8 2.6-3.2 4.2-5.9 4.1-.2-1.7-1.1-3.3-2.5-4.5 1.2-1.2 3-1.9 4.2-3.2.6-.7 1.1-1.7 1.6-3.1Z"/><path d="M4.1 10.6c2.2-.3 4.2.6 5.6 2.3m10.1-1c-2.2-.3-4.3.7-5.7 2.3" fill="none" stroke="#f4f4f4" stroke-width="1.2"/><path d="M3.5 17.8c3.5 1.4 7 1.6 10.5.6 2.8-.8 5-2.3 6.5-4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'),
 'sugar':F('<path d="M6 9h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9Z"/><path d="M7.5 9c0-2.8 2-5 4.5-5s4.5 2.2 4.5 5"/><path d="M6 9h12v2.5H6zM8.4 13h7.2v4.6H8.4z" fill="#f4f4f4"/><text x="12" y="16.6" font-size="3.4" text-anchor="middle" fill="#909090" font-family="sans-serif" font-weight="bold">SUGAR</text>'),
 'biscuit':F('<circle cx="9.2" cy="12.5" r="6"/><circle cx="9.2" cy="10.6" r=".9" fill="#f4f4f4"/><circle cx="7.4" cy="13.5" r=".9" fill="#f4f4f4"/><circle cx="11.2" cy="12.8" r=".9" fill="#f4f4f4"/><path d="M15.5 7.6a5.5 5.5 0 0 1 4 9.2" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="18.8" cy="6.9" r="1.7"/><circle cx="20.6" cy="3.6" r="1.2"/>'),
 'petfood':F('<path d="M7.5 3.5h9a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z"/><path d="M7.5 3.5h9a2 2 0 0 1 2 2v2h-11v-2a2 2 0 0 1 2-2Zm1.6 13.2a2.1 2.1 0 1 1 3.4-1.7c.5-.6 1.4-.6 1.9 0a2.1 2.1 0 1 1 3.4 1.7c-.7.7-1.8 1.2-2.7 1.7l-.8.4-.8-.4c-.9-.5-2-1-2.7-1.7Z" fill="#f4f4f4" transform="translate(-2.5 -1)"/><path d="M9.4 15.4a1.4 1.4 0 1 1 2.2 1.1l-.2.2h-1.8a1.4 1.4 0 0 1-.2-1.3Zm5.2 0a1.4 1.4 0 1 1 2.2 1.1l-.2.2h-1.8a1.4 1.4 0 0 1-.2-1.3Z" fill="#f4f4f4"/>'),
 'haircare':F('<rect x="3.8" y="6" width="6" height="14" rx="2.2"/><rect x="5.5" y="2.5" width="2.6" height="3.5" rx="1"/><path d="M6.8 10.5v3" stroke="#f4f4f4" stroke-width="1.5" stroke-linecap="round"/><path d="M17.5 5.5v13.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M15.5 8.5c0-2 1.2-3 2-3s2 1 2 3v1.5h-4V8.5Z"/><path d="M15.5 12c0 2 1.2 3 2 3s2-1 2-3v-1.5h-4V12Zm2 3.5c.6 1 .9 1.8.9 2.2a.9.9 0 1 1-1.8 0c0-.4.3-1.2.9-2.2Z"/>'),
 'baby':F('<rect x="3.5" y="8" width="6.5" height="11.5" rx="2.4"/><path d="M5 8V6.7c0-.6.5-1 1-1h1.5c.6 0 1 .4 1 1V8M6 3.5v2.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="m5.5 12 2.5 1.7M8 10.5l-2.5 1.7" stroke="#f4f4f4" stroke-width="1.3" fill="none"/><path d="M13.5 14.5c0-2.5 2-4.2 4.4-3.9 1 .1 1.8.6 2.3 1.4l.8-1.6c.4 1.7-.3 3.4-1.6 4.3.3.1.7.2.9.5-1 1.6-2.7 2.4-4.4 2.3-1.5-.1-2.4-1.3-2.4-3Z"/><circle cx="18.3" cy="12.6" r=".65" fill="#909090"/><path d="M14.8 13c.8-.4 1.7-.5 2.5-.3" fill="none" stroke="#f4f4f4" stroke-width="1.1"/>'),
 'kitchen':F('<path d="M6.5 3c-1.8 0-3 1.9-3 4s1.2 3.5 2.5 3.8V20a1.5 1.5 0 0 0 3 0v-9.2c1.3-.3 2.5-1.7 2.5-3.8s-1.2-4-3-4c-.6 0 .4 8 .4 8" transform="translate(-1.5 0)"/><path d="M7.5 3v5m0-5c-1.7 0-2.8 1.8-2.8 3.9s1 3.4 2.3 3.7V20a1.4 1.4 0 0 0 2.8 0v-9.4" transform="rotate(18 12 12)"/><path d="M17 3v6.2c-1 0-1.8-.8-1.8-1.8S16 3.6 17 3Zm0 6.2c1 0 1.8-.8 1.8-1.8S18 3.6 17 3Zm0 6.4V20a1.4 1.4 0 0 1-2.8 0v-9.3c.3 1.5 1.4 2.6 2.8 2.6s2.5-1.1 2.8-2.6V20a1.4 1.4 0 0 1-2.8 0v-4.4Z" transform="rotate(-18 17 12) translate(0 .5)"/>'),
 'garden':F('<path d="M13.5 4.5c3 0 5.5 2 6 5-3.2.2-5.5-1.5-6-5Zm-1 1.4c.4 2.5 2.1 4.2 4.6 4.6-2.6 1.6-5.4 1-6.6-.8-.5-1-.3-2.8 2-3.8ZM8.3 10.5l7.2-3.4 1.4 3-3.8 1.7.5 2.3c.1 2.1-1.2 3.9-3.2 4.2l-3 .6.9-4.5c.2-1 .1-2.3-.7-2.4-1.6-.2-2 .5-2.4-.3-.3-.6.5-1 2.1-1.2Z"/><path d="M4 21c2-1.6 4-2.6 6.5-3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
 'laundry':F('<path d="M8 4.5 9.5 2h3L14 4.5"/><rect x="6.5" y="4.5" width="9" height="15.5" rx="2.4"/><path d="M6.5 8.5h9" stroke="#f4f4f4" stroke-width="1.4"/><path d="M11 12c1.8 0 3 1.1 3 2.7 0 1.2-.7 2.3-1.7 2.8l1.7 2h-4l1.7-2a3.1 3.1 0 0 1-1.7-2.8c0-1.6 1.2-2.7 2.5-2.7Z" transform="translate(-.5 -1)"/>'),
 'chocolates':F('<rect x="4" y="5" width="7" height="5.5" rx="1.4"/><rect x="13" y="5" width="7" height="5.5" rx="1.4"/><rect x="4" y="13" width="7" height="5.5" rx="1.4"/><rect x="13" y="13" width="7" height="5.5" rx="1.4"/><path d="M5.5 6.5c1-1 2.5-1 3 0a3.3 3.3 0 0 1 3 2.5M14.5 14.5c1-1 2.5-1 3 0a3.3 3.3 0 0 1 3 2.5" fill="none" stroke="#f4f4f4" stroke-width="1.2"/>'),
 'frozen':F('<path d="M7.5 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M7.5 4h9a2 2 0 0 1 2 2v1.6h-11V6a2 2 0 0 1 2-2Zm-2 14.4h11V18a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-1.6Z" fill="#f4f4f4"/><path d="M12 9.5v6M9.7 10.7l4.6 2.6m0-2.6-4.6 2.6M12 9.5 10.8 8.5M12 9.5l1.2-1M12 15.5l-1.2 1m1.2-1 1.2 1" fill="none" stroke="#f4f4f4" stroke-width="1.15" stroke-linecap="round"/>'),
};
window.ICON=function(n){return L[n]||''};
window.CATICON=function(n){return C[n]||''};
})();
