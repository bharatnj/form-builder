import {Component, Input} from '@angular/core';
import * as Models from "../model/models";
@Component({
selector: 'app-form-client',
templateUrl: './client.form.component.html',
styleUrls: ['../scss/common.scss'],
standalone: false,
})
export class ClientFormComponent{
    @Input()form!: Models.ClientFormType;
    protected readonly PersonTitleOptions = Object.values(Models.PersonTitle);
    protected readonly GenderOptions = Object.values(Models.Gender);
    @Input()questions: Models.Question[] = [];
}
