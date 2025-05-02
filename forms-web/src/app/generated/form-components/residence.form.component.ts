import {Component, Input} from '@angular/core';
import * as Models from "../model/models";
@Component({
selector: 'app-form-residence',
templateUrl: './residence.form.component.html',
styleUrls: ['../scss/common.scss'],
standalone: false,
})
export class ResidenceFormComponent{
    @Input()form!: Models.ResidenceFormType;
    protected readonly PropertyTypeOptions = Object.values(Models.PropertyType);
    @Input()questions: Models.Question[] = [];
}
