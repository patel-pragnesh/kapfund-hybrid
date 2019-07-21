var args = arguments[0] || false;
var iOS7 = Alloy.Globals.isiOS7Plus();
var C2 = Alloy.Globals.C2;

var callback = args;

$.window.top = iOS7 ? 20 : 0;

function close() {
	$.window.close();
}

function goBack() {
	close();
}

function addedCreditCard(resp) {
	//refreshCards();
	if(callback && isSelection) {
		callback(resp);
		close();	
	} else {
		refreshCards();
	}
	
}

function addCreditCard() {
	var creditCardWin = Alloy.createController("addCreditCardWindow", addedCreditCard, true);
	if(!isSelection) {
		creditCardWin.autoSaveCard();
	}
	creditCardWin.getView().open();	
}


function setActive(src, active) {
	if(active) {
		src.backgroundColor = src.activeBackgroundColor;
	} else {
		src.backgroundColor = src.defaultBackgroundColor;
	}
}

function btnRemove_touchStart(e) {
	setActive(e.source, true);
}

function btnRemove_touchEnd(e) {
	setActive(e.source, false);	
	var item = e.section.getItemAt(e.itemIndex);
	console.log("remove item", item);
	
	var dialog = Ti.UI.createAlertDialog({
	    cancel: 1,
	    buttonNames: ['Confirm', 'Cancel'],
	    message: 'Are you sure you want to remove this credit card payment?',
	    title: 'Confirm'
	  });
	  dialog.addEventListener('click', function(e){
	    if (e.index === e.source.cancel){
	      Ti.API.info('The cancel button was clicked');
	    } else {
	    	// do stuff that removes card, update C2 order, delete token, etc...
	    	showLoading();
	    	C2.deleteStripeCard({
	    		UserGUID: C2.customerGuid.UserGUID,
	    		CardID: item.cardId
	    	}, function(resp, status, msg) {
	    		if(status == 1) {
	    			refreshCards();
	    		} else {
	    			hideLoading();
	    			alert("Error removing card: " + msg);
	    		}
	    	}, function(err) {
	    		hideLoading();
	    		alert("Error removing card, check your network connection and ensure you are connected to the internet");
	    	});
	    }
	  });
	  dialog.show();
	
}

function btnRemove_touchCancel(e) {
	setActive(e.source, false);
}

function selectCreditCard(e) {
	var item = e.section.getItemAt(e.itemIndex);
	console.log("select item", item);
	
	C2.orderCreditCardId = item.cardId;
	C2.saveCard = null;
	
	callback({
		id: null,
		card: item.details
	});
	close();
	
}

function showLoading(txt) {
	if(txt) {
		$.lblSearchTxt.text = txt;
	} else {
		$.lblSearchTxt.text = "Loading...";
	}
	$.loadingView.visible = true;
}
function hideLoading() {
	$.loadingView.visible = false;
}

//var userGuid = '90D10ECB-46F1-415A-9d89-B052DFE3F16D';

var isSelection = false;

if(callback) {
	console.log("payment methods window is selection", callback);
	isSelection = true;
}

if(isSelection) {
	$.lblTitle.text = "- Select Credit Card";
	$.btnSelectCreditCard.show();
} else {
	$.lblTitle.text = "- Saved Credit Cards";
	//$.btnSelectCreditCard.hide();
	$.btnSelectCreditCard.setText("Add New Card");
}

$.lstCreditCards.allowsSelection = isSelection;


function refreshCards() {
	showLoading();
	C2.getStripeCards(
		{
			UserGUID: C2.customerGuid.UserGUID
		},
		function(resp, status, msg) {
			hideLoading();
			
			if(status == 1) {
				console.log("got stripe cards", resp);
				
				var data = [];
				for(var i = 0; i < resp.length; i++) {
					var item = resp[i];
					var d = {
						Remove: {
							visible: !isSelection
						},
						Brand: {
							text: item.brand
						},
						LastFour: {
							text: item.last4
						},
						cardId: item.id,
						customerId: item.customer,
						details: item
						
					};
					
					data.push(d);
				}
				
				$.ccList.setItems(data);
					
			} else {
				hideLoading();
				alert("error getting saved cards: " + msg);
			}
		}, function(err) {
			hideLoading();
			console.log("ERROR", err);
		}
	);
}

refreshCards();
