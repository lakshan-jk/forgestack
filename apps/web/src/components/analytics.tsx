import Script from 'next/script';

/**
 * Privacy-friendly, cookieless web analytics — off by default. Loads only when
 * the deployer configures a self-hosted Umami and/or Plausible instance via
 * env. No third-party tracking is bundled; nothing runs unless opted in.
 */
export function Analytics() {
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const plausibleUrl = process.env.NEXT_PUBLIC_PLAUSIBLE_URL ?? 'https://plausible.io';

  return (
    <>
      {umamiUrl && umamiWebsiteId && (
        <Script
          src={`${umamiUrl.replace(/\/$/, '')}/script.js`}
          data-website-id={umamiWebsiteId}
          strategy="afterInteractive"
          defer
        />
      )}
      {plausibleDomain && (
        <Script
          src={`${plausibleUrl.replace(/\/$/, '')}/js/script.js`}
          data-domain={plausibleDomain}
          strategy="afterInteractive"
          defer
        />
      )}
    </>
  );
}
