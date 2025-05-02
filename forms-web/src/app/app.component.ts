import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {QuestionnaireBuilderComponent} from './features/questionnaire-builder/questionnaire-builder.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, QuestionnaireBuilderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'forms-web';
}
