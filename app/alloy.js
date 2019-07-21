// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};
/*
 * Is iOS7 Plus?
 */
var calc = require("mileageTracker/calc");
var units = require('mileageTracker/units');

function getAvarageSpeed(_lData) {
	if (_lData) {
		var avg_speed;
		var db = Ti.Database.open('MILEAGE_TRACKER');
		var speedRS = db.execute('SELECT AVG(speed) as avg_speed FROM GEOTRACKINGDATA WHERE ride = ?', _lData.ride);
		while (speedRS.isValidRow()) {
			avg_speed = speedRS.fieldByName('avg_speed');
			speedRS.next();
		}
		speedRS.close();
		db.close();

		return avg_speed;
	}

};

function getDistanceFormatted(_lData) {
	var points = [];
	var db = Ti.Database.open('MILEAGE_TRACKER');
	var speedRS = db.execute('SELECT latitude, longitude FROM GEOTRACKINGDATA WHERE ride = ?', _lData.ride);
	while (speedRS.isValidRow()) {
		points.push({
			latitude : speedRS.fieldByName('latitude'),
			longitude : speedRS.fieldByName('longitude')
		});
		speedRS.next();
	}
	speedRS.close();
	db.close();

	return units.formatLength(calc.calculateTotalDistanceForPoints(points));
};
function getRideTime(_lData) {
	var rideTime = {};
	var db = Ti.Database.open('MILEAGE_TRACKER');
	var speedRS = db.execute('SELECT fromTime, toTime FROM RIDES WHERE id = ?', _lData.ride);
	while (speedRS.isValidRow()) {
		rideTime.fromTime = speedRS.fieldByName('fromTime');
		rideTime.toTime = speedRS.fieldByName('toTime');
		speedRS.next();
	}
	speedRS.close();
	db.close();

	return rideTime;
};
Alloy.Globals.getFinishedRide = function(_lData) {
	var points = [];
	var db = Ti.Database.open('MILEAGE_TRACKER');
	var speedRS = db.execute('SELECT latitude, longitude FROM GEOTRACKINGDATA WHERE ride = ?', _lData.ride);
	while (speedRS.isValidRow()) {
		points.push({
			latitude : speedRS.fieldByName('latitude'),
			longitude : speedRS.fieldByName('longitude')
		});
		speedRS.next();
	}
	speedRS.close();
	db.close();

	return points;
};

var moment = require('mileageTracker/moment');
Alloy.Globals.transformLocationData = function(lData) {

	var transformed = {};

	transformed.avgSpeedFormatted = units.formatSpeed(getAvarageSpeed(lData));
	//getAvarageSpeed(lData);
	transformed.distanceFormatted = getDistanceFormatted(lData);

	var rideTime = getRideTime(lData);

	transformed.fromTimeFormatted = rideTime.fromTime ? moment(rideTime.fromTime).format('LLLL') : null;
	transformed.toTimeFormatted = rideTime.toTime ? moment(rideTime.toTime).format('LLLL') : null;

	transformed.durationFormatted = units.formatDuration(-1 * moment(rideTime.fromTime).diff(rideTime.toTime ? moment(rideTime.toTime) : moment()));

	return transformed;
};

Alloy.Globals.CFG = {
	"minUpdateDistance" : 1,
	"trackDelta" : 0.075,
	"pointDelta" : 0.5,
	"msToPause" : 5000,
	"settings" : {
		"system" : {
			"type" : "string",
			"def" : "metric"
		}
	},
	"accuracy" : 10,
	"minAge" : 1000,
	"maxAge" : 5000,
	"system" : {
		"type" : "string",
		"def" : "metric"
	},
	"msToPause" : 5000,
};

var vendorMenuItems = Alloy.Collections.vendorMenuItems = Alloy.createCollection('vendorMenuItem');
var pastOrders = Alloy.Collections.pastOrders = Alloy.createCollection("order");
var cart = Alloy.Models.instance("settings");

cart.set("cartEmpty", 1);
cart.set("cartCount", 0);
cart.set("isCartEmpty", true);
cart.set("isItemInCart", false);
cart.save();

var Styles = require('nl.fokkezb.button/styles');
Alloy.Globals.isIOS = (Ti.Platform.osname == "iphone") || OS_IOS;
Alloy.Globals.isAndroid = Ti.Platform.osname == "android";
Alloy.Globals.screenWidth = Ti.Platform.displayCaps.platformWidth;
Alloy.Globals.screenHeight = Ti.Platform.displayCaps.platformHeight;

// since this is phones
if (Alloy.Globals.screenHeight < Alloy.Globals.screenWidth) {
	Alloy.Globals.screenHeight = Ti.Platform.displayCaps.platformWidth;
	Alloy.Globals.screenWidth = Ti.Platform.displayCaps.platformHeight;
}

if (Alloy.Globals.isAndroid) {
	var factor = Ti.Platform.displayCaps.logicalDensityFactor;
	Alloy.Globals.screenWidth = Alloy.Globals.screenWidth / factor;
	Alloy.Globals.screenHeight = Alloy.Globals.screenHeight / factor;
}

Alloy.Globals.fa = require('fa');
Alloy.Globals.C2 = require('C2');
Alloy.Globals.firstTimeUser = Ti.App.Properties.getString('firstTimeUser') ? Ti.App.Properties.getString('firstTimeUser') : "true";

Alloy.Globals.rememberMe = Ti.App.Properties.getBool('rememberMe', true);

Alloy.Globals.lastUserEmail = Ti.App.Properties.getString('lastUserEmail');
Alloy.Globals.lastUserPasssword = Ti.App.Properties.getString('lastUserPassword');

Alloy.Globals.lastVendorID = Ti.App.Properties.getString('lastVendorID');

Alloy.Globals.lastOrderID = 8;
Alloy.Globals.lastVendorOrderNumber = "VEN103";

Alloy.Globals.isiOS7Plus = function() {
	// iOS-specific test
	if (Titanium.Platform.name == 'iPhone OS') {
		var version = Titanium.Platform.version.split(".");
		var major = parseInt(version[0], 10);

		// Can only test this support on a 3.2+ device
		if (major >= 7) {
			return true;
		}
	}
	return false;
};

console.log("os constants", OS_IOS, Ti.Platform.name, Alloy.Globals.C2);

Styles.set('my-style', {
	borderWidth : 1,
	borderColor : '#0c0',
	backgroundColor : '#ccc',
	color : "#000",
	activeStyle : {
		backgroundColor : '#000',
		color : '#fff'
	}
});

