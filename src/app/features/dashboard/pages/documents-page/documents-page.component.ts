import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { PageContainerComponent } from '../../../../core/layout/page-container/page-container.component';
import { CardComponent } from '../../../../core/ui/card/card.component';
import { RichHtmlEditorComponent } from '../../components/rich-html-editor/rich-html-editor.component';
import { DocumentPreviewCardComponent } from '../../components/document-preview-card/document-preview-card.component';
import {AppInputComponent} from '../../../../core/ui/input/app-input.component';

interface DocumentsForm {
  content: FormControl<string>;
  title: FormControl<string>;
}

@Component({
  selector: 'app-documents-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent,
    CardComponent,
    RichHtmlEditorComponent,
    DocumentPreviewCardComponent,
    AppInputComponent,
  ],
  templateUrl: './documents-page.component.html',
  styleUrl: './documents-page.component.scss',
})
export class DocumentsPageComponent {
  readonly form = new FormGroup<DocumentsForm>({
    content: new FormControl<string>('<p>Type here...</p>', { nonNullable: true }),
    title: new FormControl<string>('', { nonNullable: true })
  });

  get contentHtml(): string {
    return this.form.controls.content.value;
  }

  clearEditor(): void {
    this.form.controls.content.setValue('');
  }

  exportHtml(): void {
    const content = this.form.controls.content.value;
    const htmlDocument = this.buildHtmlDocument(content);

    const blob = new Blob([htmlDocument], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = this.buildFileName();
    anchor.click();

    URL.revokeObjectURL(url);
  }

  private buildHtmlDocument(content: string): string {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Document Export</title>
    <style>
      body {
        font-family: "Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
        margin: 2rem auto;
        max-width: 800px;
        line-height: 1.6;
      }
      h1, h2, h3 { line-height: 1.25; }
    </style>
  </head>
  <body>
    ${content}
  </body>
</html>`;
  }

  private buildFileName(): string {
    const date = new Date();
    const stamp = [
      date.getFullYear().toString(),
      `${date.getMonth() + 1}`.padStart(2, '0'),
      `${date.getDate()}`.padStart(2, '0'),
      `${date.getHours()}`.padStart(2, '0'),
      `${date.getMinutes()}`.padStart(2, '0'),
    ].join('');

    return `document-${stamp}.html`;
  }
}
