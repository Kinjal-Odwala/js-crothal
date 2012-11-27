/// <reference path="../Core.js" />

WebLight.namespace('Bud.data');

Bud.data.JobCodeStore = WebLight.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/app/act/Provider.aspx',

    moduleId: 'hcm',

    idProperty: '@jobId',

    fields: [
               { name: 'id', mapping: '@id' },
               { name: 'jobTitle', mapping: '@jobTitle' },
               { name: 'jobDescription', mapping: '@jobDescription' },
               { name: 'jobNumber', mapping: '@jobNumber' },
               { name: 'houseCodeId', mapping: '@houseCodeId' },
               { name: 'jobId', mapping: '@jobId' }
           ],
    storeId: 'houseCodeJobs',

    getCriteria: function () {
        return {  houseCodeId: this.houseCodeId };
    },

    load: function (houseCode) {
        this.houseCodeId = houseCode;
        Bud.data.JobCodeStore.superclass.load.call(this);
    }
});
