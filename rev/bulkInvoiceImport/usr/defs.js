ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.rev = { bulkInvoiceImport: {} };
	
}, 1);

ii.init.register( function() {
	
	fin.rev.bulkInvoiceImport.invoiceArgs = {
		id: {type: Number}
		, invoiceNumber: {type: Number, required: false, defaultValue: 0}
		, sequence: {type: String, required: false, defaultValue: ""}
		, customerNumber: {type: String, required: false, defaultValue: ""}
		, houseCode: {type: String, required: false, defaultValue: ""}
		, jobCode: {type: String, required: false, defaultValue: ""}
		, accountCode: {type: String, required: false, defaultValue: ""}
		, invoiceDate: {type: String, required: false, defaultValue: ""}
		, dueDate: {type: String, required: false, defaultValue: ""}
		, periodStartDate: {type: String, required: false, defaultValue: ""}
		, periodEndDate: {type: String, required: false, defaultValue: ""}
		, poNumber: {type: String, required: false, defaultValue: ""}
		, taxExempt: {type: String, required: false, defaultValue: ""}
		, taxNumber: {type: String, required: false, defaultValue: ""}
		, taxable: {type: String, required: false, defaultValue: ""}
		, show: {type: String, required: false, defaultValue: ""}
		, itemDescription: {type: String, required: false, defaultValue: ""}
		, quantity: {type: String, required: false, defaultValue: ""}
		, price: {type: String, required: false, defaultValue: ""}
		, status: {type: String, required: false, defaultValue: ""}
		, invoiceByHouseCode: {type: String, required: false, defaultValue: ""}
		, imported: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.rev.bulkInvoiceImport.fileNameArgs = {
		id: {type: Number}
		, fileName: {type: String, required: false, defaultValue: ""}
	};
	
	fin.rev.bulkInvoiceImport.bulkImportValidationArgs = {
		id: {type: Number}
		, customerNumbers: {type: String, required: false, defaultValue: ""}
		, houseCodes: {type: String, required: false, defaultValue: ""}
		, taxHouseCodes: {type: String, required: false, defaultValue: ""}
		, jobCodes: {type: String, required: false, defaultValue: ""}
		, accountCodes: {type: String, required: false, defaultValue: ""}
	};

	fin.rev.bulkInvoiceImport.batchArgs = {
		id: {type: Number}
		, batchId: {type: Number}
		, statusType: {type: Number}
		, title: {type: String, required: false, defaultValue: ""}		
		, description: {type: String, required: false, defaultValue: ""}
		, totalRows: {type: Number, required: false, defaultValue: 0}
		, insertedRows: {type: Number, required: false, defaultValue: 0}
		, importedRows: {type: Number, required: false, defaultValue: 0}
		, startedOn: {type: String, required: false, defaultValue: ""}
		, completedOn: {type: String, required: false, defaultValue: ""}
	};
	
}, 2);

ii.Class({
	Name: "fin.rev.bulkInvoiceImport.Invoice",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.bulkInvoiceImport.invoiceArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.bulkInvoiceImport.FileName",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.bulkInvoiceImport.fileNameArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.bulkInvoiceImport.BulkImportValidation",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.bulkInvoiceImport.bulkImportValidationArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.bulkInvoiceImport.Batch",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.bulkInvoiceImport.batchArgs);
			$.extend(this, args);
		}
	}
});