import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import Konva from 'konva';

import { IconComponent, AppIconName } from '../../../../core/ui/icon/icon.component';
import { WhiteboardStateService } from './whiteboard-state.service';
import {
  WhiteboardDocument,
  WhiteboardDraft,
  WhiteboardElement,
  WhiteboardLineStyle,
  WhiteboardStyle,
  WhiteboardTool,
} from './whiteboard.types';

interface ToolbarButton {
  tool: WhiteboardTool;
  icon: AppIconName;
  label: string;
}

interface TextEditorState {
  boardX: number;
  boardY: number;
  screenX: number;
  screenY: number;
  value: string;
}

const DEFAULT_STYLE: WhiteboardStyle = {
  stroke: '#1f2937',
  fill: '#ffffff',
  strokeWidth: 3,
  lineStyle: 'solid',
  opacity: 1,
  fontSize: 20,
};

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;
const ZOOM_STEP = 1.12;

@Component({
  selector: 'app-whiteboard',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './whiteboard.component.html',
  styleUrl: './whiteboard.component.scss',
})
export class WhiteboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('stageHost', { static: true }) private readonly stageHost!: ElementRef<HTMLDivElement>;
  @ViewChild('textEditor') private readonly textEditor?: ElementRef<HTMLTextAreaElement>;

  private readonly stateService = inject(WhiteboardStateService);
  private readonly document = signal<WhiteboardDocument>(this.stateService.load());
  private readonly elementNodes = new Map<string, Konva.Shape>();
  private readonly resizeObserver = new ResizeObserver(() => this.resizeStage());
  private readonly history = signal<WhiteboardDocument[]>([]);
  private readonly future = signal<WhiteboardDocument[]>([]);

  private stage?: Konva.Stage;
  private contentLayer?: Konva.Layer;
  private transformer?: Konva.Transformer;
  private draft?: WhiteboardDraft;
  private isPointerDown = false;
  private isPanning = false;
  private lastPanPoint?: { x: number; y: number };
  private suppressSave = false;

  readonly activeTool = signal<WhiteboardTool>('select');
  readonly selectedElementId = signal<string | null>(null);
  readonly currentStyle = signal<WhiteboardStyle>({ ...DEFAULT_STYLE });
  readonly textEditorState = signal<TextEditorState | null>(null);
  readonly zoomPercent = computed(() => Math.round(this.document().viewport.scale * 100));
  readonly canUndo = computed(() => this.history().length > 0);
  readonly canRedo = computed(() => this.future().length > 0);
  readonly selectedElement = computed(() => {
    const selectedId = this.selectedElementId();
    return this.document().elements.find((element) => element.id === selectedId) ?? null;
  });

  readonly tools: ToolbarButton[] = [
    { tool: 'select', icon: 'select', label: 'Selecionar' },
    { tool: 'pan', icon: 'hand-stop', label: 'Mover tela' },
    { tool: 'rectangle', icon: 'rectangle', label: 'Retangulo' },
    { tool: 'ellipse', icon: 'circle', label: 'Elipse' },
    { tool: 'line', icon: 'line', label: 'Linha' },
    { tool: 'arrow', icon: 'arrow-right', label: 'Seta' },
    { tool: 'freehand', icon: 'pencil', label: 'Desenho livre' },
    { tool: 'text', icon: 'cursor-text', label: 'Texto' },
    { tool: 'eraser', icon: 'eraser', label: 'Borracha' },
  ];

  readonly lineStyles: { value: WhiteboardLineStyle; label: string }[] = [
    { value: 'solid', label: 'Solida' },
    { value: 'dashed', label: 'Tracejada' },
    { value: 'dotted', label: 'Pontilhada' },
  ];

  ngAfterViewInit(): void {
    this.createStage();
    this.renderDocument();
    this.resizeObserver.observe(this.stageHost.nativeElement);
    this.pushViewportToStage();
  }

  ngOnDestroy(): void {
    this.resizeObserver.disconnect();
    this.stage?.destroy();
  }

  setTool(tool: WhiteboardTool): void {
    this.activeTool.set(tool);
    this.commitTextEditor();
    this.stageHost.nativeElement.dataset['tool'] = tool;

    if (tool !== 'select') {
      this.clearSelection();
    }
  }

  updateStroke(stroke: string): void {
    this.updateStyle({ stroke });
  }

  updateFill(fill: string): void {
    this.updateStyle({ fill });
  }

  updateStrokeWidth(strokeWidth: number | string): void {
    this.updateStyle({ strokeWidth: this.clampNumber(strokeWidth, 1, 20, DEFAULT_STYLE.strokeWidth) });
  }

  updateLineStyle(lineStyle: WhiteboardLineStyle): void {
    this.updateStyle({ lineStyle });
  }

  updateOpacity(opacity: number | string): void {
    this.updateStyle({ opacity: this.clampNumber(opacity, 0.1, 1, DEFAULT_STYLE.opacity) });
  }

  updateFontSize(fontSize: number | string): void {
    this.updateStyle({ fontSize: this.clampNumber(fontSize, 10, 96, DEFAULT_STYLE.fontSize) });
  }

  undo(): void {
    const previous = this.history().at(-1);
    if (!previous) {
      return;
    }

    this.future.update((future) => [this.cloneDocument(this.document()), ...future]);
    this.history.update((history) => history.slice(0, -1));
    this.replaceDocument(previous);
  }

  redo(): void {
    const next = this.future()[0];
    if (!next) {
      return;
    }

    this.history.update((history) => [...history, this.cloneDocument(this.document())]);
    this.future.update((future) => future.slice(1));
    this.replaceDocument(next);
  }

  zoomIn(): void {
    this.zoomAtCenter(ZOOM_STEP);
  }

  zoomOut(): void {
    this.zoomAtCenter(1 / ZOOM_STEP);
  }

  exportPng(): void {
    const stage = this.stage;
    if (!stage) {
      return;
    }

    this.clearSelection();
    const dataUrl = stage.toDataURL({ pixelRatio: 2, mimeType: 'image/png' });
    const link = document.createElement('a');
    link.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataUrl;
    link.click();
  }

  commitTextEditor(): void {
    const editor = this.textEditorState();
    if (!editor) {
      return;
    }

    const text = editor.value.trim();
    this.textEditorState.set(null);

    if (!text) {
      return;
    }

    this.recordHistory();
    const style = this.currentStyle();
    this.upsertElement({
      ...style,
      id: this.createId(),
      type: 'text',
      x: editor.boardX,
      y: editor.boardY,
      text,
      width: Math.max(180, text.length * style.fontSize * 0.55),
    });
    this.activeTool.set('select');
  }

  cancelTextEditor(): void {
    this.textEditorState.set(null);
  }

  updateTextEditorValue(value: string): void {
    const editor = this.textEditorState();
    if (!editor) {
      return;
    }

    this.textEditorState.set({ ...editor, value });
  }

  private createStage(): void {
    const host = this.stageHost.nativeElement;
    this.stage = new Konva.Stage({
      container: host,
      width: host.clientWidth,
      height: host.clientHeight,
    });
    this.contentLayer = new Konva.Layer();
    this.transformer = new Konva.Transformer({
      rotateEnabled: false,
      borderStroke: '#5d87ff',
      anchorStroke: '#5d87ff',
      anchorFill: '#ffffff',
      anchorSize: 9,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    });

    this.contentLayer.add(this.transformer);
    this.stage.add(this.contentLayer);

    this.stage.on('mousedown touchstart', (event) => this.handlePointerDown(event));
    this.stage.on('mousemove touchmove', () => this.handlePointerMove());
    this.stage.on('mouseup touchend', () => this.handlePointerUp());
    this.stage.on('wheel', (event) => this.handleWheel(event));
  }

  private handlePointerDown(event: Konva.KonvaEventObject<MouseEvent | TouchEvent>): void {
    const stage = this.stage;
    if (!stage) {
      return;
    }

    this.commitTextEditor();
    const tool = this.activeTool();
    const pointer = this.getBoardPointer();
    if (!pointer) {
      return;
    }

    const targetNode = event.target;
    const targetId = targetNode.id();
    const clickedElement = !!targetId && this.elementNodes.has(targetId);

    if (tool === 'eraser' && clickedElement) {
      this.deleteElement(targetId);
      return;
    }

    if (tool === 'select') {
      if (clickedElement) {
        this.selectElement(targetId);
      } else {
        this.clearSelection();
      }
      return;
    }

    if (tool === 'pan') {
      this.isPanning = true;
      this.lastPanPoint = stage.getPointerPosition() ?? undefined;
      return;
    }

    if (tool === 'text') {
      this.openTextEditor(pointer.x, pointer.y);
      return;
    }

    if (tool === 'eraser') {
      return;
    }

    this.recordHistory();
    this.isPointerDown = true;
    const id = this.createId();
    this.draft = {
      id,
      tool,
      startX: pointer.x,
      startY: pointer.y,
    };

    this.upsertElement(this.createElement(id, tool, pointer.x, pointer.y));
  }

  private handlePointerMove(): void {
    if (this.isPanning) {
      this.panStage();
      return;
    }

    if (!this.isPointerDown || !this.draft) {
      return;
    }

    const pointer = this.getBoardPointer();
    if (!pointer) {
      return;
    }

    this.updateDraft(this.draft, pointer.x, pointer.y);
  }

  private handlePointerUp(): void {
    if (this.isPanning) {
      this.isPanning = false;
      this.lastPanPoint = undefined;
      this.persistViewport();
      return;
    }

    if (!this.isPointerDown || !this.draft) {
      return;
    }

    const draftId = this.draft.id;
    this.isPointerDown = false;
    this.draft = undefined;

    const created = this.document().elements.find((element) => element.id === draftId);
    if (created && this.isEmptyElement(created)) {
      this.removeElement(draftId, false);
    } else {
      this.selectedElementId.set(draftId);
      this.attachTransformer();
      this.saveDocument();
    }
  }

  private handleWheel(event: Konva.KonvaEventObject<WheelEvent>): void {
    event.evt.preventDefault();
    const direction = event.evt.deltaY > 0 ? 1 / ZOOM_STEP : ZOOM_STEP;
    this.zoomAtPoint(direction, this.stage?.getPointerPosition() ?? null);
  }

  private createElement(
    id: string,
    tool: WhiteboardDraft['tool'],
    x: number,
    y: number,
  ): WhiteboardElement {
    const style = this.currentStyle();

    if (tool === 'rectangle') {
      return { ...style, id, type: 'rectangle', x, y, width: 1, height: 1 };
    }

    if (tool === 'ellipse') {
      return { ...style, id, type: 'ellipse', x, y, radiusX: 1, radiusY: 1 };
    }

    return { ...style, id, type: tool, x: 0, y: 0, points: [x, y, x, y] };
  }

  private updateDraft(draft: WhiteboardDraft, x: number, y: number): void {
    const elements = this.document().elements.map((element) => {
      if (element.id !== draft.id) {
        return element;
      }

      if (element.type === 'rectangle') {
        return {
          ...element,
          x: Math.min(draft.startX, x),
          y: Math.min(draft.startY, y),
          width: Math.abs(x - draft.startX),
          height: Math.abs(y - draft.startY),
        };
      }

      if (element.type === 'ellipse') {
        return {
          ...element,
          x: (draft.startX + x) / 2,
          y: (draft.startY + y) / 2,
          radiusX: Math.abs(x - draft.startX) / 2,
          radiusY: Math.abs(y - draft.startY) / 2,
        };
      }

      if (element.type === 'freehand') {
        return {
          ...element,
          points: [...element.points, x, y],
        };
      }

      return {
        ...element,
        points: [draft.startX, draft.startY, x, y],
      };
    });

    this.document.update((document) => ({ ...document, elements }));
    this.renderDocument();
  }

  private renderDocument(): void {
    const layer = this.contentLayer;
    if (!layer) {
      return;
    }

    this.elementNodes.forEach((node) => node.destroy());
    this.elementNodes.clear();

    for (const element of this.document().elements) {
      const node = this.renderElement(element);
      node.id(element.id);
      node.draggable(true);
      node.on('click tap', () => this.handleElementClick(element.id));
      node.on('dragstart transformstart', () => this.recordHistory());
      node.on('dragend', () => this.updateElementFromNode(element.id));
      node.on('transformend', () => this.updateElementFromNode(element.id));
      this.elementNodes.set(element.id, node);
      layer.add(node);
    }

    this.transformer?.moveToTop();
    this.attachTransformer();
    layer.batchDraw();
  }

  private renderElement(element: WhiteboardElement): Konva.Shape {
    const baseConfig = {
      x: element.x,
      y: element.y,
      stroke: element.stroke,
      fill: element.fill === 'transparent' ? undefined : element.fill,
      strokeWidth: element.strokeWidth,
      opacity: element.opacity,
      dash: this.getDash(element.lineStyle, element.strokeWidth),
      lineCap: 'round' as const,
      lineJoin: 'round' as const,
    };

    if (element.type === 'rectangle') {
      return new Konva.Rect({
        ...baseConfig,
        width: element.width,
        height: element.height,
      });
    }

    if (element.type === 'ellipse') {
      return new Konva.Ellipse({
        ...baseConfig,
        radiusX: element.radiusX,
        radiusY: element.radiusY,
      });
    }

    if (element.type === 'arrow') {
      return new Konva.Arrow({
        ...baseConfig,
        fill: element.stroke,
        points: element.points,
        pointerLength: 12,
        pointerWidth: 12,
      });
    }

    if (element.type === 'text') {
      return new Konva.Text({
        x: element.x,
        y: element.y,
        text: element.text,
        width: element.width,
        fontSize: element.fontSize,
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        fill: element.stroke,
        opacity: element.opacity,
        padding: 2,
      });
    }

    return new Konva.Line({
      ...baseConfig,
      points: element.points,
      tension: element.type === 'freehand' ? 0.35 : 0,
    });
  }

  private handleElementClick(id: string): void {
    if (this.activeTool() === 'eraser') {
      this.deleteElement(id);
      return;
    }

    if (this.activeTool() === 'select') {
      this.selectElement(id);
    }
  }

  private selectElement(id: string): void {
    const element = this.document().elements.find((item) => item.id === id);
    if (!element) {
      this.clearSelection();
      return;
    }

    this.selectedElementId.set(id);
    this.currentStyle.set({
      stroke: element.stroke,
      fill: element.fill,
      strokeWidth: element.strokeWidth,
      lineStyle: element.lineStyle,
      opacity: element.opacity,
      fontSize: element.fontSize,
    });
    this.attachTransformer();
  }

  private clearSelection(): void {
    this.selectedElementId.set(null);
    this.transformer?.nodes([]);
    this.contentLayer?.batchDraw();
  }

  private attachTransformer(): void {
    const selectedId = this.selectedElementId();
    const node = selectedId ? this.elementNodes.get(selectedId) : undefined;
    const selectedElement = selectedId
      ? this.document().elements.find((element) => element.id === selectedId)
      : null;

    if (!node || !selectedElement || selectedElement.type === 'freehand') {
      this.transformer?.nodes([]);
      return;
    }

    this.transformer?.nodes([node]);
  }

  private updateElementFromNode(id: string): void {
    const node = this.elementNodes.get(id);
    if (!node) {
      return;
    }

    this.document.update((document) => ({
      ...document,
      elements: document.elements.map((element) => this.mapElementFromNode(element, node, id)),
    }));
    this.saveDocument();
    this.renderDocument();
  }

  private mapElementFromNode(
    element: WhiteboardElement,
    node: Konva.Shape,
    id: string,
  ): WhiteboardElement {
    if (element.id !== id) {
      return element;
    }

    if (element.type === 'rectangle' && node instanceof Konva.Rect) {
      const width = Math.max(1, node.width() * node.scaleX());
      const height = Math.max(1, node.height() * node.scaleY());
      return { ...element, x: node.x(), y: node.y(), width, height };
    }

    if (element.type === 'ellipse' && node instanceof Konva.Ellipse) {
      const radiusX = Math.max(1, element.radiusX * node.scaleX());
      const radiusY = Math.max(1, element.radiusY * node.scaleY());
      return { ...element, x: node.x(), y: node.y(), radiusX, radiusY };
    }

    if (element.type === 'text' && node instanceof Konva.Text) {
      return {
        ...element,
        x: node.x(),
        y: node.y(),
        width: Math.max(80, node.width() * node.scaleX()),
      };
    }

    if ('points' in element && node instanceof Konva.Line) {
      const dx = node.x();
      const dy = node.y();
      return {
        ...element,
        x: 0,
        y: 0,
        points: element.points.map((point, index) => point + (index % 2 === 0 ? dx : dy)),
      };
    }

    return { ...element, x: node.x(), y: node.y() };
  }

  private updateStyle(style: Partial<WhiteboardStyle>): void {
    const nextStyle = { ...this.currentStyle(), ...style };
    this.currentStyle.set(nextStyle);

    const selectedId = this.selectedElementId();
    if (!selectedId) {
      return;
    }

    this.recordHistory();
    this.document.update((document) => ({
      ...document,
      elements: document.elements.map((element) =>
        element.id === selectedId ? { ...element, ...nextStyle } : element,
      ),
    }));
    this.saveDocument();
    this.renderDocument();
  }

  private openTextEditor(boardX: number, boardY: number): void {
    const screenPoint = this.boardToScreen(boardX, boardY);
    this.textEditorState.set({
      boardX,
      boardY,
      screenX: screenPoint.x,
      screenY: screenPoint.y,
      value: '',
    });

    window.setTimeout(() => this.textEditor?.nativeElement.focus());
  }

  private upsertElement(element: WhiteboardElement): void {
    this.document.update((document) => {
      const index = document.elements.findIndex((item) => item.id === element.id);
      const elements =
        index >= 0
          ? document.elements.map((item) => (item.id === element.id ? element : item))
          : [...document.elements, element];
      return { ...document, elements };
    });
    this.renderDocument();
  }

  private deleteElement(id: string): void {
    this.recordHistory();
    this.removeElement(id, true);
  }

  private removeElement(id: string, shouldSave: boolean): void {
    this.document.update((document) => ({
      ...document,
      elements: document.elements.filter((element) => element.id !== id),
    }));

    if (this.selectedElementId() === id) {
      this.selectedElementId.set(null);
    }

    if (shouldSave) {
      this.saveDocument();
    }

    this.renderDocument();
  }

  private panStage(): void {
    const stage = this.stage;
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer || !this.lastPanPoint) {
      return;
    }

    const dx = pointer.x - this.lastPanPoint.x;
    const dy = pointer.y - this.lastPanPoint.y;
    this.lastPanPoint = pointer;
    this.setViewport({
      ...this.document().viewport,
      x: this.document().viewport.x + dx,
      y: this.document().viewport.y + dy,
    });
  }

  private zoomAtCenter(factor: number): void {
    const stage = this.stage;
    if (!stage) {
      return;
    }

    this.zoomAtPoint(factor, {
      x: stage.width() / 2,
      y: stage.height() / 2,
    });
  }

  private zoomAtPoint(factor: number, point: { x: number; y: number } | null): void {
    if (!point) {
      return;
    }

    const viewport = this.document().viewport;
    const oldScale = viewport.scale;
    const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldScale * factor));
    const boardPoint = {
      x: (point.x - viewport.x) / oldScale,
      y: (point.y - viewport.y) / oldScale,
    };

    this.setViewport({
      scale: newScale,
      x: point.x - boardPoint.x * newScale,
      y: point.y - boardPoint.y * newScale,
    });
    this.persistViewport();
  }

  private setViewport(viewport: WhiteboardDocument['viewport']): void {
    this.document.update((document) => ({ ...document, viewport }));
    this.pushViewportToStage();
  }

  private persistViewport(): void {
    this.saveDocument();
  }

  private pushViewportToStage(): void {
    const stage = this.stage;
    if (!stage) {
      return;
    }

    const viewport = this.document().viewport;
    stage.position({ x: viewport.x, y: viewport.y });
    stage.scale({ x: viewport.scale, y: viewport.scale });
    this.updateGrid();
    stage.batchDraw();
  }

  private getBoardPointer(): { x: number; y: number } | null {
    const stage = this.stage;
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) {
      return null;
    }

    const viewport = this.document().viewport;
    return {
      x: (pointer.x - viewport.x) / viewport.scale,
      y: (pointer.y - viewport.y) / viewport.scale,
    };
  }

  private boardToScreen(x: number, y: number): { x: number; y: number } {
    const viewport = this.document().viewport;
    return {
      x: x * viewport.scale + viewport.x,
      y: y * viewport.scale + viewport.y,
    };
  }

  private resizeStage(): void {
    const host = this.stageHost.nativeElement;
    this.stage?.size({
      width: host.clientWidth,
      height: host.clientHeight,
    });
    this.updateGrid();
    this.stage?.batchDraw();
  }

  private updateGrid(): void {
    const viewport = this.document().viewport;
    const gridSize = 32 * viewport.scale;
    this.stageHost.nativeElement.style.setProperty('--grid-size', `${gridSize}px`);
    this.stageHost.nativeElement.style.setProperty('--grid-x', `${viewport.x % gridSize}px`);
    this.stageHost.nativeElement.style.setProperty('--grid-y', `${viewport.y % gridSize}px`);
  }

  private replaceDocument(document: WhiteboardDocument): void {
    this.suppressSave = true;
    this.document.set(this.cloneDocument(document));
    this.suppressSave = false;
    this.saveDocument();
    this.pushViewportToStage();
    this.clearSelection();
    this.renderDocument();
  }

  private recordHistory(): void {
    this.history.update((history) => [...history.slice(-39), this.cloneDocument(this.document())]);
    this.future.set([]);
  }

  private saveDocument(): void {
    if (this.suppressSave) {
      return;
    }

    this.stateService.save(this.document());
  }

  private cloneDocument(document: WhiteboardDocument): WhiteboardDocument {
    return JSON.parse(JSON.stringify(document)) as WhiteboardDocument;
  }

  private createId(): string {
    return crypto.randomUUID();
  }

  private getDash(lineStyle: WhiteboardLineStyle, strokeWidth: number): number[] {
    if (lineStyle === 'dashed') {
      return [strokeWidth * 4, strokeWidth * 3];
    }

    if (lineStyle === 'dotted') {
      return [strokeWidth, strokeWidth * 2.4];
    }

    return [];
  }

  private isEmptyElement(element: WhiteboardElement): boolean {
    if (element.type === 'rectangle') {
      return element.width < 4 || element.height < 4;
    }

    if (element.type === 'ellipse') {
      return element.radiusX < 2 || element.radiusY < 2;
    }

    if ('points' in element) {
      return element.points.length < 4 || this.distance(element.points) < 4;
    }

    return false;
  }

  private distance(points: number[]): number {
    const firstX = points[0] ?? 0;
    const firstY = points[1] ?? 0;
    const lastX = points.at(-2) ?? firstX;
    const lastY = points.at(-1) ?? firstY;
    return Math.hypot(lastX - firstX, lastY - firstY);
  }

  private clampNumber(value: number | string, min: number, max: number, fallback: number): number {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric)) {
      return fallback;
    }

    return Math.min(max, Math.max(min, numeric));
  }
}
