import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { UtilModule } from "./util/util.module";
import { MetaModule } from "./meta/meta.module";

import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, BrowserAnimationsModule, UtilModule, MetaModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
