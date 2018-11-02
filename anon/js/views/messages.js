var anonymox = anonymox || {};
anonymox.View = anonymox.View || {};

anonymox.View.Messages = (function () {
	// this view is responsible to display messages when there are any and bind an event handler to close them.

	var model = anonymox.Model.Messages,
		messagesEl = document.getElementById("messages");

	function init () {
		bindEvents();
		update();
	};

	function bindEvents () {
		// if user clicks on message close icon, close and remove the message
		messagesEl.addEventListener("click", function (e) {
			if (e.target.className === "close") {
				// e.target -> <div class="close">x</div>
				// .parentElement -> <div>MessageText</div>
				// .parentElement -> div#messages
				e.target.parentElement.parentElement.removeChild(e.target.parentElement);
				model.remove(e.target.parentElement.dataset.id);
			}
		});

		// we update every second
		setInterval(function () {
			update();
		}, 1000)
	};

	function update () {
		// see if there are new messages to be displayed, and display them accordingly.

		var messages = model.get(),
			i = 0,
			l = messages.length,
			div = document.createElement("div");

		messagesEl.innerHTML = "";

		for (i; i < l; i += 1) {
			div.innerHTML = messages[i] + '<div class="close">x</div>';
			div.dataset.id = i;
			messagesEl.appendChild(div.cloneNode(true));
		}
	};

	init();

	// used for testing.
	return {
		update: update
	};
})();