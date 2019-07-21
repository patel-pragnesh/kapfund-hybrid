var styles = require('/config/general').Styles;
function getUIContainerWithCB(_containerTop, _lblText, _value) {

	var container = Ti.UI.createView({
		top : _containerTop,
		height : Ti.UI.SIZE,
		width : Ti.UI.FILL,
		left : 0,
		right : 0,
		backgroundColor : 'transaparent',
	});
	var lbl_left = getLabel(_lblText, 10, 13);
	lbl_left.right = 55;
	var checkBox = Ti.UI.createView({
		backgroundImage : '/image/selectF.png',
		height : 40,
		width : 40,
		right : 10,
		flag : 0
	});
	if (parseInt(_value) == 1) {
		checkBox.backgroundImage = '/image/selectedF.png';
		checkBox.flag = 1;
	}

	container.add(lbl_left);
	container.add(checkBox);
	return container;
};

exports.label = getLabel;
exports.uiContainerCB = getUIContainerWithCB;

function getLabel(_text, _top, _fontSize) {
	return Ti.UI.createLabel({
		text : _text,
		top : _top,
		left : 10,
		color : '#000',
		font : {
			fontSize : _fontSize,
		},
		width : Ti.UI.FILL
	});
};

function getUIContainerWithTf(_containerTop, _lblText, _value, isTextArea) {

	var container = Ti.UI.createView({
		top : _containerTop,
		height : Ti.UI.SIZE,
		width : Ti.UI.FILL,
		left : 0,
		right : 0,
		backgroundColor : 'transaparent',
	});
	var lbl_left = getLabel(_lblText, 5, 15);
	lbl_left.right = 210;
	var textField = Ti.UI.createTextField({
		color : styles.textfield.color,
		font : styles.textfield.font,
		backgroundColor : styles.textfield.backgroundColor,
		borderColor : '#ccc',
		borderStyle : Titanium.UI.INPUT_BORDERSTYLE_NONE,
		keyboardType : Ti.UI.KEYBOARD_DEFAULT,
		returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
		height : 40,
		width : 195,
		right : 10,
		value : _value
	});
	if (isTextArea) {
		var textField = Ti.UI.createTextArea({
			backgroundColor : styles.textfield.backgroundColor,
			borderColor : '#ccc',
			borderStyle : Titanium.UI.INPUT_BORDERSTYLE_NONE,
			keyboardType : Ti.UI.KEYBOARD_DEFAULT,
			returnKeyType : Ti.UI.RETURNKEY_DEFAULT,
			height : 150,
			width : 195,
			right : 10,
			value : _value,
			color : styles.textfield.color,
		});
	}

	container.add(lbl_left);
	container.add(textField);
	return container;
};

function getTextFieldWOLabel(_hintText) {

	var container = Ti.UI.createView({
		top : 15,
		height : 48,
		width : '80%',
	});

	var tf_object = Ti.UI.createTextField({
		top : 0,
		height : 45,
		width : Ti.UI.FILL,
		color : '#2c2c2c',
		backgroundColor : 'transparent',
		//backgroundColor : '#303030',
		//borderRadius : 5,
		font : {
			fontSize : 16,
		},
		hintText : _hintText,
		hintTextColor : '#848484',
		paddingLeft : 10,
		isEmpty : true,
		key : _hintText,
		autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_ALL
	});

	var sep_first = Ti.UI.createView({
		height : 1,
		bottom : 1,
		width : Ti.UI.FILL,
		backgroundColor : '#848484',
	});
	var sep_second = Ti.UI.createView({
		height : 3,
		bottom : 0,
		width : 0.1,
		left : 0,
		backgroundColor : '#fbac2b',
	});

	tf_object.sep_second = sep_second;

	tf_object.addEventListener('focus', function(e) {
		//Ti.API.info('Focus');
		e.source.sep_second.backgroundColor = '#fbac2b';
		e.source.sep_second.animate({
			anchorPoint : {
				x : 1,
				y : 1
			},
			top : 45,
			width : '100%',
			duration : 400
		});
	});

	tf_object.addEventListener('blur', function(e) {
		//Ti.API.info('blur');
		e.source.sep_second.animate({
			anchorPoint : {
				x : 1,
				y : 1
			},
			top : 45,
			width : 0.1,
			duration : 400
		});
	});

	tf_object.addEventListener('change', function(e) {
		//Ti.API.info('*******changed******* ' + e.source.value);
		if (e.source.value.toString().length != 0) {
			e.source.isEmpty = false;
		} else {
			e.source.isEmpty = true;
		}
	});

	container.tf_object = tf_object;
	container.add(tf_object);
	container.add(sep_first);
	container.add(sep_second);

	return container;
};

function getTextField(_hintText) {

	var container = Ti.UI.createView({
		top : 15,
		height : 73,
		width : '80%',
	});

	var lbl_title = Ti.UI.createLabel({
		text : _hintText,
		left : 0,
		textAlign : 'left',
		top : 0,
		height : 25,
		font : {
			fontSize : 14,
		},
		color : '#303030',
	});

	var tf_object = Ti.UI.createTextField({
		top : 25,
		height : 45,
		width : Ti.UI.FILL,
		color : '#2c2c2c',
		backgroundColor : 'transparent',
		//backgroundColor : '#303030',
		//borderRadius : 5,
		font : {
			fontSize : 16,
		},
		hintText : _hintText,
		hintTextColor : '#848484',
		paddingLeft : 10,
		isEmpty : true,
		key : _hintText,
		autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_ALL
	});

	var sep_first = Ti.UI.createView({
		height : 1,
		bottom : 1,
		width : Ti.UI.FILL,
		backgroundColor : '#848484',
	});
	var sep_second = Ti.UI.createView({
		height : 3,
		bottom : 0,
		width : 0.1,
		left : 0,
		backgroundColor : '#fbac2b',
	});

	tf_object.sep_second = sep_second;

	tf_object.addEventListener('focus', function(e) {
		//Ti.API.info('Focus');
		e.source.sep_second.backgroundColor = '#fbac2b';
		e.source.sep_second.animate({
			anchorPoint : {
				x : 1,
				y : 1
			},
			top : 70,
			width : '100%',
			duration : 400
		});
	});

	tf_object.addEventListener('blur', function(e) {
		//Ti.API.info('blur');
		e.source.sep_second.animate({
			anchorPoint : {
				x : 1,
				y : 1
			},
			top : 70,
			width : 0.1,
			duration : 400
		});
	});

	tf_object.addEventListener('change', function(e) {
		//Ti.API.info('*******changed******* ' + e.source.value);
		if (e.source.value.toString().length != 0) {
			e.source.isEmpty = false;
		} else {
			e.source.isEmpty = true;
		}
	});

	container.tf_object = tf_object;
	container.add(tf_object);
	container.add(lbl_title);
	container.add(sep_first);
	container.add(sep_second);

	return container;
};

function getPickerView(_hintText, _callback, _pickerData) {

	var container = Ti.UI.createView({
		top : 15,
		height : 73,
		width : '80%',
	});

	var lbl_title = Ti.UI.createLabel({
		text : _hintText,
		left : 0,
		textAlign : 'left',
		top : 0,
		height : 25,
		font : {
			fontSize : 14,
		},
		color : '#303030',
	});

	if (App.OS != 'android') {
		var tf_object = Ti.UI.createTextField({
			top : 25,
			height : 45,
			width : Ti.UI.FILL,
			color : '#848484',
			backgroundColor : 'transparent',
			font : {
				fontSize : 16,
			},
			hintText : _hintText,
			hintTextColor : '#848484',
			paddingLeft : 10,
			isEmpty : true,
			key : _hintText,
			editable : false,
			autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_ALL
		});
	} else {
		var tf_object = Ti.UI.createPicker({
			top : 25,
			height : 45,
			width : Ti.UI.FILL,
			color : '#848484',
			backgroundColor : 'transparent',
			font : {
				fontSize : 16,
			},
			hintText : _hintText,
			hintTextColor : '#848484',
			paddingLeft : 10,
			isEmpty : true,
			key : _hintText,
		});
		_pickerData.splice(0, 0, _hintText);

		var picker_data = [];

		for (var i = 0,
		    j = _pickerData.length; i < j; i++) {
			picker_data.push(Titanium.UI.createPickerRow({
				title : _pickerData[i].toString().toUpperCase(),
			}));
		};
		tf_object.add(picker_data);
		tf_object.setSelectedRow(0, 0, false);
	}

	var sep_first = Ti.UI.createView({
		height : 1,
		bottom : 1,
		width : Ti.UI.FILL,
		backgroundColor : '#848484',
	});
	var sep_second = Ti.UI.createView({
		height : 3,
		top : 70,
		width : 0.1,
		left : 0,
		backgroundColor : '#fbac2b',
	});

	tf_object.sep_second = sep_second;

	tf_object.addEventListener('focus', function(e) {
		//Ti.API.info('Focus');
		e.source.sep_second.backgroundColor = '#fbac2b';
		e.source.sep_second.animate({
			anchorPoint : {
				x : 1,
				y : 1
			},
			top : 70,
			width : '100%',
			duration : 400
		});
	});
	tf_object.addEventListener('blur', function(e) {
		//Ti.API.info('blur');
		e.source.sep_second.animate({
			anchorPoint : {
				x : 1,
				y : 1
			},
			top : 70,
			width : 0.1,
			duration : 400
		});
	});
	if (App.OS != 'android') {
		tf_object.addEventListener('change', function(e) {
			if (e.source.value.toString().length != 0) {
				e.source.isEmpty = false;
				e.source.sep_second.animate({
					anchorPoint : {
						x : 1,
						y : 1
					},
					top : 70,
					width : 0.1,
					duration : 400
				});
			} else {
				e.source.isEmpty = true;
			}
		});

		tf_object.addEventListener('click', function(e) {
			e.source.sep_second.backgroundColor = '#fbac2b';
			e.source.sep_second.animate({
				anchorPoint : {
					x : 1,
					y : 1
				},
				top : 70,
				width : '100%',
				duration : 400
			});
			if (App.OS != 'android') {
				_callback();
			}
		});
	}
	container.tf_object = tf_object;
	container.add(tf_object);
	container.add(lbl_title);
	container.add(sep_first);
	container.add(sep_second);

	return container;
};

function getiOSPickerToolBar(_pickerData, _tfObject, _callback) {

	var picker_view = Titanium.UI.createView({
		height : 251,
		//visible : false,
		bottom : -251
	});

	var picker = Titanium.UI.createPicker({
		top : 43
	});
	picker.selectionIndicator = true;

	var cancel = Titanium.UI.createButton({
		title : 'Cancel',
		style : Ti.UI.iOS.SystemButtonStyle.BORDERED,
		tf_picker : _tfObject,
	});
	var done = Titanium.UI.createButton({
		title : 'Done',
		style : Ti.UI.iOS.SystemButtonStyle.DONE,
		tf_picker : _tfObject,
		pickerObj : picker
	});
	var spacer = Titanium.UI.createButton({
		systemButton : Ti.UI.iOS.SystemButton.FLEXIBLE_SPACE
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

	cancel.addEventListener('click', function(e) {
		picker_view.animate(slide_out);
		e.source.tf_picker.sep_second.animate({
			anchorPoint : {
				x : 1,
				y : 1
			},
			top : 70,
			width : 0.1,
			duration : 400
		});
	});

	done.addEventListener('click', function(e) {
		e.source.tf_picker.value = e.source.pickerObj.getSelectedRow(0).title;
		_callback(e.source.pickerObj.getSelectedRow(0).title);
		picker_view.animate(slide_out);
		e.source.tf_picker.sep_second.animate({
			anchorPoint : {
				x : 1,
				y : 1
			},
			top : 70,
			width : 0.1,
			duration : 400
		});
	});

	if (picker_data.length > 1) {
		picker.add(picker_data);
	} else {
		picker_data.push(Titanium.UI.createPickerRow({
			title : '',
		}));
		picker.add(picker_data);
	}

	picker_view.add(toolbar);
	picker_view.add(picker);

	return picker_view;
};

function getButtonView(_title, _limit) {

	var container = Ti.UI.createView({
		top : 10,
		height : 46,
		width : '90%',
		backgroundColor : '#303030',
		borderRadius : 5,
	});

	var lbl_title = Ti.UI.createLabel({
		color : '#848484',
		font : {
			fontSize : 16,
		},
		text : _title,
		width : Ti.UI.SIZE,
		left : 10
	});

	var view_counter = Ti.UI.createView({
		height : 45,
		width : Ti.UI.SIZE,
		right : 6.5,
		layout : 'horizontal'
	});

	var btn_add = Ti.UI.createButton({
		backgroundImage : '/images/add-button-1.png',
		left : 0,
		height : 45,
		width : 45,
	});

	var btn_sub = Ti.UI.createButton({
		backgroundImage : '/images/sub-button-1.png',
		left : 0,
		height : 45,
		width : 45,
	});

	var lbl_count = Ti.UI.createLabel({
		color : '#fff',
		font : {
			fontSize : 22,
		},
		text : 1,
		width : 30,
		height : 35,
		textAlign : 'center'
	});
	btn_add.lbl_count = lbl_count;
	btn_sub.lbl_count = lbl_count;

	btn_add.addEventListener('click', function(e) {
		if (_limit) {
			if (parseInt(e.source.lbl_count.text) < _limit) {
				e.source.lbl_count.text = parseInt(e.source.lbl_count.text) + 1;
			}
		} else {
			e.source.lbl_count.text = parseInt(e.source.lbl_count.text) + 1;
		}
	});

	btn_sub.addEventListener('click', function(e) {
		if (parseInt(e.source.lbl_count.text) != 0) {
			e.source.lbl_count.text = parseInt(e.source.lbl_count.text) - 1;
		}
	});

	view_counter.add(btn_sub);
	view_counter.add(lbl_count);
	view_counter.add(btn_add);

	container.add(lbl_title);
	container.add(view_counter);
	container.countObj = lbl_count;

	return container;
};

function getSubmitView(_title, _callback) {

	var container = Ti.UI.createView({
		top : 10,
		height : 40,
		width : '95%',
		backgroundColor : '#303030',
		borderRadius : 5,
	});

	var lbl_option = Ti.UI.createLabel({
		color : '#fff',
		font : {
			fontSize : 14,
		},
		text : _title,
		textAlign : 'left',
		width : Ti.UI.SIZE,
		left : 5,
		right : 50
	});

	var switch_option = Ti.UI.createImageView({
		width : 40,
		right : 5,
		height : Ti.UI.SIZE,
		image : '/images/switch_off.png',
		pOtion : _title,
	});
	switch_option.addEventListener('click', function(e) {
		if (e.source.image == '/images/switch_off.png') {
			e.source.image = '/images/switch_on.png';
			_callback(true, e.source.pOtion);
		} else {
			e.source.image = '/images/switch_off.png';
			_callback(false, e.source.pOtion);
		}
	});
	container.add(lbl_option);
	container.add(switch_option);

	return container;
}

function getScannerView(_title, _callback, _type) {

	var container = Ti.UI.createView({
		top : 10,
		height : 50,
		width : '80%',
		backgroundColor : '#303030',
		borderRadius : 5,
	});

	var lbl_option = Ti.UI.createLabel({
		color : '#fff',
		font : {
			fontSize : 14,
		},
		text : _title,
		textAlign : 'left',
		width : Ti.UI.FILL,
		height : 50,
		left : 50
	});

	var scan_option = Ti.UI.createImageView({
		width : 40,
		left : 5,
		height : Ti.UI.SIZE,
		image : '/images/qr_code.png',
		pOtion : _title,
	});
	// container.addEventListener('click', function(e) {
	// _callback(_type);
	// });
	lbl_option.addEventListener('click', function(e) {
		_callback(_type);
	});
	// scan_option.addEventListener('click', function(e) {
	// _callback(_type);
	// });
	container.add(lbl_option);
	container.add(scan_option);

	return container;
}

function getSwitchView(_title, _callback) {

	var container = Ti.UI.createView({
		top : 10,
		height : 48,
		width : '80%',
		backgroundColor : 'transparent',
		borderRadius : 5,
	});

	var lbl_option = Ti.UI.createLabel({
		color : '#848484',
		font : {
			fontSize : 14,
		},
		color : '#303030',
		text : _title,
		textAlign : 'left',
		width : Ti.UI.SIZE,
		left : 0,
		right : 50
	});

	var switch_option = Ti.UI.createImageView({
		width : 40,
		right : 5,
		height : Ti.UI.SIZE,
		image : '/images/switch_off.png',
		pOtion : _title,
	});
	var sep_first = Ti.UI.createView({
		height : 1,
		bottom : 1,
		width : Ti.UI.FILL,
		backgroundColor : '#848484',
	});
	switch_option.addEventListener('click', function(e) {
		if (e.source.image == '/images/switch_off.png') {
			e.source.image = '/images/switch_on.png';
			_callback('1', e.source.pOtion);
		} else {
			e.source.image = '/images/switch_off.png';
			_callback('0', e.source.pOtion);
		}
	});
	container.add(lbl_option);
	container.add(switch_option);
	container.add(sep_first);

	return container;
}

function getPhotoView(_title) {

	var container = Ti.UI.createView({
		top : 10,
		height : 48,
		width : '80%',
		backgroundColor : 'transparent',
		borderRadius : 5,
	});

	var lbl_option = Ti.UI.createLabel({
		//color : '#848484',
		font : {
			fontSize : 14,
		},
		color : '#303030',
		text : _title,
		textAlign : 'left',
		width : Ti.UI.SIZE,
		left : 0,
		right : 50,
		bottom : 10
	});

	var icon_photo = Ti.UI.createImageView({
		width : 40,
		right : 5,
		height : Ti.UI.SIZE,
		image : '/images/icon_picture_small.png',
	});
	var sep_first = Ti.UI.createView({
		height : 1,
		bottom : 1,
		width : Ti.UI.FILL,
		backgroundColor : '#848484',
	});

	container.icon_photo = icon_photo;

	container.add(lbl_option);
	container.add(icon_photo);
	container.add(sep_first);

	return container;
}

function getSubmitViewII(bgColor, _title) {

	var container = Ti.UI.createView({
		top : 10,
		height : 40,
		width : '95%',
		backgroundColor : bgColor,
		borderRadius : 5,
	});

	var lbl_option = Ti.UI.createLabel({
		color : '#303030',
		font : {
			fontSize : 14,
		},
		text : _title,
		textAlign : 'center',
		width : Ti.UI.FILL,
		left : 5,
		right : 50
	});

	container.add(lbl_option);

	return container;
}

function getContactsView(_image, _title, _callback) {
	var parent = Ti.UI.createView({
		height : 60,
		width : 120
	});
	var icon = Ti.UI.createImageView({
		height : 40,
		width : 40,
		top : 5,
		image : _image
	});

	icon.addEventListener('click', function() {
		_callback();
	});

	var lbl_option = Ti.UI.createLabel({
		color : '#fff',
		font : {
			fontSize : 11,
		},
		text : _title,
		textAlign : 'center',
		width : Ti.UI.FILL,
		top : 47
	});
	parent.add(icon);
	parent.add(lbl_option);
	parent.icon = icon;
	parent.lbl_option = lbl_option;

	return parent;
};

function getHomeView(_callback) {
	var view_home = Ti.UI.createView({
		right : 15,
		top : 15,
		height : 50,
		width : 50,
		backgroundColor : '#bfbfbf'
	});
	var lbl_home = Ti.UI.createLabel({
		bottom : 5,
		color : '#313131',
		font : {
			fontSize : 9,
		},
		text : App.selectText('home'),
		textAlign : 'center',
		bubbleParent : true
	});

	var icon_home = Ti.UI.createImageView({
		bottom : 20,
		width : 22.5,
		height : Ti.UI.SIZE,
		image : "/images/icon_home_nav_dark.png"
	});

	view_home.addEventListener('click', function() {
		_callback();
	});

	view_home.icon_home = icon_home;
	view_home.lbl_home = lbl_home;
	view_home.add(lbl_home);
	view_home.add(icon_home);

	return view_home;
};

function errorView() {
	var view_error = Ti.UI.createView({
		top : 0,
		height : 0,
		visible : false,
		width : Ti.UI.SIZE,
		layout : 'horizontal'
	});
	var lbl_home = Ti.UI.createLabel({
		color : '#cd2b2b',
		font : {
			fontSize : 14,
		},
		text : 'Please fix errors below',
		textAlign : 'center',
		bubbleParent : true
	});

	var icon_home = Ti.UI.createImageView({
		width : 35,
		height : Ti.UI.SIZE,
		image : "/images/icon_error.png"
	});

	view_error.add(icon_home);
	view_error.add(lbl_home);

	return view_error;
}

function getKeyboardToolbar(_tfObject) {
	var send = Titanium.UI.createButton({
		title : 'Done',
		style : Titanium.UI.iOS.SystemButtonStyle.DONE,
	});

	var flexSpace = Titanium.UI.createButton({
		systemButton : Titanium.UI.iOS.SystemButton.FLEXIBLE_SPACE
	});

	var cancel = Titanium.UI.createButton({
		title : 'Cancel',
		style : Titanium.UI.iOS.SystemButtonStyle.DONE,
	});

	send.addEventListener('click', function(e) {
		var parent = e.source._tfObject;
		parent.blur();
	});
	cancel.addEventListener('click', function(e) {
		var parent = e.source._tfObject;
		parent.blur();
	});
	send._tfObject = _tfObject;
	cancel._tfObject = _tfObject;

	var toolbar = Titanium.UI.iOS.createToolbar({
		items : [cancel, flexSpace, send],
		bottom : 0,
		borderTop : true,
		borderBottom : false
	});

	return toolbar;
};

function getPassCodetextField() {
	var textField = Ti.UI.createTextField({
		color : styles.textfield.color,
		font : {
			fontSize : 22,
		},
		backgroundColor : styles.textfield.backgroundColor,
		borderColor : '#ccc',
		borderStyle : Titanium.UI.INPUT_BORDERSTYLE_NONE,
		keyboardType : Ti.UI.KEYBOARD_DECIMAL_PAD,
		returnKeyType : Ti.UI.RETURNKEY_DONE,
		height : 60,
		borderRadius : 30,
		textAlign : 'center',
		maxLength : 1,
		width : 60,
		left : 5
	});

	return textField;
};

exports.label = getLabel;
exports.getUIContainerWithTf = getUIContainerWithTf;
exports.textFieldWOLabel = getTextFieldWOLabel;
exports.textField = getTextField;
exports.passCodetextField = getPassCodetextField;
exports.picker = getPickerView;
exports.pickeriOS = getiOSPickerToolBar;
exports.buttonView = getButtonView;
exports.submitView = getSubmitView;
exports.submitViewII = getSubmitViewII;
exports.switchView = getSwitchView;
exports.photoView = getPhotoView;
exports.contactsView = getContactsView;
exports.homeIcon = getHomeView;
exports.errorView = errorView;
exports.scanButton = getScannerView;
exports.toolBar = getKeyboardToolbar;
