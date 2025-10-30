import {
  Directive, ElementRef, NgZone, OnDestroy, OnInit, Renderer2, inject, input
} from '@angular/core';

@Directive({
  selector: '[ngxOverflowReveal]',
})
export class NgxOverflowRevealDirective implements OnInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>).nativeElement;
  private zone = inject(NgZone);
  private r2 = inject(Renderer2);

  ngxOverflowRevealElevated = input<boolean>(false);

  private panel?: HTMLDivElement;
  private ro?: ResizeObserver;
  private mo?: MutationObserver;
  private onEnterOff?: () => void;
  private onLeaveOff?: () => void;
  private onScrollOff?: () => void;
  private onResizeOff?: () => void;
  private readonly minPaddingX = 6; // Minimum horizontal padding in pixels
  private readonly minPaddingY = 4; // Minimum vertical padding in pixels

  ngOnInit(): void {
    this.ro = new ResizeObserver(() => this.detach());
    this.ro.observe(this.host);
    this.mo = new MutationObserver(() => this.detach());
    this.mo.observe(this.host, { childList: true, characterData: true, subtree: true });

    this.zone.runOutsideAngular(() => {
      this.onEnterOff  = this.r2.listen(this.host, 'mouseenter', () => this.onEnter());
      this.onLeaveOff  = this.r2.listen(this.host, 'mouseleave', () => this.detach());
      this.onScrollOff = this.r2.listen(window, 'scroll', () => this.updatePosition());
      this.onResizeOff = this.r2.listen(window, 'resize', () => this.updatePosition());
    });
  }

  ngOnDestroy(): void {
    this.detach();
    this.ro?.disconnect();
    this.mo?.disconnect();
    this.onEnterOff?.();
    this.onLeaveOff?.();
    this.onScrollOff?.();
    this.onResizeOff?.();
  }

  private onEnter() {
    if (!this.isOverflowing(this.host)) return;
    this.attach();
  }

  private isOverflowing(el: HTMLElement): boolean {
    return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
  }

  private attach() {
    if (this.panel) return;

    // Check if element has any content
    if (!this.host.textContent?.trim()) return;

    const panel = this.r2.createElement('div') as HTMLDivElement;
    this.panel = panel;

    const cs = getComputedStyle(this.host);
    const rect = this.host.getBoundingClientRect();

    // NEW: infer an opaque background color so the overlay hides original text
    const inferredBg = inferOpaqueBackgroundColor(this.host);

    // Calculate effective padding (ensure minimum padding without adding to existing padding)
    const basePaddingLeft = parseFloat(cs.paddingLeft) || 0;
    const basePaddingRight = parseFloat(cs.paddingRight) || 0;
    const basePaddingTop = parseFloat(cs.paddingTop) || 0;
    const basePaddingBottom = parseFloat(cs.paddingBottom) || 0;

    const effectivePaddingLeft = Math.max(basePaddingLeft, this.minPaddingX);
    const effectivePaddingRight = Math.max(basePaddingRight, this.minPaddingX);
    const effectivePaddingTop = Math.max(basePaddingTop, this.minPaddingY);
    const effectivePaddingBottom = Math.max(basePaddingBottom, this.minPaddingY);

    // Calculate position offset (how much to shift the panel)
    const offsetLeft = effectivePaddingLeft - basePaddingLeft;
    const offsetTop = effectivePaddingTop - basePaddingTop;
    const offsetRight = effectivePaddingRight - basePaddingRight;
    const offsetBottom = effectivePaddingBottom - basePaddingBottom;

    // Use host's border-radius if it has one, otherwise use default for better appearance
    const hostBorderRadius = parseFloat(cs.borderRadius) || 0;
    const borderRadius = hostBorderRadius > 0 ? cs.borderRadius : '6px';

    // For revealing content, use 'normal' white-space to allow proper wrapping
    const whiteSpace = 'normal';

    Object.assign(panel.style, {
      position: 'fixed',
      left: `${rect.left - offsetLeft}px`,
      top: `${rect.top - offsetTop}px`,
      minWidth: `${rect.width + offsetLeft + offsetRight}px`,
      width: 'max-content',
      minHeight: `${rect.height + offsetTop + offsetBottom}px`,
      maxHeight: 'none',
      zIndex: '2147483647',
      pointerEvents: 'none',
      backgroundColor: inferredBg,
      overflow: 'visible',
      whiteSpace: whiteSpace,
      boxSizing: 'border-box',

      // Use effective padding (minimum or host's padding, whichever is larger)
      paddingTop: `${effectivePaddingTop}px`,
      paddingRight: `${effectivePaddingRight}px`,
      paddingBottom: `${effectivePaddingBottom}px`,
      paddingLeft: `${effectivePaddingLeft}px`,

      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      fontStyle: cs.fontStyle,
      letterSpacing: cs.letterSpacing,
      lineHeight: cs.lineHeight,
      color: cs.color,
      textTransform: cs.textTransform,
      textDecoration: cs.textDecoration,

      // Font rendering properties to ensure pixel-perfect matching
      fontVariantNumeric: cs.fontVariantNumeric,
      fontKerning: cs.fontKerning,
      textRendering: cs.textRendering,

      // Mirror border styles from host
      borderWidth: cs.borderWidth,
      borderStyle: cs.borderStyle,
      borderColor: cs.borderColor,
      borderRadius: borderRadius,
      backgroundClip: 'padding-box',

      // Elevation effect when enabled
      boxShadow: this.ngxOverflowRevealElevated()
        ? '0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 8px rgba(0, 0, 0, 0.1), 0 0 16px rgba(0, 0, 0, 0.05)'
        : 'none',
    });

    // Set vendor-prefixed properties separately (not in standard CSSStyleDeclaration)
    panel.style.setProperty('-webkit-font-smoothing', cs.getPropertyValue('-webkit-font-smoothing'));
    panel.style.setProperty('-moz-osx-font-smoothing', cs.getPropertyValue('-moz-osx-font-smoothing'));

    // Always use innerHTML to preserve HTML structure (including <br> tags, etc.)
    panel.innerHTML = this.host.innerHTML;
    document.body.appendChild(panel);

    // Adjust position if panel overflows the viewport
    this.adjustPanelPosition(panel, rect, offsetLeft);
  }

  private detach() {
    if (!this.panel) return;
    this.panel.remove();
    this.panel = undefined;
  }

  private updatePosition() {
    if (!this.panel) return;
    const cs = getComputedStyle(this.host);
    const rect = this.host.getBoundingClientRect();

    // Recalculate offsets for updated position
    const basePaddingLeft = parseFloat(cs.paddingLeft) || 0;
    const basePaddingRight = parseFloat(cs.paddingRight) || 0;
    const basePaddingTop = parseFloat(cs.paddingTop) || 0;
    const basePaddingBottom = parseFloat(cs.paddingBottom) || 0;

    const effectivePaddingLeft = Math.max(basePaddingLeft, this.minPaddingX);
    const effectivePaddingRight = Math.max(basePaddingRight, this.minPaddingX);
    const effectivePaddingTop = Math.max(basePaddingTop, this.minPaddingY);
    const effectivePaddingBottom = Math.max(basePaddingBottom, this.minPaddingY);

    const offsetLeft = effectivePaddingLeft - basePaddingLeft;
    const offsetTop = effectivePaddingTop - basePaddingTop;
    const offsetRight = effectivePaddingRight - basePaddingRight;
    const offsetBottom = effectivePaddingBottom - basePaddingBottom;

    this.panel.style.left = `${Math.round(rect.left - offsetLeft)}px`;
    this.panel.style.top = `${Math.round(rect.top - offsetTop)}px`;
    this.panel.style.minWidth = `${Math.round(rect.width + offsetLeft + offsetRight)}px`;
    this.panel.style.width = 'max-content';
    this.panel.style.minHeight = `${Math.round(rect.height + offsetTop + offsetBottom)}px`;

    // Re-adjust position after updates
    this.adjustPanelPosition(this.panel, rect, offsetLeft);
  }

  private adjustPanelPosition(panel: HTMLDivElement, hostRect: DOMRect, offsetLeft = 0) {
    // Get panel's actual width after rendering
    const panelRect = panel.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const padding = 8; // Padding from viewport edge

    const panelLeft = hostRect.left - offsetLeft;
    const panelRight = panelLeft + panelRect.width;

    if (panelRight > viewportWidth - padding) {
      // Calculate available width
      const availableWidth = viewportWidth - padding * 2;

      // If content is too wide for viewport, set max-width to allow wrapping
      if (panelRect.width > availableWidth) {
        panel.style.maxWidth = `${Math.round(availableWidth)}px`;
        panel.style.left = `${padding}px`;
      } else if (panelRight > viewportWidth - padding) {
        // Content fits but needs repositioning
        const newLeft = Math.max(padding, panelLeft - (panelRight - viewportWidth + padding));
        panel.style.left = `${Math.round(newLeft)}px`;
      }
    }
  }
}

/* ---------------- helpers: background inference ---------------- */

function inferOpaqueBackgroundColor(start: HTMLElement): string {
  // Walk up until a non-transparent background is found
  let el: HTMLElement | null = start;

  while (el) {
    const parsed = parseRGBA(getComputedStyle(el).backgroundColor);
    if (parsed && parsed.a > 0) {
      return `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`; // force opaque to fully hide text
    }
    el = el.parentElement;
  }

  // Try body / html
  const bodyParsed = parseRGBA(getComputedStyle(document.body).backgroundColor);
  if (bodyParsed && bodyParsed.a > 0) return `rgb(${bodyParsed.r}, ${bodyParsed.g}, ${bodyParsed.b})`;

  const htmlParsed = parseRGBA(getComputedStyle(document.documentElement).backgroundColor);
  if (htmlParsed && htmlParsed.a > 0) return `rgb(${htmlParsed.r}, ${htmlParsed.g}, ${htmlParsed.b})`;

  // Fallback
  return 'white';
}

function parseRGBA(input: string | null | undefined):
  | { r: number; g: number; b: number; a: number }
  | null {
  if (!input) return null;

  const s = input.trim().toLowerCase();
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

  // rgb() / rgba()
  const m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (m) {
    return {
      r: clamp255(+m[1]),
      g: clamp255(+m[2]),
      b: clamp255(+m[3]),
      a: m[4] !== undefined ? clamp01(+m[4]) : 1,
    };
  }

  // hex #rgb/#rgba/#rrggbb/#rrggbbaa
  const hex = s.replace('#', '');
  if ([3, 4, 6, 8].includes(hex.length)) {
    const { r, g, b, a } = hexToRgba(hex);
    return { r, g, b, a };
  }

  return null;
}

function hexToRgba(hex: string) {
  let r = 0, g = 0, b = 0, a = 1;
  if (hex.length === 3 || hex.length === 4) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
    if (hex.length === 4) a = parseInt(hex[3] + hex[3], 16) / 255;
  } else if (hex.length === 6 || hex.length === 8) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
    if (hex.length === 8) a = parseInt(hex.slice(6, 8), 16) / 255;
  }
  return { r, g, b, a };
}

function clamp255(n: number) { return Math.max(0, Math.min(255, Math.round(n))); }
function clamp01(n: number) { return Math.max(0, Math.min(1, n)); }
