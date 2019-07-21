var args = arguments[0] || {};

var iOS7 = Alloy.Globals.isiOS7Plus();
var C2 = Alloy.Globals.C2;

var callback = args.callback;

$.window.top = iOS7 ? 20 : 0;

var canDeliver = false;
var allVendors = [];
var showingVendorView = false;
var showingOrderTypeView = false;

var viewIndexes = {
	venueView : 0,
	vendorView : 1,
	orderTypeView : 2,
	seatView : 3
};

var visibleViewIndex = 0;

var localVenue;

function setTitle(title) {
	$.lblTitle.text = "- " + title;
}

function close() {
	$.window.close();
	$.destroy();
}

$.window.addEventListener('androidback', function(e) {
	goBack();
});

function goBack() {
	console.log("going back...", showingVendorView);
	if (showingVendorView) {
		if (canDeliver) {
			C2.swapViewsBack($.vendorView, $.orderTypeView, function() {
				showingVendorView = false;
				showingOrderTypeView = true;
			});
			setTitle("Select Order Type");
		} else {
			toggleVendorVenues();
		}
	} else if (showingOrderTypeView) {
		C2.swapViewsBack($.orderTypeView, $.venueView, function() {
			showingVendorView = false;
			showingOrderTypeView = false;
		});
		setTitle("Select Venue");
	} else {
		console.log("calling close....");
		close();
	}
}

function showLoading(txt) {
	if (txt) {
		$.lblSearchTxt.text = txt;
	} else {
		$.lblSearchTxt.text = "Searching...";
	}
	$.loadingView.visible = true;
}

function hideLoading() {
	$.loadingView.visible = false;
}

function blurSearchTxt() {
	if (Alloy.Globals.isAndroid) {
		$.txtSearchAndroid.blur();
	} else if (Alloy.Globals.isIOS) {
		$.txtSearchIOS.blur();
	}
}

function showAndroidGPSIntent() {
	Titanium.Geolocation.requestLocationPermissions(Titanium.Geolocation.AUTHORIZATION_WHEN_IN_USE, function(e) {
		if (e.success) {
			searchByCurrentLoc();
		}
	});
}

function searchByCurrentLoc() {
	if (Ti.Geolocation.locationServicesEnabled) {

		Titanium.Geolocation.purpose = 'Get Current Location';
		Titanium.Geolocation.getCurrentPosition(function(e) {
			if (e.error) {
				Ti.API.error('Error: ' + e.error);
				alert("Error getting coords: " + e.error);
			} else {
				Ti.API.info(e.coords);
				showLoading();
				C2.getVenueLocationsByLatLong(e.coords.latitude, e.coords.longitude, handleResp, handleErr);
			}
		});
	} else {
		if (Alloy.Globals.isAndroid) {
			showAndroidGPSIntent();
		} else {
			alert('Please enable location services');
		}
	}
}

function handleResp(resp, status, msg) {
	hideLoading();
	if (status == 1) {

		if (resp && resp.length) {
			console.log("found " + resp.length + " venues: " + resp);
			$.lstVenues.visible = true;
			$.lblVenueCount.text = "Nearby Venues (" + resp.length + ")";

			var items = getVenueItemData(resp);

			$.venueList.setItems(items);

			if (!Alloy.Globals.lastVendorID) {
				selectVenueItem(items[0]);
			}

		} else {
			$.lstVenues.visible = true;
			$.lblVenueCount.text = "No venues found";
			$.venueList.setItems([]);
		}
	} else {
		alert("Error getting location for '" + query + "': " + msg);
	}
}

function handleErr() {
	alert("Error getting location for " + query + ", unable to connect to service");
	hideLoading();
}

var query = "";

function selectPickup() {
	C2.selectPickup();

	var items = getVendorItemData(allVendors);
	$.vendorList.setItems(items);

	showVendors();
}

function selectDelivery() {
	var section = $.txtSection.value;
	var row = $.txtRow.value;
	var seat = $.txtSeat.value;

	if (!section) {
		C2.showAlert("Enter Section", "Please enter your section to check if we can deliver to you");
		return;
	} else if (!row) {
		C2.showAlert("Enter Row", "Please enter your row to check if we can deliver to you");
		return;
	} else if (!seat) {
		C2.showAlert("Enter Seat", "Please enter your seat to check if we can deliver to you");
		return;
	}

	// loop through vendors and find vendors that have that section
	var deliveryVendors = _.filter(allVendors, function(vendor) {
		return _.some(vendor.VendorSections, function(s) {
			return s.CanDeliver && s.Section.toLowerCase() == section.toLowerCase();
		});
	});

	if (deliveryVendors.length) {
		C2.selectDelivery(section, row, seat);
		var items = getVendorItemData(deliveryVendors);
		$.vendorList.setItems(items);
		showVendors();
	} else {
		C2.showAlert('Delivery not available at this time', 'Unfortunately, there are no vendors that can deliver to your section at this time.');
	}

}

function selectLocation() {
	var deliveryVendors = _.filter(allVendors, function(vendor) {
		return _.some(vendor.VendorSections, function(s) {
			return s.CanDeliver;
		});
	});
	if (deliveryVendors.length) {
		C2.selectTrackDelivery();
		var items = getVendorItemData(deliveryVendors);
		$.vendorList.setItems(items);
		showVendors();
	} else {
		C2.showAlert('Delivery not available at this time', 'Unfortunately, there are no vendors that can deliver to your section at this time.');
	}

}

function searchVenues() {
	blurSearchTxt();
	showLoading();

	console.log("PLATFORM", Ti.Platform.name);

	query = Alloy.Globals.isIOS ? $.txtSearchIOS.value : $.txtSearchAndroid.value;

	C2.getVenueLocations(query, function(resp, status, msg) {
		handleResp(resp, status, msg);
	}, function() {
		handleErr();
	});
}

function toggleVendorVenues() {
	if (!showingVendorView) {
		C2.swapViews($.venueView, $.vendorView, function() {
			showingVendorView = !showingVendorView;
		});
		setTitle("Select Vendor");
	} else {
		C2.swapViewsBack($.vendorView, $.venueView, function() {
			showingVendorView = !showingVendorView;
		});
		setTitle("Select Venue");
	}
}

function showVendors() {
	if (showingOrderTypeView) {
		C2.swapViews($.orderTypeView, $.vendorView, function() {
			showingVendorView = true;
			showingOrderTypeView = false;
		});
		setTitle("Select Vendor");
	} else if (!showingVendorView) {
		toggleVendorVenues();
	}
}

function showOrderType() {
	C2.swapViews($.venueView, $.orderTypeView, function() {
		showingVendorView = false;
		showingOrderTypeView = true;
	});
	setTitle("Select Order Type");
}

/*
 function selectDelivery() {
 var dialog = Ti.UI.createAlertDialog({
 title: 'Delivery not available at this time',
 ok: 'OK',
 message: 'Unfortunately, there are no vendors that can deliver to your seat at this time.'
 });
 dialog.show();
 }*/

function selectVenueItem(item) {
	// we select this venue and show this venue's vendors
	//C2.setVenue(item.id, item.venueName.text, item.venueAddress.text, item.venueCityStateZip.text);

	canDeliver = false;

	localVenue = {
		id : item.id,
		name : item.venueName.text,
		address : item.venueAddress.text,
		cityStateZip : item.venueCityStateZip.text
	};

	showLoading("Loading...");
	var data = {
		VenueID : item.id
	};
	C2.getVendors(data, function(resp, status, msg) {
		hideLoading();
		if (status == 1) {
			if (resp && resp.length) {
				console.log("found " + resp.length + " vendors: " + resp);
				$.lblVendorSelect.text = "Select vendor to place order at:";
				allVendors = resp;

				// check if any of these vendors can deliver
				for (var i = 0; i < allVendors.length; i++) {
					var item = allVendors[i];
					if (item.CanDeliver == true) {
						canDeliver = true;
						console.log("found vendor that can deliver", item);
						break;
					}
				}

				var items = getVendorItemData(resp);
				$.vendorList.setItems(items);
			} else {
				$.lblVendorSelect.text = "No vendors found";
				$.vendorList.setItems([]);
			}

			if (canDeliver) {
				showOrderType();
			} else {
				showVendors();
			}
		} else {
			alert("Error getting vendors: " + msg);
		}

	}, function() {
		hideLoading();
		alert("Error getting venue's vendors, unable to connect to service");
	});
}

function venueItemClick(e) {
	var item = e.section.getItemAt(e.itemIndex);

	console.log("item clicked", item);

	selectVenueItem(item);
}

function vendorItemClick(e) {

	/*
	 if(C2.orderType == 2) {
	 C2.orderTypeText = "DELIVERY";
	 // do we anything special if delivery?
	 } else {
	 C2.orderTypeText = "PICKUP";
	 }
	 */

	var item = e.section.getItemAt(e.itemIndex);
	console.log("item clicked", item);
	C2.clearCart();

	console.log("setting vendor/venue info");
	C2.setVenue(localVenue.id, localVenue.name, localVenue.address, localVenue.cityStateZip);
	console.log("setting vendor...");
	C2.setVendor(item.id, item.vendorName.text, item.vendorDescription.text, item.serviceFee, item.vendor, item.canDeliver);

	if (!item.canDeliver) {
		C2.selectPickup();
	}

	/*
	 C2.venue.set("name", localVenue.name);
	 C2.vendor.set(
	 {
	 id: item.id,
	 name: item.vendorName.text,
	 description: item.vendorDescription.text,
	 serviceFee: item.serviceFee
	 }
	 );
	 C2.venue.save();
	 C2.vendor.save();

	 console.log("set vendor", C2.vendor.get("id"));
	 */

	Ti.App.Properties.setString("lastVendorID", item.id);
	Alloy.Globals.lastVendorID = item.id;

	if (callback) {
		console.log("invoking callback");
		callback();
	}

	//alert("vendor set calling refresh");
	//Ti.App.fireEvent("refreshMainWindow");

	close();

	// update menu if mainWindow currently showing menu
	if (C2.mainWindow.currentViewName() == "vendorMenuView") {
		C2.goToVendorMenu();
	}

}

// converts venue array data from server into list item data
function getVenueItemData(venues) {
	var itemData = [];
	for (var i = 0; i < venues.length; i++) {
		var venue = venues[i];
		var data = {
			venueName : {
				text : venue.VenueName
			},
			venueAddress : {
				text : venue.Address
			},
			venueCityStateZip : {
				text : venue.City + ", " + venue.State + " " + venue.Zip
			},
			venueMiles : {
				text : "| " + parseFloat(venue.DistanceAwayInMiles).toFixed(2) + " mi"
			},
			id : venue.ID,
			status : venue.Status,
			height : 200
		};
		itemData.push(data);
	}
	return itemData;
}

// converts vendor array data from server into list item data
function getVendorItemData(vendors) {
	var itemData = [];
	for (var i = 0; i < vendors.length; i++) {
		var vendor = vendors[i];
		var orderTypeText = "PICKUP";
		var orderTypeColor = "#ba2731";
		if (vendor.CanDeliver && C2.orderType == 2) {
			orderTypeText = "DELIVERY";
			orderTypeColor = "#5568a2";
		}

		if (vendor.IsActive) {
			var data = {
				id : vendor.ID,
				canDeliver : vendor.CanDeliver,
				serviceFee : vendor.ServiceFee,
				isActive : vendor.IsActive,
				venueName : {
					text : localVenue.name
				},
				vendorName : {
					text : vendor.Name
				},
				vendorDescription : {
					text : vendor.Description
				},
				vendor : vendor,
				orderTypesText : {
					text : orderTypeText,
					color : orderTypeColor
				}
			};
			itemData.push(data);
		}
	}
	return itemData;
}

$.window.addEventListener("open", function() {
	if (!Alloy.Globals.lastVendorID) {
		searchByCurrentLoc();
	}
});
