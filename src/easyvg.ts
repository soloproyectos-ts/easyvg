/// <reference path="../typings/index" />

import {Point, Transformation} from 'matrix2';

export class Element<Type extends SVGElement> {
	readonly nativeElement: Type;

  constructor (
		target: string | Type, attributes: {[key: string]: any} = {}
	) {
    if ( typeof target == 'string' ) {
      this.nativeElement = <Type> document.createElementNS(
        'http://www.w3.org/2000/svg', target
      );
    } else {
      this.nativeElement = target;
    }

    for (let key in attributes) {
      this.setAttr(key, attributes[key]);
    }
  }

  getAttr(name: string): string {
    return this.nativeElement.getAttributeNS(null, name);
  }

  setAttr(name: string, value: any): Element<Type> {
    this.nativeElement.setAttributeNS(null, name, '' + value);

    return this;
  }

  append(element: Element<SVGElement>): void {
    this.nativeElement.appendChild(element.nativeElement);
  }
}

export class GraphicElement extends Element<SVGGraphicsElement> {

  get transformation(): Transformation {
    let t = this.nativeElement.getCTM();

    return Transformation.createFromValues(t.a, t.b, t.c, t.d, t.e, t.f);
  }
}

export class Path extends GraphicElement {
  private _strokeColor = 'black';
  private _strokeWidth = 2;

  constructor() {
    super('path');

    this
      .setAttr('stroke', this._strokeColor)
      .setAttr('stroke-width', this._strokeWidth)
      .setAttr('fill', 'transparent');
  }

  moveTo(value: Point): Path {
    this.setAttr(
      'd', [this.getAttr('d') || '', `M${value.x} ${value.y}`].join(' ')
    );

    return this;
  }

  lineTo(value: Point): Path {
    this.setAttr(
      'd', [this.getAttr('d') || '', `L${value.x} ${value.y}`].join(' ')
    );

    return this;
  }
}
