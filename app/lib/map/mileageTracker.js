var general = require('/config/general');
var styles = general.Styles;
var components = require('/lib/components');
function MileageTrackerWindow(_orderdata, deliveredcallback) {
	Ti.API.info('====MileageTrackerWindow==== ' + JSON.stringify(_orderdata));
	Ti.App.Properties.setBool('mileageTrackerStillOpen', false);
	Ti.App.Properties.setObject('RIDEGEODATA', null);
	var sql = require('/mileageTracker/sql');
	var track = require('/mileageTracker/track');
	var units = require('/mileageTracker/units');

	var api = require('api');
	var points = [];

	var durationInterval;
	var lastData;
	var isMapReady = false;

	var uri = 'ws://ballparkws.ysoftsolution.com/default.Socket';
	var WS = require('net.iamyellow.tiws').createWS();

	WS.addEventListener('open', function() {
		WS.send("JOINEDSAMPLECHAT:1234567");
	});

	var routePoints = Ti.App.Properties.getObject(""+_orderdata.OrderID, []);

	function addAnnotationsOnMap(data, _type) {

		Ti.API.info(_type + ' ===addAnnotationsOnMap data===== lat ' + data.latitude + " long " + data.longitude);
		Ti.API.info(_type + ' ===addAnnotationsOnMap user data===== lat ' + Ti.App.Properties.getString('user_latitude') + " long " + Ti.App.Properties.getString('user_longitude'));

		mapView.removeAllAnnotations();
		points.push({
			latitude : parseFloat(data.latitude),
			longitude : parseFloat(data.longitude),
		});
		var newRoutePoints = [];
		for (var i = 0,
		    j = routePoints.length; i < j; i++) {
			newRoutePoints.push(routePoints[i]);
		};
		newRoutePoints.push({
			latitude : parseFloat(data.latitude),
			longitude : parseFloat(data.longitude),
		});

		Ti.API.info(_orderdata.OrderID+' newRoutePoints ' + JSON.stringify(newRoutePoints));
		Ti.App.Properties.setObject(""+_orderdata.OrderID, newRoutePoints);
		
		Ti.API.info('newRoutePoints 1 ' + JSON.stringify(newRoutePoints));
		var newRoutePointsPlotting = [];
		var existingRoutePoints = Ti.App.Properties.getObject(""+_orderdata.OrderID);
		for (var i = 0,
		    j = existingRoutePoints.length; i < j; i++) {
			newRoutePointsPlotting.push({
				latitude : parseFloat(existingRoutePoints[i].latitude),
				longitude : parseFloat(existingRoutePoints[i].longitude),
			});
		};

		Ti.API.info('newRoutePoints 2 ' + JSON.stringify(newRoutePoints));

		var route = MapModule.createRoute({
			color : "#8f00",
			width : 10,
			points : newRoutePointsPlotting
		});

		Ti.API.info('newRoutePoints 3 ' + JSON.stringify(newRoutePoints));

		mapView.addRoute(route);

		mapView.region = {
			latitude : parseFloat(data.latitude),
			longitude : parseFloat(data.longitude),
			latitudeDelta : 0.001,
			longitudeDelta : 0.001
		};
		mapView.setLocation({
			latitude : parseFloat(data.latitude),
			longitude : parseFloat(data.longitude),
			animate : true,
			latitudeDelta : 0.001,
			longitudeDelta : 0.001
		});
		//mapView.centerLatLng = [data.latitude, data.longitude];
		var a1 = MapModule.createAnnotation({
			latitude : parseFloat(data.latitude),
			longitude : parseFloat(data.longitude),
			title : 'Runner',
			subtitle : '',
			image : (Alloy.Globals.OS == 'android') ? getBlobFromImage('/images/pin_a.png') : getBlobFromImage('/images/pin.png'),
		});
		mapView.addAnnotation(a1);

		if (Ti.App.Properties.getString('user_latitude')) {
			var a2 = MapModule.createAnnotation({
				latitude : parseFloat(Ti.App.Properties.getString('user_latitude')),
				longitude : parseFloat(Ti.App.Properties.getString('user_longitude')),
				title : 'Fan Location',
				subtitle : '',
				image : (Alloy.Globals.OS == 'android') ? getBlobFromImage('/images/pin_client_a.png') : getBlobFromImage('/images/pin_client.png'),
			});
			mapView.addAnnotation(a2);
		}

	};

	WS.addEventListener('close', function(ev) {
		Ti.API.info('WS close');
	});

	WS.addEventListener('error', function(ev) {
		Ti.API.info('WS error ' + JSON.stringify(ev));
	});

	WS.addEventListener('message', function(ev) {

		Ti.API.info('WS message ' + JSON.stringify(ev));

		if (!Ti.App.Properties.getBool("isRunner")) {
			if (ev.data != "1234567 Connected.") {

				if (_orderdata) {
					var data = JSON.parse(ev.data);
					if ((_orderdata.OrderID == data.OrderID ) && (data.runnerID == _orderdata.Runner.ID)) {
						Ti.App.Properties.setString('source_latitude', data.latitude);
						Ti.App.Properties.setString('source_longitude', data.longitude);
						addAnnotationsOnMap(data, 'WS');
					}
				}
			}
		}
	});

	WS.open(uri);

	function onInterval() {
		if (Ti.App.Properties.getBool('mileageTrackerStillOpen')) {
			lastData = Ti.App.Properties.getObject('CURRENT_RIDE_DATA');
			Ti.API.info('  onInterval lastData ' + JSON.stringify(lastData));
			var transformed = Alloy.Globals.transformLocationData(lastData);
			addAnnotationsOnMap(lastData, "interval");
		}
	}

	function saveCallback() {
		Ti.API.info('saveCallback');
		_callback();
	}

	function rideComplete(_rideGeoData, _rideDistance) {
		//self.close();
	}

	function onState(e) {
		//console.log(e);
		if (Ti.App.Properties.getBool('mileageTrackerStillOpen')) {
			Ti.API.info('====onState==== ' + e);

			if (e === 'start') {
				Ti.API.info('tracking started');
			} else if (e === 'stop') {
				if (Ti.App.Properties.getBool('mileageTrackerStillOpen')) {
					lastData = Ti.App.Properties.getObject('CURRENT_RIDE_DATA');
					var transformed = Alloy.Globals.transformLocationData(lastData);
					var rideGeoData = Alloy.Globals.getFinishedRide(lastData);
					rideComplete(rideGeoData, transformed.distanceFormatted);
					Ti.App.Properties.setObject(""+_orderdata.OrderID, []);
				}
			}
		}
	}

	var lbl_time;
	var lblData;
	function onData(e) {

		Ti.API.info('====onData=====    ' + JSON.stringify(e));
		lastData = e;
		Ti.App.Properties.setObject('CURRENT_RIDE_DATA', lastData);
		var transformed = Alloy.Globals.transformLocationData(lastData);

		transformed.CustomerID = Ti.App.Properties.getString('CustomerID');
		transformed.runnerID = Ti.App.Properties.getString('runnerID');
		transformed.OrderID = Ti.App.Properties.getString('OrderID');
		transformed.VendorOrderNumber = Ti.App.Properties.getString('VendorOrderNumber');
		transformed.runnerLocation = true;

		WS.send("JOINEDSAMPLECHAT:1234567");
		WS.send(JSON.stringify(transformed));

		Ti.App.Properties.setString('source_latitude', lastData.latitude);
		Ti.App.Properties.setString('source_longitude', lastData.longitude);

		addAnnotationsOnMap(lastData, "ondata");
	}

	var self = Ti.UI.createWindow({
		orientationModes : [Titanium.UI.PORTRAIT],
		//backgroundColor : 'transparent',
		top : (Alloy.Globals.OS == 'android') ? 0 : 20,
		theme : "Theme.AppCompat.NoTitleBar",
		backgroundColor : '#151d27'
	});

	var view_parent = Ti.UI.createView({
		height : '100%',
		width : '100%',
		//left : (App.OS != 'android') ? App.pWidth : 0,
	});

	if (Alloy.Globals.OS != 'android') {
		//view_parent.backgroundImage = styles.viewiMain.backgroundImage;
		self.fullscreen = false;
		self.navBarHidden = true;
	}

	function navCallback(_menuClicked) {
		points = [];
		if (_menuClicked == 'home') {
			if (Alloy.Globals.OS != 'android') {
				view_parent.animate(animation, function() {
					self.close();
					Ti.App.Properties.setBool('mileageTrackerStillOpen', false);
				});
			} else {
				self.close();
				//mileageTrackerStillOpen = false;
				Ti.App.Properties.setBool('mileageTrackerStillOpen', false);
			}
		}
		//alert('close');
		track.stopTracking(function(e) {
			Ti.API.info('track.toggleTracking ' + JSON.stringify(e));
			if (e.error) {
				alert(e.error);
			}
		});

	};

	self.addEventListener('android:back', function() {
		//alert('hardware close');
		track.stopTracking(function(e) {
			Ti.API.info('track.toggleTracking ' + JSON.stringify(e));
			if (e.error) {
				alert(e.error);
			}
		});
		self.close();
	});

	var view_topBar = require('/ui/topBar');
	var view_topBar_obj = new view_topBar({
		_callback : navCallback,
		_addConfigure : false,
		_addHome : true,
		_addMenu : false
	});
	//view_topBar_obj.left = 10;
	view_parent.add(view_topBar_obj);

	var menuParent = Ti.UI.createView({
		top : 95,
		height : Ti.UI.FILL,
		width : Ti.UI.FILL,
	});
	var longitude;
	var latitude;

	var MapModule = require('ti.map');
	var mapView = MapModule.createView({
		mapType : (Alloy.Globals.OS != 'android') ? MapModule.STANDARD_TYPE : Titanium.Map.STANDARD_TYPE
	});

	// var accessToken = "pk.eyJ1IjoiZG1kYWdlbmN5IiwiYSI6ImNqNWw2dm9hbjMxdHkzMm84bm5icW1iYTkifQ.dWS9z3sW1JTDw8wxer1QJg";
	// var mapbox = require('com.custom.mapbox');
	// var mapView;

	/*if (Alloy.Globals.OS == 'android') {
	 mapView = mapbox.createExample({
	 styleUrl : "mapbox://styles/mapbox/streets-v9",
	 lat : parseFloat(Ti.App.Properties.getString('user_latitude')),
	 lng : parseFloat(Ti.App.Properties.getString('user_longitude')),
	 accessToken : accessToken,
	 zoom : 17,
	 // Only used on Android
	 onMapReady : onMapReady,
	 height : Ti.UI.FILL,
	 width : Ti.UI.FILL,
	 bottom : 0
	 });

	 function onMapReady() {
	 Ti.API.info('map is ready');
	 }

	 } else {
	 mapView = mapbox.createView({
	 map : 'mapbox.streets', //(Ti.Network.online) ? Alloy.CFG.Map.Normal.Online.MapboxStyle : 'mapbox.emerald', //this is used for mapview style
	 minZoom : 1, //8,
	 maxZoom : 18, //10,
	 zoom : 17,
	 centerLatLng : [parseFloat(Ti.App.Properties.getString('user_latitude')), parseFloat(Ti.App.Properties.getString('user_longitude'))],
	 width : Ti.UI.FILL,
	 height : Ti.UI.FILL,
	 hideAttribution : true, //defaults to: false. See Mapbox terms and conditions before removing
	 debugTiles : false,
	 userLocation : true,
	 accessToken : accessToken,
	 });
	 }*/

	menuParent.add(mapView);
	function getBlobFromImage(_image) {
		return Ti.UI.createImageView({
			image : _image
		}).toBlob();
	};

	var view_shadow = Ti.UI.createView({
		height : 65,
		width : 130, //(Alloy.Globals.OS != 'android') ? 220 : 230,
		//layout : 'horizontal',
		backgroundImage : '/images/bg_shadow.png',
		bottom : 40,
		right : 0
	});

	var view_navigation = components.contactsView('/images/icon_nav.png', 'Launch Navigation', function() {
		var source_latitude = Ti.App.Properties.getString('source_latitude');
		var source_longitude = Ti.App.Properties.getString('source_longitude');
		var destination_latitude = Ti.App.Properties.getString('user_latitude');
		var destination_longitude = Ti.App.Properties.getString('user_longitude');

		Ti.API.info('======Source location lattitude-> ' + source_latitude + ' longitude-> ' + source_longitude);
		Ti.API.info('======Destination location lattitude-> ' + destination_latitude + ' longitude-> ' + destination_longitude);

		Ti.Platform.openURL("http://maps.google.com/?saddr=" + parseFloat(source_latitude) + "," + parseFloat(source_longitude) + "&daddr=" + parseFloat(destination_latitude) + "," + parseFloat(destination_longitude));
	});

	var view_shadow_ii = Ti.UI.createView({
		height : 65,
		width : 160, //(Alloy.Globals.OS != 'android') ? 220 : 230,
		//layout : 'horizontal',
		backgroundImage : '/images/bg_shadow.png',
		bottom : 40,
		left : 0
	});
	view_shadow_ii.add(view_navigation);

	var view_dir = components.contactsView('/images/stopGray.png', 'Delivery Complete?', function() {
		track.toggleTracking(function(e) {
			if (e.error) {
				alert(e.error);
			}
		});

		var uploaddata = {
			OrderID : parseInt(Ti.App.Properties.getString("OrderID")),
			RunnerID : parseInt(Ti.App.Properties.getString("runnerID"))
		};
		api.getRunnerOrders(uploaddata, 'OrderStatusByRunner', function(_response) {
			Ti.API.info('====OrderStatusByRunner===== ' + JSON.stringify(_response));
			deliveredcallback();
			track.stopTracking(function(e) {
				Ti.API.info('track.toggleTracking ' + JSON.stringify(e));
				if (e.error) {
					alert(e.error);
				}
			});
			self.close();
		});

	});

	if (Ti.App.Properties.getBool("isRunner")) {
		view_dir.right = 10;
		view_shadow.add(view_dir);
		menuParent.add(view_shadow);
	}

	menuParent.add(view_shadow_ii);

	function plotMarkers() {
		isMapReady = true;
		track.initializeTracker(onState, onData);
		Ti.API.info('plotMarkers====== ' + track.isTracking());
		if (!track.isTracking()) {
			Ti.API.info('not plotMarkers====== ' + track.isTracking());
		} else {
			view_dir.icon.image = '/images/stopGray.png';
			view_dir.lbl_option.text = 'Complete';
		}

		setTimeout(function() {
			track.startTracking(function(e) {
				Ti.API.info('track.toggleTracking ' + JSON.stringify(e));
				if (e.error) {
					alert(e.error);
				}
			});
		}, 200);
	}

	var animation = Titanium.UI.createAnimation();
	animation.duration = 500;
	animation.left = 0;

	self.addEventListener('open', function() {
		mileageTrackerStillOpen = true;
		Ti.App.Properties.setBool('mileageTrackerStillOpen', true);
	});

	self.addEventListener('close', function() {
		Ti.App.Properties.setBool('mileageTrackerStillOpen', false);
	});

	view_parent.add(menuParent);
	self.add(view_parent);

	self.mapView = mapView;

	/*if (Alloy.Globals.OS == 'android') {
	 mapView.addEventListener('mapReady', plotMarkers);
	 } else {
	 plotMarkers();
	 }*/
	plotMarkers();

	return self;
}

//make constructor function the public component interface
module.exports = MileageTrackerWindow;
