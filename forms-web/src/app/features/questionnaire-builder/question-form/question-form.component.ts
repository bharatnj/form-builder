import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {v4 as uuidv4} from 'uuid';
import {Observable, map, startWith} from 'rxjs';
import {QADataType, QuestionGroup, QuestionType} from "../../../generated";
import {Question} from '../../../shared/questions/question';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
    selector: 'app-question-form',
    templateUrl: './question-form.component.html',
    styleUrls: ['./question-form.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatSelectModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatIconModule
    ],
    standalone: true
})
export class QuestionFormComponent implements OnInit {
    @Input() question: Question | null = null;
    @Input() formTitle: string = 'Add New Question';
    @Input() isSaving = false;
    @Input() tenantId: string = '';
    @Input() languages: { code: string, name: string }[] = [];
    @Input() masterTenantQuestions: Question[] = [];

    @Output() save = new EventEmitter<Question>();
    @Output() cancel = new EventEmitter<void>();

    questionForm: FormGroup;
    filteredQuestionTexts: Observable<string[]> = new Observable<string[]>();
    textControl = new FormControl('', Validators.required);
    // Make enums available to the template
    questionTypes = Object.values(QuestionType);
    qaDataTypes = Object.values(QADataType);
    questionGroups = Object.values(QuestionGroup);

    constructor(private fb: FormBuilder) {
        this.questionForm = this.fb.group({
            id: [''],
            questionId: ['', Validators.required],
            text: this.textControl,
            type: [QuestionType.OpenEnded, Validators.required],
            groups: [[], Validators.required],
            dataType: [QADataType.String, Validators.required],
            possibleAnswers: this.fb.array([]),
            validations: [[]],
            additionalUserInputRequired: [false],
            additionalUserInputFieldLabel: [''],
            order: [0],
            tenantId: [''],
            languageId: ['en_US', Validators.required],
            dependsOn: this.fb.array([]),
            options: []
        });
    }

    /**
     * Filters question texts based on user input and current selected groups
     * @param value The user input value
     * @returns Filtered list of question texts
     */
    private _filterQuestionTexts(value: string): string[] {
        const filterValue = value.toLowerCase();

        // Get the currently selected groups
        const selectedGroups = this.questionForm.get('groups')?.value || [];

        // Filter questions based on the selected groups
        const filteredQuestions = this.masterTenantQuestions.filter(question => {
            // If no groups are selected, include all questions
            if (selectedGroups.length === 0) {
                return true;
            }

            // Check if the question belongs to any of the selected groups
            return question.groups.some(group => selectedGroups.includes(group));
        });

        // Extract unique question texts and filter based on user input
        const uniqueTexts = new Set<string>();
        filteredQuestions.forEach(question => {
            if (question.text.toLowerCase().includes(filterValue)) {
                uniqueTexts.add(question.text);
            }
        });

        return Array.from(uniqueTexts);
    }

    ngOnInit(): void {
        this.resetForm();

        if (this.question) {
            this.patchForm(this.question);
        }

        // Initialize the autocomplete functionality
        this.initializeAutocomplete();

        // Listen for changes to the groups control to update the filtered question texts
        this.questionForm.get('groups')?.valueChanges.subscribe(() => {
            // Re-filter the question texts when the selected groups change
            const value = this.textControl.value || '';
            this.filteredQuestionTexts = new Observable((observer) => {
                observer.next(this._getFilteredQuestionTexts(value));
                observer.complete();
            });
        });
    }

    /**
     * Initializes the autocomplete functionality
     */
    private initializeAutocomplete(): void {
        // Set up the filteredQuestionTexts observable
        this.filteredQuestionTexts = this.textControl.valueChanges.pipe(
            startWith(''),
            map(value => this._getFilteredQuestionTexts(value || ''))
        );
    }

    /**
     * Gets filtered question texts based on user input
     * @param value The user input value
     * @returns Filtered list of question texts
     */
    private _getFilteredQuestionTexts(value: string): string[] {
        return this._filterQuestionTexts(value);
    }

    /**
     * Handles the selection of a question text from the autocomplete dropdown
     * @param event The MatAutocompleteSelectedEvent
     */
    onQuestionTextSelected(text: string): void {
        this.textControl.setValue(text);
    }

    get possibleAnswers(): FormArray {
        return this.questionForm.get('possibleAnswers') as FormArray;
    }

    get dependsOn(): FormArray {
        return this.questionForm.get('dependsOn') as FormArray;
    }

    addPossibleAnswer(value: string = ''): void {
        this.possibleAnswers.push(this.fb.control(value, Validators.required));
    }

    removePossibleAnswer(index: number): void {
        this.possibleAnswers.removeAt(index);
    }

    onTypeChange(): void {
        const type = this.questionForm.get('type')?.value;

        // Clear possible answers when switching to Open type
        if (type === QuestionType.OpenEnded) {
            while (this.possibleAnswers.length) {
                this.possibleAnswers.removeAt(0);
            }
        }
        // Add Yes/No answers for Yes/No question type
        else if (type === QuestionType.YesNo) {
            // Clear existing answers
            while (this.possibleAnswers.length) {
                this.possibleAnswers.removeAt(0);
            }
            // Add Yes and No as possible answers
            this.addPossibleAnswer('Yes');
            this.addPossibleAnswer('No');
        }
        // Add at least one possible answer for other closed questions
        else if (this.possibleAnswers.length === 0) {
            this.addPossibleAnswer('');
        }
    }

    onSubmit(): void {
        if (this.questionForm.invalid) {
            return;
        }

        //const formValue = this.questionForm.value;
        const question: Question = this.createQuestionFromFormValues();

        // Save the main question
        this.save.emit(question);
    }

    onCancel(): void {
        this.cancel.emit();
    }

    private resetForm(): void {
        this.questionForm.reset({
            type: QuestionType.OpenEnded,
            dataType: QADataType.String,
            additionalUserInputRequired: false,
            order: 0,
            tenantId: this.tenantId,
            languageId: 'en_US'
        });

        // Clear possible answers
        while (this.possibleAnswers.length) {
            this.possibleAnswers.removeAt(0);
        }

        // Clear dependencies
        while (this.dependsOn.length) {
            this.dependsOn.removeAt(0);
        }
    }

    private patchForm(question: Question): void {
        this.questionForm.patchValue({
            id: question.id,
            questionId: question.questionId,
            text: question.text,
            type: question.type,
            groups: question.groups,
            dataType: question.dataType,
            additionalUserInputRequired: question.additionalUserInputRequired,
            additionalUserInputFieldLabel: question.additionalUserInputFieldLabel,
            helpText: question.helpText,
            order: question.order,
            tenantId: question.tenantId,
            languageId: question.languageId || 'en_US',
            options: question.options
        });

        // Clear existing possible answers
        while (this.possibleAnswers.length) {
            this.possibleAnswers.removeAt(0);
        }

        // For Yes/No questions, always set Yes and No as answers
        if (question.type === QuestionType.YesNo) {
            this.addPossibleAnswer('Yes');
            this.addPossibleAnswer('No');
        }
        // Add possible answers if any for other question types
        else if (question.possibleAnswers && question.possibleAnswers.length > 0) {
            question.possibleAnswers.forEach(answer => {
                this.addPossibleAnswer(answer);
            });
        }

        // Clear existing dependencies
        while (this.dependsOn.length) {
            this.dependsOn.removeAt(0);
        }

        // Add dependencies if any
        if (question.dependsOn && question.dependsOn.length > 0) {
            question.dependsOn.forEach(dependencyMap => {
                this.dependsOn.push(this.fb.control(dependencyMap));
            });
        }
    }

    createQuestionFromFormValues(): Question {
        const formValue = this.questionForm.value;
        return {
            id: formValue.id || undefined,
            questionId: formValue.questionId || uuidv4(),
            text: formValue.text,
            type: formValue.type,
            groups: formValue.groups,
            dataType: formValue.dataType,
            possibleAnswers: formValue.type !== QuestionType.OpenEnded ? formValue.possibleAnswers : [],
            validations: formValue.validations ? formValue.validations : [],
            helpText: formValue.helpText ? formValue.helpText : '',
            additionalUserInputRequired: formValue.additionalUserInputRequired ? formValue.additionalUserInputRequired : false,
            additionalUserInputFieldLabel: formValue.additionalUserInputFieldLabel ? formValue.additionalUserInputFieldLabel : '',
            order: formValue.order,
            tenantId: this.tenantId,
            languageId: formValue.languageId,
            dependsOn: this.dependsOn && this.dependsOn.length > 0 ? this.dependsOn.value : [],
            options: formValue.options ? formValue.options : []
        };
    }

    protected readonly QuestionType = QuestionType;
}
