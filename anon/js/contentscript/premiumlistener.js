// the sole pupose for this content script is to be injected in the premium activation page
// generated from the store. if an "activateBtn" is found on the page we listen for a click,
// then send the attribute `param1` (which is the premium code) to js/premium.js via message passing

var buttonEl = document.getElementById("activateBtn");

if (buttonEl) {
	buttonEl.addEventListener("click", function () {
		chrome.runtime.sendMessage({
			"param1": buttonEl.getAttribute("param1")
		});
	});
}