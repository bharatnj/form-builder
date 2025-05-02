import { Routes } from '@angular/router';
import { QuestionnaireBuilderComponent } from './features/questionnaire-builder/questionnaire-builder.component';
import { ResidentialRentalFormComponent } from './features/residential-rental-form/residential-rental-form.component';

export const routes: Routes = [
  {
    path: "", component: QuestionnaireBuilderComponent
  },
  {
    path: "residential-rental", component: ResidentialRentalFormComponent
  }
];
