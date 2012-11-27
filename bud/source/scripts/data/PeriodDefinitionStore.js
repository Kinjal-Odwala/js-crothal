/// <reference path="../../references/jquery-1.4.1.js" />
/// <reference path="../ext-all-budget.js" />
/// <reference path="../../references/ext-jquery-adapter.js" />
/// <reference path="../../references/weblight4extjs.js" />

WebLight.namespace('Bud.data');

Bud.data.PeriodDefinitionStore = WebLight.extend(Ext.data.XmlStore, {

    constructor: function (config) {
        config = Ext.apply(config || {}, { record: 'item',

            fields: [
               { name: 'id', mapping: '@id', type: 'float' },
               { name: 'fiscalYear', mapping: '@fiscalYear', type: 'float' },
               { name: 'period', mapping: '@period',type:'float' },
               { name: 'startDate', mapping: '@startDate', type: 'date', dateFormat: 'Y-m-d H:i:s' },
               { name: 'endDate', mapping: '@endDate', type: 'date', dateFormat:'Y-m-d H:i:s' }
           ]
        });
        Bud.data.PeriodDefinitionStore.superclass.constructor.call(this, config);

    },

    loadSampleData: function () {
        var xml = '<% import path="PeriodDefinitionSample.xml" %>';
        var doc;
        if (window.ActiveXObject) {
            doc = new ActiveXObject("Microsoft.XMLDOM");
            doc.async = "false";
            doc.loadXML(xml);
        } else {
            doc = new DOMParser().parseFromString(xml, "text/xml");
        }
        this.loadData(doc);
    }
});