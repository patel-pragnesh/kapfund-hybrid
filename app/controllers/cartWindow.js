var args = arguments[0] || {};
var iOS7 = Alloy.Globals.isiOS7Plus();
var C2 = Alloy.Globals.C2;

var settings = C2.settings;
settings.fetch();

$.window.top = iOS7 ? 20 : 0;

function animateLongText(label) {
    var width = label.toImage().width;
    Ti.API.info('width ' + width);
    if (width >= 300) {
        var animation = Titanium.UI.createAnimation({
            left : -width,
            duration : width * 10,
            repeat : 1000,
            curve : Titanium.UI.ANIMATION_CURVE_LINEAR
        });
        animation.addEventListener('complete', function() {
            label.left = 320;
        });
        label.width = width;
        label.animate(animation);
    }
};

//$.lbl_ticker.text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry.";

function getHeaderAndFooters() {
    C2.GetHeaderFooterList(false, function(payload, status, msg) {
        Ti.API.info('success');
        if (status) {
            var Headers = payload.Headers;
            for (var i = 0,
                j = Headers.length; i < j; i++) {
                if (Headers[i].HeaderAreaName == "My Cart") {
                    $.lbl_ticker.text = Headers[i].HeaderDescription;
                    animateLongText($.lbl_ticker);
                }
            };
            var Footers = payload.Footers;
            for (var i = 0,
                j = Footers.length; i < j; i++) {
                if (Footers[i].FooterAreaName == "My Cart") {
                    $.bannerView.image = Footers[i].FooterImageURL;
                }
            };

            var DonationTexts = payload.DonationTexts;
            for (var i = 0,
                j = DonationTexts.length; i < j; i++) {
                Ti.API.info('success ' + $.lbl_donate);
                //$.lbl_donate.text = DonationTexts[i].DonationText1;
            };
        }
    }, function() {
        Ti.API.info('error');
    });
};
var achievedGoalAmount = 0;
var goalValue = 0;
var GoalId;
function getGoalsData() {
    Ti.API.info('==VendorID====' + C2.vendor.get("id"));
    C2.GetGoalsByVendor({
        VendorID : C2.vendor.get("id")
    }, function(payload, status, msg) {
        Ti.API.info('success payload ' + JSON.stringify(payload));
        var payload = payload[0];
        GoalId = payload.GoalId;
        $.lbl_donate.text = payload.GoalName;
        $.lbl_goal.text = "$" + payload.GoalAmount + "\nGoal";
        goalValue = payload.GoalAmount;
        if (payload.ArchivedGoalAmount) {
            achievedGoalAmount = payload.ArchivedGoalAmount;
            var achievedGoal = parseFloat(100 * payload.ArchivedGoalAmount / payload.GoalAmount).toFixed(2);
            $.goal_progress_actual.width = (achievedGoal) + "%";
            $.lbl_raised.text = achievedGoal + "%\nRaised";
        } else {
            $.lbl_raised.text = "0%\nRaised";
        }

    }, function() {
        Ti.API.info('error');
    });
};

getHeaderAndFooters();
getGoalsData();

// *************
// window events
$.window.addEventListener("close", function() {
    console.log("closing cart now...");
    $.destroy();
});

/*
$.window.addEventListener("open", function() {
updateTotals();
});
*/

// *************
// private functions
function updateSpecialInstructions() {
    //settings.set("specialInstructions", $.txtSpecialInstructions.value);
    settings.save();
}

// *************
// styles
var textColor = "#3b1213";
var itemFont = {
    fontWeight : "bold",
    fontSize : 12
};
var qtyFont = {
    fontWeight : "normal",
    fontSize : 12
};
var addOnFont = {
    fontWeight : "normal",
    fontSize : 10,
};
var buttonFont = {
    fontFamily : "FontAwesome"
};
var buttonSize = 25;

var minusIcon = 61526;
var plusIcon = 61543;

function calculateAchievedGoal() {
    var achievedGoal = parseFloat(100 * achievedGoalAmount / goalValue).toFixed(2);
    $.goal_progress_actual.width = (achievedGoal) + "%";
    $.lbl_raised.text = achievedGoal + "%\nRaised";
}

function incrementTip() {
    achievedGoalAmount++;
    C2.tipAmount++;
    updateTotals();
    $.icon_decrement.visible = true;
    $.decrement_donate.visible = true;
    calculateAchievedGoal();
}

function incrementTipMain() {
    C2.tipAmount++;
    updateTotals();
    $.icon_decrement.visible = true;
}

function decrementTip() {
    if (C2.tipAmount > 0) {
        $.icon_decrement.visible = true;
        $.decrement_donate.visible = true;
        achievedGoalAmount--;
        C2.tipAmount--;
        if (C2.tipAmount == 0) {
            $.icon_decrement.visible = false;
            $.decrement_donate.visible = false;
        }
        updateTotals();
    } else if (C2.tipAmount == 0) {
        $.icon_decrement.visible = false;
        $.decrement_donate.visible = false;
    }

    calculateAchievedGoal();
}

// *************
// layout functions
function getButton(icon) {
    var txt = String.fromCharCode(icon);
    var viewOuter = Ti.UI.createView({
        width : buttonSize,
        height : buttonSize,
        borderWidth : "0",
    });

    var label = Ti.UI.createLabel({
        text : txt,
        height : Ti.UI.FILL,
        color : textColor,
        font : buttonFont,
        touchEnabled : false
    });
    viewOuter.add(label);

    viewOuter.addEventListener("touchstart", function() {
        label.setColor("#aeaeae");
    });

    viewOuter.addEventListener("touchcancel", function() {
        label.setColor(textColor);
    });

    viewOuter.addEventListener("touchend", function() {
        label.setColor(textColor);
    });

    return viewOuter;
}

//Ti.API.info('C2.cartItems ' + JSON.stringify(C2.cartItems));
function populateCartView() {
    $.cartView.removeAllChildren();

    var spacerView = Ti.UI.createView({
        height : 10,
        top : 0
    });

    $.cartView.add(spacerView);

    for (var i = 0; i < C2.cartItems.length; i++) {
        var item = C2.cartItems[i];

        var wrapperView = Ti.UI.createView({
            width : Ti.UI.SIZE,
            height : Ti.UI.SIZE,
            layout : "vertical",
            top : 0

        });

        var itemView = Ti.UI.createView({
            height : Ti.UI.SIZE,
            top : 5
        });

        var nameText = item.name;
        if (item.isAlcohol) {
            nameText = "* " + nameText;
        }

        var nameLabel = Ti.UI.createLabel({
            left : 10,
            color : textColor,
            font : itemFont,
            text : nameText
        });
        item.nameLabel = nameLabel;

        var priceLabel = Ti.UI.createLabel({
            right : 20,
            color : textColor,
            font : itemFont,
            text : item.priceTxt
        });

        itemView.add(nameLabel);
        itemView.add(priceLabel);
        wrapperView.add(itemView);

        if (item.addOns) {
            for (var j = 0; j < item.addOns.length; j++) {
                var addOn = item.addOns[j];

                var addOnView = Ti.UI.createView({
                    height : Ti.UI.SIZE
                });

                var addOnLabel = Ti.UI.createLabel({
                    left : 15,
                    color : textColor,
                    font : addOnFont,
                    text : addOn.name
                });

                var addOnPriceLabel = Ti.UI.createLabel({
                    right : 25,
                    color : textColor,
                    font : addOnFont,
                    text : addOn.priceTxt
                });

                addOnView.add(addOnLabel);
                addOnView.add(addOnPriceLabel);
                wrapperView.add(addOnView);
            }
        }

        var qtyView = Ti.UI.createView({
            layout : "horizontal",
            height : Ti.UI.SIZE,
            width : Ti.UI.SIZE,
            top : 5,
            right : 0
        });

        var minusButton = getButton(minusIcon);
        var qtyLabel = Ti.UI.createLabel({
            backgroundColor : "#e2e3e4",
            width : buttonSize * 1.5,
            height : buttonSize,
            textAlign : "center",
            font : qtyFont,
            color : textColor,
            text : "x " + item.quantity
        });
        var plusButton = getButton(plusIcon);

        (function(item, qtyLabel, wrapperView) {
            minusButton.addEventListener("touchend", function() {
                item.quantity -= 1;
                if (item.quantity > 0) {
                    qtyLabel.setText("x " + item.quantity);
                } else {
                    $.cartView.remove(wrapperView);
                    C2.removeItemFromCart(item);
                }
                updateTotals();
            });
        })(item, qtyLabel, wrapperView);

        (function(item, qtyLabel) {
            plusButton.addEventListener("touchend", function() {
                item.quantity += 1;
                qtyLabel.setText("x " + item.quantity);
                updateTotals();
            });
        })(item, qtyLabel);

        if (item.type == "combo") {
            //wrapperView.backgroundColor = "#90FF33";
            wrapperView.backgroundImage = "/images/Rectangle.png";
            wrapperView.height = 60;
            wrapperView.top = 5;
            nameLabel.font = {
                fontSize : "20",
                fontWeight : "bold"
            };
            priceLabel.font = {
                fontSize : "20",
                fontWeight : "bold"
            };
        }
        qtyView.add(minusButton);
        qtyView.add(qtyLabel);
        qtyView.add(plusButton);

        if (item.type == "item") {
            wrapperView.add(qtyView);
        }
        $.cartView.add(wrapperView);
    }

    var spacerView2 = Ti.UI.createView({
        height : 10
    });

    //$.cartView.add(spacerView2);
}

function updateTotals() {
    if (C2.cartItems.length == 0) {
        console.log("empty cart");
        alert("Your cart is now empty");
        goBack();
    }

    var tipAmount = 0;

    // Ti.API.info('tipAmount '+tipAmount);

    // display tip or not

    // if (C2.orderType == 1) {
    // $.viewTip.height = 0;
    // $.viewTip.visible = false;
    // $.viewTotals.height = 83;
    // $.orderTotalContentView.top = 10;
    // } else {
    $.viewTip.height = Titanium.UI.SIZE;
    $.viewTip.visible = true;
    $.viewTotals.height = 95;
    $.orderTotalContentView.top = 0;
    tipAmount = C2.tipAmount;
    //  }

    //Ti.API.info('tipAmount 2 '+tipAmount);

    // check for alcohol
    var hasAlcohol = false;
    for (var i = 0; i < C2.cartItems.length; i++) {
        var item = C2.cartItems[i];
        if (item.isAlcohol) {
            hasAlcohol = true;
            break;
        }
    }
    if (hasAlcohol) {
        $.lblAlcoholWarning.visible = true;
        $.lblAlcoholWarning.height = null;
    } else {
        $.lblAlcoholWarning.visible = false;
        $.lblAlcoholWarning.height = 0;
    }

    var subTotal = C2.getCartSubTotal();
    //var serviceCharge = C2.vendor.get("serviceFee");
    var serviceCharge = C2.getServiceCharge(subTotal, C2.cartItems);

    if (serviceCharge == 0) {
        $.viewServiceCharage.visible = false;
        $.viewServiceCharage.height = 0;
    } else {
        $.viewServiceCharage.visible = true;
        $.viewServiceCharage.height = Titanium.UI.SIZE;
    }

    // Ti.API.info('subTotal 3 '+subTotal);
    // Ti.API.info('serviceCharge 3 '+serviceCharge);
    // Ti.API.info('tipAmount 3 '+tipAmount);

    if (subTotal == 0)
        serviceCharge = 0.00;
    var total = subTotal + serviceCharge + tipAmount;

    //Ti.API.info('tipAmount 4 '+total);

    $.lblSubTotal.text = "$" + subTotal.toFixed(2);
    $.lblServiceCharge.text = "$" + serviceCharge.toFixed(2);
    $.lblTipAmount.text = "$" + tipAmount.toFixed(2);

    //Ti.API.info('tipAmount 4 '+"$" + tipAmount.toFixed(2));

    $.tf_donate.value = "$" + tipAmount.toFixed(2);
    $.lblTotal.text = "$" + total.toFixed(2);

}

var vendorMenuItems = C2.vendorMenu;
Ti.API.info('---vendorMenuItems---- ' + JSON.stringify(vendorMenuItems));

function getOtherIems(id) {
    var modifiedArray = [];
    for (var i = 0,
        j = vendorMenuItems.length; i < j; i++) {
        if (vendorMenuItems[i].id.text != id) {
            //vendorMenuItems[i].splice(i, 1);
            modifiedArray.push(vendorMenuItems[i]);
        }
    };

    vendorMenuItems = modifiedArray;
}

function createAddONView() {
    for (var i = 0; i < C2.cartItems.length; i++) {

        var item = C2.cartItems[i];
        Ti.API.info('---item----- ' + JSON.stringify(item));
        getOtherIems(item.id);

        // var itemView = Ti.UI.createView({
        // width : Ti.UI.SIZE,
        // height: 80,
        // });
        // var itemImage = Ti.UI.createImageView({
        // width : Ti.UI.SIZE,
        // height: Ti.UI.SIZE,
        // image : item.itemImage
        // });
        //
        // var btn_add = Ti.UI.createButton({
        // width : 25,
        // height: 25,
        // backgroundImage : "/images/icon_plus_n.png",
        // right : 10,
        // bottom : 10
        // });
        //
        // itemView.add(itemImage);
        // itemView.add(btn_add);
        // $.parent_addOn.add(itemView);
    }

    Ti.API.info('---vendorMenuItems fina;---- ' + JSON.stringify(vendorMenuItems));

    for (var i = 0; i < vendorMenuItems.length; i++) {
        var menuItem = vendorMenuItems[i];
        if (menuItem.itemImage != "") {
            var itemView = Ti.UI.createView({
                width : Ti.UI.SIZE,
                height : 80,
                left : 10
            });
            var itemImage = Ti.UI.createImageView({
                height : 70,
                width : Ti.UI.SIZE,
                image : menuItem.itemImage
            });

            var btn_add = Ti.UI.createButton({
                width : 25,
                height : 25,
                backgroundImage : "/images/icon_plus_n.png",
                right : 2.5,
                bottom : 2.5,
                menuItem : menuItem
            });
            btn_add.addEventListener('click', function(e) {
                var item = e.source.menuItem;
                var orderItem = {
                    id : item.id.text,
                    name : item.ItemName.text,
                    quantity : 1,
                    price : item.Price.text,
                    unitPrice : item.Price.text,
                    totalUnitPrice : item.Price.text,
                    addOns : [],
                    addOnTotal : 0,
                    totalPrice : item.Price.text,
                    priceTxt : item.PriceText.text,
                    custom : false,
                    isAlcohol : item.isAlcohol,
                    type : item.type.text,
                    IsCombo : (item.type.text == "combo") ? true : false
                };

                C2.addItemToCart(orderItem);

                populateCartView();
                updateTotals();
            });

            itemView.add(itemImage);
            itemView.add(btn_add);
            $.parent_addOn.add(itemView);
        }
    }

};

// *************
// button events
function clearCart() {
    var dialog = Ti.UI.createAlertDialog({
        cancel : 1,
        buttonNames : ['Confirm', 'Cancel'],
        message : 'Are you sure you want to remove all items in your cart?',
        title : 'Confirm'
    });
    dialog.addEventListener('click', function(e) {
        if (e.index === e.source.cancel) {
            Ti.API.info('The cancel button was clicked');
        } else {
            C2.clearCart();
            updateTotals();
        }
    });
    dialog.show();
}

function goBack() {
    $.window.close();
}

function goToCheckout() {

    C2.UpdateVendorGoalById({
        ArchivedGoalAmount : achievedGoalAmount,
        GoalId : GoalId
    }, function(payload, status, msg) {
        Ti.API.info('success payload ' + JSON.stringify(payload));

    }, function() {
        Ti.API.info('error');
    });

    updateSpecialInstructions();
    var checkoutWin = Alloy.createController('checkoutWindow', $.window).getView();
    checkoutWin.open();
}

function changeToPickup() {
    // $.lblPickUp.font = {
        // fontWeight : 'bold'
    // };
    // $.lblDelivery.font = {
        // fontSize : 12
    // };
   // $.sliderOrderType.value = 0;
    $.viewUserLocation.visible = false;
    C2.selectPickup();
    updateTotals();
}

function changeToDelivery() {
    // $.lblPickUp.font = {
        // fontSize : 12
    // };
    // $.lblDelivery.font = {
        // fontWeight : 'bold'
    // };
   // $.sliderOrderType.value = 1;
    $.viewUserLocation.visible = true;
    C2.selectDelivery();
    updateLocationText();
    updateTotals();
}

function updateLocationText() {
    $.lblUserSection.text = "Section " + (C2.customerSection || "-");
    $.lblUserRow.text = "Row " + (C2.customerRow || "-");
    $.lblUserSeat.text = "Seat " + (C2.customerSeat || "-");
}

function editLocation() {
    $.locationDialog.show(function(section, row, seat) {
        updateLocationText();
        $.locationDialog.hide();
    });
}

function refreshOrderType() {
    if (C2.vendorCanDeliver) {
        //$.sliderOrderType.enabled = 1;
        // $.lblComingSoon.visible = false;
        // $.lblDelivery.visible = true;

        if (C2.orderType == 2) {
            changeToDelivery();
        } else {
            changeToPickup();
        }
    } else {
        //$.sliderOrderType.enabled = 0;
        // $.lblComingSoon.visible = true;
        // $.lblDelivery.visible = false;
        changeToPickup();
    }
}

/*$.sliderOrderType.addEventListener('touchend', function(e) {
    var val = e.value || e.source.value;
    var newValue = Math.round(val);
    var oldValue = C2.orderType - 1;
    this.value = newValue;

    console.log("new value vs old", newValue, oldValue);

    if (newValue != oldValue) {
        var slider = this;
        if (newValue == 1) {

            $.locationDialog.show(function(section, row, seat) {
                $.locationDialog.hide();
                changeToDelivery();
            }, function() {
                $.locationDialog.hide();
                changeToPickup();
            });

        } else {
            changeToPickup();
        }
    }
});
*/

// FOR TESTING
/*
 for(var i = 0; i < 3; i++) {
 C2.addItemToCart(
 {
 id: 23,
 name: 'Hot Dog',
 quantity: 1,
 price: 3.00,
 priceTxt: "$3.00",
 addOns: [
 {id: 1, name: 'Mustard', price: .15, priceTxt: '$0.15'},
 {id: 2, name: 'Relish', price: .15, priceTxt: '$0.15' }
 ]
 }
 );
 }*/

populateCartView();
updateTotals();
refreshOrderType();
createAddONView();

//C2.refreshVendor(refreshOrderType);

//$.txtSpecialInstructions.blur();

if (Ti.App.Properties.getBool("isRunner")) {
    $.view_orderType.height = 0;
    $.view_orderType.visible = false;
    $.lbl_orderType.height = 0;
    $.lbl_orderType.visible = false;
}