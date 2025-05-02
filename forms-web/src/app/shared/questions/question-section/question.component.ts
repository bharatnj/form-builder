import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable, startWith} from "rxjs";
import {map} from "rxjs/operators";
import {MatSelectChange} from "@angular/material/select";
import {getQuestionAnswerForm, QADataType, Question, QuestionAnswerFormType, QuestionType, OperationType, QuestionDependency} from "../../../generated";

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
    standalone: false
})
export class QuestionComponent implements OnInit {
    questionForm!: FormGroup<{qas: FormArray<QuestionAnswerFormType>}>;
    @Input()form!: FormArray<QuestionAnswerFormType>;
    @Input()questions: Question[] = [];
    @Output() valueChanges = new EventEmitter<any>();
    isLoading = true;

    selectedOptions: string[] = [];
    myControl = new FormControl();
    options: Observable<string[]> | undefined;

    // Map to track which questions should be displayed based on dependencies
    visibleQuestions: Map<string, boolean> = new Map<string, boolean>();
    constructor(private cdr: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        // Initialize the form structure based on questions
        this.isLoading = true;

        // Ensure that form controls are created for all questions
        if (this.questions && this.questions.length > 0) {
            this.initializeForm();
        } else {
            // If there are no questions, just create an empty form
            this.questionForm = new FormGroup({qas: this.form});
            this.isLoading = false;
        }

        this.questionForm.valueChanges.subscribe(value => {
            this.valueChanges.emit(value.qas);
            // Update question visibility when form values change
            this.updateQuestionVisibility();
        });

        // Initialize question visibility
        // Use setTimeout to defer the execution to the next change detection cycle
        setTimeout(() => {
            this.updateQuestionVisibility();
        });
    }

    // Initialize the form
    initializeForm() {
        // Ensure form array is initialized
        if (!this.form) {
            this.form = new FormArray<QuestionAnswerFormType>([]);
        }

        // Create a map of existing form controls by questionId for quick lookup
        const existingControls = new Map<string, { control: QuestionAnswerFormType, index: number }>();
        for (let i = 0; i < this.form.length; i++) {
            const control = this.form.at(i);
            if (control && control.controls && control.controls.questionId) {
                const questionId = control.controls.questionId.value;
                existingControls.set(questionId, { control, index: i });
            }
        }

        // Create a new form array to hold the updated controls
        const newControls: QuestionAnswerFormType[] = [];

        // Add form controls for each question
        this.questions?.forEach((question) => {
            if (question.questionId) {
                let questionAnswerFormType: QuestionAnswerFormType;

                // Check if we already have a form control for this question
                if (existingControls.has(question.questionId)) {
                    // Reuse the existing form control
                    questionAnswerFormType = existingControls.get(question.questionId)!.control;

                    // Reset the form control to ensure it reflects the current state of the question
                    // This is important when the question properties have changed
                    questionAnswerFormType.reset();
                } else {
                    // Create a new form control
                    questionAnswerFormType = getQuestionAnswerForm();
                    questionAnswerFormType.controls.questionId.setValue(question.questionId);
                    questionAnswerFormType.controls.answers.setValue([]);
                }

                // Add validators if needed
                if (question.validations) {
                    // Clear existing validators
                    questionAnswerFormType.controls.answers.clearValidators();

                    // Add new validators
                    question.validations.forEach(validation => {
                        switch (validation) {
                            case 'required':
                                questionAnswerFormType.controls.answers.addValidators([Validators.required]);
                                break;
                        }
                    });
                }

                // Add the form control to the new array
                newControls.push(questionAnswerFormType);
            }
        });

        // Update the form array with the new controls
        // We need to clear and rebuild to maintain the correct order
        if (this.form.length > 0) {
            this.form.clear();
        }

        // Add all controls to the form array
        newControls.forEach(control => {
            this.form.push(control);
        });

        this.updateValueAndValidity();
        this.questionForm = new FormGroup({qas: this.form});
        this.isLoading = false;
    }

    getQuestionText(questionId:string)
    {
        return this.questions.find(question => question.questionId === questionId)?.text || '';
    }

    onSelectionChange(questionIndex: number, event: MatSelectChange): void {
        console.log('onSelectionChange - ',event.value);
        const selectedValues = event.value; // Array of currently selected options
        if (this.form.controls[questionIndex]?.controls) {
            this.form.controls[questionIndex].controls.answers.setValue(selectedValues);
            this.updateValueAndValidity();
        }
    }
    onInputChange(questionIndex: number, event:any)
    {
        if (this.form.controls[questionIndex]?.controls) {
            this.form.controls[questionIndex].controls.answers.setValue([event.target.value]);
            this.updateValueAndValidity();
        }
    }

    removeOption(index: number, option: string) {
        if (this.form.controls[index]?.controls) {
            const answersControl = this.form.controls[index].controls.answers;
            answersControl.setValue(answersControl.value.filter(item => item !== option));
            console.log('answersControl after removal - ',answersControl.value);
            this.updateValueAndValidity();
        }
    }
    addExplanation(index: number, event:any) {
        console.log('addExplanation - ',event.target.value);
        if (this.form.controls[index]?.controls) {
            const answersControl = this.form.controls[index].controls.explanation;
            answersControl.setValue(event.target.value);
            console.log('answersControl after addition - ',answersControl.value);
            this.updateValueAndValidity();
        }
    }

    getErrorMessage(index: number) {
        if (this.form.controls[index]?.controls) {
            const answersControl = this.form.controls[index].controls.answers;
            if (answersControl.hasError('required')) {
                return 'You must select at least one option.';
            }
            return answersControl.hasError('email') ? 'Not a valid email.' : '';
        }
        return '';
    }
    hasErrors(index: number) {
        if (this.form.controls[index]?.controls) {
            const answersControl = this.form.controls[index].controls.answers;
            return answersControl.touched && answersControl.invalid;
        }
        return false;
    }
    validate(index: number) {
        if (this.form.controls[index]?.controls) {
            const answersControl = this.form.controls[index].controls.answers;
            answersControl.markAsTouched();
            /*if(answersControl.value.length === 0)
                answersControl.setErrors({required: true});*/
            this.updateValueAndValidity();
        }
    }
    updateValueAndValidity()
    {
        this.form.updateValueAndValidity();
        //this.cdr.detectChanges();

        if (this.form.parent) {
            console.log('updating parent ');
            this.form.parent.updateValueAndValidity();
        }
        //this.form.parent?.updateValueAndValidity();

        // Update visibility of questions based on dependencies
        this.updateQuestionVisibility();
    }

    /**
     * Determines if a question should be visible based on its dependencies
     * @param question The question to check
     * @returns True if the question should be visible, false otherwise
     */
    shouldShowQuestion(questionId: string): boolean {
        // If we've already calculated visibility for this question, return the cached result
        if (this.visibleQuestions.has(questionId)) {
            return this.visibleQuestions.get(questionId)!;
        }

        // Check if questions array is defined
        if (!this.questions) {
            return false;
        }

        // Find the question by ID
        const question = this.questions.find(q => q.questionId === questionId);
        if (!question) {
            return false;
        }

        // If the question has no dependencies, it should always be visible
        if (!question.dependsOn || question.dependsOn.length === 0) {
            this.visibleQuestions.set(questionId, true);
            return true;
        }

        // Check each dependency map (these are combined with OR logic)
        let isVisible = false;

        for (const dependencyMap of question.dependsOn) {
            // Check if dependencyMap is a Map or a plain object
            let entries: [string, any][] = [];

            if (dependencyMap instanceof Map) {
                // If it's a Map, convert it to entries
                entries = Array.from(dependencyMap.entries());
            } else {
                // If it's a plain object, use Object.entries
                entries = Object.entries(dependencyMap);
            }

            // Process each entry (AND/OR operation)
            for (const [operationType, dependencies] of entries) {
                // For each dependency in the array
                if (Array.isArray(dependencies)) {
                    // For 'And' operations, all dependencies must be satisfied
                    // For 'Or' operations, at least one dependency must be satisfied
                    const isAndOperation = operationType === 'And';
                    let operationResult = isAndOperation; // Start with true for AND, false for OR

                    for (const dependency of dependencies) {
                        // Find the form control for the dependency question
                        // Check if questions array is defined
                        if (!this.questions) {
                            continue;
                        }
                        const dependencyQuestionIndex = this.questions.findIndex(q => q.questionId === dependency.questionId);
                        if (dependencyQuestionIndex === -1 || dependencyQuestionIndex >= this.form.length) {
                            // If the dependency question doesn't exist or doesn't have a form control, skip it
                            continue;
                        }

                        const dependencyFormControl = this.form.at(dependencyQuestionIndex);
                        if (!dependencyFormControl) {
                            continue;
                        }

                        // Get the answer(s) for the dependency question
                        let answers: string[] = [];

                        // Handle both single answer and multiple answers
                        if (dependencyFormControl.controls.answer && dependencyFormControl.controls.answer.value) {
                            // Single answer (used by SingleChoice and Yes/No questions)
                            answers = [dependencyFormControl.controls.answer.value];
                        } else if (dependencyFormControl.controls.answers && dependencyFormControl.controls.answers.value) {
                            // Multiple answers (used by MultipleChoice and OpenEnded questions)
                            answers = dependencyFormControl.controls.answers.value;
                        }

                        // Check if the dependency is satisfied
                        const isDependencySatisfied = answers.includes(dependency.answer);

                        if (isAndOperation) {
                            // For AND operations, if any dependency is not satisfied, the result is false
                            operationResult = operationResult && isDependencySatisfied;
                            if (!operationResult) {
                                break; // Short-circuit for AND
                            }
                        } else {
                            // For OR operations, if any dependency is satisfied, the result is true
                            operationResult = operationResult || isDependencySatisfied;
                            if (operationResult) {
                                break; // Short-circuit for OR
                            }
                        }
                    }

                    // If any operation results in true, the question should be visible
                    isVisible = isVisible || operationResult;
                    if (isVisible) {
                        break; // Short-circuit if we've determined the question should be visible
                    }
                }
            }

            // If any dependency map results in true, the question should be visible
            if (isVisible) {
                break;
            }
        }

        // Cache the result
        this.visibleQuestions.set(questionId, isVisible);
        return isVisible;
    }

    /**
     * Updates the visibility of all questions based on their dependencies
     */
    updateQuestionVisibility(): void {
        // Clear the cache
        this.visibleQuestions.clear();

        // Update visibility for each question
        if (this.questions) {
            this.questions.forEach(question => {
                this.shouldShowQuestion(question.questionId);
            });
        }

        // Force change detection in the next change detection cycle
        setTimeout(() => {
            this.cdr.detectChanges();
        });
    }

    // Ensure that form controls are created for all questions
    ensureFormControlsExist(): boolean {
        // Check if questions array is defined
        if (!this.questions) {
            return true;
        }

        // Check if we need to create any new form controls
        if (this.questions.length > this.form.length) {
            // There are more questions than form controls, so we need to create new ones
            // Use setTimeout to defer the initialization to the next change detection cycle
            setTimeout(() => {
                this.isLoading = true;
                this.initializeForm();
            });
        }
        // Return true to satisfy the *ngIf directive
        return true;
    }

    printQForm()
    {
        console.log('question form - ',this.questionForm.value);
        console.log('question form array - ',this.form.value);
    }


    protected readonly FormControl = FormControl;
    protected readonly FormArray = FormArray;
    protected readonly QuestionType = QuestionType;
    protected readonly QADataType = QADataType;
}
