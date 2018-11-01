/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/descriptorRelated/internal/Utils"],function(U){"use strict";var D=function(c,p,t){U.checkTexts(t);this._mParameters={};this._mParameters.changeType=c;this._mParameters.content=p;this._mParameters.texts=t;};D.prototype._getChangeType=function(){return this._mParameters.changeType;};D.prototype.getMap=function(){return this._mParameters;};var a={};a.getDescriptorChangeTypes=function(){return["appdescr_ovp_addNewCard","appdescr_ovp_removeCard","appdescr_ovp_changeCard","appdescr_app_addNewInbound","appdescr_app_changeInbound","appdescr_app_removeInbound","appdescr_app_removeAllInboundsExceptOne","appdescr_app_addNewOutbound","appdescr_app_changeOutbound","appdescr_app_removeOutbound","appdescr_app_addNewDataSource","appdescr_app_changeDataSource","appdescr_app_removeDataSource","appdescr_app_addAnnotationsToOData","appdescr_app_addTechnicalAttributes","appdescr_app_removeTechnicalAttributes","appdescr_app_setTitle","appdescr_app_setSubTitle","appdescr_app_setShortTitle","appdescr_app_setDescription","appdescr_app_setInfo","appdescr_app_setDestination","appdescr_app_setKeywords","appdescr_app_setAch","appdescr_flp_setConfig","appdescr_ui5_addNewModel","appdescr_ui5_addNewModelEnhanceWith","appdescr_ui5_replaceComponentUsage","appdescr_smb_addNamespace","appdescr_smb_changeNamespace","appdescr_ui_generic_app_setMainPage","appdescr_ui_setIcon","appdescr_ui_setDeviceTypes","appdescr_ui5_addLibraries","appdescr_url_setUri"];};a.createNew=function(c,p,t){var d=new D(c,p,t);return new Promise(function(r,b){if(d){r(d);}else{var e={};b(e);}});};a._createDescriptorInlineChange=function(d,p,t){var o=new D(d,p,t);return new Promise(function(r,b){if(o){r(o);}else{var e={};b(e);}});};a.createDescriptorInlineChange=function(d,p,t){return this._createDescriptorInlineChange(d,p,t);};a.create_ovp_addNewCard=function(p,t){U.checkParameterAndType(p,"card","object");return this._createDescriptorInlineChange('appdescr_ovp_addNewCard',p,t);};a.create_ovp_removeCard=function(p){U.checkParameterAndType(p,"cardId","string");return this._createDescriptorInlineChange('appdescr_ovp_removeCard',p);};a.create_ovp_changeCard=function(p,t){U.checkParameterAndType(p,"cardId","string");U.checkEntityPropertyChange(p);return this._createDescriptorInlineChange('appdescr_ovp_changeCard',p,t);};a.create_app_addNewInbound=function(p,t){U.checkParameterAndType(p,"inbound","object");return this._createDescriptorInlineChange('appdescr_app_addNewInbound',p,t);};a.create_app_removeInbound=function(p){U.checkParameterAndType(p,"inboundId","string");return this._createDescriptorInlineChange('appdescr_app_removeInbound',p);};a.create_app_removeAllInboundsExceptOne=function(p){U.checkParameterAndType(p,"inboundId","string");return this._createDescriptorInlineChange('appdescr_app_removeAllInboundsExceptOne',p);};a.create_app_changeInbound=function(p,t){U.checkParameterAndType(p,"inboundId","string");U.checkEntityPropertyChange(p);return this._createDescriptorInlineChange('appdescr_app_changeInbound',p,t);};a.create_app_addNewOutbound=function(p){U.checkParameterAndType(p,"outbound","object");return this._createDescriptorInlineChange('appdescr_app_addNewOutbound',p);};a.create_app_removeOutbound=function(p){U.checkParameterAndType(p,"outboundId","string");return this._createDescriptorInlineChange('appdescr_app_removeOutbound',p);};a.create_app_changeOutbound=function(p){U.checkParameterAndType(p,"outboundId","string");U.checkEntityPropertyChange(p);return this._createDescriptorInlineChange('appdescr_app_changeOutbound',p);};a.create_app_addNewDataSource=function(p){U.checkParameterAndType(p,"dataSource","object");return this._createDescriptorInlineChange('appdescr_app_addNewDataSource',p);};a.create_app_removeDataSource=function(p){U.checkParameterAndType(p,"dataSourceId","string");return this._createDescriptorInlineChange('appdescr_app_removeDataSource',p);};a.create_app_changeDataSource=function(p){U.checkParameterAndType(p,"dataSourceId","string");U.checkEntityPropertyChange(p);return this._createDescriptorInlineChange('appdescr_app_changeDataSource',p);};a.create_app_addAnnotationsToOData=function(p){U.checkParameterAndType(p,"dataSourceId","string");U.checkParameterAndType(p,"annotations","array");U.checkParameterAndType(p,"dataSource","object");return this._createDescriptorInlineChange('appdescr_app_addAnnotationsToOData',p);};a.create_app_setTitle=function(p){var t={"":p};return this._createDescriptorInlineChange('appdescr_app_setTitle',{},t).then(function(d){return new Promise(function(r){d["setHostingIdForTextKey"]=function(h){var b=d;var T=h+"_sap.app.title";b._mParameters.texts[T]=b._mParameters.texts[""];delete b._mParameters.texts[""];};r(d);});});};a.create_app_setSubTitle=function(p){var t={"":p};return this._createDescriptorInlineChange('appdescr_app_setSubTitle',{},t).then(function(d){return new Promise(function(r){d["setHostingIdForTextKey"]=function(h){var b=d;var T=h+"_sap.app.subTitle";b._mParameters.texts[T]=b._mParameters.texts[""];delete b._mParameters.texts[""];};r(d);});});};a.create_app_setShortTitle=function(p){var t={"":p};return this._createDescriptorInlineChange('appdescr_app_setShortTitle',{},t).then(function(d){return new Promise(function(r){d["setHostingIdForTextKey"]=function(h){var b=d;var T=h+"_sap.app.shortTitle";b._mParameters.texts[T]=b._mParameters.texts[""];delete b._mParameters.texts[""];};r(d);});});};a.create_app_setDescription=function(p){var t={"":p};return this._createDescriptorInlineChange('appdescr_app_setDescription',{},t).then(function(d){return new Promise(function(r){d["setHostingIdForTextKey"]=function(h){var b=d;var T=h+"_sap.app.description";b._mParameters.texts[T]=b._mParameters.texts[""];delete b._mParameters.texts[""];};r(d);});});};a.create_app_setInfo=function(p){var t={"":p};return this._createDescriptorInlineChange('appdescr_app_setInfo',{},t).then(function(d){return new Promise(function(r){d["setHostingIdForTextKey"]=function(h){var b=d;var T=h+"_sap.app.info";b._mParameters.texts[T]=b._mParameters.texts[""];delete b._mParameters.texts[""];};r(d);});});};a.create_app_setAch=function(p){U.checkParameterAndType(p,"ach","string");return this._createDescriptorInlineChange('appdescr_app_setAch',p);};a.create_app_setDestination=function(p){U.checkParameterAndType(p,"destination","object");return this._createDescriptorInlineChange('appdescr_app_setDestination',p);};a.create_app_setKeywords=function(p,t){U.checkParameterAndType(p,"keywords","array");return this._createDescriptorInlineChange('appdescr_app_setKeywords',p,t);};a.create_app_addTechnicalAttributes=function(p){U.checkParameterAndType(p,"technicalAttributes","array");return this._createDescriptorInlineChange('appdescr_app_addTechnicalAttributes',p);};a.create_app_removeTechnicalAttributes=function(p){U.checkParameterAndType(p,"technicalAttributes","array");return this._createDescriptorInlineChange('appdescr_app_removeTechnicalAttributes',p);};a.create_flp_setConfig=function(p){U.checkParameterAndType(p,"config","object");return this._createDescriptorInlineChange('appdescr_flp_setConfig',p);};a.create_ui5_addNewModel=function(p){U.checkParameterAndType(p,"model","object");return this._createDescriptorInlineChange('appdescr_ui5_addNewModel',p);};a.create_ui5_addNewModelEnhanceWith=function(p,t){U.checkParameterAndType(p,"modelId","string");return this._createDescriptorInlineChange('appdescr_ui5_addNewModelEnhanceWith',p,t);};a.create_ui5_replaceComponentUsage=function(p){U.checkParameterAndType(p,"componentUsageId","string");U.checkParameterAndType(p,"componentUsage","object");return this._createDescriptorInlineChange('appdescr_ui5_replaceComponentUsage',p);};a.create_ui5_addLibraries=function(p){U.checkParameterAndType(p,"libraries","object");return this._createDescriptorInlineChange('appdescr_ui5_addLibraries',p);};a.create_smb_addNamespace=function(p){U.checkParameterAndType(p,"smartBusinessApp","object");return this._createDescriptorInlineChange('appdescr_smb_addNamespace',p);};a.create_smb_changeNamespace=function(p){U.checkParameterAndType(p,"smartBusinessApp","object");return this._createDescriptorInlineChange('appdescr_smb_changeNamespace',p);};a.create_ui_generic_app_setMainPage=function(p,t){U.checkParameterAndType(p,"page","object");return this._createDescriptorInlineChange('appdescr_ui_generic_app_setMainPage',p,t);};a.create_ui_setIcon=function(p){U.checkParameterAndType(p,"icon","string");return this._createDescriptorInlineChange('appdescr_ui_setIcon',p);};a.create_ui_setDeviceTypes=function(p){U.checkParameterAndType(p,"deviceTypes","object");return this._createDescriptorInlineChange('appdescr_ui_setDeviceTypes',p);};a.create_url_setUri=function(p){U.checkParameterAndType(p,"uri","string");return this._createDescriptorInlineChange('appdescr_url_setUri',p);};return a;},true);
