/// <reference path="../Core.js" />

WebLight.namespace('Bud.data');

Bud.data.BudBillingPeriodStore = WebLight.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/bud/act/Provider.aspx',

    moduleId: 'bud',

    storeId: 'budBillingPeriods',

    getCriteria: function () {
        return { HcmHouseCode: this._HcmHouseCode, HcmJob: this._HcmJob, FiscalYear: this._FiscalYear };
    },

    _HcmHouseCode: 0,
    _HcmJob: 0,
    _FiscalYear: 0,

    load: function (HcmHouseCode, HcmJob, FiscalYear) {

        this._FiscalYear = FiscalYear;
        this._HcmHouseCode = HcmHouseCode;
        this._HcmJob = HcmJob;

        Bud.data.BudBillingPeriodStore.superclass.load.call(this);
    },

    addAttributes: function (data) {
        Ext.apply(data, { HcmHouseCode: this._HcmHouseCode, HcmJob: this._HcmJob, FiscalYear: this._FiscalYear });
    },


    fields: [
               { name: 'id', mapping: '@id', type: 'float' },
               { name: 'hcmHouseCode', mapping: '@hcmHouseCode', type: 'float' },
               { name: 'fiscalYear', mapping: '@fiscalYear', type: 'float' },
               { name: 'hcmJob', mapping: '@hcmJob', type: 'float' },
               { name: 'rate', mapping: '@rate', type: 'float' },
               { name: 'percentIncrease', mapping: '@percentIncrease', type: 'float' },
               { name: 'dateEffective', mapping: '@dateEffective', dateFormat: 'n/j/Y' },
               { name: 'description', mapping: '@description' }
           ]
});
