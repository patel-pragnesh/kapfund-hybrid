// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var C2 = Alloy.Globals.C2;
var cardio = require('com.likelysoft.cardio');
var picker = require('picker');

var sportsData = ["G Basketball", "G Soccer", "G Golf", "G Volleyball", "G Bowling", "G Lacrosse", "G Swimming", "Softball", "Football", "B Basketball", "B Soccer", "B Golf", "B Volleyball", "B Bowling", "B Tennis", "B Lacrosse", "B Swimming", "Baseball", "Wrestling", "Track & Field", "Band", "Cheer", "Dance"];

function getiOSPickerToolBar(_pickerData, _tfObject, _callback) {

    var picker_view = Titanium.UI.createView({
        height : 251,
        bottom : -251,
        width : Ti.UI.FILL
    });

    var picker = Titanium.UI.createPicker({
        top : 43
    });
    picker.selectionIndicator = true;

    var cancel = Titanium.UI.createButton({
        title : 'Cancel',
        style : Ti.UI.iOS.SystemButtonStyle.BORDERED,
        tf_picker : _tfObject,
    });
    var done = Titanium.UI.createButton({
        title : 'Done',
        style : Ti.UI.iOS.SystemButtonStyle.DONE,
        tf_picker : _tfObject,
        pickerObj : picker
    });
    var spacer = Titanium.UI.createButton({
        systemButton : Ti.UI.iOS.SystemButton.FLEXIBLE_SPACE
    });
    var toolbar = Titanium.UI.createToolbar({
        top : 0,
        width : 320,
        items : [cancel, spacer, done]
    });

    var picker_data = [];

    for (var i = 0,
        j = _pickerData.length; i < j; i++) {
        picker_data.push(Titanium.UI.createPickerRow({
            title : _pickerData[i],
        }));
    }

    var slide_out = Titanium.UI.createAnimation({
        bottom : -251
    });

    cancel.addEventListener('click', function(e) {
        picker_view.animate(slide_out);
    });

    done.addEventListener('click', function(e) {
        e.source.tf_picker.value = e.source.pickerObj.getSelectedRow(0).title;
        _callback(e.source.pickerObj.getSelectedRow(0).title);
        picker_view.animate(slide_out);
    });

    if (picker_data.length > 1) {
        picker.add(picker_data);
    } else {
        picker_data.push(Titanium.UI.createPickerRow({
            title : '',
        }));
        picker.add(picker_data);
    }

    picker_view.add(toolbar);
    picker_view.add(picker);

    return picker_view;
};

function showNavMenu(e) {
    $.navMenu.visible = true;
}

var selectedAmmount = 0.00;
function selectAmount(e) {

    if (e.source.text == "$5") {
        if ($.lbl_five.backgroundColor == "#898a8e") {
            $.lbl_five.backgroundColor = "#FFF";
            $.lbl_five.color = "#898a8e";
        } else {
            $.lbl_five.backgroundColor = "#898a8e";
            $.lbl_five.color = "#fff";
        }

        $.lbl_ten.backgroundColor = "#FFF";
        $.lbl_ten.color = "#898a8e";

        $.lbl_twentyFive.backgroundColor = "#FFF";
        $.lbl_twentyFive.color = "#898a8e";

        $.lbl_fifty.backgroundColor = "#FFF";
        $.lbl_fifty.color = "#898a8e";

        $.lbl_hundred.backgroundColor = "#FFF";
        $.lbl_hundred.color = "#898a8e";
        selectedAmmount = 5.00;
    } else if (e.source.text == "$10") {
        if ($.lbl_ten.backgroundColor == "#898a8e") {
            $.lbl_ten.backgroundColor = "#FFF";
            $.lbl_ten.color = "#898a8e";
        } else {
            $.lbl_ten.backgroundColor = "#898a8e";
            $.lbl_ten.color = "#fff";
        }

        $.lbl_five.backgroundColor = "#FFF";
        $.lbl_five.color = "#898a8e";

        $.lbl_twentyFive.backgroundColor = "#FFF";
        $.lbl_twentyFive.color = "#898a8e";

        $.lbl_fifty.backgroundColor = "#FFF";
        $.lbl_fifty.color = "#898a8e";

        $.lbl_hundred.backgroundColor = "#FFF";
        $.lbl_hundred.color = "#898a8e";
        selectedAmmount = 10.00;
    } else if (e.source.text == "$25") {
        if ($.lbl_twentyFive.backgroundColor == "#898a8e") {
            $.lbl_twentyFive.backgroundColor = "#FFF";
            $.lbl_twentyFive.color = "#898a8e";
        } else {
            $.lbl_twentyFive.backgroundColor = "#898a8e";
            $.lbl_twentyFive.color = "#fff";
        }

        $.lbl_five.backgroundColor = "#FFF";
        $.lbl_five.color = "#898a8e";

        $.lbl_ten.backgroundColor = "#FFF";
        $.lbl_ten.color = "#898a8e";

        $.lbl_fifty.backgroundColor = "#FFF";
        $.lbl_fifty.color = "#898a8e";

        $.lbl_hundred.backgroundColor = "#FFF";
        $.lbl_hundred.color = "#898a8e";
        selectedAmmount = 25.00;
    } else if (e.source.text == "$50") {

        if ($.lbl_fifty.backgroundColor == "#898a8e") {
            $.lbl_fifty.backgroundColor = "#FFF";
            $.lbl_fifty.color = "#898a8e";
        } else {
            $.lbl_fifty.backgroundColor = "#898a8e";
            $.lbl_fifty.color = "#fff";
        }

        $.lbl_five.backgroundColor = "#FFF";
        $.lbl_five.color = "#898a8e";

        $.lbl_ten.backgroundColor = "#FFF";
        $.lbl_ten.color = "#898a8e";

        $.lbl_twentyFive.backgroundColor = "#FFF";
        $.lbl_twentyFive.color = "#898a8e";

        $.lbl_hundred.backgroundColor = "#FFF";
        $.lbl_hundred.color = "#898a8e";
        selectedAmmount = 50.00;
    } else if (e.source.text == "OTHER") {

        if ($.lbl_hundred.backgroundColor == "#898a8e") {
            $.lbl_hundred.backgroundColor = "#FFF";
            $.lbl_hundred.color = "#898a8e";
        } else {
            $.lbl_hundred.backgroundColor = "#898a8e";
            $.lbl_hundred.color = "#fff";
        }

        $.lbl_five.backgroundColor = "#FFF";
        $.lbl_five.color = "#898a8e";

        $.lbl_ten.backgroundColor = "#FFF";
        $.lbl_ten.color = "#898a8e";

        $.lbl_twentyFive.backgroundColor = "#FFF";
        $.lbl_twentyFive.color = "#898a8e";

        $.lbl_fifty.backgroundColor = "#FFF";
        $.lbl_fifty.color = "#898a8e";

        var dialog = Ti.UI.createAlertDialog({
            title : 'Enter Amount',
            style : Ti.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT,
            buttonNames : ['OK']
        });
        dialog.addEventListener('click', function(e) {
            Ti.API.info('e.text: ' + e.text);
            selectedAmmount = parseFloat(e.text);
        });
        dialog.show();

    }
};

function hideNavMenu() {
    $.navMenu.visible = false;
}

function backClicked() {
    $.window.close();
}

function navHome_click(e) {
    hideNavMenu();
    $.window.close();
}

// *************
// button events
function addCard() {
    var number = $.txtNumber.value;
    var month = $.txtMonth.value;
    var year = $.txtYear.value;
    var securityCode = $.txtSecurityCode.value;
    var zip = $.txtZip.value;
    var name = $.txtName.value;

    // set order settings to save card info
    C2.saveCard = saveCard;
    C2.orderCreditCardId = null;

    // call stripe to get customer token
    // data should have number, expMonth, expYear, cvc, and zip
    var cardData = {
        number : number,
        expMonth : month,
        expYear : year,
        cvc : securityCode,
        zip : zip,
        name : name
    };

    showLoading();
    C2.createStripeCardToken(cardData, function(resp) {
        if (autoSave) {
            // save card
            // StripeToken: me.creditCardInfo.id,
            // StripeCardID: me.orderCreditCardId,

            var data = {
                UserGUID : C2.customerGuid.UserGUID,
                StripeToken : resp.id,
                StripeCardID : resp.card.id
            };

            C2.saveStripeCard(data, function(saveResp, saveStatus, saveMsg) {
                hideLoading();
                if (saveStatus == 1) {
                    if (callbackFunc) {
                        callbackFunc(resp);
                    }
                    $.window.close();
                } else {
                    alert("Error saving card: " + saveMsg);
                }
            }, function(msg) {
                hideLoading();
                alert("Error saving credit card: " + msg);
            });
        } else {
            hideLoading();
            if (callbackFunc) {
                callbackFunc(resp);
            }
            $.window.close();
        }
    }, function(msg) {
        hideLoading();
        alert("Error: " + msg);
    });
}

function takePicture() {
    cardio.scanCard(function(data) {
        Ti.API.info('---data----- ' + JSON.stringify(data));
        if (data.success == 'true') {
            //Ti.API.info("Card number: " + data.cardNumber);
            Ti.API.info("Redacted card number: " + data.redactedCardNumber);
            Ti.API.info("Expiration month: " + data.expiryMonth);
            Ti.API.info("Expiration year: " + data.expiryYear);
            Ti.API.info("CVV code: " + data.cvv);

            $.txtNumber.value = data.cardNumber;
            $.txtMonth.value = data.expiryMonth;
            $.txtYear.value = data.expiryYear;
            $.txtSecurityCode.value = data.cvv;
        } else {
            // User canceled or there was an error
        }
    });
}

function navVendorMenu_click(e) {
    hideNavMenu();
    C2.goToVendorMenu(backHandler);
}

function navChangeVendor_click(e) {
    hideNavMenu();
    C2.openVenueSelectionWindow();
}

function navOrders_click(e) {
    hideNavMenu();
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

function goToSettings(backButtonHandler) {
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

var sportsPickerView = getiOSPickerToolBar(sportsData, $.tf_sports, function cb(_value) {
    Ti.API.info('------sports selected value------ ' + _value);
});
var slide_in = Titanium.UI.createAnimation({
    bottom : 0
});
function launchPicker() {
    sportsPickerView.animate(slide_in);
};
$.window.add(sportsPickerView);

function selectMonthlyGift() {
    if ($.img_check.image == "/images/select.png") {
        $.img_check.image = "/images/selected.png";
    } else {
        $.img_check.image = "/images/select.png";
    };
}

function addPaymentPaypal() {
    var PayPal = require('ti.paypal');

    PayPal.initialize({
        clientIdSandbox : "AdaQTKNTkuR85C7kDnMiSChaYdLWsxW5b4LvUEUpVSHpDMekAT1esHO5zIPalWRIiNzBx4ikCK9p_koT",
        clientIdProduction : "AS53ztK6vpsOAS-DfZIx9tN3Y9-rNYClbzdb8AzZO1LDOXgCVgBZavH8F33SMOTO_nFpweYcBZxJfhVI",
        environment : PayPal.ENVIRONMENT_SANDBOX // or: ENVIRONMENT_PRODUCTION
    });

    var item1 = PayPal.createPaymentItem({
        name : "My item",
        price : selectedAmmount,
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
        amount : selectedAmmount,
        shortDescription : "Your Donation at KAP",
        intent : PayPal.PAYMENT_INTENT_SALE,
        // Optional
        items : [item1]
    });

    payment.addEventListener("paymentDidCancel", function(e) {
        Ti.API.info("paymentDidCancel");
    });

    payment.addEventListener("paymentWillComplete", function(e) {
        Ti.API.info("paymentWillComplete");
        Ti.API.info(e.payment);
    });

    payment.addEventListener("paymentDidComplete", function(e) {
        Ti.API.info("paymentDidComplete");
        Ti.API.info(e.payment.response.id);
        submitCashOrder(e.payment.response.id);
    });

    payment.show();
}

function submitCashOrder(_paypalID) {
    showLoading();
    C2.DonateWithPaypal({
        VendorId : Alloy.Globals.lastVendorID,
        UserGUID : C2.customerGuid.UserGUID,
        Sport : $.tf_sports.value,
        Amount : parseInt(selectedAmmount),
        MonthlyGift : false,
        FirstName : $.txt_firstName.value,
        LastName : $.txt_lastName.value,
        Email : $.txt_email.value,
        PaypalTransactionID : _paypalID,
        Phone : $.txt_phone.value
    }, function(payload, status, msg) {
        Ti.API.info('---status---- ' + status);
        Ti.API.info('--payload---- ' + JSON.stringify(payload));
        hideLoading();
        if (status == 1) {
            alert("Your donation is successfull, You will receive a receipt by email.");
        } else {
            alert("Error submitting order: " + msg);
        }
    }, function(e) {
        //hideLoading();
        alert("ERROR!");
        console.log(e);
    });
}

function startDonation(data) {
    C2.DonateWithStripe({
        VendorId : Alloy.Globals.lastVendorID,
        UserGUID : C2.customerGuid.UserGUID,
        Sport : $.tf_sports.value,
        Amount : parseInt(selectedAmmount),
        MonthlyGift : false,
        FirstName : $.txt_firstName.value,
        LastName : $.txt_lastName.value,
        Email : $.txt_email.value,
        //PaypalTransactionID : _paypalID,
        Phone : $.txt_phone.value,
        StripeToken : data.StripeToken,
        StripeCardID : data.StripeCardID,
    }, function(payload, status, msg) {
        Ti.API.info('---status---- ' + status);
        Ti.API.info('--payload---- ' + JSON.stringify(payload));
        if (status == 1) {
            alert("Your donation is successfull, You will receive a receipt by email.");
        } else {
            alert("Error submitting order: " + msg);
        }
    }, function(e) {
        //hideLoading();
        alert("ERROR!");
        console.log(e);
    });
}

function addCreditCard() {

}

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

function addCard() {
    showLoading();
    var number = $.txtNumber.value;
    var month = $.txtMonth.value;
    var year = $.txtYear.value;
    var securityCode = $.txtSecurityCode.value;
    var zip = $.txtZip.value;
    var name = $.txtName.value;

    // set order settings to save card info
    C2.saveCard = false;
    C2.orderCreditCardId = null;

    // call stripe to get customer token
    // data should have number, expMonth, expYear, cvc, and zip
    var cardData = {
        number : number,
        expMonth : month,
        expYear : year,
        cvc : securityCode,
        zip : zip,
        name : name
    };

    showLoading();
    C2.createStripeCardToken(cardData, function(resp) {
        var data = {
            UserGUID : C2.customerGuid.UserGUID,
            StripeToken : resp.id,
            StripeCardID : resp.card.id
        };
        hideLoading();
        startDonation(data);

    }, function(msg) {
        hideLoading();
        alert("Error: " + msg);
    });
}