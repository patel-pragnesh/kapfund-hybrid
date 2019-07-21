exports.definition = {
	config : {
		columns : {
			"id" : "integer",
			"vendorOrderNumber" : "TEXT",
			"serviceFee" : "decimal",
			"subTotal" : "decimal",
			"total" : "decimal",
			"vendorID" : "integer",
			"vendorName" : "TEXT",
			"vendorDescription" : "TEXT",
			"venueID" : "integer",
			"venueName" : "TEXT",
			"venueAddress" : "TEXT",
			"venueCity" : "TEXT",
			"venueState" : "TEXT",
			"venueZip" : "TEXT",
			"customerID" : "integer",
			"orderStatusID" : "integer",
			"orderStatusName" : "TEXT",
			"orderStatusDescription" : "TEXT",
			"fulfillmentTypeID" : "integer",
			"fulfillmentTypeName" : "TEXT",
			"specialInstructions" : "TEXT",
			"itemCount" : "integer",
			"delivering" : "BOOL",
			"createdAt" : "TEXT",
			"updatedAt" : "TEXT",

			"totalTxt" : "TEXT",
			"subTotalTxt" : "TEXT",
			"serviceFeeTxt" : "TEXT"

		},
		adapter : {
			type : "properties",
			collection_name : "order"
		}
	},
	extendModel : function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
		});

		return Model;
	},
	extendCollection : function(Collection) {
		_.extend(Collection.prototype, {
			// extended functions and properties go here

			// For Backbone v1.1.2, uncomment the following to override the
			// fetch method to account for a breaking change in Backbone.
			/*
			 fetch: function(options) {
			 options = options ? _.clone(options) : {};
			 options.reset = true;
			 return Backbone.Collection.prototype.fetch.call(this, options);
			 }
			 */
			idAttribute : "id"
		});

		return Collection;
	}
}; 