import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

import { ResidentialRentalFormComponent } from './residential-rental-form.component';
import { PropertyStepComponent } from './steps/property-step/property-step.component';
import { TenancyStepComponent } from './steps/tenancy-step/tenancy-step.component';
import { ApplicantDetailsStepComponent } from './steps/applicant-details-step/applicant-details-step.component';
import { EmploymentStepComponent } from './steps/employment-step/employment-step.component';
import { CurrentResidenceStepComponent } from './steps/current-residence-step/current-residence-step.component';
import { PoStepComponent } from './steps/po-step/po-step.component';
import { ReviewSubmitStepComponent } from './steps/review-submit-step/review-submit-step.component';
import { GeneratedModule } from '../../generated/generated.module';
import { SharedModule } from '../../shared/shared.module';

// Import the missing form components
import { PropertyFormComponent } from '../../generated/form-components/property.form.component';
import { ResidenceFormComponent } from '../../generated/form-components/residence.form.component';
import { EmploymentFormComponent } from '../../generated/form-components/employment.form.component';
import { PropertyOwnerFormComponent } from '../../generated/form-components/property-owner.form.component';

// Import the missing review components
import { PropertyReviewComponent } from '../../generated/review-components/property.review.component';
import { ResidenceReviewComponent } from '../../generated/review-components/residence.review.component';
import { EmploymentReviewComponent } from '../../generated/review-components/employment.review.component';
import { PropertyOwnerReviewComponent } from '../../generated/review-components/property-owner.review.component';
import {QuestionFormComponent} from '../questionnaire-builder/question-form/question-form.component';

@NgModule({
  declarations: [
    ResidentialRentalFormComponent,
    PropertyStepComponent,
    TenancyStepComponent,
    ApplicantDetailsStepComponent,
    EmploymentStepComponent,
    CurrentResidenceStepComponent,
    PoStepComponent,
    ReviewSubmitStepComponent,
    // Declare the missing form components
    PropertyFormComponent,
    ResidenceFormComponent,
    EmploymentFormComponent,
    PropertyOwnerFormComponent,
    // Declare the missing review components
    PropertyReviewComponent,
    ResidenceReviewComponent,
    EmploymentReviewComponent,
    PropertyOwnerReviewComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatNativeDateModule,
    MatCardModule,
    RouterModule,
    GeneratedModule,
    SharedModule,
    QuestionFormComponent
  ],
  exports: [
    ResidentialRentalFormComponent,
    // Export the missing form components
    PropertyFormComponent,
    ResidenceFormComponent,
    EmploymentFormComponent,
    PropertyOwnerFormComponent,
    // Export the missing review components
    PropertyReviewComponent,
    ResidenceReviewComponent,
    EmploymentReviewComponent,
    PropertyOwnerReviewComponent
  ]
})
export class ResidentialRentalFormModule { }
