import {Component, Input} from '@angular/core';
import * as Models from "../model/models";
@Component({
selector: 'app-review-client',
templateUrl: './client.review.component.html',
styleUrls: ['../scss/common.scss'],
standalone: false,
})
export class ClientReviewComponent{
    @Input()form!: Models.ClientFormType;
    protected readonly PersonTitleOptions = Object.values(Models.PersonTitle);
    protected readonly GenderOptions = Object.values(Models.Gender);
    @Input()questions: Models.Question[] = [];
}
