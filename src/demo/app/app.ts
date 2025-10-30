import { ChangeDetectionStrategy, Component, signal, VERSION } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxOverflowRevealDirective } from 'ngx-overflow-reveal';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: string;
}

interface Tag {
  id: number;
  name: string;
  color: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxOverflowRevealDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly angularVersion = VERSION.full;

  protected readonly products = signal<Product[]>([
    {
      id: 1,
      name: 'Professional Wireless Noise-Cancelling Headphones',
      description: 'Premium over-ear headphones with advanced active noise cancellation technology',
      category: 'Electronics & Audio Equipment',
      price: '$299.99'
    },
    {
      id: 2,
      name: 'Ergonomic Adjustable Standing Desk with Memory Presets',
      description: 'Electric height-adjustable desk with programmable memory settings for optimal comfort',
      category: 'Office Furniture & Workspace Solutions',
      price: '$599.99'
    },
    {
      id: 3,
      name: 'Ultra-Wide 34" Curved Gaming Monitor 144Hz',
      description: 'High-performance curved display with ultra-wide aspect ratio and high refresh rate',
      category: 'Computer Monitors & Display Technology',
      price: '$799.99'
    },
    {
      id: 4,
      name: 'Mechanical RGB Backlit Gaming Keyboard',
      description: 'Mechanical keyboard featuring customizable RGB lighting and programmable macro keys',
      category: 'Computer Peripherals & Input Devices',
      price: '$149.99'
    }
  ]);

  protected readonly tags = signal<Tag[]>([
    { id: 1, name: 'TypeScript Development', color: '#3178c6' },
    { id: 2, name: 'Angular Framework v18', color: '#dd0031' },
    { id: 3, name: 'Web Development Best Practices', color: '#2ecc71' },
    { id: 4, name: 'User Interface Components Library', color: '#9b59b6' },
    { id: 5, name: 'Accessibility & ARIA Features', color: '#e67e22' },
    { id: 6, name: 'Performance Optimization Techniques', color: '#1abc9c' },
    { id: 7, name: 'Responsive Design Patterns & Mobile', color: '#f39c12' },
    { id: 8, name: 'Modern JavaScript ES2024 Standards', color: '#34495e' },
    { id: 9, name: 'Cross-Browser Compatibility Testing', color: '#e74c3c' },
    { id: 10, name: 'Progressive Web Apps Development', color: '#16a085' }
  ]);
}