(function () {
  function focusNotificationBanner() {
    const banner = document.querySelector('.govuk-notification-banner');
    if (!banner) return;

    if (!banner.hasAttribute('tabindex')) {
      banner.setAttribute('tabindex', '-1');
    }

    banner.scrollIntoView({ block: 'start' });
    banner.focus();
  }

  function initCaseNotesFeature() {
    focusNotificationBanner();
  }

  document.addEventListener('DOMContentLoaded', initCaseNotesFeature);
  window.addEventListener('load', function () {
    window.requestAnimationFrame(initCaseNotesFeature);
  });
})();
