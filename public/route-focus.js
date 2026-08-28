(function () {
  function focusHeading(announce) {
    var heading = document.querySelector('h1');
    if (!heading) return;
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    if (announce) {
      var status = document.getElementById('route-status');
      if (status) status.textContent = heading.textContent || document.title;
    }
  }

  if (document.referrer.indexOf(location.origin) === 0) {
    requestAnimationFrame(function () { focusHeading(true); });
  }
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) focusHeading(true);
  });
}());
