var anonymox = anonymox || {};
anonymox.View = anonymox.View || {};

anonymox.View.Identities = (function () {
	// this view mainly controls the identities widget. it's neccessary to also take action on changes
	// made by the dropdown widget, therefore we also watch out for this.

	var identitiesEl = document.getElementById("identities"),
		dropdownEl = document.querySelector(".dropdown"),
		model = anonymox.Model.Identities;

	(function checkIfStarted () {
		// check for `anonymox.App.started` before calling init();
		// this is neccessary because only after it started we have model information and so on.

		if (!anonymox.App.started) {
			setTimeout(checkIfStarted, 100);
		} else {
			if (anonymox.App.connectionSuccess) {
				init();
			}
			return;
		}
	})();

	function init () {
		// populate view and vind event handlers
		populateView();
		bindEvents();
	};

	function populateView () {
		// populate the widgets with elements

		console.log("anonymox.View.Identities.populateView()");

		// call populateIdentities() and use returned countries
		var countries = populateIdentities();

		// add each country do dropdown widget
		for (var country in countries) {
			dropdownEl.observer.add("design/skin/flags/" + country + ".png", countries[country]);
		}

		// set current dropdown element based on countryFilter
		dropdownEl.observer.setCurrentEl(anonymox.Model.GlobalStorage.countryFilter);
	};

	function populateIdentities () {
		// populate identity widget with items

		console.log("populateIdentities()");

		var countries = {};

		// destroy first
		identitiesEl.observer.destroy();

		// iterate over identites array and fill countries object with countries from each identity
		model.identities.forEach(function (identity) {
			if (!countries[identity.country]) {
				countries[identity.country] = identity.country.toUpperCase();
			}
			identitiesEl.observer.add(identity.id, (identity.tls ? identity.tlsHostname : identity.ip) + ":" + identity.port + ":" + identity.tls);
		});

		// filter by countryFilter
		identitiesEl.observer.filterBy(anonymox.Model.GlobalStorage.countryFilter);

		// get currently active proxy and set is as active identity
		anonymox.Network.getActiveProxy(function (data) {
			if (data) {
				identitiesEl.observer.setActiveByIp(data.ip + ":" + data.port + ":" + data.tls);
				
				// scroll to selected identity
				identitiesEl.observer.scrollToSelected();
			}
		});

		return countries;
	};

	function bindEvents () {
		// bind all event handlers

		dropdownEl.observer.onChange(function (value) {
			// on drodown change ..
			var gateway;

			if (value == "Alle" || value == "All") {
				value = ".*";
			}
			
			// .. filter identity by country
			identitiesEl.observer.filterBy(value);
			
			// .. save countryFilter in global model
			anonymox.Model.GlobalStorage.countryFilter = value;
			anonymox.Model.GlobalStorage.save("anonymox.View.Identities::bindEvents::dropdownEl.observer.onChange");

			// .. get best gateway for current country, set as proxy and setActive in identites widget
			gateway = model.getBestFromCountry(value);
			anonymox.Network.setProxy(gateway.tls ? gateway.tlsHostname : gateway.ip, gateway.port, gateway.tls);
			identitiesEl.observer.setActiveByIp((gateway.tls ? gateway.tlsHostname : gateway.ip) + ":" + gateway.port + ":" + gateway.tls);
		});

		identitiesEl.observer.onChange(function (_ip) {
			// on change of identity

			var ip = _ip.split(":")[0],
				port = Number(_ip.split(":")[1]),
				tls =  _ip.split(":")[2] == 'true';

			console.log("setting proxy " + ip + " " + port + " " + tls);
			// set proxy to selected identitiy
			anonymox.Network.setProxy(ip, port, tls);
			
			// we disable self-check for now
			// // selfcheck the selected gateway in background, callback for UI changes
			// anonymox.Model.Identities.selfCheckActiveGW(function (isOK) {
			// 	if (!isOK) {
			// 		// if selfcheck failed ..

			// 		// .. display message that selected proxy is offline
			// 		anonymox.Model.Messages.add(chrome.i18n.getMessage("Selected_proxy_offline"));

			// 		// anonymox.Model.Identities.selfCheckActiveGW removes identity if it's offline
			// 		// therefore we need to re-draw the identites element
			// 		populateIdentities();

			// 		// if all identites have been removed and a countryfilter is active,
			// 		// change to countryfilter == all and select new identity
			// 		if (anonymox.Model.GlobalStorage.countryFilter !== ".*" && identitiesEl.observer.visibleLength() === 0) {
			// 			// remove currently selected country and select All
			// 			dropdownEl.observer.removeEl(anonymox.Model.GlobalStorage.countryFilter);
			// 			dropdownEl.observer.setCurrentEl(".*");

			// 			// display warning message
			// 			anonymox.Model.Messages.add(chrome.i18n.getMessage("no_more_proxies_for_country"));
			// 		}
			// 	}
			// });
		});

		setInterval(function () {
			// constantly poll `isProxyActive`. if it's inactive, clearSelected identitiy
			anonymox.Network.isProxyActive(function (yes) {
				if (!yes) {
					identitiesEl.observer.clearSelected();
				}
			});
		}, 20);
	};

})();
