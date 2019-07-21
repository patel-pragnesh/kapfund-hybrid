var args = arguments[0] || {};

var iOS7 = Alloy.Globals.isiOS7Plus();
var C2 = Alloy.Globals.C2;
var api = require('api');
var cancelRotation = false;
//var imgIndex = 4;
var imgIndex = 3;
var goDown = false;
//var imgs = [$.img1, $.img2, $.img3, $.img4, $.img5];
var imgs = [$.img1, $.img2, $.img3, $.img4];
var runnerID;

var sql = require('/mileageTracker/sql');
var track = require('/mileageTracker/track');
var units = require('/mileageTracker/units');

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
function showApparel() {
    alert("Coming Soon");
};

function DonateNow() {

    if (!Alloy.Globals.lastVendorID) {
        console.log("main window loaded, opening venue selection window");
        if (!Ti.App.Properties.getBool("isRunner")) {
            C2.openVenueSelectionWindow();
        }
    } else {
        var donateNow = Alloy.createController("donateNow", {});
        donateNow.getView().open();
    }
}

var uri,
    WS;
if (Ti.App.Properties.getBool("isRunner")) {

    /*$.btn_delivery.visible = false;
     $.VendorOrderNumberTxt.visible = false;
     $.VenueName.visible = false;
     $.VendorName.visible = false;
     $.DateCreatedTxt.visible = false;
     $.order_status.visible = false;
     $.orderStatusWidth.visible = false;
     $.orderType.visible = false;
     */
    // var uri = 'ws://ballparkws.ysoftsolution.com/default.Socket';
    // var WS = require('net.iamyellow.tiws').createWS();
// 
    // WS.addEventListener('open', function() {
        // //alert('WS websocket opened');
        // //WS.send("JOINEDSAMPLECHAT:1234567");
// 
        // /*	var runnerData = {
         // "latitude" : "23.049736",
         // "longitude" : "72.511724",
         // "altitude" : "26.511724",
         // "heading" : "Test",
         // "speed" : "50",
         // "timestamp" : "10",
         // "runnerID" : "5"
         // };
         // setTimeout(function() {
         // WS.send(JSON.stringify(runnerData));
         // }, 2000);
         // */
        // WS.send("JOINEDSAMPLECHAT:1234567");
// 
    // });
// 
    // WS.addEventListener('close', function(ev) {
        // alert('WS close ' + ev);
    // });
// 
    // WS.addEventListener('error', function(ev) {
        // Ti.API.info('WS error ' + JSON.stringify(ev));
    // });
// 
    // WS.addEventListener('message', function(ev) {
        // Ti.API.info('WS message ' + JSON.stringify(ev));
    // });
// 
    // WS.open(uri);
    // //WS.send("JOINEDSAMPLECHAT:1234567");
// 
    // $.view_user.visible = false;
    // $.view_runner.visible = true;
// 
    // //if (!track.isTracking()) {
    // track.initializeTracker(onState, onData);
// 
    // // } else {
    // // clearInterval(durationInterval);
    // // durationInterval = setInterval(onInterval, 1000);
    // // }
// 
    // var data = {
        // //VendorGUID : Ti.App.Properties.getString("VendorGUID")
        // runnerID : parseInt(Ti.App.Properties.getString("runnerID"))
    // };
    // api.getRunnerOrders(data, 'GetRunnerOrders', function(_response) {
        // // Ti.API.info('====GetRunnerOrders==== ' + JSON.stringify(_response));
        // // Ti.API.info('====GetRunnerOrders==== ' + JSON.stringify(_response.Orders));
        // // Ti.API.info('====GetRunnerOrders==== ' + _response.Orders.OrderStatus);
        // if (_response.Orders.length > 0) {
// 
            // /*$.btn_delivery.visible = true;
             // $.VendorOrderNumberTxt.visible = true;
             // $.VenueName.visible = true;
             // $.VendorName.visible = true;
             // $.DateCreatedTxt.visible = true;
             // $.order_status.visible = true;
             // $.orderStatusWidth.visible = true;
             // $.orderType.visible = true;
// 
             // $.VendorOrderNumberTxt.text = _response.Orders[0].VendorOrderNumber;
             // $.Status.text = _response.Orders[0].OrderStatus.Name;
             // $.VenueName.text = _response.Orders[0].Customer.FirstName + ' ' + _response.Orders[0].Customer.LastName;
             // $.VendorName.text = _response.Orders[0].Customer.Phone;
             // runnerID = _response.Orders[0].Runner.ID;
             // Ti.App.Properties.setString('CustomerID', _response.Orders[0].Customer.CustomerID);
             // Ti.App.Properties.setString('OrderID', _response.Orders[0].OrderID);
             // Ti.App.Properties.setString('VendorOrderNumber', _response.Orders[0].VendorOrderNumber);
             // Ti.App.Properties.setString('user_longitude', _response.Orders[0].Longitude);
             // Ti.App.Properties.setString('user_latitude', _response.Orders[0].Latitude);
             // $.btn_noOrders.visible = false;
             // $.orderType.text = 'Delivery';
             // */
// 
            // createOrdersForRunner(_response.Orders);
        // }
// 
        // /*	else {
         // $.btn_noOrders.visible = true;
         // $.btn_delivery.visible = false;
         // $.VendorOrderNumberTxt.visible = false;
         // $.VenueName.visible = false;
         // $.VendorName.visible = false;
         // $.DateCreatedTxt.visible = false;
         // $.order_status.visible = false;
         // $.orderStatusWidth.visible = false;
         // $.orderType.visible = false;
         // }
         // */
// 
    // });

} else {
    $.view_user.visible = true;
    $.view_runner.visible = false;
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
    for (var i = 0,
        j = _orders.length; i < j; i++) {

        if (!checkIfOrderExists(_orders[i].VendorOrderNumber)) {

            var view_parent = Ti.UI.createView({
                height : 60,
                width : Ti.UI.FILL,
                dataObject : _orders[i]
            });
            var lbl_oderNo = Ti.UI.createLabel({
                color : "black",
                font : {
                    fontSize : "16"
                },
                left : 10,
                top : 5,
                text : 'Order : ' + _orders[i].VendorOrderNumber,
                dataObject : _orders[i]
            });

            var lbl_buyer = Ti.UI.createLabel({
                color : "black",
                font : {
                    fontSize : "12",
                    fontWeight : "bold"
                },
                left : 10,
                top : 25,
                text : _orders[i].Customer.FirstName + ' ' + _orders[i].Customer.LastName,
                dataObject : _orders[i]
            });
            var lbl_contactNumber = Ti.UI.createLabel({
                color : "black",
                font : {
                    fontSize : "12",
                },
                left : 10,
                top : 40,
                text : _orders[i].Customer.Phone,
                dataObject : _orders[i]
            });

            var btn_track = Ti.UI.createButton({
                height : 45,
                width : 80,
                font : {
                    fontSize : "12",
                },
                right : 10, //right : 95,
                top : 5,
                title : 'Track',
                backgroundColor : "#151d27",
                dataObject : _orders[i]
            });

            var btn_delivery = Ti.UI.createButton({
                height : 45,
                width : 80,
                font : {
                    fontSize : "12",
                },
                right : 10,
                top : 5,
                title : 'Complete',
                backgroundColor : "#151d27",
                dataObject : _orders[i],
                visible : false
            });
            btn_track.btn_delivery = btn_delivery;
            btn_delivery.btn_track = btn_track;

            btn_track.addEventListener('click', function(_btnEvent) {
                if (_btnEvent.source.title == 'Track') {
                    Ti.API.info('=====_btnEvent=-===== ' + JSON.stringify(_btnEvent.source.dataObject));
                    Ti.App.Properties.setString('CustomerID', _btnEvent.source.dataObject.Customer.CustomerID);
                    Ti.App.Properties.setString('OrderID', _btnEvent.source.dataObject.OrderID);
                    Ti.App.Properties.setString('VendorOrderNumber', _btnEvent.source.dataObject.VendorOrderNumber);
                    Ti.App.Properties.setString('user_longitude', _btnEvent.source.dataObject.Longitude);
                    Ti.App.Properties.setString('user_latitude', _btnEvent.source.dataObject.Latitude);
                    var win_mileageTracker = require("map/mileageTracker");
                    var windowInstance = new win_mileageTracker({
                        OrderID : Ti.App.Properties.getString('OrderID')
                    }, function() {
                        _btnEvent.source.title = 'Delivered';
                        _btnEvent.source.btn_delivery.title = 'Completed';
                    });
                    windowInstance.open();
                }
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
                        _btnEvent.source.btn_track.title = 'Delivered';
                    });
                }
            });

            view_parent.add(lbl_oderNo);
            view_parent.add(lbl_buyer);
            view_parent.add(lbl_contactNumber);
            view_parent.add(btn_delivery);
            view_parent.add(btn_track);
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
    var windowInstance = new win_mileageTracker(null, function() {
        $.btn_delivery.title = 'Delivered';
    });
    windowInstance.open();
}

function goToPastOrders() {
    C2.mainWindow.goToPastOrders(function() {
        C2.mainWindow.goToHome();
    });
}

function openMenu() {

}

function getHeaderAndFooters() {
    C2.GetHeaderFooterList(false, function(payload, status, msg) {
        Ti.API.info('success');
        if (status) {
            var Headers = payload.Headers;
            for (var i = 0,
                j = Headers.length; i < j; i++) {
                if (Headers[i].HeaderAreaName == "Home") {
                    $.lbl_ticker.text = Headers[i].HeaderDescription;
                    animateLongText($.lbl_ticker);
                }
            };
            var Footers = payload.Footers;
            for (var i = 0,
                j = Footers.length; i < j; i++) {
                if (Footers[i].FooterAreaName == "Home") {
                    $.bannerView.image = Footers[i].FooterImageURL;
                }
            };
        }
    }, function() {
        Ti.API.info('error');
    });
};

getHeaderAndFooters();

function openVenueWindow(venArgs) {
    C2.openVenueSelectionWindow(venArgs);
}

function startTracking(e) {
    /*if ($.btn_delivery.title == 'Start Delivery') {
     $.btn_delivery.title = 'Delivered';
     //startTracker();
     openTracker();
     } else {
     $.btn_delivery.title = 'Order Complete';
     }*/
    openTracker();
};

function onInterval() {
    var data = {
        runnerID : parseInt(Ti.App.Properties.getString("runnerID"))
    };
    // api.getRunnerOrders(data, 'GetRunnerOrders', function(_response) {
        // if (_response.Orders.length > 0) {
            // createOrdersForRunner(_response.Orders);
        // }
    // });
}

function onData(e) {
    //if (Ti.App.Properties.getBool('mileageTrackerStillOpen')) {
    lastData = e;
    Ti.App.Properties.setObject('CURRENT_RIDE_DATA', lastData);
    var transformed = Alloy.Globals.transformLocationData(lastData);
    transformed.CustomerID = Ti.App.Properties.getString('CustomerID');
    transformed.runnerID = runnerID;
    Ti.API.info('=====transformed===== ' + transformed);
    WS.send("JOINEDSAMPLECHAT:1234567");
    WS.send(JSON.stringify(transformed));
    //}
}

function onState(e) {
    //console.log(e);
    Ti.API.info('====onState==== ' + e);

    if (e === 'start') {
        if (Ti.App.Properties.getBool('mileageTrackerStillOpen'))
            durationInterval = setInterval(onInterval, 1000);
    } else if (e === 'stop') {

        // if (Ti.App.Properties.getBool('mileageTrackerStillOpen')) {
        // lastData = Ti.App.Properties.getObject('CURRENT_RIDE_DATA');
        // var transformed = App.transformLocationData(lastData);
        // var rideGeoData = App.getFinishedRide(lastData);

        clearInterval(durationInterval);
        //	rideComplete(rideGeoData, transformed.distanceFormatted);
        //}
    }
}

function startTracker() {
    Ti.API.info('====startTracker=====');
    track.toggleTracking(function(e) {
        if (e.error) {
            alert(e.error);
        }
    });
};

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
if (Ti.App.Properties.getBool("isRunner")) {
    var durationInterval = setInterval(onInterval, 2500);
}
function logout() {
    Ti.App.Properties.setObject('ORDERS', null);
    clearInterval(durationInterval);
    Ti.App.removeEventListener('logout', logout);
}

Ti.App.addEventListener('logout', logout);

exports.view_removed = view_removed;

Ti.App.Properties.setObject('ORDERS', null);
