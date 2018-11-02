var anonymox = anonymox || {};

anonymox.App = {
	started: false,
	connectionSuccess: false,

	init: function () {
		// init function subscribes on "main/modelsInit" event which will later be published by
		// modelsInit(). anonymox.App.startup will therefore start after models are initialised.
		// first we check for connection succcess, then initModels(). if we can't connect right
		// we'll try every second again.

		var self = this;

		anonymox.Events.subscribe("main/modelsInit", function () {
			console.log("anonymox.init. publishing main/init");

			anonymox.App.startup();

			anonymox.Events.publish("main/init");
		}, "anonymox.App.init()");


		self.changeIcon('disabled');

		// check if we can connect to anonymox master server
		anonymox.Network.checkIfConnectionSuccess(function (yes) {
			console.log("anonymox.App.init() -> checkIfConnectionSuccess()");
			if (yes) {
				self.connectionSuccess = true;
				
				self.initModels();
			} else {
				self.started = true;

				// check again if connection can be established some time later
				var interval = setInterval(function () {
					anonymox.Network.checkIfConnectionSuccess(function (yes) {
						if (yes) {
							clearInterval(interval);
							self.connectionSuccess = true;
							self.initModels();
						}
					});
				}, anonymox.Configuration.networkTimeout);
			}
		});
	},

	periodicCheck: function () {
		// periodicCheck function is called periodically via an interval.
		// if gateway is selected and status is active we selfCheck the current gateway.
		// if gateway status is not ok we try to find a new gateway via `getNextBest()` method.

		var gateway, interval;

		// call getInfo in order to check for showUrl (see getInfo source)
		anonymox.Network.getInfo(function (data) {});

		if (anonymox.Model.GlobalStorage.activeGW && anonymox.Model.GlobalStorage.active) {
			// we disable self-check for now
			// anonymox.Model.Identities.selfCheckActiveGW(function (isOK) {
			// 	if (!isOK) {
			// 		interval = setInterval(function () {
			// 			gateway = anonymox.Model.Identities.getNextBest();
			// 			if (gateway) {
			// 				anonymox.Network.setProxy(gateway.ip, gateway.port);
			// 				anonymox.Model.Identities.selfCheckActiveGW(function (isOK) {
			// 					if (isOK) {
			// 						clearInterval(interval);
			// 					}
			// 				});
			// 			} else {
			// 				console.warn("periodicCheck() -> gateway from anonymox.Model.Identities.getNextBest() is null!");
			// 			}
						
			// 		}, 300);
			// 	}
			// });

			// refresh identites to get new usage scores and so on
			anonymox.Model.Identities.refresh(function () {
				anonymox.Model.Identities.rate();
				anonymox.Model.Identities.orderByScore();
			});
		}

		console.log("anonymox.App.periodicCheck()");
	},

	initialGatewayFetchAndSet: function (callbackFn) {
		// this function only rates, orders and the sets a gateway

		console.log("anonymox.App.initialGatewayFetchAndSet()");

		var gateway;

		anonymox.Model.Identities.rate();
		anonymox.Model.Identities.orderByScore();
		
		gateway = anonymox.Model.Identities.getBestFromCountry();
		anonymox.Network.setProxy(gateway.tls ? gateway.tlsHostname : gateway.ip, gateway.port, gateway.tls);

		callbackFn();

		console.log("anonymox.App.initialGatewayFetch()");
	},

	changeIcon: function (state) {
		// change extension icon based on state
		switch (state) {
			case 'disabled':
				chrome.browserAction.setIcon({
					path: "design/skin/icon-disabled24.png"
				});
				break;
			case 'off':
				chrome.browserAction.setIcon({
					path: "design/skin/icon-off24.png"
				});
				break;
			case 'premium-off':
				chrome.browserAction.setIcon({
					path: "design/skin/icon-premium-off24.png"
				});
				break;
			case 'premium':
				chrome.browserAction.setIcon({
					path: "design/skin/icon-premium24.png"
				});
				break;
			case 'on':
				chrome.browserAction.setIcon({
					path: "design/skin/icon24.png"
				});
				break;
			default:
				console.error("anonymox.App.changeIcon: state " + state + " is not supported!");
				break;
		};
	},

	startup: function () {
		// the startup function is responsible for getting and setting all necessary information
		// to start the extension. first we get Information via `getInfo()` then we decide how to
		// set the gateway. if gateway status wasn't active, we only rate and order Identities.
		// if gateway status was active we choose this gateway again.
		// basically this function activates a gateway or not based on the saved status in
		// anonymox.Model.GlobalStorage. 

		var self = this,
			gateway,
			followUp = function () {
				self.started = true;

				// #689: regardless if proxy is set or not, send anonymox header to anonymox site
				var regexAnonymox = new RegExp("^https?://([^/]+\\.)?anonymox\\.net/", "i");

				chrome.webRequest.onBeforeSendHeaders.addListener(
					function (details) {
						if (details.url.match(regexAnonymox)) {
							// push header
							details.requestHeaders.push({
								name: "X-AnonymoX-Capabilities",
								value: "oneclickactivate"
							});
							details.requestHeaders.push({
								name: "X-AnonymoX-Auth",
								value: "uid:" + anonymox.Model.Options.username
							});
							return {requestHeaders: details.requestHeaders};
						}
					},
					{urls: ["<all_urls>"]},
					['blocking', 'requestHeaders']
				);

				// tell other parts how many tabs are reloaded
				anonymox.App.tabsReloaded = 0;

				anonymox.Network.isProxyActive(function (yes) {
					if (yes) {
						if (anonymox.Configuration.isPremium) {
							self.changeIcon('premium');
						} else {
							self.changeIcon('on');
						}
					} else {
						if (anonymox.Configuration.isPremium) {
							self.changeIcon('premium-off');
						} else {
							self.changeIcon('off');
						}
					}

					if (yes) {
						// new: only reload if proxy is active
						// bugfix #434: reload active tabs after startup
						chrome.tabs.query({}, function (tabs) {
							tabs.forEach(function (tab) {
								// do not reload chrome tabs like chrome:// or chrome-xxx://
								if (!tab.url.match(/^chrome/)) {
									chrome.tabs.reload(tab.id, {}, function () {
										anonymox.Network.isProxyActive(function (yes) {
											// only count if proxy is active
											if (yes) {
												anonymox.App.tabsReloaded += 1;
											}
										});
									});
								}
							});
						});
					}
				});

				self.periodicCheck();

				setInterval(self.periodicCheck, anonymox.Configuration.periodicCheckTime);
			};

		console.log("anonymox.App.startup()");
		
		// Add listener for proxy auth requests
		chrome.webRequest.onAuthRequired.addListener(
			function (details, callbackFn) {
				if (details.realm == "anonymox.net" && details.isProxy) {
					return {authCredentials: {
								username: String(anonymox.Model.Options.username),
								password: String(anonymox.Model.Options.passwordPlain)
							}};
				}
			},
			{urls: ["<all_urls>"]},
			['blocking']
		);

		// retrive externalInfo from getInfo call and set in config
		anonymox.Network.getInfo(function (data) {
			anonymox.Configuration.Network.externalInfo = data.externalInfo;
			anonymox.Configuration.isPremium = data.premium;

			// if plugin was active
			if (anonymox.Model.GlobalStorage.active) {
				self.initialGatewayFetchAndSet(function () {
					followUp();
				});
			} else {
				// plugin was not active, therefore a gateway shouldn't be set
				anonymox.Model.Identities.rate();
				anonymox.Model.Identities.orderByScore();

				followUp();
			}
		}, function () {
			self.connectionSuccess = false;
			self.started = true;
		});
	},

	initModels: function () {
		// intitialise all models by calling their refresh method.
		// models have to be loaded in sequence.
		anonymox.Model.Options.refresh(function () {
			anonymox.Model.GlobalStorage.refresh(function () {
				anonymox.Model.Identities.refresh(function () {
					anonymox.Model.Messages.refresh(function () {
						anonymox.Events.publish("main/modelsInit");
					});
				});
			});
		});
	},

	openSelfCheckFailedTab: function () {
		// open a new tab if all gateway selfchecks have failed
		chrome.tabs.create(
			{'url': anonymox.Configuration.selfCheckFailedUrl},
			function (tab) {}
    	);
	},

	onConnectListener: false,

	insertAds: function (tabId) {
		// this function makes an ajax call to anonymox.Configuration.Ads.frameURL and inserts
		// the returned HTML in an Ad container into the currently active tab or specied tabId

		if (typeof anonymox.Configuration.Ads != "object" || !anonymox.Configuration.Ads.frameURL) {
			console.log("anonymox.Configuration.Ads is not defined, will not insert Ads!");
			return false;
		}

		var getTabId = new Promise(function(resolve, reject) {
			if (!tabId) {
				chrome.tabs.query({
					active: true,
					currentWindow: true
				},
				function (tabs) {
					resolve(tabs[0].id);
				});
			} else {
				resolve(tabId);
			}
		});

		if (!anonymox.App.onConnectListener) {
			anonymox.App.onConnectListener = true;

			chrome.runtime.onConnect.addListener(function(port) {
				if (port.name == "ad-channel") {
					port.onMessage.addListener(function(msg) {
						switch (msg) {
							case "destroy-iframe":
								port.postMessage("destroy");
							break;

							case "load-ad":
								getTabId.then(function (id) {
									// get tab by id
									chrome.tabs.get(id, function (tab) {
										// insert advertising into tab

										anonymox.App.loadAdvertising(tab, port);
											
									}); // chrome.tabs.get()
								}); // getTabId.then()
							break;
						}
					});
				}
			});
		}

		getTabId.then(function (id) {
			console.log("inserting ads in tab id", id);
			chrome.tabs.executeScript(id, {file: "js/contentscript/advertising.js"});
		});

	},

	loadAdvertising: function (tab, port) {
		$.ajax({
			url: anonymox.Configuration.Ads.frameURL
		}).done(function (html) {
			var frameWidth = parseInt(/<body frame_width="(\d+)"/g.exec(html)[1], 10),
				frameHeight = parseInt(/<body frame_width="(\d+)" frame_height="(\d+)"/g.exec(html)[2], 10);

			// layout bugfix: frameHeight must not be less than 80
			if (frameHeight < 85) {
				frameHeight = 85;
			}

			// if there is not enough space to display the popup, don't show it.
			if (tab.width < frameWidth * 2 || tab.height < frameHeight * 3) {
				console.log("tab is too small, will not insert Ads!");
				return false;
			}

			if (!frameWidth || !frameHeight) {
				console.log("no frameWidth || frameHeight, will not insert Ads!");
				return false;
			}

			var adHTML = $("<div>").css({ display: "inline-block" }).html(html);

			var loadImgData = new Promise(function(resolve, reject) {
				// AdBlock protection
				// transform <img src="foo.png"> to <img src="data:image/png;base64,base64Code">
				
				var imgs = 0,
					loaded = 0;

				adHTML.find("img").each(function () {
					var that = this;

					imgs += 1;

					anonymox.Network.loadImgData(this.src, function (data) {
						loaded += 1;

						if (imgs == loaded) {
							resolve();
						}

						that.src = data;
						return that;
					});
				});
			});

			loadImgData.then(function() {
				var adCode = adHTML[0].outerHTML;
				
				adCode = adCode.replace(/\r?\n|\r/g, "");

				port.postMessage({
					width: frameWidth + 120,
					height: frameHeight,
					marginLeft: (frameWidth / 2) * -1,
					adCode: adCode,
					disableLink: anonymox.Configuration.disableAdsURI
				});
			}); //loadImgData.then()
		});	// $ajax.done()	
	},

	fakeGeolocation: function (tabId, latitude, longitude, timestamp) {

		var getTabId = new Promise(function(resolve, reject) {
			if (!tabId) {
				chrome.tabs.query({
					active: true,
					currentWindow: true
				},
				function (tabs) {
					tabId = tabs[0].id;
					resolve();
				});
			} else {
				resolve();
			}
		});

		latitude = latitude ? latitude : 51.1337;
		longitude = longitude ? longitude : 7.331337;
		timestamp = timestamp ? timestamp : Date.now();

		// this listener can only be bound once to work properly
		// therefore the function should only be called once
		chrome.runtime.onConnect.addListener(function(port) {
			if (port.name == "location-channel") {
				port.onMessage.addListener(function(msg) {
					if (msg == "fake-location") {
						console.log("faking geolocation");
						port.postMessage({
							latitude: latitude,
							longitude: longitude,
							timestamp: timestamp
						});
					}
				});
			}
		});

		getTabId.then(function () {
			chrome.tabs.executeScript(tabId, {file: "js/contentscript/geolocation.js"});
		});
	}
};

// always disable proxy on startup
anonymox.Network.disableProxy(true, function () {
	// start anonymox
	anonymox.App.init();
});
