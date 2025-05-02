import { Component, Input } from '@angular/core';
import * as Models from '../../../../generated/model/models';

@Component({
  selector: 'app-property-step',
  templateUrl: './property-step.component.html',
  styleUrls: ['./property-step.component.scss'],
  standalone: false
})
export class PropertyStepComponent {
  @Input() form!: Models.PropertyFormType;
  @Input() questions: Models.Question[] = [];
}
