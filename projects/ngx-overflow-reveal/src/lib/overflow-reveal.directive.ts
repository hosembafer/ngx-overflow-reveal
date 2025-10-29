import {
  Directive, ElementRef, Input, NgZone, OnDestroy, OnInit, Renderer2, inject
} from '@angular/core';

@Directive({
  selector: '[ngxOverflowReveal]',
  standalone: true,
})
export class NgxOverflowRevealDirective implements OnInit, OnDestroy {
  /** Optional custom text; defaults to element's textContent */
  @Input() ngxOverflowRevealText?: string;

  private host = inject(ElementRef<HTMLElement>).nativeElement;
  private zone = inject(NgZone);
  private r2 = inject(Renderer2);

  private panel?: HTMLDivElement;
  private ro?: ResizeObserver;
  private mo?: MutationObserver;
  private onEnterOff?: () => void;
  private onLeaveOff?: () => void;
  private onScrollOff?: () => void;
  private onResizeOff?: () => void;

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

    const text = (this.ngxOverflowRevealText ?? this.host.textContent ?? '').trim();
    if (!text) return;

    const panel = this.r2.createElement('div') as HTMLDivElement;
    this.panel = panel;

    const cs = getComputedStyle(this.host);
    const rect = this.host.getBoundingClientRect();

    Object.assign(panel.style, {
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      zIndex: '2147483647',
      pointerEvents: 'none',
      background: 'transparent',
      overflow: 'visible',     // key: let the text continue outside the host width
      whiteSpace: 'nowrap',    // keep on one line for “continuation” effect
      boxSizing: 'border-box',

      // Mirror typography & padding from host so the text baseline aligns perfectly
      paddingTop: cs.paddingTop,
      paddingRight: cs.paddingRight,
      paddingBottom: cs.paddingBottom,
      paddingLeft: cs.paddingLeft,

      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      fontStyle: cs.fontStyle,
      letterSpacing: cs.letterSpacing,
      lineHeight: cs.lineHeight,
      color: cs.color,
      textTransform: cs.textTransform,
      textDecoration: cs.textDecoration,
    } as CSSStyleDeclaration);

    panel.textContent = text;
    document.body.appendChild(panel);
  }

  private detach() {
    if (!this.panel) return;
    this.panel.remove();
    this.panel = undefined;
  }

  private updatePosition() {
    if (!this.panel) return;
    const rect = this.host.getBoundingClientRect();

    this.panel.style.left = `${Math.round(rect.left)}px`;
    this.panel.style.top = `${Math.round(rect.top)}px`;
    this.panel.style.width = `${Math.round(rect.width)}px`;
    this.panel.style.height = `${Math.round(rect.height)}px`;
  }
}
