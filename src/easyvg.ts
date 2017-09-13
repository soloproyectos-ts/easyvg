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

  get ownerElement(): SvgGraphicElement {
    return new SvgGraphicElement(this.nativeElement.ownerSVGElement);
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
  private _stopDraggingEventName: string;
  private _isDraggingInit: boolean = false;
  private _isDragging: boolean = false;

  constructor(
    target: string | SVGGraphicsElement, attributes: {[key: string]: any} = {}
  ) {
    super(target, attributes);
  }

  onStartDragging(listener: (init: Point) => void): SvgGraphicElement {
    let self = this;

    if (!this._isDraggingInit) {
      this._initDragging();
    }

    this.nativeElement.addEventListener('mousedown', function (event) {
      let t = self._getClientTransformation();
      let p = new Vector(event.clientX, event.clientY).transform(t);

      listener.apply(self, [p]);
    });

    return this;
  }

  onDragging(listener: (p: Point) => void): SvgGraphicElement {
    let self = this;

    if (!this._isDraggingInit) {
      this._initDragging();
    }

    document.addEventListener('mousemove', function (event) {
      if (self._isDragging) {
        let t = self._getClientTransformation();
        let p = new Vector(event.clientX, event.clientY).transform(t);

        listener.apply(self, [p]);
      }
    });

    return this;
  }

  onStopDragging(listener: (p: Point) => void): SvgGraphicElement {
    let self = this;

    if (!this._isDraggingInit) {
      this._initDragging();
    }

    this.nativeElement.addEventListener(
        self._stopDraggingEventName,
        function (event: CustomEvent) {
          listener.apply(self, [event.detail]);
        }
    );

    return this;
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

  getBoundingBox(): {x: number, y: number, width: number, height: number} {
    let box = this.nativeElement.getBBox();

    return {x: box.x, y: box.y, width: box.width, height: box.height};
  }

  // Generates a random ID.
  //
  // Thanks to: https://stackoverflow.com/a/105074/1704895
  private _generateId(): string {
    let t = (repeat: number = 1) => {
      let ret = [];

      for (let i = 0; i < repeat; i++) {
        ret.push(Math
          .floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1));
      }

      return ret.join('');
    }

    return t(2) + '_' + t() + '_' + t() + '_' + t() + '_' + t(3);
  }

  // Initializes the dragging
  private _initDragging() {
    let self = this;

    this._stopDraggingEventName = `stopdragging_${this._generateId()}`;

    this.nativeElement.addEventListener('mousedown', function (event) {
      self._isDragging = true;
    });

    for (let eventName of ['mouseup', 'mouseleave', 'blur']) {
      document.addEventListener(eventName, function (event) {
        if (self._isDragging) {
          let t = self._getClientTransformation();
          let p = event instanceof MouseEvent
            ? new Vector(event.clientX, event.clientY).transform(t)
            : null;

          self.nativeElement.dispatchEvent(
            new CustomEvent(self._stopDraggingEventName, {detail: p})
          );
        }

        self._isDragging = false;
      });
    }

    this._isDraggingInit = true;
  }

  // Gets the center from the parent's reference system.
  private _getCenter(): Point {
    let box = this.getBoundingBox();
    let center = new Vector(box.x + box.width / 2, box.y + box.height / 2);

    return center.transform(this.transformation);
  }

  private _getClientTransformation(): Transformation {
    let canvas = this.ownerElement;
    let ctm = canvas.nativeElement.getScreenCTM();

    return Transformation.createFromValues(
      ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f
    ).inverse();
  }
}
