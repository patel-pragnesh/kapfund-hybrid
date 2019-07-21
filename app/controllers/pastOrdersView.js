var args = arguments[0] || {};
var C2 = Alloy.Globals.C2;
var pastOrders = Alloy.Collections.pastOrders;

function orderItemClick(e) {
	Ti.API.info('====orderItemClick==== ' + JSON.stringify(e));
	e.source.backgroundColor = "#e2e3e4";
	var item = e.section.getItemAt(e.itemIndex);
	C2.openOrderStatus(item.id.text, refreshLocalOrders);

	// var row = $.lstVenues.sections[e.sectionIndex].getItemAt(e.itemIndex);
	// if (row.Status.text == "Delivering") {
	// row.trackOrder.visible = true;
	// $.lstVenues.sections[e.sectionIndex].updateItemAt(e.itemIndex, row, {
	// animated : false
	// });
	// }
}

function orderItemClickTrack(e) {
	// Ti.API.info('====openTracker==== ' + JSON.stringify(e));
	// var item = e.section.getItemAt(e.itemIndex);
	// var win_mileageTracker = require("map/mileageTracker");
	// var windowInstance = new win_mileageTracker(item.id.text);
	// windowInstance.open();

	Ti.API.info('====orderItemClick==== ' + JSON.stringify(e));
	e.source.backgroundColor = "#e2e3e4";
	var item = e.section.getItemAt(e.itemIndex);

	if (Ti.Platform.osname == 'android') {
		Titanium.Android.requestPermissions(['android.permission.ACCESS_FINE_LOCATION', 'android.permission.ACCESS_COARSE_LOCATION'], function(e) {
			Ti.API.info('HAS WRITE_EXTERNAL_STORAGE, READ_EXTERNAL_STORAGE AND CAMERA PERMISSION ' + JSON.stringify(e));
			C2.openOrderStatusForTracking(item.id.text, refreshLocalOrders);
		});
	} else {
		C2.openOrderStatusForTracking(item.id.text, refreshLocalOrders);
	}

	// var row = $.lstVenues.sections[e.sectionIndex].getItemAt(e.itemIndex);
	// if (row.Status.text == "Delivering") {
	// row.trackOrder.visible = true;
	// $.lstVenues.sections[e.sectionIndex].updateItemAt(e.itemIndex, row, {
	// animated : false
	// });
	// }

}

function refreshLocalOrders() {
	pastOrders.fetch();
}

function orderItemTouchStart(e) {
	e.source.backgroundColor = "#20283e";
}

function orderItemTouchCancel(e) {
	e.source.backgroundColor = "#e2e3e4";
}

pastOrders.fetch();

pastOrders.comparator = function(a) {
	return -a.get("id");
};

pastOrders.sort();

$.lblOrderCount.text = "Past Orders (" + pastOrders.models.length + ")";

function checkIfOrdersAreInDeliveryStage() {
	Ti.API.info('pastOrders.models ' + JSON.stringify(pastOrders.models));
	Ti.API.info('$.lstVenues.getSection(); ' + $.lstVenues.getSectionCount());
	var items = $.lstVenues.sections[0].getItems();
	for (var i = 0; i < items.length; i++) {

		var row = $.lstVenues.sections[0].getItemAt(i);

		Ti.API.info('====row.Status.text===== ' + row.Status.text);

		if (row.Status.text == "Delivering") {
			row.trackOrder.visible = true;
			$.lstVenues.sections[0].updateItemAt(i, row, {
				animated : false
			});
		} else {
			row.trackOrder.visible = false;
		}
	};

};
//checkIfOrdersAreInDeliveryStage();

Ti.API.info('=====pastOrders.models ' + JSON.stringify(pastOrders.models));
