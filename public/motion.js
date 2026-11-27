const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

export function revealContent(root) {
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return () => {};

  const selector = [
    'h1', '.section h2', '.landing-label', '.intro', '.landing .credentials > div',
    '.wrap > .card', '.grid > .card', '.stack > .card', '.landing-quick > a',
    '.landing-faq > details', '.landing-cta .actions', '.course-compare', '.form'
  ].join(',');
  const observer = new IntersectionObserver(entries => {
    for (const {target, isIntersecting} of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      if (!reducedMotion.matches && !target.matches(':focus-within')) {
        target.classList.add('motion-enter');
      }
    }
  });
  for (const element of root.querySelectorAll(selector)) {
    if (!element.closest('.hero-copy')) observer.observe(element);
  }
  return () => observer.disconnect();
}

export function scrollToSection(element) {
  element?.scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth'});
}

export function bindPageScroll(header, backToTop) {
  function update() {
    header.classList.toggle('header-scrolled', window.scrollY > 12);
    backToTop.hidden = window.scrollY < 560;
  }
  window.addEventListener('scroll', update, {passive: true});
  backToTop.addEventListener('click', () => {
    header.querySelector('.brand').focus({preventScroll: true});
    window.scrollTo({top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  });
  update();
}
