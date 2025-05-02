import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-tenancy-step',
  templateUrl: './tenancy-step.component.html',
  styleUrls: ['./tenancy-step.component.scss'],
  standalone: false
})
export class TenancyStepComponent {
  @Input() form!: FormGroup;
}
