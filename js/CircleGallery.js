/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global brackets: true, $, window, document, navigator, requestAnimationFrame, cancelAnimationFrame */

(function (un) {
    "use strict";
    
    var CircleGallery = function (opts) {
        var options = opts || {};
        
        this._containerSide = parseInt(options.side.replace("px", ""), 10);
        
        this.styles = {
            containerHeight : options.side,
            containerWidth : options.side
        };
        
        this.eleRefs = {
            items : []
        };
        
        this.eleRefs.containerEle = this._drawSkeleton();
    };
    
    CircleGallery.prototype = {
        
        placeAt : function (id) {
            var ele = document.getElementById(id);
            ele.appendChild(this.eleRefs.containerEle);
        },
        
        addItem : function (itemObj) {
            if (itemObj instanceof Array) {
                var i;
                for (i = 0; i < itemObj.length; i++) {
                    this.addItem(itemObj[i]);
                }
                return;
            }
            
            var itemWrapper = this._getItemWrapper(itemObj);
            this.eleRefs.items.push(itemWrapper);
            
            var container = this.eleRefs.containerEle;
            container.appendChild(itemWrapper);
            this._circlify();
        },
        
        startAnimation : function () {
            var time = Date.now();
            if (this._startTime === un) {
                this._startTime = time;
            }
            var adder = (time - this._startTime) / 1000;
            var points = this._getCirclePoints(this.eleRefs.items.length, this._innerRadius, adder);
            this._drawItemsAt(points);
            this._ANIMATION_FRAME_ID = requestAnimationFrame(this.startAnimation.bind(this));
        },
        
        stopAnimation : function () {
            cancelAnimationFrame(this._ANIMATION_FRAME_ID);
        },
        
        _drawSkeleton : function () {
            var containerEle = document.createElement('div');
            containerEle.style.cssText += this._getContainerStyles();
            containerEle.setAttribute('class', 'CG-container');
            return containerEle;
        },
        
        _getItemWrapper : function (itemObj) {
            var item = itemObj.itemElement;
            var itemWrapper = document.createElement('div');
            itemWrapper.style.cssText += this._getItemStyles();
            itemWrapper.setAttribute('class', 'CG-item');
            itemWrapper.appendChild(item);
            return itemWrapper;
        },
        
        _getContainerStyles : function () {
            var sStyle = ["height : ", this.styles.containerHeight,
                          ";width : ", this.styles.containerWidth
                         ].join("");
            return sStyle;
        },
        
        _getItemStyles : function () {
            var sStyle = ["position : absolute"].join("");
            return sStyle;
        },
        
        _setTransformValue : function (ele, xValue, yValue, zValue) {
            var vendorProperty = [{"WebkitTransform" : "-webkit-transform"},
                                {"MozTransform" : "-moz-transform"},
                                {"MsTransform" : "-ms-transform"},
                                {"OTransform" : "-o-transform"}
                               ];
            
            var transformPropertyString = "transform";
            var i;
            for (i = 0; i < vendorProperty.length; i++) {
                if (ele.style.hasOwnProperty(Object.keys(vendorProperty[i])[0])) {
                    transformPropertyString = vendorProperty[i][Object.keys(vendorProperty[i])[0]];
                }
            }
            var sXValue = xValue + 'px';
            var sYValue = yValue + 'px';
            var sZValue = zValue + 'px';
            ele.style.cssText = ele.style.cssText + " " + transformPropertyString + ": translate3d(" + sXValue + "," + sYValue + "," + sZValue + ");";
        },
        
        _circlify : function () {
            var items = this.eleRefs.items;
            var n = items.length;
            var contArea = this._containerSide * this._containerSide;
            var fillArea = Math.max(contArea / n, contArea * 0.4);
            this._itemSide = Math.sqrt(fillArea / n);
            this._innerRadius = (this._containerSide / 2) - (this._itemSide / 2);
            var points = this._getCirclePoints(n, this._innerRadius, 0);
            this._drawItemsAt(points);
        },
        
        _drawItemsAt : function (points) {
            var items = this.eleRefs.items;
            var i;
            for (i = 0; i < items.length; i++) {
                var item = items[i];
                var xValue = parseFloat((points[i].x - (this._itemSide / 2) + this._containerSide / 2).toFixed(6), 10);
                var yValue = parseFloat((points[i].y - (this._itemSide / 2) + this._containerSide / 2).toFixed(6), 10);
                item.style.cssText += "width : " + this._itemSide + "px" + ";height : " + this._itemSide + "px;";
                this._setTransformValue(item, xValue, yValue, 0);
            }
        },
        
        _getCirclePoints : function (n, radius, startAngle) {
            var points = [];
            var angle = (2 * Math.PI / n);
            var i;
            for (i = 0; i < n; i++) {
                var point = {};
                point.x = radius * Math.cos(angle * i + startAngle);
                point.y = radius * Math.sin(angle * i + startAngle);
                points.push(point);
            }
            return points;
        }
        
    };
    
    window.CircleGallery = CircleGallery;
    
}());