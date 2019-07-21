var args = arguments[0] || {};
var iOS7 = Alloy.Globals.isiOS7Plus();
var C2 = Alloy.Globals.C2;
var orderInfo = args[0];
var callback = args[1];

var moment = require('moment');

var pastOrders = Alloy.Collections.pastOrders;


var stopPolling = false;

$.window.top = iOS7 ? 20 : 0;

// *************
// styles
var textColor = "#3b1213";
var itemFont = { fontWeight: "bold", fontSize: 12 };
var addOnFont = {
	fontWeight: "normal",
	fontSize: 10,
};

// *************
// animations used in this window
var animateHideNotify = Ti.UI.createAnimation({
	opacity: 0,
	curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
	duration : 500
});
var animateShowNotify = Ti.UI.createAnimation({
	opacity: 0.9,
	curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
	duration : 500
});

var animateShow = Ti.UI.createAnimation({
	opacity: 1.0,
	curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
	duration : 500
});

// *************
// loading functions
function showLoading(msg) {
	if(msg) {
		$.lblLoading.text = msg;
	} else {
		$.lblLoading.text = "LOADING...";
	}
	$.loadingView.visible = true;
}
function hideLoading() {
	$.loadingView.visible = false;
}

// *************
// window events
$.window.addEventListener("close", function() {
	stopPolling = true;
	console.log("closing checkout window...");
	$.destroy();
});


// *************
// private functions 
function notify(msg) {
	$.lblMsg.text = msg;
	$.notificationView.visible = true;
	$.notificationView.bottom = $.cartActionsView.height;
	$.notificationView.animate(animateShowNotify, function() {
		setTimeout(function() {
			$.notificationView.animate(animateHideNotify, function() {
				$.notificationView.visible = false;
			});
		}, 1500);
	});
}

// *************
// button events
function goBack() {
	if(callback) callback();
	$.window.close();
}

function refreshOrderInfo() {
	if(orderInfo) {
		
		console.log("order info", orderInfo);
		
		var createdAt = moment.utc(orderInfo.CreatedAt).toDate();
		createdAt = createdAt - createdAt.getTimezoneOffset();
							
		
		$.viewContents.visible = true;
		$.lblOrderNumber.text = "Order #" + orderInfo.VendorOrderNumber;
		
		$.lblFulfillmentType.text = orderInfo.FulfillmentTypeName;
		$.lblCreatedDate.text = moment(createdAt).format("M/D/YYYY h:mm A");
		$.lblVenueName.text = orderInfo.Venue.VenueName;
		$.lblVendorName.text = orderInfo.Vendor.Name;
		if(orderInfo.OrderLocations && orderInfo.OrderLocations.length) {
			var loc = orderInfo.OrderLocations[0];
			$.lblVendorDesc.text = "Vendor will deliver to you at section " + loc.Section + ", row " + loc.Row + ", seat " + loc.Seat;
			$.lblTipAmount.text = "$" + orderInfo.TipAmount.toFixed(2);
			$.viewTip.height = Titanium.UI.SIZE;
			$.viewTip.visible = true;
		} else {
			//$.viewTip.height = 0;
			//$.viewTip.visible = false;
			$.lblVendorDesc.text = orderInfo.Vendor.Description;	
		}
		
		$.lblTipAmount.text = "$" + orderInfo.TipAmount.toFixed(2);
		
		$.lblStatusName.text = orderInfo.OrderStatus.Name;
		$.viewStatus.width = orderInfo.OrderStatus.PercentComplete + "%";
		$.lblSpecialInstructions.text = orderInfo.SpecialInstructions;
		$.lblSubTotal.text = "$" + orderInfo.Subtotal.toFixed(2);
		$.lblServiceCharge.text = "$" + orderInfo.ServiceFee.toFixed(2);
		
		$.lblTotal.text = "$" + orderInfo.Total.toFixed(2);
		
		$.lblSubTotal.right = 0;
		
		// order contents
		//$.viewOrderContents.removeAllChildren();
		for(var i = 0; i < orderInfo.OrderItems.length; i++) {
			var item = orderInfo.OrderItems[i];
			var nameLabel = Ti.UI.createLabel({
				top: 5,
				left: 0,
				color: textColor,
				font: itemFont,
				text: item.MenuItemName + " x " + item.Quantity
			});
			$.viewOrderContents.add(nameLabel);
			if(item.OrderItemAddons) {
				for(var j = 0; j < item.OrderItemAddons.length; j++) {
					var addOn = item.OrderItemAddons[j];
					var addOnLabel = Ti.UI.createLabel({
						top: 0,
						left: 0,
						color: textColor,
						font: addOnFont,
						text: addOn.MenuItemName
					});
					$.viewOrderContents.add(addOnLabel);
				}
			}
			
		}
		
		if(orderInfo.OrderStatus.OrderStatusID == 1) {
			$.btnCancelOrder.hide();
		} else {
			$.btnCancelOrder.hide();
		}
		
		// make visible
		
		$.viewContents.animate(animateShow);
	}
}

refreshOrderInfo();

var pastOrder = null;
pastOrders.fetch();

for(var i =0; i < pastOrders.models.length; i++) {
	var model = pastOrders.models[i];
	
	if(model.id == orderInfo.OrderID) {
		model.fetch();
		pastOrder = model;
	}
	
}

//pastOrder.set("orderStatusName", "TESTING");
//pastOrder.save();

function refreshOrderStatus() {
	if(pastOrder) {
		pastOrder.fetch();
		pastOrder.set("orderStatusID", orderInfo.OrderStatus.OrderStatusID);
		pastOrder.set("orderStatusName", orderInfo.OrderStatus.Name);
		pastOrder.set("orderStatusDescription", orderInfo.OrderStatus.Description);
		pastOrder.set("orderStatusWidth", orderInfo.OrderStatus.PercentComplete + "%");
		pastOrder.save();
	}
	$.lblStatusName.text = orderInfo.OrderStatus.Name;
	$.viewStatus.width = orderInfo.OrderStatus.PercentComplete + "%";
}

function pollStatus() {
	if(!stopPolling) {
		setTimeout(function() {
			
			C2.getCustomerOrderStatus({
				UserGUID: C2.customerGuid.UserGUID,
				OrderID: orderInfo.OrderID
			}, function(resp, status, msg){
				if(status == 1 && resp.length) {
					var newItem = resp[0];
					console.log("resp", newItem);
					if(newItem.OrderStatus.OrderStatusID != orderInfo.OrderStatus.OrderStatusID) {
						orderInfo.OrderStatus = newItem.OrderStatus;
						refreshOrderStatus();
					}
					
					if(!stopPolling && orderInfo.OrderStatus.PercentComplete < 100) pollStatus();
				} else {
					console.log("ERROR polling", msg);
				}
			}, function(err) {
				console.log("ERROR polling, no error", err);
			});
			
			
		}, 5000);
	}
	
}

pollStatus();

/*
function getStatus() {
	
	C2.getCustomerOrder({UserGUID: "90D10ECB-46F1-415A-9D89-B052DFE3F16D", OrderID: 8}, function(data, status, msg) {
		if(status == 1) {
			var orderInfo = data[0];
			console.log("got order info", orderInfo.OrderID);
		
			$.lblOrderNumber.text = "Order #" + orderInfo.VendorOrderNumber;
			
			$.viewContents.visible = true;
			$.viewContents.animate(animateShow);
		}
		
		
	}, function(err) {
		console.log("ERROR getting order info!", err);
	});
}

console.log("getting order status...");
getStatus();
*/



/*
	$.notificationView.visible = false;
	
	// resp {"Message":"Success.","Payload":"{\"OrderID\":8,\"VendorOrderNumber\":\"VEN103\"}","Status":1}
	var resp = {
		Message:"Success."
		,Payload: {OrderID:8,VendorOrderNumber:"VEN103"}
		,Status:1
	};
	
	var success = function(payload, status, msg) {
		if(status == 1) {
			if(cartWindow) {
				cartWindow.close();
				
				// clear cart, set order to empty
				C2.resetOrder();
				$.window.close();
				
			}	
		}
	};
	

	
	*/

