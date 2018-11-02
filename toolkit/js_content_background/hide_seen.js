// hide last seen for fabeook messages
function Interceptor(nativeOpenWrapper, nativeSendWrapper) {
	XMLHttpRequest.prototype.open = function() {
		// condition given below breaks many things so it is replaced with new condition
		//this.allow = !(arguments[1].match("/ajax/messaging/typ.php") || arguments[1].match("/ajax/mercury/change_read_status.php"));

		//only blocks change read
		// eslint-disable-next-line prefer-rest-params
		// this.allow = !(arguments[1] == "/ajax/mercury/change_read_status.php?dpr=1");
        // eslint-disable-next-line prefer-rest-params
        this.allow = ! arguments[1].match("/ajax/mercury/change_read_status.php");
		// eslint-disable-next-line prefer-rest-params
		return nativeOpenWrapper.apply(this, arguments);
	};
	XMLHttpRequest.prototype.send = function() {
		// eslint-disable-next-line prefer-rest-params
		if (this.allow) return nativeSendWrapper.apply(this, arguments);
	};
}

function startHiding() {
	//  Injects the code via a dynamic script tag
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.textContent = "(" + Interceptor + ")(XMLHttpRequest.prototype.open, XMLHttpRequest.prototype.send);";
	document.documentElement.appendChild(script);
	document.documentElement.removeChild(script);
	//console.log('hide seen is activated');
}
function loaded() {
    chrome.storage.local.get('hide_seen', function(a) {
        console.log(a);
        if (a.hide_seen) {
            if (a.hide_seen === "Yes" || a.hide_seen === "true") {
                console.log("Hide seen is enabled");
                startHiding();
            }
        }else {
            console.log('Hide seen is not enabled.');
        }
    });
}
window.onload=loaded;