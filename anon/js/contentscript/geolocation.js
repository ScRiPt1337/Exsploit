// messaging

var port = chrome.runtime.connect({ name: "location-channel" });

port.onMessage.addListener(function(msg) {
	console.log("contentScript:", msg);

	if (typeof msg == "object") {
		
		var script = document.createElement("script");

		script.innerHTML = '' +
			'navigator.geolocation.getCurrentPosition = function (callbackFn) {' +
			'	callbackFn({' +
			'		coords: {' +
			'			accuracy: 48425,' +
			'			altitude: null, ' +
			'			altitudeAccuracy: null,' +
			'			heading: null,' +
			'			latitude: ' + msg.latitude + ',' +
			'			longitude: ' + msg.longitude + ',' +
			'			speed: null' +
			'		},' +
			'		timestamp: ' + msg.timestamp + '' +
			'	});' +
			'};';

		document.body.appendChild(script);
	}
});

port.postMessage("fake-location");