import { Component, Input } from '@angular/core';
import * as Models from '../../../../generated/model/models';

@Component({
  selector: 'app-current-property-owner-step',
  templateUrl: './po-step.component.html',
  styleUrls: ['./po-step.component.scss'],
  standalone: false
})
export class PoStepComponent {
  @Input() form!: Models.PropertyOwnerFormType;
  @Input() questions: Models.Question[] = [];
}
