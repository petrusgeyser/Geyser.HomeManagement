// Written by Phillip Moon
// 1.0.0.8 - PM
// Add changes to not invoke the exit function on SAL.Router.init

(function () {
	"use strict";
	var rtr = {};
	var loadedRequirements = {};
	var routes = [];
	var onAllRequirementsLoaded = function () { };
	var settings = { "url": "" };
	var currentHashBangUrl = "";
	var currentExitFn = function () { };
	var scrollOffset = {};
	var globalBeforeRouteChange = function () { return true; };
	var notFoundRoute;
	var urlState = { "oldURL": "", "newURL": "" };
	var pathMatchRegex = /^.*\#\!?(.*)$/;

	//private functions
	function onhashchange(e) {
		var requires, requiresLength;
		
		//IE BUG FIX
		urlState.oldURL = e.oldURL || urlState.newURL;
		urlState.newURL = e.newURL || window.location.hash;
		
		var route = findRoute(urlState.newURL);

		if (typeof(currentExitFn) == "function" && !e.isInit) {
			currentExitFn();
			currentExitFn = null;
		}

		if (!route) {
			if (notFoundRoute) {
				window.location.hash = notFoundRoute;
			}
			
			return false;
		}

		if (urlState.oldURL) {
			var oldHash = pathMatchRegex.exec(urlState.oldURL);

			if (oldHash && oldHash.length > 0) {
				scrollOffset[oldHash[1]] = document.body.scrollTop;
			}
		}

		onAllRequirementsLoaded = route.initFn;
		loadedRequirements = {};
		requires = route.requires;
		requiresLength = requires.length;
		currentExitFn = route.onExitFn;

		if (requiresLength == 0) {
			requirementLoaded("empty", route);
			return;
		}

		for (var i = 0; i < requiresLength; i++) { //MUST LOAD UP REQUIREMENTS BEFORE THE FETCH
			loadedRequirements[requires[i].id] = false;
		}

		for (i = 0; i < requiresLength; i++) {
			var require = requires[i];
			var rType = require.type;
			var rID = require.id;
			var rUrl = require.url;
			var rCacheBust = route.cacheBust;

			rUrl = rCacheBust == true ? addCacheBustingParam(rUrl) : rUrl

			if (document.getElementById(rID)) {
				requirementLoaded(rID, route);
				continue;
			}

			switch (rType.toUpperCase()) {
				case "TEMPLATE":
					getRequirement(rUrl, "text", true, (function (id) {
						return function (data) {
							var el = createEl("script", id, [{ key: "type", value: "text/template" }]);

							el.innerHTML = data;
							document.head.appendChild(el);
							requirementLoaded(id, route);
						}
					})(rID));
					break;
				case "SCRIPT":
					var el = createEl("script", rID, [{ key: "type", value: "text/javascript" }, { key: "src", value: settings.url + rUrl }]);

					el.onload = (function (id) { return function () { requirementLoaded(id, route); }; })(rID);
					document.head.appendChild(el);
					break;
				case "CSS":
					(function (currentID, currentUrl) {
						//http://thudjs.tumblr.com/post/637855087/stylesheet-onload-or-lack-thereof
						var el = createEl("link", currentID, [{ key: "rel", value: "stylesheet" }, { key: "type", value: "text/css" }, { key: "href", value: settings.url + currentUrl }]);
						var sheet, cssRules, intervalID, timeoutID;

						document.head.appendChild(el);

						// get the correct properties to check for depending on the browser
						if ("sheet" in el) {
							sheet = "sheet";
							cssRules = "cssRules";
						} else {
							sheet = "styleSheet";
							cssRules = "rules";
						}

						intervalID = setInterval(function () {
							try {
								if (el[sheet] && el[sheet][cssRules].length) { // SUCCESS! our style sheet has loaded
									clearInterval(intervalID); // clear the counters
									clearTimeout(timeoutID);
									requirementLoaded(currentID, route);
								}
							} catch (e) { }
						}, 25);
						timeoutID = setTimeout(function () { // start counting down till fail
							clearInterval(intervalID); // clear the counters
							clearTimeout(timeoutID);
							document.head.removeChild(el); // since the style sheet didn't load, remove the link node from the DOM
						}, 10000);
					})(rID, rUrl);
					break;
			}
		}
	};
	function findRoute(url) {
		var regexCheck = pathMatchRegex.exec(url);
		var hashRoute = currentHashBangUrl = regexCheck && regexCheck.length > 1 ? decodeURI(regexCheck[1]) : null;
		var matchedRoute = null;
		var routesLength = routes.length;
		var routeCheck, route;

		if (!hashRoute) {
			return null;
		}

		for (var i = 0; i < routesLength; i++) {
			route = routes[i];
			routeCheck = route.route;

			if (routeCheck instanceof RegExp && routeCheck.test(hashRoute)) {
				matchedRoute = route;
				break;
			}

			routeCheck.lastIndex = 0; //resets global (/g) check
		}

		return matchedRoute;
	};
	function getRequirement(url, dataType, cache, callback) {
		$.ajax({
			url: settings.url + url,
			dataType: dataType,
			cache: cache,
			success: callback,
			error: callback
		});
	};
	function requirementLoaded(id, route) {
		loadedRequirements[id] = true;

		for (var key in loadedRequirements) {
			if (!loadedRequirements[key]) {
				return false;
			}
		}

		var scrollTopOffset = scrollOffset[currentHashBangUrl] ? scrollOffset[currentHashBangUrl] : 0;
		var getUrlPathParts = function (path) {
			if (!path) {
				return [];
			}

			var slashStripped = /^\/?(.*)\/$|^\/?(.*)$/.exec(path);

			return (slashStripped[1] || slashStripped[2]).split("/");
		};
		var evtObj = {
			"route": route,
			"url": currentHashBangUrl,
			"path": getUrlPathParts(currentHashBangUrl),
			"scrollTopOffset": scrollTopOffset //GOING TO BE DEPRECATED IN NEXT VERSION 1.0.0.5
		};

		if (!globalBeforeRouteChange(evtObj)) {
			console.log("exiting route change");
			return false;
		}

		onAllRequirementsLoaded(evtObj);
		onAllRequirementsLoaded = function () { };
		return true;
	};
	function createEl(elementType, id, attributes) {
		var el = document.createElement(elementType);
		var attributesLength = attributes ? attributes.length : 0;

		el.id = id;

		for (var i = 0; i < attributesLength; i++) {
			var attribute = attributes[i]

			el.setAttribute(attribute.key, attribute.value);
		}

		return el;
	};
	function setSetting_keyValue(key, value) {
		settings[key] = value;
	};
	function setSetting_object(o) {
		for (var key in o) {
			settings[key] = o[key];
		}
	};
	function addCacheBustingParam(url) {
		var now = new Date();

		if (url.indexOf("?") == -1) {
			return url + "?" + now.getTime() + "=1";
		}

		return url + "&" + now.getTime() + "=1";
	};
	function addRoute(route, requires, initFn) {
		if (!route || !requires || !initFn) {
			return false;
		}

		return addRouteWithCacheBusting(route, requires, initFn, function () { }, false);
	};
	function addRouteWithExitFn(route, requires, initFn, exitFn) {
		if (!route || !requires || !initFn) {
			return false;
		}

		exitFn = exitFn ? exitFn : function () { };
		return addRouteWithCacheBusting(route, requires, initFn, exitFn, false);
	};
	function addRouteWithCacheBusting(route, requires, initFn, exitFn, cacheBust) {
		if (!route || !requires || !initFn) {
			return false;
		}

		exitFn = exitFn ? exitFn : function () { };
		routes.push({ "route": route, "requires": requires, "initFn": initFn, "onExitFn": exitFn, "cacheBust": cacheBust });
		return true;
	};
	function addRouteFromObject(obj) {
		return addRouteWithCacheBusting(
			obj.route,
			obj.requires, 
			obj.initFn, 
			obj.exitFn, 
			obj.cacheBust);
	}
	
	//public functions
	rtr.getSetting = function (key) {
		return settings[key];
	};
	rtr.getSettings = function () {
		return settings;
	};
	rtr.init = function (requirementsBasePathUrl, options) {
		if (requirementsBasePathUrl) {
			settings.url = requirementsBasePathUrl;
		}

		if (options) {
			if (options.beforeRouteChange && typeof options.beforeRouteChange == "function") {
				globalBeforeRouteChange = options.beforeRouteChange;
			}
			
			if (options.notFoundRoute) {
				notFoundRoute = options.notFoundRoute;
			}
		}

		window.onhashchange = onhashchange;
		onhashchange({ "newURL": window.location.href, "isInit": true });
	};

	//code
	window.SAL = !window.SAL ? {} : window.SAL;
	window.SAL.Router = rtr;
	if (!window.addOverloadedMethod) {
		window.addOverloadedMethod = function (object, name, fn) { //JOHN RESIG JAVASCRIPT NINJA OVERLOADING
			var old = object[name];

			object[name] = function () {
				if (fn.length == arguments.length) {
					return fn.apply(this, arguments)
				} else if (typeof old == "function") {
					return old.apply(this, arguments);
				}
			};
		};
	};
	addOverloadedMethod(rtr, "setSetting", setSetting_keyValue);
	addOverloadedMethod(rtr, "setSetting", setSetting_object);
	addOverloadedMethod(rtr, "addRoute", addRoute);
	addOverloadedMethod(rtr, "addRoute", addRouteWithExitFn);
	addOverloadedMethod(rtr, "addRoute", addRouteWithCacheBusting);
	addOverloadedMethod(rtr, "addRoute", addRouteFromObject);
})();