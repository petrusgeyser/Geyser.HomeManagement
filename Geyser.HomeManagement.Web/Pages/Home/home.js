(function () {
	var _page = {};
	var _objectContext;
	var _state = {
		"header": "Home sweettttt",
		"bodyMessages": ["This is my body message"],
		"now": new Date()
	};

	//private functions
	function init(e) {
		console.log("home initialised", e);
		_objectContext = Trump.applyToDOM("body", "tmplHome", {
			"data": _state,
			"eventHandlers": {
				"clock_click": clock_click,
				"clock_mouseover": clock_mouseover
			}
		});
		//setInterval(function () {
		//	_state.now = new Date();
		//	_objectContext.update({ "data": _state });
		//}, 500);
		app.getMainBody().html(_objectContext);

	}
	function onExit() {
		console.log("home exit");
	}
	function clock_click(e) {
		console.log("Clock has been clicked");
		_state = {
			"header": "Home sweettttt",
			"bodyMessages": ["This is my body message"],
			"now": new Date()
		};
		this.update({ "data": _state });
	}
	function clock_mouseover(e) {
		console.log("Clock has been moused");
	}

	//public functions
	_page.init = init;
	_page.onExit = onExit;

	//code
	SAL.Utility.initNamespace("Geyser.HomeManagement.App.Home");
	Geyser.HomeManagement.App.Home = _page;
})();