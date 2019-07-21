var args = arguments[0] || {};
var iOS7 = Alloy.Globals.isiOS7Plus();
$.window.top = iOS7 ? 20 : 0;

var cardio = require('com.likelysoft.cardio');
//var cardio = require('com.bpconc.card.io');

var C2 = Alloy.Globals.C2;
var Mask = require('mask');

var settings = C2.settings;
settings.fetch();

var saveCard = false;
var callbackFunc = args;

$.window.addEventListener("close", function() {
	$.destroy();
});

$.window.addEventListener("open", function() {
	if(Alloy.Globals.isIOS) {
		//$.keyboardContainer.example();
	}

	//populateTestData();
});

// *************
// loading functions
function showLoading() {
	$.loadingView.visible = true;
}
function hideLoading() {
	$.loadingView.visible = false;
}

// *************
// private functions
function populateTestData() {
	$.txtNumber.value = "4242 4242 4242 4242";
	$.txtMonth.value = "05";
	$.txtYear.value = "2018";
	$.txtSecurityCode.value = "123";
	$.txtZip.value = "12345";
	$.txtName.value = "Test User";
}

function takePicture() {
	cardio.scanCard(function(data){
		if(data.success == 'true') {
			//Ti.API.info("Card number: " + data.cardNumber);
			Ti.API.info("Redacted card number: " + data.redactedCardNumber);
			Ti.API.info("Expiration month: " + data.expiryMonth);
			Ti.API.info("Expiration year: " + data.expiryYear);
			Ti.API.info("CVV code: " + data.cvv);

		    $.txtNumber.value = data.cardNumber;
		    $.txtMonth.value = data.expiryMonth;
		    $.txtYear.value = data.expiryYear;
		    $.txtSecurityCode.value = data.cvv;
		}
		else {
		    // User canceled or there was an error
		}
	});
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
		number: number,
		expMonth: month,
		expYear: year,
		cvc: securityCode,
		zip: zip,
		name: name
	};

	showLoading();
	C2.createStripeCardToken(cardData, function(resp) {
		if(autoSave) {
			// save card
			// StripeToken: me.creditCardInfo.id,
			// StripeCardID: me.orderCreditCardId,

			var data = {
				UserGUID: C2.customerGuid.UserGUID,
				StripeToken: resp.id,
				StripeCardID: resp.card.id
			};

			C2.saveStripeCard(data, function(saveResp, saveStatus, saveMsg) {
				hideLoading();
				if(saveStatus == 1) {
					if(callbackFunc) {
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
			if(callbackFunc) {
				callbackFunc(resp);
			}
			$.window.close();
		}
	}, function(msg) {
		hideLoading();
		alert("Error: " + msg);
	});
}

function goBack() {

	$.window.close();
}

function toggleSaveCard() {
	saveCard = !saveCard;
	$.chkSaveCard.visible = saveCard;
	autoSave = true;
}

/*
var last;
var madeChange = false;
$.txtNumber.addEventListener("change", function(e) {
	if(madeChange) {
		madeChange = false;
		return;
	}
	if(last != $.txtPhoneNumber.value) {
		madeChange = true;
		console.log("txtPhoneNumber change", last, $.txtPhoneNumber.value);
		Mask.mask($.txtPhoneNumber, Mask.phone);
		last = $.txtPhoneNumber.value;
		$.txtPhoneNumber.setSelection(last.length, last.length);
	}
});
*/

C2.maskTextField($.txtNumber, Mask.creditcard);

$.txtMonth.addEventListener("change", function(e) {
	if($.txtMonth.value.length > 1) {
		$.txtYear.focus();
	}
});

$.txtYear.addEventListener("focus", function(e) {
	if($.txtYear.value.length == 0) {
		$.txtYear.value = "20";
		$.txtYear.setSelection(2,2);
	}
});

var autoSave = false;
exports.autoSaveCard = function() {
	autoSave = true;
	$.viewSaveCard.visible = false;
};
