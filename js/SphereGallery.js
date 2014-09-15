/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global brackets: true, $, window, document, navigator, requestAnimationFrame, cancelAnimationFrame */

/**************
 *   @author : Rithwik Anand
 *   @desc : SphereGallery - An easy to consume 3D gallery.
 *   @license : MIT Licensed
 ***************/

(function (un) {
    "use strict";
    
    var isTouchDevice,
        deviceDetect = (function () {
            isTouchDevice =  window.hasOwnProperty('ontouchstart')  // works on most browsers 
                || window.hasOwnProperty('onmsgesturechange'); // works on ie10
        }());
    
    var SphereGallery = function (opts) {
        var options = opts || {};
        
        this._settings = {
            orientation : options.orientation || 'HORIZONTAL'
        };
        
        this._styles = {
            containerHeight : options.containerHeight,
            containerWidth : options.containerWidth,
            perspective : options.perspective
        };
        
        this._dimensions = {
            container : {
                width : parseInt(options.containerWidth.replace("px", ""), 10),
                height : parseInt(options.containerHeight.replace("px", ""), 10),
                perspective : parseInt(options.perspective.replace("px", ""), 10)
            },
            item : {
                padding : 20,
                borderWidth : 1,
                margin : 5
            },
            sphere : {
                rotateAngle : {
                    x : 0,
                    y : 0
                }
            }
        };
        
        this._eleRefs = {
            items : []
        };
        this._eleRefs.containerEle = this._drawSkeleton();
        this._bindTapEvents();
    };
    
    SphereGallery.prototype = {
        
        placeAt : function (id) {
            var ele = document.getElementById(id);
            ele.appendChild(this._eleRefs.containerEle);
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
            this._eleRefs.items.push(itemWrapper);
            
            var sphereEle = this._eleRefs.sphereEle;
            sphereEle.appendChild(itemWrapper);
            var self = this;
            var intervalId = window.setInterval(function () {
                var isContentRendered = true;
                [].forEach.call(self._eleRefs.items, function (item) {
                    var content = item.firstChild;
                    var width = content.width || content.clientWidth;
                    var height = content.height || content.clientHeight;
                    isContentRendered = isContentRendered && width && height;
                });
                if (isContentRendered) {
                    window.clearInterval(intervalId);
                    self._spherify();
                }
            }, 0);
        },
        
        setOrientation : function (orientation) {
            this._settings.orientation = orientation;
            this._spherify();
            return this._settings.orientation;
        },
        
        _drawSkeleton : function () {
            var containerEle = document.createElement('div');
            containerEle.style.cssText += this._getContainerStyles();
            containerEle.setAttribute('class', 'SG-container');
            
            var sphereEle = document.createElement('div');
            sphereEle.style.cssText += this._getSphereStyles();
            sphereEle.setAttribute('class', 'SG-sphere');
            
            this._eleRefs.sphereEle = sphereEle;
            
            containerEle.appendChild(sphereEle);
            return containerEle;
        },
        
        _getItemWrapper : function (itemObj) {
            var item = itemObj.itemElement;
            var itemWrapper = document.createElement('div');
            itemWrapper.style.cssText += this._getItemStyles();
            itemWrapper.setAttribute('class', 'SG-item');
            itemWrapper.appendChild(item);
            return itemWrapper;
        },
        
        _getContainerStyles : function () {
            var sStyle = ["position : absolute",
                          ";height : ", this._styles.containerHeight,
                          ";width : ", this._styles.containerWidth,
                          ";-webkit-perspective : ", this._styles.perspective,
                          ";-moz-perspective : ", this._styles.perspective,
                          ";-ms-perspective : ", this._styles.perspective,
                          ";-o-perspective : ", this._styles.perspective,
                          ";perspective : ", this._styles.perspective
                         ].join("");
            return sStyle;
        },
        
        _getSphereStyles : function () {
            var sStyle = ["-webkit-transform-style : ", "preserve-3d",
                          ";-moz-transform-style : ", "preserve-3d",
                          ";-ms-transform-style : ", "preserve-3d",
                          ";-o-transform-style : ", "preserve-3d",
                          ";transform-style : ", "preserve-3d",
                          ";height : ", "100%",
                          ";width : ", "100%",
                          ";position : ", "relative"
                         ].join("");
            return sStyle;
        },
        
        _getItemStyles : function () {
            var sStyle = ["position : absolute",
                          ";padding :", this._dimensions.item.padding, "px",
                          ";border :", this._dimensions.item.borderWidth, "px solid white",
                          ";border-radius :12%"
                         ].join("");
            return sStyle;
        },
        
        _setTransformValue : function (ele, translateObj, rotateObj) {
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
            var sTXValue = ((translateObj && translateObj.x) ? translateObj.x : 0) + 'px';
            var sTYValue = ((translateObj && translateObj.y) ? translateObj.y : 0) + 'px';
            var sTZValue = ((translateObj && translateObj.z) ? translateObj.z : 0) + 'px';
            
            var sRXValue = ((rotateObj && rotateObj.x) ? rotateObj.x : 0) + 'rad';
            var sRYValue = ((rotateObj && rotateObj.y) ? rotateObj.y : 0) + 'rad';
            var sRZValue = ((rotateObj && rotateObj.z) ? rotateObj.z : 0) + 'rad';
            
            ele.style.cssText = [ele.style.cssText,
                                 " ", transformPropertyString,
                                 ": rotateX(", sRXValue, ")",
                                 " rotateY(", sRYValue, ")",
                                 " rotateZ(", sRZValue, ")",
                                 " translateX(", sTXValue, ")",
                                 " translateY(", sTYValue, ")",
                                 " translateZ(", sTZValue, ");"
                                ].join("");
        },
        
        _setPerspective : function (ele, perspective) {
            var vendorProperty = [{"WebkitPerspective" : "-webkit-perspective"},
                                {"MozPerspective" : "-moz-perspective"},
                                {"MsPerspective" : "-ms-perspective"},
                                {"OPerspective" : "-o-perspective"}
                               ],
                transformPropertyString = "perspective",
                i;
            
            for (i = 0; i < vendorProperty.length; i++) {
                if (ele.style.hasOwnProperty(Object.keys(vendorProperty[i])[0])) {
                    transformPropertyString = vendorProperty[i][Object.keys(vendorProperty[i])[0]];
                }
            }
            var sPerspective = perspective + "px";
            ele.style.cssText = ele.style.cssText + " " + transformPropertyString + ": " + sPerspective + ";";
        },
        
        _bindTapEvents : function () {
            var self = this,
                container = this._eleRefs.containerEle,
                tapEvent = isTouchDevice ? "touchstart" : "mousedown",
                tapMoveEvent = isTouchDevice ? "touchmove" : "mousemove",
                tapEndEvent = isTouchDevice ? "touchend" : "mouseup";
            
            container.addEventListener(tapEvent, function (e) {
                self._flags = {
                    isDragging : true
                };
                self._swipeValues = self._swipeValues || {};
                self._swipeValues.initTapPoint = {
                    x : e.pageX,
                    y : e.pageY
                };
                self._swipeValues.initRotateAngle = {
                    x : (self._swipeValues.currentRotateAngle) ? self._swipeValues.currentRotateAngle.x : 0,
                    y : (self._swipeValues.currentRotateAngle) ? self._swipeValues.currentRotateAngle.y : 0
                };
            });
            
            container.addEventListener(tapMoveEvent, function (e) {
                if (self._flags !== un && self._flags.isDragging) {
                    e.preventDefault();
                    
                    if (self._swipeValues.ids !== un) {
                        window.clearTimeout(self._swipeValues.ids.TIMEOUT_ID);
                    }
                    
                    self._swipeValues.ids = {
                        TIMEOUT_ID : window.setTimeout(function () {
                            self._swipeValues.initTapPoint = {
                                x : e.pageX,
                                y : e.pageY
                            };
                            self._swipeValues.initRotateAngle = {
                                x : self._swipeValues.currentRotateAngle.x,
                                y : self._swipeValues.currentRotateAngle.y
                            };
                            self._swipeValues.incrRotateAngle = {
                                x : 0,
                                y : 0
                            };
                        }, 200)
                    };
                    self._swipeValues.currentTapPoint = {
                        x : e.pageX,
                        y : e.pageY
                    };
                    
                    self._updateIncrementAngles();
                    self._swipeValues.ids.ANIMATIONFRAME_ID = window.requestAnimationFrame(self._rotateSphere.bind(self));
                }
            });
            
            container.addEventListener(tapEndEvent, function (e) {
                self._flags.isDragging = false;
            });
        },
        
        _spherify : function () {
            this._updateDimensions();
            
            var items = this._eleRefs.items,
                sphere = this._eleRefs.sphereEle,
                sphereWidth = this._dimensions.sphere.width,
                sphereHeight = this._dimensions.sphere.height,
                containerWidth = this._dimensions.container.width,
                containerHeight = this._dimensions.container.height,
                itemOffset = 2 * (this._dimensions.item.padding +  this._dimensions.item.borderWidth + this._dimensions.item.margin),
                len = items.length,
                rotateAngle = this._dimensions.item.angle,
                translateLen = this._dimensions.item.inRadius,
                i,
                fixedDimension,
                variableDimension,
                fixedToVariableRatio,
                rotateAxis,
                variableSphereDimension,
                fixedSphereDimension,
                variableMargin,
                fixedMargin;
            
            if (this._settings.orientation === 'HORIZONTAL') {
                fixedDimension = "width";
                fixedSphereDimension = sphereWidth;
                variableSphereDimension = sphereHeight;
                variableDimension = "height";
                rotateAxis = "y";
                variableMargin = "margin-top";
                fixedMargin = "margin-left";
            } else {
                fixedDimension = "height";
                fixedSphereDimension = sphereHeight;
                variableSphereDimension = sphereWidth;
                variableDimension = "width";
                rotateAxis = "x";
                variableMargin = "margin-left";
                fixedMargin = "margin-top";
            }
            for (i = 0; i < len; i++) {
                var item = items[i],
                    content = item.firstChild,
                    contentDimensions = [],
                    rotateObj = {},
                    newVariableDimension,
                    newFixedDimension;
                
                contentDimensions.width = content.width || content.clientWidth;
                contentDimensions.height = content.height || content.clientHeight;
                rotateObj[rotateAxis] = (rotateAngle * i);
                this._setTransformValue(item, {z : translateLen}, rotateObj);
                
                newFixedDimension = contentDimensions[fixedDimension];
                newVariableDimension = newFixedDimension * (contentDimensions[variableDimension] / contentDimensions[fixedDimension]);
                
                if (newFixedDimension > fixedSphereDimension) {
                    newFixedDimension = fixedSphereDimension - itemOffset;
                    newVariableDimension = newFixedDimension * (contentDimensions[variableDimension] / contentDimensions[fixedDimension]);
                }
                
                if (newVariableDimension > variableSphereDimension) {
                    newVariableDimension = variableSphereDimension - itemOffset;
                    newFixedDimension = newVariableDimension * (contentDimensions[fixedDimension] / contentDimensions[variableDimension]);
                }
                    
                item.style.cssText += [";", variableDimension, ":", newVariableDimension, "px",
                                       ";", variableMargin, ":", (variableSphereDimension - newVariableDimension) / 2, "px",
                                       ";", fixedDimension, ":", newFixedDimension, "px",
                                       ";", fixedMargin, ":", (fixedSphereDimension - newFixedDimension) / 2, "px"
                                      ].join("");
            }
            var sphereVerticalMargin = (containerHeight - sphereHeight) / 2;
            var sphereHorizontalMargin = (containerWidth - sphereWidth) / 2;
            this._dimensions.sphere.margin = {
                vertical: sphereVerticalMargin,
                horizontal: sphereHorizontalMargin
            };
            sphere.style.cssText += ["width: ", sphereWidth, "px",
                                     ";height: ", sphereHeight, "px",
                                     ";margin: ", sphereVerticalMargin, "px ", sphereHorizontalMargin, "px"
                                    ].join("");
        },
        
        _rotateSphere : function () {
            var sphere = this._eleRefs.sphereEle,
                newRotateAngleX = (this._swipeValues.initRotateAngle.x + this._swipeValues.incrRotateAngle.x) % (2 * Math.PI),
                newRotateAngleY = (this._swipeValues.initRotateAngle.y + this._swipeValues.incrRotateAngle.y) % (2 * Math.PI);
            
            this._swipeValues.currentRotateAngle = this._swipeValues.currentRotateAngle || {x : 0, y : 0};
            this._swipeValues.currentRotateAngle = {
                x : this._swipeValues.currentRotateAngle.x + (newRotateAngleX - this._swipeValues.currentRotateAngle.x) / 40,
                y : this._swipeValues.currentRotateAngle.y + (newRotateAngleY - this._swipeValues.currentRotateAngle.y) / 40
            };
            if (this._settings.orientation === 'HORIZONTAL') {
                this._setTransformValue(sphere, {}, {y : this._swipeValues.currentRotateAngle.y});
            } else {
                this._setTransformValue(sphere, {}, {x : -1 * this._swipeValues.currentRotateAngle.x});
            }
            
            this._swipeValues.ids.ANIMATIONFRAME_ID = window.requestAnimationFrame(this._rotateSphere.bind(this));
        },
        
        _updateDimensions : function () {
            var len = this._eleRefs.items.length,
                angle = 2 * Math.PI / len,
                containerWidth = this._dimensions.container.width,
                containerHeight = this._dimensions.container.height,
                perspective = this._dimensions.container.perspective,
                availableContainerWidth = (3 * ((perspective - (containerWidth / 2)) * (containerWidth / 2)) / perspective), // Considering scaling due to translation.
                availableContainerHeight = (3 * ((perspective - (containerHeight / 2)) * (containerHeight / 2)) / perspective), // Considering scaling due to translation.
                sphereWidth = availableContainerWidth * Math.sin(Math.PI / len),  // Relation between circumRadius and side of a regular polygon.
                sphereHeight = availableContainerHeight * Math.sin(Math.PI / len);  // Relation between circumRadius and side of a regular polygon.
            
            this._dimensions.item.angle = angle;
            this._dimensions.item.radius = this._settings.orientation === 'HORIZONTAL' ? (availableContainerWidth / 2) : (availableContainerHeight / 2);
            this._dimensions.item.inRadius = (this._dimensions.item.radius) * Math.cos(Math.PI / len); // Relation between circumRadius and inRadius of a regular polygon.
            this._dimensions.sphere.width = sphereWidth;
            this._dimensions.sphere.height = sphereHeight;
            this._dimensions.container.availableWidth = availableContainerWidth;
            this._dimensions.container.availableHeight = availableContainerHeight;
        },
        
        _updateIncrementAngles : function () {
            var totalWidth = this._dimensions.container.width,
                totalHeight = this._dimensions.container.height,
                xDiff = this._swipeValues.currentTapPoint.x - this._swipeValues.initTapPoint.x,
                yDiff = this._swipeValues.currentTapPoint.y - this._swipeValues.initTapPoint.y;
            
            this._swipeValues.incrRotateAngle = {
                x : yDiff * 2 * Math.PI / totalHeight,
                y : xDiff * 2 * Math.PI / totalWidth
            };
        }
    };
    
    window.SphereGallery = SphereGallery;
}());