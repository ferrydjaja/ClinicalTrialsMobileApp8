sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    return Controller.extend("ClinicalTrials.ClinicalTrials.controller.Main", {

        onInit: function(evt) {
            var oModelMenuTiles = this.getOwnerComponent().getModel("MenuTilesModel");
            this.getView().byId("menutilescontainerAS").setModel(oModelMenuTiles);
        },

        handlePress: function(oEvent) {
            var sPath = oEvent.getSource().getBindingContext().getPath();
			var oModel = this.getView().byId("menutilescontainerAS").getModel();
			var oContext = oModel.getProperty(sPath);
			console.log(oContext);
			if(oContext.contenttext == "Search Condition")
				this.onNavToFeedback();

			if(oContext.contenttext == "Favorites")
				this.onNavToFavorite();
        },

		onNavToFeedback: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("feedback", true);
		},
		
		onNavToFavorite: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("favorite", true);
		},
    });
});