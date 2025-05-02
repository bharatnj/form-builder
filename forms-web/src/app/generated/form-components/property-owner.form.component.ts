import {Component, Input} from '@angular/core';
import * as Models from "../model/models";
@Component({
selector: 'app-form-property-owner',
templateUrl: './property-owner.form.component.html',
styleUrls: ['../scss/common.scss'],
standalone: false,
})
export class PropertyOwnerFormComponent{
    @Input()form!: Models.PropertyOwnerFormType;
    protected readonly PersonTitleOptions = Object.values(Models.PersonTitle);
    protected readonly GenderOptions = Object.values(Models.Gender);
    @Input()questions: Models.Question[] = [];
}
