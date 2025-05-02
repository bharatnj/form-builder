import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FieldValidationErrorComponent} from './field.validation.error.component';

describe('ErrorComponent', () => {
  let component: FieldValidationErrorComponent;
  let fixture: ComponentFixture<FieldValidationErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldValidationErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldValidationErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
