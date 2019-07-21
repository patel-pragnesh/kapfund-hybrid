var args = arguments[0] || {};

var C2 = Alloy.Globals.C2;


function openHtmlView(title, htmlFileName) {
	C2.mainWindow.goToHtmlView(C2.mainWindow.goToAbout, title, htmlFileName);
}

function openFAQ() {
	openHtmlView('FAQ', 'FAQ');
}

function openServiceTerms() {
	openHtmlView('Service Terms', 'ServiceTerms');
}

function openContactUs() {
	C2.openContactUsWindow();
}
function openRateUS(){
     Ti.Platform.openURL('https://itunes.apple.com/in/app/ballpark-concierge/id1087240452?mt=8--');
}
