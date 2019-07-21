var agreement = {
	text : 'dynamicMedia Development, LLC',
	color : '#000',
};

var OS = Ti.Platform.osname;
function selectAppImagesPath() {
	var path;
	if (OS == 'android') {
		path = "/images/";
	} else if (OS == 'ipad') {
		path = "/ipad/";
	} else {
		path = '/';
	}
	return path;
};

//var fontRegular = (OS == 'android') ? 'BebasNeue Regular' : 'BebasNeueRegular';
//var fontBold = (OS == 'android') ? 'BebasNeue Bold' : 'BebasNeueBold';

var fontRegular = (OS == 'android') ? 'SourceSansPro-Regular' : 'SourceSansPro-Regular';
var fontBold = (OS == 'android') ? 'SourceSansPro-Semibold' : 'SourceSansPro-Semibold';


/*
 * COMPANY_ID is CPA.id from CPA table, I am not changing variable name here but all comparison will be done
 * based on CPA.id itself.
 */


var calc = require("mileageTracker/calc");
var units = require('mileageTracker/units');

function getAvarageSpeed(_lData) {
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

exports.Styles = {

	font : {
		fontBold : fontRegular,
		fontRegular : fontBold,
	},

	viewURL : {
		url : '',
	},

	//Used for Android only
	appointmentURL : {
		url : '',
	},

	// 	Background views for iPhone
	viewiMain : {
		backgroundImage : "/images/bg_gradient.png",//Ti.Platform.osname == "ipad" ? "/ipad/bg.png" : "bg.png",
	},

	viewiForms : {
		//backgroundImage : Ti.Platform.osname == "ipad" ? "/ipad/forms.png" : "forms.png",
		backgroundImage : Ti.Platform.osname == "ipad" ? "/ipad/bg.png" : "bg.png",
		backgroundColor : '#fff'
	},

	viewiCoupons : {
		//backgroundImage : Ti.Platform.osname == "ipad" ? "/ipad/cdetail.png" : "coupons.png",
		backgroundImage : Ti.Platform.osname == "ipad" ? "/ipad/bg.png" : "bg.png",
	},

	viewiStaff : {
		//backgroundImage : Ti.Platform.osname == "ipad" ? "/ipad/coupons.png" : "coupons.png",
		backgroundImage : Ti.Platform.osname == "ipad" ? "/ipad/bg.png" : "bg.png",
	},

	// 	Background views for Android
	viewaHome : {
		backgroundImage : Ti.Filesystem.resourcesDirectory + "images/bg.png",
	},

	viewaMain : {
		//backgroundImage : Ti.Filesystem.resourcesDirectory + "images/coupons.png",
		backgroundImage : "/images/bg_gradient.png"//Ti.Filesystem.resourcesDirectory + "images/bg.png",
	},

	viewaForms : {
		//backgroundImage : Ti.Filesystem.resourcesDirectory + "images/forms.png",
		backgroundImage : Ti.Filesystem.resourcesDirectory + "images/bg.png",
	},

	viewaCoupons : {
		//backgroundImage : Ti.Filesystem.resourcesDirectory + "images/coupons.png",
		backgroundImage : Ti.Filesystem.resourcesDirectory + "images/bg.png",
	},

	viewaStaff : {
		//backgroundImage : Ti.Filesystem.resourcesDirectory + "images/coupons.png",
		backgroundImage : Ti.Filesystem.resourcesDirectory + "images/bg.png",
	},

	// 	Company Name on Map
	map : {
		text : 'AffinityTax',
	},

	// 	Top Bar for iPhone
	topBar : {
		color : '#fff',
		top : '50%',
		text : 'AffinityTax',
	},

	// 	Top Bar Title for Additinal Web View
	topMisc : {
		color : '#fff',
		top : '50%',
		text : 'Need a Ride',
	},

	// 	Requested Forms
	request : {
		color : '#fff',
		top : '50%',
		text : 'Requested Forms',
	},

	employee : {
		height : '180dp'
	},

	// 	Used agreement section before W2 view
	/*
	 * ******Please change this on line 271 also, its used for Agreement localization.*******
	 */
	agreement : {
		text : 'dynamicMedia Development, LLC',
		color : '#000',
	},

	// 	Next, Upload & Submit Buttons in 1040 Return, Send Forms
	next : {
		color : '#fff',
		backgroundColor : '#82c341',
	},

	formLbl : {
		//color : '#000',
		color : '#000',
	},

	// 	Used in 1040 Return, and Send Forms
	textfield : {
		backgroundImage : 'image/field.png',
		color : '#000',
		paddingLeft : 20,
		borderColor : '#0e76bc',
		font : {
			fontSize : Ti.Platform.osname == 'ipad' ? 28 : 14,
			fontFamily : fontRegular
		},
		backgroundColor : '#fff'
	},

	// 	Used in 1040 Return, and Send Forms
	textfielda : {
		backgroundImage : Ti.Filesystem.resourcesDirectory + 'image/field.png',
	},

	// 	Used in staff, coupons, locations
	cell : {
		backgroundImage : 'image/cell.png',
		color : '#000',
	},

	cella : {
		backgroundImage : Ti.Filesystem.resourcesDirectory + 'image/cell.png',
	},

	// 	Used throughout app
	loading : {
		color : '#000',
	},

	// 	Used in Coupon Details and Staff Details
	coloredText : {
		color : '#fff',
	},

	OS : OS

};
