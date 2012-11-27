/// <reference path="../../references/jquery-1.4.1.js" />
/// <reference path="../ext-all-budget.js" />
/// <reference path="../../references/ext-jquery-adapter.js" />
/// <reference path="../../references/weblight4extjs.js" />

WebLight.namespace('Bud.data');

Bud.data.FiscalYearStore = WebLight.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/app/act/Provider.aspx',

    moduleId: 'fsc',
    storeId: 'fiscalYears',

    fields: [
               { name: 'id', mapping: '@id' },
               { name: 'title', mapping: '@title' }
           ]
});


Bud.data.FiscalPeriodStore = WebLight.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/app/act/Provider.aspx',

    moduleId: 'fsc',

    fiscalYearId: 0,
    storeId: 'fiscalPeriods', 

    getCriteria: function () {
        return { fiscalYearId: this.fiscalYearId };
    },

    fields: [
               { name: 'id', mapping: '@id' },
               { name: 'fiscalYearId', mapping: '@year' },
               { name: 'title', mapping: '@title' },
               { name: 'fiscalYear', mapping: '@fscYeaTitle' },
               { name: 'startDate', mapping: '@startDate', type: 'date', dateFormat: 'n/j/Y' },
               { name: 'endDate', mapping: '@endDate', type: 'date', dateFormat: 'n/j/Y' }
           ],
    load: function (fiscalYearId) {
        this.fiscalYearId = fiscalYearId;
        Bud.data.FiscalPeriodStore.superclass.load.call(this);
    }
});