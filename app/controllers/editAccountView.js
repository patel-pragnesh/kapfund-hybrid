var Mask = require('mask');
var iOS7 = Alloy.Globals.isiOS7Plus();
$.window.top = iOS7 ? 20 : 0;

var C2 = Alloy.Globals.C2;

console.log("creating account");

var args = arguments[0] || {};

$.window.addEventListener("open", function() {
	
	if(Alloy.Globals.isIOS) {
		//$.keyboardContainer.example();
	}

	//clearForm();
	$.btnBack.enable();
});

function close() {
	$.btnBack.disable();
	$.window.close();
	
}

function test() {
	alert("HELLO");
}

function showLoading() {
	$.loadingView.visible = true;
}
function hideLoading() {
	$.loadingView.visible = false;
}

function clearForm() {
	$.txtEmail.value = "";
	$.txtFirstName.value = "";
	$.txtLastName.value = "";
	$.txtPhoneNumber.value = "";
	$.lblEmailMsg.text = "";
}

function checkEmail(email) {
	var valid = true;
	if(email.length < 3) {
		$.lblEmailMsg.text = " *valid e-mail required";
		valid = false;
	}
	else {
		$.lblEmailMsg.text = "";
	}
	return valid;
}

function validateForm() {
	// validate the form to make sure e-mail is valid / passwords match, phone number, etc...
	var email = $.txtEmail.value || "";
	var firstName = $.txtFirstName.value;
	var lastName = $.txtLastName.value;
	var phoneNumber = $.txtPhoneNumber.value;
	
	var valid = true;
	
	// if not valid e-mail, return false
	
	// if password not at least 5 characters or doesn't match verify, return false
	
	var validEmail = checkEmail(email);
	
	valid = validEmail;
	
	return {
		valid: valid,
		email: email,
		firstName: firstName,
		lastName: lastName,
		phoneNumber: phoneNumber
	};
}

function editAccount() {
	var data = validateForm();
	if(data.valid) {
		console.log("creating new account", data.email, data.password);
		showLoading();
		C2.updateCustomer({
			UserGUID: C2.customerGuid.UserGUID,
			Password: Alloy.Globals.lastUserPasssword,
			FirstName: data.firstName,
			LastName: data.lastName,
			Email: data.email,
			Phone: data.phoneNumber,
			AllowSMSNotifications: ci.AllowSMSNotifications,
			AllowEmailNotifications: true
		}, function(resp, status, msg) {
			hideLoading();
			if(status == 1) {
				// we edit the account successfully, so lets login
				// and save our credentials
				alert("account information has been updated");
				close();
			} else {
				alert("Error editing account: " + msg );
			}
			
		}, function(err) {
			hideLoading();
			alert("ERROR!");
		});
	} else {
		console.log("validation errors", data);
		$.winScrollView.scrollTo(0,0);
	}
}

//var textfield = $.txtPhoneNumber;

console.log("...");
var last;
var madeChange = false;
$.txtPhoneNumber.addEventListener("change", function(e) {
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


/*
[INFO] :   customer info {
[INFO] :       AllowEmailNotifications = 1;
[INFO] :       AllowSMSNotifications = 1;
[INFO] :       Email = "dan.sokol@avatar-soft.com";
[INFO] :       FirstName = Dan;
[INFO] :       LastName = Sokol;
[INFO] :       Phone = "(518) 894-8900";
[INFO] :       StripeCustomerID = "cus_7rM2KyITPB4uHG";
[INFO] :       UserGUID = "90d10ecb-46f1-415a-9d89-b052dfe3f16d";
[INFO] :   }
*/

var ci = Alloy.Globals.customerInfo;

$.txtEmail.value = ci.Email;
$.txtPhoneNumber.value = ci.Phone;
$.txtFirstName.value = ci.FirstName;
$.txtLastName.value = ci.LastName;


//$.txtEmail.value = "abc";
//$.txtPassword.value = "abc12";
//$.txtVerifyPassword.value = "abc12";

$.txtEmail.addEventListener("blur", function() {
	checkEmail($.txtEmail.value);
});


$.txtEmail.addEventListener('return', function() {
	$.txtPassword.focus();
});

$.txtFirstName.addEventListener("return", function() {
	$.txtLastName.focus();
});

$.txtLastName.addEventListener("return", function() {
	$.txtPhoneNumber.focus();
});

$.txtPhoneNumber.addEventListener("return", function() {
	$.txtPhoneNumber.blur();
});
