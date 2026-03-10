import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-document-preview-card',
  standalone: true,
  templateUrl: './document-preview-card.component.html',
  styleUrl: './document-preview-card.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DocumentPreviewCardComponent implements OnChanges {
  @Input({ required: true }) html = '';
  @Input() title?: string;

  sanitizedHtml = '';

  ngOnChanges(): void {
    this.sanitizedHtml = this.sanitizeHtml(this.html);
  }

  private sanitizeHtml(content: string): string {
    const parser = new DOMParser();
    const documentNode = parser.parseFromString(content, 'text/html');

    const blockedTags = ['script', 'iframe', 'object', 'embed', 'link', 'meta'];

    for (const tag of blockedTags) {
      documentNode.querySelectorAll(tag).forEach((element) => element.remove());
    }

    documentNode.querySelectorAll<HTMLElement>('*').forEach((element) => {
      this.normalizeAlignment(element);

      for (const attribute of [...element.attributes]) {
        const name = attribute.name.toLowerCase();
        const value = attribute.value.trim().toLowerCase();

        if (name.startsWith('on')) {
          element.removeAttribute(attribute.name);
          continue;
        }

        const isUrlAttribute = name === 'href' || name === 'src';
        if (isUrlAttribute && value.startsWith('javascript:')) {
          element.removeAttribute(attribute.name);
        }
      }
    });

    return documentNode.body.innerHTML;
  }

  private normalizeAlignment(element: HTMLElement): void {
    const alignAttribute = element.getAttribute('align')?.toLowerCase().trim();
    const styleAlign = element.style.textAlign.toLowerCase().trim();
    const align = alignAttribute || styleAlign;

    element.classList.remove(
      'doc-align-left',
      'doc-align-center',
      'doc-align-right',
      'doc-align-justify',
    );

    if (align === 'left' || align === 'center' || align === 'right' || align === 'justify') {
      element.classList.add(`doc-align-${align}`);
    }

    if (alignAttribute) {
      element.removeAttribute('align');
    }

    if (styleAlign) {
      element.style.removeProperty('text-align');
      if (!element.getAttribute('style')?.trim()) {
        element.removeAttribute('style');
      }
    }
  }
}
