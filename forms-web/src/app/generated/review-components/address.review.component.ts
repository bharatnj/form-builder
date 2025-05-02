import {Component, Input} from '@angular/core';
import * as Models from "../model/models";
@Component({
selector: 'app-review-address',
templateUrl: './address.review.component.html',
styleUrls: ['../scss/common.scss'],
standalone: false,
})
export class AddressReviewComponent{
    @Input()form!: Models.AddressFormType;
    protected readonly AddressTypeOptions = Object.values(Models.AddressType);

}
