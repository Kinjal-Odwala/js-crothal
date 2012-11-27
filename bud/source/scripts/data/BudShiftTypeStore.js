/// <reference path="XmlStore.js" />

Bud.data.BudShiftTypeStore = Ext.extend(Bud.data.XmlStore, {

    fields: [
               { name: 'id', mapping: '@id', type: 'float' },
               { name: 'title', mapping: '@title' }
           ],
    loadSampleData: function () {
        this.loadData('<% import path="BudShiftTypeSample.xml" %>');
    }

});