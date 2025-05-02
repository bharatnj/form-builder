import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../../shared/questions/question';
import { OperationType } from "../../../generated";
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

interface NetworkNode {
  question: Question;
  children: NetworkNode[];
  level: number;
  position: number;
  triggerAnswer?: string; // The answer that triggers this node (if it's a child node)
  expanded: boolean; // Whether this node's children are expanded or collapsed
}

@Component({
  selector: 'app-question-network',
  templateUrl: './question-network.component.html',
  styleUrls: ['./question-network.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  standalone: true
})
export class QuestionNetworkComponent implements OnInit, OnChanges {
  @Input() questions: Question[] = [];
  @Input() selectedQuestion: Question | null = null;

  @Output() questionSelected = new EventEmitter<Question>();
  @Output() addNestedQuestion = new EventEmitter<{ parentQuestion: Question, answer: string }>();

  networkNodes: NetworkNode[] = [];
  rootNodes: NetworkNode[] = [];
  localSelectedQuestion: Question | null = null;

  constructor() { }

  ngOnInit(): void {
    // Initialize localSelectedQuestion with the value of selectedQuestion
    if (this.selectedQuestion) {
      this.localSelectedQuestion = this.selectedQuestion;
    }
    this.buildNetwork();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update localSelectedQuestion when selectedQuestion changes
    if (changes['selectedQuestion']) {
      this.localSelectedQuestion = this.selectedQuestion;
    }
    // Update the network when questions or selectedQuestion changes
    if (changes['questions'] || changes['selectedQuestion']) {
      this.buildNetwork();
    }
    console.log('question network - ', this.networkNodes,);
  }

  buildNetwork(): void {
    // Reset the network
    this.networkNodes = [];
    this.rootNodes = [];

    // Create a map of question IDs to questions for quick lookup
    const questionMap = new Map<string, Question>();
    this.questions.forEach(question => {
      questionMap.set(question.questionId, question);
    });

    // Debug log: Log the questions
    console.log('Questions:', this.questions);

    // If a question is selected, we'll filter the questions to only include those that are directly related to it
    let filteredQuestions = this.questions;

    if (this.localSelectedQuestion) {
      // Find all questions that are directly related to the selected question
      const relatedQuestionIds = new Set<string>();

      // Add the selected question itself
      relatedQuestionIds.add(this.localSelectedQuestion.questionId);

      // Find parent questions (questions that the selected question depends on) recursively
      const findAllParentQuestions = (childQuestionId: string, processedIds: Set<string> = new Set<string>()) => {
        // Avoid processing the same question multiple times (prevents infinite recursion in case of circular dependencies)
        if (processedIds.has(childQuestionId)) {
          return;
        }
        processedIds.add(childQuestionId);

        // Find the child question
        const childQuestion = this.questions.find(q => q.questionId === childQuestionId);
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

      // Start the recursive search from the selected question
      if (this.localSelectedQuestion.dependsOn && this.localSelectedQuestion.dependsOn.length > 0) {
        findAllParentQuestions(this.localSelectedQuestion.questionId);
      }

      // Find child questions (questions that depend on the selected question) recursively
      // First, find direct children
      const findAllChildQuestions = (parentQuestionId: string, processedIds: Set<string> = new Set<string>()) => {
        // Avoid processing the same question multiple times (prevents infinite recursion in case of circular dependencies)
        if (processedIds.has(parentQuestionId)) {
          return;
        }
        processedIds.add(parentQuestionId);

        this.questions.forEach(question => {
          if (question.dependsOn && question.dependsOn.length > 0) {
            let isChild = false;
            question.dependsOn.forEach(dependencyMap => {
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
                      relatedQuestionIds.add(question.questionId);
                      isChild = true;
                    }
                  });
                }
              }
            });

            // If this is a child, recursively find its children
            if (isChild) {
              findAllChildQuestions(question.questionId, processedIds);
            }
          }
        });
      };

      // Start the recursive search from the selected question
      if (this.localSelectedQuestion) {
        findAllChildQuestions(this.localSelectedQuestion.questionId);
      }

      // Filter the questions to only include those that are directly related to the selected question
      filteredQuestions = this.questions.filter(question => relatedQuestionIds.has(question.questionId));

      console.log('Related Question IDs:', Array.from(relatedQuestionIds));
      console.log('Filtered Questions:', filteredQuestions);
    }

    // Create network nodes for each filtered question
    filteredQuestions.forEach(question => {
      const node: NetworkNode = {
        question,
        children: [],
        level: 0,
        position: 0,
        expanded: true // Default to expanded
      };
      this.networkNodes.push(node);
    });

    // Create a map of child nodes to their parent nodes and trigger answers
    const childToParentMap = new Map<NetworkNode, { parentNode: NetworkNode, triggerAnswer: string }[]>();

    // Build the parent-child relationships
    this.networkNodes.forEach(node => {
      const question = node.question;
      if (question.dependsOn && question.dependsOn.length > 0) {
        // This question depends on other questions
        question.dependsOn.forEach(dependencyMap => {
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
                // Find the parent node
                const parentId = dependency.questionId;
                const parentNode = this.networkNodes.find(n => n.question.questionId === parentId);
                if (parentNode) {
                  // Add this node as a child of the parent
                  parentNode.children.push(node);

                  // Add to the childToParentMap
                  if (!childToParentMap.has(node)) {
                    childToParentMap.set(node, []);
                  }
                  childToParentMap.get(node)?.push({
                    parentNode,
                    triggerAnswer: dependency.answer
                  });
                }
              });
            }
          }
        });
      }
    });

    // Set the trigger answer for each child node
    childToParentMap.forEach((parents, childNode) => {
      if (parents.length > 0) {
        // For simplicity, use the first parent's trigger answer
        // In a more complex implementation, you might want to handle multiple parents differently
        childNode.triggerAnswer = parents[0].triggerAnswer;
      }
    });

    // Find root nodes (nodes with no parents)
    this.rootNodes = this.networkNodes.filter(node => {
      const question = node.question;
      return !question.dependsOn || question.dependsOn.length === 0;
    });

    // Assign levels and positions to nodes
    this.assignLevelsAndPositions();

    // Debug log: Log the network nodes and their children
    console.log('Network Nodes:', this.networkNodes);
    console.log('Root Nodes:', this.rootNodes);
    console.log('Parent-Child Relationships:');

    // Count total connections
    let totalConnections = 0;

    this.networkNodes.forEach(node => {
      if (node.children.length > 0) {
        console.log(`Parent: ${node.question.text} (ID: ${node.question.questionId})`);
        node.children.forEach(child => {
          totalConnections++;
          console.log(`  Child: ${child.question.text} (ID: ${child.question.questionId})`);
        });
      }
    });

    console.log(`Total Connections: ${totalConnections}`);

    // Debug log for dependsOn structure
    this.questions.forEach(question => {
      if (question.dependsOn && question.dependsOn.length > 0) {
        console.log(`Question ${question.text} (ID: ${question.questionId}) has dependencies:`);
        question.dependsOn.forEach((dependencyMap, index) => {
          console.log(`  Dependency Map ${index}:`, dependencyMap);
          console.log(`  Is Map: ${dependencyMap instanceof Map}`);
          console.log(`  Type: ${typeof dependencyMap}`);

          if (dependencyMap instanceof Map) {
            console.log(`  Entries: ${Array.from(dependencyMap.entries())}`);
          } else {
            console.log(`  Entries: ${JSON.stringify(Object.entries(dependencyMap))}`);
          }
        });
      }
    });
  }

  findChildQuestion()
  {

  }

  assignLevelsAndPositions(): void {
    // For a horizontal layout, we need to sort the nodes in a logical order
    // First, identify all root nodes (nodes with no dependencies)
    this.rootNodes = this.networkNodes.filter(node => {
      const question = node.question;
      return !question.dependsOn || question.dependsOn.length === 0;
    });

    // Create a new sorted array of nodes
    const sortedNodes: NetworkNode[] = [];

    // Start with root nodes
    this.rootNodes.forEach(rootNode => {
      // Add the root node
      sortedNodes.push(rootNode);

      // Recursively add all children
      const addChildren = (node: NetworkNode) => {
        node.children.forEach(child => {
          // Only add the child if it's not already in the sorted array
          if (!sortedNodes.includes(child)) {
            sortedNodes.push(child);
            // Recursively add this child's children
            addChildren(child);
          }
        });
      };

      addChildren(rootNode);
    });

    // Replace the networkNodes array with the sorted array
    this.networkNodes = sortedNodes;

    // Assign simple sequential positions
    this.networkNodes.forEach((node, index) => {
      node.position = index;
    });

    console.log('Sorted Network Nodes:', this.networkNodes);
  }

  onQuestionClick(node: NetworkNode): void {
    this.localSelectedQuestion = node.question;
    this.questionSelected.emit(node.question);
  }

  onAddNestedQuestion(node: NetworkNode, answer: string): void {
    this.addNestedQuestion.emit({ parentQuestion: node.question, answer });
  }

  // These methods are no longer needed for the horizontal layout
  getNodeStyle(node: NetworkNode): any {
    return {}; // No special styles needed for horizontal layout
  }

  getConnectionStyle(parent: NetworkNode, child: NetworkNode): any {
    return {}; // No special styles needed for horizontal layout
  }

  isSelected(node: NetworkNode): boolean {
    return this.localSelectedQuestion?.questionId === node.question.questionId;
  }

  // Helper method to get the answer that triggers a child question
  getTriggerAnswer(parentQuestion: Question, childQuestion: Question): string | null {
    if (!childQuestion.dependsOn || childQuestion.dependsOn.length === 0) {
      return null;
    }

    // Find the child node that corresponds to the childQuestion
    const childNode = this.networkNodes.find(node => node.question.questionId === childQuestion.questionId);
    if (childNode && childNode.triggerAnswer) {
      return childNode.triggerAnswer;
    }

    // If we couldn't find the trigger answer in the node, search through the dependencies
    for (const dependencyMap of childQuestion.dependsOn) {
      for (const [operationType, dependencies] of Object.entries(dependencyMap)) {
        const dependency = dependencies.find((dep: { questionId: string; }) => dep.questionId === parentQuestion.questionId);
        if (dependency) {
          return dependency.answer;
        }
      }
    }

    return null;
  }

  // Helper method to get the operation type between dependencies
    getOperationType(childQuestion: Question | undefined): OperationType {
    if (!childQuestion || !childQuestion.dependsOn || childQuestion.dependsOn.length <= 1) {
      return OperationType.And;
    }

    // If there are multiple dependencies, get the operation type from the first dependency map
    // This is a simplification - in reality, you might need more complex logic
    const firstDependencyMap = childQuestion.dependsOn[0];
    const operationType = Object.keys(firstDependencyMap)[0] as OperationType;
    return operationType || OperationType.And;
  }

  isDependentQuestion(networkNode: NetworkNode)
  {
      return networkNode?.question?.dependsOn?.length
  }
  isInNetwork()
  {

  }

  // Helper method to check if a question has a direct relationship with another question
  hasDirectRelationship(question: Question, otherQuestion: Question | null): boolean {
    if (!otherQuestion) {
      return false;
    }

    // Check if question is a parent of otherQuestion
    if (otherQuestion.dependsOn && otherQuestion.dependsOn.length > 0) {
      for (const dependencyMap of otherQuestion.dependsOn) {
        for (const [operationType, dependencies] of Object.entries(dependencyMap)) {
          if (Array.isArray(dependencies)) {
            for (const dependency of dependencies) {
              if (dependency.questionId === question.questionId) {
                return true;
              }
            }
          }
        }
      }
    }

    // Check if question is a child of otherQuestion
    if (question.dependsOn && question.dependsOn.length > 0) {
      for (const dependencyMap of question.dependsOn) {
        for (const [operationType, dependencies] of Object.entries(dependencyMap)) {
          if (Array.isArray(dependencies)) {
            for (const dependency of dependencies) {
              if (dependency.questionId === otherQuestion.questionId) {
                return true;
              }
            }
          }
        }
      }
    }

    return false;
  }

  // Helper method to count the number of connection lines
  getConnectionCount(): number {
    let count = 0;
    this.networkNodes.forEach(node => {
      count += node.children.length;
    });
    //console.log(`getConnectionCount: ${count}`);
    return count;
  }

  // Toggle the expanded/collapsed state of a node
  toggleNodeExpanded(node: NetworkNode, event: Event): void {
    event.stopPropagation(); // Prevent the click from triggering onQuestionClick
    node.expanded = !node.expanded;
  }

  // Check if a node has multiple children
  hasMultipleChildren(node: NetworkNode): boolean {
    return node.children.length > 1;
  }
}
