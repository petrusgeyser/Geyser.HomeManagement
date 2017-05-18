// Written by the People of Sandfield
// 1.0.0.0

(function () {
	"use strict";

	// PRIVATE FUNCTIONS
	
	// CREATES NESTED OBJECTS ALL THE WAY DOWN IF DON'T EXIST, E.G. window.SAL.SPA.Pages.Home, OMIT BASE TO TACK ON TO WINDOW.
	function createNestedObject(names, context) {
		if (!context) {
			context = window;
		}

		if (typeof(names) == "string") {
			names = names.split(".");
		}

		for (var i = 0; i < names.length; i++) {
			context = context[names[i]] = context[names[i]] || {};
		}
	}

	// PUBLIC FUNCTIONS
	
	// CODE
	window.SAL = window.SAL || {};
	window.SAL.Utility = window.SAL.Utility || {};
	window.SAL.Utility.initNamespace = createNestedObject;
	window.SAL.Utility.createNestedObject = createNestedObject;

})();