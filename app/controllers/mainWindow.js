var args = arguments[0] || {};

var iOS7 = Alloy.Globals.isiOS7Plus();
$.window.top = iOS7 ? 20 : 0;

var C2 = Alloy.Globals.C2;

if (!C2.mainWindow) {

}

console.log("setting C2.mainWindow");
C2.mainWindow = $;

var settings = Alloy.Models.instance("settings");
var vendor = Alloy.Models.instance("vendor");
var venue = Alloy.Models.instance("venue");

var loaded = false;

settings.fetch();
vendor.fetch();
venue.fetch();

//if (!Ti.App.Properties.getBool("isRunner")) {
$.btnMenu.visible = true;
// } else {
// $.btnMenu.visible = false;
// }

// *************
// member variables
var m_currentController;
var m_currentView;
var m_currentViewName;
var m_backButtonHandler;
var m_canToggleVendorInfo = true;

// notification queue variables
var notifyQueue = [];
var processingNotifyQueue = false;

// *************
// animations used in this window
var animateHideNotify = Ti.UI.createAnimation({
    opacity : 0,
    curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
    duration : 500
});
var animateShowNotify = Ti.UI.createAnimation({
    opacity : 0.9,
    curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
    duration : 500
});

var animateExpand = Ti.UI.createAnimation({
    height : 250,
    curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
    duration : 250
});

var animateCollapse = Ti.UI.createAnimation({
    height : 40,
    curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
    duration : 250
});

// *************
// private functions
$.window.addEventListener("android:back", function() {
    if ($.navMenu.visible) {
        hideNavMenu();
        return;
    }

    if ($.locationDialog.showing()) {
        return;
    }

    if (m_currentViewName == "home") {
        C2.signOut();

    } else {
        goBack();
    }
});

$.window.addEventListener("close", function() {
    console.log("main window closing");

    if (m_currentController && m_currentController.view_removed) {
        m_currentController.view_removed();
    }

    C2.mainWindow = null;
    $.destroy();
});
var isRunnerLoaded = false;

$.window.addEventListener("open", function() {
    Ti.API.info('---isRunnerLoaded----- ' + isRunnerLoaded);
    Ti.API.info('---isRunner----- ' + Ti.App.Properties.getBool("isRunner"));
    if (!isRunnerLoaded) {
        isRunnerLoaded = true;
        if (Ti.App.Properties.getBool("isRunner")) {
            C2.goToVendorMenu();
            return;
        }
    }
});

$.window.addEventListener("load", function() {
    Ti.API.info('---loaded----- ' + loaded);
    Ti.API.info('---isRunner----- ' + Ti.App.Properties.getBool("isRunner"));
    if (!loaded && !Alloy.Globals.lastVendorID) {
        loaded = true;
        console.log("main window loaded, opening venue selection window");
        if (!Ti.App.Properties.getBool("isRunner")) {
            C2.openVenueSelectionWindow();
        }
    }
});

function callViewBack() {
    if (m_currentView.goBack) {
        m_currentView.goBack();
    }
}

function checkNotifyQueue() {
    settings.fetch();
    if (!processingNotifyQueue && notifyQueue.length > 0) {
        processingNotifyQueue = true;
        if (notifyQueue.length > 0) {

            var msg = notifyQueue.shift();
            $.lblMsg.text = msg;
            $.notificationView.visible = true;
            $.notificationView.bottom = $.venueInfoView.height;
            $.notificationView.animate(animateShowNotify, function() {
                setTimeout(function() {
                    $.notificationView.animate(animateHideNotify, function() {
                        $.notificationView.visible = false;
                        processingNotifyQueue = false;
                        checkNotifyQueue();
                    });
                }, 1000);
            });
        }
    }
}

function navHome_click(e) {
    hideNavMenu();
    if (m_currentViewName == "home")
        return;

    goToHome();
}

function navVendorMenu_click(e) {
    hideNavMenu();
    alert("Coming Soon");
    return;

    //hideNavMenu();

    if (m_currentViewName == "vendorMenuView")
        return;

    var backHandler = goToHome;
    if (m_currentViewName == "pastOrdersView") {
        backHandler = goToPastOrders;
        console.log("nav to vendor menu, back set to goToPastOrders");
    }

    C2.goToVendorMenu(backHandler);
}

function navChangeVendor_click(e) {
    hideNavMenu();
    alert("Coming Soon");
    return;

    hideNavMenu();
    C2.openVenueSelectionWindow();
}

function navOrders_click(e) {
    hideNavMenu();

    if (m_currentViewName == "pastOrdersView")
        return;

    var backHandler = goToHome;
    if (m_currentViewName == "vendorMenuView") {
        backHandler = C2.goToVendorMenu;
    }

    goToPastOrders(backHandler);
}

function navCart_click(e) {

    if (C2.cartItems.length > 0) {
        hideNavMenu();
        openCart();
    } else {
        alert("Your cart is empty.");
    }
}

function navSettings_click(e) {
    hideNavMenu();
    goToSettings();
}

function navAbout_click(e) {
    hideNavMenu();
    goToAbout();
}

function navSignout_click(e) {
    hideNavMenu();
    C2.signOut();
    if (Ti.App.Properties.getBool("isRunner")) {
        Ti.App.fireEvent('logout');
        Ti.App.Properties.setObject('ORDERS', null);
    }
}

function highlightLabel(e) {
    e.source.color = "#576cad";
}

function revertLabel(e) {
    e.source.color = "#f1f3f4";
}

// *************
// export functions for use from other views
function changeView(newView, title, showTopLogo, backButtonHandler, addArgs) {
    hideNavMenu();

    var hideMenu = addArgs && addArgs.hideMenu;
    var viewArgs = addArgs ? addArgs.viewArgs : null;

    var controller = Alloy.createController(newView, viewArgs);
    var content = controller.getView();
    if (m_currentView) {
        if (m_currentController && m_currentController.view_removed) {
            m_currentController.view_removed();
        }
        $.contentView.remove(m_currentView);
        m_currentView = null;
        m_currentController = null;
    }
    $.contentView.add(content);
    $.notificationView.height = 0;
    $.notificationView.bottom = 0;
    m_currentController = controller;
    m_currentView = content;
    m_currentViewName = newView;

    if (showTopLogo) {
        $.lblLogoTitle.text = " - " + title;
    } else {
        $.lblTitle.text = title;
    }

    $.viewTitle.visible = showTopLogo;
    $.lblTitle.visible = !showTopLogo;

    if (m_currentViewName == "settingsView" || hideMenu) {
        $.btnMenu.hide();
    } else {
        //if (!Ti.App.Properties.getBool("isRunner")) {
        $.btnMenu.show();
        //}
    }

    if (backButtonHandler) {
        $.btnBack.show();
        m_backButtonHandler = backButtonHandler;
    } else {
        $.btnBack.hide();
    }
}

function clearNotifyQueue() {
    notifyQueue = [];
    $.notificationView.visible = false;
}

function close() {
    $.window.close();
}

function goToHome() {
    if (!Ti.App.Properties.getBool("isRunner")) {
        changeView('home', 'Home', false);
    } else {
        var backHandler = goToHome;
        changeView("vendorMenuView", "Menu", true, backHandler);
    }

}

function goToPastOrders(backButtonHandler) {
    C2.goToPastOrders(backButtonHandler);
}

function goToSettings(backButtonHandler) {
    showLoading();
    C2.getCustomerInfo({
        UserGUID : C2.customerGuid.UserGUID
    }, function(resp) {
        hideLoading();
        console.log("customer info", resp);
        Alloy.Globals.customerInfo = resp;
        var handler = backButtonHandler || goToHome;
        changeView('settingsView', 'Settings', true, handler);
    }, function(err) {
        hideLoading();
        alert("Error getting settings for current user, check your network connection and ensure you are connected to the internet");
    });
}

function goToHtmlView(backButtonHandler, title, htmlFileName) {
    changeView('htmlView', title, true, backButtonHandler, {
        hideMenu : true,
        viewArgs : htmlFileName
    });
}

function goToAbout(backButtonHandler) {
    var handler = backButtonHandler || goToHome;
    changeView('about', 'About', true, handler, {
        hideMenu : true
    });
}

function goToVendorMenu(backButtonHandler) {
    var handler = backButtonHandler || goToHome;
    C2.mainWindow.changeView("vendorMenuView", "Menu", true, handler);
}

function goBack() {
    if (m_backButtonHandler) {
        m_backButtonHandler();
    }
}

function hideNavMenu() {
    if (!Ti.App.Properties.getBool("isRunner")) {
        $.navMenu.visible = false;
    } else {
        $.navMenuRunner.visible = false;
    }
}

function hideNavMenuRunner() {
    $.navMenuRunner.visible = false;
}

function refreshFooter() {
    // this is unnecessary, but will leave this function here in case we need to do something
    // for when vendor/venue is updated

    settings.fetch();
    vendor.fetch();
    venue.fetch();

    //alert("in refresh footer " + settings.get("noVendor") + ", " + settings.get("hasVendor"));
    $.lblNoVendor.visible = settings.get("noVendor");
    $.venueInfoView.height = 0;
    $.viewVendorInfo.visible = settings.get("hasVendor");

    $.lblCurrVendor.text = "Current Vendor: (" + C2.orderTypeText + ") " + C2.venue.get("name");

    if (C2.orderType == 2) {
        // delivery, so we need to show the users section / row / seat with option to change

    }

    if (!C2.vendorCanDeliver) {
        $.viewUserLocation.visible = false;
        $.lblDeliveryNotAvail.visible = true;
        $.btnChangeOrderType.hide();
    } else {
        $.lblDeliveryNotAvail.visible = false;
        $.lblUserSection.text = "Section " + (C2.customerSection || "-");
        $.lblUserRow.text = "Row " + (C2.customerRow || "-");
        $.lblUserSeat.text = "Seat " + (C2.customerSeat || "-");

        // vendor can deliver
        if (C2.orderType == 1) {
            // currently pickup so let user know to enter location
            if (C2.customerSection == null) {
                $.lblUserLocationTitle.text = "Enter your location to check if vendor can deliver to you:";
            } else {
                $.lblUserLocationTitle.text = "Your current location:";
            }

            $.btnChangeOrderType.setText("Change to Delivery");
        } else if (C2.orderType == 2) {

            $.lblUserLocationTitle.text = "Vendor will deliver to you at:";
            $.btnChangeOrderType.setText("Change to Pickup");
        }

        $.btnChangeOrderType.show();
        $.viewUserLocation.visible = true;
    }

    if (Ti.App.Properties.getBool("isRunner")) {
        $.locationDialog.hide();
        $.venueInfoView.hide();
    }

}

//Ti.App.addEventListener('refreshMainWindow', refreshFooter);

function showNavMenu(e) {
    if (!Ti.App.Properties.getBool("isRunner")) {
        $.btnMenuCart.setText("Cart (" + C2.cartItems.length + ")");
        $.navMenu.visible = true;
    } else {
        $.navMenuRunner.visible = true;
    }
    if (!Ti.App.Properties.getBool("isRunner")) {
        refreshFooter();
    }
}

function toggleVendorInfoUp() {
    if (m_canToggleVendorInfo) {
        $.btnCollapseVendor.show();
        $.btnExpandVendor.hide();
        //$.venueInfoView.height = 100;
        m_canToggleVendorInfo = false;
        $.venueInfoView.animate(animateExpand, function() {
            m_canToggleVendorInfo = true;
        });
    }

}

function toggleVenodrInfoDown() {

    if (m_canToggleVendorInfo) {
        $.btnCollapseVendor.hide();
        $.btnExpandVendor.show();
        //$.venueInfoView.height = 100;
        m_canToggleVendorInfo = false;
        $.venueInfoView.animate(animateCollapse, function() {
            m_canToggleVendorInfo = true;
        });
    }
}

function openCart() {
    clearNotifyQueue();
    C2.openCartWindow();
}

function openMenu() {
    showNavMenu();
}

function notify(msg) {
    notifyQueue.push(msg);
    checkNotifyQueue();
}

function hideLoading() {
    $.loadingView.visible = false;
}

function showLoading(msg) {
    if (msg) {
        $.lblLoading.text = msg;
    } else {
        $.lblLoading.text = "Loading...";
    }
    $.loadingView.visible = true;
}

function editLocation() {
    $.locationDialog.show();
}

function changeOrderType() {
    if (C2.orderType == 1) {
        $.locationDialog.show(function() {
            console.log("changing order to DELIVERY");
            C2.selectDelivery();
            $.locationDialog.hide();
            C2.showAlert("Order changed to delivery", "Your order been updated to delivery.  We will deliver orders to you at your seat.");
        }, null, "Confirm your location:");
    } else {
        console.log("changing order to PICKUP");
        C2.selectPickup();
        C2.showAlert("Order changed to pickup", "Your order has been updated to pickup.  After placing an order we will let you know when it is ready for pickup.");
    }
}

// *************
// initialize the window

// if this is the first time opening, then we go to the home view
goToHome();
//goToSettings();

$.btnCollapseVendor.hide();

console.log("Last VendorID", Alloy.Globals.lastVendorID);

if (Alloy.Globals.lastVendorID) {
    showLoading("Retreiving vendor info...");
    settings.set("hasVendor", true);
    settings.set("noVendor", false);
    settings.save();
    settings.fetch();
    C2.getVendorInfo({
        VendorID : Alloy.Globals.lastVendorID
    }, function(resp, status, msg) {
        if (status == 1) {
            console.log("vendor info found", resp);
            if (resp.IsActive) {
                console.log("setting vendor/venue info");
                C2.setVenue(resp.VenueID, resp.VenueName, resp.VenueAddress, resp.VenueCity + ", " + resp.VenueState + " " + resp.VenueZip);
                console.log("setting vendor...");
                C2.setVendor(resp.VendorID, resp.VendorName, resp.VendorDescription, resp.ServiceFee, resp, resp.VendorCanDeliver);
                refreshFooter();
            }
        }
        hideLoading();
    }, function() {
        hideLoading();
    });
} else {
    settings.set("hasVendor", false);
    settings.set("noVendor", true);
    settings.save();
}

exports.clearNotifyQueue = clearNotifyQueue;
exports.close = close;
exports.changeView = changeView;
exports.currentViewName = function() {
    return m_currentViewName;
};
exports.goBack = goBack;
exports.goToHome = goToHome;
exports.goToPastOrders = goToPastOrders;
exports.goToVendorMenu = goToVendorMenu;
exports.goToAbout = goToAbout;
exports.goToHtmlView = goToHtmlView;
exports.hideLoading = hideLoading;
exports.notify = notify;
exports.openCart = openCart;
exports.openMenu = openMenu;
exports.refreshFooter = refreshFooter;
exports.showLoading = showLoading;

// if (Ti.App.Properties.getBool("isRunner")) {
// $.locationDialog.hide();
// $.venueInfoView.hide();
// }
//
