var myFormatter = {
	formatColor: function(v) {
	console.log(v);
	  var oValue = parseInt(v)
	  if (oValue > 3) {
		this.addStyleClass("customGreen");
		return oValue;
	  } else if (oValue > 0) {
		this.addStyleClass("customOrange");
		return oValue;
	  } else if (oValue == 0) {
		this.addStyleClass("customRed");
		return oValue;
	  }
	  return oValue;
	}
  };

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/ValueState",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Text",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter',
	'jquery.sap.global'
//	'sap/ushell_abap/bootstrap/abap'
 ], function (Controller, ValueState, Dialog, DialogType, Button, ButtonType, Text, Fragment, MessageToast, Filter, FilterOperator, Sorter, jQuery) {
	"use strict";
	return Controller.extend("org.ubb.books.controller.App", {

		onInit : function() {
			this.book = {
                ISBN: "",
                Author: "",
                Title: "",
                PublicationDate: "",
                Language: "",
                AvailableNumber: "",
                TotalNumber: ""
            }
		},

		onBorrowPress : function(oEvent){
			var oView = this.getView();
			var path = oEvent.getSource().getBindingContext().getPath();
			this.pDialog = Fragment.load({
				id: oView.getId(),
				name: "org.ubb.books.view.BorrowDialog",
				controller: this
			}).then(function (oDialog) {
				oView.addDependent(oDialog);
				oDialog.bindElement({
					path: path,
					});
				return oDialog;
			});
			this.pDialog.then(function(oDialog) {
				oDialog.open();
			});
		},

		onBorrowBookCancelPress : function () {
			this.byId("BorrowBookDialog").close();
			this.byId("BorrowBookDialog").destroy();
		},

		onBorrowBookOkPress : function (oEvent) {

			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/Z801_BOOKS_MAGA_SRV", false );
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var oEntry = {};
			oEntry.FirstName = "Mark"
			oEntry.LastName = "Gati"
			oEntry.Username = "MGATI"
			oEntry.CheckoutDate = new Date(Date.now());
			oEntry.ReturnDate = new Date(Date.now() + 2592000000);
			oEntry.Isbn = parseInt(this.getView().byId("Isbn").getText());
			oModel.create("/Checkouts", oEntry, {
				success:function(){
					var msg = oResourceBundle.getText("BorrowSuccessful");
					MessageToast.show(msg);
				},
				error:function(){
					var msg = oResourceBundle.getText("BorrowFailed");
					MessageToast.show(msg);
				}
			});

			this.byId("BorrowBookDialog").close();
			this.byId("BorrowBookDialog").destroy();
		},

		areFiltersValid: function(isbn, dateStart, dateEnd, language){
            var isValid = true;
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            if(isbn != "" && isbn.length != 13){
                isValid = false;
                MessageToast.show(oResourceBundle.getText("isbnWarning"));
            }            
            else if(language != "" && language.length != 2){
                isValid = false;
                MessageToast.show(oResourceBundle.getText("languageCodeWarning"));
            }
            else if(dateStart != "" && dateEnd != "" && dateStart > dateEnd){
                isValid = false;
                MessageToast.show(oResourceBundle.getText("datesOrderWarning"));
            }
            return isValid;
        },

		onSearchButtonPressed(oEvent){
            var isbn = this.byId("inputISBN").getValue();
            var title = this.byId("inputTitle").getValue();
            var author = this.byId("inputAuthor").getValue();
            var language = this.byId("inputLanguage").getValue();
            var dateStart = this.byId("inputDateStart").getDateValue();
            var dateEnd = this.byId("inputDateEnd").getDateValue();

            var aFilter = [];
            var oList = this.getView().byId("idBooksTable");
            var oBinding = oList.getBinding("items");

            var valid = this.areFiltersValid(isbn, dateStart, dateEnd, language);
            if(valid) {
                if(isbn){
                    aFilter.push(new Filter("ISBN", FilterOperator.Contains, isbn));
                }
                if(author){
                    aFilter.push(new Filter("Author", FilterOperator.Contains, author));
                }
                if(title){
                    aFilter.push(new Filter("Title", FilterOperator.Contains, title));
                }
                if(dateStart && dateEnd){
                    var filter = new Filter("PublishDate", FilterOperator.BT, dateStart, dateEnd)
                    aFilter.push(filter);
                }
                if(language){
                    aFilter.push(new Filter("Language", FilterOperator.Contains, language));
                }
                oBinding.filter(aFilter);
            }            
        },

		onSortButtonPressed: function(oEvent) { 
			var oView = this.getView();
				this.pDialog = Fragment.load({
					id: oView.getId(),
					name: "org.ubb.books.view.Sorter",
					controller: this
				}).then(function (oDialog) {
					oDialog.setModel(oView.getModel("i18n"), "i18n");
					return oDialog;
				});
			this.pDialog.then(function(oDialog) {
				oDialog.open();
			});
        },

		onConfirm: function(oEvent) {
            var oView = this.getView();
            var oTable = oView.byId("idBooksTable");
            var mParams = oEvent.getParameters();
            var oBinding = oTable.getBinding("items");

            // apply sorter
            var aSorters = [];
            var sPath = mParams.sortItem.getKey();
            var bDescending = mParams.sortDescending;
            aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
            oBinding.sort(aSorters);

        },

 	})
})