/// <reference path="../typings/index" />

import {Transformable} from 'matrix';
import {Point, Vector, Transformation} from 'matrix2';

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
	private _isDragging: boolean;

	constructor(
		target: string | SVGGraphicsElement, attributes: {[key: string]: any} = {}
	) {
		super(target, attributes);

		// initializes the dragging
    let self = this;

    this.nativeElement.addEventListener('mousedown', function (event) {
			self._isDragging = true;
    });

    for (let eventName of ['mouseup', 'mouseleave', 'blur']) {
      document.addEventListener(eventName, function (event) {
				self._isDragging = false;
      });
    }
	}

	// TODO: create a separate package for dragging capabilities
	onStartDragging(listener: (init: Point) => void) {
    let self = this;

    this.nativeElement.addEventListener('mousedown', function (event) {
			let t = self._getClientTransformation();
			let p = new Vector(event.clientX, event.clientY).transform(t);

      listener.apply(self, [p]);
    });
  }

	// TODO: onStopDragging is missing
  onDragging(listener: (p: Point) => void) {
    let self = this;

    document.addEventListener('mousemove', function (event) {
      if (self._isDragging) {
				let t = self._getClientTransformation();
        let p = new Vector(event.clientX, event.clientY).transform(t);

        listener.apply(self, [p]);
      }
    });
  }

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

	transform(t:Transformation): SvgGraphicElement {
		this.setAttr('transform', this.transformation.transform(t).toString());

		return this;
	}

	translate(value: Vector): SvgGraphicElement {
		this.transform(new Transformation().translate(value));

		return this;
	}

	rotate(angle: number, params?: {center: boolean}): SvgGraphicElement {
		let center = params !== undefined && params.center
			? this._getCenter()
			: new Vector(0, 0);

		return this.transform(
			new Transformation().rotate(angle, {center: center})
		);
	}

	scale(value: number|Vector, params?: {center: boolean}): SvgGraphicElement {
		let center = params !== undefined && params.center
			? this._getCenter()
			: new Vector(0, 0);

		return this.transform(
			new Transformation().scale(value, {center: center})
		);
	}

	skew(value: number|Vector, params?: {center: boolean}): SvgGraphicElement {
		let center = params !== undefined && params.center
			? this._getCenter()
			: new Vector(0, 0);

		return this.transform(
			new Transformation().skew(value, {center: center})
		);
	}

	// Gets the center from the parent's reference system.
	private _getCenter(): Point {
		let box = this.nativeElement.getBBox();
		let center = new Vector(box.x + box.width / 2, box.y + box.height / 2);

		return center.transform(this.transformation);
	}

	private _getClientTransformation(): Transformation {
		let canvas = this.nativeElement.ownerSVGElement;
		let ctm = canvas.getScreenCTM();

    return Transformation.createFromValues(
      ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f
    ).inverse();
	}
}

// TODO: move this class to the transformer package
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
