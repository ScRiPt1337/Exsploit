var anonymox = anonymox || {};
anonymox.Model = anonymox.Model || {};

anonymox.Model.Messages = (function () {
	// this object holds all information about messages that are displayed by anonymox.View.Messages.
	// it also manipulates the extension icon badge text to display how many messages are currently active.

	var pub,
		messages = [];

	pub = {
		add: function (message) {
			// adds a message

			messages.push(message);
			chrome.browserAction.setBadgeText({ text: String(messages.length) });
		},

		get: function () {
			// return all messages

			return messages;
		},

		clear: function () {
			// delete all messages, reset badge text

			messages = [];
			chrome.browserAction.setBadgeText({ text: "" });
		},

		hasMessages: function () {
			// return if we have any messages

			return messages.length ? true : false;
		},

		remove: function (index) {
			// remove a specific message by it's index.
			// if there are no more messages left, reset badge text

			messages.splice(index, 1);

			if (messages.length > 0) {
				chrome.browserAction.setBadgeText({ text: String(messages.length) });
			} else {
				chrome.browserAction.setBadgeText({text: ""});
			}
		},

		refresh: function (callbackFn) {
			// we dont get any messages from the server or localStorage. only parts of the extension add messages 

			console.log("anonymox.Model.Messages.refresh()");
			callbackFn();
		}
	};

	return pub;
})();