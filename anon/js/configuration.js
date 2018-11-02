var anonymox = anonymox || {};

anonymox.Configuration = {
	// this object holds properties which mostly do not change during the lifetime of the extension.

	// the operating system
	OS: (function () {
		if (navigator.appVersion.indexOf("Win") != -1) {
			return "Windows";
		}

		if (navigator.appVersion.indexOf("Mac") != -1) {
			return "MacOS";
		}

		if (navigator.appVersion.indexOf("X11") != -1) {
			return "UNIX";
		}

		if (navigator.appVersion.indexOf("Linux") != -1) {
			return "Linux";
		}
	})(),

	// the users locale
	locale: window.navigator.language.split("-")[0],

	// plugin version
	version: "1.2.6",

	// time in which anonymox.App.periodicCheck should be called
	periodicCheckTime: 1000 * 60 * 15,

	// timeout until failed network requests are tried again
	networkTimeout: 1000 * 30,

	// whether user has premium
	isPremium: false,

	selfCheckFailedUrl: "https://www.anonymox.net/self-check-failed",

	// network infos used by some functions
	Network: {
		masterURI : "https://master.anonymox.net/chrome",
		networkInfoURI: "http://nwi.anonymox.net/",
		externalInfo: {
			country: "", // e.g. "de" will be set later
			ip: "" // e.g. "127.0.0.1" will be set later
		}
	},

	// base url
	homepageBaseURI: 'http://www.anonymox.net/',
	
	// the advertising configuration from client.getInfo
	Ads: {}
};

anonymox.Configuration.disableAdsURI = (function () {
	var locale = this.locale;
	// currently only de|en are supported
	if (locale != "de") {
		locale = "en";
	}
	return anonymox.Configuration.homepageBaseURI + locale + '/disable-ads';
})();
