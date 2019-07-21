/**
 * Library to do the actual tracking.
 */

// DEPENDENCIES

//var dialogs = require('alloy/dialogs');
var permissions = require('/mileageTracker/permissions');
var utils = require('/mileageTracker/utils');

// PUBLIC INTERFACE

//var $ = module.exports = _.extend({

// exports.getCurrentRide = getCurrentRide;
// exports.isTracking = isTracking;
// exports.toggleTracking = toggleTracking;
// exports.startTracking = startTracking;
// exports.stopTracking = stopTracking;

var OS_IOS = (Ti.Platform.osname != 'android') ? true : false;
var OS_ANDROID = (Ti.Platform.osname == 'android') ? true : false;

//}, Backbone.Events);

// PRIVATE VARIABLES

var currentRide;
var currentRideObj = null;
var configuredMonitoring = false;

// PRIVATE FUNCTIONS

function getCurrentRide() {
	//return currentRide;
	return currentRideObj;
}

function isTracking() {
	return !!getCurrentRide();
}

function toggleTracking(cb) {

	if (isTracking()) {
		stopTracking(cb);
	} else {
		startTracking(cb);
	}

}

function startTracking(cb) {

	if (isTracking()) {
		return cb({
			success : false,
			error : 'Already tracking'
		});
	}

	initMonitoring(function(e) {
		currentRideObj = {};
		if (!e.success) {
			return cb(e);
		}

		var uniqueID = utils.guid();
		var fromTime = Date.now();

		var db = Ti.Database.open('MILEAGE_TRACKER');
		db.execute('INSERT INTO RIDES (id, fromTime) VALUES (?, ?)', uniqueID, Date.now());
		db.close();
		Ti.API.info('====currentRideObj==== ' + currentRideObj);
		Ti.API.info('====currentRideObj id==== ' + currentRideObj.id);
		currentRideObj.id = uniqueID;

		// currentRide = Alloy.Collections.instance('ride').create({
		// id : utils.guid(),
		// fromTime : Date.now()
		// });

		Ti.Geolocation.addEventListener('location', onLocation);

		if (OS_IOS) {
			Ti.Geolocation.addEventListener('locationupdatepaused', onLocationupdate);
			Ti.Geolocation.addEventListener('locationupdateresumed', onLocationupdate);
		}

		cb({
			success : true
		});

		// $.trigger('state state:start', {
		// type : 'start'
		// });
		onState('start');
	});
}

function stopTracking(cb) {

	if (!isTracking()) {
		return cb({
			success : false,
			error : 'Not tracking'
		});
	}

	Ti.Geolocation.removeEventListener('location', onLocation);

	if (OS_IOS) {
		Ti.Geolocation.removeEventListener('locationupdatepaused', onLocationupdate);
		Ti.Geolocation.removeEventListener('locationupdateresumed', onLocationupdate);
	}
	// currentRide.save({
	// toTime : Date.now()
	// });
	//
	// currentRide = null;
	var db = Ti.Database.open('MILEAGE_TRACKER');
	db.execute('UPDATE RIDES SET toTime=? WHERE id=?', Date.now(), currentRideObj.id);
	db.close();

	currentRideObj = null;

	cb({
		success : true
	});

	// $.trigger('state state:stop', {
	// type : 'stop'
	// });
	onState('stop');
}

function initMonitoring(cb) {

	permissions.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_ALWAYS, function(e) {

		if (e.success && !configuredMonitoring) {

			if (OS_IOS) {
				Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
				Ti.Geolocation.distanceFilter = Alloy.Globals.CFG.minUpdateDistance;
				Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
				Ti.Geolocation.pauseLocationUpdateAutomatically = true;
				Ti.Geolocation.activityType = Ti.Geolocation.ACTIVITYTYPE_FITNESS;
			}

			if (OS_ANDROID) {
				Ti.Geolocation.Android.addLocationProvider(Ti.Geolocation.Android.createLocationProvider({
					name : Ti.Geolocation.PROVIDER_GPS,
					minUpdateDistance : Alloy.Globals.CFG.minUpdateDistance,
					minUpdateTime : (Alloy.Globals.CFG.minAge / 1000)
				}));
				Ti.Geolocation.Android.addLocationRule(Ti.Geolocation.Android.createLocationRule({
					provider : Ti.Geolocation.PROVIDER_GPS,
					accuracy : Alloy.Globals.CFG.accuracy,
					maxAge : Alloy.Globals.CFG.maxAge,
					minAge : Alloy.Globals.CFG.minAge
				}));
				Ti.Geolocation.Android.manualMode = true;
			}

			configuredMonitoring = true;
		}

		return cb(e);
	});
}

function onLocation(e) {

	if (!e.error) {
		var coords = e.coords;

		var data = {
			id : utils.guid(),
			ride : currentRideObj.id//currentRide.id
		};

		// iOS: -1, Android: null
		if (coords.altitudeAccuracy !== -1 && coords.altitudeAccuracy !== null) {
			data.altitudeAccuracy = coords.altitudeAccuracy;
			data.altitude = coords.altitude;
		}

		['heading', 'speed'].forEach(function(key) {

			if (coords[key] !== -1) {
				data[key] = coords[key];
			}

		});

		['altitude', 'latitude', 'longitude', 'timestamp'].forEach(function(key) {
			data[key] = coords[key];
		});

		//Alloy.Collections.instance('data').create(data);

		var db = Ti.Database.open('MILEAGE_TRACKER');
		db.execute('INSERT INTO GEOTRACKINGDATA (id, ride, timestamp, latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', data.id, data.ride, data.timestamp, data.latitude, data.longitude, data.accuracy, data.altitude, data.altitudeAccuracy, data.heading, data.speed);
		db.close();

		data.type = 'location';

		//$.trigger('data', data);
		//alert('onLocation');
		onData(data);
	}
}

function onLocationupdate(e) {
	var state = (e.type === 'locationupdatepaused' ? 'pause' : 'resume');

	// $.trigger('state state:' + state, {
	// type : state
	// });
	onState(state);
}

exports.getCurrentRide = getCurrentRide;
exports.isTracking = isTracking;
exports.toggleTracking = toggleTracking;
exports.startTracking = startTracking;
exports.stopTracking = stopTracking;

var onState,
    onData;
exports.initializeTracker = function(_onState, _onData) {
	onState = _onState;
	onData = _onData;
};
