export default function ({ app: { router }}, inject) {
  if (<%= options.skipAll %>) {
    // inject empty gtag function for disabled mode
    inject('gtag', () => {})
    return
  }

  window.dataLayer = window.dataLayer || []

  function gtag () {
    dataLayer.push(arguments)

    if (<%= options.debug %>) {
      console.debug('gtag tracking called with following arguments:', arguments)
    }
  }

  inject('gtag', gtag)
  gtag('js', new Date())

  const consent = {
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    ad_storage: 'denied',
    analytics_storage: 'denied',
  };

  try {
    const localStorageConsent = localStorage.getItem('consent');
    if (localStorageConsent) {
      const { expiry, ...localConsent } = JSON.parse(localStorageConsent);
      const now = new Date();
      if (now.getTime() > expiry) {
        localStorage.removeItem('consent');
      }

      Object.assign(consent, localConsent);
    }
  } catch (e) {}

  gtag('consent', 'default', {
    'ad_storage': consent.ad_storage,
    'ad_user_data': consent.ad_user_data,
    'ad_personalization': consent.ad_personalization,
    'analytics_storage': consent.analytics_storage
  })

  gtag('config', '<%= options.id %>', <%= JSON.stringify(options.config, null, 2) %>)

  if (!<%= options.disableAutoPageTrack %>) {
    router.afterEach((to) => {
      gtag('config', '<%= options.id %>', { 'page_path': to.fullPath, 'location_path': window.location.origin + to.fullPath })
    })
  }

  // additional accounts
  <% Array.isArray(options.additionalAccounts) && options.additionalAccounts.forEach((account) => { %>
  gtag('config', '<%= account.id %>', <%= JSON.stringify(account.config, null, 2) %>)
  <% }) %>
}
