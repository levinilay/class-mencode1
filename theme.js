/**
 * Class-Man | Theme toggle (Light/Dark) – כפתור בתפריט
 */
(function () {
  const STORAGE_KEY = 'theme';
  const docEl = document.documentElement;

  function getStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setStored(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  }
  function getSystem() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function apply(theme) {
    docEl.dataset.theme = theme;
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? 'מצב בהיר' : 'מצב כהה');
    });
  }
  function toggle() {
    var current = docEl.dataset.theme || getSystem();
    var next = current === 'dark' ? 'light' : 'dark';
    apply(next);
    setStored(next);
  }
  function init() {
    // Force light mode always, regardless of system preference or localStorage
    apply('light');
    setStored('light'); // Clear any dark mode preference
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      // Disable theme toggle - always stay in light mode
      // btn.addEventListener('click', toggle);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
