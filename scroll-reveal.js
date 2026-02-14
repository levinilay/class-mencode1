/**
 * Class-Man | Scroll reveal – אנימציית גלילה
 */
(function () {
  const scrollReveal = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  function observeAll() {
    document.querySelectorAll('.scroll-reveal').forEach(function (el) {
      scrollReveal.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeAll);
  } else {
    observeAll();
  }

  window.ScrollRevealObserve = observeAll;
})();
