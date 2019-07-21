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
	$.txtPassword.value = "";
	$.txtVerifyPassword.value = "";
	$.txtFirstName.value = "";
	$.txtLastName.value = "";
	$.txtPhoneNumber.value = "";
	$.lblEmailMsg.text = "";
	$.lblPasswordMsg.text = "";
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

function checkPassword(password, password2) {
	var valid = true;
	if(password.length < 5) {
		$.lblPasswordMsg.text = " *at least 5 characters";
		valid = false;
	} else if(password != password2) {
		$.lblPasswordMsg.text = " *passwords don't match";
		valid = false;
	} else {
		$.lblPasswordMsg.text = "";
	}
	return valid;
}


function validateForm() {
	// validate the form to make sure e-mail is valid / passwords match, phone number, etc...
	var email = $.txtEmail.value || "";
	var password = $.txtPassword.value || "";
	var password2 = $.txtVerifyPassword.value || "";
	var firstName = $.txtFirstName.value;
	var lastName = $.txtLastName.value;
	var phoneNumber = $.txtPhoneNumber.value;
	
	var valid = true;
	
	// if not valid e-mail, return false
	
	// if password not at least 5 characters or doesn't match verify, return false
	
	var validEmail = checkEmail(email);
	var validPass = checkPassword(password, password2);
	
	valid = validEmail && validPass;
	
	return {
		valid: valid,
		email: email,
		password: password,
		firstName: firstName,
		lastName: lastName,
		phoneNumber: phoneNumber
	};
}

function createNewAccount() {
	var data = validateForm();
	if(data.valid) {
		console.log("creating new account", data.email, data.password);
		showLoading();
		C2.createCustomer({
			FirstName: data.firstName,
			LastName: data.lastName,
			Email: data.email,
			Phone: data.phoneNumber,
			Password: data.password,
			AllowSMSNotifications: true,
			AllowEmailNotifications: true
		}, function(resp, status, msg) {
			hideLoading();
			if(status == 1) {
				//alert("Your account was created successfully!  We will now login with your new account.");
				// we created the account successfully, so lets login
				// and save our credentials
				close();
				
				if(args) {
					args(data.email, data.password);
				}
				
			} else {
				alert("Error creating new account: " + msg );
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



//$.txtEmail.value = "abc";
//$.txtPassword.value = "abc12";
//$.txtVerifyPassword.value = "abc12";

$.txtEmail.addEventListener("blur", function() {
	checkEmail($.txtEmail.value);
});

$.txtPassword.addEventListener("blur", function() {
	checkPassword($.txtPassword.value, $.txtVerifyPassword.value);
});

$.txtVerifyPassword.addEventListener("blur", function() {
	checkPassword($.txtPassword.value, $.txtVerifyPassword.value);
});

$.txtEmail.addEventListener('return', function() {
	$.txtPassword.focus();
});

$.txtPassword.addEventListener("return", function() {
	$.txtVerifyPassword.focus();
});

$.txtVerifyPassword.addEventListener("return", function() {
	$.txtFirstName.focus();
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


exports.clearForm = clearForm;
