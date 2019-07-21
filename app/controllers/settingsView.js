var args = arguments[0] || {};
var C2 = Alloy.Globals.C2;

if (Alloy.Globals.isAndroid) {
	$.switchRem.backgroundColor = "#444";
	$.switchText.backgroundColor = "#444";
}

function settingClick(e) {
	if(Alloy.Globals.isIOS) {
		$.lstSettings.deselectItem(0, e.itemIndex);	
	}
	
	switch(e.itemIndex) {
		case 0:
			alert("Account");
			break;
		case 1:
			alert("Change Password");
			break;
		case 2: 
			alert("Payment Methods");
			break;
		default:
			break;
	}
	
}

function changeRem() {
	Alloy.Globals.rememberMe = $.switchRem.value;
	console.log("changing remember me to ", Alloy.Globals.rememberMe);
	Ti.App.Properties.setBool("rememberMe", Alloy.Globals.rememberMe);
}

function changeText() {
	C2.mainWindow.showLoading("Updating setting...");
	var ci = Alloy.Globals.customerInfo;
	C2.updateCustomer({
		UserGUID: C2.customerGuid.UserGUID,
		Password: Alloy.Globals.lastUserPasssword,
		FirstName: ci.FirstName,
		LastName: ci.LastName,
		Email: ci.Email,
		Phone: ci.Phone,
		AllowSMSNotifications: $.switchText.value,
		AllowEmailNotifications: true
	}, function(resp) {
		C2.mainWindow.hideLoading();
		
	}, function(err) {
		C2.mainWindow.hideLoading();
		alert("Error updating settings, check your network connection and ensure you are connected to the internet");
	});
	
}

function openAccount() {
	C2.mainWindow.showLoading();;
	C2.getCustomerInfo({
		UserGUID: C2.customerGuid.UserGUID
	}, function(resp) {
		C2.mainWindow.hideLoading();
		console.log("customer info", resp);
		Alloy.Globals.customerInfo = resp;
		
		var win = Alloy.createController('editAccountView').getView();
		win.open();
		
	}, function(err) {
		C2.mainWindow.hideLoading();
		alert("Error getting settings for current user, check your network connection and ensure you are connected to the internet");
	});
}

function openChangePassword() {
	var win = Alloy.createController('changePasswordWindow').getView();
	win.open();
}

$.switchRem.value = Alloy.Globals.rememberMe;

function openPaymentMethods() {
	var win = Alloy.createController('paymentMethodsWindow', false).getView();
	win.open();
}

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

$.switchText.value = Alloy.Globals.customerInfo.AllowSMSNotifications;



