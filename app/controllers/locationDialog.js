var args = arguments[0] || {};
var C2 = Alloy.Globals.C2;

var m_okCallback = null;
var m_cancelCallback = null;

function showLoading(msg) {
	$.loadingView.visible = true;
	$.activityIndicator.message = msg || "Loading...";
	$.activityIndicator.show();
}

function hideLoading() {
	$.loadingView.visible = false;
	$.activityIndicator.hide();
}

function ok() {
	
	$.txtSection.blur();
	$.txtRow.blur();
	$.txtSeat.blur();
	
	var section = $.txtSection.value;
	var row = $.txtRow.value;
	var seat = $.txtSeat.value;
	
	if(!section) {
		C2.showAlert("Enter Section", "Please enter your section to check if we can deliver to you");
		return;
	} else if(!row) {
		C2.showAlert("Enter Row", "Please enter your row to check if we can deliver to you");
		return;
	} else if(!seat) {
		C2.showAlert("Enter Seat", "Please enter your seat to check if we can deliver to you");
		return;
	}
	
	// verify delivery here?
	showLoading("Checking for delivery...");
	C2.getVendorDeliverySections(C2.vendor.get("id"), function(sections) {
		console.log("vendor sections", sections);
		hideLoading();
		
		Ti.API.info('===sections=== '+sections);
		var canDeliver = _.some(sections, function(s) { return s.CanDeliver && s.Section.toLowerCase() == section.toLowerCase(); });
		
		if(canDeliver) {
			// set global section / row / seat?
			C2.customerSection = section;
			C2.customerRow = row;
			C2.customerSeat = seat;
			C2.refreshFooter();
			
			if(m_okCallback) {
				m_okCallback(section, row, seat);
			} else {
				hide();
			}
		} else {
			C2.showAlert("No delivery option available for your section", 
				"Unfortunately this vendor can not deliver to your section at this time");	
		}
	}, function () {
		hideLoading();
		C2.showAlert("Unable to check for delivery", "Unable to check vendor for delivery, check your network connection");
	});	
}

function cancel() {
	if(m_cancelCallback) {
		m_cancelCallback();
	} else {
		$.locationPicker.visible = false;
	}
}

function hide() {
	$.locationPicker.visible = false;
}

exports.show = function(okCallback, cancelCallback, title) {
	m_okCallback = okCallback;
	m_cancelCallback = cancelCallback;
	
	$.lblTitle.text = title || "Enter your location to check for delivery:";
	
	if(C2.customerSection) $.txtSection.value = C2.customerSection;
	if(C2.customerRow) $.txtRow.value = C2.customerRow;
	if(C2.customerSeat) $.txtSeat.value = C2.customerSeat;
	
	$.locationPicker.visible = true;
};
exports.showing = function() {
	return $.locationPicker.visible;
};
exports.hide = hide;

