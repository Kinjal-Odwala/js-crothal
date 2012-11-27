/// <reference path="../Core.js" />

WebLight.namespace('Bud.data');

Bud.data.XmlStore = WebLight.extend(WebLight.data.Store, {

    url: '/net/crothall/chimes/fin/bud/act/Provider.aspx',

    constructor: function (config) {
        config = config || {};
        var fields = config.fields || this.fields;
        var reader = config.reader || this.reader;
        var idProperty = config.idProperty || this.idProperty;
        if (!idProperty)
            idProperty = '@id';

        if (!reader && fields && fields.length) {
            reader = new Ext.data.XmlReader({ record: 'item', idProperty: idProperty }, fields);
            config.reader = reader;
            this.reader = reader;
        }

        Bud.data.XmlStore.superclass.constructor.call(this, config);
    },

    requestId: 2,
    moduleId: 'bud',
    targetId: 'iiCache',
    storeId: '',

    getStoreId: function () { return this.storeId; },

    getCriteria: function () {
        return {};
    },

    getRequestXml: function () {
        var arr = ['<criteria>'];
        var criteria = this.getCriteria();
        criteria = Ext.apply(criteria || {}, { storeId: this.getStoreId(), userId: 'RAYMOND-DEV-XP\\Raymond Liu' });

        for (i in criteria) {
            arr.push(String.format('{0}:{1},', i, criteria[i]));
        }

        arr.push('</criteria>');

        return arr.join('');
    },

    load: function (options) {

        this.setBaseParam('requestId', this.requestId);
        this.setBaseParam('moduleId', this.moduleId);
        this.setBaseParam('targetId', this.targetId);
        this.setBaseParam('requestXml', this.getRequestXml());

        Bud.data.XmlStore.superclass.load.call(this, {});
    },

    loadData: function (xml) {
        var doc;
        if (window.ActiveXObject) {
            doc = new ActiveXObject("Microsoft.XMLDOM");
            doc.async = "false";
            doc.loadXML(xml);
        } else {
            doc = new DOMParser().parseFromString(xml, "text/xml");
        }
        Bud.data.XmlStore.superclass.loadData.call(this, doc);
    },

    addAttributes: function (data) { },

    submitChanges: function (callback) {
        var current = this;
        this.fireEvent('beforesubmit', this);

        var xml = ['<transaction id="1">'];

        Ext.each(this.getChangedRecords(), function (item, index) {
            xml.push('<');
            xml.push(current.getStoreId().replace(/s$/, ''));
            current.addAttributes(item.data);
            for (key in item.data)
                xml.push(String.format(' {0}="{1}"', key, Ext.isDate(item.data[key]) ? Ext.util.Format.date(item.data[key], 'm/d/Y') : item.data[key]));

            xml.push('/>');
        }, this);

        xml.push('</transaction>');

        //        alert(xml.join(''));
        //        return false;

        var postData = String.format('moduleId={0}&requestId={1}&requestXml={2}&&targetId=iiTransaction',
            this.moduleId, this.requestId, xml.join(''));

        jQuery.post(this.url, postData, function (data, status) {
            //            if (status == 'success')
            //                this.fireEvent('submitchanges');
            //            else {
            //                alert('Failed');
            //                this.fireEvent('submitchanges');
            //            }
            if (callback)
                callback(data, status);
            current.fireEvent('submit');
        });
    }
});
