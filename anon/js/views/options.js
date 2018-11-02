var anonymox = anonymox || {};
anonymox.View = anonymox.View || {};

anonymox.View.Options = (function () {
	var username = document.getElementById("username"),
		password = document.getElementById("password"),
		saveBtn = document.getElementById("save-button"),
		settingsOK = document.getElementById("settings-ok"),
		settingsError = document.getElementById("settings-error"),
		model = anonymox.Model.Options;

	function activateInput () {
		username.disabled = false;
		password.disabled = false;
		saveBtn.style.display = "block";

		username.style.background = "white";
		password.style.background = "white";
		username.style.border = "1px solid black";
		password.style.border = "1px solid black";
	};

	function deactivateInput () {
		username.disabled = true;
		password.disabled = true;
		saveBtn.style.display = "none";

		username.style.background = "none";
		password.style.background = "none";
		username.style.border = "none";
		password.style.border = "none";
	};

	function init () {
		username.value = model.username;
		password.value = model.passwordPlain;
		document.title = chrome.i18n.getMessage("Options");

		saveBtn.addEventListener("click", function () {
			anonymox.Network.checkCredentials(username.value, password.value, function (isOK, premium) {
				if (isOK) {
					model.username = username.value;
					model.passwordPlain = password.value;
					model.save();

					settingsError.style.display = "none";
					settingsOK.style.display = "block";
					settingsOK.style.opacity = "1";
					setTimeout(function () {
						settingsOK.style.opacity = "0";
						deactivateInput();
					}, 3000);

					anonymox.Network.isProxyActive(function (yes) {
						if (premium) {
							if (yes) {
								anonymox.App.changeIcon('premium');
							} else {
								anonymox.App.changeIcon('premium-off');
							}
						} else {
							if (yes) {
								anonymox.App.changeIcon('on');
							} else {
								anonymox.App.changeIcon('off');
							}
						}
					});
				} else {
					settingsError.style.opacity = "1";
					settingsError.style.display = "block";
					settingsOK.style.display = "none";
					setTimeout(function () {
						settingsError.style.opacity = "0";
					}, 3000);
				}
			});
		});

		// #700 listen for the secret key combination
		// ↑,↑,↓,↓,←,→ (up, up, down, down, left right)
		// and enable username, password, saveBtn

		var combination = [38, 38, 40, 40, 37, 39],
			i = 0;

		document.body.addEventListener("keydown", function (event) {
			if (event.keyCode == combination[i]) {
				// correct, advance
				i += 1;
			} else {
				// wrong, start over
				i = 0;
			}

			if (i == combination.length) {
				// all keys correct
				i = 0;
				activateInput();
			}
		});
	};

	init();
})();