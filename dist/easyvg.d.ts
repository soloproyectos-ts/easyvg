import { Transformation } from 'matrix2';
export declare class Element<Type extends SVGElement> {
    readonly nativeElement: Type;
    constructor(target: string | Type, attributes?: {
        [key: string]: any;
    });
    getAttr(name: string): string;
    setAttr(name: string, value: any): Element<Type>;
    append(element: Element<SVGElement>): void;
}
export declare class GraphicElement extends Element<SVGGraphicsElement> {
    readonly transformation: Transformation;
}
