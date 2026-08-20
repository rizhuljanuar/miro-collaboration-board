import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'a',
  'b',
  'br',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'i',
  'img',
  'li',
  'mark',
  'p',
  'strong',
  'u',
  'ul',
];

const ALLOWED_ATTRIBUTES = ['alt', 'href', 'rel', 'src', 'target'];

function isAllowedUrl(value: string, allowedProtocols: string[]): boolean {
  try {
    const url = new URL(value);

    return allowedProtocols.includes(url.protocol);
  } catch {
    return false;
  }
}

function normalizeHighlightSpans(html: string): string {
  const template = document.createElement('template');

  template.innerHTML = html;

  template.content.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
    const isHighlightSpan = element.tagName === 'SPAN' && element.style.backgroundColor.length > 0;

    if (isHighlightSpan) {
      const mark = document.createElement('mark');

      while (element.firstChild) {
        mark.appendChild(element.firstChild);
      }

      element.replaceWith(mark);

      return;
    }

    element.removeAttribute('style');
  });

  return template.innerHTML;
}

function enforceSafeUrls(html: string): string {
  const template = document.createElement('template');

  template.innerHTML = html;

  template.content.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
    const href = link.getAttribute('href');

    if (!href || !isAllowedUrl(href, ['https:', 'http:', 'mailto:'])) {
      link.removeAttribute('href');
      link.removeAttribute('target');
      link.removeAttribute('rel');

      return;
    }

    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  template.content.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
    const source = image.getAttribute('src');

    if (!source || !isAllowedUrl(source, ['https:', 'http:'])) {
      image.remove();

      return;
    }

    if (!image.hasAttribute('alt')) {
      image.setAttribute('alt', '');
    }
  });

  return template.innerHTML;
}

export function sanitizeRichTextHtml(html: string): string {
  const normalizedHtml = normalizeHighlightSpans(html);

  const sanitizedHtml = DOMPurify.sanitize(normalizedHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRIBUTES,
    ALLOW_DATA_ATTR: false,
    FORBID_ATTR: ['style'],
  });

  return enforceSafeUrls(String(sanitizedHtml));
}
