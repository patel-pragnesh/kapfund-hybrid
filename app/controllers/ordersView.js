var args = arguments[0] || {};
var C2 = Alloy.Globals.C2;

function beginNewOrder() {
	console.log("begin new order");
	// switch to searchVenues view
	C2.switchView(4);
}
