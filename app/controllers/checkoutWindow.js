var args = arguments[0] || {};
var iOS7 = Alloy.Globals.isiOS7Plus();
var C2 = Alloy.Globals.C2;
var settings = C2.settings;
var cartWindow = args;
settings.fetch();

var gotCards = false;
var useCash = false;
var useCredit = false;

$.window.top = iOS7 ? 20 : 0;

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

// *************
// loading functions
function showLoading(msg) {
    if (msg) {
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
// private functions
function addedCreditCard(resp) {
    C2.creditCardInfo = resp;

    var last4 = resp.card.last4;
    var brand = resp.card.brand;

    togglePayment(true);
    $.lblCardType.text = "";
    $.lblRemove.text = "";
    $.lblLast4.text = resp.card.last4;
    $.lblCardType.icon = C2.getFontAwesomeIconFromStripeCardBrand(brand);
    $.fa.refresh();

    notify("Credit card *" + last4 + " added as payment");
}

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

function addCashPayment() {
    togglePayment(true, true);
}

function addPaymentApplePay() {
    var ApplePay = require('ti.applepay');
    ApplePay.setupPaymentGateway({
        name : ApplePay.PAYMENT_GATEWAY_STRIPE, // or: ApplePay.PAYMENT_GATEWAY_BRAINTREE
        apiKey : C2.stripePublishableKey
    });

    var paymentRequest = ApplePay.createPaymentRequest({
        merchantIdentifier : 'merchant.com.avatar.bpconc',
        merchantCapabilities : ApplePay.MERCHANT_CAPABILITY_3DS | ApplePay.MERCHANT_CAPABILITY_CREDIT | ApplePay.MERCHANT_CAPABILITY_DEBIT | ApplePay.MERCHANT_CAPABILITY_EMV,
        countryCode : 'US',
        currencyCode : 'USD',
        // billingContact: {
        // firstName : "Isaac",
        // middleName : "",
        // lastName : "Byrd",
        // prefix: "",
        // suffix: "",
        // address: "16105 Swingley Ridge Rd Chesterfield, Missouri 63006 United States",
        // street: "Swingley Ridge Rd",
        // city: "Missouri",
        // zip: "63006",
        // state: "US",
        // country: "USA",
        // ISOCountryCode: "",
        // subLocality: "",
        // subAdministrativeArea: "",
        // email: "isaac@ballparkconcierge.com",
        // phone: "1-407-5696080",
        // },
        // shippingContact: {
        // firstName : "Isaac",
        // middleName : "",
        // lastName : "Byrd",
        // prefix: "",
        // suffix: "",
        // address: "16105 Swingley Ridge Rd Chesterfield, Missouri 63006 United States",
        // street: "Swingley Ridge Rd",
        // city: "Missouri",
        // zip: "63006",
        // state: "US",
        // country: "USA",
        // ISOCountryCode: "",
        // subLocality: "",
        // subAdministrativeArea: "",
        // email: "isaac@ballparkconcierge.com",
        // phone: "1-407-5696080",
        // },
        supportedNetworks : [ApplePay.PAYMENT_NETWORK_VISA, ApplePay.PAYMENT_NETWORK_MASTERCARD],
        requiredShippingAddressFields : ApplePay.ADDRESS_FIELD_POSTAL_ADDRESS,
        requiredBillingAddressFields : ApplePay.ADDRESS_FIELD_POSTAL_ADDRESS,
        shippingType : ApplePay.SHIPPING_TYPE_DELIVERY,
        shippingMethods : [{
            "label" : "Free Shipping",
            "detail" : "Arrives in 5 to 7 days",
            "amount" : "0.00",
            "identifier" : "FreeShip"
        }],
        //summaryItems: summaryItems,
        applicationData : {
            userId : 1337
        }
    });
    var paymentDialog = ApplePay.createPaymentDialog({
        paymentRequest : paymentRequest
    });
    paymentDialog.show();

    paymentDialog.addEventListener('didSelectPayment', didSelectPayment);
    paymentDialog.addEventListener('didSelectShippingContact', didSelectShippingContact);
    paymentDialog.addEventListener('didSelectShippingMethod', didSelectShippingMethod);
    paymentDialog.addEventListener('willAuthorizePayment', didAuthorizePayment);
    paymentDialog.addEventListener('didAuthorizePayment', willAuthorizePayment);
    paymentDialog.addEventListener('close', function() {
        Ti.API.info('--paymentDialog close---');
    });

    function didSelectPayment(e) {
        e.handler.complete(paymentRequest.getSummaryItems());
    }

    function didSelectShippingContact(e) {
        e.handler.complete(ApplePay.PAYMENT_AUTHORIZATION_STATUS_SUCCESS, paymentRequest.getShippingMethods(), paymentRequest.getSummaryItems());
    }

    function didSelectShippingMethod(e) {
        e.handler.complete(ApplePay.PAYMENT_AUTHORIZATION_STATUS_SUCCESS, paymentRequest.getSummaryItems());
    }

    function willAuthorizePayment() {
        // Do amazing stuff here, before the payment is authorized.
    }

    function didAuthorizePayment(e) {
        // ... Send the encrypted payment data to your backend
        Ti.API.info('Payment successfully authorized: ' + e.success);

        e.handler.complete(ApplePay.PAYMENT_AUTHORIZATION_STATUS_SUCCESS);
    }

}

function addPaymentPaypal() {

    /*var configuration = PayPal.createConfiguration({
     merchantName: "rajiv bajaj",
     merchantPrivacyPolicyURL: "http://google.com",
     merchantUserAgreementURL: "http://google.com",
     locale: "en",
     defaultUserEmail: 'Rajiv_bajaj20@yahoo.co.in',
     defaultUserPhoneNumber: '4085753608',
     defaultUserPhoneCountryCode: 'USD',
     acceptCreditCards: true,
     alwaysDisplayCurrencyCodes: false,
     disableBlurWhenBackgrounding: false,
     presentingInPopover: false,
     forceDefaultsInSandbox: false,
     sandboxUserPassword: 'GE7XRRPFTHP4N7YM',
     sandboxUserPin: '1337',
     payPalShippingAddressOption: PayPal.PAYPAL_SHIPPING_ADDRESS_OPTION_NONE, // or *_PROVIDED, *_PAYPAL, *_BOTH
     rememberUser: false,
     disableShakeAnimations: false
     });
     var subTotal = C2.getCartSubTotal();
     var serviceCharge = C2.getServiceCharge(subTotal, C2.cartItems);
     var tip = 0;
     tip = C2.tipAmount;
     var total = subTotal + serviceCharge + tip;

     Ti.API.info('===total===== '+total);
     total = Number(total);
     Ti.API.info('===Number total===== '+total);

     var payment = PayPal.createPayment({
     configuration: configuration,
     currencyCode: "USD",
     amount: total,
     shortDescription: "Your order at Concierge",
     intent: PayPal.PAYMENT_INTENT_SALE,
     });

     payment.addEventListener("paymentDidCancel", function(e) {
     Ti.API.warn("paymentDidCancel");
     });

     payment.addEventListener("paymentWillComplete", function(e) {
     Ti.API.warn("paymentWillComplete");
     Ti.API.warn(e.payment);
     });

     payment.addEventListener("paymentDidComplete", function(e) {
     Ti.API.warn("paymentDidComplete");
     Ti.API.warn(e.payment);
     });
     payment.show({
     animated: true
     });
     */

    var subTotal = C2.getCartSubTotal();
    var serviceCharge = C2.getServiceCharge(subTotal, C2.cartItems);
    var tip = 0;
    tip = C2.tipAmount;
    var total = subTotal + serviceCharge + tip;

    Ti.API.info('===total===== ' + total);
    total = Number(total);
    Ti.API.info('===Number total===== ' + total);

    var PayPal = require('ti.paypal');

    PayPal.initialize({
        clientIdSandbox : "AdaQTKNTkuR85C7kDnMiSChaYdLWsxW5b4LvUEUpVSHpDMekAT1esHO5zIPalWRIiNzBx4ikCK9p_koT",
        clientIdProduction : "AS53ztK6vpsOAS-DfZIx9tN3Y9-rNYClbzdb8AzZO1LDOXgCVgBZavH8F33SMOTO_nFpweYcBZxJfhVI",
        environment : PayPal.ENVIRONMENT_SANDBOX // or: ENVIRONMENT_PRODUCTION
    });

    var item1 = PayPal.createPaymentItem({
        name : "My item",
        price : total,
        sku : "my-item",
        quantity : 1,
        currency : "USD"
    });

    var configuration = PayPal.createConfiguration({
        merchantName : "John Doe",
        merchantPrivacyPolicyURL : "http://google.com",
        merchantUserAgreementURL : "http://google.com",
        locale : "en"
    });

    var payment = PayPal.createPayment({
        // Required
        configuration : configuration,
        currencyCode : "USD",
        amount : total,
        shortDescription : "Your order at KAP",
        intent : PayPal.PAYMENT_INTENT_SALE,
        // Optional
        items : [item1]
    });

    payment.addEventListener("paymentDidCancel", function(e) {
        Ti.API.warn("paymentDidCancel");
    });

    payment.addEventListener("paymentWillComplete", function(e) {
        Ti.API.warn("paymentWillComplete");
        Ti.API.warn(e.payment);
    });

    payment.addEventListener("paymentDidComplete", function(e) {
        Ti.API.warn("paymentDidComplete");
        Ti.API.warn(e.payment);
        submitCashOrder();
    });

    payment.show();

}

function togglePayment(hasPayment, isCash) {
    C2.hasPayment = hasPayment;

    if (hasPayment) {
        $.btnSelectCreditCard.hide();

        if (isCash) {
            useCash = true;
            $.viewCashInfo.visible = true;
            $.viewCardInfo.visible = false;
        } else {
            $.viewCardInfo.visible = true;
            $.viewCashInfo.visible = false;
            useCash = false;
            useCredit = true;
        }

        $.viewPaymentType.visible = false;

    } else {
        useCash = false;
        $.btnSelectCreditCard.show();
        $.viewPaymentType.visible = true;
        $.viewCardInfo.visible = false;
        $.viewCashInfo.visible = false;
        useCredit = false;
    }

    $.cartActionsView.visible = hasPayment;
    updateTotals();
}

function updateSpecialInstructions() {
    //settings.set("specialInstructions", $.txtSpecialInstructions.value);
    settings.save();
}

// *************
// button events
function addCreditCard() {
    showLoading();
    C2.getStripeCards({
        UserGUID : C2.customerGuid.UserGUID
    }, function(resp, status, msg) {
        hideLoading();

        if (status == 1) {
            gotCards = true;
            cardCount = resp.length;

            if (cardCount > 0) {
                var win = Alloy.createController('paymentMethodsWindow', addedCreditCard).getView();
                win.open();
            } else {
                var creditCardWin = Alloy.createController("addCreditCardWindow", addedCreditCard).getView();
                creditCardWin.open();
            }

        } else {
            hideLoading();
            var creditCardWin = Alloy.createController("addCreditCardWindow", addedCreditCard).getView();
            creditCardWin.open();
        }
    }, function(err) {
        console.log("ERROR", err);
        hideLoading();
        var creditCardWin = Alloy.createController("addCreditCardWindow", addedCreditCard).getView();
        creditCardWin.open();
    });

}

function goBack() {

    $.window.close();
}

function removeCash() {
    // do stuff to remove credit card
    togglePayment(false);
}

function removeCreditCard() {
    // do stuff to remove credit card

    var dialog = Ti.UI.createAlertDialog({
        cancel : 1,
        buttonNames : ['Confirm', 'Cancel'],
        message : 'Are you sure you want to remove this credit card payment?',
        title : 'Confirm'
    });
    dialog.addEventListener('click', function(e) {
        if (e.index === e.source.cancel) {
            Ti.API.info('The cancel button was clicked');
        } else {
            // do stuff that removes card, update C2 order, delete token, etc...
            C2.creditCardInfo = null;
            togglePayment(false);
        }
    });
    dialog.show();
}

function submitCashOrder() {
    var customerCurrentOrder = C2.getCashOrderForSubmission();
    Ti.API.info('----customerCurrentOrder---- ' + JSON.stringify(customerCurrentOrder));
    if (Ti.App.Properties.getBool("isRunner")) {
        customerCurrentOrder.RunnerEmail = $.tf_email.value;
    }
    showLoading("Submitting Order...");
    C2.createCashOrder(customerCurrentOrder, function(payload, status, msg) {
        Ti.API.info('---status---- ' + status);
        Ti.API.info('--payload---- ' + JSON.stringify(payload));
        if (status == 1) {
            // get order status
            C2.getOrderStatus(payload.OrderID, function(data, status2, msg2) {
                hideLoading();
                if (status2 == 1 && data.length) {
                    console.log("got order successfully");
                    var orderStatus = Alloy.createController("orderStatusWindow", [data[0], null]);
                    orderStatus.getView().open();
                    alert("Order submitted successfully!");
                } else {
                    console.log("ERROR getting status...", msg2);
                    alert("Order submitted successfully.");
                }
                //$.txtSpecialInstructions.value = "";
                C2.resetOrder(true);
                if (cartWindow) {
                    cartWindow.close();
                    // clear cart, set order to empty
                    $.window.close();
                }
            }, function(err) {
                hideLoading();
                console.log("ERROR", err);
                alert("Order submitted successfully.");
                if (cartWindow) {
                    cartWindow.close();
                    // clear cart, set order to empty
                    $.window.close();
                }
                //$.txtSpecialInstructions.value = "";
                C2.resetOrder(true);
            });
        } else {
            alert("Error submitting order: " + msg);
            hideLoading();
        }
    }, function(e) {
        hideLoading();
        alert("ERROR!");
        console.log(e);
    });
}

function submit() {
    $.notificationView.visible = false;
    console.log("Submitting order", C2.orderCreditCardId);
    updateSpecialInstructions();

    if (useCash) {
        submitCashOrder();
    } else if (C2.creditCardInfo && (C2.creditCardInfo.id || C2.orderCreditCardId)) {
        /*var customerCurrentOrder = {
         UserGUID: '90D10ECB-46F1-415A-9D89-B052DFE3F16D',
         Order: {
         Subtotal: 2.75,
         ServiceFee: 1.00,
         SpecialInstructions: 'test',
         VendorOrderNumber: 'VEN124',
         VendorID: 27,
         FulfillmentTypeID: 1,
         OrderItems: [{
         MenuItemID: 42,
         Quantity: 1,
         OrderItemAddons: [{
         MenuItemID: 45
         }]
         }]
         },
         StripeToken: C2.creditCardInfo.id,
         SaveCard: false
         };*/

        var customerCurrentOrder = C2.getOrderForSubmission();
        if (Ti.App.Properties.getBool("isRunner")) {
            customerCurrentOrder.RunnerEmail = $.tf_email.value;
        }

        showLoading("Submitting Order...");
        C2.createOrder(customerCurrentOrder, function(payload, status, msg) {

            if (status == 1) {
                // get order status
                C2.getOrderStatus(payload.OrderID, function(data, status2, msg2) {
                    hideLoading();
                    if (status2 == 1 && data.length) {
                        console.log("got order successfully");
                        var orderStatus = Alloy.createController("orderStatusWindow", [data[0], null]);
                        orderStatus.getView().open();
                        alert("Order submitted successfully!");
                    } else {
                        console.log("ERROR getting status...", msg2);
                        alert("Order submitted successfully.");
                    }

                    //$.txtSpecialInstructions.value = "";
                    C2.resetOrder(true);

                    if (cartWindow) {
                        cartWindow.close();

                        // clear cart, set order to empty

                        $.window.close();
                    }
                }, function(err) {
                    hideLoading();
                    console.log("ERROR", err);
                    alert("Order submitted successfully.");
                    if (cartWindow) {
                        cartWindow.close();

                        // clear cart, set order to empty

                        $.window.close();
                    }
                    //$.txtSpecialInstructions.value = "";
                    C2.resetOrder(true);

                });
            } else {
                alert("Error submitting order: " + msg);
                hideLoading();
            }
        }, function(e) {

            hideLoading();
            alert("ERROR!");
            console.log(e);
        });
    }

}

function updateTotals() {
    if (C2.cartItems.length == 0) {
        console.log("empty cart");
        alert("Your cart is now empty");
        goBack();
    }

    var subTotal = C2.getCartSubTotal();
    //var serviceCharge = C2.vendor.get("serviceFee");
    var serviceCharge = C2.getServiceCharge(subTotal, C2.cartItems);
    var tip = 0;
    tip = C2.tipAmount;
    //if (C2.orderType == 2) {
    tip = C2.tipAmount;
    $.viewSubtotal.top = "3";
    $.viewTip.height = Titanium.UI.SIZE;
    $.viewTip.visible = true;
    // } else {
    // $.viewSubtotal.top = "10";
    // $.viewTip.height = 0;
    // $.viewTip.visible = false;
    // }

    if (subTotal == 0)
        serviceCharge = 0.00;
    var total = subTotal + serviceCharge + tip;

    $.lblSubTotal.text = "$" + subTotal.toFixed(2);
    $.lblServiceCharge.text = "$" + serviceCharge.toFixed(2);
    $.lblTipCharge.text = "$" + tip.toFixed(2);
    $.lblTotal.text = "$" + total.toFixed(2);

    if (serviceCharge == 0) {
        $.viewServiceCharge.visible = false;
        $.viewServiceCharge.height = 0;
    } else {
        $.viewServiceCharge.visible = true;
        $.viewServiceCharge.height = Titanium.UI.SIZE;
    }

    if (!useCredit) {
        $.viewCreditCharge.visible = false;
        $.viewCreditCharge.height = 0;
    } else {
        $.viewCreditCharge.visible = true;
        $.viewCreditCharge.height = Titanium.UI.SIZE;
        var creditCharge = parseFloat((subTotal * .035).toFixed(2));
        total = total + creditCharge;

        console.log("credit charge", creditCharge, total);

        $.lblCreditCharge.text = "$" + creditCharge.toFixed(2);
        $.lblTotal.text = "$" + total.toFixed(2);
    }
}

function updateOrderType() {
    //if (C2.orderType == 2) {
    $.lblDeliveryVenue.text = C2.venue.get("name");
    $.lblDeliveryVendor.text = C2.vendor.get("name");
    $.lblDeliverySection.text = "Section " + C2.customerSection;
    $.lblDeliveryRow.text = "Row " + C2.customerRow;
    $.lblDeliverySeat.text = "Seat " + C2.customerSeat;
    $.lblOrderType.text = "Delivery:";
    $.deliveryView.visible = true;
    $.deliveryView.height = Titanium.UI.SIZE;
    $.pickupView.visible = false;
    $.pickupView.height = 0;
    $.btnSelectCash.setText("Pay with Cash");
    // } else {
    // $.lblVenueName.text = C2.venue.get("name");
    // $.lblVendorName.text = C2.vendor.get("name");
    // $.lblVendorDesc.text = C2.vendor.get("description");
    // $.lblOrderType.text = "Pick Up:";
    // $.pickupView.visible = true;
    // $.pickupView.height = Titanium.UI.SIZE;
    // $.deliveryView.visible = false;
    // $.deliveryView.height = 0;
    // $.btnSelectCash.setText("Pay Cash at Pickup");
    // }
}

updateOrderType();
//$.txtSpecialInstructions.value = settings.get("specialInstructions");
//$.txtSpecialInstructions.blur();
updateTotals();

var id = C2.venue.get("id");
console.log("Venue ID: ", id);

if (id == 6 || id == 7 || id == 8) {
    $.btnSelectCash.hide();
} else {
    $.btnSelectCash.show();
}

if (Ti.App.Properties.getBool("isRunner")) {
    //$.lbl_special.visible = false;
    //$.lbl_special.height = 0;
    // $.view_special.height = 0;
    // $.view_special.visible = false;
    $.lblOrderType.height = 0;
    $.lblOrderType.visible = false;

    $.pickupView.height = 0;
    $.pickupView.visible = false;

} else {
    $.lbl_email.visible = false;
    $.lbl_email.height = 0;
    $.tf_email.height = 0;
    $.tf_email.visible = false;
}

$.deliveryView.height = 0;
$.deliveryView.visible = false; 