var styles = require('/config/general').Styles;
function headerBar(args) {

	var _callback = args._callback;
	var _addConfigure = args._addConfigure;
	var _addHome = args._addHome;
	var _addMenu = args._addMenu;

	var topBarParent = Ti.UI.createView({
		top : 5,
		height : 80,
		width : Ti.UI.FILL
	});

	var logo = Ti.UI.createImageView({
		left : 15,
		top : 0,
		height : 80,
		width : Ti.UI.SIZE,
		image : Ti.App.Properties.getString('branching_userSelection'),//"/images/logo1.png"
	});

	var view_config = Ti.UI.createView({
		right : 75,
		height : 50,
		width : 50,
		backgroundColor : '#bfbfbf'
	});

	var view_menu = Ti.UI.createView({
		right : 15,
		height : 50,
		width : 50,
		backgroundColor : '#bfbfbf'
	});

	var view_home = Ti.UI.createView({
		left : 15,
		height : 50,
		width : 50,
		backgroundColor : '#bfbfbf'
	});

	view_config.addEventListener('click', function() {
		_callback(false);
	});

	view_menu.addEventListener('click', function() {
		_callback(true);
	});

	view_home.addEventListener('click', function() {
		_callback('home');
	});

	var lbl_config = Ti.UI.createLabel({
		bottom : 5,
		color : '#313131',
		font : {
			fontSize : 9,
		},
		text : 'Configure',
		textAlign : 'center',
		bubbleParent : true
	});

	var lbl_menu = Ti.UI.createLabel({
		bottom : 5,
		color : '#313131',
		font : {
			fontSize : 9,
		},
		text : 'Menu',
		textAlign : 'center',
		bubbleParent : true
	});

	var icon_menu = Ti.UI.createImageView({
		bottom : 20,
		width : '70%',
		height : Ti.UI.SIZE,
		image : "/images/icon_menu.png"
	});

	var icon_config = Ti.UI.createImageView({
		bottom : 20,
		width : 22.5,
		height : Ti.UI.SIZE,
		image : "/images/icon_configure.png"
	});

	var lbl_home = Ti.UI.createLabel({
		bottom : 5,
		color : '#313131',
		font : {
			fontSize : 9,
		},
		text : 'Back',
		textAlign : 'center',
		bubbleParent : true
	});

	var icon_home = Ti.UI.createImageView({
		bottom : 20,
		width : 22.5,
		height : Ti.UI.SIZE,
		image : "/images/btn_back.png"
	});

	view_config.add(lbl_config);
	view_config.add(icon_config);
	view_menu.add(lbl_menu);
	view_menu.add(icon_menu);
	view_home.add(lbl_home);
	view_home.add(icon_home);

	topBarParent.add(logo);
	if (_addMenu) {
		topBarParent.add(view_menu);
	}
	if (_addConfigure) {
		topBarParent.add(view_config);
	}
	if (_addHome) {
		topBarParent.add(view_home);
	}

	return topBarParent;

}

//make constructor function the public component interface
module.exports = headerBar;
