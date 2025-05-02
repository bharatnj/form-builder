import {Component, Input} from '@angular/core';
import * as Models from "../model/models";
@Component({
selector: 'app-form-phone',
templateUrl: './phone.form.component.html',
styleUrls: ['../scss/common.scss'],
standalone: false,
})
export class PhoneFormComponent{
    @Input()form!: Models.PhoneFormType;
    protected readonly PhoneTypeOptions = Object.values(Models.PhoneType);
    @Input()questions: Models.Question[] = [];
}
