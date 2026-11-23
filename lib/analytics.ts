/** Google Tag Manager container. Override with NEXT_PUBLIC_GTM_ID; set it to "off" to disable. */
export const GTM_ID = (process.env.NEXT_PUBLIC_GTM_ID || "GTM-5FTNNKQS").trim();
export const CONSENT_KEY = "ns-consent";
const KEY = CONSENT_KEY;

/**
 * Google consent mode v2: everything is denied until the visitor accepts.
 * Advertising storage is never granted — only analytics, and only after "Accept".
 */
export const CONSENT_SCRIPT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
try{if(localStorage.getItem('${KEY}')==='granted'){gtag('consent','update',{analytics_storage:'granted'});}}catch(e){}
gtag('js',new Date());`;

