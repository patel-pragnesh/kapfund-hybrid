var args = arguments[0] || {};

var iOS7 = Alloy.Globals.isiOS7Plus();
var C2 = Alloy.Globals.C2;

var cancelRotation = false;
var imgIndex = 4;
var goDown = false;
var imgs = [$.img1, $.img2, $.img3, $.img4, $.img5];

// check screen size

if (Alloy.Globals.screenHeight > 1000) {
	console.log("screen height", Alloy.Globals.screenHeight);
	$.imagesView.height = "60%";
	$.optionListView.top = "60%";
}

var animateIntoFocus = Ti.UI.createAnimation({
	opacity : 1.0,
	curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
	duration : 750
});

var animateOutOfFocus = Ti.UI.createAnimation({
	opacity : 0.0,
	curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
	duration : 750
});

// *************
// private functions

function openTracker() {
	var win_mileageTracker = require("map/mileageTracker");
	var windowInstance = new win_mileageTracker();
	windowInstance.open();
}

function goToPastOrders() {
	C2.mainWindow.goToPastOrders(function() {
		C2.mainWindow.goToHome();
	});
}

function openMenu() {

}

function openVenueWindow(venArgs) {
	C2.openVenueSelectionWindow(venArgs);
}

function startOrder() {
	C2.goToVendorMenu();
	return;
	/*if(C2.vendor.has("id")) {
	 C2.mainWindow.showLoading("Getting menu...");
	 C2.getMenuItemsForCustomer({VendorID: C2.vendor.get("id")}, function(resp, status, msg) {
	 console.log("menu resp", resp, status, msg);
	 if(status == 1) {
	 console.log("got menu successfully");
	 var imageBlob = Ti.Utils.base64decode(resp[0].Image);
	 }
	 C2.mainWindow.hideLoading();
	 C2.mainWindow.goToVendorMenu();

	 }, function(e) {
	 console.log("Error getting menu items:", e);
	 C2.mainWindow.hideLoading();
	 });
	 } else {
	 openVenueWindow({callback: function() {
	 if(C2.vendor.has("id")) startOrder();
	 }});
	 }*/
}

function test() {
	C2.mainWindow.notify('testing from home');
}

function view_removed() {
	console.log("home view removed...");
	cancelRotation = true;
}

function rotatePicture() {
	var current = imgs[imgIndex];

	//console.log("home current imgIndex", imgIndex);
	if (goDown) {
		imgIndex--;
	} else {
		imgIndex++;
	}

	if (imgIndex < 0) {
		imgIndex = 1;
		goDown = false;
	} else if (imgIndex >= imgs.length) {
		imgIndex = imgs.length - 2;
		goDown = true;
	}

	//console.log("next index..", imgIndex, goDown);

	if (goDown) {
		//console.log("animating current out of focus...", current.id);
		current.animate(animateOutOfFocus);
	} else {
		var next = imgs[imgIndex];
		//console.log("animating next into focus", next.id);
		next.animate(animateIntoFocus);
	}
}

function doRotation() {
	setTimeout(function() {
		if (!cancelRotation) {
			rotatePicture();
			doRotation();
		}
	}, 2500);
}

doRotation();

exports.view_removed = view_removed;
