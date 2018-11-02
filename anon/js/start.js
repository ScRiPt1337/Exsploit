// get anonymox object from background page to make it available to pop-up related code
var anonymox = chrome.extension.getBackgroundPage().anonymox;

// translate each element on page that has a data-message attribute
(function () {
	var objects = document.getElementsByTagName('*'), i;
	for (i = 0; i < objects.length; i++) {
		if (objects[i].dataset && objects[i].dataset.message) {
			objects[i].innerHTML = chrome.i18n.getMessage(objects[i].dataset.message);
		}
	}
})();