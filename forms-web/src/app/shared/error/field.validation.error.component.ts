import {NgIf} from '@angular/common';
import {Component, Input} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import { ERROR_MESSAGES } from './error.constants';

@Component({
  selector: 'app-field-validation-error',
  templateUrl: './field.validation.error.component.html',
  styleUrl: './field.validation.error.component.scss',
    standalone: false,
})
export class FieldValidationErrorComponent {
  @Input({required : true}) control!: AbstractControl<any> | null;
  @Input({required : true}) errorCode!: string;
  @Input() fieldName: string | undefined;
    @Input() errorMessage: string | undefined;

  getErrorMessage()
  {
      if(this.errorMessage)
          return this.errorMessage;

      if (!this.fieldName && this.control) {
          // Find field name by comparing control references
          const controlName = this.control.parent
              ? Object.keys(this.control.parent.controls).find(name =>
                  this.control?.parent?.get(name) === this.control
              )
              : null;

          // Set the fieldName property if resolved
          this.fieldName = controlName ?? this.fieldName ?? '';
      }

      if(this.errorCode)
      {
          if(this.errorCode == 'firebaseError')
          {
              /*console.log('FieldValidationErrorComponent Firebase error - '+this.control?.getError(this.errorCode));
              console.log('FieldValidationErrorComponent Firebase error message - '+ERROR_MESSAGES[this.control?.getError(this.errorCode)]);*/
              return ERROR_MESSAGES[this.control?.getError(this.errorCode)];
          }

        return ERROR_MESSAGES[this.errorCode].replace('{0}', <string>this.fieldName);
      }
      return 'Error occurred!!'
  }

}
