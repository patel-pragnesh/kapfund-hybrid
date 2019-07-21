//http://dtaxsolution.com/dev/images/dtax/01491824715.png
/*
 * ALL API REQUESTS
 */
var C2 = Alloy.Globals.C2;
exports.getRunnerOrders = function(data, method, callback) {
	Ti.API.info(method + ' ====getRunnerOrders===== ' + JSON.stringify(data));
	try {

		if (Titanium.Network.networkType === Titanium.Network.NETWORK_NONE) {
			console.log("no network connection found");
			success({}, -1, "No network connection found, please ensure you are connected to the internet");
			return;
		}

		var xhr = Ti.Network.createHTTPClient();
		//xhr.setOption(2, 13056);
		xhr.timeout = 30000;
		var url = C2.baseSvcUrl + method;

		xhr.open("POST", url);
		xhr.setRequestHeader("Content-Type", "application/json");

		xhr.onload = function() {
			if (this.responseText) {
				console.log("resp getRunnerOrders ", this.responseText);
				if (C2.debugMode) {
					console.log("resp", this.responseText);
				}
				var resp = JSON.parse(this.responseText);
				var payload = JSON.parse(resp.Payload);
				callback(payload);
				//Ti.API.info('getRunnerOrders response ' + JSON.stringify(payload));

			} else {
				Ti.API.info('ERROR IN getRunnerOrders ');
				//error();
			}
		};

		xhr.onerror = function(e) {
			console.log("xhr error ", e);
			//error();
		};

		var d = data;
		if (!d)
			d = {};

		if (C2.debugMode) {
			console.log("posting " + JSON.stringify(d) + " to " + url);
		}
		xhr.send(JSON.stringify(d));
	} catch(e) {
		//error(e);
		Ti.API.info('ERROR IN getRunnerOrders ' + e);
	}
};

