import {Component, Input} from '@angular/core';
import * as Models from "../model/models";
@Component({
selector: 'app-review-property',
templateUrl: './property.review.component.html',
styleUrls: ['../scss/common.scss'],
standalone: false,
})
export class PropertyReviewComponent{
    @Input()form!: Models.PropertyFormType;
    protected readonly PropertyTypeOptions = Object.values(Models.PropertyType);
    @Input()questions: Models.Question[] = [];
}
