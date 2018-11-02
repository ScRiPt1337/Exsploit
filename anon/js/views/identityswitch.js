var anonymox = anonymox || {};
anonymox.View = anonymox.View || {};

anonymox.View.Identityswitch = (function () {
	// this view is responsible for the change identity button

	var identitiesEl = document.getElementById("identities"),
		switchBtn = document.getElementById("change-identity");

	function init () {
		bindEvents();
	};

	function bindEvents () {
		// on click, select next and scroll to selected
		switchBtn.addEventListener("click", function () {
			identitiesEl.observer.selectNext();
			
			// scroll to selected identity
			identitiesEl.observer.scrollToSelected();
		});
	};

	init();

	return {

	};
})();