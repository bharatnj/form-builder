import {Component, Input} from '@angular/core';
import * as Models from "../model/models";
@Component({
selector: 'app-review-employment',
templateUrl: './employment.review.component.html',
styleUrls: ['../scss/common.scss'],
standalone: false,
})
export class EmploymentReviewComponent{
    @Input()form!: Models.EmploymentFormType;
    protected readonly EmploymentTypeOptions = Object.values(Models.EmploymentType);
    @Input()questions: Models.Question[] = [];
}
