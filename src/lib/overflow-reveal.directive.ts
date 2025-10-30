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
  private readonly extraPaddingX = 6; // Extra horizontal padding in pixels for revealed state
  private readonly extraPaddingY = 4; // Extra vertical padding in pixels for revealed state

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

    const text = (this.host.textContent ?? '').trim();
    if (!text) return;

    const panel = this.r2.createElement('div') as HTMLDivElement;
    this.panel = panel;

    const cs = getComputedStyle(this.host);
    const rect = this.host.getBoundingClientRect();

    // NEW: infer an opaque background color so the overlay hides original text
    const inferredBg = inferOpaqueBackgroundColor(this.host);

    // Calculate additional padding for revealed state
    const basePaddingLeft = parseFloat(cs.paddingLeft) || 0;
    const basePaddingRight = parseFloat(cs.paddingRight) || 0;
    const basePaddingTop = parseFloat(cs.paddingTop) || 0;
    const basePaddingBottom = parseFloat(cs.paddingBottom) || 0;

    Object.assign(panel.style, {
      position: 'fixed',
      left: `${rect.left - this.extraPaddingX}px`,
      top: `${rect.top - this.extraPaddingY}px`,
      minWidth: `${rect.width}px`,
      width: 'max-content',       // expand to fit full text
      height: `${rect.height + 2 * this.extraPaddingY}px`,
      zIndex: '2147483647',
      pointerEvents: 'none',
      backgroundColor: inferredBg,
      overflow: 'visible',        // let text continue outside the host width
      whiteSpace: 'nowrap',       // single-line continuation effect
      boxSizing: 'border-box',

      // Mirror typography & padding from host, with additional padding for revealed state
      paddingTop: `${basePaddingTop + this.extraPaddingY}px`,
      paddingRight: `${basePaddingRight + this.extraPaddingX}px`,
      paddingBottom: `${basePaddingBottom + this.extraPaddingY}px`,
      paddingLeft: `${basePaddingLeft + this.extraPaddingX}px`,

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

      borderRadius: '6px',
      backgroundClip: 'padding-box',

      // Elevation effect when enabled
      boxShadow: this.ngxOverflowRevealElevated()
        ? '0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 8px rgba(0, 0, 0, 0.1), 0 0 16px rgba(0, 0, 0, 0.05)'
        : 'none',
    });

    // Set vendor-prefixed properties separately (not in standard CSSStyleDeclaration)
    panel.style.setProperty('-webkit-font-smoothing', cs.getPropertyValue('-webkit-font-smoothing'));
    panel.style.setProperty('-moz-osx-font-smoothing', cs.getPropertyValue('-moz-osx-font-smoothing'));

    panel.textContent = text;
    document.body.appendChild(panel);

    // Adjust position if panel overflows the viewport
    this.adjustPanelPosition(panel, rect);
  }

  private detach() {
    if (!this.panel) return;
    this.panel.remove();
    this.panel = undefined;
  }

  private updatePosition() {
    if (!this.panel) return;
    const rect = this.host.getBoundingClientRect();

    this.panel.style.left = `${Math.round(rect.left - this.extraPaddingX)}px`;
    this.panel.style.top = `${Math.round(rect.top - this.extraPaddingY)}px`;
    this.panel.style.minWidth = `${Math.round(rect.width)}px`;
    this.panel.style.height = `${Math.round(rect.height + 2 * this.extraPaddingY)}px`;

    // Re-adjust position after updates
    this.adjustPanelPosition(this.panel, rect);
  }

  private adjustPanelPosition(panel: HTMLDivElement, hostRect: DOMRect) {
    // Get panel's actual width after rendering
    const panelRect = panel.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    const panelRight = hostRect.left - this.extraPaddingX + panelRect.width;

    if (panelRight > viewportWidth) {
      // Calculate how much we need to shift left
      const overflow = panelRight - viewportWidth;
      const padding = 8; // Add small padding from viewport edge
      const newLeft = Math.max(0, hostRect.left - this.extraPaddingX - overflow - padding);

      panel.style.left = `${Math.round(newLeft)}px`;
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
