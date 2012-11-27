/// <reference path="../../references/jquery-1.4.1.js" />
/// <reference path="../../references/ext-jquery-adapter.js" />
/// <reference path="../../references/ext-all.js" />
/// <reference path="../../references/weblight4extjs.js" />

WebLight.namespace('Bud.page');

Bud.page.StartBudgetPage = WebLight.extend(Bud.page.BudgetPage, {
    title: 'Start Budget',
    html: '<% import path="..\templates\startBudget.htm" %>',

    createChildControls: function () {
        this.addChildControl(new Ext.Button({ ctCls: 'ux-button-1', text: 'Add New Budget', width: 120 }), 'add-new-budget-button');

        Bud.page.StartBudgetPage.superclass.createChildControls.call(this);
    }
});

WebLight.PageMgr.registerType('startbudget', Bud.page.StartBudgetPage);
