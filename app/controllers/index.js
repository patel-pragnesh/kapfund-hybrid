/**
 * I wrap code that executes on creation in a self-executing function just to
 * keep it organised, not to protect global scope like it would in alloy.js
 */
(function constructor(args) {
	//$.navWin.open();

	var login = Alloy.createController('login').getView();
	login.open();

})(arguments[0] || {});

function onListViewItemclick(e) {

	// We've set the items special itemId-property to the controller name
	var controllerName = e.itemId;

	// Which we use to create the controller, get the window and open it in the navigation window
	// See lib/xp.ui.js to see how we emulate this component for Android
	$.navWin.openWindow(Alloy.createController(controllerName).getView());
}

//
// var uri = 'ws://ballparkws.ysoftsolution.com/default.Socket';
// var WS = require('net.iamyellow.tiws').createWS();
//
// WS.addEventListener('open', function() {
// //alert('WS websocket opened');
// //WS.send("JOINEDSAMPLECHAT:1234567");
//
// var runnerData = {
// "latitude" : "23.049736",
// "longitude" : "72.511724",
// "altitude" : "26.511724",
// "heading" : "Test",
// "speed" : "50",
// "timestamp" : "10",
// "runnerID" : "5"
// };
// setTimeout(function() {
// WS.send(JSON.stringify(runnerData));
// }, 2000);
//
// WS.send("JOINEDSAMPLECHAT:1234567");
//
// });
//
// WS.addEventListener('close', function(ev) {
// alert('WS close ' + ev);
// });
//
// WS.addEventListener('error', function(ev) {
// Ti.API.info('WS error ' + JSON.stringify(ev));
// });
//
// WS.addEventListener('message', function(ev) {
// alert('WS message ' + JSON.stringify(ev));
// });
//
// WS.open(uri);

var onesignal = require('com.williamrijksen.onesignal');
if (Ti.Platform.osname != 'android') {
	onesignal.promptForPushNotificationsWithUserResponse(function(obj) {
		Ti.API.info("========onesignal========== " + JSON.stringify(obj));
	});
} else {
	onesignal.getTags(function(e) {
		if (!e.success) {
			Ti.API.info("Error: " + e.error);
			return;
		}
		Ti.API.info(e.results);
		setTimeout(function() {
			var tags = JSON.parse(e.results);
			Ti.API.info(tags.length);
		}, 2500);
	});
}

onesignal.addEventListener("notificationReceived", function(evt) {
	Ti.API.info(' ***** Received! ' + JSON.stringify(evt));

	var alertDL = Ti.UI.createAlertDialog({
		title : evt.title,
		message : evt.body,
		buttonNames : ['OK']
	});
	alertDL.show();
});

onesignal.addEventListener("notificationOpened", function(evt) {
	//alert(evt);
	if (evt) {
		var title = '';
		var content = '';
		var data = {};

		if (evt.title) {
			title = evt.title;
		}

		if (evt.body) {
			content = evt.body;
		}

		if (evt.additionalData) {
			if (Ti.Platform.osname === 'android') {
				data = JSON.parse(evt.additionalData);
			} else {
				data = evt.additionalData;
			}
		}

		var alertDL = Ti.UI.createAlertDialog({
			title : title,
			message : content,
			buttonNames : ['OK']
		});
		alertDL.show();

	}
});

onesignal.idsAvailable(function(e) {
	Ti.API.info("========onesignal idsAvailable========== " + e.userId);
	Ti.App.Properties.setString("ONESIGNAL_PLAYER_ID", e.userId);
});

function getUsersLocation() {
	Ti.API.info('====getUsersLocation===== ');
	if (Ti.Network.online) {
		Ti.Geolocation.purpose = "Receive User Location";
		Titanium.Geolocation.getCurrentPosition(function(e) {
			Ti.API.info('====getUsersLocation===== ' + JSON.stringify(e));
			if (!e.success || e.error) {
				Ti.API.info('Could not find the device location');
				return;
			}
			var longitude = e.coords.longitude;
			var latitude = e.coords.latitude;
			Ti.App.Properties.setString('user_longitude', longitude);
			Ti.App.Properties.setString('user_latitude', latitude);

		});
	} else {
		Ti.API.info("Internet connection is required to use localization features");
	}
};

getUsersLocation();

var appdatabase = require('config/database');
appdatabase.createDatabase();

if (!Ti.Geolocation.hasLocationPermissions(Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE)) {
	Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE, function(resp) {
		Ti.API.info("Callback returned = " + JSON.stringify(resp));
		if (resp.success) {
			getUsersLocation();
			Ti.API.info("Geolocation permission GRANTED");
		} else {
			Ti.API.info("Permision denied");
		}
	});
} else {
	Ti.API.info("This device has geolocation permissions");
}