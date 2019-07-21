var args = arguments[0] || {};
var C2 = Alloy.Globals.C2;
var vendorMenuItems = Alloy.Collections.vendorMenuItems;
var api = require('api');
Ti.API.info('vendorMenuItems ' + JSON.stringify(vendorMenuItems));

var selectedItemType = 1;
var selectedBtn = $.btnFood;
var selectedLbl = $.lblFood;

$.sep_banner.bottom = 81;
$.bannerView.bottom = 0;

function test(e) {
    var item = e.section.getItemAt(e.itemIndex);
    console.log("item", item);
}

function test2(e) {

}

function checkIfOrderExists(_orderNumber) {
    var ORDERS = Ti.App.Properties.getObject('ORDERS');
    if (ORDERS == null)
        return false;

    var result = false;
    for (var i = 0,
        j = ORDERS.length; i < j; i++) {
        if (ORDERS[i].VendorOrderNumber == _orderNumber) {
            result = true;
        }
    }
    return result;
};

function createOrdersForRunner(_orders) {
    //$.view_runner.removeAllChildren();

    Ti.API.info('====createOrdersForRunner===== ' + JSON.stringify(_orders));

    if (_orders.length == 0) {
        $.view_runner.add(Ti.UI.createLabel({
            color : "#FFF",
            font : {
                fontSize : "18"
            },
            text : "No Current Orders",
            textAlign : 'center'
        }));
    }
    for (var i = 0,
        j = _orders.length; i < j; i++) {
        if ((_orders.length - 1 == i)) {

            var view_parent = Ti.UI.createView({
                height : 100,
                width : Ti.UI.FILL,
                dataObject : _orders[i]
            });
            var lbl_oderNo = Ti.UI.createLabel({
                color : "#FFF",
                font : {
                    fontSize : "16"
                },
                left : 10,
                top : 5,
                text : 'Order No. : ' + _orders[i].VendorOrderNumber,
                dataObject : _orders[i]
            });

            var lbl_paymentType = Ti.UI.createLabel({
                color : "#FFF",
                font : {
                    fontSize : "15",
                    fontWeight : "bold"
                },
                left : 10,
                top : 30,
                text : "Payment Type: " + _orders[i].PaymentType.PaymentType1,
                dataObject : _orders[i]
            });
            var lbl_total = Ti.UI.createLabel({
                color : "#FFF",
                font : {
                    fontSize : "15",
                    fontWeight : "bold"
                },
                left : 10,
                top : 55,
                text : "Total: $" + _orders[i].Total,
                dataObject : _orders[i]
            });
            var orderItems = "";
            for (var m = 0,
                n = _orders[i].OrderItems.length; m < n; m++) {
                orderItems = (orderItems == "") ? _orders[i].OrderItems[m].MenuItem.Name + " X " + _orders[i].OrderItems[m].Quantity : orderItems + "\n" + _orders[i].OrderItems[m].MenuItem.Name + "*" + _orders[i].OrderItems[m].Quantity;
            };

            var lbl_orderItems = Ti.UI.createTextArea({
                color : "#FFF",
                font : {
                    fontSize : "12",
                },
                right : 10,
                top : 5,
                value : orderItems,
                dataObject : _orders[i],
                width : 150,
                height : 50,
                backgroundColor : 'transparent',
            });

            var btn_delivery = Ti.UI.createButton({
                height : 35,
                width : 80,
                font : {
                    fontSize : "12",
                    fontWeight : "bold"
                },
                right : 10,
                bottom : 5,
                title : 'Complete',
                backgroundColor : "#151d27",
                color : "#fff",
                dataObject : _orders[i],
            });

            btn_delivery.addEventListener('click', function(_btnEvent) {
                if (_btnEvent.source.title == 'Complete') {
                    var uploaddata = {
                        OrderID : parseInt(_btnEvent.source.dataObject.OrderID),
                        RunnerID : _btnEvent.source.dataObject.Runner.ID
                    };
                    api.getRunnerOrders(uploaddata, 'OrderStatusByRunner', function(_response) {
                        Ti.API.info('====OrderStatusByRunner===== ' + JSON.stringify(_response));
                        //deliveredcallback();
                        _btnEvent.source.title = 'Completed';
                        $.view_runner.remove(view_parent);
                        view_parent = null;
                    });
                }
            });

            view_parent.add(lbl_oderNo);
            view_parent.add(lbl_paymentType);
            view_parent.add(lbl_total);
            view_parent.add(btn_delivery);
            view_parent.add(lbl_orderItems);
            view_parent.add(Ti.UI.createView({
                bottom : 0,
                height : 1,
                backgroundColor : '#151d27',
                width : Ti.UI.FILL
            }));

            $.view_runner.add(view_parent);
        }
    }

    Ti.App.Properties.setObject('ORDERS', _orders);
}

if (!Ti.App.Properties.getBool("isRunner")) {
    $.view_runner.height = 0;
    $.view_runner.visible = false;
    $.menu_list_view.top = 130;
    $.top_parent.height = 130;
} else {
    var data = {
        runnerID : parseInt(Ti.App.Properties.getString("runnerID"))
    };
    Ti.API.info('---data--- ' + JSON.stringify(data));
    api.getRunnerOrders(data, 'GetRunnerOrders', function(_response) {
        if (_response.Orders.length > 0) {
            createOrdersForRunner(_response.Orders);
        }
    });
    $.lblVenueName.visible = false;
    $.lblVendorName.visible = false;
    $.lblVenueName.height = 0;
    $.lblVendorName.height = 0;
    $.menu_list_view.top = 200;
}

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
                if (Headers[i].HeaderAreaName == "Vender Menu") {
                    $.lbl_ticker.text = Headers[i].HeaderDescription;
                    animateLongText($.lbl_ticker);
                }
            };
            var Footers = payload.Footers;
            for (var i = 0,
                j = Footers.length; i < j; i++) {
                if (Footers[i].FooterAreaName == "Vender Menu") {
                    $.bannerView.image = Footers[i].FooterImageURL;
                }
            };
        }
    }, function() {
        Ti.API.info('error');
    });
};

getHeaderAndFooters();

function setActive(src, active) {
    if (active) {
        src.backgroundColor = src.activeBackgroundColor;
    } else {
        src.backgroundColor = src.defaultBackgroundColor;
    }
}

function btnCustomize_touchStart(e) {
    setActive(e.source, true);
}

function btnCustomize_touchEnd(e) {
    setActive(e.source, false);
    var item = e.section.getItemAt(e.itemIndex);

    console.log("customizing menu item id", item.id.text);

    C2.openCustomizeWindow(item);
}

function btnCustomize_touchCancel(e) {
    setActive(e.source, false);
}

function btnAddToCart_touchStart(e) {
    setActive(e.source, true);
}

function btnAddToCart_touchEnd(e) {
    setActive(e.source, false);
    // add item to cart
    var item = e.section.getItemAt(e.itemIndex);

    console.log("adding items to cart", item);

    /*
     * id: 23,
     name: 'Hot Dog',
     quantity: 1,
     price: 3.00,
     priceTxt: "$3.00",
     addOns: [
     {id: 1, name: 'Mustard', price: .15, priceTxt: '$0.15'},
     {id: 2, name: 'Relish', price: .15, priceTxt: '$0.15' }
     ]
     */

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
    $.sep_banner.bottom = 121;
    $.bannerView.bottom = 40;
}

function btnAddToCart_touchCancel(e) {
    setActive(e.source, false);
}

function selectTab(btn, lbl) {
    // set other one to borderColor e6e6e6, color e2e3e4
    btn.backgroundColor = "#5568a2";
    //$.btnDrinks.borderColor="#5568a2";
    lbl.color = "#f1f3f4";

    selectedBtn.backgroundColor = "transparent";
    selectedLbl.color = "#e2e3e4";

    selectedBtn = btn;
    selectLbl = lbl;
}

function filterByItemType(typeID) {
    selectedItemType = typeID;
    //vendorMenuItems.fetch();

    var menuItems = [];
    for (var i = 0; i < C2.vendorMenu.length; i++) {
        var item = C2.vendorMenu[i];
        if (item.menuItemTypeID == selectedItemType) {
            if (item.type.text == "item") {
                item.template = $.tmp_def;
            } else {
                item.template = $.tmp_combo;
            }
            menuItems.push(item);
        }
    }
    $.vendorList.setItems(menuItems);
}

function filterFood() {
    if (selectedItemType != 1) {
        filterByItemType(1);
        selectTab($.btnFood, $.lblFood);
    }
}

function filterDrinks() {
    if (selectedItemType != 2) {
        filterByItemType(2);
        selectTab($.btnDrinks, $.lblDrinks);
    }
}

function filterSides() {
    if (selectedItemType != 3) {
        filterByItemType(3);
        selectTab($.btnSides, $.lblSides);
    }
}

function doFilter(collection) {
    //console.log("in menu filter");
    var items = collection.filter(function(c) {
        return c.attributes.menuItemTypeID == selectedItemType;
    });
    return items;
}

function doDataTransform(model) {
    var o = model.toJSON();
    Ti.API.info('doDataTransform ' + o.type);
    //console.log("model", model);
    return model;

}

function doTransform(model) {
    var o = model.toJSON();
    Ti.API.info('doTransform ' + o);
    if (o.type == "combo") {
        o.template = 'combo_template';
    } else {
        o.template = 'template';
    }
    return o;
}

function updateView() {
    selectedItemType = 2;
    vendorMenuItems.fetch();
}

//vendorMenuItems.fetch();

$.lblVenueName.text = C2.venue.get("name");
$.lblVendorName.text = C2.vendor.get("name");

console.log("vendorMenuItem count: " + JSON.stringify(C2.vendorMenu));
filterByItemType(selectedItemType);
//doTransform(C2.vendorMenuItems);

//console.log("vendorMenuItem count: " + vendorMenuItems.models.length + " " + C2.vendorMenuItems.models.length);

//console.log("before vendor menu items", C2.vendorMenuItems);
//var vendorMenuItems = C2.vendorMenuItems;
//console.log("after", vendorMenuItems);
//vendorMenuItems.fetch();

