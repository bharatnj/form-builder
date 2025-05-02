import {Component, DestroyRef, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Models from '../../generated/model/models';
import {QuestionService} from '../../services/question.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Question} from '../../shared/questions/question';
import {QuestionGroup} from '../../generated/model/models';

@Component({
  selector: 'app-residential-rental-form',
  templateUrl: './residential-rental-form.component.html',
  styleUrls: ['./residential-rental-form.component.scss'],
  standalone: false
})
export class ResidentialRentalFormComponent implements OnInit, OnChanges {
  @Input() refreshTrigger: number = 0;
  rentalForm: FormGroup;
  groupedQuestions: { [key: string]: Question[] } = {};
  isLoading: boolean = true;

  // Form objects for each step
  propertyForm: Models.PropertyFormType;
  tenancyForm: FormGroup;
  applicantForm: Models.ClientFormType;
  employmentForm: Models.EmploymentFormType;
  residenceForm: Models.ResidenceFormType;
  propertyOwnerForm: Models.PropertyOwnerFormType;

  constructor(private fb: FormBuilder, private questionService: QuestionService, private destroyRef: DestroyRef) {
    // Initialize form objects
    this.propertyForm = Models.getPropertyForm();
    this.tenancyForm = this.fb.group({
      leaseStartDate: ['', []],
      leaseTerm: ['', []],
      monthlyRent: ['', []]
    });
    this.applicantForm = Models.getClientForm();
    this.employmentForm = Models.getEmploymentForm();
    this.residenceForm = Models.getResidenceForm();
    this.propertyOwnerForm = Models.getPropertyOwnerForm();

    // Create the main form group
    this.rentalForm = this.fb.group({
      property: this.propertyForm,
      tenancy: this.tenancyForm,
      applicant: this.applicantForm,
      employment: this.employmentForm,
      residence: this.residenceForm,
      propertyOwner: this.propertyOwnerForm
    });
  }

  ngOnInit(): void {
    // Load questions when component is initialized
    this.loadQuestions();
  }
  ngOnChanges(changes: SimpleChanges): void {
    // If refreshTrigger changes, reload the questions
    if (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange) {
      this.loadQuestions();
    }
  }

  onSubmit(): void {
    if (this.rentalForm.valid) {
      console.log('Form submitted:', this.rentalForm.value);
      // Handle form submission
    } else {
      console.error('Form is invalid');
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.rentalForm);
    }
  }

  // Helper method to mark all controls in a form group as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  loadQuestions(): void {
    this.isLoading = true;
    // Get questions from Firestore using QuestionService
    this.questionService.getQuestions('1', 'en_US', undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (questions) => {
          // Filter questions by language ID and group
          this.organizeQuestionsByGroup(questions);
          this.isLoading = false;
          console.log("grouped questions - ",this.groupedQuestions);
        },
        error: (error) => {
          console.error('Error loading questions:', error);
          this.isLoading = false;
          this.groupedQuestions = {};
        }
      });
  }
  organizeQuestionsByGroup(questions: Question[]): void {
    if(questions)
    {
      this.groupedQuestions = {};
      const availableGroups = Object.values(QuestionGroup);
      // Second pass: organize questions by group
      availableGroups.forEach(group => {
        this.groupedQuestions[group] = questions.filter(question =>
          question.groups.includes(group as QuestionGroup)
        );
      });
    }
  }
  getQuestionsByGroup(group: QuestionGroup): Question[] {
    return this.groupedQuestions[group];
  }
}
