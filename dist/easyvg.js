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
    var SvgElement = (function () {
        function SvgElement(target, attributes) {
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
        SvgElement.prototype.getAttr = function (name) {
            return this.nativeElement.getAttributeNS(null, name);
        };
        SvgElement.prototype.setAttr = function (name, value) {
            this.nativeElement.setAttributeNS(null, name, '' + value);
            return this;
        };
        SvgElement.prototype.append = function (element) {
            this.nativeElement.appendChild(element.nativeElement);
        };
        return SvgElement;
    }());
    exports.SvgElement = SvgElement;
    var SvgGraphicElement = (function (_super) {
        __extends(SvgGraphicElement, _super);
        function SvgGraphicElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(SvgGraphicElement.prototype, "transformation", {
            get: function () {
                var t = this.nativeElement.getCTM();
                return matrix2_1.Transformation.createFromValues(t.a, t.b, t.c, t.d, t.e, t.f);
            },
            enumerable: true,
            configurable: true
        });
        SvgGraphicElement.prototype.transform = function (t) {
            this.setAttr('transform', t.toString());
            return this;
        };
        return SvgGraphicElement;
    }(SvgElement));
    exports.SvgGraphicElement = SvgGraphicElement;
    var SvgPath = (function (_super) {
        __extends(SvgPath, _super);
        function SvgPath() {
            var _this = _super.call(this, 'path') || this;
            _this._strokeColor = 'black';
            _this._strokeWidth = 2;
            _this
                .setAttr('stroke', _this._strokeColor)
                .setAttr('stroke-width', _this._strokeWidth)
                .setAttr('fill', 'transparent');
            return _this;
        }
        SvgPath.prototype.moveTo = function (value) {
            this.setAttr('d', [this.getAttr('d') || '', "M" + value.x + " " + value.y].join(' '));
            return this;
        };
        SvgPath.prototype.lineTo = function (value) {
            this.setAttr('d', [this.getAttr('d') || '', "L" + value.x + " " + value.y].join(' '));
            return this;
        };
        return SvgPath;
    }(SvgGraphicElement));
    exports.SvgPath = SvgPath;
});
