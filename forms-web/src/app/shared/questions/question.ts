
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {DocumentData, QueryDocumentSnapshot, SnapshotOptions, Timestamp} from "firebase/firestore";
import {
    OperationType,
    QADataType,
    QuestionDependency,
    QuestionGroup,
    QuestionOption,
    QuestionType,
    ValidationType
} from "../../generated";

export interface Question {
        /**
        * Unique document id auto generated
        */
        readonly id?: string;

        /**
        * The principal that created the entity containing the field.
        */
        readonly createdBy?: string;

        /**
        * The date and time the entity containing the field was created.
        */
        readonly createdAt?: Date;

        /**
        * The principal that recently modified the entity containing the field.
        */
        readonly updatedBy?: string;

        /**
        * The date the entity containing the field was recently modified.
        */
        readonly updatedAt?: Date;

        /**
        * The tenant id this object is associated with
        */
        tenantId?: string;

        /**
        * The language id this object is associated with
        */
        languageId?: string;

        type: QuestionType;

        /**
        * Question id
        */
        questionId: string;

        /**
        * Question Text.
        */
        text: string;

        /**
        * one or more question group like Client/Parent/Guardian
        */
        groups: Array<QuestionGroup>;

        /**
        * The options of the question for user to choose
        */
        options?: Array<QuestionOption>;

        possibleAnswers?: Array<string>;

        dataType: QADataType;

        validations?: Array<ValidationType>;

        additionalUserInputRequired?: boolean;

        additionalUserInputFieldLabel?: string;

        helpText?: string;

        order?: number;

        dependsOn?: Array<Map<OperationType, Array<QuestionDependency>>>;

}
export namespace Question {
}

export type QuestionFormType = FormGroup<{
    type: FormControl<QuestionType>;

    text: FormControl<string>;

    groups: FormControl<Array<QuestionGroup>>;

    options: FormControl<Array<QuestionOption>|null>;

    possibleAnswers: FormControl<Array<string>|null>;

    dataType: FormControl<QADataType>;

    validations: FormControl<Array<ValidationType>|null>;

    additionalUserInputRequired: FormControl<boolean|null>;

    additionalUserInputFieldLabel: FormControl<string|null>;

    helpText: FormControl<string|null>;
 }>

export function getQuestionForm(): QuestionFormType {
    return new FormGroup({







    type: new FormControl<QuestionType>("Open Ended", {  nonNullable:  true  ,
    validators: [  Validators.required, ] } ),



    text: new FormControl<string>("", {  nonNullable:  true  ,
    validators: [  Validators.required, ] } ),


    groups: new FormControl<Array<QuestionGroup>>([], {  nonNullable:  true  ,
    validators: [  Validators.required, ] } ),


    options: new FormControl<Array<QuestionOption>>([], {  nonNullable:   false ,
    validators: [ ] } ),


    possibleAnswers: new FormControl<Array<string>>([], {  nonNullable:   false ,
    validators: [ ] } ),


    dataType: new FormControl<QADataType>("String", {  nonNullable:  true  ,
    validators: [  Validators.required, ] } ),


    validations: new FormControl<Array<ValidationType>>([], {  nonNullable:   false ,
    validators: [ ] } ),


    additionalUserInputRequired: new FormControl<boolean>(false, {  nonNullable:   false ,
    validators: [ ] } ),


    additionalUserInputFieldLabel: new FormControl<string>("", {  nonNullable:   false ,
    validators: [ ] } ),


    helpText: new FormControl<string>("", {  nonNullable:   false ,
    validators: [ ] } ),



    })
}


// Firestore data converter for Question
export const QuestionFirestoreConverter = {
toFirestore(modelObject: Question): DocumentData {
return {

    createdBy: modelObject.createdBy,
    createdAt: modelObject.createdAt,
    updatedBy: modelObject.updatedBy,
    updatedAt: modelObject.updatedAt,
    tenantId: modelObject.tenantId,
    languageId: modelObject.languageId,
    type: modelObject.type,
    questionId: modelObject.questionId,
    text: modelObject.text,
    groups: modelObject.groups,
    options: modelObject.options,
    possibleAnswers: modelObject.possibleAnswers,
    dataType: modelObject.dataType,
    validations: modelObject.validations,
    additionalUserInputRequired: modelObject.additionalUserInputRequired,
    additionalUserInputFieldLabel: modelObject.additionalUserInputFieldLabel,
    helpText: modelObject.helpText,
    order: modelObject.order,
    dependsOn: convertDependsOnToFirestore(modelObject.dependsOn),
};
},
fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Question {
const data = snapshot.data(options);
return {
    id: snapshot.id,


    createdBy: data['createdBy'],

    createdAt: data['createdAt']?(data['createdAt'] as Timestamp).toDate(): undefined,

    updatedBy: data['updatedBy'],

    updatedAt: data['updatedAt']?(data['updatedAt'] as Timestamp).toDate(): undefined,

    tenantId: data['tenantId'],

    languageId: data['languageId'],

    type: data['type'],

    questionId: data['questionId'],

    text: data['text'],

    groups: data['groups'],

    options: data['options'],

    possibleAnswers: data['possibleAnswers'],

    dataType: data['dataType'],

    validations: data['validations'],

    additionalUserInputRequired: data['additionalUserInputRequired'],

    additionalUserInputFieldLabel: data['additionalUserInputFieldLabel'],

    helpText: data['helpText'],

    order: data['order'],

    dependsOn: convertDependsOnFromFirestore(data['dependsOn']),
} as Question;
}
};


// Firestore converter for dependsOn field
function convertDependsOnToFirestore(dependsOn?: Array<Map<OperationType, Array<QuestionDependency>>>): DocumentData | undefined {
    if (!dependsOn) return undefined;
    return dependsOn.map((dependencyMap) => {
        const convertedMap: Record<string, Array<QuestionDependency>> = {};
        dependencyMap.forEach((value, key) => {
            convertedMap[key] = value;
        });
        return convertedMap;
    });
}

function convertDependsOnFromFirestore(data?: Array<Record<string, Array<QuestionDependency>>>): Array<Map<OperationType, Array<QuestionDependency>>> | undefined {
    if (!data) return undefined;
    return data.map((dependencyObject) => {
        const dependencyMap = new Map<OperationType, Array<QuestionDependency>>();
        for (const [key, value] of Object.entries(dependencyObject)) {
            dependencyMap.set(key as OperationType, value);
        }
        return dependencyMap;
    });
}
