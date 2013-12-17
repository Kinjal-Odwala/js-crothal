window.weblight_container = ['<div style="margin: 10px"><div class="header">AP Search</div><div style="clear:both;"></div><div id="itemStatusDiv"><div id="itemStatusImage" class="itemStatusImage"></div><div id="itemModifiedImage" class="itemModifiedImage"></div><div id="itemStatusText">Loading, please wait...</div></div><div style="clear:both;"></div><div><table><tr><td class="labelText">House Code:</td><td class="labelText">Vendor:</td><td class="labelText">Invoice #:</td><td class="labelText">GL Start Date:</td><td class="labelText">GL End Date:</td></tr><tr><td><div id="HouseCode" class="textArea"></div></td><td><div id="Vendor" class="textArea"></div></td><td><div id="InvoiceNumber" class="textArea"></div></td><td><div id="GLStartDate" class="textArea"></div></td><td><div id="GLEndDate" class="textArea"></div></td></tr><tr height="35px"><td align="center"><div id="Search"></div></td><td><div id="Export"></div></td></tr></table></div><div style="clear:both; height:10px;"></div><div id="APInvoiceGrid"></div></div><div id="divFrame" style="height: 0px;"><iframe id="iFrameUpload" src="/net/crothall/chimes/fin/app/act/FileUpload.aspx" frameborder="0" width="100" height="0"></iframe></div>'];

/**
* Copyright (c) 2009 Sergiy Kovalchuk (serg472@gmail.com)
* 
* Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
* and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
*  
* Following code is based on Element.mask() implementation from ExtJS framework (http://extjs.com/)
*
*/
; (function($) {

    /**
    * Displays loading mask over selected element(s). Accepts both single and multiple selectors.
    *
    * @param label Text message that will be displayed on top of the mask besides a spinner (optional). 
    * 				If not provided only mask will be displayed without a label or a spinner.  	
    * @param delay Delay in milliseconds before element is masked (optional). If unmask() is called 
    *              before the delay times out, no mask is displayed. This can be used to prevent unnecessary 
    *              mask display for quick processes.   	
    */
    $.fn.maskEl = function(label, delay) {
        $(this).each(function() {
            if (delay !== undefined && delay > 0) {
                var element = $(this);
                element.data("_mask_timeout", setTimeout(function () { $.maskElement(element, label) }, delay));
            } else {
                $.maskElement($(this), label);
            }
        });
    };

    /**
    * Removes mask from the element(s). Accepts both single and multiple selectors.
    */
    $.fn.unmaskEl = function() {
        $(this).each(function() {
            $.unmaskElement($(this));
        });
    };

    /**
    * Checks if a single element is masked. Returns false if mask is delayed or not displayed. 
    */
    $.fn.isElMasked = function() {
        return this.hasClass("masked");
    };

    $.maskElement = function(element, label) {

        //if this element has delayed mask scheduled then remove it and display the new one
        if (element.data("_mask_timeout") !== undefined) {
            clearTimeout(element.data("_mask_timeout"));
            element.removeData("_mask_timeout");
        }

        if (element.isElMasked()) {
            $.unmaskElement(element);
        }

        if (element.css("position") == "static") {
            element.addClass("masked-relative");
        }

        element.addClass("masked");

        var maskDiv = $('<div class="loadmask"></div>');

        //auto height fix for IE
        if (navigator.userAgent.toLowerCase().indexOf("msie") > -1) {
            maskDiv.height(element.height() + parseInt(element.css("padding-top")) + parseInt(element.css("padding-bottom")));
            maskDiv.width(element.width() + parseInt(element.css("padding-left")) + parseInt(element.css("padding-right")));
        }

        //fix for z-index bug with selects in IE6
        if (navigator.userAgent.toLowerCase().indexOf("msie 6") > -1) {
            element.find("select").addClass("masked-hidden");
        }

        element.append(maskDiv);

        if (label !== undefined) {
            var maskMsgDiv = $('<div class="loadmask-msg" style="display:none;"></div>');
            maskMsgDiv.append('<div>' + label + '</div>');
            element.append(maskMsgDiv);

            //calculate center position
            maskMsgDiv.css("top", Math.round(element.height() / 2 - (maskMsgDiv.height() - parseInt(maskMsgDiv.css("padding-top")) - parseInt(maskMsgDiv.css("padding-bottom"))) / 2) + "px");
            maskMsgDiv.css("left", Math.round(element.width() / 2 - (maskMsgDiv.width() - parseInt(maskMsgDiv.css("padding-left")) - parseInt(maskMsgDiv.css("padding-right"))) / 2) + "px");

            maskMsgDiv.show();
        }

    };

    $.unmaskElement = function(element) {
        //if this element has delayed mask scheduled then remove it
        if (element.data("_mask_timeout") !== undefined) {
            clearTimeout(element.data("_mask_timeout"));
            element.removeData("_mask_timeout");
        }

        element.find(".loadmask-msg,.loadmask").remove();
        element.removeClass("masked");
        element.removeClass("masked-relative");
        element.find("select").removeClass("masked-hidden");
    };

})(jQuery);
// vim: ts=4:sw=4:nu:fdc=4:nospell
/*global Ext */
/**
 * @singleton 
 * @class Ext.ux.util
 *
 * Contains utilities that do not fit elsewhere
 *
 * @author     Ing. Jozef Sakáloš
 * @copyright  (c) 2009, Ing. Jozef Sakáloš
 * @version    1.0
 * @date       30. January 2009
 * @revision   $Id: Ext.ux.util.js 620 2009-03-09 12:41:44Z jozo $
 *
 * @license
 * Ext.ux.util.js is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 *
 * <p>License details: <a href="http://www.gnu.org/licenses/lgpl.html"
 * target="_blank">http://www.gnu.org/licenses/lgpl.html</a></p>
 *
 * @donate
 * <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
 * <input type="hidden" name="cmd" value="_s-xclick">
 * <input type="hidden" name="hosted_button_id" value="3430419">
 * <input type="image" src="https://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" 
 * border="0" name="submit" alt="PayPal - The safer, easier way to pay online.">
 * <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1">
 * </form>
 */

function setStatus(status) {
	var me = this;
	
	me.$itemStatusImage = $("#rev-apSearch-itemStatusImage");
	me.$itemModifiedImage = $("#rev-apSearch-itemModifiedImage");
	me.$itemStatusText = $("#rev-apSearch-itemStatusText");

	if (status == "Loading" || status == "Exporting")
		message = status + ", please wait...";
	else if (status == "Exported")
		message = "Data exported successfully.";
	else if (status == "Locked")
		message = "The current page is Readonly.";
	else
		message = "Normal";

	if (status == "Locked")
		me.$itemModifiedImage.addClass("Locked");
	else
		me.$itemModifiedImage.removeClass("Locked");

	if (status == "Loaded" || status == "Exported")
		status = "Normal";

	me.$itemStatusImage.attr("class", "itemStatusImage " + status);
	me.$itemStatusText.text(message);
}
		
Ext.Ajax.timeout = 300000; //5 minutes

jQuery.ajaxSettings.contentType = 'application/x-www-form-urlencoded; charset=utf-8';

Ext.namespace('Rev', 'Rev.page', 'Rev.data');

Ext.override(WebLight.Control, {

    mask: function(msg) {
        if (!msg)
            msg = 'Please wait...';
        this.$this.maskEl(msg);
    },
    unmask: function() {
        this.$this.unmaskEl();
    }
});

Ext.override(WebLight.Page, {

    mask: function(msg) {
        if (!msg)
            msg = 'Please wait...';
        this.$this.maskEl(msg);
    },
    unmask: function() {
        this.$this.unmaskEl();
    }
});

Ext.override(Ext.data.GroupingStore, {
 	sort : function(fieldName, dir) {
 		if (this.remoteSort) {
 			return Ext.data.GroupingStore.superclass.sort.call(this, fieldName, dir);
 		}

 		var sorters = [];

 		//cater for any existing valid arguments to this.sort, massage them into an array of sorter objects
 		if (Ext.isArray(arguments[0])) {
		 	sorters = arguments[0];
		}
		else if (fieldName == undefined) {
		 	//we preserve the existing sortInfo here because this.sort is called after
		 	//clearGrouping and there may be existing sorting
		 	sorters = [this.sortInfo];
		} else {
		 	//TODO: this is lifted straight from Ext.data.Store's singleSort function. It should instead be
		 	//refactored into a common method if possible
		 	var field = this.fields.get(fieldName);
		 	if (!field) return false;
 
			var name = field.name,
			sortInfo = this.sortInfo || null,
			sortToggle = this.sortToggle ? this.sortToggle[name] : null;
 
			if (!dir) {
				if (sortInfo && sortInfo.field == name) { // toggle sort dir
					dir = (this.sortToggle[name] || 'ASC').toggle('ASC', 'DESC');
				} 
				else {
					dir = field.sortDir;
				}
 			}
 
			this.sortToggle[name] = dir;
 			this.sortInfo = {field: name, direction: dir};

 			sorters = [this.sortInfo];
 		}

 		//add the grouping sorter object as the first multisort sorter
 		if (this.groupField && this.groupField != fieldName) {
 			sorters.unshift({direction: this.groupDir, field: this.groupField}); 
		}

 		return this.multiSort.call(this, sorters, dir);
	},
});

Rev.data.XmlReader = Ext.extend(Ext.data.XmlReader, {

    read: function(response) {
        var xml = this.formatXml(response.responseText);
        var doc;

        if (window.ActiveXObject) {
            doc = new ActiveXObject("Microsoft.XMLDOM");
            doc.async = "false";
            doc.loadXML(xml);
        } else {
            doc = new DOMParser().parseFromString(xml, "text/xml");
        }

        if (!doc) {
            throw { message: "XmlReader.read: XML Document not available" };
        }

        return this.readRecords(doc);
    },

    // fix returned data is "True" and "False" issue
    formatXml: function(input) {

        input = input.replace(/"True"/gi, '"true"');
        input = input.replace(/"False"/gi, '"false"');
        return input;
    }
});

Rev.data.XmlStore = Ext.extend(Ext.data.GroupingStore, {
    url: '/net/crothall/chimes/fin/app/act/Provider.aspx',
    recordName: 'item',
    constructor: function(config) {
        var me = this;
        config = config || {};
        var fields = config.fields || this.fields;
        var reader = config.reader || this.reader;
        var idProperty = config.idProperty || this.idProperty;
		
        if (!idProperty)
            idProperty = '@id';

        if (!reader && fields && fields.length) {
            reader = new Rev.data.XmlReader({ record: me.recordName, idProperty: idProperty, totalProperty: "totalRows" }, fields);
            config.reader = reader;
            this.reader = reader;
        }

        Rev.data.XmlStore.superclass.constructor.call(this, config);
    },
    requestId: 1,
    moduleId: 'app',
    targetId: 'iiCache',
    storeId: '',
    getRequestId: function() { return this.requestId; },
    getStoreId: function() { return this.storeId; },
    getCriteria: function() { return {}; },
    getRequestXml: function() {
        var arr = ['<criteria>'];
        var criteria = this.getCriteria();
        var userId = '[user]';

        criteria = Ext.apply(criteria || {}, { storeId: this.getStoreId(), userId: userId });

        for (i in criteria) {
            arr.push(String.format('{0}:{1},', i, criteria[i]));
        }

        arr.push('</criteria>');
        return arr.join('');
    },

    load: function(options) {

        this.setBaseParam('requestId', this.getRequestId());
        this.setBaseParam('moduleId', this.moduleId);
        this.setBaseParam('targetId', this.targetId);
        this.setBaseParam('requestXml', this.getRequestXml());

        Rev.data.XmlStore.superclass.load.call(this, {});
    }
});

Rev.data.apHouseCodeStore = WebLight.extend(Rev.data.XmlStore, {
    url: '/net/crothall/chimes/fin/rev/act/Provider.aspx',
    moduleId: 'rev',
	requestId: 1,
    recordName: 'item',
    storeId: 'revAPHouseCodes',
    fields: [{ name: 'id', mapping: '@id', type: 'int' },
             { name: 'houseCode', mapping: '@houseCode' }
            ]
});

Rev.data.apInvoiceStore = WebLight.extend(Rev.data.XmlStore, {
    url: '/net/crothall/chimes/fin/rev/act/Provider.aspx',
    moduleId: 'rev',
	requestId: 2,
    storeId: 'revAPInvoices',
	houseCode: '',
    vendor: '',
    invoiceNumber: '',
    glStartDate: '',
	glEndDate: '',
	totalRecords: 0,
	
    getCriteria: function() {
        return {
            houseCode: this.houseCode,
            vendor: this.vendor,
            invoiceNumber: this.invoiceNumber,
            glStartDate: this.glStartDate,
			glEndDate: this.glEndDate,
			startPoint: this.baseParams.start,
			maximumRows: this.baseParams.limit,
			totalRecords: this.totalRecords
        };
    },

    load: function(options) {
        var me = this;

		me.setBaseParam('start', options.params.start);
		me.setBaseParam('limit', options.params.limit);

        Rev.data.apInvoiceStore.superclass.load.call(this);
    },

    fields: [{ name: 'id', mapping: '@id', type: 'int' },
             { name: 'vendorNumber', mapping: '@vendorNumber', type: 'int' },
             { name: 'vendorName', mapping: '@vendorName', type: 'string' },
             { name: 'docType', mapping: '@docType', type: 'string' },
             { name: 'docNumber', mapping: '@docNumber', type: 'int' },
             { name: 'payItem', mapping: '@payItem', type: 'string' },
             { name: 'voidDocType', mapping: '@voidDocType', type: 'string' },
             { name: 'vendorInvoiceNumber', mapping: '@vendorInvoiceNumber', type: 'string' },
             { name: 'invoiceDate', mapping: '@invoiceDate', type: 'date' },
             { name: 'glDate', mapping: '@glDate', type: 'date' },
             { name: 'payStatus', mapping: '@payStatus', type: 'string' },
             { name: 'grossAmount', mapping: '@grossAmount', type: 'float' },
             { name: 'openAmount', mapping: '@openAmount', type: 'float' },
             { name: 'houseCode', mapping: '@houseCode', type: 'string' },
             { name: 'subLedger', mapping: '@subLedger', type: 'string' },
			 { name: 'houseCodeAmount', mapping: '@houseCodeAmount', type: 'float' },
			 { name: 'poNumber', mapping: '@poNumber', type: 'string' },
			 { name: 'purchaseOrderId', mapping: '@purchaseOrderId', type: 'int' }
            ],
	groupField: 'vendorInvoiceNumber'
});

Rev.data.apCheckStore = WebLight.extend(Rev.data.XmlStore, {
    url: '/net/crothall/chimes/fin/rev/act/Provider.aspx',
    moduleId: 'rev',
	requestId: 3,
    storeId: 'revAPChecks',
	vendorNumber: '',
	docType: '',
	docNumber: '',
	payItem: '',
	
    getCriteria: function() {
        return {
            vendorNumber: this.vendorNumber,
            docType: this.docType,
            docNumber: this.docNumber,
            payItem: this.payItem
        };
    },

    load: function(vendorNumber, docType, docNumber, payItem) {
        var me = this;

        me.vendorNumber = vendorNumber;
        me.docType = docType;
        me.docNumber = docNumber;
        me.payItem = payItem;

        Rev.data.apCheckStore.superclass.load.call(this);
    },

    fields: [{ name: 'id', mapping: '@id', type: 'int' },
        	 { name: 'checkDate', mapping: '@checkDate', type: 'date' },
        	 { name: 'checkType', mapping: '@checkType', type: 'string' },
        	 { name: 'checkNumber', mapping: '@checkNumber', type: 'int' },
        	 { name: 'voidCheckDate', mapping: '@voidCheckDate', type: 'date' },
        	 { name: 'docType', mapping: '@docType', type: 'string' },
        	 { name: 'docNumber', mapping: '@docNumber', type: 'int' },
        	 { name: 'payItem', mapping: '@payItem', type: 'string' },
        	 { name: 'vendorNumber', mapping: '@vendorNumber' }
    		]
});

Rev.data.apExportStore = WebLight.extend(Rev.data.XmlStore, {
    url: '/net/crothall/chimes/fin/rev/act/Provider.aspx',
    moduleId: 'rev',
	requestId: 4,
    storeId: 'revInvoiceExcelFileNames',
	houseCode: '',
    vendor: '',
    invoiceNumber: '',
    glStartDate: '',
	glEndDate: '',

    getCriteria: function() {
        return {
            houseCode: this.houseCode,
            vendor: this.vendor,
            invoiceNumber: this.invoiceNumber,
            glStartDate: this.glStartDate,
			glEndDate: this.glEndDate,
			exportType: 'apInvoices'
        };
    },

    load: function(houseCode, vendor, invoiceNumber, glStartDate, glEndDate) {
        var me = this;

        me.houseCode = houseCode;
        me.vendor = vendor;
        me.invoiceNumber = invoiceNumber;
        me.glStartDate = glStartDate;
		me.glEndDate = glEndDate;

        Rev.data.apExportStore.superclass.load.call(this);
    },

	fields: [{ name: 'fileName', mapping: '@fileName' }]
});

function printPurchaseOrder(id) {
	window.open(location.protocol + '//' + location.hostname + '/reports/po.aspx?purchaseorder=' + id,'PrintPO','type=fullWindow,status=yes,toolbar=no,menubar=no,location=no,resizable=yes');
}

Rev.page.apSearch = WebLight.extend(WebLight.Page, {
    html: window.weblight_container[0],
    title: 'AP Search',
	apHouseCodeStore: null,
    apInvoiceStore: null,
	apExportStore: null,
    apInvoiceGrid: null,
	
    createAPInvoiceGrid: function() {
        var me = this;

		var pagingBar = new Ext.PagingToolbar({
	        pageSize: 50,
	        store: me.apInvoiceStore,
	        displayInfo: true,
	        displayMsg: 'Displaying {0} - {1} of {2}',
	        emptyMsg: "No data available to display"
	    });

		 var displayRenderer = function (value, metaData, record, rowIndex, colIndex, store) {
            if (metaData && record) {
				if (colIndex == 0 || colIndex == 1)
				    metaData.attr = 'style="text-align:left;"';
				else if (colIndex == 10 || colIndex == 11 || colIndex == 14) {
					 metaData.attr = 'style="text-align:right;"';
					 return Ext.util.Format.number(value, '0,000.00');
				}
            }

			return value;
        };

        var apInvoiceCMModel = new Ext.grid.ColumnModel({
			defaults: { sortable: true, align: 'center' },
            columns: [{ dataIndex: 'vendorNumber', header: 'Vendor Number', width: 110, renderer: displayRenderer },
					  { dataIndex: 'vendorName', header: 'Vendor Name', width: 200, renderer: displayRenderer },
					  { dataIndex: 'docType', header: 'Doc Type', width: 80 },
					  { dataIndex: 'docNumber', header: 'Doc Number', width: 90 },
					  { dataIndex: 'payItem', header: 'Pay Item', width: 80 },
					  { dataIndex: 'voidDocType', header: 'Void Doc Type', width: 110 },
					  { dataIndex: 'vendorInvoiceNumber', header: 'Vendor Invoice #', width: 120 },
					  { dataIndex: 'invoiceDate', header: 'Invoice Date', width: 100, renderer: Ext.util.Format.dateRenderer('m/d/y')},
					  { dataIndex: 'glDate', header: 'GL Date',  width: 80, renderer: Ext.util.Format.dateRenderer('m/d/y') },
					  { dataIndex: 'payStatus', header: 'Pay Status', width: 90 },
					  { dataIndex: 'grossAmount', header: 'Gross Amount', width: 110, renderer: displayRenderer },
					  { dataIndex: 'openAmount', header: 'Open Amount', width: 110, renderer: displayRenderer },
					  { dataIndex: 'houseCode', header: 'House Code', width: 100, renderer: displayRenderer },
					  { dataIndex: 'subLedger', header: 'Sub Ledger', width: 100, renderer: displayRenderer },
					  { dataIndex: 'houseCodeAmount', header: 'House Code Amount', width: 130, renderer: displayRenderer },
                      { dataIndex: 'poNumber', header: 'PO Number', width: 100,
                       	renderer: function (value, meta, record) {
							if (record.data.purchaseOrderId > 0)
								return "<a href='javascript: void(0)' onclick='printPurchaseOrder(" + record.data.purchaseOrderId + ");'>" + value + "</a>";
							else
								return value;
                  		}
                      }
					 ]
        });

        me.apInvoiceGrid = new Ext.grid.GridPanel({
            store: me.apInvoiceStore,
			cm: apInvoiceCMModel,
            height: $(window).height() - 175,
            ctCls: 'ux-grid-1',
            enableHdMenu: false,
            layout: 'fit',
            stripeRows: true,
            viewConfig: {
                forceFit: true,
                scrollOffset: 0
            },
			id: 'InvoiceGrid',
			title: 'AP Invoices',
			view: new Ext.grid.GroupingView({
	            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'
	        }),
			bbar: pagingBar
        });

        me.apInvoiceGrid.on('rowdblclick', function(grid, rowIndex, e) {

			me.popupApCheckDetails(grid.getStore().getAt(rowIndex));
        });

        me.addChildControl(me.apInvoiceGrid, 'APInvoiceGrid');
    },

    createChildControls: function() {
        var me = this;

		me.apHouseCodeStore = new Rev.data.apHouseCodeStore();
        me.apInvoiceStore = new Rev.data.apInvoiceStore();
		me.apExportStore = new Rev.data.apExportStore();
		me.apCheckStore = new Rev.data.apCheckStore();
        me.createAPInvoiceGrid();

		me.apHouseCodeStore.on('beforeload', function () { me.mask('Loading...'); setStatus("Loading"); });
        me.apHouseCodeStore.on('load', function () { me.unmask(); setStatus("Loaded"); });
        me.apInvoiceStore.on('beforeload', function () { me.mask('Loading...'); setStatus("Loading"); });
        me.apInvoiceStore.on('load', function () { me.unmask(); setStatus("Loaded"); this.totalRecords = this.totalLength; });
		me.apCheckStore.on('beforeload', function () { setStatus("Loading"); });
		me.apCheckStore.on('load', function () { setStatus("Loaded"); });
		me.apExportStore.on('beforeload', function () { me.mask('Exporting...'); setStatus("Exporting"); });
        me.apExportStore.on('load', function () { me.downLoadExcelFile(); me.unmask(); setStatus("Exported"); });

		me.initFields();
    },
	
	initFields: function() {
        var me = this;
		
		me.houseCode = new Ext.form.ComboBox({ name: 'houseCode',
			valueField: 'id',
			displayField: 'houseCode',
			mode: 'local',
			forceSelection: true,
			store: me.apHouseCodeStore,
			width: 160,
			listeners: {
              	specialkey: function(f, e) {
                	if (e.getKey() == e.ENTER)
                    	me.loadAPInvoices();
              	}
            }
		});
		
		me.vendor = new Ext.form.TextField({ name: 'vendor',
			width: 160,
            listeners: {
              	specialkey: function(f, e) {
                	if (e.getKey() == e.ENTER)
                    	me.loadAPInvoices();
              	}
            }
		});
		
		me.invoiceNumber = new Ext.form.TextField({ name: 'invoiceNumber',
			width: 160,
            listeners: {
              	specialkey: function(f, e) {
                	if (e.getKey() == e.ENTER)
                    	me.loadAPInvoices();
              	}
            }
		});
		
		me.glStartDate = new Ext.form.DateField({ name: 'glStartDate',
			width: 160,
            listeners: {
              	specialkey: function(f, e) {
                	if (e.getKey() == e.ENTER)
                    	me.loadAPInvoices();
              	}
            }
		});
		
		me.glEndDate = new Ext.form.DateField({ name: 'glEndDate',
			width: 160,
            listeners: {
              	specialkey: function(f, e) {
                	if (e.getKey() == e.ENTER)
                    	me.loadAPInvoices();
              	}
            }
		});
     	
        me.searchButton = new Ext.Button({ text: 'Search',
            width: 100,
            disabled: false,
            ctCls: 'ux-button-1',
            handler: function() { me.loadAPInvoices(); }
        });
		
		me.exportButton = new Ext.Button({ text: 'Export To Excel',
            width: 100,
            disabled: false,
            ctCls: 'ux-button-1',
            handler: function() { me.exportToExcel(); }
        });

		me.addChildControl(me.houseCode, 'HouseCode');
		me.addChildControl(me.vendor, 'Vendor');
		me.addChildControl(me.invoiceNumber, 'InvoiceNumber');
		me.addChildControl(me.glStartDate, 'GLStartDate');
		me.addChildControl(me.glEndDate, 'GLEndDate');
        me.addChildControl(me.searchButton, 'Search');
		me.addChildControl(me.exportButton, 'Export');
	},
	
	loadStore: function(action) {
		var me = this;
        var houseCode = me.houseCode.lastSelectionText == undefined ? "" : me.houseCode.lastSelectionText;
        var vendor = me.vendor.getValue();
        var invoiceNumber = me.invoiceNumber.getValue();
        var glStartDate = Ext.util.Format.date(me.glStartDate.getValue(), 'm/d/y');
		var glEndDate = Ext.util.Format.date(me.glEndDate.getValue(), 'm/d/y');

		if (houseCode == "" && vendor == "" && invoiceNumber == "" && glStartDate == "") {
			alert("Please enter search criteria: House Code, Vendor, Invoice # or GL Start Date & GL End Date.");
			return;
		}
		else if(me.glStartDate.activeError != undefined || me.glEndDate.activeError != undefined) {
			alert("Please enter valid Date.");
			return;
		}
		else if ((glStartDate != "" && glEndDate == "") || (glStartDate == "" && glEndDate != "")) {
			alert("Please enter GL Start Date and GL End Date.");
			return;
		}

		me.apInvoiceStore.totalRecords = 0;
		me.apInvoiceStore.houseCode = houseCode;
        me.apInvoiceStore.vendor = vendor;
        me.apInvoiceStore.invoiceNumber = invoiceNumber;
        me.apInvoiceStore.glStartDate = glStartDate;
		me.apInvoiceStore.glEndDate = glEndDate;

		if (action == "loadGrid")
			me.apInvoiceStore.load({ params: { start: 0, limit: 50 }});
		else
			me.apExportStore.load(houseCode, vendor, invoiceNumber, glStartDate, glEndDate);
	},

	loadAPInvoices: function() {
        var me = this;

		me.loadStore("loadGrid");
    },

	exportToExcel: function() {
        var me = this;

		me.loadStore("export");
	},

	downLoadExcelFile: function() {
		var me = this;

		if (me.apExportStore.getTotalCount() == 1) {
			 me.apExportStore.each(function (record, index) {
             	$("iframe")[0].contentWindow.document.getElementById("FileName").value = record.get('fileName');
				$("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
            });
		}
	},

    dataBind: function() {
        var me = this;

        me.apHouseCodeStore.load();
    },

    apCheckGrid: null,
    apCheckStore: null,
    apCheckWin: null,
	
    createCheckGrid: function() {
        var me = this;

        me.apCheckGrid = new Ext.grid.GridPanel({
			store: me.apCheckStore,
            border: false,
			ctCls: 'ux-grid-1',
			layout: 'fit',
            header: false,
			height: 400,
            enableHdMenu: false,
            stripeRows: true,
            loadMask: true,
            cm: new Ext.grid.ColumnModel({
                defaults: { sortable: false, width: 100, align: 'center' },
                columns: [{ header: 'Check Date', dataIndex: 'checkDate', renderer: Ext.util.Format.dateRenderer('m/d/y') },
                          { header: 'Check Type', dataIndex: 'checkType' },
                          { header: 'Check Number', dataIndex: 'checkNumber' },
                          { header: 'Void Check Date', dataIndex: 'voidCheckDate', renderer: Ext.util.Format.dateRenderer('m/d/y'), width: 110 },
                          { header: 'Doc Type', dataIndex: 'docType' },
                          { header: 'Doc Number', dataIndex: 'docNumber' },
                          { header: 'Pay Item', dataIndex: 'payItem' },
                          { header: 'Vendor Number', dataIndex: 'vendorNumber' }
                         ]
            })
        });
    },

    /*
    Create a pop up window with a grid,
    the store includes records which are related to the selected item in drilldown.
    */
    popupApCheckDetails: function(record) {
        var me = this;
		me.record = record;

        var reload = function() {
            var vendorNumber = me.record.get('vendorNumber');
            var docType = me.record.get('docType');
            var docNumber = me.record.get('docNumber');
            var payItem = me.record.get('payItem');

            me.apCheckStore.removeAll();
            me.apCheckStore.load(vendorNumber, docType, docNumber, payItem);
        }

        if (!me.apCheckWin) {
            me.createCheckGrid();

            me.apCheckWin = new Ext.Window({
                modal: true,
                width: 830,
				resizable: false,
                closeAction: 'hide',
				title: '&nbsp;&nbsp;AP Check Details',
                items: [me.apCheckGrid]
            });
			
            me.apCheckWin.on('show', function() {
                reload();
            });
        }

        me.apCheckWin.show();
    }
});

$(window).resize(function() {

	Ext.getCmp('InvoiceGrid').setHeight($(window).height() - 175); 
});

WebLight.PageMgr.registerType('rev.apSearch', Rev.page.apSearch);

WebLight.Router.mapRoute('^rev/apSearch/main$', {
    xtype: 'rev.apSearch'
});