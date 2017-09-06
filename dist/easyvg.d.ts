import { Transformable } from 'matrix';
import { Point, Vector, Transformation } from 'matrix2';
export declare class SvgElement<Type extends SVGElement> {
    readonly nativeElement: Type;
    constructor(target: string | Type, attributes?: {
        [key: string]: any;
    });
    readonly ownerElement: SvgGraphicElement;
    getAttr(name: string): string;
    setAttr(name: string, value: any): SvgElement<Type>;
    removeAttr(name: string): SvgElement<Type>;
    append(element: SvgElement<SVGElement>): void;
}
export declare class SvgGraphicElement extends SvgElement<SVGGraphicsElement> implements Transformable {
    private _isDraggingInit;
    private _isDragging;
    constructor(target: string | SVGGraphicsElement, attributes?: {
        [key: string]: any;
    });
    private _initDragging();
    onStartDragging(listener: (init: Point) => void): SvgGraphicElement;
    onDragging(listener: (p: Point) => void): SvgGraphicElement;
    onStopDragging(listener: (p: Point) => void): SvgGraphicElement;
    transformation: Transformation;
    transform(t: Transformation): SvgGraphicElement;
    translate(value: Vector): SvgGraphicElement;
    rotate(angle: number, params?: {
        center: boolean;
    }): SvgGraphicElement;
    scale(value: number | Vector, params?: {
        center: boolean;
    }): SvgGraphicElement;
    skew(value: number | Vector, params?: {
        center: boolean;
    }): SvgGraphicElement;
    getBoundingBox(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    private _getCenter();
    private _getClientTransformation();
}
