// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = arguments[0] || {};
var iOS7 = Alloy.Globals.isiOS7Plus();
var C2 = Alloy.Globals.C2;

$.window.top = iOS7 ? 20 : 0;


function showLoading(msg) {
	$.loadingView.visible = true;
	$.activityIndicator.message = msg || "Loading...";
	$.activityIndicator.show();
}

function hideLoading() {
	$.loadingView.visible = false;
	$.activityIndicator.hide();
}

function goBack() {
	$.window.close();
}

function send() {
	
	var subject = $.txtSubject.value.trim();
	var message = $.txtMessage.value.trim();
	
	if(!subject || !message) {
		alert("Please enter a subject and message");
		return;
	}
	
	showLoading("Sending Message...");
	C2.sendCustomerSupportMessage({
		UserGUID: C2.customerGuid.UserGUID,
		Title: subject,
		Message: message
	}, function(payload, status, msg) {
		hideLoading();
		if(status == 1) {
			alert("We will respond within 24 hours. Thank you for your support.");
			goBack();
		} else {
			alert(msg);
		}
	}, function(err) {
		hideLoading();
		alert("Error sending message, our server may be down, please try again later.");
	});
}
