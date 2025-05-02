import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import * as Models from '../../../../generated/model/models';

@Component({
  selector: 'app-review-submit-step',
  templateUrl: './review-submit-step.component.html',
  styleUrls: ['./review-submit-step.component.scss'],
  standalone: false
})
export class ReviewSubmitStepComponent implements OnChanges {
  @Input() propertyForm!: Models.PropertyFormType;
  @Input() tenancyForm!: FormGroup;
  @Input() applicantForm!: Models.ClientFormType;
  @Input() employmentForm!: Models.EmploymentFormType;
  @Input() residenceForm!: Models.ResidenceFormType;
  @Input() propertyOwnerForm!: Models.PropertyOwnerFormType;

  formattedLeaseStartDate: string = 'Not specified';

  ngOnChanges(changes: SimpleChanges): void {
    this.updateFormattedDates();
  }

  private updateFormattedDates(): void {
    if (this.tenancyForm && this.tenancyForm.value.leaseStartDate) {
      const date = new Date(this.tenancyForm.value.leaseStartDate);
      this.formattedLeaseStartDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    } else {
      this.formattedLeaseStartDate = 'Not specified';
    }
  }
}
