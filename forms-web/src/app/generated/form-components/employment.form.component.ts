import {Component, Input} from '@angular/core';
import * as Models from "../model/models";
@Component({
selector: 'app-form-employment',
templateUrl: './employment.form.component.html',
styleUrls: ['../scss/common.scss'],
standalone: false,
})
export class EmploymentFormComponent{
    @Input()form!: Models.EmploymentFormType;
    protected readonly EmploymentTypeOptions = Object.values(Models.EmploymentType);
    @Input()questions: Models.Question[] = [];
}
