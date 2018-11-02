var anonymox = anonymox || {};
anonymox.View = anonymox.View || {};

anonymox.View.Premiumcode = (function () {
	var hideIfPremium = document.getElementById("hideIfPremium"),
		showIfPremium = document.getElementById("showIfPremium"),
		code = document.getElementById("premium-code"),
		activateBtn = document.getElementById("premium-activate");

	function init () {
		hideAndShowPremiumStatus();
		bindEvents();
	};

	function hideAndShowPremiumStatus () {
		if (anonymox.Configuration.isPremium) {
			hideIfPremium.style.display = "none";
			showIfPremium.style.display = "block";
		}
	};

	function bindEvents() {
		activateBtn.addEventListener("click", function () {
			anonymox.Premium.activate(code.value, function (isActivated) {
				if (isActivated) {
					hideAndShowPremiumStatus();
				}
			});
		});
	};

	init();
})();