# FormsWeb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.1.

## Questionnaire Builder

The Questionnaire Builder is a powerful tool that allows property owners to create, configure, and manage custom questions for their forms. With an intuitive interface and real-time preview capabilities, property owners can easily design forms tailored to their specific needs.

### Key Features

- **Create and Manage Questions**: Add, edit, delete, and reorder questions with an easy-to-use interface
- **Question Grouping**: Organize questions into logical groups (e.g., Client, Property, Property Owner)
- **Question Types**: Support for various question types including:
  - Open-ended questions
  - Multiple choice
  - Yes/No questions
  - Numeric inputs
  - Date inputs
  - And more
- **Question Dependencies**: Create conditional questions that appear based on answers to previous questions
- **Real-time Preview**: See how your form will look to users as you build it
- **Drag and Drop Ordering**: Easily reorder questions using drag and drop functionality

### How to Use the Questionnaire Builder

1. **Access the Builder**: Navigate to the Questionnaire Builder section of the application
2. **Create Questions**: Click "Add Question" to create a new question
3. **Configure Question Properties**:
   - Enter the question text
   - Select the question type (open-ended, multiple choice, etc.)
   - Choose the question group (which section of the form it belongs to)
   - Add possible answers for multiple choice questions
   - Set data type and validation rules
   - Add help text if needed
   - Configure dependencies on other questions if applicable
4. **Preview the Form**: Toggle the preview panel to see how your questions will appear on the form
5. **Organize Questions**: Use drag and drop to reorder questions within their groups
6. **Save Changes**: All changes are automatically saved and reflected in the preview

### Question Configuration Options

When creating or editing a question, property owners can configure the following properties:

- **Question Text**: The actual text of the question
- **Question Type**: The type of question (open-ended, multiple choice, etc.)
- **Question Group**: Which section of the form the question belongs to
- **Possible Answers**: For multiple choice questions, the available options
- **Data Type**: The type of data expected in the answer (string, number, date, etc.)
- **Validation Rules**: Rules to ensure the answer meets certain criteria
- **Help Text**: Additional information to help users answer the question
- **Dependencies**: Make the question appear only when certain conditions are met

### Real-time Preview

The Questionnaire Builder includes a real-time preview feature that allows property owners to see exactly how their form will look to users. As questions are added, edited, or reordered, the preview updates automatically to reflect these changes. This makes it easy to design forms that are clear, logical, and user-friendly.

The preview panel can be toggled on and off, and its size can be adjusted using the resizable divider, allowing property owners to focus on either building questions or previewing the form as needed.

### Screenshots

The Questionnaire Builder interface includes:

![A list of questions organized by groups](docs/Screenshot1.png)
![A form for adding and editing questions](docs/Screenshot2.png)
![A real-time preview of the form](docs/Screenshot3.png)

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Deploying to GitHub Pages

This project is configured to deploy to GitHub Pages using the [angular-cli-ghpages](https://github.com/angular-schule/angular-cli-ghpages) package.

### Configuration

Before deploying, you need to update the GitHub credentials in the `angular.json` file. Open the file and locate the `deploy` section. You should update the following options:

1. The `name` field: Replace "YOUR_GITHUB_USERNAME" with your actual GitHub username
2. The `email` field: Replace "YOUR_GITHUB_EMAIL" with your actual GitHub email

### Deployment

To deploy the application to GitHub Pages, run:

```bash
npm run deploy
```

This will build the application and deploy it to the GitHub Pages site associated with the repository.

If you encounter authentication issues, you can also use a personal access token by setting the `GH_TOKEN` environment variable:

```bash
GH_TOKEN=your_personal_access_token npm run deploy
```

You can create a personal access token in your GitHub account settings under Developer Settings > Personal access tokens.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
