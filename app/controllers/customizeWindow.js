var args = arguments[0] || {};
var iOS7 = Alloy.Globals.isiOS7Plus();
var C2 = Alloy.Globals.C2;
var settings = C2.settings;
var menuItem = args;
settings.fetch();

var condTotal = 0.0;
var totalPrice = 0.0;
var itemQty = 1;
var itemName = menuItem.ItemName.text;
var nameCentered = "    " + itemName + "    ";
var itemPriceTxt = menuItem.PriceText.text;
var itemPrice = parseFloat(menuItem.Price.text);
var itemId = menuItem.id.text;

$.ItemImage.image = menuItem.ItemImage.image;
$.ItemNameHidden.text = nameCentered;
$.PriceTextHidden.text = itemPriceTxt;
$.ItemName.text = nameCentered;
$.ItemNameHidden2.text = itemName;
$.PriceText.text = itemPriceTxt; 

$.lblQty.text = itemQty;

var itemData = [];

$.window.top = iOS7 ? 20 : 0;

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
	console.log("closing checkout window...");
	$.destroy();
});

$.window.addEventListener("open", function() {
	
});

// *************
// button events
function addToCart() {
	
	var addOns = [];
	
	//{id: 1, name: 'Mustard', price: .15, priceTxt: '$0.15'},
	
	for(var i = 0; i < itemData.length; i++) {
		var aItem = itemData[i];
		console.log("aItem.checked", aItem.checked);
		if(aItem.checked.visible == 1) {
			addOns.push({
				id: aItem.id,
				name: aItem.name.text,
				price: aItem.price,
				priceTxt: aItem.priceTxt.text	
			});
		}
	}
	
	var orderItem = {
		id: itemId,
		name: itemName,
		quantity: itemQty,
		price: itemPrice,
		unitPrice: itemPrice,
		totalUnitPrice: itemPrice,
		addOns: addOns,
		addOnTotal: condTotal,
		totalPrice: totalPrice,
		priceTxt: itemPriceTxt,
		custom: true
	};
	
	C2.addItemToCart(orderItem);
	$.window.close();
}

function goBack() {
	
	$.window.close();
}

function condimentClick(e) {
	var item = e.section.getItemAt(e.itemIndex);
	var dataItem = itemData[e.itemIndex];
	dataItem.checked.visible = !dataItem.checked.visible;
	
	$.condimentList.setItems(itemData);
	updateTotals();
}

function decreaseQty() {
	if(itemQty > 1) {
		itemQty--;
		$.lblQty.text = itemQty;
		updateTotals();	
	}
}

function increaseQty() {
	itemQty++;
	$.lblQty.text = itemQty;
	updateTotals();
}

function updateTotals() {
	console.log("updating totals...");
	$.lblItemNamePrice.text = itemName + "   " + itemPriceTxt;
	
	var condCount = 0;
	condTotal = 0.0;
	
	for(var i = 0; i < itemData.length; i++) {
		var aItem = itemData[i];
		console.log("aItem.checked", aItem.checked);
		if(aItem.checked.visible == 1) {
			console.log("visible");
			condCount++;
			condTotal += aItem.price;
		}
	}
	
	$.lblCondPrice.text = "Condiments(" + condCount + ")   $" + condTotal.toFixed(2);
	$.lblTotalQty.text = "x " + itemQty;
	
	totalPrice = (itemPrice + condTotal) * itemQty;
	
	$.lblTotal.text = "Total   $" + totalPrice.toFixed(2);   
}

// MenuItemID
// Name
// Price
// Image
// MenuItemType.MenuItemTypeID
// MenuItemType.IsCondiment

for (var i = 0; i < C2.condiments.length; i++) {
	var cond = C2.condiments[i];
	var data = {
		name: {
			text: cond.Name
		},
		priceTxt: {
			text: "$" + parseFloat(cond.Price).toFixed(2)
		},
		checked: {
			visible: false
		},
		price: cond.Price,
		id: cond.MenuItemID
	};
	
	itemData.push(data);
}

$.condimentList.setItems(itemData);

updateTotals();
