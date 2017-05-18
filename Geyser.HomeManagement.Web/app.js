(function () {
	//variables
	var _app = window.app = {};

	//private functions
	function onLoad() {
		console.log(appSettings.loadWelcomeLogMessage);
		Trump.init({ "prefix": "sal" });
		setupRoutes();
		setAjaxDefaultHeader({ "API-Key": app.apiKey });
	}
	function setupRoutes() {
		//SAL.Router.addRoute(/^Login(\/)?$/i,
		//	[{
		//		"type": "script",
		//		"id": "scriptLogin",
		//		"url": "Pages/Login/login.js"
		//	},
		//	{
		//		"type": "template",
		//		"id": "tmplLogin",
		//		"url": "Pages/Login/login.tmpl"
		//	}],
		//	function (e) { Geyser.HomeManagement.App.Login.init(e); },
		//	function () { Geyser.HomeManagement.App.Login.onExit(); }
		//);
		SAL.Router.addRoute(/^Home(\/)?$/i,
			[{
				"type": "script",
				"id": "scriptHome",
				"url": "Pages/Home/home.js"
			},
			{
				"type": "template",
				"id": "tmplHome",
				"url": "Pages/Home/home.tmpl"
				},
			{
				"type": "teplate",
				"id": "tmplHomeMessage",
				"url": "Pages/Home/homeMessage.tmpl"
			}
			],
			function (e) { Geyser.HomeManagement.App.Home.init(e); },
			function () { Geyser.HomeManagement.App.Home.onExit(); }
		);

		SAL.Router.init();

		var currentHash = window.location.hash;
		if (window.appSettings.defaultHashRoute && (currentHash === "" || currentHash === "#")) {
			window.location.hash = "#" + window.appSettings.defaultHashRoute;
		}
	}

	function initJSErrorHandling() {
		window.onerror = function (msg, url, line, column, errorObj) {
			var LS_KEY = "_JS_ERR";
			var localStorageJSErrCache;
			var errStack = (function () {
				if (errorObj && errorObj.stack) { //Chrome, and possibly other browsers
					return errorObj.stack;
				} else if (arguments && arguments.callee && arguments.callee.caller) { //IE <9
					var callerFn = arguments.callee.caller;
					var stack = [];

					while (callerFn) {
						stack.push(callerFn.name);
						callerFn = callerFn.caller;
					}

					return stack.length > 0 ? stack.join(", ") : "";
				}
			})();
			//var getUserDetails = function () {
			//	if (!SAL.Storage) {
			//		return "";
			//	}

			//	var userDetails = SAL.Storage.retrieve(SAL.Storage.keys.userSettings);
			//	var details = "";

			//	if (userDetails && userDetails.contactID) {
			//		details += "\nContact ID: " + userDetails.contactID;
			//	}

			//	return details;
			//};
			var logMessage = "ScriptError: " + msg
				+ "\nUrl: " + url
				+ "\nLine: " + line
				+ "\nColumn: " + column
				+ "\nStack: " + errStack
				+ "\nFull Url: " + window.location.href
				+ "\nIs App: " + window.app.isApp
				+ "\nVersion: " + window.app.version;
			//+ getUserDetails();

			if (window.dataLayer) {
				window.dataLayer.exception(logMessage, true);
			}

			localStorageJSErrCache = localStorage.getItem(LS_KEY);
			localStorage.removeItem(LS_KEY);
			localStorageJSErrCache = localStorageJSErrCache ? JSON.parse(localStorageJSErrCache) : [];
			localStorageJSErrCache.push(logMessage);
			$.ajax({
				"type": "POST",
				"contentType": "application/json",
				"url": app.servicePath + "Exception/Log",
				"data": JSON.stringify({ "exceptions": localStorageJSErrCache }),
				"error": function (jqXHR, status, errorMessage) {
					var newJSErrCache = localStorage.getItem(LS_KEY);

					newJSErrCache = newJSErrCache ? JSON.parse(newJSErrCache) : [];
					localStorageJSErrCache.concat(newJSErrCache);
					localStorage.setItem(LS_KEY, JSON.stringify(localStorageJSErrCache));
				}
			});
			return false;
		};
	}
	function getMainBody() {
		return $("#body");
	}
	function setAjaxDefaultHeader(header) {
		$.ajaxSetup({ "headers": header });
	}

	//public functions
	_app.onLoad = onLoad;
	_app.getMainBody = getMainBody;
})();