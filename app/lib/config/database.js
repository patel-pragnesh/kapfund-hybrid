exports.createDatabase = function() {

	var db = Ti.Database.open('MILEAGE_TRACKER');

	db.execute('CREATE TABLE IF NOT EXISTS GEOTRACKINGDATA(id TEXT PRIMARY KEY, ride TEXT, timestamp INTEGER, latitude REAL,longitude REAL, accuracy INTEGER, altitude REAL, altitudeAccuracy REAL, heading REAL, speed REAL);');
	db.execute('CREATE TABLE IF NOT EXISTS RIDES(id TEXT PRIMARY KEY, fromTime INTEGER, toTime INTEGER);');

	db.close();
};
