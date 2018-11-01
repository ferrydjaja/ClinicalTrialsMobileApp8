sap.ui.define(function() {
	"use strict";

	var Formatter = {

		status :  function (sStatus) {

				if (sStatus === "Completed") {
					return "Success";
				} else if (sStatus === "Terminated") {
					return "Error";
				} else if (sStatus === "Unknown status"){
					return "Warning";
				} else {
					return "None";
				}
		}
	};

	return Formatter;

}, /* bExport= */ true);