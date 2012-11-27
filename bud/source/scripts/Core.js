/// <reference path="../references/jquery-1.4.1.js" />
/// <reference path="ext-all-budget.js" />
/// <reference path="../references/ext-jquery-adapter.js" />
/// <reference path="../references/weblight4extjs.js" />


jQuery.ajaxSettings.contentType = 'application/x-www-form-urlencoded; charset=utf-8';

WebLight.namespace('Bud', 'Bud.form');

Bud.Context = {
    userId: 'RAYMOND-DEV-XP\\Raymond+Liu'
};

Bud.form.DropdownList = Ext.extend(Ext.form.ComboBox, {
    mode: 'local',
    forceSelection: true,
    triggerAction: 'all',
    selectOnFocus: true,
    editable: false,
    layzeInit: false,
    typeAhead: true,
    allowBlank: false,
    initComponent: function () {
        Bud.form.DropdownList.superclass.initComponent.call(this);
    },
    setValue: function (v) {
        var oldValue = this.value;
        this.innerValue = v;
        Bud.form.DropdownList.superclass.setValue.call(this, v);

        if (oldValue != v)
            this.fireEvent('valuechange', v);

        return this;
    }
});
