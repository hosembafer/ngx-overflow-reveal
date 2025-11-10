import {
  Directive, ElementRef, NgZone, OnDestroy, OnInit, Renderer2, inject, input
} from '@angular/core';
import { inferOpaqueBackgroundColor } from './color.utils';

@Directive({
  selector: '[ngxOverflowReveal]',
})
export class NgxOverflowRevealDirective implements OnInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>).nativeElement;
  private zone = inject(NgZone);
  private r2 = inject(Renderer2);

  ngxOverflowRevealElevated = input<boolean>(false);
  ngxOverflowRevealDelay = input<number>(120);
  ngxOverflowRevealAnimated = input<boolean>(true);
  ngxOverflowRevealMaxWidth = input<number | undefined>(undefined);
  ngxOverflowRevealViewportPadding = input<number>(24);

  private panel?: HTMLDivElement;
  private ro?: ResizeObserver;
  private mo?: MutationObserver;
  private onEnterOff?: () => void;
  private onLeaveOff?: () => void;
  private onScrollOff?: () => void;
  private onResizeOff?: () => void;
  private delayTimeoutId?: number;
  private detachTimeoutId?: number;
  private onPanelEnterOff?: () => void;
  private onPanelLeaveOff?: () => void;
  private readonly minPaddingX = 6; // Minimum horizontal padding in pixels
  private readonly minPaddingY = 4; // Minimum vertical padding in pixels

  ngOnInit(): void {
    this.ro = new ResizeObserver(() => this.detach());
    this.ro.observe(this.host);
    this.mo = new MutationObserver(() => this.detach());
    this.mo.observe(this.host, { childList: true, characterData: true, subtree: true });

    this.zone.runOutsideAngular(() => {
      this.onEnterOff  = this.r2.listen(this.host, 'mouseenter', () => this.onEnter());
      this.onLeaveOff  = this.r2.listen(this.host, 'mouseleave', () => this.scheduleDetach());
      this.onScrollOff = this.r2.listen(window, 'scroll', () => this.updatePosition());
      this.onResizeOff = this.r2.listen(window, 'resize', () => this.updatePosition());
    });
  }

  ngOnDestroy(): void {
    this.clearDelayTimeout();
    this.clearDetachTimeout();
    this.detach();
    this.ro?.disconnect();
    this.mo?.disconnect();
    this.onEnterOff?.();
    this.onLeaveOff?.();
    this.onScrollOff?.();
    this.onResizeOff?.();
    this.onPanelEnterOff?.();
    this.onPanelLeaveOff?.();
  }

  private onEnter() {
    if (!this.isOverflowing(this.host)) return;

    const delay = this.ngxOverflowRevealDelay();
    if (delay > 0) {
      this.delayTimeoutId = window.setTimeout(() => this.attach(), delay);
    } else {
      this.attach();
    }
  }

  private clearDelayTimeout() {
    if (this.delayTimeoutId !== undefined) {
      window.clearTimeout(this.delayTimeoutId);
      this.delayTimeoutId = undefined;
    }
  }

  private clearDetachTimeout() {
    if (this.detachTimeoutId !== undefined) {
      window.clearTimeout(this.detachTimeoutId);
      this.detachTimeoutId = undefined;
    }
  }

  private scheduleDetach() {
    // Use a small delay to allow mouse to move from host to panel
    this.detachTimeoutId = window.setTimeout(() => this.detach(), 50);
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

    // Check if host is a table cell (td or th) - skip minHeight for these
    const isTableCell = this.host.tagName === 'TD' || this.host.tagName === 'TH';

    // For table cells, use only minimum padding. For other elements, use effective padding.
    const panelPaddingTop = isTableCell ? this.minPaddingY : effectivePaddingTop;
    const panelPaddingRight = isTableCell ? this.minPaddingX : effectivePaddingRight;
    const panelPaddingBottom = isTableCell ? this.minPaddingY : effectivePaddingBottom;
    const panelPaddingLeft = isTableCell ? this.minPaddingX : effectivePaddingLeft;

    // For table cells, calculate offsets based on minimum padding
    const tableCellOffsetLeft = isTableCell ? this.minPaddingX - basePaddingLeft : offsetLeft;
    const tableCellOffsetTop = isTableCell ? this.minPaddingY - basePaddingTop : offsetTop;
    const tableCellOffsetRight = isTableCell ? this.minPaddingX - basePaddingRight : offsetRight;
    const tableCellOffsetBottom = isTableCell ? this.minPaddingY - basePaddingBottom : offsetBottom;

    const isAnimated = this.ngxOverflowRevealAnimated();
    const maxWidth = this.ngxOverflowRevealMaxWidth();

    Object.assign(panel.style, {
      position: 'fixed',
      left: `${rect.left - tableCellOffsetLeft}px`,
      top: `${rect.top - tableCellOffsetTop}px`,
      minWidth: `${rect.width + tableCellOffsetLeft + tableCellOffsetRight}px`,
      width: 'max-content',
      maxWidth: maxWidth !== undefined ? `${maxWidth}px` : 'none',
      // Table cells should size naturally, other elements use minHeight
      minHeight: isTableCell ? 'auto' : `${rect.height + offsetTop + offsetBottom}px`,
      maxHeight: 'none',
      zIndex: '2147483647',
      pointerEvents: 'auto',
      backgroundColor: inferredBg,
      overflow: 'visible',
      whiteSpace: whiteSpace,
      boxSizing: 'border-box',

      // Use minimum padding for table cells, effective padding for others
      paddingTop: `${panelPaddingTop}px`,
      paddingRight: `${panelPaddingRight}px`,
      paddingBottom: `${panelPaddingBottom}px`,
      paddingLeft: `${panelPaddingLeft}px`,

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

      // Animation properties
      opacity: isAnimated ? '0' : '1',
      transition: isAnimated ? 'opacity 150ms ease-in-out' : 'none',
    });

    // Set vendor-prefixed properties separately (not in standard CSSStyleDeclaration)
    panel.style.setProperty('-webkit-font-smoothing', cs.getPropertyValue('-webkit-font-smoothing'));
    panel.style.setProperty('-moz-osx-font-smoothing', cs.getPropertyValue('-moz-osx-font-smoothing'));

    // Always use innerHTML to preserve HTML structure (including <br> tags, etc.)
    panel.innerHTML = this.host.innerHTML;
    document.body.appendChild(panel);

    // Add event listeners to panel to keep it visible when hovering and allow text selection
    this.zone.runOutsideAngular(() => {
      this.onPanelEnterOff = this.r2.listen(panel, 'mouseenter', () => this.clearDetachTimeout());
      this.onPanelLeaveOff = this.r2.listen(panel, 'mouseleave', () => this.detach());
    });

    // For table cells with auto height, adjust vertical position based on vertical-align
    if (isTableCell) {
      const panelRect = panel.getBoundingClientRect();
      const verticalAlign = cs.verticalAlign;

      if (verticalAlign === 'middle') {
        // Center the panel vertically within the cell, accounting for added padding
        const cellContentHeight = rect.height + tableCellOffsetTop + tableCellOffsetBottom;
        const verticalOffset = (cellContentHeight - panelRect.height) / 2;
        panel.style.top = `${rect.top - tableCellOffsetTop + verticalOffset}px`;
      } else if (verticalAlign === 'bottom') {
        // Align panel to bottom of cell, accounting for added padding
        panel.style.top = `${rect.bottom + tableCellOffsetBottom - panelRect.height}px`;
      }
      // For 'top' (default), the initial top position already accounts for tableCellOffsetTop
    }

    // Adjust position if panel overflows the viewport
    this.adjustPanelPosition(panel, rect, tableCellOffsetLeft);

    // Trigger fade-in animation
    if (isAnimated) {
      // Use requestAnimationFrame to ensure the initial opacity:0 is rendered
      requestAnimationFrame(() => {
        if (this.panel) {
          this.panel.style.opacity = '1';
        }
      });
    }
  }

  private detach() {
    this.clearDelayTimeout();
    this.clearDetachTimeout();
    if (!this.panel) return;
    this.onPanelEnterOff?.();
    this.onPanelLeaveOff?.();
    this.onPanelEnterOff = undefined;
    this.onPanelLeaveOff = undefined;
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

    const isTableCell = this.host.tagName === 'TD' || this.host.tagName === 'TH';

    // For table cells, calculate offsets based on minimum padding
    const tableCellOffsetLeft = isTableCell ? this.minPaddingX - basePaddingLeft : offsetLeft;
    const tableCellOffsetTop = isTableCell ? this.minPaddingY - basePaddingTop : offsetTop;
    const tableCellOffsetRight = isTableCell ? this.minPaddingX - basePaddingRight : offsetRight;
    const tableCellOffsetBottom = isTableCell ? this.minPaddingY - basePaddingBottom : offsetBottom;

    const maxWidth = this.ngxOverflowRevealMaxWidth();

    this.panel.style.left = `${Math.round(rect.left - tableCellOffsetLeft)}px`;
    this.panel.style.minWidth = `${Math.round(rect.width + tableCellOffsetLeft + tableCellOffsetRight)}px`;
    this.panel.style.width = 'max-content';
    this.panel.style.maxWidth = maxWidth !== undefined ? `${maxWidth}px` : 'none';

    // For table cells, adjust vertical position based on vertical-align
    if (isTableCell) {
      const panelRect = this.panel.getBoundingClientRect();
      const verticalAlign = cs.verticalAlign;

      if (verticalAlign === 'middle') {
        // Center the panel vertically within the cell, accounting for added padding
        const cellContentHeight = rect.height + tableCellOffsetTop + tableCellOffsetBottom;
        const verticalOffset = (cellContentHeight - panelRect.height) / 2;
        this.panel.style.top = `${Math.round(rect.top - tableCellOffsetTop + verticalOffset)}px`;
      } else if (verticalAlign === 'bottom') {
        // Align panel to bottom of cell, accounting for added padding
        this.panel.style.top = `${Math.round(rect.bottom + tableCellOffsetBottom - panelRect.height)}px`;
      } else {
        this.panel.style.top = `${Math.round(rect.top - tableCellOffsetTop)}px`;
      }
    } else {
      this.panel.style.top = `${Math.round(rect.top - offsetTop)}px`;
    }

    // Re-adjust position after updates
    this.adjustPanelPosition(this.panel, rect, tableCellOffsetLeft);
  }

  private adjustPanelPosition(panel: HTMLDivElement, hostRect: DOMRect, offsetLeft = 0) {
    const userMaxWidth = this.ngxOverflowRevealMaxWidth();

    // If user specified a max-width, don't override it with automatic adjustments
    if (userMaxWidth !== undefined) {
      return;
    }

    // Get panel's actual width after rendering
    const panelRect = panel.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const padding = this.ngxOverflowRevealViewportPadding();

    const panelLeft = hostRect.left - offsetLeft;
    const panelRight = panelLeft + panelRect.width;

    // Calculate the maximum width available from the panel's left position to the viewport edge
    const maxAvailableWidth = viewportWidth - panelLeft - padding;

    // If content extends beyond viewport, constrain it with max-width (but keep left position)
    if (panelRight > viewportWidth - padding && maxAvailableWidth > 0) {
      panel.style.maxWidth = `${Math.round(maxAvailableWidth)}px`;
    }
  }
}
