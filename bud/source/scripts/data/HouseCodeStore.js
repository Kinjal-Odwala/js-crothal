/// <reference path="../../references/jquery-1.4.1.js" />
/// <reference path="../ext-all-budget.js" />
/// <reference path="../../references/ext-jquery-adapter.js" />
/// <reference path="../../references/weblight4extjs.js" />

WebLight.namespace('Bud.data');

Bud.data.HouseCodeStore = WebLight.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/hcm/act/provider.aspx',

    moduleId: 'hcm',

    storeId: 'hcmHouseCodes',

    fields: [
               { name: 'id', mapping: '@id' },
               { name: 'name', mapping: '@name' },
               { name: 'number', mapping: '@number' },
               { name: 'brief', mapping: '@brief' },
               { name: 'appUnit', mapping: '@appUnit' },
               { name: 'hirNode', mapping: '@hirNode' }
           ]
});
