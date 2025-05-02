import { Component, Input } from '@angular/core';
import * as Models from '../../../../generated/model/models';

@Component({
  selector: 'app-current-residence-step',
  templateUrl: './current-residence-step.component.html',
  styleUrls: ['./current-residence-step.component.scss'],
  standalone: false
})
export class CurrentResidenceStepComponent {
  @Input() form!: Models.ResidenceFormType;
  @Input() questions: Models.Question[] = [];
}
