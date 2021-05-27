sap.ui.define([
'sap/ui/core/mvc/Controller',
'sap/ui/model/Sorter',
'jquery.sap.global',
'sap/ui/model/Filter',
],
	function( Controller, Sorter, jQuery, Filter) {
	"use strict";

	return Controller.extend("org.ubb.books.controller.Checkout", {

        _oResponsivePopover: null,

		onBeforeRendering: function(oEvent) {
            console.log("oTable");
         	if (!this._oResponsivePopover) {
          		this._oResponsivePopover = sap.ui.xmlfragment("org.ubb.books.view.SortFilter", this);
         	}
          	let oTable = this.getView().byId("idCheckoutsTable");
          	oTable.addEventDelegate({
            	onBeforeShow: function() {
              		var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
              		for (var i = 0; i < oHeader.length; i++) {
               			var oID = oHeader[i].id;
                		that.onClick(oID);
              		}
            	}
          	}, oTable);
        },

		onClick: function(oID) {
			var that = this;
			$('#' + oID).click(function(oEvent) { //Attach Table Header Element Event
			  var oTarget = oEvent.currentTarget; //Get hold of Header Element
			  var oLabelText = oTarget.childNodes[0].textContent; //Get Column Header text
			  var oIndex = oTarget.id.slice(-1); //Get the column Index
			  var oView = that.getView();
			  var oTable = oView.byId("idProductsTable");
			  var oModel = oTable.getModel().getProperty("/ProductCollection"); //Get Hold of Table Model Values
			  var oKeys = Object.keys(oModel[0]); //Get Hold of Model Keys to filter the value
			  oView.getModel().setProperty("/bindingValue", oKeys[oIndex]); //Save the key value to property
			  that._oResponsivePopover.openBy(oTarget);
			});
		  },
  
		  onChange: function(oEvent) {
			var oValue = oEvent.getParameter("value");
			var oMultipleValues = oValue.split(",");
			var oTable = this.getView().byId("idProductsTable");
			var oBindingPath = this.getView().getModel().getProperty("/bindingValue"); //Get Hold of Model Key value that was saved
			var aFilters = [];
			for (var i = 0; i < oMultipleValues.length; i++) {
			  var oFilter = new Filter(oBindingPath, "Contains", oMultipleValues[i]);
			  aFilters.push(oFilter)
			}
			var oItems = oTable.getBinding("items");
			oItems.filter(aFilters, "Application");
			this._oResponsivePopover.close();
		  },
  
		  onAscending: function() {
			var oTable = this.getView().byId("idProductsTable");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.getView().getModel().getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		  },
  
		  onDescending: function() {
			var oTable = this.getView().byId("idProductsTable");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.getView().getModel().getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath, true);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		  },
		  
		  onOpen: function(oEvent){
			//On Popover open focus on Input control
			var oPopover = sap.ui.getCore().byId(oEvent.getParameter("id"));
			var oPopoverContent = oPopover.getContent()[0];
			var oCustomListItem = oPopoverContent.getItems()[2];
			var oCustomContent = oCustomListItem.getContent()[0];
			var oInput = oCustomContent.getItems()[1];
			oInput.focus();
			oInput.$().find('.sapMInputBaseInner')[0].select();
		  },

	});
});
