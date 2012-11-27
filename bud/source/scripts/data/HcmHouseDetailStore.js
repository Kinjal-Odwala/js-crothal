/// <reference path="../Core.js" />

WebLight.namespace('Bud.data');

Bud.data.HcmHouseDetailStore = WebLight.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/hcm/act/provider.aspx',

    moduleId: 'hcm',

    storeId: 'houseCodes',

    getCriteria: function () {
        return { houseCode: this.houseCode };
    },

    load: function (houseCode) {
        this.houseCode = houseCode;
        Bud.data.HcmHouseDetailStore.superclass.load.call(this);
    },

    fields: [
               { name: 'id', mapping: '@id', type: 'float' },
               { name: 'contractTypeId', mapping: '@contractTypeId', type:'float' },
               { name: 'billingCycleFrequencyTypeId', mapping: '@billingCycleFrequencyTypeId', type: 'float' }
           ]
});
