exports.getDateObject = function(aTextField_dob, _type) {
	Ti.API.info('----getDateObject----');
	var osname = Ti.Platform.osname;
	if (osname == "android") {

		var currDateDOB = new Date();
		//var getYear = currDateDOB.getFullYear() - Number(_years);
		//currDateDOB.setFullYear(getYear);

		var datePicker;

		// if (_years == 21) {
		//
		// datePicker = Ti.UI.createPicker({
		// type : Ti.UI.PICKER_TYPE_DATE,
		// //maxDate : new Date(),
		// //value : new Date(),
		// minDate : currDateDOB,
		// selectionIndicator : true
		// });
		// } else {

		datePicker = Ti.UI.createPicker({
			type : Ti.UI.PICKER_TYPE_DATE,
			//maxDate : currDateDOB,
			value : currDateDOB,
			//minDate : currDateDOB,
			selectionIndicator : true
		});
		if (_type == 'date') {
			datePicker.showDatePickerDialog({
				callback : function(e) {
					if (e.cancel) {
						Ti.API.info('user canceled dialog');
					} else {
						selectedDate = e.value;
						var currDate = new Date(selectedDate);
						var month = ("0" + (currDate.getMonth() + 1)).slice(-2);
						var date = ("0" + (currDate.getUTCDate())).slice(-2);
						aTextField_dob.value = month + "/" + date + "/" + currDate.getFullYear();
					}
				}
			});
		} else {
			datePicker.type = Ti.UI.PICKER_TYPE_TIME;
			datePicker.showTimePickerDialog({
				callback : function(e) {
					if (e.cancel) {
						Ti.API.info('user canceled dialog');
					} else {
						selectedDate = e.value;
						var currDate = new Date(selectedDate);
						var month = ("0" + (currDate.getMonth() + 1)).slice(-2);
						var date = ("0" + (currDate.getUTCDate())).slice(-2);
						aTextField_dob.value = formatAMPM(selectedDate);
						//month + "/" + date + "/" + currDate.getFullYear();
					}
				}
			});
		}

		//}

	}
};

function formatAMPM(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12;
	hours = hours ? hours : 12;
	// the hour '0' should be '12'
	minutes = minutes < 10 ? '0' + minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;
}

exports.getDateObjectForiOS = function(self, aTextField_dob, _type) {

	var currDateDOB = new Date();
	//var getYear = currDateDOB.getFullYear();
	//currDateDOB.setFullYear(getYear);

	var picker;

	if (_type == 'date') {
		picker = Ti.UI.createPicker({
			type : Ti.UI.PICKER_TYPE_DATE,
			useSpinner : true,
			//minDate : currDateDOB,
			//maxDate : currDateDOB,
			//value : currDateDOB,
			bottom : 0,
		});
	} else {
		picker = Ti.UI.createPicker({
			type : Ti.UI.PICKER_TYPE_TIME,
			useSpinner : true,
			minDate : currDateDOB,
			//maxDate : currDateDOB,
			//value : currDateDOB,
			bottom : 0,
		});
	}
	/*
	 if (_years == 21) {
	 picker.maxDate = new Date();
	 picker.minDate = currDateDOB;
	 }
	 */
	var whiteBG = Ti.UI.createView({
		height : 30,
		width : Ti.UI.FILL,
		bottom : 180,
		backgroundColor : '#fff',
		right : '30',
		left : '30',
	});

	var select = Ti.UI.createButton({
		title : 'Select',
		//top : 70,
		right : '0',
		width : 120,
		//backgroundColor : '#82c341',
		//borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
		backgroundImage: '/images/btn_right.png',
		color : '#fff',
	});

	var cancel = Ti.UI.createButton({
		title : 'Cancel',
		//top : 70,
		left : '0',
		width : 120,
		backgroundImage: '/images/btn_left.png',
		//backgroundColor : '#82c341',
		//borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
		color : '#fff',
	});

	whiteBG.add(select);
	whiteBG.add(cancel);

	select.addEventListener('click', function(e) {

		var currDate = new Date(picker.value);
		var month = ("0" + (currDate.getMonth() + 1)).slice(-2);
		var date = ("0" + (currDate.getDate())).slice(-2);
		if (_type == 'date') {
			aTextField_dob.value = month + "/" + date + "/" + currDate.getFullYear();
		} else {
			aTextField_dob.value = formatAMPM(picker.value);
		}

		self.remove(picker);
		self.remove(whiteBG);
		picker = null;
		whiteBG = null;
		Ti.App.Properties.setBool('tp_dob_picker_addedd', false);

	});

	cancel.addEventListener('click', function(e) {
		//aTextField_dob.setValue('' + " col1:" + picker.value);
		self.remove(picker);
		self.remove(whiteBG);
		picker = null;
		whiteBG = null;

		Ti.App.Properties.setBool('tp_dob_picker_addedd', false);
	});

	self.add(picker);
	self.add(whiteBG);
};

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
			title : _pickerData[i].name,
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
