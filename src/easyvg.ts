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
	private _initPoint: Point;

	constructor(
		target: string | SVGGraphicsElement, attributes: {[key: string]: any} = {}
	) {
		super(target, attributes);

		// initializes the dragging
    let self = this;
    this.nativeElement.addEventListener('mousedown', function (event) {
      self._initPoint = new Vector(event.offsetX, event.offsetY);
    });
    for (let eventName of ['mouseup', 'mouseleave', 'blur']) {
      document.addEventListener(eventName, function (event) {
        self._initPoint = null;
      });
    }
	}

	// TODO: create a separate package for dragging capabilities
	onStartDragging(listener: (init: Point) => void) {
    let self = this;

    this.nativeElement.addEventListener('mousedown', function (event) {
      listener.apply(self, [new Vector(event.offsetX, event.offsetY)]);
    });
  }

	// TODO: onStopDragging is missing
  onDragging(listener: (init: Point, final: Point) => void) {
    let self = this;

    document.addEventListener('mousemove', function (event) {
      if (self._initPoint != null) {
        let finalPoint = new Vector(event.offsetX, event.offsetY);

        listener.apply(self, [self._initPoint, finalPoint]);
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

	rotate(angle: number, params?: {center: boolean|Point}): SvgGraphicElement {
		if (params !== undefined) {
			let center = params.center instanceof Vector
				? params.center
				: this._getCenter();

			return this
				.translate(center.opposite())
				.rotate(angle)
				.translate(center);
		}

		return this.transform(new Transformation().rotate(angle));
	}

	scale(value: number|Vector): SvgGraphicElement {
		return this.transform(new Transformation().scale(value));
	}

	skew(value: number|Vector): SvgGraphicElement {
		return this.transform(new Transformation().skew(value));
	}

	// Gets the center from the canvas reference system.
	private _getCenter(): Point {
		let box = this.nativeElement.getBBox();
		let center = new Vector(box.x + box.width / 2, box.y + box.height / 2);

		return center.transform(this.transformation);
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
