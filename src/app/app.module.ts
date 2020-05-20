import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';

import { AppComponent } from './app.component';
import { MenuTestComponent } from './menu-test/menu-test.component';
import { MenuModule } from './menu/menu.module';

@NgModule({
  declarations: [AppComponent, MenuTestComponent],
  imports: [BrowserModule, MenuModule, OverlayModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
