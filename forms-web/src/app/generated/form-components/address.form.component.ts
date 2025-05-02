import {Component, Input} from '@angular/core';
import * as Models from "../model/models";
@Component({
selector: 'app-form-address',
templateUrl: './address.form.component.html',
styleUrls: ['../scss/common.scss'],
standalone: false,
})
export class AddressFormComponent{
    @Input()form!: Models.AddressFormType;
    protected readonly AddressTypeOptions = Object.values(Models.AddressType);

}
