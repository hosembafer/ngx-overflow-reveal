import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxOverflowRevealDirective } from 'ngx-overflow-reveal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxOverflowRevealDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly title = signal('demo');
}
