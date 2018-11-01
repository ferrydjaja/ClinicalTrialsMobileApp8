sap.ui.define(["sap/ui/model/MetaModel"],function(M){"use strict";var F={adapterCache:{},promiseCache:{},defaultAdapter:{v2:{"field":"sap/ui/mdc/experimental/provider/adapter/odata/v2/ODataFieldAdapter","object":"sap/ui/mdc/experimental/provider/adapter/odata/v2/ODataObjectAdapter"},v4:{"field":"sap/ui/mdc/experimental/provider/adapter/odata/v4/ODataFieldAdapter","object":"sap/ui/mdc/experimental/provider/adapter/odata/v4/ODataObjectAdapter"}},adapterClassCache:{}};F.requestAdapter=function(m,o){var k=F._getKeyInfo(m,o);function p(a,o,r){a.ready().then(function(){a.switchMetaContext(null,o.path);F.adapterCache[k.key]=a;r(a);});}if(!m.getMetaModel()){throw new Error("sap.ui.mdc.experimental.provider.model.ModelAdapterFactory: Only models with meta model are allowed");}if(!F.promiseCache[k.key]){F.promiseCache[k.key]=new Promise(function(r,a){var A=F.getAdapter(m,o,true);if(A){p(A,o,r);}else{sap.ui.require([o.adapter],function(b){F.cacheAdapterClass(o.adapter,b);var A=new b(m,o.model,o.name);if(A){p(A,o,r);}else{a("Invalid class");}});}});}return F.promiseCache[k.key];};F.newAdapter=function(k,m,s,c,f){var o={model:s,name:c,kind:k,path:f};return this.requestAdapter(m,o);};F.getAdapter=function(m,o,n){var k=F._getKeyInfo(m,o);var c=F.adapterClassCache[k.adapter];if(!m.getMetaModel()){throw new Error("sap.ui.mdc.experimental.provider.model.ModelAdapterFactory: Only models with meta model are allowed");}if(F.adapterCache[k.key]){return F.adapterCache[k.key];}else if(c){F.adapterCache[k.key]=new c(m,o.model,o.name);if(!n){F.adapterCache[k.key].switchMetaContext(o.metaPath,o.path);}return F.adapterCache[k.key];}return null;};F._getKeyInfo=function(m,o){if(!o.adapter){if(m.getMetadata()._sClassName=="sap.ui.model.odata.v4.ODataModel"){o.adapter=F.defaultAdapter.v4[o.kind];}else{o.adapter=F.defaultAdapter.v2[o.kind];}}var k={adapter:o.adapter,modelName:o.model,context:o.name,path:o.path,key:m.getId()+">"+o.name+">"+o.path+">"+o.adapter};return k;};F.cacheAdapterClass=function(a,A){F.adapterClassCache[a]=A;};return F;});
