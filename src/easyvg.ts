/// <reference path="../typings/index" />

import {Transformable} from 'matrix';
import {Point, Transformation} from 'matrix2';

export class SvgElement<Type extends SVGElement> {
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

  setAttr(name: string, value: any): SvgElement<Type> {
    this.nativeElement.setAttributeNS(null, name, '' + value);

    return this;
  }

	removeAttr(name: string): SvgElement<Type> {
		this.nativeElement.removeAttributeNS(null, name);

		return this;
	}

  append(element: SvgElement<SVGElement>): void {
    this.nativeElement.appendChild(element.nativeElement);
  }
}

export class SvgGraphicElement
	extends SvgElement<SVGGraphicsElement>
	implements Transformable {

  get transformation(): Transformation {
		let style = window.getComputedStyle(this.nativeElement, null);
		let value = style.getPropertyValue('transform');
		let matches = value.match(
			/^matrix\(([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+)\)$/
		);
		let ret = new Transformation();

		if (matches !== null) {
			let [a, b, c, d, e, f] = matches
				.filter((elem, index) => index > 0)
				.map((match) => parseFloat(match));

			ret = Transformation.createFromValues(a, b, c, d, e, f);
		}

		return ret;
  }

	set transformation(value: Transformation) {
		if (value === undefined || value === null) {
			this.removeAttr('transform');
		} else {
			this.setAttr('transform', value.toString());
		}
	}

	transform(t:Transformation): Transformable {
		this.setAttr('transform', this.transformation.transform(t).toString());

		return this;
	}
}

export class SvgPath extends SvgGraphicElement {
  private _strokeColor = 'black';
  private _strokeWidth = 2;

  constructor() {
    super('path');

    this
      .setAttr('stroke', this._strokeColor)
      .setAttr('stroke-width', this._strokeWidth)
      .setAttr('fill', 'transparent');
  }

  moveTo(value: Point): SvgPath {
    this.setAttr(
      'd', [this.getAttr('d') || '', `M${value.x} ${value.y}`].join(' ')
    );

    return this;
  }

  lineTo(value: Point): SvgPath {
    this.setAttr(
      'd', [this.getAttr('d') || '', `L${value.x} ${value.y}`].join(' ')
    );

    return this;
  }

	close(): SvgPath {
		this.setAttr(
      'd', [this.getAttr('d') || '', 'Z'].join(' ')
    );

		return this;
	}
}
