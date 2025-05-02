import {Component, Input} from '@angular/core';
import * as Models from "../../../generated/model/models";
import {QuestionAnswerFormType} from "../../../generated";
import {FormArray} from "@angular/forms";
@Component({
selector: 'app-review-questionanswer',
templateUrl: './questionAnswer.review.component.html',
//styleUrls: ['../scss/common.scss'],
standalone: false,
})
export class QuestionAnswerReviewComponent{
    @Input()form!: FormArray<QuestionAnswerFormType>;
    @Input()questions: Models.Question[] = [];
}
