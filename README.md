# ngx-overflow-reveal

[![npm version](https://img.shields.io/npm/v/ngx-overflow-reveal?logo=npm&logoColor=CB3837)](https://www.npmjs.com/package/ngx-overflow-reveal)
[![npm size](https://img.shields.io/bundlephobia/minzip/ngx-overflow-reveal?logo=javascript&logoColor=#F7DF1E)](https://bundlephobia.com/package/ngx-overflow-reveal)
![license](https://img.shields.io/github/license/hosembafer/ngx-overflow-reveal)
[![demo](https://img.shields.io/badge/demo-StackBlitz-00b8ff?logo=stackblitz)](https://stackblitz.com/github/hosembafer/ngx-overflow-reveal)

**ngx-overflow-reveal** is an Angular directive that automatically reveals the full text content on hover when it's overflowing its container. Perfect for truncated text, table cells, and responsive UIs.

## Features

- **Automatic Detection** - Detects text overflow automatically (both horizontal and vertical)
- **Hover Reveal** - Shows full content in an overlay panel on mouse hover
- **Smart Positioning** - Automatically adjusts position to stay within viewport bounds
- **Style Preservation** - Matches typography, colors, and styling from the original element
- **Background Inference** - Intelligently detects background color to ensure proper text visibility
- **Elevation Effect** - Optional elevated appearance with subtle shadow
- **Configurable Delay** - Optional delay before revealing the content on hover
- **Animation Control** - Optional fade-in animation effect when revealing content
- **Lightweight** - Zero dependencies (except Angular peer dependencies)
- **Performance Optimized** - Runs outside Angular zone for optimal performance
- **Responsive** - Updates on window resize and scroll events

## Demo

Open the live demo on StackBlitz to try the directive without installing anything:

- Online demo: https://stackblitz.com/github/hosembafer/ngx-overflow-reveal

## Installation

```bash
npm install ngx-overflow-reveal
```

## Usage

Import the directive in your component:

```typescript
import { Component } from '@angular/core';
import { NgxOverflowRevealDirective } from 'ngx-overflow-reveal';

@Component({
  selector: 'app-demo',
  imports: [NgxOverflowRevealDirective],
  template: `...`
})
export class DemoComponent {
  longDescription = 'This is a very long description that would overflow the table cell...';
}
```

Apply it to any element that may overflow:

```html
<!-- Basic usage -->
<div
  ngxOverflowReveal
  style="width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
  This is a very long text that will be truncated and revealed on hover
</div>

<!-- Custom box shadow -->
<div
  ngxOverflowReveal
  [ngxOverflowRevealBoxShadow]="'0 4px 12px rgba(0, 0, 0, 0.15)'"
  style="width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
  Custom shadow effect on reveal
</div>

<!-- All options combined -->
<div
  ngxOverflowReveal
  [ngxOverflowRevealElevated]="true"
  [ngxOverflowRevealDelay]="500"
  [ngxOverflowRevealAnimated]="false"
  [ngxOverflowRevealMaxWidth]="400"
  [ngxOverflowRevealViewportPadding]="48"
  style="width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
  Fully customized reveal with all options
</div>

<!-- Table cell example -->
<table>
  <tr>
    <td
      ngxOverflowReveal
      [ngxOverflowRevealElevated]="true"
      style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
      {{ longDescription }}
    </td>
  </tr>
</table>
```

## API

### Directive Selector

```typescript
[ngxOverflowReveal]
```

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `ngxOverflowRevealElevated` | `boolean` | `false` | Enables elevated appearance with box shadow for the reveal panel |
| `ngxOverflowRevealDelay` | `number` | `120` | Delay in milliseconds before revealing the content on hover |
| `ngxOverflowRevealAnimated` | `boolean` | `true` | Enables fade-in animation when revealing content |
| `ngxOverflowRevealMaxWidth` | `number \| undefined` | `undefined` | Maximum width in pixels for the revealed panel. When set, constrains the panel width while preserving left alignment. Content will wrap if it exceeds this width. |
| `ngxOverflowRevealViewportPadding` | `number` | `24` | Space in pixels between the revealed panel and the viewport edge. Used when automatically constraining panel width to prevent overflow. |
| `ngxOverflowRevealPanelClass` | `string \| string[] \| undefined` | `undefined` | CSS class(es) to apply to the revealed panel. Allows full customization of panel styling (e.g., custom shadow, border, background). Can be a single class name or an array of class names. |
| `ngxOverflowRevealBoxShadow` | `string \| undefined` | `undefined` | Custom box shadow CSS value for the reveal panel. When provided, overrides the default elevated shadow. Set to `'none'` to remove shadow entirely, or provide any valid CSS box-shadow value. Takes precedence over `ngxOverflowRevealElevated`. |

### Behavior

The directive automatically:

1. **Detects overflow** - Monitors both `scrollWidth > clientWidth` and `scrollHeight > clientHeight`
2. **Creates reveal panel** - Generates a fixed-position overlay on mouseenter
3. **Matches styles** - Copies typography, colors, padding, and font rendering properties
4. **Infers background** - Walks up the DOM tree to find the first opaque background color
5. **Adjusts position** - Repositions if the panel would overflow the viewport
6. **Cleans up** - Removes panel on mouseleave and handles all event cleanup

### Style Mirroring

The following styles are automatically mirrored from the host element to the reveal panel:

- Typography: `fontFamily`, `fontSize`, `fontWeight`, `fontStyle`, `letterSpacing`, `lineHeight`
- Text rendering: `fontVariantNumeric`, `fontKerning`, `textRendering`, `-webkit-font-smoothing`, `-moz-osx-font-smoothing`
- Text styling: `color`, `textTransform`, `textDecoration`
- Layout: Base padding values (with additional padding in revealed state)

## Browser Compatibility

Works with all modern browsers that support:
- ResizeObserver API
- MutationObserver API
- ES2015+

## Performance Considerations

- All mouse and scroll event listeners run **outside Angular zone** for optimal performance
- ResizeObserver and MutationObserver are used for efficient change detection
- Panel is created on-demand (only when overflow is detected)
- Proper cleanup on component destroy prevents memory leaks

## Development

### Build the library

```bash
ng build ngx-overflow-reveal
```

### Run the demo

You can run the demo locally:

```bash
ng serve
```

Navigate to `http://localhost:4200/` to see the demo application.

Or open the live demo on StackBlitz to try it online without installing:

- Online demo: https://stackblitz.com/github/hosembafer/ngx-overflow-reveal

### Run tests

```bash
ng test ngx-overflow-reveal
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Rafayel Hovhannisyan](mailto:rafayel.hovhannisyan.95@gmail.com)