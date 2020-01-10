import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MetaComponentComponent } from "./meta-component/meta-component.component";

@NgModule({
  declarations: [MetaComponentComponent],
  imports: [CommonModule],
  exports: [MetaComponentComponent]
})
export class MetaModule {}
