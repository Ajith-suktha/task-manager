import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';

// Root component, like the top-level widget under runApp().
// OnPush: re-render only when a signal or input it reads changes (Angular's equivalent of rebuilding only dirty widgets).
@Component({
  imports: [RouterOutlet, MatToolbar],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
