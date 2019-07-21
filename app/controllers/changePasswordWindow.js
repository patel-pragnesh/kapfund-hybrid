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
	var passwordOld = $.txtPasswordOld.value || "";
	var password = $.txtPassword.value || "";
	var password2 = $.txtVerifyPassword.value || "";
	
	var valid = true;
	
	// if not valid e-mail, return false
	
	// if password not at least 5 characters or doesn't match verify, return false
	var validPass = checkPassword(password, password2);
	var validOld = checkPassword(passwordOld, passwordOld);
	
	valid = validPass && validOld;
	
	return {
		valid: valid,
		oldPassword: passwordOld,
		password: password,
	};
}

function changePassword() {
	var data = validateForm();
	if(data.valid) {
		console.log("changing password", data.password);
		showLoading();
		C2.changePassword(data.oldPassword, data.password, function(resp, status, msg) {
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


