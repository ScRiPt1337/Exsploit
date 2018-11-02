var DomHelper = function (el) {
	
	// jquery like function with helper methods

	if (typeof el == "string") {
		// convert string to HTML element

		el = el.replace("<", "");
		el = el.replace(">", "");

		el = document.createElement(el);
	}

	if (el.element) {
		// DomHelper object
		el = el.element;
	}

	return {
		element: el,

		attr: function (objOrString, val) {
			// expect obj to be a string, value pair

			if (val) {
				// objOrString is expected to be a string
				el.setAttribute(objOrString, val);

				return DomHelper(el);
			}

			for (var attribute in objOrString) {
				el.setAttribute(attribute, objOrString[attribute]);
			}

			return DomHelper(el);
		},

		append: function () {
			// expect arguments to be a list of HTML elements or DomHelper objects
			// (can be mixed)

			for (var i = 0; i < arguments.length; i += 1) {
				var element = arguments[i];

				if (element.element) {
					// elment is a DomHelper obj
					element = element.element;
				}

				if (el.nodeName == "IFRAME") {
					// check if el is an iframe
					el.contentDocument.body.appendChild(element);
				} else {
					el.appendChild(element);
				}
			}

			return DomHelper(el);
		},
		
		css: function (styles) {
			// expect styles to be an object
			// apply all styles to el

			for (var style in styles) {
				if (typeof styles[style] == "number" && style != "zIndex") {
					// convert number to px value
					styles[style] = String(styles[style]) + "px";
				}

				el.style[style] = styles[style];
			}

			return DomHelper(el);
		},

		html: function (html) {
			// expect html to be a string

			if (el.nodeName == "IFRAME") {
				// check if el is an iframe
				el.contentDocument.body.innerHTML = html;
			} else {
				el.innerHTML = html;
			}

			return DomHelper(el);
		},

		text: function (string) {
			// expect string to be a string

			el.innerText = string;

			return DomHelper(el);
		},

		onclick: function (func) {
			// expect func to be a function

			el.onclick = func;

			return DomHelper(el);
		}
	};
};


var $ = DomHelper,
	adHTML = $("<div>"),
	frameContainer = $("<div>"),
	iframeHTML = $("<iframe>"),
	controlsHTML = $("<div>"),
	buttonClose = $("<button>"),
	buttonDisable = $("<button>"),
	disableLink = $("<a>"),
	text = $("<p>");

// prepare HTML

buttonClose.text(chrome.i18n.getMessage("Close"));

frameContainer.css({
	background: "rgb(230,230,230)",
	position: "fixed",
	bottom: 0,
	left: "50%",
	zIndex: 99999
});

iframeHTML.attr({
	id: "anymx-frame"
});

controlsHTML.css({
	position: "absolute",
	top: 0,
	right: 0,
	width: 110,
	padding: "5px 0px 0px 10px",
	fontFamily: "Arial, sans-serif",
	fontWeight: "normal",
	fontSize: 12,
	color: "#000"
});

buttonClose.css({
	width: 90,
	margin: "0px 0px 5px 5px"
});

buttonDisable.css({
	width: 90,
	marginLeft: 5
});

disableLink.css({
	display: "block",
	border: "none",
	textDecoration: "none",
	color: "#000"
}).attr(
	"href",
	"http://anonymox.net"
).attr(
	"target",
	"_blank"
).text(
	chrome.i18n.getMessage("Disable")
);

text.css({
	fontSize: 8,
	marginRight: 15,
	textAlign: "center"
}).text(
	chrome.i18n.getMessage("Ads_by_anonymoX")
);

controlsHTML.append(
	buttonClose
);

controlsHTML.append(
	buttonClose,
	buttonDisable.append(disableLink),
	text
);

function insertIFrame (obj) {
	// insert iframe into page

	frameContainer.css({
		width: obj.width,
		height: obj.height,
		marginLeft: obj.marginLeft
	});

	iframeHTML.css({
		width: obj.width,
		height: obj.height,
		border: "none"
	});

	disableLink.attr(
		"href",
		obj.disableLink
	);

	frameContainer.append(iframeHTML);
	adHTML.append(frameContainer);
	document.body.appendChild(adHTML.element);

	// iframe.contentDocument.body is only available after it's appended to the dom ..
	iframeHTML.html(obj.adCode);
	iframeHTML.append(controlsHTML);

	// style correction
	iframeHTML.element.contentDocument.body.style.margin = "0px";
};

// messaging

var port = chrome.runtime.connect({ name: "ad-channel" });

port.onMessage.addListener(function(msg) {
    if (msg == "destroy") {
		adHTML.element.remove();
	}

	if (typeof msg == "object") {
		insertIFrame(msg);
	}
});

port.postMessage("load-ad");

buttonClose.onclick(function () {
	port.postMessage("destroy-iframe");
});

disableLink.onclick(function () {
	port.postMessage("destroy-iframe");
});


