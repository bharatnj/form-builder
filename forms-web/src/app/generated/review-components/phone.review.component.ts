import {Component, Input} from '@angular/core';
import * as Models from "../model/models";
@Component({
selector: 'app-review-phone',
templateUrl: './phone.review.component.html',
styleUrls: ['../scss/common.scss'],
standalone: false,
})
export class PhoneReviewComponent{
    @Input()form!: Models.PhoneFormType;
    protected readonly PhoneTypeOptions = Object.values(Models.PhoneType);
    @Input()questions: Models.Question[] = [];
}
