# Forms OpenAPI

This module contains the OpenAPI specifications that define the data models and API endpoints for the Forms project.

## Overview

The OpenAPI specifications in this module serve as the source of truth for generating code across the platform. They define:

- Data models (schemas)
- API endpoints (paths)
- Security schemes
- Server configurations

By maintaining these specifications in a structured format, we ensure consistency between frontend and backend implementations and enable automated code generation.

## Directory Structure

```
src/main/resources/
├── components/
│   ├── schemas/
│   │   ├── client/           # Client-related schemas
│   │   ├── common/           # Common/shared schemas
│   │   └── tenant/           # Tenant-related schemas
│   └── securitySchemes/      # Security definitions
├── config/                   # Configuration files
├── paths/                    # API endpoint definitions
│   ├── client/               # Client API endpoints
│   └── tenant/               # Tenant API endpoints
└── forms-builder-v1.yaml        # Main OpenAPI specification file
```

## Key Components

### Main Specification File

The `forms-builder-v1.yaml` file is the entry point for the OpenAPI specification. It includes:

- API information (title, description, version)
- Server configurations
- Security schemes
- References to path and component definitions

### Schemas

The `components/schemas/` directory contains data model definitions organized by domain:

- **Client**: Models for client data management
- **Common**: Shared models like Address, Person, Question, QuestionGroup, Residence, Employment, etc.
- **Property**: Models for property data management, including PropertyBase and PropertyType
- **Property Owner**: Models for property owner management
- **Tenant**: Models for tenant management

### Paths

The `paths/` directory contains API endpoint definitions organized by domain:

- **Client**: Endpoints for client management
- **Tenant**: Endpoints for tenant management

## Usage

### Viewing the API Documentation

You can view the API documentation by loading the `forms-builder-v1.yaml` file into an OpenAPI viewer like:

- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Redoc](https://github.com/Redocly/redoc)
- [Stoplight Studio](https://stoplight.io/studio)

### Generating Code

The specifications in this module are used by the `forms-openapi-generator` module to generate:

- TypeScript models and Angular components for the frontend
- Java models and Spring controllers for the backend

## Best Practices

When modifying the OpenAPI specifications:

1. Maintain backward compatibility when possible
2. Use consistent naming conventions
3. Leverage common components for reusability
4. Document all schemas and endpoints thoroughly
5. Validate changes against the OpenAPI specification
