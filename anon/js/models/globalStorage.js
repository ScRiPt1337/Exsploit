var anonymox = anonymox || {};
anonymox.Model = anonymox.Model || {};

anonymox.Model.GlobalStorage = (function () {
	// this object is a global data storage for countryFilter, active gateway and whether or not the proxy is enabled.

	return {
		// currently active gateway as object
		activeGW: undefined,	// is set in .Network.setProxy

		// currently selected country as string
		countryFilter: undefined, // is set in .View

		// is anonymox set to on/off
		active: undefined,

		save: function () {
			// save all properties to localStorage

			console.log("anonymox.Model.GlobalStorage.save()");
			
			localStorage.global = JSON.stringify({
				countryFilter: this.countryFilter,
				activeGW: this.activeGW,
				active: this.active
			});
		},

		refresh: function (callbackFn) {
			// refresh reads the data from localStorage or sets defaults for each property if there is nothing saved.
			
			console.log("anonymox.Model.GlobalStorage.refresh()");

			var data;

			if (localStorage.global) {
				data = JSON.parse(localStorage.global);
				this.countryFilter = data.countryFilter;
				this.activeGW = data.activeGW;
				this.active = data.active;
			} else {
				this.countryFilter = ".*";
				this.activeGW = undefined;
				this.active = true;

				this.save();
			}

			callbackFn();
		}
	};
})();