export type WhiteboardTool =
  | 'select'
  | 'pan'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'freehand'
  | 'text'
  | 'eraser';

export type WhiteboardElementType = 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'freehand' | 'text';

export type WhiteboardLineStyle = 'solid' | 'dashed' | 'dotted';

export interface WhiteboardStyle {
  stroke: string;
  fill: string;
  strokeWidth: number;
  lineStyle: WhiteboardLineStyle;
  opacity: number;
  fontSize: number;
}

export interface WhiteboardElementBase extends WhiteboardStyle {
  id: string;
  type: WhiteboardElementType;
  x: number;
  y: number;
}

export interface WhiteboardRectangleElement extends WhiteboardElementBase {
  type: 'rectangle';
  width: number;
  height: number;
}

export interface WhiteboardEllipseElement extends WhiteboardElementBase {
  type: 'ellipse';
  radiusX: number;
  radiusY: number;
}

export interface WhiteboardLineElement extends WhiteboardElementBase {
  type: 'line' | 'arrow' | 'freehand';
  points: number[];
}

export interface WhiteboardTextElement extends WhiteboardElementBase {
  type: 'text';
  text: string;
  width: number;
}

export type WhiteboardElement =
  | WhiteboardRectangleElement
  | WhiteboardEllipseElement
  | WhiteboardLineElement
  | WhiteboardTextElement;

export interface WhiteboardViewport {
  x: number;
  y: number;
  scale: number;
}

export interface WhiteboardDocument {
  version: 1;
  elements: WhiteboardElement[];
  viewport: WhiteboardViewport;
}

export interface WhiteboardDraft {
  id: string;
  tool: Exclude<WhiteboardTool, 'select' | 'pan' | 'text' | 'eraser'>;
  startX: number;
  startY: number;
}
