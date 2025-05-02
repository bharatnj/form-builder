import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {SharedModule} from "../shared/shared.module";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {ClientFormComponent} from "./form-components/client.form.component";
import {PhoneFormComponent} from "./form-components/phone.form.component";
import {AddressFormComponent} from "./form-components/address.form.component";
import {ClientReviewComponent} from "./review-components/client.review.component";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import {MatButton} from "@angular/material/button";
import {AddressReviewComponent} from './review-components/address.review.component';


@NgModule({

  declarations: [
      // Form Components
      AddressFormComponent,
      ClientFormComponent,

      PhoneFormComponent,

      ClientReviewComponent,
    AddressReviewComponent

  ],
    imports: [
        SharedModule,
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatDatepickerInput,
        MatDatepickerToggle,
        MatDatepicker,
        MatAutocompleteModule,
        MatChipsModule,
        MatIconModule,
        MatCardModule,
        MatButton
    ],
  exports: [
      // Form Components
      AddressFormComponent,

      ClientFormComponent,

      PhoneFormComponent,


      // Review Components
      AddressReviewComponent,

      ClientReviewComponent,

  ],
})
export class GeneratedModule {

}
