var iOS7 = Alloy.Globals.isiOS7Plus();
$.window.top = iOS7 ? 20 : 0;

var C2 = Alloy.Globals.C2;

var currentView = null;
var currentViewId = 0;
var args = arguments[0] || {};

var VIEW_ORDERS = 1;
var VIEW_SETTINGS = 2;
var VIEW_CART = 3;
var VIEW_SEARCHVENUES = 4;

function switchView(newView) {
	
	console.log("switchView", newView);
	
	if(newView == currentViewId) return;
	
	currentViewId = newView;
	
	var viewName = null;
	switch(newView) {
		case (VIEW_ORDERS):
			viewName = "ordersView";
			// any other stuff we need to do?
		break;
		case (VIEW_SEARCHVENUES):
			viewName = "searchVenues";
		break;
		default:
		break;
	}
	
	if(viewName) {
		if(currentView) {
			$.contentView.remove(currentView);
		} 
	
		currentView = Alloy.createController(viewName).getView();
		$.contentView.add(currentView);
	}
}

function test() {
	switchView(VIEW_ORDERS);
}

function test2() {
	$.contentView.remove(currentView);
	currentViewId = 0;
}

function rightBtn_click() {
	console.log("right button click");
	$.window.close();
}

$.contentView.height = Ti.Platform.displayCaps.platformHeight - $.navView.height - $.tabView.height;

// set up all order views here, build a stack?
// maintain current view "state"

// or just seperate windows for everything?

C2.contentView = $.contentView;
C2.applicationWindow = $.window;
C2.switchView = switchView;
switchView(VIEW_ORDERS);

