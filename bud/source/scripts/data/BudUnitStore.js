/// <reference path="../Core.js" />

WebLight.namespace('Bud.data');

Bud.data.BudUnitStore = WebLight.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/bud/act/Provider.aspx',

    moduleId: 'bud',
    storeId: 'budUnits',


    fields: [
               { name: 'id', mapping: '@id' },
               { name: 'name', mapping: '@name' },
               { name: 'number', mapping: '@number' },
               { name: 'brief', mapping: '@brief' },
               { name: 'appUnit', mapping: '@appUnit' },
               { name: 'hirNode', mapping: '@hirNode' }
           ]
});
