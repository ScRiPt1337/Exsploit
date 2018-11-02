var anonymox = anonymox || {};
anonymox.Model = anonymox.Model || {};

anonymox.Model.Identities = (function () {
	// this model holds all information about identities.
	// it provides methods to check the currently active gateway, rate the gateways, order them by score,
	// get the best from the selected country and so on.

	var pub,
		config = anonymox.Configuration.Network;

	function init () {
		// not necessary
	};

	pub = {
		// list of all identies as array
		identities: undefined,

		refresh: function (callbackFn) {
			// fetch gateways over network

			console.log("anonymox.Model.Identities.refresh()");

			anonymox.Network.getGateways(function (identities) {
				pub.identities = identities;
				callbackFn();
			});
		},

		/*  -currently disabled, ... + needs changes for TLS
		selfCheckActiveGW: function (callbackFn) {
			// selfCheckActiveGW performs an ajax request through the active proxy (eg. active gateway).
			// if the server responds with "OK" we callback with true. if it doesn't, we remove the current
			// gateway from identies list and callback false.

			console.log("anonymox.Model.Identities.selfCheckActiveGW()");

			var self = this,
				activeGW = anonymox.Model.GlobalStorage.activeGW;
			
			if (!activeGW) {
				callbackFn(false);
				return false;
			}
			
			$.ajax(config.networkInfoURI + "selfcheck?gw=" + activeGW.ip + ":" + activeGW.port)
				.done(function (data) {
					if (data == "OK") {
						callbackFn(true);
					} else {
						self.removeIdentity(activeGW.ip, activeGW.port);
						callbackFn(false);
					}
				})
				.fail(function (error) {
					if (activeGW) {
						self.removeIdentity(activeGW.ip, activeGW.port);
					}

					callbackFn(false);
				});
		},*/

		rate: function () {
			// rate each identity based on usageScore, countryScore and lastGWScore.t he rating is necessary 
			// for `orderByScore` method below and the identity order that gets displayed in the view.

			var self = this;

			// loop through identites and calculate score for each
			this.identities.forEach(function (identity) {
				var usageScore = 0,
					countryScore = 0
					lastGWScore = 0;

				usageScore = (1 - identity.usageIndex / 100).toFixed(2);
				usageScore = isNaN(usageScore) ? 0.5 : usageScore;

				countryScore = identity.country == config.externalInfo.country ? 1 : 0;

				lastGWSore = self.lastGW == identity.id ? 1.5 : 0;

				identity.score = parseFloat(usageScore) +
					parseFloat(countryScore) +
					parseFloat(lastGWSore);

				identity.score = identity.score.toFixed(2);
			});
		},

		getBest: function () {
			// returns the best identity based on the score

			var best = this.identities[0];

			this.identities.forEach(function (identity) {
				if (identity.score > best.score) {
					best = identity;
				}
			});

			return best;
		},

		getBestFromCountry: function (country) {
			// returns the best identity in the currently selected country based on the score

			country = country || anonymox.Model.GlobalStorage.countryFilter || ".*";
			
			var best = {score: "0"},
				regex = new RegExp(country, "i"),
				match;

			this.identities.forEach(function (identity) {
				if (identity.country.match(regex)) {
					match = identity;

					if (match.score > best.score) {
						best = identity;
					}
				}
			});

			// bugifx: if no match was found, don't return best
			if (!match) {
				return false;
			}
			return best;
		},

		orderByScore: function () {
			// orders iddentities by their score

			if (!this.identities) {
				return false;
			}
			
			this.identities.sort(function (a, b) {
				if (a.score > b.score) {
					return -1;
				}

				if (a.score < b.score) {
					return 1;
				}

				return 0;
			});

			return this.identities;
		},

		removeIdentity: function (ip, port) {
			// removes an identity from the identites array

			var self = this;

			this.identities.forEach(function (identity, i) {
				if (identity.ip == ip && identity.port == port) {
					// remove matched identity from identites
					self.identities.splice(i, 1);
					return true;
				}
			});
		},

		getNextBest: function () {
			// gets the next best identity which is not the active gateway.
			// if there are no identites left to choose from, the `openSelfCheckFailedTab` method is called.

			console.log("anonymox.Model.Identities.getNextBest()");
			var self = this,
				gateway,
				activeGW = anonymox.Model.GlobalStorage.activeGW;

			if (this.identities.length <= 1) {
				// open selfcheckfailed tab only once
				if (!this.openedTab) {
					this.openedTab = true;
					anonymox.App.openSelfCheckFailedTab();
				}
				
				return false;
			}

			this.orderByScore();

			// because at this point identities are already ordered by their score,
			// we cen just iterate through them from top to bottom
			this.identities.forEach(function (identity) {
				if (!gateway && identity.ip != activeGW.ip && identity.port != activeGW.port) {
					gateway = identity;
				}
			});

			return gateway;
		}
	};

	init();

	return pub;
})();
