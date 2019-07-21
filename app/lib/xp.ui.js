if (!OS_IOS) {

    var NavigationWindow = function (args) {
        this.args = args;
    };

    NavigationWindow.prototype.open = function (params) {
        params = params || {};
        params.displayHomeAsUp = false;
        return this.openWindow(this.args.window, params);
    };

    NavigationWindow.prototype.close = function (params) {
        return this.closeWindow(this.args.window, params);
    };

    NavigationWindow.prototype.openWindow = function (window, options) {
        var that = this;

        options = options || {};
        options.swipeBack = (typeof options.swipeBack === 'boolean') ? options.swipeBack : that.args.swipeBack;
        options.displayHomeAsUp = (typeof options.displayHomeAsUp === 'boolean') ? options.displayHomeAsUp : that.args.displayHomeAsUp;

        if (OS_ANDROID && options.animated !== false) {
            options.activityEnterAnimation = Ti.Android.R.anim.slide_in_left;
            options.activityExitAnimation = Ti.Android.R.anim.slide_out_right;
        }

        if (options.swipeBack !== false) {
            window.addEventListener('swipe', function (e) {
                if (e.direction === 'right') {
                    that.closeWindow(window, options);
                }
            });
        }

        if (OS_ANDROID && options.displayHomeAsUp !== false && !window.navBarHidden) {
            window.addEventListener('open', function () {
                var activity = window.getActivity();
                if (activity) {
                    var actionBar = activity.actionBar;
                    if (actionBar) {
                        actionBar.displayHomeAsUp = true;
                        actionBar.onHomeIconItemSelected = function () {
                            that.closeWindow(window, options);
                        };
                    }
                }
            });
        }

        return window.open(options);
    };

    NavigationWindow.prototype.closeWindow = function (window, options) {
        options = options || {};

        if (OS_ANDROID && options.animated !== false) {
            options.activityEnterAnimation = Ti.Android.R.anim.slide_in_left;
            options.activityExitAnimation = Ti.Android.R.anim.slide_out_right;
        }

        return window.close(options);
    };
}

exports.createNavigationWindow = function (args) {
    var navWin = OS_IOS ? Ti.UI.iOS.createNavigationWindow(args) : new NavigationWindow(args);

    if (args && args.id) {
        Alloy.Globals[args.id] = navWin;
    }

    return navWin;
};

// SAMPLE
/*<!--
	The module-attribute will result in require('xp.ui').createNavigationWindow()
	See app/lib/xp.ui.js for how we use this to emulate the iOS-only NavigationWindow for Android
	-->
	<NavigationWindow id="navWin" module="xp.ui">
		<Window title="Samples">
			<ListView onItemclick="onListViewItemclick">
				<ListSection>
					<ListItem itemId="autolayout" platform="ios" title="Auto Layout"/>
					<ListItem itemId="touchid" platform="ios" title="Apple Touch ID"/>
					<ListItem itemId="animateview" title="View Animation"/>
					<ListItem itemId="label" title="Styled Labels"/>
					<ListItem itemId="drawrect" title="Custom Drawing"/>
					<ListItem itemId="touches" title="Touches"/>
					<ListItem itemId="calendar" platform="ios" title="Calendar (3rd Party Integration)"/>
					<ListItem itemId="charting" platform="ios" title="Charting (3rd party integration)"/>
					<ListItem itemId="alert" title="Alert"/>
					<ListItem itemId="xib" platform="ios" title="Interface Builder UI"/>
					<ListItem itemId="donutchart" title="Donut Chart"/>
					<ListItem itemId="shapes" platform="ios" title="Shapes &amp; Animation"/>
					<ListItem itemId="custom" platform="ios" title="Custom Class"/>
					<ListItem itemId="tinder" platform="ios" title="Tinder UI"/>
					<ListItem itemId="gravity" platform="ios" title="Gravity"/>
					<ListItem itemId="tableview" platform="ios" title="Table View"/>
					<ListItem itemId="snackbar" platform="android" title="Snackbar"/>
					<ListItem itemId="blur" platform="android" title="Blur"/>
					<ListItem itemId="sizefill" title="FILL vs SIZE"/>
				</ListSection>
			</ListView>
		</Window>

	</NavigationWindow>*/
	
	// SAMPLE
	/* 
	 * 
function onListViewItemclick(e) {

	// We've set the items special itemId-property to the controller name
	var controllerName = e.itemId;

	// Which we use to create the controller, get the window and open it in the navigation window
	// See lib/xp.ui.js to see how we emulate this component for Android
	$.navWin.openWindow(Alloy.createController(controllerName).getView());
}
*/
	 
