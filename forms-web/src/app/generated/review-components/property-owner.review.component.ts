import {Component, Input} from '@angular/core';
import * as Models from "../model/models";
@Component({
selector: 'app-review-property-owner',
templateUrl: './property-owner.review.component.html',
styleUrls: ['../scss/common.scss'],
standalone: false,
})
export class PropertyOwnerReviewComponent{
    @Input()form!: Models.PropertyOwnerFormType;
    protected readonly PersonTitleOptions = Object.values(Models.PersonTitle);
    protected readonly GenderOptions = Object.values(Models.Gender);
    @Input()questions: Models.Question[] = [];
}
