import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Question } from '../shared/questions/question';
import { QuestionGroup, QuestionType, QADataType } from '../generated';
import { HttpClient } from '@angular/common/http';
import * as fs from 'fs';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  // Using a Map as a data store with question ID as the key
  private questions: Map<string, Question> = new Map<string, Question>();

  // Master tenant ID constant
  private readonly MASTER_TENANT_ID = '1';

  constructor(private http: HttpClient) {
    // Initialize with mock data
    this.initializeMockData();
  }

  /**
   * Read questions from JSON file
   * @returns Observable of Question array
   */
  private readQuestionsFromJson(): Observable<Question[]> {
    return this.http.get<Question[]>('/questions.json');
  }

  /**
   * Write questions to JSON file
   * @param questions The questions to write
   */
  private writeQuestionsToJson(questions: Question[]): Observable<any> {
    // In a real application, this would make a POST/PUT request to a server endpoint
    // that would update the database. For this mock implementation,
    // we'll log a message and return an observable that completes successfully.

    const filePath = 'forms-web/public/questions.json';
    return of({success: true, filePath: filePath});
  }

  /**
   * Get questions for a specific tenant and language
   * @param tenantId The tenant ID
   * @param languageId The language ID
   * @param filter Optional filter parameter
   * @returns Observable of Question array
   */
  getQuestions(tenantId: string, languageId: string, filter?: any): Observable<Question[]> {
    // Filter questions by tenant ID and language ID
    const filteredQuestions = Array.from(this.questions.values())
      .filter(q => q.tenantId === tenantId && q.languageId === languageId);

    return of(filteredQuestions);
  }

  /**
   * Get questions from the master tenant that don't exist in the current tenant
   * @param currentTenantId The current tenant ID
   * @param languageId The language ID
   * @param filter Optional filter parameter
   * @param currentTenantQuestions Questions from the current tenant
   * @returns Observable of Question array
   */
  getMasterTenantQuestions(
    currentTenantId: string,
    languageId: string,
    filter?: any,
    currentTenantQuestions?: Question[]
  ): Observable<Question[]> {
    // Get all master tenant questions
    const masterQuestions = Array.from(this.questions.values())
      .filter(q => q.tenantId === this.MASTER_TENANT_ID && q.languageId === languageId);

    // If no current tenant questions, return all master questions
    if (!currentTenantQuestions || currentTenantQuestions.length === 0) {
      return of(masterQuestions);
    }

    // Get question IDs from current tenant
    const currentQuestionIds = currentTenantQuestions.map(q => q.questionId);

    // Filter out master questions that already exist in current tenant
    const uniqueMasterQuestions = masterQuestions
      .filter(q => !currentQuestionIds.includes(q.questionId));

    return of(uniqueMasterQuestions);
  }

  /**
   * Save a question
   * @param question The question to save
   * @returns Observable of the saved Question
   */
  saveQuestion(question: Question): Observable<Question> {
    // Generate an ID if one doesn't exist
    const questionToSave: Question = {
      ...question,
      id: question.id || this.generateId(),
      updatedAt: new Date()
    };

    // Save to the Map
    this.questions.set(questionToSave.id!, questionToSave);

    // Write all questions to JSON file in public directory
    this.writeQuestionsToJson(Array.from(this.questions.values())).subscribe(
      result => {
        console.log('Questions saved to JSON file in public directory:', result);
      },
      error => {
        console.error('Error saving questions to JSON file in public directory:', error);
      }
    );

    return of(questionToSave);
  }

  /**
   * Delete a question by ID
   * @param id The ID of the question to delete
   * @returns Observable of boolean indicating success
   */
  deleteQuestion(id: string): Observable<boolean> {
    const deleted = this.questions.delete(id);

    if (deleted) {
      // Write all questions to JSON file in public directory after deletion
      this.writeQuestionsToJson(Array.from(this.questions.values())).subscribe(
        result => {
          console.log('Questions updated in JSON file in public directory after deletion:', result);
        },
        error => {
          console.error('Error updating questions in JSON file in public directory after deletion:', error);
        }
      );
    }

    return of(deleted);
  }

  /**
   * Generate a unique ID
   * @returns A unique ID string
   */
  private generateId(): string {
    return 'q_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Initialize the service with mock data
   */
  private initializeMockData(): void {
    // Read questions from JSON file
    this.readQuestionsFromJson().subscribe(
      (questions: Question[]) => {
        // Convert dates from strings to Date objects
        const processedQuestions = questions.map(q => ({
          ...q,
          createdAt: q.createdAt ? new Date(q.createdAt) : undefined,
          updatedAt: q.updatedAt ? new Date(q.updatedAt) : undefined
        }));

        // Add questions to the Map
        processedQuestions.forEach(q => {
          this.questions.set(q.id!, q);
        });
      },
      error => {
        console.error('Error loading questions from JSON:', error);
        // Fallback to empty map if there's an error
        this.questions = new Map<string, Question>();
      }
    );
  }
}
