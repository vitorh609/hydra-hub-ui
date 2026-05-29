import { Injectable } from '@angular/core';

import {
  WhiteboardDocument,
  WhiteboardElement,
  WhiteboardElementType,
  WhiteboardLineStyle,
} from './whiteboard.types';

const STORAGE_KEY = 'hydra.whiteboard.document.v1';
const SUPPORTED_TYPES = new Set<WhiteboardElementType>([
  'rectangle',
  'ellipse',
  'line',
  'arrow',
  'freehand',
  'text',
]);
const LINE_STYLES = new Set<WhiteboardLineStyle>(['solid', 'dashed', 'dotted']);

@Injectable({ providedIn: 'root' })
export class WhiteboardStateService {
  createEmptyDocument(): WhiteboardDocument {
    return {
      version: 1,
      elements: [],
      viewport: {
        x: 0,
        y: 0,
        scale: 1,
      },
    };
  }

  load(): WhiteboardDocument {
    const storage = this.getStorage();
    if (!storage) {
      return this.createEmptyDocument();
    }

    const rawDocument = storage.getItem(STORAGE_KEY);
    if (!rawDocument) {
      return this.createEmptyDocument();
    }

    try {
      const parsed = JSON.parse(rawDocument) as Partial<WhiteboardDocument>;
      return this.normalizeDocument(parsed);
    } catch {
      return this.createEmptyDocument();
    }
  }

  save(document: WhiteboardDocument): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }

    storage.setItem(STORAGE_KEY, JSON.stringify(this.normalizeDocument(document)));
  }

  private normalizeDocument(document: Partial<WhiteboardDocument>): WhiteboardDocument {
    const fallback = this.createEmptyDocument();
    const viewport = document.viewport ?? fallback.viewport;

    return {
      version: 1,
      elements: Array.isArray(document.elements)
        ? document.elements.filter((element): element is WhiteboardElement =>
            this.isWhiteboardElement(element),
          )
        : [],
      viewport: {
        x: this.finiteNumber(viewport.x, fallback.viewport.x),
        y: this.finiteNumber(viewport.y, fallback.viewport.y),
        scale: Math.min(Math.max(this.finiteNumber(viewport.scale, fallback.viewport.scale), 0.2), 3),
      },
    };
  }

  private isWhiteboardElement(element: unknown): element is WhiteboardElement {
    if (!element || typeof element !== 'object') {
      return false;
    }

    const candidate = element as Partial<WhiteboardElement>;
    return (
      typeof candidate.id === 'string' &&
      !!candidate.id &&
      typeof candidate.type === 'string' &&
      SUPPORTED_TYPES.has(candidate.type as WhiteboardElementType) &&
      typeof candidate.stroke === 'string' &&
      typeof candidate.fill === 'string' &&
      LINE_STYLES.has(candidate.lineStyle ?? 'solid') &&
      Number.isFinite(candidate.x) &&
      Number.isFinite(candidate.y)
    );
  }

  private finiteNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }

  private getStorage(): Storage | null {
    try {
      return typeof localStorage === 'undefined' ? null : localStorage;
    } catch {
      return null;
    }
  }
}
