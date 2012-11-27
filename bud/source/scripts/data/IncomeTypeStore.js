/// <reference path="../Core.js" />

WebLight.namespace('Bud.data');

Bud.data.IncomeTypeStore = WebLight.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/bud/act/Provider.aspx',

    constructor: function (config) {
        config = Ext.apply(config || {}, { record: 'item',
            idProperty: '@fscAccount',
            fields: [
               { name: 'fscAccount', mapping: '@fscAccount', type: 'float' },
               { name: 'fscAccCode', mapping: '@fscAccCode', type: 'float' },
               { name: 'description', mapping: '@description' },
               { name: 'period1', mapping: '@period1', type: 'float' },
               { name: 'period2', mapping: '@period2', type: 'float' },
               { name: 'period3', mapping: '@period3', type: 'float' },
               { name: 'period4', mapping: '@period4', type: 'float' },
               { name: 'period5', mapping: '@period5', type: 'float' },
               { name: 'period6', mapping: '@period6', type: 'float' },
               { name: 'period7', mapping: '@period7', type: 'float' },
               { name: 'period8', mapping: '@period8', type: 'float' },
               { name: 'period9', mapping: '@period9', type: 'float' },
               { name: 'period10', mapping: '@period10', type: 'float' },
               { name: 'period11', mapping: '@period11', type: 'float' },
               { name: 'period12', mapping: '@period12', type: 'float' },
               { name: 'period13', mapping: '@period13', type: 'float' },
               { name: 'period14', mapping: '@period14', type: 'float' },
               { name: 'period15', mapping: '@period15', type: 'float' },
               { name: 'period16', mapping: '@period16', type: 'float' },
               { name: 'fiscalYear', mapping: '@fiscalYear', type: 'float' }
           ]
        });
        Bud.data.IncomeTypeStore.superclass.constructor.call(this, config);

        this.on({

            add: { fn: this.updateTotals },

            remove: { fn: this.updateTotals },

            update: { fn: this.updateTotals },

            datachanged: { fn: this.updateTotals }

        });

    },
    storeId: 'budIncomeTypes',

    getCriteria: function () {
        return { HcmHouseCode: this._HcmHouseCode, HcmJob: this._HcmJob, FiscalYear: this._FiscalYear };
    },

    _HcmHouseCode: 0,
    _HcmJob: 0,
    _FiscalYear: 0,

    setContext: function (HcmHouseCode, HcmJob, FiscalYear) {

        this._FiscalYear = FiscalYear;
        this._HcmHouseCode = HcmHouseCode;
        this._HcmJob = HcmJob;
    },


    load: function (HcmHouseCode, HcmJob, FiscalYear) {
        this.setContext(HcmHouseCode, HcmJob, FiscalYear);

        Bud.data.IncomeTypeStore.superclass.load.call(this);
    },

    updateTotals: function () {
        this.suspendEvents(false);

        var totalRecord = this.getAt(this.getCount() - 1);
        if (!totalRecord || totalRecord.get('fscAccount') != 0) {
            totalRecord = new this.recordType({ fscAccount: 0, description: 'Total', fscAccCode: 0 });
            this.add([totalRecord]);
        }

        for (var i = 0; i < this.getCount() - 1; i++)
            this.getAt(i).set('fiscalYear', this.getFiscalYearValue(this.getAt(i)));

        for (var i = 0; i < 17; i++) {
            totalRecord.set('period' + i, this.getColumnSummary('period' + i));
        }
        totalRecord.set('fiscalYear', this.getColumnSummary('fiscalYear'));

        this.resumeEvents();
    },

    getColumnSummary: function (column) {
        var summary = 0;
        for (var i = 0; i < this.getCount() - 1; i++) {
            summary += this.getAt(i).get(column);
        }
        return parseFloat(summary.toFixed(2));
    },

    getFiscalYearValue: function (record) {
        var summary = 0;
        for (var i = 1; i <= 16; i++) {
            summary += record.get('period' + i);
        }
        return summary;
    },

    loadSampleData: function () {
        this.loadData('<% import path="IncomeTypeSample.xml" %>');
    },

    addAttributes: function (data) {
        Ext.apply(data, { hcmHouseCode: this._HcmHouseCode, hcmJob: this._HcmJob, fiscalYear: this._FiscalYear });
    }

});
