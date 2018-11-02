var anonymox = anonymox || {};
anonymox.Model = anonymox.Model || {};

anonymox.Model.Options = (function () {
	var pub;

	function init () {
		//
	};

	pub = {
		username: undefined,
		passwordPlain: undefined,

		load: function () {
			var data = JSON.parse(localStorage.options);

			this.username = data.username;
			this.passwordPlain = data.passwordPlain;
		},

		save: function () {
			console.log("anonymox.Model.Options.save()");
			localStorage.options = JSON.stringify({
					username: this.username,
					passwordPlain: this.passwordPlain
			});
		},

		refresh: function (callback) {
			var self = this;

			console.log("anonymox.Model.Options.refresh()");

			// if we don't need to overwrite the local data, return
			if (localStorage.options) {
				pub.load();
				callback();
				return;
			}

			// overwrite local data
			anonymox.Network.getAccount(function (username, passwordPlain) {
				self.username = username;
				self.passwordPlain = passwordPlain;
				self.save();
				callback();
			});
		}
	};

	init();

	return pub;
})();