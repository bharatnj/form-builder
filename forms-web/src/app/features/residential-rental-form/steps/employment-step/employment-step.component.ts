import { Component, Input } from '@angular/core';
import * as Models from '../../../../generated/model/models';

@Component({
  selector: 'app-employment-step',
  templateUrl: './employment-step.component.html',
  styleUrls: ['./employment-step.component.scss'],
  standalone: false
})
export class EmploymentStepComponent {
  @Input() form!: Models.EmploymentFormType;
  @Input() questions: Models.Question[] = [];
}
