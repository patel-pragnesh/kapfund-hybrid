if (Alloy.Globals.isIOS) {
	// exports.createView = function(args) {
	// var bpconc_keyboard_module = require('com.bpc.keyboard');
	// console.log("in createView", bpconc_keyboard_module.example());
	// var ret = bpconc_keyboard_module.createView({
	// width : Ti.UI.FILL,
	// height : Ti.UI.FILL
	// });
	//
	// console.log(ret.someTest);
	//
	// return ret;
	// };
	exports.createView = function(args) {
		return Titanium.UI.createView();
	};
} else {
	exports.createView = function(args) {
		return Titanium.UI.createView();
	};
}

