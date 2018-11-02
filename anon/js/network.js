var anonymox = anonymox || {};
var com = {};

anonymox.Network = (function () {
	// this class bundles all network related functions. everything network related goes through here.

	var config = anonymox.Configuration.Network,
		transport = new Thrift.Transport(config.masterURI),
		protocol = new Thrift.Protocol(transport),
		client = new ClientServiceClient(protocol),
		proxyConfig = {
			mode : "fixed_servers", 
			rules : {
				proxyForHttps : {
					scheme: undefined,
					host: undefined,
					port: undefined
				},
				proxyForHttp : {
					scheme: undefined,
					host: undefined,
					port: undefined
				},
				proxyForFtp : {
					host: undefined,
					port: undefined
				},
				// bypass some sites and adresses #680
				bypassList: [
					"anonymox.net",
					"localhost",
					"fritz.box",
					"easy.box",
					"*.spotilocal.com",
					"127.0.0.1",
					"192.168.*.*",
					"10.0.0.0/8",
					"100.64.0.0/10",
					"172.16.0.0/12",
					"192.0.0.0/24",
					"192.168.0.0/16",
					"198.18.0.0/15"
				]
			}
		},
		requestCount = 0,
		errorUriShown = false;

	function getInfoTry (username, passwordPlain, callbackFn) {
		console.log("anonymox.Network.getInfo TRY", arguments);

		client.Info7(
			username,
			passwordPlain,
			anonymox.Configuration.version,
			anonymox.Configuration.locale,
			anonymox.Configuration.OS,
			function (data) {
				getInfoSuccess(data, callbackFn)
			}
		).error(
			// thrift 0.8 format
			function(error) {
				getInfoError(error, username, passwordPlain, callbackFn);
			}
		);
	};
	
	function openURI (url) {
		chrome.tabs.create(
			{'url': url},
			function (tab) {}
		);
	};

	function getInfoSuccess (data, callbackFn) {
		console.log("anonymox.Network.getInfo SUCCESS");

		if (data.showURL) {
			openURI(data.showURL);
		}

		anonymox.Configuration.Ads = data.adBoxInfo;

		// if currently premium but data.premium is false -> deactivate
		if (anonymox.Configuration.isPremium && data.premium == false) {
			anonymox.Premium.deactivate();
		}

		if (typeof callbackFn == "function") {
			callbackFn(data);
		}
	};

	function getInfoError (error, username, passwordPlain, callbackFn) {
		console.warn("anonymox.Network.getInfo ERROR");
		
		if (errorUriShown) return;
		
		// show error uri only when error.uri is set and url has not been shown
		if (error instanceof GenericException2 && error.uri)
		{
			console.log("anonymox.Network.getInfo no retry, due to error");
			openURI(error.uri);
			errorUriShown = true;
		}
		// otherwise retry
		else {
			console.log("anonymox.Network.getInfo Trying again in", anonymox.Configuration.networkTimeout);

			setTimeout(function () {
				getInfoTry(username, passwordPlain, callbackFn);
			}, anonymox.Configuration.networkTimeout);
		}
	};

	return {
		getInfo: function (username, passwordPlain) {
			// getInfo function can either get information with the credentials in anonymox.Model.Options
			// or check for credentials supplied in username and passwordPlain parameters.
			// it's important to notice the check for `data.showUrl`. this callback parameter may be set
			// by the server to display important pages like "premium status has run out".

			//errorCallbackFn = errorCallbackFn || errorFn;

			if (arguments.length > 2) {
				console.error("anonymox.Network.getInfo: expected 2 params (username, password). got:", arguments);
				//return false;
			}

			if (typeof username != "string" && typeof passwordPlain != "string") {
				var callbackFn = username;
				username = anonymox.Model.Options.username;
				passwordPlain = anonymox.Model.Options.passwordPlain;
			};

			getInfoTry(username, passwordPlain, callbackFn);
		},

		checkCredentials: function (username, passwordPlain, callbackFn) {
			// checkCredentials is a wrapper function for getInfo which checks if supplied credentials are valid.

			var successFn = function (data) {
					callbackFn(true, data.premium);
				};

			// we dont want to retry here so we call client.Info7 directly
			client.Info7(
				username,
				passwordPlain,
				anonymox.Configuration.version,
				anonymox.Configuration.locale,
				anonymox.Configuration.OS,
				successFn
			).error(function () {
				callbackFn(false);
			});
		},

		getAccount: function (callbackFn) {
			// getAccount gets account information from the server.
			// it is called the first time the extension is fired up and therefore has no user credentials

			console.log("anonymox.Network.getAccount TRY");

			client.GetAccount2(2, function (data) {
				console.log("anonymox.Network.getAccount SUCCESS");

				callbackFn(data.user, data.passwordPlain);
			}).error(function () {
				console.log("anonymox.Network.getAccount ERROR");
				console.log("anonymox.Network.getAccount Trying again in ", anonymox.Configuration.networkTimeout);

				setTimeout(function () {
					anonymox.Network.getAccount(callbackFn);
				}, anonymox.Configuration.networkTimeout);
			});
		},

		getGateways: function (callbackFn) {
			// getGateways is a wrapper for getInfo which only returnes the gateway information.

			if (arguments.length > 2) {
				console.error("anonymox.Network.getGateways: expected 1 param (callbackFn). got:", arguments);
				//return false;
			}
			this.getInfo(
				function (data) {
					callbackFn(data.gateways);
				}
			);
		},

		checkIfConnectionSuccess: function (callbackFn) {
			// checkIfConnectionSuccess is responsible for checking if the extension can connect
			// over the network. to do this we request the url below, and after thats done we make
			// a basic Info5 call to see if that also works.

			var self = this;
			
			self.disableProxy(true);

			$.ajax(config.networkInfoURI + "/selfcheck").done(function () {
				callbackFn(true);
			}).error(function () {
				callbackFn(false);
			});
		},

		isProxyActive: function (callbackFn) {
			// isProxyActive reports whether proxy is active or not by checking the `levelOfControl` detail

			chrome.proxy.settings.get({}, function (details) {

				if (details.levelOfControl == "controlled_by_this_extension") {
					callbackFn(true);
				} else {
					callbackFn(false);
				}
			});
		},

		saveProxyStatus: function (active) {
			// saves proxy status

			anonymox.Model.GlobalStorage.active = active;
			anonymox.Model.GlobalStorage.save();
		},
		
		setProxy: function (host, port, tls) {
			// setProxy sets proxyConfig, the active gateway to the models and registers the function that
			// supplies auth credentials whenever the proxy asks for them.

			console.log("anonymox.Network.setProxy() host, port, tls ", host, port, tls);
			
			// sets host and port for the various protocols
			var scheme = tls ? "https" : "http";
			proxyConfig.rules.proxyForHttps.host = host;
			proxyConfig.rules.proxyForHttps.port = port;
			proxyConfig.rules.proxyForHttps.scheme = scheme;
			proxyConfig.rules.proxyForHttp.host = host;
			proxyConfig.rules.proxyForHttp.port = port;
			proxyConfig.rules.proxyForHttp.scheme = scheme;
			proxyConfig.rules.proxyForFtp.host = host;
			proxyConfig.rules.proxyForFtp.port = port;
			proxyConfig.rules.proxyForFtp.scheme = scheme;
			
			
			anonymox.Model.GlobalStorage.activeGW = {"ip": host, "port": port, "tls": tls};
			this.saveProxyStatus(true);

			chrome.proxy.settings.set({value : proxyConfig, scope : 'regular'}, function() {});

			if (anonymox.Configuration.isPremium) {
				anonymox.App.changeIcon('premium');
			} else {
				anonymox.App.changeIcon('on');
			}

			// listen for requests
			chrome.webRequest.onCompleted.addListener(
				anonymox.Network.webRequestListener,
				{
					urls: ["<all_urls>"],
					types: ["main_frame"]
				}
			);
			
			// Activate credentials caching for later, issue #1194
			$.ajax(config.networkInfoURI + "ping").done(function (data) {});
		},

		enableProxy: function () {
			// enableProxy enables the proxy. if none was set before, we choose a new one. otherwise the old one is set.

			var gateway = anonymox.Model.Identities.getBestFromCountry(),
				changeIcon = function () {
					if (anonymox.Configuration.isPremium) {
						anonymox.App.changeIcon('premium');
					} else {
						anonymox.App.changeIcon('on');
					}
				};

			if (proxyConfig.rules.proxyForHttp.host && proxyConfig.rules.proxyForHttp.port) {
				this.setProxy(proxyConfig.rules.proxyForHttp.host, proxyConfig.rules.proxyForHttp.port, proxyConfig.rules.proxyForHttp.scheme == "https");
				this.saveProxyStatus(true);
				changeIcon();
			} else {
				if (gateway) {
					this.setProxy(gateway.tls ? gateway.tlsHostname : gateway.ip, gateway.port, gateway.tls);
					this.saveProxyStatus(true);
					changeIcon();
				} else {
					console.warn("anonymox.Network.enableProxy(): No gateway found, no proxy enabled!");
				}
			}
		},

		disableProxy: function (dontSave, callbackFn) {
			// disableProxy is disabling the proxy by clearing the proy settings.

			var changeIcon = function () {
					if (anonymox.Configuration.isPremium) {
						anonymox.App.changeIcon('premium-off');
					} else {
						anonymox.App.changeIcon('off');
					}
				};

			chrome.proxy.settings.clear({scope : 'regular'}, function () {
				anonymox.Model.GlobalStorage.activeGW = undefined;

				// bugfix: only save if dontSave is false or undefined
				if (!dontSave) {
					anonymox.Network.saveProxyStatus(false);
				}

				if (typeof callbackFn === "function") {
					callbackFn();
				}

				changeIcon();
			});

			chrome.webRequest.onCompleted.removeListener(anonymox.Network.webRequestListener);
		},

		getActiveProxy: function (callbackFn) {
			// getActiveProxy returns the currently active proxy if one is set. if none is set it returns false.

			this.isProxyActive(function (yes) {
				if (yes) {
					callbackFn({
						ip: proxyConfig.rules.proxyForHttp.host,
						port: proxyConfig.rules.proxyForHttp.port,
						tls: proxyConfig.rules.proxyForHttp.scheme == "https",
					});
				} else {
					callbackFn(false);
				}
			});
		},

		activatePremium: function (code, successFn, errorFn) {
			// activate Premium
			
			client.ActivatePremium(
				code,
				anonymox.Model.Options.username,
				anonymox.Model.Options.passwordPlain,
				config.languageID,
				successFn
			).error(errorFn);
		},

		webRequestListener: function (details) {
			// check if request does not go to google
			// call insertAds() pageChangesPerAd is reached
			
			// if the extension reloaded any tabs on startup -> decrement
			if (anonymox.App.tabsReloaded) {
				anonymox.App.tabsReloaded -= 1;
			}

			// do not listen if premium is enabled
			// do not listen if there are still tabs reloading
			if (anonymox.Configuration.isPremium || anonymox.App.tabsReloaded) {
				requestCount = 0;
				return;
			}

			var regexGoogle = new RegExp("^https?://([^/]+\\.)?google\\.", "i");

			// filter google searches (that can happen while typing in adress bar)
			// bugfix: do not count anonymox panel "open" (tabId == -1)
			if (!details.url.match(regexGoogle) && details.tabId != -1) {
				requestCount += 1;
				console.log("request did not match google -> counter:", requestCount);

				if (requestCount >= anonymox.Configuration.Ads.pageChangesPerAd) {
					requestCount = 0;

					anonymox.App.insertAds();
				}
			}
		},

		loadImgData: function (url, callbackFn) {
			// loads the specified url as binary and returns as base64 encoded string

			var xhr = new XMLHttpRequest(),
				type = /\.(\w+)$/.exec(url)[1];

			xhr.open('GET', url, true);

			xhr.responseType = 'arraybuffer';

			xhr.onload = function(e) {
				if (this.status == 200) {
					var uInt8Array = new Uint8Array(this.response),
						i = uInt8Array.length,
						binaryString = new Array(i),
						data,
						base64;

					while (i--)
					{
					  binaryString[i] = String.fromCharCode(uInt8Array[i]);
					}
					
					data = binaryString.join('');

					base64 = window.btoa(data);

					callbackFn("data:image/" + type + ";base64," + base64);
				}
			};

			xhr.send();
		}
	};

})();
