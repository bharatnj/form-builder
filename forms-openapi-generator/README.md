# Forms OpenAPI Generator

This module contains custom OpenAPI code generators that extend the standard OpenAPI Generator functionality to produce code tailored to the platform's needs.

## Overview

The Forms OpenAPI Generator provides custom code generation capabilities for both frontend and backend components:

- **Backend**: Custom Spring code generator for Java models, repositories, and controllers
- **Frontend**: Custom TypeScript Angular generator for models, services, and components

By extending the standard OpenAPI Generator, we maintain compatibility with the OpenAPI ecosystem while adding specific features and optimizations.

## Key Components

### ApiCodegen

`ApiCodegen` extends the standard Spring code generator to produce Java code with specific enhancements:

- Special handling for Firestore document models
- Processing of path parameters and adding them to model vendor extensions
- Generation of Spring Data repositories for models
- Custom Mustache templates for code generation

### CustomTypeScriptAngularCodegen

`CustomTypeScriptAngularCodegen` extends the standard TypeScript Angular client generator to produce frontend code with specific enhancements:

- Custom Mustache lambdas for template processing:
  - `ExtractLambda`: Extracts specific parts of data
  - `CompareLambda`: Compares values in templates
  - `DefaultValueLambda`: Provides default values
  - `IgnoreLambda`: Conditionally ignores sections
- Generation of form components and review components
- Support for question-based form generation
- Integration with the Questionnaire Builder

## Mustache Templates

The custom generators use Mustache templates to define the structure of the generated code. These templates are located in the `src/main/resources` directory and are organized by generator type.

### Key Templates

- **modelFormHtml.mustache**: Generates HTML form components for models
- **modelFormTs.mustache**: Generates TypeScript form components for models
- **modelReviewHtml.mustache**: Generates HTML review components for displaying submitted data
- **modelReviewTs.mustache**: Generates TypeScript review components for displaying submitted data
- **model.mustache**: Generates TypeScript model classes with form control definitions

### CLI Integration

To use the custom generators with the OpenAPI Generator CLI:

```bash
java -cp /path/to/forms-openapi-generator.jar:/path/to/openapi-generator-cli.jar \
    org.openapitools.codegen.OpenAPIGenerator generate \
    -g forms-builder-api \
    -i /path/to/openapi-spec.yaml \
    -o /path/to/output-directory
```

## Extending the Generators

To add new features or modify existing ones:

1. Extend the appropriate base class (`ApiCodegen` or `CustomTypeScriptAngularCodegen`)
2. Override methods as needed
3. Add new Mustache templates or modify existing ones
4. Register your generator in `META-INF/services/org.openapitools.codegen.CodegenConfig`

## Dependencies

- OpenAPI Generator (version 7.12.0 or higher)
- Spring Framework (for backend code generation)
- Angular (for frontend code generation)
