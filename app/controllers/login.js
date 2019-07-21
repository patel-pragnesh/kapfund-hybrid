var iOS7 = Alloy.Globals.isiOS7Plus();
//$.window.top = iOS7 ? 20 : 0;

var args = arguments[0] || {};
var C2 = Alloy.Globals.C2;

var cancelRotation = false;
//var imgIndex = 4;
var imgIndex = 3;
var goDown = false;
//var imgs = [$.img1, $.img2, $.img3, $.img4, $.img5];
var imgs = [$.img1, $.img2, $.img3, $.img4];
var imgTimeout = null;
var showPassword = false;

$.cb_runner.value = (Ti.App.Properties.getBool("isRunner")) ? Ti.App.Properties.getBool("isRunner") : false;

var animateIntoFocus = Ti.UI.createAnimation({
    opacity : 1.0,
    curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
    duration : 750
});

var animateOutOfFocus = Ti.UI.createAnimation({
    opacity : 0.0,
    curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
    duration : 750
});

var showingUserSignIn = false;

$.window.addEventListener("close", function() {
    cancelRotation = true;
    clearTimeout(imgTimeout);
    console.log("closing login...");
    $.destroy();
});

$.window.addEventListener("blur", function() {
    console.log("login blur");
    cancelRotation = true;
    clearTimeout(imgTimeout);
});

$.window.addEventListener("focus", function() {
    cancelRotation = false;
    doRotation();

});

$.window.addEventListener("android:back", function() {
    if (showingUserSignIn) {
        toggleUserSignIn();
    } else {
        var dialog = Ti.UI.createAlertDialog({
            cancel : 1,
            buttonNames : ['Yes', 'No'],
            message : 'Are you sure you want to exit?',
            title : 'Confirm exit app'
        });
        dialog.addEventListener('click', function(e) {
            if (e.index === e.source.cancel) {
                Ti.API.info('The cancel button was clicked');
            } else {
                $.window.close();
            }
        });
        dialog.show();
    }
});

function showLoading() {
    $.loadingView.visible = true;
}

function hideLoading() {
    $.loadingView.visible = false;
}

function showForgotPasswordView() {
    var win = Alloy.createController("forgotPasswordWindow").getView();
    win.open();
};

function signIn_click() {
    signIn();
};

Ti.Gesture.addEventListener('orientationchange', function(e) {
    // get current device orientation from
    // Titanium.Gesture.orientation
    // get orientation from event object
    // from e.orientation
    // Ti.Gesture.orientation should match e.orientation
    // but iOS and Android will report different values
    // two helper methods return a Boolean
    // e.source.isPortrait()
    // e.source.isLandscape()

    if (e.source.isLandscape()) {
        console.log("orientation change to landscape");

    }
});

function toggleUserSignIn() {
    $.txtEmail.blur();
    $.txtPassword.blur();

    console.log("toggle sigin in");
    if (!showingUserSignIn) {
        C2.swapViews($.buttonView, $.loginView, function() {
            showingUserSignIn = !showingUserSignIn;
        });
    } else {
        C2.swapViewsBack($.loginView, $.buttonView, function() {
            showingUserSignIn = !showingUserSignIn;
        });
    }

};

function toggleShowPassword() {
    showPassword = !showPassword;
    if (showPassword) {
        $.lblPeek.backgroundColor = "#ccc";
        $.lblPeek.color = "#333";
        $.txtPassword.passwordMask = false;
    } else {
        $.lblPeek.backgroundColor = "transparent";
        $.txtPassword.passwordMask = true;
        $.lblPeek.color = "#f1f3f4";
    }
    var length = $.txtPassword.value.length;
    $.txtPassword.setSelection(length, length);
}

function signIn() {
    // show busy dialog
    // make request to web service to sign in
    // handle response:
    // 	on success - set credentials and load "home" view
    // 	on error - display error message
    var isRunner = false;
    if ($.cb_runner.value) {
        isRunner = true;
    } else {
        isRunner = false;
    }

    $.txtEmail.blur();
    $.txtPassword.blur();

    var email = $.txtEmail.value || "";
    if (email.length < 1) {
        alert("Please enter a valid email address to login.");
        return;
    }

    var password = $.txtPassword.value || "";
    if (password.length < 1) {
        alert("Please enter your password to login.");
        return;
    }

    if (Titanium.Network.networkType === Titanium.Network.NETWORK_NONE) {
        alert("No network connection found, please ensure you are connected to the internet before attempting to login");
        return;
    }

    showLoading();

    cancelRotation = true;
    if (imgTimeout) {
        clearTimeout(imgTimeout);
    }

    // var oldOpacity = $.img5.opacity;
    // $.img5.animate(animateIntoFocus);
    var oldOpacity = $.img4.opacity;
    $.img4.animate(animateIntoFocus);

    if (isRunner) {
        C2.authenticateRunner(email, password, function(resp, status, msg) {

            if (status == 1) {
                console.log("authenitcated user, loading mainWindow");
                C2.mainWindow = Alloy.createController("mainWindow");
                $.txtPassword.value = "";
                C2.mainWindow.getView().open();
                $.img4.animate(animateOutOfFocus);
            } else {
                alert("Error logging in: " + msg);
            }

            hideLoading();

        }, function(e) {
            console.log("error trying to auth user", e);
            alert("Our server is currently down for maintenance, please try again later.");
            hideLoading();
        });
    } else {

        C2.authenticateUser(email, password, function(resp, status, msg) {

            if (status == 1) {
                console.log("authenitcated user, loading mainWindow");
                C2.mainWindow = Alloy.createController("mainWindow");
                $.txtPassword.value = "";
                C2.mainWindow.getView().open();
                $.img4.animate(animateOutOfFocus);
            } else {
                alert("Error logging in: " + msg);
            }

            hideLoading();

        }, function(e) {
            console.log("error trying to auth user", e);
            alert("Our server is currently down for maintenance, please try again later.");
            hideLoading();
        });
    }
};

function onAccountCreated(email, password) {
    $.txtEmail.value = email;
    $.txtPassword.value = password;

    signIn();
}

//var newAcctView = null;
function showNewAccount() {
    // open newAccount view
    $.loadingView.visible = true;
    $.btnNewAcct.disable();
    //if(newAcctView == null) {
    newAcctView = Alloy.createController('createAccount', onAccountCreated).getView();

    newAcctView.addEventListener("blur", function() {
        $.loadingView.visible = false;
        $.btnNewAcct.enable();
    });

    newAcctView.open();
    //} else {
    //newAcctView.open();
    //}

};

$.window.addEventListener("focus", function() {
    console.log("login view gained foucs...");
});

function test() {
    C2.Test({
        Echo : 'test echo'
    }, function(data, msg, status) {
        console.log("SUCCES", data.Echo, msg, status);
    }, function() {
        console.log("ERROR");
    });
};

if (Alloy.Globals.isIOS) {
    $.window.addEventListener('open', function() {
        console.log("keyboard container open");
        //$.keyboardContainer.example();
    });
} else {
    $.window.addEventListener('open', function() {
        if (Ti.Platform.osname == 'android') {
            Titanium.Android.requestPermissions(['android.permission.CAMERA', 'android.permission.WRITE_EXTERNAL_STORAGE', 'android.permission.READ_EXTERNAL_STORAGE', 'android.permission.INTERNET', 'android.permission.ACCESS_FINE_LOCATION', 'android.permission.ACCESS_COARSE_LOCATION', 'android.permission.CALL_PHONE'], function(e) {
                Ti.API.info('HAS WRITE_EXTERNAL_STORAGE, READ_EXTERNAL_STORAGE AND CAMERA PERMISSION ' + JSON.stringify(e));
            });
        }
    });
}

function txtEmail_onReturn() {

}

function rotatePicture() {
    var current = imgs[imgIndex];

    //console.log("current imgIndex", imgIndex);
    if (goDown) {
        imgIndex--;
    } else {
        imgIndex++;
    }

    if (imgIndex < 0) {
        imgIndex = 1;
        goDown = false;
    } else if (imgIndex >= imgs.length) {
        imgIndex = imgs.length - 2;
        goDown = true;
    }

    //console.log("next index..", imgIndex, goDown);

    if (goDown) {
        //console.log("animating current out of focus...", current.id);
        current.animate(animateOutOfFocus);
    } else {
        var next = imgs[imgIndex];
        //console.log("animating next into focus", next.id);
        next.animate(animateIntoFocus);
    }
}

function doRotation() {
    imgTimeout = setTimeout(function() {
        if (!cancelRotation) {
            rotatePicture();
            doRotation();
        }

    }, 2500);
}

/*
 * <ImageView id="img1" image="stadium-min.jpg" width="1601" opacity="1" />
 <ImageView id="img2" image="baseballField.jpg" width="2560" opacity="1" />
 <ImageView id="img3" image="basketball.jpg" width="1698" opacity="1" />
 <ImageView id="img4" image="soccer.jpg" width="1800" opacity="1" />
 <ImageView id="img5" image="volleyball.jpg" width="1600" opacity="1" />
 */

if (Alloy.Globals.rememberMe) {
    $.txtEmail.value = Alloy.Globals.lastUserEmail;
    $.txtPassword.value = Alloy.Globals.lastUserPasssword;
    if (Ti.App.Properties.getBool("isRunner")) {
        //Ti.App.Properties.setObject('ORDERS', null);
        signIn();
    }
}

$.txtEmail.addEventListener('return', function() {
    console.log("txtEmail return, going to password");
    //$.txtEmail.blur();
    $.txtPassword.focus();
});

$.txtEmail.addEventListener('blur', function() {
    console.log("txtEmail blur");
});

/*var fb = require('facebook');
 fb.initialize();
 var loginButton = fb.createLoginButton({
 readPermissions: ['read_stream','email'],
 width : '80%',
 height : 50
 });

 $.btn_fb.add(loginButton);
 */

function createFBAccount(data) {
    console.log("creating new account ", JSON.stringify(data));
    showLoading();
    C2.CreateFacbookCustomer({
        userID : data.userID,
        FirstName : data.firstName,
        LastName : data.lastName,
        Email : (data.email) ? data.email : "",
        Phone : "",
        Password : "facebookuser",
        AllowSMSNotifications : true,
        AllowEmailNotifications : true
    }, function(resp, status, msg) {

        if (status == 1) {
            console.log("authenitcated user, loading mainWindow");
            C2.mainWindow = Alloy.createController("mainWindow");
            $.txtPassword.value = "";
            C2.mainWindow.getView().open();
            //$.img5.animate(animateOutOfFocus);
        } else {
            alert("Error logging in: " + msg);
        }

        hideLoading();

    }, function(e) {
        console.log("error trying to auth user", e);
        alert("Our server is currently down for maintenance, please try again later.");
        hideLoading();
    });
}

var fb = require('facebook');
fb.initialize();
fb.permissions = ['read_stream', 'email'];
fb.addEventListener('login', function(e) {
    // You *will* get this event if loggedIn == false below
    // Make sure to handle all possible cases of this event
    Ti.API.info('---login---- ' + JSON.stringify(e));
    if (e.success) {
        var data = JSON.parse(e.data);
        createFBAccount(data);
        // alert('login from uid: '+e.uid+', name: '+JSON.parse(e.data).name);
        //label.text = 'Logged In = ' + fb.loggedIn;
    } else if (e.cancelled) {
        // user cancelled
        // alert('cancelled');
    } else {
        alert(e.error);
    }
});
fb.addEventListener('logout', function(e) {
    // alert('logged out');
    //label.text = 'Logged In = ' + fb.loggedIn;
});

function loginFB() {
    if (fb.loggedIn) {
        fb.logout();
    }
    fb.authorize();
}

