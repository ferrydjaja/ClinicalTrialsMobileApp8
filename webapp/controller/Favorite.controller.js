sap.ui.define(["sap/ui/core/mvc/Controller", './Formatter', ], function(Controller) {
    "use strict";

    return Controller.extend("ClinicalTrials.ClinicalTrials.controller.Favorite", {
        handleRouteMatched: function(oEvent) {
            var oParams = {};

            if (oEvent.mParameters.data.context) {
                this.sContext = oEvent.mParameters.data.context;
                var oPath;
                if (this.sContext) {
                    oPath = {
                        path: "/" + this.sContext,
                        parameters: oParams
                    };
                    this.getView().bindObject(oPath);
                }
            }

        },

        onInit: function() {
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            var oView = this.getView();

            this.getView().addEventDelegate({
                onBeforeShow: function(evt) {

                    var busyDialog = (busyDialog) ? busyDialog : new sap.m.BusyDialog({
                        text: "{i18n>MSG0}",
                        title: "{i18n>MSG1}"
                    });

                    function wasteTime() {
                        busyDialog.open();
                    }

                    function runNext() {
                        busyDialog.close();
                    }

                    jQuery.sap.require("jquery.sap.storage");
                    var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);


                    if (oStorage.get('NCTID') == null) {
                        //no saved NCTIDs
                        console.log('no NCTID');
                        var oModel = new sap.ui.model.json.JSONModel();
                        oModel.setData({});
                        oView.setModel(oModel);
                    } else {
                        wasteTime();
                        var NCTIDstorage = oStorage.get('NCTID').split(",");
                        console.log(NCTIDstorage);

                        $.ajax({
                            type: 'GET',
                            async: true,
                            cache: true,
                            url: "/nodejs?q=6&nctnumbers=" + oStorage.get('NCTID'),
                            timeout: 600000,
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",

                            success: function(data) {
                                if (data.results.length > 0) {
                                    runNext();
                                    console.log(data);
			
									var lat = '';
						            var lng = '';

                                    var oModel = new sap.ui.model.json.JSONModel();
                                    oModel.setData({});
                                    oModel.setData({
                                        modelData: [data],
                                        UserLoc: [lat + ';' + lng],
                                        //cond: [toTitleCase(cond)]
                                    });
                                    sap.ui.getCore().setModel(oModel);
                                    oView.setModel(oModel);
                                }

                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                runNext();
                                if (errorThrown == '')
                                    errorThrown = 'Cannot connect to the backend';
                                jQuery.sap.require("sap.m.MessageBox");
                                sap.m.MessageBox.show(errorThrown, {
                                    icon: sap.m.MessageBox.Icon.INFORMATION,
                                    title: "{i18n>WELCOME_TITLE}",
                                    actions: sap.m.MessageBox.Action.OK,
                                    onClose: null,
                                    //styleClass: ""                        
                                });
                            }
                        });
                    }
                }
            });
        },

        Search: function(oEvent) {
            var searchValue = oEvent.oSource.mProperties.value;

            var filters = new Array();
            var filter1 = new sap.ui.model.Filter("brief_title", sap.ui.model.FilterOperator.Contains, searchValue);
            var filter2 = new sap.ui.model.Filter("id_info/nct_id", sap.ui.model.FilterOperator.Contains, searchValue);
            var filter3 = new sap.ui.model.Filter("last_update_submitted", sap.ui.model.FilterOperator.Contains, searchValue);
            var filter4 = new sap.ui.model.Filter("overall_status", sap.ui.model.FilterOperator.Contains, searchValue);
            var filter5 = new sap.ui.model.Filter("eligibility/gender", sap.ui.model.FilterOperator.Contains, searchValue);
            var filter6 = new sap.ui.model.Filter("eligibility/minimum_age", sap.ui.model.FilterOperator.Contains, searchValue);

            var oCombinedOr = new sap.ui.model.Filter([filter1, filter2, filter3, filter4, filter5, filter6]);
            filters.push(oCombinedOr);

            //get list created in view
            this.oList = this.getView().byId("polist");
            this.oList.getBinding("items").filter(filters);
        },


        NavBack: function(oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("home", true);
        },

        onNavButtonTo: function(evt) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("detail", true);
        },

        doNavHome: function() {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("home", true);
        },

        handleOnPress: function(oEvent) {
            var busyDialog = (busyDialog) ? busyDialog : new sap.m.BusyDialog({
                text: "{i18n>MSG0}",
                title: "{i18n>MSG1}"
            });

            function wasteTime() {
                busyDialog.open();
            }

            function runNext() {
                busyDialog.close();
            }

            function genCriteria(str) {
                var indices = [];
                var inclusionstr_final = '';
                var exclusionstr_final = '';
                var ic_s = str.search(/inclusion criteria:/i);
                var ic_e = str.search(/exclusion criteria:/i);

                //console.log(ic_s + ' ' + ic_e);

                if (ic_s != -1) {
                    //******* INCLUSION ***********************************
                    //Inclusion Criteria: 19 chars.

                    var inclusionstr = '';
                    if (ic_e == -1)
                        inclusionstr = str.substring(ic_s, str.length).trim();
                    else
                        inclusionstr = str.substring(ic_s, ic_e).trim();

                    if (!inclusionstr.startsWith("-")) {
                        inclusionstr = "- " + inclusionstr;
                    }
                    //console.log("Inclusionnstr: " + inclusionstr);

                    var indices = [];
                    var period = false;
                    for (var v = 0, len = inclusionstr.length; v < len; v++) {
                        if (inclusionstr[v] == "-" && inclusionstr[v + 2] != "-" && inclusionstr[v - 1] == " ") {
                            indices.push(v + 1);
                            period = false;
                        } else if (inclusionstr[v] == "." && inclusionstr[v + 1] == " " && inclusionstr[v + 2] != "-" && inclusionstr[v - 1] != "e" && inclusionstr[v - 1] != "g") {
                            indices.push(v + 2);
                            period = true;
                        } else if (inclusionstr[v] == ")" && inclusionstr[v - 2] == " " && inclusionstr[v + 1] == " " && inclusionstr[v + 2] != "-" && inclusionstr[v - 1] != "e" && inclusionstr[v - 1] != "g") {
                            indices.push(v + 2);
                            period = true;
                        }
                    }

                    var st = 0;
                    var et = 0;
                    for (var i = 0, len = indices.length; i < len; i++) {
                        st = indices[i];
                        et = indices[i + 1];

                        if (typeof et === 'undefined')
                            et = inclusionstr.length;
                        else {
                            if (period) {
                                et = et - 3;
                            } else
                                et = et - 2;
                        }

                        if (inclusionstr.substring(st, et) != '')
                            inclusionstr_final += '• ' + inclusionstr.substring(st, et) + '\n\n';
                    }
                    //console.log(inclusionstr_final);
                } else
                    inclusionstr_final = 'N/A';

                if (ic_e != -1) {
                    //******* EXCLUSION ***********************************
                    var exclusionstr = str.substring(ic_e, str.length);
                    //console.log("Exclusionstr: " + exclusionstr);


                    indices = [];
                    period = false;
                    for (var v = 0, len = exclusionstr.length; v < len; v++) {
                        if (exclusionstr[v] == "-" && exclusionstr[v + 2] != "-" && exclusionstr[v - 1] == " ") {
                            indices.push(v + 1);
                            period = false;
                        } else if (exclusionstr[v] == "." && exclusionstr[v + 1] == " " && exclusionstr[v + 2] != "-" && exclusionstr[v - 1] != "e" && exclusionstr[v - 1] != "g") {
                            indices.push(v + 2);
                            period = true;
                        } else if (exclusionstr[v] == ")" && exclusionstr[v - 2] == " " && exclusionstr[v + 1] == " " && exclusionstr[v + 2] != "-" && exclusionstr[v - 1] != "e" && exclusionstr[v - 1] != "g") {
                            indices.push(v + 2);
                            period = true;
                        }
                    }

                    var st = 0;
                    et = 0;
                    for (var i = 0, len = indices.length; i < len; i++) {
                        st = indices[i];
                        et = indices[i + 1];

                        if (typeof et === 'undefined')
                            et = exclusionstr.length;
                        else {
                            if (period) {
                                et = et - 3;
                            } else
                                et = et - 1;
                        }

                        if (exclusionstr.substring(st, et) != '')
                            exclusionstr_final += '• ' + exclusionstr.substring(st, et) + '\n\n';
                    }
                    //console.log(exclusionstr_final);
                } else
                    exclusionstr_final = 'N/A';

                indices = [];
                indices.push(inclusionstr_final);
                indices.push(exclusionstr_final);

                return indices;
            }


            var data = {};
            data.context = oEvent.getSource().getBindingContext();
            var selectedIndex = data.context.sPath.split("/")[4];

            var nct_id = data.context.oModel.oData.modelData[0].results[selectedIndex].id_info.nct_id;
            wasteTime();

            var position = '';

            var oModel = new sap.ui.model.json.JSONModel();

            var oGModel = sap.ui.getCore().getModel();
			console.log(oGModel);
            var lat = oGModel.oData.UserLoc[0].split(";")[0];
            var lng = oGModel.oData.UserLoc[0].split(";")[1];


            var this_ = this;

            $.ajax({
                type: 'GET',
                async: true,
                cache: true,
                url: "/nodejs?q=2&nctid=" + nct_id + "&lat=" + lat + "&lng=" + lng,
                timeout: 600000,
                dataType: "json",
                contentType: "application/json; charset=utf-8",

                success: function(data) {
                    if (data.results.length > 0) {
                        runNext();
                        console.log(data);

                        var id_info = data.results[0].id_info;
                        var url = data.results[0].url;
                        var brief_title = data.results[0].brief_title;
                        var official_title = data.results[0].official_title;
                        var brief_summary = data.results[0].brief_summary;
                        var location_countries = data.results[0].location_countries;

                        var overall_contact = data.results[0].overall_contact;

                        var eligibility = data.results[0].eligibility;
                        var criteria = genCriteria(data.results[0].eligibility.criteria.textblock);
                        var inclusioncriteria = criteria[0];
                        var exclusioncriteria = criteria[1];
                        //console.log(inclusioncriteria);
                        //console.log(exclusioncriteria);				

                        var intervention = data.results[0].intervention;
                        if (!Array.isArray(intervention)) {
                            var interventionarray = [];
                            interventionarray.push(intervention);
                            intervention = interventionarray;
                        }

                        var condition = data.results[0].condition;
                        if (!Array.isArray(condition)) {
                            var conditionarray = [];
                            conditionarray.push(condition);
                            condition = conditionarray;
                        }

                        var phase = data.results[0].phase;
                        var overall_status = data.results[0].overall_status;

                        var location = data.results[0].location;
                        var Spots = data.Spots;
                        var centerposition = data.results[0].centerposition;


                        var obj = [{
                            id_info: id_info,
                            url: url,
                            brief_title: brief_title,
                            official_title: official_title,
                            brief_summary: brief_summary,
                            location_countries: location_countries,
                            overall_contact: overall_contact,
                            eligibility: eligibility,
                            inclusioncriteria: inclusioncriteria,
                            exclusioncriteria: exclusioncriteria,
                            intervention: intervention,
                            condition: condition,
                            phase: phase,
                            overall_status: overall_status,
                            location: location,
                            Spots: Spots,
                            centerposition: centerposition
                        }];
                        console.log(obj);

                        oModel.setData({
                            modelData1: obj
                        });

                        sap.ui.getCore().setModel(oModel, "DModel");
                        this_.onNavButtonTo();

                    } else {
                        jQuery.sap.require("sap.m.MessageBox");
                        sap.m.MessageBox.show(jQuery.sap.resources({
                            url: "i18n/i18n.properties"
                        }).getText("NO_INFO"), {
                            icon: sap.m.MessageBox.Icon.INFORMATION,
                            title: "{i18n>WELCOME_TITLE}",
                            actions: sap.m.MessageBox.Action.OK,
                            onClose: null,
                            //styleClass: ""                        
                        });
                    }

                },
                error: function(jqXHR, textStatus, errorThrown) {
                    runNext();
                    if (errorThrown == '')
                        errorThrown = 'Cannot connect to the backend';
                    jQuery.sap.require("sap.m.MessageBox");
                    sap.m.MessageBox.show(errorThrown, {
                        icon: sap.m.MessageBox.Icon.INFORMATION,
                        title: "{i18n>WELCOME_TITLE}",
                        actions: sap.m.MessageBox.Action.OK,
                        onClose: null,
                        //styleClass: ""                        
                    });
                }
            });
        },

        deleteNCTOnPress: function(oEvent) {
            jQuery.sap.require("jquery.sap.storage");
            var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);

            this.oList = this.getView().byId("polist");
            var items = this.oList.getSelectedItems();

            var add = true;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var context = item.getBindingContext();
                var obj = context.getProperty("id_info");
                var nctid = obj.nct_id;

                console.log(nctid);

                var storage = oStorage.get('NCTID');
                if (storage == null)
                    storage = "";

                var stripped = storage.split(nctid).join('');
                var strippedf = '';

                for (var j = 0; j < stripped.length; j++) {
                    add = true;

                    if (stripped[j] == ",") {
                        if (stripped[j + 1] == ",")
                            add = false;
                    }

                    if (add)
                        strippedf += stripped[j];
                }

                if (strippedf.charAt(0) == ',')
                    strippedf = strippedf.substring(1, strippedf.length);
                if (strippedf.charAt(strippedf.length - 1) == ',')
                    strippedf = strippedf.substring(0, strippedf.length - 1);

                if (strippedf == "") 
                    oStorage.clear();
                else 
                    oStorage.put('NCTID', strippedf);
            }

            if (oStorage.get('NCTID') == null) {
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({});
                this.getView().setModel(oModel)
            } else {
                var this_ = this;

                $.ajax({
                    type: 'GET',
                    async: true,
                    cache: true,
                    url: "/nodejs?q=6&nctnumbers=" + oStorage.get('NCTID'),
                    timeout: 600000,
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",

                    success: function(data) {
                        if (data.results.length > 0) {
                            console.log(data);

                            var oModel = new sap.ui.model.json.JSONModel();
                            oModel.setData({});
                            oModel.setData({
                                modelData: [data],
                                //UserLoc: [lat + ';' + lng],
                                //cond: [toTitleCase(cond)]
                            });
                            //sap.ui.getCore().setModel(oModel);
                            this_.getView().setModel(oModel);
                        }

                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        if (errorThrown == '')
                            errorThrown = 'Cannot connect to the backend';
                        jQuery.sap.require("sap.m.MessageBox");
                        sap.m.MessageBox.show(errorThrown, {
                            icon: sap.m.MessageBox.Icon.INFORMATION,
                            title: "{i18n>WELCOME_TITLE}",
                            actions: sap.m.MessageBox.Action.OK,
                            onClose: null,
                            //styleClass: ""                        
                        });
                    }
                });
            }
        },

        clearNCTOnPress: function(oEvent) {
            this.getView().byId("polist").removeSelections();
        }
    });
});