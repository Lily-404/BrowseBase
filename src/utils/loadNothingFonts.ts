const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Doto:wght@400;700&family=Space+Grotesk:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap';

/** Admin / Login 专用字体，避免拖慢首页首屏 */
export function loadNothingFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('nothing-fonts')) return;

  const preconnectGoogle = document.createElement('link');
  preconnectGoogle.rel = 'preconnect';
  preconnectGoogle.href = 'https://fonts.googleapis.com';

  const preconnectGstatic = document.createElement('link');
  preconnectGstatic.rel = 'preconnect';
  preconnectGstatic.href = 'https://fonts.gstatic.com';
  preconnectGstatic.crossOrigin = 'anonymous';

  const stylesheet = document.createElement('link');
  stylesheet.id = 'nothing-fonts';
  stylesheet.rel = 'stylesheet';
  stylesheet.href = FONT_HREF;

  document.head.appendChild(preconnectGoogle);
  document.head.appendChild(preconnectGstatic);
  document.head.appendChild(stylesheet);
}
