/*!
* SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
*/
sap.ui.define(["jquery.sap.global","sap/ui/core/Element","../ContentConnector","../ViewStateManagerBase"],function(q,E,C,V){"use strict";var a;var b=V.extend("sap.ui.vk.threejs.ViewStateManager",{metadata:{}});var d=b.getMetadata().getParent().getClass().prototype;b.prototype.init=function(){if(d.init){d.init.call(this);}this._nodeHierarchy=null;this._nodeStates=new Map();this._selectedNodes=new Set();this._visibilityTracker=new a();this._showSelectionBoundingBox=true;this._boundingBoxesScene=new THREE.Scene();this.setHighlightColor("rgba(255, 0, 0, 1.0)");};b.prototype._setContent=function(c){var s=null;if(c&&c instanceof sap.ui.vk.threejs.Scene){s=c;}this._setScene(s);};b.prototype._onAfterUpdateContentConnector=function(){this._setContent(this._contentConnector.getContent());};b.prototype._onBeforeClearContentConnector=function(){this._setScene(null);};b.prototype._handleContentReplaced=function(e){var c=e.getParameter("newContent");this._setContent(c);};b.prototype._setScene=function(s){this._boundingBoxesScene=new THREE.Scene();this._setNodeHierarchy(s?s.getDefaultNodeHierarchy():null);return this;};b.prototype._setNodeHierarchy=function(n){var o=this._nodeHierarchy;if(this._nodeHierarchy){this._nodeHierarchy=null;this._nodeStates.clear();this._selectedNodes.clear();this._visibilityTracker.clear();}if(n){this._nodeHierarchy=n;var v=[],h=[];var c=n.findNodesByName();c.forEach(function(e){(e.visible?v:h).push(e);});this.fireVisibilityChanged({visible:v,hidden:h});}if(n!==o){this.fireNodeHierarchyReplaced({oldNodeHierarchy:o,newNodeHierarchy:n});}return this;};b.prototype.getNodeHierarchy=function(){return this._nodeHierarchy;};b.prototype.getVisibilityChanges=function(){return this.getShouldTrackVisibilityChanges()?this._visibilityTracker.getInfo(this.getNodeHierarchy()):null;};b.prototype.getVisibilityComplete=function(){var n=this.getNodeHierarchy(),c=n.findNodesByName(),v=[],h=[];c.forEach(function(e){var f=n.createNodeProxy(e);var g=f.getVeId();n.destroyNodeProxy(f);if(g){if(this.getVisibilityState(e)){v.push(g);}else{h.push(g);}}},this);return{visible:v,hidden:h};};b.prototype.getVisibilityState=function(n){return Array.isArray(n)?n.map(function(c){return c.visible;}):n.visible;};b.prototype.setVisibilityState=function(n,v,r){if(!Array.isArray(n)){n=[n];}n=(r?this._collectNodesRecursively(n):n).filter(function(e,i,s){return s.indexOf(e)===i;});var c=n.filter(function(e){return e.visible!=v;},this);if(c.length>0){c.forEach(function(e){e.visible=v;},this);if(this.getShouldTrackVisibilityChanges()){c.forEach(this._visibilityTracker.trackNodeRef,this._visibilityTracker);}this.fireVisibilityChanged({visible:v?c:[],hidden:v?[]:c});}return this;};b.prototype.enumerateSelection=function(c){this._selectedNodes.forEach(c);return this;};b.prototype.getSelectionState=function(n){var s=this._selectedNodes;function i(c){return s.has(c);}return Array.isArray(n)?n.map(i):i(n);};b.prototype._isAChild=function(c,n){var e=c.parent;while(e){if(n.has(e)){return true;}e=e.parent;}return false;};THREE.Object3D.prototype._vkCalculateObjectOrientedBoundingBox=function(){var p=this.parent,m=this.matrix.clone(),c=this.matrixAutoUpdate;this.parent=null;this.matrix.identity();this.matrixAutoUpdate=false;this.userData.boundingBox.setFromObject(this);this.matrixAutoUpdate=c;this.matrix.copy(m);this.parent=p;this.updateMatrixWorld(true);};b.prototype._AddBoundingBox=function(n){if(n.userData.boundingBox===undefined){n.userData.boundingBox=new THREE.Box3();n._vkCalculateObjectOrientedBoundingBox();}if(this._boundingBoxesScene&&n.userData.boxHelper===undefined){var c=new THREE.Box3Helper(n.userData.boundingBox,0xffff00);this._boundingBoxesScene.add(c);c.parent=n;n.userData.boxHelper=c;}};b.prototype._RemoveBoundingBox=function(n){if(n.userData.boundingBox!==undefined){delete n.userData.boundingBox;}if(n.userData.boxHelper!==undefined){this._boundingBoxesScene.remove(n.userData.boxHelper);delete n.userData.boxHelper;}};b.prototype._updateBoundingBoxesIfNeeded=function(){var u=new Set();this._selectedNodes.forEach(function(n){var p=n.parent;while(p){if(this._selectedNodes.has(p)){u.add(p);}p=p.parent;}}.bind(this));u.forEach(function(n){n._vkCalculateObjectOrientedBoundingBox();});};b.prototype.setShowSelectionBoundingBox=function(v){this._showSelectionBoundingBox=v;if(this._showSelectionBoundingBox){this._selectedNodes.forEach(function(n){this._AddBoundingBox(n);}.bind(this));}else{this._selectedNodes.forEach(function(n){this._RemoveBoundingBox(n);}.bind(this));}this.fireSelectionChanged({selected:this._selectedNodes,unselected:[]});};b.prototype.getShowSelectionBoundingBox=function(){return this._showSelectionBoundingBox;};THREE.Object3D.prototype._vkTraverseNodeGeometry=function(c){c(this);for(var i=0,l=this.children.length;i<l;i++){var e=this.children[i];if(e.geometry!==undefined&&!e.name&&e.children.length===0){c(e);}}};THREE.Object3D.prototype._vkSetTintColor=function(t){this._vkTraverseNodeGeometry(function(n){n.userData.tintColor=t;n._vkUpdateMaterialColor();});};THREE.Object3D.prototype._vkSetOpacity=function(o){this._vkTraverseNodeGeometry(function(n){n.userData.opacity=o;n._vkUpdateMaterialOpacity();});};THREE.Object3D.prototype._vkUpdateMaterialColor=function(){if(!this.material||!this.material.color){return;}var u=this.userData;if(u.originalMaterial){this.material.color.copy(u.originalMaterial.color);}if(u.highlightColor!==undefined||u.tintColor!==undefined){if(!u.originalMaterial){u.originalMaterial=this.material;this.material=this.material.clone();}var c;if(u.tintColor!==undefined){c=sap.ui.vk.abgrToColor(u.tintColor);this.material.color.lerp(new THREE.Color(c.red/255.0,c.green/255.0,c.blue/255.0),c.alpha);}if(u.highlightColor!==undefined){c=sap.ui.vk.abgrToColor(u.highlightColor);this.material.color.lerp(new THREE.Color(c.red/255.0,c.green/255.0,c.blue/255.0),c.alpha);}}};THREE.Object3D.prototype._vkUpdateMaterialOpacity=function(){if(!this.material||!this.material.opacity){return;}var u=this.userData;if(u.originalMaterial){this.material.opacity=u.originalMaterial.opacity;this.material.transparent=u.originalMaterial.transparent;}if(u.opacity!==undefined){if(!u.originalMaterial){u.originalMaterial=this.material;this.material=this.material.clone();}this.material.opacity*=u.opacity;this.material.transparent=this.material.transparent||this.material.opacity<0.99;}};b.prototype._isAncestorSelected=function(n){n=n.parent;while(n){if(this._selectedNodes.has(n)){return true;}n=n.parent;}return false;};b.prototype._updateHighlightColor=function(n,p){var s=p||this._selectedNodes.has(n);n.userData.highlightColor=s?this._highlightColorABGR:undefined;n._vkUpdateMaterialColor();var c=n.children;for(var i=0,l=c.length;i<l;i++){this._updateHighlightColor(c[i],s);}};b.prototype.setSelectionState=function(n,s,r){if(!Array.isArray(n)){n=[n];}n=(r?this._collectNodesRecursively(n):n).filter(function(v,i,e){return e.indexOf(v)===i;});var c=n.filter(function(e){return this._selectedNodes.has(e)!==s;},this);if(c.length>0){c.forEach(function(e){this._selectedNodes[s?"add":"delete"](e);if(this._showSelectionBoundingBox){this[s?"_AddBoundingBox":"_RemoveBoundingBox"](e);}},this);c.forEach(function(e){this._updateHighlightColor(e,s||this._isAncestorSelected(e));},this);this.fireSelectionChanged({selected:s?c:[],unselected:s?[]:c});}return this;};b.prototype.setSelectionStates=function(s,u,r){if(!Array.isArray(s)){s=[s];}if(!Array.isArray(u)){u=[u];}s=(r?this._collectNodesRecursively(s):s);u=(r?this._collectNodesRecursively(u):u);var c=s.filter(function(n){return this._selectedNodes.has(n)===false;},this);var e=u.filter(function(n){return this._selectedNodes.has(n)===true;},this);if(c.length>0||e.length>0){c.forEach(function(n){this._selectedNodes.add(n);this._updateHighlightColor(n,true);if(this._showSelectionBoundingBox){this._AddBoundingBox(n);}},this);e.forEach(function(n){this._selectedNodes.delete(n);if(this._showSelectionBoundingBox){this._RemoveBoundingBox(n);}},this);e.forEach(function(n){this._updateHighlightColor(n,this._isAncestorSelected(n));},this);this.fireSelectionChanged({selected:c,unselected:e});}return this;};b.prototype._collectNodesRecursively=function(n){var r=[],t=this;n.forEach(function collectChildNodes(c){r.push(c);t._nodeHierarchy.enumerateChildren(c,collectChildNodes,false,true);});return r;};b.prototype._getOpacity=function(n){return n.userData.opacity!==undefined?n.userData.opacity:null;};b.prototype.getOpacity=function(n){if(Array.isArray(n)){return n.map(this._getOpacity,this);}else{return this._getOpacity(n);}};b.prototype.setOpacity=function(n,o,r){if(!Array.isArray(n)){n=[n];}n=(r?this._collectNodesRecursively(n):n).filter(function(v,i,s){return s.indexOf(v)===i;});if(o===null){o=undefined;}var c=n.filter(function(e){return e.userData.opacity!==o;},this);if(c.length>0){c.forEach(function(e){e._vkSetOpacity(o);},this);this.fireOpacityChanged({changed:c,opacity:o});}return this;};b.prototype._getTintColorABGR=function(n){return n.userData.tintColor!==undefined?n.userData.tintColor:null;};b.prototype._getTintColor=function(n){return n.userData.tintColor!==undefined?sap.ui.vk.colorToCSSColor(sap.ui.vk.abgrToColor(n.userData.tintColor)):null;};b.prototype.getTintColor=function(n,i){var g=i?"_getTintColorABGR":"_getTintColor";if(Array.isArray(n)){return n.map(this[g],this);}else{return this[g](n);}};b.prototype.setTintColor=function(n,t,r){if(!Array.isArray(n)){n=[n];}var c=null;switch(typeof t){case"number":c=t;break;case"string":if(sap.ui.core.CSSColor.isValid(t)){c=sap.ui.vk.colorToABGR(sap.ui.vk.cssColorToColor(t));}break;default:t=null;break;}n=(r?this._collectNodesRecursively(n):n).filter(function(v,i,s){return s.indexOf(v)===i;});var e=n.filter(function(f){return f.userData.tintColor!==c;},this);if(e.length>0){e.forEach(function(f){f._vkSetTintColor(c);},this);this.fireTintColorChanged({changed:e,tintColor:t,tintColorABGR:c});}return this;};b.prototype.setHighlightColor=function(c){switch(typeof c){case"number":this._highlightColorABGR=c;break;case"string":if(sap.ui.core.CSSColor.isValid(c)){this._highlightColorABGR=sap.ui.vk.colorToABGR(sap.ui.vk.cssColorToColor(c));}break;default:return this;}if(this._selectedNodes.size>0){this._selectedNodes.forEach(function(n){this._updateHighlightColor(n,true);},this);this.fireHighlightColorChanged({highlightColor:sap.ui.vk.colorToCSSColor(sap.ui.vk.abgrToColor(this._highlightColorABGR)),highlightColorABGR:this._highlightColorABGR});}return this;};b.prototype.getHighlightColor=function(i){return i?this._highlightColorABGR:sap.ui.vk.colorToCSSColor(sap.ui.vk.abgrToColor(this._highlightColorABGR));};a=function(){this._visibilityChanges=new Set();};a.prototype.getInfo=function(n){var c=[];this._visibilityChanges.forEach(function(e){var f=n.createNodeProxy(e);var v=f.getVeId();n.destroyNodeProxy(f);if(v){c.push(v);}});return c;};a.prototype.clear=function(){this._visibilityChanges.clear();};a.prototype.trackNodeRef=function(n){if(this._visibilityChanges.has(n)){this._visibilityChanges.delete(n);}else{this._visibilityChanges.add(n);}};C.injectMethodsIntoClass(b);return b;});