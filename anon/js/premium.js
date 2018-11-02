var anonymox = anonymox || {};

anonymox.Premium = (function () {
	// this object registers a listener function for message passing and provides a activate method
	// to activate premium for the current user.

	function init () {
		// regirster listener for message passing.
		// message passing is done from js/contentscript/premiumlistener.js
		chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
			if (request.param1) {
				anonymox.Premium.activate(request.param1, function () {});
			}
		});
	};

	init();

	return {
		activate: function (code, callbackFn) {
			// activate premium. display alert messages if activation was successful or had an error.

			anonymox.Network.activatePremium(code, function success () {
				anonymox.Configuration.isPremium = true;
				
				anonymox.Network.isProxyActive(function (yes) {
					if (yes) {
						anonymox.App.changeIcon('premium');
					} else {
						anonymox.App.changeIcon('premium-off');
					}
				});

				// refresh gateways after activation
				anonymox.Model.Identities.refresh(function () {
					// rate and sort
					anonymox.Model.Identities.rate();
					anonymox.Model.Identities.orderByScore();

					anonymox.App.periodicCheck();
					callbackFn(true);
					alert(chrome.i18n.getMessage("premium_was_activated"));
				});
			},
			function error (error) {
				callbackFn(false);

				if (!error) {
					// network problem
					console.warn("anonymox.Premium.activate() -> a network problem occured!");
					alert(chrome.i18n.getMessage("premium_network_error"));
				}

				if (error && error.xmessage) {
					// internal problem or wrong code. display xmessage
					alert(chrome.i18n.getMessage("premium_activate_error") + "\n\n" + error.xmessage);
				}
			});
		},
		deactivate: function () {
			anonymox.Configuration.isPremium = false;
			
			anonymox.Network.isProxyActive(function (yes) {
				if (yes) {
					anonymox.App.changeIcon('on');
				} else {
					anonymox.App.changeIcon('off');
				}
			});

			// refresh gateways after deactivation
			anonymox.Model.Identities.refresh(function () {
				// rate and sort
				anonymox.Model.Identities.rate();
				anonymox.Model.Identities.orderByScore();

				anonymox.App.periodicCheck();
				alert(chrome.i18n.getMessage("premium_was_deactivated"));
			});
		}
	};
})();