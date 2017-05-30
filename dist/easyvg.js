var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "matrix2"], function (require, exports, matrix2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Element = (function () {
        function Element(target, attributes) {
            if (attributes === void 0) { attributes = {}; }
            if (typeof target == 'string') {
                this.nativeElement = document.createElementNS('http://www.w3.org/2000/svg', target);
            }
            else {
                this.nativeElement = target;
            }
            for (var key in attributes) {
                this.setAttr(key, attributes[key]);
            }
        }
        Element.prototype.getAttr = function (name) {
            return this.nativeElement.getAttributeNS(null, name);
        };
        Element.prototype.setAttr = function (name, value) {
            this.nativeElement.setAttributeNS(null, name, '' + value);
            return this;
        };
        Element.prototype.append = function (element) {
            this.nativeElement.appendChild(element.nativeElement);
        };
        return Element;
    }());
    exports.Element = Element;
    var GraphicElement = (function (_super) {
        __extends(GraphicElement, _super);
        function GraphicElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(GraphicElement.prototype, "transformation", {
            get: function () {
                var t = this.nativeElement.getCTM();
                return matrix2_1.Transformation.createFromValues(t.a, t.b, t.c, t.d, t.e, t.f);
            },
            enumerable: true,
            configurable: true
        });
        return GraphicElement;
    }(Element));
    exports.GraphicElement = GraphicElement;
    var Path = (function (_super) {
        __extends(Path, _super);
        function Path() {
            var _this = _super.call(this, 'path') || this;
            _this._strokeColor = 'black';
            _this._strokeWidth = 2;
            _this
                .setAttr('stroke', _this._strokeColor)
                .setAttr('stroke-width', _this._strokeWidth)
                .setAttr('fill', 'transparent');
            return _this;
        }
        Path.prototype.moveTo = function (value) {
            this.setAttr('d', [this.getAttr('d') || '', "M" + value.x + " " + value.y].join(' '));
            return this;
        };
        Path.prototype.lineTo = function (value) {
            this.setAttr('d', [this.getAttr('d') || '', "L" + value.x + " " + value.y].join(' '));
            return this;
        };
        return Path;
    }(GraphicElement));
});
