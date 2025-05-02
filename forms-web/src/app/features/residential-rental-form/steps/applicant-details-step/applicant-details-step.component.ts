import { Component, Input } from '@angular/core';
import * as Models from '../../../../generated/model/models';

@Component({
  selector: 'app-applicant-details-step',
  templateUrl: './applicant-details-step.component.html',
  styleUrls: ['./applicant-details-step.component.scss'],
  standalone: false
})
export class ApplicantDetailsStepComponent {
  @Input() form!: Models.ClientFormType;
  @Input() questions: Models.Question[] = [];
}
