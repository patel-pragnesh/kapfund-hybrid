var Mask = require('mask');
var iOS7 = Alloy.Globals.isiOS7Plus();
$.window.top = iOS7 ? 20 : 0;

var C2 = Alloy.Globals.C2;

console.log("change password window");

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
	$.txtPasswordOld.value = "";
	$.txtPassword.value = "";
	$.txtVerifyPassword.value = "";
	$.lblPasswordMsg.text = "";
	$.lblPasswordOldMsg.text = "";
}

function getChangePasswordToken() {
	var email = $.txtEmail.value;
	alert("EMAIL: " + email);
	if(checkEmail(email)) {
		C2.sendForgotPasswordEmailToCustomer({
			Email: email
		}, function() {
			alert("A password token has been e-mailed to " + $.txtEmail.value);
		}, function() {
			alert("Error getting password token, check your network connection and ensure you are connected to the internet");
		});
	}
}

function checkEmail(email) {
	var valid = true;
	if(email.length < 3) {
		alert("valid e-mail required");
		valid = false;
	}
	else {
		$.lblEmailMsg.text = "";
	}
	return valid;
}

function checkToken(token) {
	var valid = true;
	if(token.length < 12) {
		alert("valid token required");
		valid = false;
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
	var token = $.txtToken.value || "";
	var password = $.txtPassword.value || "";
	var password2 = $.txtVerifyPassword.value || "";
	
	var valid = true;
	
	// if not valid e-mail, return false
	
	// if password not at least 5 characters or doesn't match verify, return false
	
	valid = checkEmail(email) && checkToken(token) && checkPassword(password, password2);
	
	return {
		valid: valid,
		email: email,
		token: token,
		password: password,
	};
}

function changePassword() {
	var data = validateForm();
	if(data.valid) {
		console.log("changing password", data.password);
		showLoading();
		C2.changePasswordForCustomerWithChangePasswordGUID({
			Email: data.email,
			ChangePasswordGUID: data.token,
			Password: data.password 
		},
			function(resp, status, msg) {
			hideLoading();
			if(status == 1) {
				// we changed password successfully
				alert("Your password was successfully changed");
				Alloy.Globals.lastUserPasssword = data.password;
				Ti.App.Properties.setString("lastUserPassword", data.password);
				close();
			} else {
				alert("Error changing password: " + msg );
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


//$.txtEmail.value = "abc";
//$.txtPassword.value = "abc12";
//$.txtVerifyPassword.value = "abc12";

$.txtPassword.addEventListener("blur", function() {
	//checkPassword($.txtPassword.value, $.txtVerifyPassword.value);
});

$.txtVerifyPassword.addEventListener("change", function() {
	checkPassword($.txtPassword.value, $.txtVerifyPassword.value);
});

$.txtPassword.addEventListener("return", function() {
	$.txtVerifyPassword.focus();
});


