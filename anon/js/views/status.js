var anonymox = anonymox || {};
anonymox.View = anonymox.View || {};

anonymox.View.Status = (function () {
	// this view is responsible for the on/off switcher element.
	// it constantly polls `anonymox.Network.isProxyActive` to change accordingly

	var checkbox = document.getElementById("status"),
		label = document.getElementById("status-label"),
		identitiesEl = document.getElementById("identities");

	function init () {
		bindEvents();
		setTimeout(function () {
			label.className = "animated";
		}, 200);
	};

	(function checkIfStarted () {
		// check for `anonymox.App.started` before calling init(). we don't init before that.

		if (!anonymox.App.started) {
			setTimeout(checkIfStarted, 100);
		} else {
			init();
			return;
		}
	})();

	function bindEvents() {
		// listen for mousedown on label. if proxy is active, disable it. if it's disabled, enable it.
		label.addEventListener("mousedown", function () {
			anonymox.Network.isProxyActive(function (yes) {
				if (yes) {
					anonymox.Network.disableProxy();
				} else {
					anonymox.Network.enableProxy();
					anonymox.Network.getActiveProxy(function (data) {
						if (data) {
							identitiesEl.observer.setActiveByIp(data.ip + ":" + data.port + ":" + data.tls);
						}
					})
				}	
			});
		});

		setInterval(function () {
			// constantly poll `isProxyActive` and set checkbox accordingly
			anonymox.Network.isProxyActive(function (bool) {
				checkbox.checked = bool;
			});
		}, 20);
	};

	return {};
})();
