import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxOverflowRevealDirective } from 'ngx-overflow-reveal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxOverflowRevealDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('demo');
}
