var config = require('config/settings');
exports.Styles = config.Styles;


/*
 * Detect tablet
 */ getIsTablet :
function isTablet() {
	//source: https://gist.github.com/cornflakesuperstar/7148669
	// http://www.libtronics.com/2013/10/determining-if-device-is-tablet-on.html
	var height = Ti.Platform.displayCaps.platformHeight;
	var width = Ti.Platform.displayCaps.platformWidth;
	if (height < width) {
		var w_inch = height / Ti.Platform.displayCaps.xdpi;
		var h_inch = width / Ti.Platform.displayCaps.ydpi;
	} else {
		var w_inch = width / Ti.Platform.displayCaps.xdpi;
		var h_inch = height / Ti.Platform.displayCaps.ydpi;
	}
	var disp_size = Math.sqrt(w_inch * w_inch + h_inch * h_inch);

	return (disp_size > 6.75);
};

var osname = Ti.Platform.osname;

exports.getCurrentDate = function() {
	var currDate = new Date();
	var month = ("0" + (currDate.getMonth() + 1)).slice(-2);
	var date = ("0" + (currDate.getUTCDate())).slice(-2);
	var hours = ("0" + (currDate.getHours())).slice(-2);
	var mins = ("0" + (currDate.getMinutes())).slice(-2);
	var fDate = currDate.getFullYear() + '-' + month + '-' + date + ' ' + hours + ':' + mins + ':00';
	return fDate;
};

var myWindowsNameArray = [];

exports.pushWindowToStack = function(_window) {
	myWindowsNameArray.push(_window);
};

var icons = require('/mileageTracker/icons');
exports.icons = icons;

exports.removeLastPushedWindow = function() {

	for (var j = 0; j < myWindowsNameArray.length; j++) {
		if (j == myWindowsNameArray.length - 1) {
			myWindowsNameArray[j].close();
		}
	}
	myWindowsNameArray.splice(myWindowsNameArray.length - 1, myWindowsNameArray.length - 1);
};

exports.closeAllWindows = function() {
	//Ti.API.info('myWindowsNameArray.length '+myWindowsNameArray.length);
	for (var j = 0; j < myWindowsNameArray.length; j++) {
		myWindowsNameArray[j].close();
	}
	myWindowsNameArray.length = 0;
};

exports.getCompanyDetails = function(_id) {

};

exports.locationListTemplate = {
	childTemplates : [{
		type : 'Ti.UI.Label',
		bindId : 'title',
		properties : {
			top : 5,
			left : 10,
			font : {
				fontSize : Ti.Platform.osname == 'ipad' ? 28 : 14
			},
			color : "#000",
		}
	}, {
		type : 'Ti.UI.Label',
		bindId : 'details',
		properties : {
			top : Ti.Platform.osname == 'ipad' ? 35 : 20,
			left : 10,
			font : {
				fontSize : Ti.Platform.osname == 'ipad' ? 28 : 14
			},
			color : "#000",
		}
	}, {
		type : 'Ti.UI.ImageView',
		bindId : 'icondetail',
		properties : {
			image : "image/arrow.png",
			right : 10
		}
	}],
};

exports.locationPickerTemplate = {
	childTemplates : [{
		type : 'Ti.UI.Label',
		bindId : 'title',
		properties : {
			left : 10,
			font : {
				fontSize : Ti.Platform.osname == 'ipad' ? 28 : 18,
				fontWeight : "bold"
			},
			color : "#000",
		}
	}],
};

exports.getEmployeeByID = function(_id) {
	var cpa_employees_cfg = Ti.App.Properties.getObject('cpa_employees_cfg');
	for (var i = 0,
	    j = cpa_employees_cfg.length; i < j; i++) {
		if (cpa_employees_cfg[i].id == _id) {
			return cpa_employees_cfg[i].firstname + ' ' + cpa_employees_cfg[i].lastname;
		}
	};
};

exports.getCompanyByID = function(_id) {
	var cpa_companies_cfg = Ti.App.Properties.getObject('cpa_companies_cfg');
	for (var i = 0,
	    j = cpa_companies_cfg.length; i < j; i++) {
		if (cpa_companies_cfg[i].id == _id) {
			return cpa_companies_cfg[i].company;
		}
	};
};

exports.getCPAByID = function(_id) {
	var CPAs_cfg = Ti.App.Properties.getObject('CPAs_cfg');
	for (var i = 0,
	    j = CPAs_cfg.length; i < j; i++) {
		if (CPAs_cfg[i].id == _id) {
			return CPAs_cfg[i].company;
		}
	};
};

Ti.App.upload = {
	maxLength : 2000,
	thumbWidth : 300,
	fixImage : function(image) {

		if (this.isAndroid()) {
			var file = Titanium.Filesystem.getFile(Titanium.Filesystem.tempDirectory, [new Date().getTime(), 'png'].join('.'));
			file.write(image);
			image = file.read();
			return image;
		}

		return image;

		var maxLength = this.maxLength * 4992;
		if (image.length <= maxLength)
			return image;
		var percent = maxLength / image.length,
		    oPx = image.width * image.height,
		    pWH = image.width / image.height,
		    toPx = oPx * percent,
		    pPx = toPx / oPx,
		    toW = image.width * pPx,
		    toH = image.height * pPx;

		return image.imageAsResized(toW, toH);
	},
	makeThumb : function(image) {

		return image.imageAsThumbnail(this.thumbWidth);
	},
	isAndroid : function() {
		return Ti.Platform.osname === 'android';
	}
};

Alloy.Globals.getFormattedDate = function(_date) {
	var fDateObj = _date.toString().split(' ')[0].split('-');
	return fDateObj[1] + '/' + fDateObj[2] + '/' + fDateObj[0];
};

Alloy.Globals.Mask = {
	mask : function(_field, _function) {
		var value = _field.value,
		    toVal = _function(value);
		if (value == toVal)
			return;
		_field.setValue(toVal);
		_field.setSelection(toVal.length, toVal.length);
	},

	dob : function(v) {
		v = v.replace(/\D/g, "");
		v = v.replace(/^(\d\d)(\d)/g, "$1/$2");
		v = v.replace(/(\d{2})(\d)/, "$1/$2");
		return v.slice(0, 10);
	},
	verificatonCode : function(v) {
		v = v.replace(/[^a-z0-9]/g, "");
		var v = v.split("-").join("");
		// remove hyphens
		if (v.length > 0) {
			v = v.match(new RegExp('.{1,4}', 'g')).join("-");
		}
		return v.slice(0, 19);
	},

	phone : function(v) {
		v = v.replace(/\D/g, "");
		v = v.replace(/^(\d\d)(\d)/g, "$1$2-");
		v = v.replace(/(\d{3})(\d)/, "$1-$2");
		return v.slice(0, 12);
	},

	zip : function(v) {
		v = v.replace(/\D/g, "");
		v = v.replace(/^(\d\d)(\d)/g, "$1$2");
		return v.slice(0, 5);
	},

	ssn : function(v) {
		v = v.replace(/\D/g, "");
		v = v.replace(/^(\d\d)(\d)/g, "$1$2");
		return v.slice(0, 9);
	},
	state : function(v) {
		v = v.replace(/^\d+|[\W_]+/g, "");
		return v.slice(0, 2);
	}
};

var OS = Ti.Platform.osname;

Alloy.Globals.validateDate = function(date, isDOB) {
	var valid = true;
	if (date.toString().length == 0) {
		return true;
	} else if (date.toString().length < 10) {
		return false;
	}

	date = date.replace(/\//g, '');
	var month = parseInt(date.substring(0, 2), 10);
	var day = parseInt(date.substring(2, 4), 10);
	var year = parseInt(date.substring(4, 8), 10);

	if ((month < 1) || (month > 12))
		valid = false;
	else if ((day < 1) || (day > 31))
		valid = false;
	else if (((month == 4) || (month == 6) || (month == 9) || (month == 11)) && (day > 30))
		valid = false;
	else if ((month == 2) && (((year % 400) == 0) || ((year % 4) == 0)) && ((year % 100) != 0) && (day > 29))
		valid = false;
	else if ((month == 2) && ((year % 100) == 0) && (day > 29))
		valid = false;
	else if ((month == 2) && (day > 28))
		valid = false;
	else if (isDOB && (year > (new Date().getFullYear())))
		valid = false;

	return valid;
};

Alloy.Globals.isTablet = isTablet();
Alloy.Globals.OS = osname;

exports.getiOSPickerToolBar = function(_pickerData, _tfObject) {

	var picker_view = Titanium.UI.createView({
		height : 251,
		visible : false,
		bottom : 0

	});

	var picker = Titanium.UI.createPicker({
		top : 43
	});
	picker.selectionIndicator = true;

	var cancel = Titanium.UI.createButton({
		title : 'Cancel',
		style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	var done = Titanium.UI.createButton({
		title : 'Done',
		style : Titanium.UI.iPhone.SystemButtonStyle.DONE,
		tf_picker : _tfObject,
		pickerObj : picker
	});
	var spacer = Titanium.UI.createButton({
		systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});
	var toolbar = Titanium.UI.createToolbar({
		top : 0,
		width : 320,
		items : [cancel, spacer, done]
	});

	var picker_data = [];

	for (var i = 0,
	    j = _pickerData.length; i < j; i++) {
		picker_data.push(Titanium.UI.createPickerRow({
			title : _pickerData[i],
		}));
	};

	var slide_out = Titanium.UI.createAnimation({
		bottom : -251
	});

	cancel.addEventListener('click', function() {
		picker_view.animate(slide_out);
	});

	done.addEventListener('click', function(e) {

		Ti.API.info(' DONE ' + JSON.stringify(e));

		e.source.tf_picker.value = e.source.pickerObj.getSelectedRow(0).title;
		picker_view.animate(slide_out);
		//e.source.tf_picker.text = picker.getSelectedRow(0).title;
	});

	picker.add(picker_data);
	picker_view.add(toolbar);
	picker_view.add(picker);

	return picker_view;
};

exports.getIntValues = function(_flag) {
	if (_flag == 'No' || _flag == '') {
		return 0;
	} else {
		return 1;
	}
};

exports.getIntValuesAndroid = function(_flag) {
	if (_flag == false) {
		return 0;
	} else {
		return 1;
	}
};

