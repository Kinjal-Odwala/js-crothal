/// <reference path="../../references/jquery-1.4.1.js" />
/// <reference path="../ext-all-budget.js" />
/// <reference path="../../references/ext-jquery-adapter.js" />
/// <reference path="../../references/weblight4extjs.js" />

WebLight.namespace('Bud.page');

Bud.page.BudgetApprovalPage = WebLight.extend(Bud.page.BudgetPage, {
    title: 'Bgt Approval',
    html: '<% import path="..\templates\bLayout.htm" %>',
    arrayStore: null,

    createChildControls: function () {
        this.arrayStore = new Ext.data.ArrayStore({
            fields: ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7']
        });

        var commentForm = new WebLight.form.FormPanel({
            labelWidth: 150, width: 800, border: false,
            items: [
                { xtype: 'textfield', fieldLabel: 'Send Email to', anchor: '100%' },
                { xtype: 'textarea', fieldLabel: 'Subject', anchor: '100%' },
                { xtype: 'textarea', fieldLabel: 'Contents', anchor: '100%' }
            ],
            buttons: [
                { ctCls: 'ux-button-1', text: 'Approve', handler: function () { } },
                { ctCls: 'ux-button-1', text: 'Reject', handler: function () { } }
            ]
        });

        var grid = new WebLight.grid.GridPanel({
            ctCls: 'ux-grid-1',
            store: this.arrayStore,
            autoHeight: true,
            viewConfig: {
                forceFit: true
            },
            cm: new Ext.grid.ColumnModel({
                defaults: { sortable: false },
                columns: [
                { header: 'Site Approved' },
                { header: 'Reginal Manager Approved', width: 200 },
                { header: 'Fiscal Year' },
                { header: 'Site' },
                { header: 'Comments', width: 300 },
                { header: 'Entered By' },
                { header: 'Date Entered' }
            ]
            })
        });

        this.addChildControl(Ext.create({
            xtype: 'box', html: '<h2 class="page-title">Budget Approval</h2>'
        }), 'container');
        this.addChildControl(Ext.create({
            xtype: 'box', html: '<br /><div style="width: 500px;">When Approving the Fiscal Year Budget, \
            all sections of the budget process will be locked down. \
            You will still be able to view the data that was entered, \
            but nont able to change the data. Please ensure that the data \
            is entered correctly before approving the budget.<br />\
            <br />please provid Comments before choosing Budget status.</div><br /><br />'
        }), 'container');
        this.addChildControl(commentForm, 'container');

        this.addChildControl(grid, 'container');

        Bud.page.BudgetApprovalPage.superclass.createChildControls.call(this);
    },
    dataBind: function () {
        this.arrayStore.loadData(Bdg.store.Approval);
        Bud.page.BudgetApprovalPage.superclass.dataBind.call(this);
    }
});

WebLight.PageMgr.registerType('budgetapproval', Bud.page.BudgetApprovalPage);