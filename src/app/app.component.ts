import { Component } from '@angular/core';
const TITLE = 'hello';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'angular-directives';
  numbers: Array<number> = [1, 2, 3, 4];
  onClick() {
    console.log('clicked from component');
  }
}
