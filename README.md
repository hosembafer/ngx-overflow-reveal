# ngx-overflow-reveal

[![npm version](https://img.shields.io/npm/v/ngx-overflow-reveal.svg)](https://www.npmjs.com/package/ngx-overflow-reveal)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An Angular directive that automatically reveals the full text content on hover when it's overflowing its container. Perfect for truncated text, table cells, and responsive layouts.

## Features

- **Automatic Detection** - Detects text overflow automatically (both horizontal and vertical)
- **Hover Reveal** - Shows full content in an overlay panel on mouse hover
- **Smart Positioning** - Automatically adjusts position to stay within viewport bounds
- **Style Preservation** - Matches typography, colors, and styling from the original element
- **Background Inference** - Intelligently detects background color to ensure proper text visibility
- **Elevation Effect** - Optional elevated appearance with subtle shadow
- **Lightweight** - Zero dependencies (except Angular peer dependencies)
- **Performance Optimized** - Runs outside Angular zone for optimal performance
- **Responsive** - Updates on window resize and scroll events

## Installation

```bash
npm install ngx-overflow-reveal
```

## Usage

### Basic Usage

Import the directive in your component:

```typescript
import { Component } from '@angular/core';
import { NgxOverflowRevealDirective } from 'ngx-overflow-reveal';

@Component({
  selector: 'app-demo',
  imports: [NgxOverflowRevealDirective],
  template: `
    <div
      ngxOverflowReveal
      style="width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
      This is a very long text that will be truncated and revealed on hover
    </div>
  `
})
export class DemoComponent {}
```

### With Elevated Effect

Add the `ngxOverflowRevealElevated` input for a subtle shadow effect:

```typescript
@Component({
  selector: 'app-demo',
  imports: [NgxOverflowRevealDirective],
  template: `
    <div
      ngxOverflowReveal
      [ngxOverflowRevealElevated]="true"
      style="width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
      Elevated reveal with shadow effect
    </div>
  `
})
export class DemoComponent {}
```

### Table Cell Example

```typescript
@Component({
  selector: 'app-table',
  imports: [NgxOverflowRevealDirective],
  template: `
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
  `
})
export class TableComponent {
  longDescription = 'This is a very long description that would overflow the table cell...';
}
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

```bash
ng serve
```

Navigate to `http://localhost:4200/` to see the demo application.

### Run tests

```bash
ng test ngx-overflow-reveal
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Rafayel Hovhannisyan](mailto:rafayel.hovhannisyan.95@gmail.com)
