(function () {
  var navigationKey = 'ics-rescue:route-focus';
  var navigationWindowMs = 10000;

  function rememberInternalNavigation(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link || link.target && link.target !== '_self' || link.hasAttribute('download')) return;

    var destination;
    try {
      destination = new URL(link.href, location.href);
    } catch (_) {
      return;
    }

    if (destination.origin !== location.origin) return;
    if (destination.href === location.href || (destination.pathname === location.pathname && destination.search === location.search && destination.hash)) return;
    try {
      sessionStorage.setItem(navigationKey, String(Date.now()));
    } catch (_) {
      // Focus enhancement must not prevent a normal link navigation.
    }
  }

  function consumeInternalNavigation() {
    try {
      var timestamp = Number(sessionStorage.getItem(navigationKey));
      sessionStorage.removeItem(navigationKey);
      return Number.isFinite(timestamp) && timestamp > 0 && Date.now() - timestamp < navigationWindowMs;
    } catch (_) {
      return false;
    }
  }

  function isHistoryTraversal() {
    var entries = performance.getEntriesByType && performance.getEntriesByType('navigation');
    if (entries && entries.length && entries[0].type === 'back_forward') return true;
    return !!(performance.navigation && performance.navigation.type === 2);
  }

  function focusHeading(announce) {
    var heading = document.querySelector('h1');
    if (!heading) return;
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    if (announce) {
      var status = document.getElementById('route-status');
      if (status) {
        status.textContent = '';
        window.setTimeout(function () {
          status.textContent = heading.textContent || document.title;
        }, 0);
      }
    }
  }

  document.addEventListener('click', rememberInternalNavigation, true);

  if (consumeInternalNavigation() || isHistoryTraversal()) {
    requestAnimationFrame(function () { focusHeading(true); });
  }
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) focusHeading(true);
  });
}());
