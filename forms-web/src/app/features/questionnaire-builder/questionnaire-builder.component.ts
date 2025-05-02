import {Component, OnInit, OnDestroy, DestroyRef, ViewChild, PLATFORM_ID, Inject} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {CommonModule, isPlatformBrowser} from '@angular/common';

import {
    getQuestionAnswerForm, OperationType,
    QADataType,
    QuestionAnswerFormType,
    QuestionDependency, QuestionGroup,
    QuestionType
} from '../../generated';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { Question } from '../../shared/questions/question';
import { QuestionService } from '../../services/question.service';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QuestionFormComponent } from './question-form/question-form.component';
import { QuestionNetworkComponent } from './question-network/question-network.component';
import {ResidentialRentalFormModule} from '../residential-rental-form/residential-rental-form.module';

@Component({
  selector: 'app-questionnaire-builder',
  templateUrl: './questionnaire-builder.component.html',
  styleUrls: ['./questionnaire-builder.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    DragDropModule,
    QuestionFormComponent,
    QuestionNetworkComponent,
    ResidentialRentalFormModule,
  ],
  standalone: true
})
export class QuestionnaireBuilderComponent implements OnInit, OnDestroy {
  questions: Question[] = [];
  masterTenantQuestions: Question[] = [];
  groupedQuestions: { [key: string]: Question[] } = {};
  availableGroups: string[] = [];
  editingIndex: number | null = null;
  editingGroupIndex: number | null = null;
  isLoading = true;
  isSaving = false;
  propertyOwnerId: string = '';
  languageId: string = 'en_US';
  showForm = false;
  currentGroup: string | null = null;
  activeQuestionIndex: number | null = null;
  formPosition: 'before' | 'after' | 'start' | 'end' | 'inline' | null = null;
  currentQuestion: Question | null = null;
  formTitle: string = 'Add New Question';
  allExpanded: boolean = true;
  editingQuestion: boolean = false;
  MASTER_TENANT_ID: string = '1';

  // Preview related properties
  showPreview: boolean = false;
  refreshTrigger: number = 0;

  // Resizable properties
  isResizing: boolean = false;
  initialX: number = 0;
  initialQuestionListWidth: number = 0;
  questionListStyle: { [key: string]: string } = { width: '50%' };
  previewContainerStyle: { [key: string]: string } = { width: '50%' };
  isBrowser: boolean = false;

  // Bound event handlers
  private boundDoResize: (event: MouseEvent) => void;
  private boundStopResize: () => void;

  // Available languages
  languages = [
    { code: 'en_US', name: 'English (US)' },
    { code: 'es_ES', name: 'Spanish (Spain)' },
    { code: 'fr_FR', name: 'French (France)' },
    { code: 'de_DE', name: 'German (Germany)' },
    { code: 'zh_CN', name: 'Chinese (Simplified)' },
    { code: 'ja_JP', name: 'Japanese (Japan)' },
    { code: 'ko_KR', name: 'Korean (Korea)' },
    { code: 'pt_BR', name: 'Portuguese (Brazil)' },
    { code: 'it_IT', name: 'Italian (Italy)' },
    { code: 'ru_RU', name: 'Russian (Russia)' }
  ];

  constructor(
    private snackBar: MatSnackBar,
    private destroyRef: DestroyRef,
    private questionService: QuestionService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    // Bind event handlers to preserve 'this' context
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.boundDoResize = this.doResize.bind(this);
    this.boundStopResize = this.stopResize.bind(this);
  }

  ngOnInit(): void {
    // Get the property owner ID from the logged-in user using the store
    this.propertyOwnerId = '1'
    this.loadQuestions();
    // Add event listeners for resize only if in browser environment
    if (this.isBrowser) {
      document.addEventListener('mousemove', this.boundDoResize);
      document.addEventListener('mouseup', this.boundStopResize);
    }
  }

  /**
   * Starts the resize operation
   * @param event The mouse event
   */
  startResize(event: MouseEvent): void {
    if (!this.isBrowser) return;

    this.isResizing = true;
    this.initialX = event.clientX;

    // Get the current width of the question list
    const questionListElement = document.querySelector('.o-question-list') as HTMLElement;
    const questionListWidth = questionListElement?.getBoundingClientRect().width || 0;
    this.initialQuestionListWidth = questionListWidth;

    // Prevent text selection during resize
    event.preventDefault();
  }

  /**
   * Handles the resize operation as the mouse moves
   * @param event The mouse event
   */
  doResize(event: MouseEvent): void {
    if (!this.isBrowser || !this.isResizing) return;

    // Calculate the new width based on the mouse movement
    const containerElement = document.querySelector('.t-questionnaire-builder__content') as HTMLElement;
    const containerWidth = containerElement?.getBoundingClientRect().width || 0;
    const deltaX = event.clientX - this.initialX;
    const newQuestionListWidth = this.initialQuestionListWidth + deltaX;

    // Calculate the percentage width
    const questionListPercentage = Math.min(Math.max((newQuestionListWidth / containerWidth) * 100, 20), 80);
    const previewContainerPercentage = 100 - questionListPercentage;

    // Update the styles
    this.questionListStyle = { width: `${questionListPercentage}%` };
    this.previewContainerStyle = { width: `${previewContainerPercentage}%` };
  }

  /**
   * Stops the resize operation
   */
  stopResize(): void {
    this.isResizing = false;
  }

  loadQuestions(): void {
    this.isLoading = true;
    // First, get questions from the current tenant
    this.questionService.getQuestions(this.propertyOwnerId, this.languageId, undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (currentTenantQuestions) => {
          // Set the questions to the current tenant's questions
          this.questions = currentTenantQuestions;

          // Then, get questions from the master tenant that the current tenant doesn't have
          if (this.propertyOwnerId !== this.MASTER_TENANT_ID) {
            this.questionService.getMasterTenantQuestions(this.propertyOwnerId, this.languageId, undefined, currentTenantQuestions)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (masterTenantQuestions) => {
                  // Add the master tenant questions to the current tenant's questions
                  this.masterTenantQuestions = [...masterTenantQuestions];
                  this.organizeQuestionsByGroup();
                  this.isLoading = false;
                },
                error: (error) => {
                  console.error('Error loading master tenant questions:', error);
                  this.snackBar.open('Error loading master tenant questions. Please try again.', 'Close', { duration: 3000 });
                  this.isLoading = false;
                }
              });
          } else {
            // If the current tenant is the master tenant, we don't need to get additional questions
            this.organizeQuestionsByGroup();
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error loading questions:', error);
          this.snackBar.open('Error loading questions. Please try again.', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  /**
   * Toggles the preview panel visibility
   */
  togglePreview(): void {
    this.showPreview = !this.showPreview;

    if (this.showPreview) {
      // Initialize container widths
      this.questionListStyle = { width: '50%' };
      this.previewContainerStyle = { width: '50%' };

      // Initialize the preview form
      setTimeout(() => this.initializePreviewForm(), 0);
    }
  }

  /**
   * Initializes or refreshes the preview form
   */
  initializePreviewForm(): void {
    if (this.showPreview) {
      // Increment the refresh trigger to notify the intake component to reload questions
      this.refreshTrigger++;
    }
  }

  organizeQuestionsByGroup(): void {
    // Reset grouped questions and available groups
    this.groupedQuestions = {};
    this.availableGroups = Object.values(QuestionGroup);

    // Second pass: organize questions by group
    this.availableGroups.forEach(group => {
      // Filter questions for this group
      const groupQuestions = this.questions.filter(question =>
        question.groups.includes(group as QuestionGroup)
      );

      // Sort questions by order
      groupQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));

      // Assign sorted questions to the group
      this.groupedQuestions[group] = groupQuestions;
    });
  }


  addQuestion(position: 'start' | 'end' | number = 'end', group: string | undefined): void {
    // Reset the current group since we're not adding to a specific group
    this.currentGroup = group ? group : null;
    this.editingGroupIndex = this.currentGroup? this.availableGroups.indexOf(this.currentGroup as string): null;

    // Set the order based on position
    let order = 0;
    if (position === 'start') {
      // If adding at the start, use the first question's order minus 10
      order = this.questions.length > 0 ? this.questions[0].order! - 10 : 0;
      this.formTitle = 'Add New Question at Start';
    } else if (position === 'end') {
      // If adding at the end, use the last question's order plus 10
      order = this.questions.length > 0 ? this.questions[this.questions.length - 1].order! + 10 : 0;
      this.formTitle = 'Add New Question at End';
    } else if (typeof position === 'number') {
      // If adding at a specific position, get the questions in the group
      const groupQuestions = this.currentGroup ? this.groupedQuestions[this.currentGroup] : this.questions;

      // Sort the questions by order
      groupQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));

      // Find the question at the specified position
      const questionAtPosition = groupQuestions && groupQuestions.length>0? groupQuestions[position] : null;

      // Set the order to be after the question at the specified position
      order = questionAtPosition ? questionAtPosition.order! + 10 : 10;

      this.formTitle = 'Add New Question';
    }

    // Create a new question object
    this.currentQuestion = {
      questionId: Math.floor(Math.random() * 1000000).toString(),
      text: '',
      type: QuestionType.OpenEnded,
      groups: this.currentGroup ? [this.currentGroup as QuestionGroup] : [],
      dataType: QADataType.String,
      order: order,
      tenantId: this.propertyOwnerId,
      languageId: 'en_US'
    };

    this.editingIndex = null;
    this.showForm = true;
    this.activeQuestionIndex = null;
    this.formPosition = typeof position === 'string' ? position : null;
  }

  editQuestion(index: number, groupIndex: number): void {
    const question = this.questions[index];

    // Reset the current group since we're editing an existing question
    this.currentGroup = null;

    // Set the current question to the one being edited
    this.currentQuestion = { ...question };

    this.formTitle = 'Edit Question';
    this.editingIndex = index;
    this.editingGroupIndex = groupIndex;
    this.showForm = true;
    this.activeQuestionIndex = index;
    this.formPosition = 'inline';
    this.editingQuestion = true;
  }

  addQuestionBefore(index: number, group: string): void {
    this.currentGroup = group;

    // Get the questions in this group
    const groupQuestions = this.groupedQuestions[group];

    // Find the question in the group questions
    const groupIndex = groupQuestions.findIndex(q => q.questionId === this.questions[index].questionId);
    if (groupIndex === -1) return; // Question not found in this group

    const question = groupQuestions[groupIndex];

    // Sort the questions by order
    groupQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Find the index of the question in the sorted array
    const sortedIndex = groupQuestions.findIndex(q => q.questionId === question.questionId);

    // Calculate the order for the new question
    let order: number;
    if (sortedIndex > 0) {
      // If there's a question before this one, set the order to be between the two
      const prevQuestion = groupQuestions[sortedIndex - 1];
      order = (prevQuestion.order! + question.order!) / 2;
    } else {
      // If this is the first question, set the order to be before it
      order = question.order! - 10;
    }

    // Create a new question object
    this.currentQuestion = {
      questionId: Math.floor(Math.random() * 1000000).toString(),
      text: '',
      type: QuestionType.OpenEnded,
      groups: this.currentGroup ? [this.currentGroup as QuestionGroup] : [],
      dataType: QADataType.String,
      order: order,
      tenantId: this.propertyOwnerId,
      languageId: 'en_US'
    };

    this.formTitle = `Add New Question before "${question.text}"`;
    this.editingIndex = null;
    this.showForm = true;
    this.activeQuestionIndex = index;
    this.formPosition = 'before';
  }

  addQuestionAfter(index: number, group: string): void {
    this.currentGroup = group;

    // Get the questions in this group
    const groupQuestions = this.groupedQuestions[group];

    // Find the question in the group questions
    const groupIndex = groupQuestions.findIndex(q => q.questionId === this.questions[index].questionId);
    if (groupIndex === -1) return; // Question not found in this group

    const question = groupQuestions[groupIndex];

    // Sort the questions by order
    groupQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Find the index of the question in the sorted array
    const sortedIndex = groupQuestions.findIndex(q => q.questionId === question.questionId);

    // Calculate the order for the new question
    let order: number;
    if (sortedIndex < groupQuestions.length - 1) {
      // If there's a question after this one, set the order to be between the two
      const nextQuestion = groupQuestions[sortedIndex + 1];
      order = (question.order! + nextQuestion.order!) / 2;
    } else {
      // If this is the last question, set the order to be after it
      order = question.order! + 10;
    }

    // Create a new question object
    this.currentQuestion = {
      questionId: Math.floor(Math.random() * 1000000).toString(),
      text: '',
      type: QuestionType.OpenEnded,
      groups: this.currentGroup ? [this.currentGroup as QuestionGroup] : [],
      dataType: QADataType.String,
      order: order,
      tenantId: this.propertyOwnerId,
      languageId: 'en_US'
    };

    this.formTitle = `Add New Question after "${question.text}"`;
    this.editingIndex = null;
    this.showForm = true;
    this.activeQuestionIndex = index;
    this.formPosition = 'after';
  }

  deleteQuestion(index: number): void {
    const question = this.questions[index];
    if (!question.id) return;

    if (confirm('Are you sure you want to delete this question?')) {
      this.questionService.deleteQuestion(question.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.questions.splice(index, 1);
            this.organizeQuestionsByGroup();

            // Refresh the preview form if it's currently being shown
            if (this.showPreview) {
              this.initializePreviewForm();
            }

            this.snackBar.open('Question deleted successfully', 'Close', { duration: 3000 });

            if (this.editingIndex === index) {
              this.editingIndex = null;
              this.showForm = false;
            }
          },
          error: (error) => {
            console.error('Error deleting question:', error);
            this.snackBar.open('Error deleting question. Please try again.', 'Close', { duration: 3000 });
          }
        });
    }
  }

  onSaveQuestion(question: Question): void {
    this.isSaving = true;

    // Save question (update or create)
    this.questionService.saveQuestion(question)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (result) => {
        // If result is a string, it's the ID of a newly created question
        if (typeof result === 'string') {
            question = { ...question, id: result };
        }

        if (this.editingIndex !== null) {
          // Update existing question in the array
          this.questions[this.editingIndex] = question;
        } else {
          // Add new question to the array
          this.questions.push(question);
          // Sort questions by order
          this.questions.sort((a, b) => (a.order || 0) - (b.order || 0));

          // Check if we need to normalize the order values
          // This is needed when adding questions to prevent order values from getting too close together
          if (this.currentGroup) {
            // If we're adding to a specific group, normalize that group
            this.normalizeQuestionOrder(this.currentGroup);
          }
        }

        this.organizeQuestionsByGroup();

        // Refresh the preview form if it's currently being shown
        if (this.showPreview) {
          this.initializePreviewForm();
        }

        this.editingIndex = null;
        this.showForm = false;
        this.currentGroup = null;
        this.activeQuestionIndex = null;
        this.formPosition = null;
        this.currentQuestion = null;
        this.isSaving = false;
        this.snackBar.open('Question saved successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error saving question:', error);
        this.isSaving = false;
        this.snackBar.open('Error saving question. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  onCancelQuestion(): void {
    this.editingIndex = null;
    this.showForm = false;
    this.currentGroup = null;
    this.activeQuestionIndex = null;
    this.formPosition = null;
    this.currentQuestion = null;
    this.editingQuestion = false;
    this.editingGroupIndex = null;
  }

  expandAll(): void {
    this.allExpanded = true;
  }

  collapseAll(): void {
    this.allExpanded = false;
  }

  /**
   * Selects a question without displaying the edit form
   * @param index The index of the question in the questions array
   * @param groupIndex The index of the question's group in the availableGroups array
   */
  selectQuestion(index: number, groupIndex: number): void {
    const question = this.questions[index];

    // Set the current question to the selected question
    this.currentQuestion = { ...question };

    // Set the active question index
    this.activeQuestionIndex = index;
    this.editingGroupIndex = groupIndex;

    // Don't show the form
    this.showForm = false;
    this.editingQuestion = false;
    this.editingIndex = index;
  }

  /**
   * Handles the selection of a question from the network/graph
   * @param question The selected question
   */
  onQuestionSelected(question: Question): void {
    // Find the index of the question in the questions array
    const index = this.questions.findIndex(q => q.questionId === question.questionId);
    if (index !== -1) {
      // Find the group index
      const groupIndex = this.availableGroups.findIndex(group =>
        question.groups.includes(group as QuestionGroup)
      );
      // Select the question without displaying the edit form
      this.selectQuestion(index, groupIndex);
    }
  }

  /**
   * Handles the addition of a nested question from the network/graph
   * @param event The event containing the parent question and answer
   */
  onAddNestedQuestion(event: { parentQuestion: Question, answer: string }): void {
    const { parentQuestion, answer } = event;

    // Create a new question with a dependency on the parent question
    const newQuestion: Question = {
      questionId: Math.floor(Math.random() * 1000000).toString(),
      text: '',
      type: QuestionType.OpenEnded,
      groups: parentQuestion.groups,
      dataType: QADataType.String,
      order: this.questions.length > 0 ? this.questions[this.questions.length - 1].order! + 10 : 0,
      tenantId: this.propertyOwnerId,
      languageId: 'en_US',
      dependsOn: [new Map<OperationType, Array<QuestionDependency>>([
          ['And', [{
              questionId: parentQuestion.questionId,
              answer: answer,
          }]]
      ])]
    };

    // Set the current question to the new question
    this.currentQuestion = newQuestion;

    // Show the form for adding the new question
    this.formTitle = `Add Nested Question for "${parentQuestion.text}" (Answer: ${answer})`;
    this.editingIndex = null;
    this.showForm = true;
    this.activeQuestionIndex = null;
    this.formPosition = 'end';
  }

  /**
   * Cleanup event listeners when component is destroyed
   */
  ngOnDestroy(): void {
    // Remove event listeners only if in browser environment
    if (this.isBrowser) {
      document.removeEventListener('mousemove', this.boundDoResize);
      document.removeEventListener('mouseup', this.boundStopResize);
    }
  }

  /**
   * Normalizes the order values of questions to ensure they are evenly distributed
   * This prevents order values from getting too close together
   * @param groupName The name of the group to normalize (if undefined, normalizes all questions)
   */
  normalizeQuestionOrder(groupName?: string): void {
    // If a group name is provided, only normalize questions in that group
    const questionsToNormalize = groupName
      ? this.groupedQuestions[groupName]
      : this.questions;

    if (questionsToNormalize.length <= 1) return;

    // Sort the questions by their current order
    questionsToNormalize.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Assign new order values with a fixed increment (e.g., 10)
    const increment = 10;
    questionsToNormalize.forEach((question, index) => {
      question.order = index * increment;
    });

    // If we're normalizing a specific group, we need to update the main questions array
    if (groupName) {
      // Update the order in the main questions array
      questionsToNormalize.forEach(question => {
        const index = this.questions.findIndex(q => q.questionId === question.questionId);
        if (index !== -1) {
          this.questions[index].order = question.order;
        }
      });
    }

    // Save the updated questions to the server
    this.saveQuestionOrders(questionsToNormalize);
  }

  /**
   * Saves the updated order values of questions to the server
   * @param questions The questions with updated order values
   */
  saveQuestionOrders(questions: Question[]): void {
    // Use forkJoin to combine multiple observables
    const saveObservables = questions.map(question =>
      this.questionService.saveQuestion(question)
    );

    // If there are no questions to save, return early
    if (saveObservables.length === 0) {
      return;
    }

    // Wait for all questions to be saved
    import('rxjs').then(({ forkJoin }) => {
      forkJoin(saveObservables)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.snackBar.open('Question order updated successfully', 'Close', { duration: 3000 });

            // Refresh the preview form if it's currently being shown
            if (this.showPreview) {
              this.initializePreviewForm();
            }
          },
          error: (error) => {
            console.error('Error saving question order:', error);
            this.snackBar.open('Error updating question order. Please try again.', 'Close', { duration: 3000 });
          }
        });
    });
  }

  /**
   * Identifies all questions that are part of a network/dependency chain with the given question
   * @param question The question to find related questions for
   * @param allQuestions All questions to search through
   * @returns An array of questions that are part of the same network/dependency chain
   */
  findRelatedQuestions(question: Question, allQuestions: Question[]): Question[] {
    // Create a set to store the IDs of related questions
    const relatedQuestionIds = new Set<string>();

    // Add the question itself
    relatedQuestionIds.add(question.questionId);

    // Find parent questions (questions that this question depends on) recursively
    const findAllParentQuestions = (childQuestionId: string, processedIds: Set<string> = new Set<string>()) => {
      // Avoid processing the same question multiple times (prevents infinite recursion in case of circular dependencies)
      if (processedIds.has(childQuestionId)) {
        return;
      }
      processedIds.add(childQuestionId);

      // Find the child question
      const childQuestion = allQuestions.find(q => q.questionId === childQuestionId);
      if (!childQuestion || !childQuestion.dependsOn || childQuestion.dependsOn.length === 0) {
        return;
      }

      // Process each dependency map
      childQuestion.dependsOn.forEach(dependencyMap => {
        // Check if dependencyMap is a Map or a plain object
        let entries: [string, any][] = [];

        if (dependencyMap instanceof Map) {
          // If it's a Map, convert it to entries
          entries = Array.from(dependencyMap.entries());
        } else {
          // If it's a plain object, use Object.entries
          entries = Object.entries(dependencyMap);
        }

        // Process each entry
        for (const [operationType, dependencies] of entries) {
          // For each dependency in the array
          if (Array.isArray(dependencies)) {
            dependencies.forEach((dependency: { questionId: any; answer: any; }) => {
              // Add the parent question ID
              relatedQuestionIds.add(dependency.questionId);

              // Recursively find all parents of this parent
              findAllParentQuestions(dependency.questionId, processedIds);
            });
          }
        }
      });
    };

    // Find child questions (questions that depend on this question) recursively
    const findAllChildQuestions = (parentQuestionId: string, processedIds: Set<string> = new Set<string>()) => {
      // Avoid processing the same question multiple times (prevents infinite recursion in case of circular dependencies)
      if (processedIds.has(parentQuestionId)) {
        return;
      }
      processedIds.add(parentQuestionId);

      allQuestions.forEach(q => {
        if (q.dependsOn && q.dependsOn.length > 0) {
          let isChild = false;
          q.dependsOn.forEach(dependencyMap => {
            // Check if dependencyMap is a Map or a plain object
            let entries: [string, any][] = [];

            if (dependencyMap instanceof Map) {
              // If it's a Map, convert it to entries
              entries = Array.from(dependencyMap.entries());
            } else {
              // If it's a plain object, use Object.entries
              entries = Object.entries(dependencyMap);
            }

            // Process each entry
            for (const [operationType, dependencies] of entries) {
              // For each dependency in the array
              if (Array.isArray(dependencies)) {
                dependencies.forEach((dependency: { questionId: any; answer: any; }) => {
                  // If this question depends on the parent question, add it as a child
                  if (dependency.questionId === parentQuestionId) {
                    relatedQuestionIds.add(q.questionId);
                    isChild = true;
                  }
                });
              }
            }
          });

          // If this is a child, recursively find its children
          if (isChild) {
            findAllChildQuestions(q.questionId, processedIds);
          }
        }
      });
    };

    // Start the recursive searches from the question
    if (question.dependsOn && question.dependsOn.length > 0) {
      findAllParentQuestions(question.questionId);
    }
    findAllChildQuestions(question.questionId);

    // Return all questions that are part of the same network/dependency chain
    return allQuestions.filter(q => relatedQuestionIds.has(q.questionId));
  }

  /**
   * Handles the drop event when a question is dragged and dropped
   * @param event The drag and drop event
   * @param groupName The name of the group containing the questions
   */
  onQuestionDrop(event: CdkDragDrop<Question[]>, groupName: string): void {
    if (event.previousIndex === event.currentIndex) return;

    // Get the questions in this group
    const questions = this.groupedQuestions[groupName];

    // Get the question being dragged
    const draggedQuestion = questions[event.previousIndex];

    // Find all questions that are part of the same network/dependency chain
    const relatedQuestions = this.findRelatedQuestions(draggedQuestion, questions);

    // If the dragged question is part of a network/dependency chain
    if (relatedQuestions.length > 1) {
      // Get the indices of all related questions
      const relatedIndices = relatedQuestions.map(q => questions.findIndex(question => question.questionId === q.questionId));

      // Check if the dragged question is the first question in the network
      const isFirstInNetwork = relatedIndices.every(index => index >= event.previousIndex);

      // Check if the dragged question is the last question in the network
      const isLastInNetwork = relatedIndices.every(index => index <= event.previousIndex);

      // Only allow moving the entire network if the dragged question is the first or last in the network
      if (!isFirstInNetwork && !isLastInNetwork) {
        // Show a message to the user
        this.snackBar.open('Questions that are part of a network can only be moved as a group. Please drag the first or last question in the network.', 'Close', { duration: 5000 });
        return;
      }

      // Sort the related indices
      relatedIndices.sort((a, b) => a - b);

      // Calculate the offset between the current index and the target index
      const offset = event.currentIndex - event.previousIndex;

      // Create a copy of the questions array
      const newQuestions = [...questions];

      // Remove all related questions from their original positions
      relatedQuestions.forEach(q => {
        const index = newQuestions.findIndex(question => question.questionId === q.questionId);
        if (index !== -1) {
          newQuestions.splice(index, 1);
        }
      });

      // Calculate the new position for the first related question
      let newPosition = event.currentIndex;
      if (event.currentIndex > event.previousIndex) {
        // If moving down, adjust for the removed questions
        newPosition -= relatedIndices.filter(index => index < event.currentIndex).length;
      }

      // Insert all related questions at their new positions
      relatedQuestions.forEach((q, i) => {
        newQuestions.splice(newPosition + i, 0, q);
      });

      // Update the groupedQuestions array
      this.groupedQuestions[groupName] = newQuestions;
    } else {
      // If the dragged question is not part of a network, proceed with the normal drag-and-drop behavior
      moveItemInArray(questions, event.previousIndex, event.currentIndex);
    }

    // Update the order property of each question
    this.updateQuestionOrderAfterDrop(questions);

    // Refresh the preview form if it's currently being shown
    if (this.showPreview) {
      this.initializePreviewForm();
    }

    // Save the updated questions
    this.saveQuestionOrders(questions);
  }

  /**
   * Updates the order property of questions after they have been reordered
   * @param questions The reordered questions
   */
  updateQuestionOrderAfterDrop(questions: Question[]): void {
    // If there are no questions or only one question, there's nothing to update
    if (questions.length <= 1) return;

    // Calculate new order values
    const increment = 10;
    questions.forEach((question, index) => {
      question.order = index * increment;
    });
  }
}
