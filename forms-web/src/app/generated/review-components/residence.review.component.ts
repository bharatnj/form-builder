import {Component, Input} from '@angular/core';
import * as Models from "../model/models";
@Component({
selector: 'app-review-residence',
templateUrl: './residence.review.component.html',
styleUrls: ['../scss/common.scss'],
standalone: false,
})
export class ResidenceReviewComponent{
    @Input()form!: Models.ResidenceFormType;
    protected readonly PropertyTypeOptions = Object.values(Models.PropertyType);
    @Input()questions: Models.Question[] = [];
}
