import { Transformable } from 'matrix';
import { Point, Transformation } from 'matrix2';
export declare class SvgElement<Type extends SVGElement> {
    readonly nativeElement: Type;
    constructor(target: string | Type, attributes?: {
        [key: string]: any;
    });
    getAttr(name: string): string;
    setAttr(name: string, value: any): SvgElement<Type>;
    append(element: SvgElement<SVGElement>): void;
}
export declare class SvgGraphicElement extends SvgElement<SVGGraphicsElement> implements Transformable {
    readonly transformation: Transformation;
    transform(t: Transformation): Transformable;
}
export declare class SvgPath extends SvgGraphicElement {
    private _strokeColor;
    private _strokeWidth;
    constructor();
    moveTo(value: Point): SvgPath;
    lineTo(value: Point): SvgPath;
}
