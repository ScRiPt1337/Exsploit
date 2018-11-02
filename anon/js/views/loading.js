var anonymox = anonymox || {};
anonymox.View = anonymox.View || {};

anonymox.View.Loading = (function () {
	// this view polls `anonymox.App.started`. as long as this is not true, it displays a loading spinner 
	// with some loading text. once `anonymox.App.started` is true, it checks `anonymox.App.connectionSuccess`.
	// if this is true it hides the loading spinner, if its false it shows a failuremessage

	var container = document.getElementById("loading"),
		spinnerEl = document.getElementById("spinner"),
		failureMsg = document.getElementById("failureMsg"),
		spinner;
	
	function init () {
		// if app hasn't started yet, start spinner and poll status with checkIfStarted()
		if (!anonymox.App.started) {
			startSpinner();
			checkIfStarted();
		} else {
			// if it has started and there was no connection success, display failure message
			if (!anonymox.App.connectionSuccess) {
				console.log("connectionSuccess == false");
				displayFailureMsg();
			}
		}
	};

	function checkIfStarted () {
		// this function polls `anonymox.App.started`

		if (!anonymox.App.started) {
			console.log("check if started ..");
			setTimeout(checkIfStarted, 100);
		} else {
			console.log("anonymox.View.Loading.checkIfStarted() -> App.started");
			console.log("anonymox.App.connectionSuccess", anonymox.App.connectionSuccess)
			if (!anonymox.App.connectionSuccess) {
				console.log("connectionSuccess == false");
				displayFailureMsg();
			}
			stop();
			return;
		}
	};

	function startSpinner () {
		// init and start the spinner, display container.

		var opts = {
			lines: 9, // The number of lines to draw
			length: 30, // The length of each line
			width: 10, // The line thickness
			radius: 25, // The radius of the inner circle
			corners: 1, // Corner roundness (0..1)
			rotate: 0, // The rotation offset
			direction: 1, // 1: clockwise, -1: counterclockwise
			color: '#000', // #rgb or #rrggbb
			speed: 1, // Rounds per second
			trail: 55, // Afterglow percentage
			shadow: false, // Whether to render a shadow
			hwaccel: true, // Whether to use hardware acceleration
			className: 'spinner', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
			top: 'auto', // Top position relative to parent in px
			left: 'auto' // Left position relative to parent in px
		};

		container.style.display = "block";
		spinner = new Spinner(opts).spin(spinnerEl);
	};

	function stop () {
		// stop the spinner, fadout container and remove it from dom
		// (removal is sometimes neccessary to avoid ghosting elements)

		container.classList.add("fadeout");

		// the fadeout class takes exactly 300ms. change this accordingly to css
		setTimeout(function () {
			spinner.stop();
			container.style.display = "none";
			container.parentElement.removeChild(container);
		}, 300);
	};

	function displayFailureMsg () {
		failureMsg.style.display = "block";
	}

	init();

	/* only used for testing
	return {
		stop: stop,
		failure: displayFailureMsg
	};
	*/
	return {};
})();