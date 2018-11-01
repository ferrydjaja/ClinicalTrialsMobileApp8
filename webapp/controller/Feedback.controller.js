sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    return Controller.extend("ClinicalTrials.ClinicalTrials.controller.Feedback", {
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

            /*this below code for get the JSON Model form Manifest.json file*/
			var this_ = this;
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			function debounce(func, wait, immediate) {
                var timeout;
                return function() {
                    var context = this,
                        args = arguments;
                    var later = function() {
                        timeout = null;
                        if (!immediate) func.apply(context, args);
                    };
                    var callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) func.apply(context, args);
                };
            };
            
            var oSelectConditionAS = this.getView().byId("selectConditionAS");
            oSelectConditionAS.attachLiveChange(debounce(function() {
              
                var searchkey = oSelectConditionAS.getValue();

				var jModel = new sap.ui.model.json.JSONModel();
				jModel.loadData("/nodejs?q=3", {
					"cond": searchkey
				}, false);
                this_.getView().byId("selectConditionAS").setModel(jModel);			
				this_.getView().byId("selectConditionAS").bindAggregation("suggestionItems", {
					path: "/",
                    template: new sap.ui.core.Item({
						text: "{}"
                    })
                });
            }, 500));

			var oSelectLocationAS = this.getView().byId("selectLocationAS");
			oSelectLocationAS.attachLiveChange(debounce(function() {

				var searchkey = oSelectLocationAS.getValue();

				var jModel = new sap.ui.model.json.JSONModel();
				jModel.loadData("/nodejs?q=4", {
					"input": searchkey
				}, false);
                this_.getView().byId("selectLocationAS").setModel(jModel);
				this_.getView().byId("selectLocationAS").bindAggregation("suggestionItems", {
					path: "/predictions",
                    template: new sap.ui.core.Item({
						text: "{description}"
                    })
                });

			}, 500));

			var oModelSponsor = this.getOwnerComponent().getModel("SponsorModel");
            this.getView().byId("selectSponsorAS").setModel(oModelSponsor);

            var oModelTrialStatus = this.getOwnerComponent().getModel("TrialStatusModel");
            this.getView().byId("selectTrialStatusAS").setModel(oModelTrialStatus);

            var oRootPath = jQuery.sap.getModulePath("ClinicalTrials.ClinicalTrials"); // your resource root
            var oImageModel = new sap.ui.model.json.JSONModel({
                path : oRootPath,
            });
                    
            this.getView().setModel(oImageModel, "imageModel");
        },

        onAfterRendering: function() {	   
		    var ConditionIconCancel = this.getView().byId("selectConditionAS")._getValueHelpIcon();
		    ConditionIconCancel.setSrc("sap-icon://sys-cancel");
		    ConditionIconCancel.setSize('1.25rem');

		    var TermsIconCancel = this.getView().byId("selectTermsAS")._getValueHelpIcon();
		    TermsIconCancel.setSrc("sap-icon://sys-cancel");
		    TermsIconCancel.setSize('1.25rem');

			var LocationIconCancel = this.getView().byId("selectLocationAS")._getValueHelpIcon();
		    LocationIconCancel.setSrc("sap-icon://sys-cancel");
		    LocationIconCancel.setSize('1.25rem');
	  	},

	  	ConditionValueHelpRequest: function(){
	  		this.getView().byId("selectConditionAS").setValue();
  		},

		TermsValueHelpRequest: function(){
	  		this.getView().byId("selectTermsAS").setValue();
  		},

  		LocationValueHelpRequest: function(){
	  		this.getView().byId("selectLocationAS").setValue();
  		},

		onSelectSponsorChange: function(oEvent) {},
      
        onSelectTrialStatusChange: function(oEvent) {},

        _onRadioButtonGroupSelect: function() {

        },

		onNavButtonTo: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("list", true);
		},

		NavBack: function(oEvent) {
			console.log("adaada");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("home", true);
        },
		
        onButtonPress1: function(oEvent) {
            navigator.geolocation.getCurrentPosition(this.onGeoSuccess.bind(this), this.onGeoError.bind(this), {
                enableHighAccuracy: true, timeout: 2000, maximumAge: 0
            });
        },


        //onGeoSuccess: function(position) {
        onButtonPress: function() {
            var lat = '';
            var lng = '';

            //var lat = position.coords.latitude;
            //var lng = position.coords.longitude;
            //var alt = position.coords.altitude;

            this.onProcess(lat, lng);
        },

        onCancelButtonPress: function() {
        	this.getView().byId("selectConditionAS").setValue();
			this.getView().byId("selectTermsAS").setValue();
        	this.getView().byId("selectLocationAS").setValue();
        	this.getView().byId("selectSponsorAS").setSelectedKey(0);
        	this.getView().byId("selectGenderAS").setSelectedIndex(0);
        	this.getView().byId("selectAgeAS").setSelectedIndex(0);
        	this.getView().byId("selectTrialStatusAS").setSelectedKey(0);
        },

        onGeoError: function() {
            var lat = '';
            var lng = '';
            this.onProcess(lat, lng);
        },

        onProcess: function(lat, lng) {
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

            function toTitleCase(str) {
                return str.replace(/\w\S*/g, function(txt){
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            }

            var cond = this.getView().byId("selectConditionAS").getValue().trim();
			var term = this.getView().byId("selectTermsAS").getValue().trim();
            var location = this.getView().byId("selectLocationAS").getValue().trim();
            var gndr = this.getView().byId("selectGenderAS").getSelectedIndex();
            var gndrAr = ['All', 'Male', 'Female'];
            gndr = gndrAr[gndr];
			var lead = this.getView().byId("selectSponsorAS").getSelectedKey().trim();
            var recrs = this.getView().byId("selectTrialStatusAS").getSelectedKey().trim();
            var age = this.getView().byId("selectAgeAS").getSelectedIndex();
            var ageAr = ['', '0', '1', '2'];
            age = ageAr[age];		
            var dist = 10676;
			var cntry = "";
			var state = ""; 
			var city = "";

            if (cond.length > 0) {
                wasteTime();
                var this_ = this;

				$.ajax({
                    type: 'GET',
                    async: true,
                    cache: true,
                    dataType: "json",
                    timeout: 600000, 
                    contentType: "application/json; charset=utf-8",
                    url: "/nodejs?q=5&location=" + location,
                    success: function(data) {

						var proceed = true;
						if(data.status == 'OK') {
							for (var v = 0, len = data.results[0].address_components.length; v < len; v++) {
								var type = data.results[0].address_components[v].types;
								if(type.includes("locality"))
									city = data.results[0].address_components[v].short_name;

								if(type.includes("administrative_area_level_1"))
									state = data.results[0].address_components[v].short_name;

								if(type.includes("country"))
									cntry = data.results[0].address_components[v].short_name;
							}

							if(typeof state === "undefined") 
								state = "";
							else {
								if(cntry == "US" && state != "")
									state = "US:" + state;
							}

							if(typeof city === "undefined") 
								city = "";

						} else if (data.status == 'ZERO_RESULTS') {
							runNext();
							jQuery.sap.require("sap.m.MessageBox");
							sap.m.MessageBox.show(jQuery.sap.resources({
								url: "i18n/i18n.properties"
								}).getText("LOCATION_ERR"), {
									icon: sap.m.MessageBox.Icon.INFORMATION,
									title: "{i18n>WELCOME_TITLE}",
									actions: sap.m.MessageBox.Action.OK,
									onClose: null,
									//styleClass: ""                        
							});
							proceed = false;
						
						} 

						if(proceed) {
							console.log(cond + '|' + term + '|' + cntry + '|' + state + '|' + city + '|' + gndr + '|' + lead + '|' + recrs + '|' + age + '|' + dist + '|' + lat + '|' + lng);

							$.ajax({
								type: 'GET',
								async: true,
								cache: true,
								dataType: "json",
								timeout: 600000, 
								contentType: "application/json; charset=utf-8",
								url: "/nodejs?q=1&cond=" + cond + "&term=" + term + "&cntry=" + cntry + "&state=" + state + "&city=" + city + "&lead=" + lead + "&recrs=" + recrs + "&gndr=" + gndr + "&age=" + age + "&dist=" + dist + "&lat=" + lat + "&lng=" + lng,
								success: function(data) {
									console.log(data);

									if (JSON.stringify(data) != "{}") {
										console.log(data.results.length);

										if (data.results.length > 0) {
											runNext();

											var oModel = new sap.ui.model.json.JSONModel();
											oModel.setData({});
											oModel.setSizeLimit(999999);

											oModel.setData({
												modelData: [data],
												UserLoc: [lat + ';' + lng],
												cond: [toTitleCase(cond)]
											});
											sap.ui.getCore().setModel(oModel);
											this_.onNavButtonTo();

										} else {
											console.log('no record 2');
											runNext();
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
									} else {
										// No record {}
										console.log('no record 1');
										runNext();
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
									jQuery.sap.require("sap.m.MessageBox");
									sap.m.MessageBox.show(jQuery.sap.resources({
											url: "i18n/i18n.properties"
									}).getText("ERROR_INFO"), {
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
                    error: function(jqXHR, textStatus, errorThrown) {
                        runNext();
                        jQuery.sap.require("sap.m.MessageBox");
                        sap.m.MessageBox.show(jQuery.sap.resources({
                                url: "i18n/i18n.properties"
                        }).getText("ERROR_INFO"), {
                               icon: sap.m.MessageBox.Icon.INFORMATION,
                                title: "{i18n>WELCOME_TITLE}",
                                actions: sap.m.MessageBox.Action.OK,
                                onClose: null,
                                //styleClass: ""                        
                        });
                    }
                });
            } else {
                jQuery.sap.require("sap.m.MessageBox");
                sap.m.MessageBox.show(jQuery.sap.resources({
                    url: "i18n/i18n.properties"
                }).getText("VALID_KEYWORD"), {
                    icon: sap.m.MessageBox.Icon.INFORMATION,
                    title: "{i18n>WELCOME_TITLE}",
                    actions: sap.m.MessageBox.Action.OK,
                    onClose: null,
                    //styleClass: ""                        
                });
            }
        }
    });
});