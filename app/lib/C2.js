/**
 * @author dsokol
 */

function C2() {
    var Mask = require('mask');
    var moment = require('moment');

    var me = {
        debugMode : false,
        baseSvcUrl : 'https://www.ballparkconcierge.com/data/wcf.svc/',
        stripeTokenSvcUrl : 'https://api.stripe.com/v1/tokens',
        //stripePublishableKey: 'pk_test_yBtBDP9MPxfeZay5RizEiOOR',
        stripePublishableKey : 'pk_live_imZ4gn7hfr3aenXwgGNW3WNS',
        //baseSvcUrl: 'http://10.0.0.15/Data/wcf.svc/',
        isAuthenticated : false,
        customerEmail : '',
        customerFirstName : '',
        customerLastName : '',
        customerGuid : null,
        customerSavedVendorID : 26,

        customerSection : null,
        customerRow : null,
        customerSeat : null,

        orderCreditCardId : null,
        creditCardInfo : null,
        hasPayment : false,
        saveCard : false,
        condiments : [],
        cartItems : [],
        pastOrders : [],
        orderType : 1,
        orderTypeText : "PICKUP",
        tipAmount : 1,

        // this is the order format we send to wcf service
        customerCurrentOrder : {
            UserGuid : '',
            Order : {
                SpecialInstructions : 'test',
                VendorOrderNumber : 'VEN',
                VendorID : 13,
                FulfillmentTypeID : 1,
                OrderItems : [{
                    MenuItemID : 31,
                    Quantity : 1,
                    OrderItemAddons : [{
                        MenuItemID : 35
                    }]
                }]
            },
            StripeToken : '',
            SaveCard : false
        },
        orderFees : {
            serviceFee : 1.00,
            deliveryServiceFee : 2.00
        },

        settings : Alloy.Models.instance("settings"),
        vendor : Alloy.Models.instance('vendor'),
        venue : Alloy.Models.instance('venue'),

        pastOrders : Alloy.Collections.pastOrders,
        vendorMenuItems : Alloy.Collections.vendorMenuItems,
        vendorMenu : [],
        vendorMinServiceFee : 0.0,
        vendorMaxServiceFee : 0.0,
        vendorServiceFeePercentage : 0.0,
        vendorCanDeliver : false,
        vendorInfo : null,

        mainWindow : null,
        loginWindow : null,
        runnerMainWindow : null
    };

    // Utlity functions
    me.customerName = function() {
        return me.customerFirstName + ' ' + me.customerLastName;
    };
    me.showAlert = function(title, message) {
        var dialog = Ti.UI.createAlertDialog({
            title : title,
            message : message,
            ok : 'Okay'
        });

        dialog.show();
    };

    me.selectPickup = function() {
        me.orderType = 1;
        me.orderTypeText = "PICKUP";
        me.refreshFooter();
    };

    me.selectDelivery = function(section, row, seat) {
        me.orderType = 2;
        me.orderTypeText = "DELIVERY";
        if (section)
            me.customerSection = section;
        if (row)
            me.customerRow = row;
        if (seat)
            me.customerSeat = seat;
        me.refreshFooter();
    };
    me.selectTrackDelivery = function(section, row, seat) {
        me.orderType = 2;
        me.orderTypeText = "DELIVERY";
        me.customerSection = '';
        me.customerRow = '';
        me.customerSeat = '';
    };

    me.refreshFooter = function() {
        if (me.mainWindow)
            me.mainWindow.refreshFooter();
    };

    me.postAsync = function(method, data, success, error) {
        try {

            if (Titanium.Network.networkType === Titanium.Network.NETWORK_NONE) {
                console.log("no network connection found");
                success({}, -1, "No network connection found, please ensure you are connected to the internet");
                return;
            }

            var xhr = Ti.Network.createHTTPClient();
            //xhr.setOption(2, 13056);
            xhr.timeout = 30000;
            var url = me.baseSvcUrl + method;

            Ti.API.info('---method url--- ' + url);
            Ti.API.info('---method data--- ' + JSON.stringify(data));
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-Type", "application/json");

            xhr.onload = function() {
                Ti.API.info('---postAsync---- ' + this.responseText);
                if (this.responseText) {
                    if (me.debugMode) {
                        console.log("resp", this.responseText);
                    }
                    try {
                        var resp = JSON.parse(this.responseText);
                        var msg = resp.Message;
                        var status = resp.Status;
                        var payload = JSON.parse(resp.Payload);
                        //Ti.API.info('=====method===== ' + method + ' ===payload=== ' + JSON.stringify(payload));
                        success(payload, status, msg);
                    } catch (e) {
                        error(e);
                    }

                } else {
                    error();
                }
            };

            xhr.onerror = function(e) {
                console.log("xhr error", e, this.responseText);
                error();
            };

            var d = data;
            if (!d)
                d = {};

            if (me.debugMode) {
                console.log("posting " + JSON.stringify(d) + " to " + url);
            }
            xhr.send(JSON.stringify(d));
        } catch(e) {
            error(e);
        }
    };

    // *************
    // location services API calls
    me.getVenueLocations = function(query, success, error) {
        me.getVenueLocationsByQuery({
            Query : query
        }, success, error);
    };

    me.getVenueLocationsByLatLong = function(lat, longitude, success, error) {
        me.getVenueLocationsByGeoloction({
            Latitude : lat,
            Longitude : longitude
        }, success, error);
    };

    // *************
    // stripe service calls
    // data should have number, expMonth, expYear, cvc, zip, and name
    me.createStripeCardToken = function(data, success, error) {
        try {
            var xhr = Ti.Network.createHTTPClient();
            xhr.timeout = 30000;
            var url = me.stripeTokenSvcUrl;

            xhr.open("POST", url);
            xhr.setRequestHeader("Authorization", "Bearer " + me.stripePublishableKey);

            xhr.onload = function() {
                if (this.responseText) {
                    try {
                        var resp = JSON.parse(this.responseText);
                        console.log("stripe resp", resp);
                        success(resp);
                    } catch (e) {
                        console.log("ERROR in createStripeCardToken onload", e);
                        error("credit card could not be procesed");
                    }

                } else {
                    error("credit card could not be processed");
                }
            };

            xhr.onerror = function(e) {
                if (xhr.responseText) {
                    var resp = JSON.parse(xhr.responseText);
                    if (resp.error && resp.error.message) {
                        error(resp.error.message);
                        return;
                    }
                }
                error("credit card could not be processed.");
            };

            var d = "card[number]=" + data.number + ";card[exp_month]=" + data.expMonth + ";card[exp_year]=" + data.expYear + ";card[cvc]=" + data.cvc + ";card[address_zip]=" + data.zip + ";card[name]=" + data.name;
            console.log("posting " + d + " to " + url);
            xhr.send(d);
        } catch(e) {
            error(e);
        }
    };

    // *************
    // wcf service calls

    //SvcReturnObject SendCustomerSupportMessage(Guid UserGUID, string Title, string Message)
    me.sendCustomerSupportMessage = function(data, success, error) {
        me.postAsync("SendCustomerSupportMessage", data, success, error);
    };

    // SvcReturnObject CreateCustomer(string FirstName, string LastName, string Email, string Phone, string Password, bool AllowSMSNotifications = true, bool AllowEmailNotifications = true)
    me.createCustomer = function(data, success, error) {
        me.postAsync("CreateCustomer", data, success, error);
    };

    me.CreateFacbookCustomer = function(data, success, error) {
        me.postAsync("CreateFacebookCustomer", data, success, error);
    };

    me.createOrder = function(data, success, error) {
        me.postAsync("CreateOrder", data, success, error);
    };

    me.createCashOrder = function(data, success, error) {
        Ti.API.info('----createCashOrder---- ' + JSON.stringify(data));
        me.postAsync("CreateCashOrder", data, success, error);
    };

    me.DonateWithStripe = function(data, success, error) {
        Ti.API.info('----DonateWithStripe---- ' + JSON.stringify(data));
        me.postAsync("DonateWithStripe", data, success, error);
    };

    me.DonateWithPaypal = function(data, success, error) {
        Ti.API.info('----DonateWithPaypal---- ' + JSON.stringify(data));
        me.postAsync("DonateWithPaypal", data, success, error);
    };

    me.getCustomerInfo = function(data, success, error) {
        me.postAsync("GetCustomerInfo", data, success, error);
    };

    me.GetHeaderFooterList = function(data, success, error) {
        me.postAsync("GetHeaderFooterList", data, success, error);
    };

    me.GetGoalsByVendor = function(data, success, error) {
        me.postAsync("GetGoalsByVendor", data, success, error);
    };
    me.UpdateVendorGoalById = function(data, success, error) {
        me.postAsync("UpdateVendorGoalById", data, success, error);
    };

    //  public SvcReturnObject GetCustomerOrderStatus(Guid UserGUID, int OrderID)
    me.getCustomerOrderStatus = function(data, success, error) {
        me.postAsync("GetCustomerOrderStatus", data, success, error);
    };

    //  public SvcReturnObject GetCustomerOrder(Guid UserGUID, int OrderID)
    me.getCustomerOrder = function(data, success, error) {
        me.postAsync("GetCustomerOrder", data, success, error);
    };

    //  public SvcReturnObject GetCustomerOrders(Guid UserGUID)
    me.getCustomerOrders = function(data, success, error) {
        me.postAsync("GetCustomerOrders", data, success, error);
    };

    me.deleteStripeCard = function(data, success, error) {
        me.postAsync("DeleteStripeCard", data, success, error);
    };

    me.getMenuItemsForCustomer = function(data, success, error) {
        //return me.postAsync("GetMenuItemsForCustomerWithImageURL", data, success, error);
        return me.postAsync("GetMenuItemsForCustomerWithCombo", data, success, error);
    };

    me.updateCustomer = function(data, success, error) {
        return me.postAsync("UpdateCustomer", data, success, error);
    };

    me.getStripeCards = function(data, success, error) {
        return me.postAsync("GetStripeCards", data, success, error);
    };

    me.saveStripeCard = function(data, success, error) {
        return me.postAsync("SaveCard", data, success, error);
    };

    me.getVendorInfo = function(data, success, error) {
        return me.postAsync("GetVendorInfo", data, success, error);
    };

    // SvcReturnObject GetVendors(int? VenueID)
    me.getVendors = function(data, success, error) {
        return me.postAsync("GetVendors", data, success, error);
    };

    // SvcReturnObject GetVenueLocationsByGeoloction(string Latitude, string Longitude, double? MileRadius)
    me.getVenueLocationsByGeoloction = function(data, success, error) {
        me.postAsync("GetVenueLocationsByGeoloction", data, success, error);
    };

    //public SvcReturnObject GetVenueLocationsByZipCode(string City, string State)
    me.getVenueLocationsByZipCode = function(data, success, error) {
        me.postAsync("GetVenueLocationsByZipCode", data, success, error);
    };

    //public SvcReturnObject GetVenueLocationsByQuery(string Query)
    me.getVenueLocationsByQuery = function(data, success, error) {
        me.postAsync("GetVenueLocationsByQuery", data, success, error);
    };

    // SvcReturnObject LoginCustomer(string Email, string Password)
    me.loginCustomer = function(data, success, error) {
        me.postAsync("LoginCustomer", data, success, error);
    };

    // SvcReturnObject LoginCustomer(string Email, string Password)
    me.loginRunner = function(data, success, error) {
        me.postAsync("LoginRunner", data, success, error);
    };

    me.sendForgotPasswordEmailToCustomer = function(data, success, error) {
        me.postAsync("SendForgotPasswordEmailToCustomer", data, success, error);
    };

    me.Test = function(data, success, error) {
        me.postAsync("Test", data, success, error);
    };

    me.changePasswordForCustomerWithChangePasswordGUID = function(data, success, error) {
        me.postAsync("ChangePasswordForCustomerWithChangePasswordGUID", data, success, error);
    };

    me.changePassword = function(password, newPassword, success, error) {
        var data = {
            UserGUID : me.customerGuid.UserGUID,
            Password : password,
            NewPassword : newPassword
        };
        me.updateCustomerPassword(data, success, error);
    };

    me.updateCustomerPassword = function(data, success, error) {
        me.postAsync("UpdateCustomerPassword", data, success, error);
    };

    // *************
    // auth functions
    me.authenticateUser = function(email, password, success, error) {
        var data = {
            Email : email,
            Password : password,
            PlayerId : Ti.App.Properties.getString("ONESIGNAL_PLAYER_ID")
        };

        me.loginCustomer(data, function(resp, status, msg) {
            if (status == 1) {

                me.isAuthenticated = true;
                me.customerEmail = email;
                me.customerGuid = resp;
                console.log("user logged in, customer guid: " + JSON.stringify(resp));
                console.log("user logged in, customer guid: " + me.customerGuid);

                Ti.App.Properties.setString("lastUserEmail", email);
                Ti.App.Properties.setString("lastUserPassword", password);
                Ti.App.Properties.setBool("isRunner", false);

                Alloy.Globals.lastUserPasssword = password;
            }

            success(resp, status, msg);
        }, function() {
            error();
        });
    };

    // auth functions
    me.authenticateRunner = function(email, password, success, error) {
        var data = {
            Email : email,
            Password : password,
            PlayerId : Ti.App.Properties.getString("ONESIGNAL_PLAYER_ID")
        };

        me.loginRunner(data, function(resp, status, msg) {

            if (status == 1) {
                Ti.API.info('=====loginRunner resp===== ' + JSON.stringify(resp));
                me.isAuthenticated = true;
                me.customerEmail = email;
                me.customerGuid = resp;
                //me.VendorGUID = resp.VendorGUID;
                console.log("user logged in, customer guid: " + JSON.stringify(resp));
                console.log("user logged in, customer guid: " + me.customerGuid);

                Ti.App.Properties.setString("lastUserEmail", email);
                Ti.App.Properties.setString("VendorGUID", resp.VendorGUID);
                Ti.App.Properties.setString("runnerID", resp.ID);
                Ti.App.Properties.setString("lastUserPassword", password);
                Ti.App.Properties.setBool("isRunner", true);

                var localVenue = {
                    id : resp.Venue.id,
                    name : resp.Venue.VenueName,
                    address : resp.Venue.Address,
                    cityStateZip : resp.Venue.City + ", " + resp.Venue.State + " " + resp.Venue.Zip
                };
                var vendorJson = resp.Vendor;
                me.setVenue(localVenue.id, localVenue.name, localVenue.address, localVenue.cityStateZip);
                me.setVendor(vendorJson.VendorId, vendorJson.Name, vendorJson.Description, vendorJson.serviceFee, vendorJson, vendorJson.CanDeliver);
                Alloy.Globals.lastVendorID = vendorJson.VendorId;

                Alloy.Globals.lastUserPasssword = password;
            }

            success(resp, status, msg);
        }, function() {
            Ti.API.info(' ====loginRunner error==== ');
            error();
        });
    };

    me.signOut = function() {

        var dialog = Ti.UI.createAlertDialog({
            cancel : 1,
            buttonNames : ['Yes', 'No'],
            message : 'Are you sure you want to continue?  You will be logged out and your cart will be cleared.',
            title : 'Confirm log out'
        });
        dialog.addEventListener('click', function(e) {
            if (e.index === e.source.cancel) {
                Ti.API.info('The cancel button was clicked');
            } else {
                me.clearCart();
                me.isAuthenticated = false;
                me.customerEmail = "";
                me.customerGuid = "";
                Ti.App.Properties.setString("lastUserPassword", "");
                me.mainWindow.close();
            }
        });
        dialog.show();

    };

    // *************
    // cart functions
    me.getServiceCharge = function(subTotal, orderItems) {

        if (me.orderFees.calcFee) {
            try {
                return me.orderFees.calcFee(me.getOrderItems(), me.orderType);
            } catch(e) {
                console.log("ERROR Calculating total", e);
            }
        }

        if (me.orderType == 2) {
            return me.orderFees.deliveryServiceFee;
        } else {
            return me.orderFees.serviceFee;
        }

        var serviceCharge = subTotal * me.vendorServiceFeePercentage;
        if (serviceCharge < me.vendorMinServiceFee) {
            serviceCharge = me.vendorMinServiceFee;
        } else if (serviceCharge > me.vendorMaxServiceFee) {
            serviceCharge = me.vendorMaxServiceFee;
        }
        return serviceCharge;
    };

    me.updateCartCountText = function() {
        var text = "";
        if (me.cartItems.length) {
            text = me.cartItems.length + " item";
            if (me.cartItems.length > 1) {
                text = text + "s";
            }
            text = text + " in your cart";
        }

        me.settings.set("cartCountText", text);
    };

    me.addItemToCart = function(item) {
        me.cartItems.push(item);
        me.settings.set("cartCount", me.cartItems.length);
        me.settings.set("cartEmpty", 0);

        me.settings.set("isCartEmpty", false);
        me.settings.set("isItemInCart", true);
        me.updateCartCountText();
        me.settings.save();

        if (me.mainWindow && me.mainWindow.notify) {
            me.mainWindow.notify("item added to cart!");
        }

        if (me.mainWindow) {
            me.mainWindow.refreshFooter();
        }
    };

    me.clearCart = function() {
        me.cartItems = [];
        me.settings.set("cartCount", 0);
        me.settings.set("cartEmpty", 1);
        me.settings.set("isCartEmpty", true);
        me.settings.set("isItemInCart", false);
        me.settings.set("specialInstructions", "");
        me.updateCartCountText();
        me.settings.save();

        /*
         if(me.mainWindow && me.mainWindow.notify) {
         me.mainWindow.notify("cart cleard!");
         }
         */

        if (me.mainWindow) {
            console.log("refreshing footer");
            me.mainWindow.refreshFooter();
        }
    };

    me.getCartSubTotal = function() {
        var subTotal = 0.00;
        for (var i = 0; i < me.cartItems.length; i++) {
            var item = me.cartItems[i];
            subTotal += (item.price * item.quantity);

            if (item.addOns) {
                for (var j = 0; j < item.addOns.length; j++) {
                    var addOn = item.addOns[j];
                    subTotal += (addOn.price * item.quantity);
                }
            }
        }

        return subTotal;
    };

    me.removeItemFromCart = function(item) {
        var index = me.cartItems.indexOf(item);
        if (index > -1) {
            me.cartItems.splice(index, 1);
        }
        me.settings.set("cartCount", me.cartItems.length);
        me.settings.set("cartEmpty", me.cartItems.length == 0);

        if (me.cartItems.length == 0) {
            me.settings.set("isCartEmpty", true);
            me.settings.set("isItemInCart", false);
        }
        me.updateCartCountText();
        me.settings.save();

        if (me.mainWindow) {
            me.mainWindow.refreshFooter();
        }
    };

    me.setPastOrders = function(orders) {

    };

    // *************
    // utility functions

    me.getFontAwesomeIconFromStripeCardBrand = function(ccBrand) {
        /*
         * he brand parameter of the card object exposes whether the card brand is
         * Visa, American Express, MasterCard, Discover, JCB or Diners Club.
         * A card brand may be Unknown if we are unable to determine its brand.
         */
        var ret = "fa-credit-card";
        switch(ccBrand.toLowerCase()) {
        case "visa":
            ret = "fa-cc-visa";
            break;
        case "american express":
            ret = "fa-cc-amex";
            break;
        case "mastercard":
            ret = "fa-cc-mastercard";
            break;
        case "discover":
            ret = "fa-cc-discover";
            break;
        case "jcb":
            ret = "fa-cc-jcb";
            break;
        case "diners club":
            ret = "fa-cc-diners-club";
            break;
        }

        return ret;
    };

    me.getOrderItems = function() {
        var orderItems = [];
        for (var i = 0; i < me.cartItems.length; i++) {
            var item = me.cartItems[i];
            var itemAddons = [];
            if (item.addOns && item.addOns.length > 0) {
                for (var j = 0; j < item.addOns.length; j++) {
                    var addOn = item.addOns[j];
                    itemAddons.push({
                        MenuItemID : addOn.id
                    });
                }
            }

            orderItems.push({
                MenuItemID : item.id,
                Quantity : item.quantity,
                OrderItemAddons : itemAddons
            });
        }

        return orderItems;
    };

    me.getCashOrderForSubmission = function() {
        var subTotal = me.getCartSubTotal();
        //var serviceFee = me.vendor.get("serviceFee");
        var serviceFee = me.getServiceCharge(subTotal, me.cartItems);
        var tip = 0;
        //if (me.orderType == 2) {
        tip = me.tipAmount;
        //}
        var total = subTotal + serviceFee + tip;

        var o = {
            UserGUID : Ti.App.Properties.getBool("isRunner") ? null : me.customerGuid.UserGUID,
            RunnerId : Ti.App.Properties.getBool("isRunner") ? Ti.App.Properties.getString("runnerID") : null,
            Order : {
                Subtotal : subTotal,
                ServiceFee : serviceFee,
                TipAmount : tip,
                Total : total,
                SpecialInstructions : me.settings.get("specialInstructions"),
                VendorOrderNumber : '',
                VendorID : me.vendor.get("id"),
                FulfillmentTypeID : me.orderType,
            },
            Latitude : Ti.App.Properties.getString('user_latitude'),
            Longitude : Ti.App.Properties.getString('user_longitude')
        };

        orderItems = [];

        for (var i = 0; i < me.cartItems.length; i++) {
            Ti.API.info('---me.cartItems.--- ' + JSON.stringify(me.cartItems));
            var item = me.cartItems[i];
            var itemAddons = [];
            if (item.addOns && item.addOns.length > 0) {
                for (var j = 0; j < item.addOns.length; j++) {
                    var addOn = item.addOns[j];
                    itemAddons.push({
                        MenuItemID : addOn.id
                    });
                }
            }

            orderItems.push({
                MenuItemID : item.id,
                Quantity : item.quantity,
                OrderItemAddons : itemAddons,
                IsCombo : item.IsCombo
            });
        }

        o.Order.OrderItems = orderItems;
        if (me.orderType == 2) {
            o.Order.OrderLocations = [{
                CustomerName : me.customerName(),
                Section : me.customerSection,
                Row : me.customerRow,
                Seat : me.customerSeat
            }];
        }

        return o;
    };

    me.getOrderTotalAndFee = function(data, success, error) {
        if (!data) {
            data = {
                VendorID : me.vendor.get("id"),
                FulfillmentType : me.orderType,
                PaymentType : null,
                OrderItems : me.getOrderItems()
            };
        }
        me.postAsync("GetOrderTotalAndFee", data, success, error);
    };

    me.getOrderForSubmission = function() {

        var subTotal = parseFloat(me.getCartSubTotal());
        var ccFee = parseFloat((subTotal * .035).toFixed(2));
        //var serviceFee = me.vendor.get("serviceFee");
        var serviceFee = parseFloat(me.getServiceCharge(subTotal, me.cartItems)) + ccFee;
        var tip = 0;
        if (me.orderType == 2) {
            tip = me.tipAmount;
        }
        var total = subTotal + serviceFee + parseFloat(tip);

        var o = {
            UserGUID : Ti.App.Properties.getBool("isRunner") ? null : me.customerGuid.UserGUID,
            RunnerId : Ti.App.Properties.getBool("isRunner") ? Ti.App.Properties.getString("runnerID") : null,
            Order : {
                Subtotal : subTotal,
                ServiceFee : serviceFee,
                TipAmount : tip,
                Total : total,
                SpecialInstructions : me.settings.get("specialInstructions"),
                VendorOrderNumber : '',
                VendorID : me.vendor.get("id"),
                FulfillmentTypeID : me.orderType,
            },
            StripeToken : me.creditCardInfo.id,
            StripeCardID : me.orderCreditCardId,
            SaveCard : me.saveCard,
            Latitude : Ti.App.Properties.getString('user_latitude'),
            Longitude : Ti.App.Properties.getString('user_longitude')
        };

        orderItems = [];
        for (var i = 0; i < me.cartItems.length; i++) {
            var item = me.cartItems[i];
            var itemAddons = [];
            if (item.addOns && item.addOns.length > 0) {
                for (var j = 0; j < item.addOns.length; j++) {
                    var addOn = item.addOns[j];
                    itemAddons.push({
                        MenuItemID : addOn.id
                    });
                }
            }

            orderItems.push({
                MenuItemID : item.id,
                Quantity : item.quantity,
                OrderItemAddons : itemAddons
            });
        }

        o.Order.OrderItems = orderItems;
        if (me.orderType == 2) {
            o.Order.OrderLocations = [{
                CustomerName : me.customerName(),
                Section : me.customerSection,
                Row : me.customerRow,
                Seat : me.customerSeat
            }];
        }

        return o;
    };

    me.getOrderStatus = function(id, success, error) {
        if (me.customerGuid && me.customerGuid.UserGUID) {
            me.getCustomerOrder({
                UserGUID : me.customerGuid.UserGUID,
                OrderID : id
            }, function(data, status, msg) {
                success(data, status, msg);
            }, function(err) {
                error(err);
            });
        } else if (Ti.App.Properties.getBool("isRunner")) {
            me.getCustomerOrder({
                OrderID : id
            }, function(data, status, msg) {
                success(data, status, msg);
            }, function(err) {
                error(err);
            });
        }
    };

    me.goToHome = function() {
        me.mainWindow.goToHome();
    };

    me.goToPastOrders = function(backButtonHandler) {
        if (me.customerGuid && me.customerGuid.UserGUID) {
            console.log("getting past orders...");
            me.mainWindow.showLoading("Retreiving orders...");
            me.getCustomerOrders(me.customerGuid, function(data, status, msg) {
                Ti.API.info('======data======= ' + JSON.stringify(data));
                if (status == 1) {
                    console.log("got orders successfully " + JSON.stringify(data));
                    me.pastOrders.fetch();
                    for (var i = me.pastOrders.models.length - 1; i >= 0; i--) {
                        me.pastOrders.models[i].destroy();
                    }

                    for (var i = data.length - 1; i > -1; i--) {
                        var item = data[i];

                        var createdAt = moment.utc(item.CreatedAt).toDate();
                        createdAt = createdAt - createdAt.getTimezoneOffset();

                        var o = me.pastOrders.push({
                            id : item.OrderID,
                            vendorOrderNumber : item.VendorOrderNumber,
                            serviceFee : item.ServiceFee,
                            subTotal : item.Subtotal,
                            total : item.Total,
                            vendorID : item.Vendor.VendorID,
                            vendorName : item.Vendor.Name,
                            vendorDescription : item.Vendor.Description,
                            venueID : item.Venue.VenueID,
                            venueName : item.Venue.VenueName,
                            venueAddress : item.Venue.Address,
                            venueCity : item.Venue.City,
                            venueState : item.Venue.State,
                            venueZip : item.Venue.Zip,
                            orderStatusID : item.OrderStatus.OrderStatusID,
                            orderStatusName : item.OrderStatus.Name,
                            orderStatusDescription : item.OrderStatus.Description,
                            fulfillmentTypeName : item.FulfillmentTypeName,
                            specialInstructions : item.SpecialInstructions,
                            itemCount : item.OrderItems.length,
                            delivering : (item.OrderStatus.Name == "Delivering") ? true : false,
                            serviceFeeTxt : "$" + parseFloat(item.ServiceFee).toFixed(2),
                            subTotalTxt : "$" + parseFloat(item.Subtotal).toFixed(2),
                            totalTxt : "$" + parseFloat(item.Total).toFixed(2),
                            vendorOrderNumberTxt : "Order #" + item.VendorOrderNumber,
                            dateCreatedTxt : moment(createdAt).format("M/D/YYYY h:mm A"),
                            orderStatusWidth : item.OrderStatus.PercentComplete + "%"
                        });
                        o.save();
                    }

                    var backFunc = backButtonHandler ||
                    function() {
                        me.goToHome();
                    };
                    me.mainWindow.changeView('pastOrdersView', 'Past Orders', true, backFunc);
                } else {
                    alert("Error getting past orders: " + msg);
                }

                me.mainWindow.hideLoading();
            }, function(err) {
                me.mainWindow.hideLoading();
                if (err) {
                    alert("Error getting past orders: " + err);
                } else {
                    alert("Error getting past orders");
                }
            });
        } else {
            console.log("getting past orders else...");
            me.mainWindow.showLoading("Retreiving orders...");
            me.getCustomerOrders(me.customerGuid, function(data, status, msg) {
                console.log("got orders successfully " + JSON.stringify(data));
                if (status == 1) {
                    me.pastOrders.fetch();
                    for (var i = me.pastOrders.models.length - 1; i >= 0; i--) {
                        me.pastOrders.models[i].destroy();
                    }

                    for (var i = data.length - 1; i > -1; i--) {
                        var item = data[i];

                        var createdAt = moment.utc(item.CreatedAt).toDate();
                        createdAt = createdAt - createdAt.getTimezoneOffset();

                        var o = me.pastOrders.push({
                            id : item.OrderID,
                            vendorOrderNumber : item.VendorOrderNumber,
                            serviceFee : item.ServiceFee,
                            subTotal : item.Subtotal,
                            total : item.Total,
                            vendorID : item.Vendor.VendorID,
                            vendorName : item.Vendor.Name,
                            vendorDescription : item.Vendor.Description,
                            venueID : item.Venue.VenueID,
                            venueName : item.Venue.VenueName,
                            venueAddress : item.Venue.Address,
                            venueCity : item.Venue.City,
                            venueState : item.Venue.State,
                            venueZip : item.Venue.Zip,
                            orderStatusID : item.OrderStatus.OrderStatusID,
                            orderStatusName : item.OrderStatus.Name,
                            orderStatusDescription : item.OrderStatus.Description,
                            fulfillmentTypeName : item.FulfillmentTypeName,
                            specialInstructions : item.SpecialInstructions,
                            itemCount : item.OrderItems.length,

                            serviceFeeTxt : "$" + parseFloat(item.ServiceFee).toFixed(2),
                            subTotalTxt : "$" + parseFloat(item.Subtotal).toFixed(2),
                            totalTxt : "$" + parseFloat(item.Total).toFixed(2),
                            vendorOrderNumberTxt : "Order #" + item.VendorOrderNumber,
                            dateCreatedTxt : moment(createdAt).format("M/D/YYYY h:mm A"),
                            orderStatusWidth : item.OrderStatus.PercentComplete + "%"
                        });
                        o.save();
                    }

                    var backFunc = backButtonHandler ||
                    function() {
                        me.goToHome();
                    };
                    me.mainWindow.changeView('pastOrdersView', 'Past Orders', true, backFunc);
                } else {
                    alert("Error getting past orders: else " + msg);
                }

                me.mainWindow.hideLoading();
            }, function(err) {
                me.mainWindow.hideLoading();
                if (err) {
                    alert("Error getting past orders: err" + err);
                } else {
                    alert("Error getting past orders");
                }
            });
        }
    };

    me.goToVendorMenu = function(backButtonHandler) {
        if (me.vendor.has("id")) {
            me.mainWindow.showLoading("Getting menu...");
            /*me.vendorMenuItems.fetch();
             for (var i = me.vendorMenuItems.models.length-1; i >= 0; i--) {
             me.vendorMenuItems.models[i].destroy();
             }*/

            me.vendorMenu = [];
            me.getMenuItemsForCustomer({
                VendorID : me.vendor.get("id")
            }, function(resp, status, msg) {
                if (status == 1) {
                    //console.log("got menu items for customer successfully " + status + msg);
                    console.log("--MENU RESPONSE--> " + JSON.stringify(resp));
                    //var imageBlob = Ti.Utils.base64decode(resp[0].Image);

                    // set condiments
                    me.condiments = [];
                    for (var i = 0; i < resp.menuitem.length; i++) {
                        var item = resp.menuitem[i];

                        //console.log("item", item.Name, item.MenuItemType.MenuItemTypeID);

                        //if(!item.Image) continue;

                        if (item.MenuItemType.IsCondiment) {
                            me.condiments.push(item);
                        }

                        //console.log(item);
                        var m = {
                            id : item.MenuItemID,
                            itemName : item.Name,
                            menuItemTypeID : item.MenuItemType.MenuItemTypeID,
                            price : item.Price,
                            isCondiment : item.MenuItemType.IsCondiment,
                            canCustomize : item.MenuItemType.MenuItemTypeID == 1,
                            priceTxt : "$" + parseFloat(item.Price).toFixed(2),
                            itemImage : item.imageUrl,
                            isAlcohol : item.IsAlcohol,
                            type : "item",
                            properties : {// Sets the label properties
                                backgroundColor : '#5568a2',
                                backgroundImage : null//"/images/Rectangle.png"
                            },
                            item_parent : {
                                backgroundColor : '#5568a2',
                            }
                        };

                        m.id = {
                            text : item.MenuItemID
                        };
                        m.CanCustomize = {
                            visible : false,//m.canCustomize
                        };
                        m.ItemImage = {
                            image : m.itemImage,
                            id : m.id,
                            defaultImage : "/images/loading.png"
                        };
                        m.ItemName = {
                            text : m.itemName
                        };
                        m.Price = {
                            text : m.price
                        };
                        m.PriceText = {
                            text : m.priceTxt
                        };
                        m.type = {
                            text : m.type
                        };
                        m.sepParent = {
                            visible : false
                        };

                        // alcohol

                        me.vendorMenu.push(m);

                        //m.set("itemImage", Ti.Utils.base64decode(item.Image));
                        //m.save();
                    }

                    for (var i = 0; i < resp.Comboitems.length; i++) {
                        var item = resp.Comboitems[i];

                        //console.log(item);
                        var m = {
                            id : item.ComboId,
                            itemName : item.ComboName,
                            menuItemTypeID : 1, //"combo"+i,
                            price : item.ComboPrice,
                            isCondiment : false,
                            canCustomize : false,
                            priceTxt : "$" + parseFloat(item.ComboPrice).toFixed(2),
                            itemImage : "",
                            isAlcohol : false,
                            type : "combo",
                            properties : {// Sets the label properties
                                backgroundColor : null, //'#5568a2',
                                backgroundImage : "/images/Rectangle.png",
                                top : 5,
                            },
                            item_parent : {
                                //backgroundImage : "/images/Rectangle.png"
                            }
                        };

                        m.id = {
                            text : m.id
                        };
                        m.CanCustomize = {
                            visible : m.canCustomize
                        };
                        m.ItemImage = {
                            image : m.itemImage,
                            id : m.id,
                            visible : false
                        };
                        m.ItemName = {
                            text : m.itemName,
                            left : 10,
                            top : 10,
                            right : null,
                            font : {
                                fontSize : "24",
                                fontWeight : "normal"
                            },
                            color : "#000"
                        };
                        m.Price = {
                            text : m.price,
                        };
                        m.PriceText = {
                            text : m.priceTxt,
                            left : 10,
                            top : 40,
                            right : null,
                            font : {
                                fontSize : "24",
                                fontWeight : "normal"
                            },
                            color : "#000"
                        };

                        m.type = {
                            text : m.type
                        };

                        m.textParent = {
                            left : 0,
                            layout : 'absolute',
                            width : Ti.UI.FILL,
                            top : 5
                        };

                        m.sepParent = {
                            visible : false
                        };
                        m.btn_parent = {
                            width : '50%',
                            right : 5,
                            bottom : 5,
                        };

                        // alcohol

                        me.vendorMenu.push(m);

                        //m.set("itemImage", Ti.Utils.base64decode(item.Image));
                        //m.save();
                    }

                    var backFunc = backButtonHandler ||
                    function() {
                        me.goToHome();
                    };
                    me.mainWindow.goToVendorMenu(backFunc);

                } else {
                    alert(msg);
                    me.mainWindow.goToHome();
                }

                me.mainWindow.hideLoading();

            }, function(e) {
                console.log("Error getting menu items:", e);
                me.mainWindow.hideLoading();
            });
        } else {
            me.openVenueSelectionWindow({
                callback : function() {
                    if (me.vendor.has("id"))
                        me.goToVendorMenu();
                }
            });
        }
    };

    me.maskTextField = function(txtField, mask) {
        var madeChange = false;
        var last;
        txtField.addEventListener("change", function() {
            console.log("txtField changed");
            if (madeChange) {
                madeChange = false;
                return;
            }
            if (last != txtField.value) {
                console.log("MASK?");
                madeChange = true;
                Mask.mask(txtField, mask);
                last = txtField.value;
                txtField.setSelection(last.length, last.length);
            }
        });
    };

    me.openCartWindow = function(cartArgs) {
        me.mainWindow.showLoading("Loading cart...");

        me.refreshVendor(function() {
            me.mainWindow.hideLoading();
            var cartWindow = Alloy.createController("cartWindow", cartArgs);
            cartWindow.getView().open();
        });

        /*
         var count = 0;

         var done = function() {
         me.mainWindow.hideLoading();
         var cartWindow = Alloy.createController("cartWindow", cartArgs);
         cartWindow.getView().open();
         };

         var checkDone = function() {
         count++;
         if(count > 1) done();
         };

         me.refreshVendor(function() {
         checkDone();
         }, function(){
         checkDone();
         });

         me.getOrderTotalAndFee(null, function(data, status, msg) {

         console.log("ORDER TOTAL AND FEEs", data);
         if(status == 1) {
         me.orderFees.serviceFee = data.serviceFee;
         me.orderFees.deliveryServiceFee = data.deliveryServiceFee;
         }

         console.log("parsing func...");
         try {
         eval("me.orderFees.calcFee = " + data.calcFee);
         if(me.orderFees.calcFee) {
         console.log("parse calcFee!");
         }
         } catch(e) {
         console.log("ERROR creating calcFee function: ", e);
         }

         checkDone();
         }, function() {
         checkDone();
         });

         */
    };

    me.openCustomizeWindow = function(custArgs) {
        var custWindow = Alloy.createController("customizeWindow", custArgs);
        custWindow.getView().open();
    };

    me.openOrderStatus = function(id, callback) {
        if (me.customerGuid && me.customerGuid.UserGUID) {
            me.mainWindow.showLoading("Retreiving order...");
            me.getCustomerOrder({
                UserGUID : me.customerGuid.UserGUID,
                OrderID : id
            }, function(data, status, msg) {
                if (status == 1) {
                    if (data.length) {
                        console.log("got order successfully");
                        var orderStatus = Alloy.createController("orderStatusWindow", [data[0], callback]);
                        orderStatus.getView().open();
                    } else {
                        alert("Order not found");
                    }

                } else {
                    alert("Error getting order: " + msg);
                }
                me.mainWindow.hideLoading();
            }, function(err) {
                me.mainWindow.hideLoading();
                if (err) {
                    alert("Error getting order: " + err);
                } else {
                    alert("Error getting order");
                }
            });
        }

    };

    me.openOrderStatusForTracking = function(id, callback) {
        if (me.customerGuid && me.customerGuid.UserGUID) {
            me.mainWindow.showLoading("Retreiving order...");
            me.getCustomerOrder({
                UserGUID : me.customerGuid.UserGUID,
                OrderID : id
            }, function(data, status, msg) {
                if (status == 1) {
                    if (data.length) {
                        console.log("got order successfully");
                        // var orderStatus = Alloy.createController("orderStatusWindow", [data[0], callback]);
                        // orderStatus.getView().open();
                        var win_mileageTracker = require("map/mileageTracker");
                        var windowInstance = new win_mileageTracker(data[0]);
                        windowInstance.open();
                    } else {
                        alert("Order not found");
                    }

                } else {
                    alert("Error getting order: " + msg);
                }
                me.mainWindow.hideLoading();
            }, function(err) {
                me.mainWindow.hideLoading();
                if (err) {
                    alert("Error getting order: " + err);
                } else {
                    alert("Error getting order");
                }
            });
        }

    };

    me.openVenueSelectionWindow = function(venArgs) {
        var venueWindow = Alloy.createController("venueWindow", venArgs);
        venueWindow.getView().open();
    };

    me.openContactUsWindow = function() {
        var contactWindow = Alloy.createController("contactUsWindow");
        contactWindow.getView().open();
    };

    me.resetOrder = function(goHome) {
        /*
         * creditCardInfo: null,
         hasPayment: false,
         saveCard: false,
         cartItems: [],
         specialInstructions: '',

         columns: {
         currentView: 'String',
         itemsInCart: 'integer',
         specialInstructions: 'String'
         },

         // this is the order format we send to wcf service
         customerCurrentOrder: {
         },
         */

        me.creditCardInfo = null;
        me.orderCreditCardId = null;
        me.hasPayment = false;
        me.saveCard = false;
        me.specialInstructions = '';
        me.clearCart();
        me.tipAmount = 1;

        if (me.mainWindow) {
            me.mainWindow.refreshFooter();
        }

        if (goHome && me.mainWindow) {
            me.mainWindow.goToHome();
        }
    };

    me.refreshVendor = function(success, error) {
        var vendorId = me.vendor.get("id") || Alloy.Globals.lastVendorID;
        if (vendorId) {
            me.getVendorInfo({
                VendorID : vendorId
            }, function(resp, status, msg) {
                if (status == 1) {
                    if (resp.IsActive) {
                        me.orderFees.serviceFee = resp.VendorServiceFee;
                        me.orderFees.deliveryServiceFee = resp.VendorDeliveryFee;

                        try {
                            eval("me.orderFees.calcFee = " + resp.VendorCalcFee);
                            if (me.orderFees.calcFee) {
                                console.log("parsed calcFee!");
                            }
                        } catch(e) {
                            console.log("ERROR creating calcFee function: ", e);
                        }

                        me.setVenue(resp.VenueID, resp.VenueName, resp.VenueAddress, resp.VenueCity + ", " + resp.VenueState + " " + resp.VenueZip);
                        me.setVendor(resp.VendorID, resp.VendorName, resp.VendorDescription, resp.ServiceFee, resp, resp.VendorCanDeliver);
                        me.refreshFooter();
                    }
                }

                if (success)
                    success();
            }, function() {
                if (error)
                    error();
            });
        }
    };

    me.getVendorDeliverySections = function(vendorId, success, error) {
        vendorId = vendorId || me.vendor.get("id") || Alloy.Globals.lastVendorID;
        me.getVendorInfo({
            VendorID : vendorId
        }, function(resp, status, msg) {
            if (status == 1) {
                if (resp.IsActive && resp.VendorIsOpen && resp.VendorCanDeliver) {
                    Ti.API.info('===success==== ' + resp.VendorSections);
                    success(resp.VendorSections);
                } else {
                    success([]);
                }
            } else {
                success([]);
            }
        }, function() {
            error();
        });
    };

    me.setVenue = function(id, name, address, cityStateZip) {
        console.log("setting venue...");
        me.venue.set({
            id : id,
            name : name,
            address : address,
            cityStateZip : cityStateZip
        });
        me.venue.save();
    };

    me.setVendor = function(id, name, description, serviceFee, vendor, canDeliver) {
        console.log("setting vendor...");
        me.vendor.set({
            id : id,
            name : name,
            description : description,
            serviceFee : serviceFee
        });
        me.vendor.save();

        me.vendorMaxServiceFee = vendor.MaxServiceFee;
        me.vendorMinServiceFee = vendor.MinServiceFee;
        me.vendorServiceFeePercentage = vendor.ServiceFeePercentage;
        me.vendorCanDeliver = canDeliver;
        me.vendorInfo = vendor;

        me.settings.set("hasVendor", true);
        me.settings.set("noVendor", false);
        me.settings.save();

        if (me.mainWindow) {
            me.mainWindow.refreshFooter();
        }

    };

    me.showLoader = function() {
        var loadingView = Alloy.createController('loadingView').getView();
        loadingView.open({
            modal : true
        });
    };

    me.swapViews = function(viewOut, viewIn, callback) {
        viewOut.right = "0%";
        viewOut.left = null;
        viewOut.animate(me.animateLeft, function() {
            viewIn.visible = true;
            viewIn.opacity = 0;
            viewIn.left = 0;
            console.log("animating into focus");
            viewIn.animate(me.animateIntoFocus, function() {
                console.log("animated into focus");
                if (callback)
                    callback();
            });
        });
    };

    me.swapViewsBack = function(viewFade, viewIn, callback) {
        viewFade.animate(me.animateOutOfFocus, function() {
            viewIn.animate(me.animateResetFromLeft, function() {
                viewFade.visible = false;
                if (callback)
                    callback();
            });
        });
    };

    // *************
    // animations
    me.animateLeft = Ti.UI.createAnimation({
        right : "100%",
        curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
        duration : 150
    });

    me.animateResetFromLeft = Ti.UI.createAnimation({
        right : "0%",
        opacity : 1.0,
        curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
        duration : 150
    });

    me.animateIntoFocus = Ti.UI.createAnimation({
        opacity : 1.0,
        curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
        duration : 250
    });

    me.animateOutOfFocus = Ti.UI.createAnimation({
        opacity : 0.0,
        curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
        duration : 250
    });

    me.animateRight = Ti.UI.createAnimation({
        left : "100%",
        curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
        duration : 150
    });

    var animateResetFromRight = Ti.UI.createAnimation({
        left : "0%",
        opacity : 1.0,
        curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
        duration : 150
    });

    return me;
}

module.exports = C2();
