import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MetaComponentComponent } from "./meta-component/meta-component.component";
import {
  MatSnackBarModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatOptionModule,
  MatSelectModule
} from "@angular/material";

@NgModule({
  declarations: [MetaComponentComponent],
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  exports: [MetaComponentComponent]
})
export class MetaModule {}
