import {Component, Input} from '@angular/core';
import * as Models from "../model/models";
@Component({
selector: 'app-form-property',
templateUrl: './property.form.component.html',
styleUrls: ['../scss/common.scss'],
standalone: false,
})
export class PropertyFormComponent{
    @Input()form!: Models.PropertyFormType;
    protected readonly PropertyTypeOptions = Object.values(Models.PropertyType);
    @Input()questions: Models.Question[] = [];
}
