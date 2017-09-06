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
        Object.defineProperty(SvgElement.prototype, "ownerElement", {
            get: function () {
                return new SvgGraphicElement(this.nativeElement.ownerSVGElement);
            },
            enumerable: true,
            configurable: true
        });
        SvgElement.prototype.getAttr = function (name) {
            return this.nativeElement.getAttributeNS(null, name);
        };
        SvgElement.prototype.setAttr = function (name, value) {
            this.nativeElement.setAttributeNS(null, name, '' + value);
            return this;
        };
        SvgElement.prototype.removeAttr = function (name) {
            this.nativeElement.removeAttributeNS(null, name);
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
        function SvgGraphicElement(target, attributes) {
            if (attributes === void 0) { attributes = {}; }
            var _this = _super.call(this, target, attributes) || this;
            _this._isDraggingInit = false;
            _this._isDragging = false;
            return _this;
        }
        SvgGraphicElement.prototype.onStartDragging = function (listener) {
            var self = this;
            if (!this._isDraggingInit) {
                this._initDragging();
            }
            this.nativeElement.addEventListener('mousedown', function (event) {
                var t = self._getClientTransformation();
                var p = new matrix2_1.Vector(event.clientX, event.clientY).transform(t);
                listener.apply(self, [p]);
            });
            return this;
        };
        SvgGraphicElement.prototype.onDragging = function (listener) {
            var self = this;
            if (!this._isDraggingInit) {
                this._initDragging();
            }
            document.addEventListener('mousemove', function (event) {
                if (self._isDragging) {
                    var t = self._getClientTransformation();
                    var p = new matrix2_1.Vector(event.clientX, event.clientY).transform(t);
                    listener.apply(self, [p]);
                }
            });
            return this;
        };
        SvgGraphicElement.prototype.onStopDragging = function (listener) {
            var self = this;
            if (!this._isDraggingInit) {
                this._initDragging();
            }
            this.nativeElement.addEventListener(self._stopDraggingEventName, function (event) {
                listener.apply(self, [event.detail]);
            });
            return this;
        };
        Object.defineProperty(SvgGraphicElement.prototype, "transformation", {
            get: function () {
                var style = window.getComputedStyle(this.nativeElement, null);
                var value = style.getPropertyValue('transform');
                var matches = value.match(/^matrix\(([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+)\)$/);
                var ret = new matrix2_1.Transformation();
                if (matches !== null) {
                    var _a = matches
                        .filter(function (elem, index) { return index > 0; })
                        .map(function (match) { return parseFloat(match); }), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4], f = _a[5];
                    ret = matrix2_1.Transformation.createFromValues(a, b, c, d, e, f);
                }
                return ret;
            },
            set: function (value) {
                if (value === undefined || value === null) {
                    this.removeAttr('transform');
                }
                else {
                    this.setAttr('transform', value.toString());
                }
            },
            enumerable: true,
            configurable: true
        });
        SvgGraphicElement.prototype.transform = function (t) {
            this.setAttr('transform', this.transformation.transform(t).toString());
            return this;
        };
        SvgGraphicElement.prototype.translate = function (value) {
            this.transform(new matrix2_1.Transformation().translate(value));
            return this;
        };
        SvgGraphicElement.prototype.rotate = function (angle, params) {
            var center = params !== undefined && params.center
                ? this._getCenter()
                : new matrix2_1.Vector(0, 0);
            return this.transform(new matrix2_1.Transformation().rotate(angle, { center: center }));
        };
        SvgGraphicElement.prototype.scale = function (value, params) {
            var center = params !== undefined && params.center
                ? this._getCenter()
                : new matrix2_1.Vector(0, 0);
            return this.transform(new matrix2_1.Transformation().scale(value, { center: center }));
        };
        SvgGraphicElement.prototype.skew = function (value, params) {
            var center = params !== undefined && params.center
                ? this._getCenter()
                : new matrix2_1.Vector(0, 0);
            return this.transform(new matrix2_1.Transformation().skew(value, { center: center }));
        };
        SvgGraphicElement.prototype.getBoundingBox = function () {
            var box = this.nativeElement.getBBox();
            return { x: box.x, y: box.y, width: box.width, height: box.height };
        };
        SvgGraphicElement.prototype._generateId = function () {
            var t = function (repeat) {
                if (repeat === void 0) { repeat = 1; }
                var ret = [];
                for (var i = 0; i < repeat; i++) {
                    ret.push(Math
                        .floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1));
                }
                return ret.join('');
            };
            return t(2) + '_' + t() + '_' + t() + '_' + t() + '_' + t(3);
        };
        SvgGraphicElement.prototype._initDragging = function () {
            var self = this;
            this._stopDraggingEventName = "stopdragging_" + this._generateId();
            this.nativeElement.addEventListener('mousedown', function (event) {
                self._isDragging = true;
            });
            for (var _i = 0, _a = ['mouseup', 'mouseleave', 'blur']; _i < _a.length; _i++) {
                var eventName = _a[_i];
                document.addEventListener(eventName, function (event) {
                    if (self._isDragging) {
                        var t = self._getClientTransformation();
                        var p = event instanceof MouseEvent
                            ? new matrix2_1.Vector(event.clientX, event.clientY).transform(t)
                            : null;
                        self.nativeElement.dispatchEvent(new CustomEvent(self._stopDraggingEventName, { detail: p }));
                    }
                    self._isDragging = false;
                });
            }
            this._isDraggingInit = true;
        };
        SvgGraphicElement.prototype._getCenter = function () {
            var box = this.getBoundingBox();
            var center = new matrix2_1.Vector(box.x + box.width / 2, box.y + box.height / 2);
            return center.transform(this.transformation);
        };
        SvgGraphicElement.prototype._getClientTransformation = function () {
            var canvas = this.ownerElement;
            var ctm = canvas.nativeElement.getScreenCTM();
            return matrix2_1.Transformation.createFromValues(ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f).inverse();
        };
        return SvgGraphicElement;
    }(SvgElement));
    exports.SvgGraphicElement = SvgGraphicElement;
});
