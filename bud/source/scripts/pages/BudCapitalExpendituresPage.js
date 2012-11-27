/// <reference path="../references/jquery-1.4.1.js" />
/// <reference path="ext-all-budget.js" />
/// <reference path="../references/ext-jquery-adapter.js" />
/// <reference path="../references/weblight4extjs.js" />

WebLight.namespace('Bud.page');

Bud.page.CapitalExpendituresPage = WebLight.extend(Bud.page.BudgetPage, {
    title: 'Capital Exp',
    html: '<% import path="..\templates\bLayout.htm" %>',
    arrayStore: null,
    arrayStore1: null,
    arrayStore2: null,
    arrayStore3: null,
    arrayStore4: null,

    createChildControls: function () {
        this.arrayStore = new Ext.data.ArrayStore({
            fields: ['field1', 'field2', 'field3', 'field4', 'field5', 'field6']
        });

        this.arrayStore1 = new Ext.data.ArrayStore({
            fields: ['field1', 'field2', 'field3', 'field4', 'field5']
        });

        this.arrayStore2 = new Ext.data.ArrayStore({
            fields: ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7', 'field8', 'field9', 'field10', 'field11', 'field12', 'field13', 'field14', 'field15', ]
        });
        this.arrayStore3 = new Ext.data.ArrayStore({
            fields: ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7', 'field8', 'field9', 'field10', 'field11', 'field12', 'field13', 'field14', 'field15', ]
        });
         this.arrayStore4 = new Ext.data.ArrayStore({
            fields: ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7', 'field8', 'field9', 'field10', 'field11', 'field12', 'field13', 'field14', 'field15', ]
        });


        var capitalExpSelect = new Ext.Panel({
            header: false,
            border: false,
            autoHeight: true,
            bodyStyle: 'border-bottom:2px solid #336600;margin:10px 0;padding:10px;',
            items: [
                    { xtype: 'radiogroup', columns: 2, vertical: true, items: [
                        { boxLabel: 'I.New Capital Equipment Worksheet', name: 'cb-custwidth', inputValue: 1, checked: true },
                        { boxLabel: 'II.Capital Equipment Disposal Worksheet', name: 'cb-custwidth', inputValue: 2 },
                        { boxLabel: 'III.Depreciation Worksheet', name: 'cb-custwidth', inputValue: 3 },
                        { boxLabel: 'IV.Depreciation Disposal Worksheet', name: 'cb-custwidth', inputValue: 4 }
                    ],
                        listeners: {
                            'change': function (obj, checked) {
                                var v = checked.getRawValue();
                                var arr = ['I', 'II', 'III', 'IV'];
                                for (var i = 0; i < arr.length; i++) {
                                    if (i + 1 == parseInt(v)) {
                                        eval('gridTitle' + arr[i] + '.show()');
                                        eval('grid' + arr[i] + '.show()');
                                    }
                                    else {
                                        eval('gridTitle' + arr[i] + '.hide()');
                                        eval('grid' + arr[i] + '.hide()');
                                    }
                                }
                            }
                        }
                    }
                ]
        });

        var gridI = new WebLight.grid.GridPanel({
            ctCls: 'ux-grid-1',
            title:'New Capital Equipment',
            store: this.arrayStore,
            autoHeight: true,
            viewConfig: {
                forceFit: true
            },
            cm: new Ext.grid.ColumnModel({
                defaults: { sortable: false },
                columns: [
                    { header: 'Equipment Description', width: 150 },
                    { header: 'Period' },
                    { header: 'Cost' },
                    { header: 'Estimated Useful Life (Years)' },
                    { header: 'Depreciation Per Period', width: 150 },
                    { header: 'Justification' }
                ]
            })
        });

        var gridII = new WebLight.grid.GridPanel({
            title:'capital Equipment Disposal Worksheet',
            ctCls: 'ux-grid-1', 
            store: this.arrayStore1,
            autoHeight: true,
            viewConfig: {
                forceFit: true
            },
            cm: new Ext.grid.ColumnModel({
                defaults: { sortable: false },
                columns: [
                    { header: 'Equipment Description', width: 150 },
                    { header: 'Period Disposed' },
                    { header: 'Book Value' },
                    { header: 'Period Description' },
                    { header: 'Justification', width: 150 }
                ]
            })
        });

        var textboxRenderer = function (value) {
            return '\
                <div class="x-form-field-wrap x-form-field-trigger-wrap x-trigger-wrap-focus " style="width: 70px; height:20px">\
                <input type="text" autocomplete="off" size="24" value="' + (value || '') + '"\
                class=" x-form-text x-form-field x-form-focus" \
                style="width: 40px; height:16px" />\
                </div>';
        }

        var gridIII = new Ext.Panel({
            title:'Deprecation Worksheet',
            ctCls: 'ux-grid-1', header: false,
            border: false,
            autoHeight: true,
            viewConfig: {
                forceFit: true
            },
            items: [
                new WebLight.grid.GridPanel({
                    ctCls: 'ux-grid-1',
                    store: this.arrayStore2,
                    autoHeight: true,
                    viewConfig: {
                        forceFit: true
                    },
                    cm: new Ext.grid.ColumnModel({
                        defaults: { sortable: false },
                        columns: [
                            { header: 'Equipment Description', width: 150 },
                            { header: 'Period 1', width: 60 },
                            { header: 'Period 2', width: 60 },
                            { header: 'Period 3', width: 60 },
                            { header: 'Period 4', width: 60 },
                            { header: 'Period 5', width: 60 },
                            { header: 'Period 6', width: 60 },
                            { header: 'Period 7', width: 60 },
                            { header: 'Period 8', width: 60 },
                            { header: 'Period 9', width: 60 },
                            { header: 'Period 10', width: 60 },
                            { header: 'Period 11', width: 60 },
                            { header: 'Period 12', width: 60 },
                            { header: 'Period 13', width: 60 },
                            { header: 'Total', width: 60 }
                        ]
                    })
                })
                , new WebLight.grid.GridPanel({
                    ctCls: 'ux-grid-1',
                    store: this.arrayStore3,
                    autoHeight: true,
                    viewConfig: {
                        forceFit: true
                    },
                    cm: new Ext.grid.ColumnModel({
                        defaults: { sortable: false },
                        columns: [
                            { header: 'Equipment Description', width: 150 },
                            { header: 'Period 1', width: 60, renderer: textboxRenderer },
                            { header: 'Period 2', width: 60, renderer: textboxRenderer },
                            { header: 'Period 3', width: 60, renderer: textboxRenderer },
                            { header: 'Period 4', width: 60, renderer: textboxRenderer },
                            { header: 'Period 5', width: 60, renderer: textboxRenderer },
                            { header: 'Period 6', width: 60, renderer: textboxRenderer },
                            { header: 'Period 7', width: 60, renderer: textboxRenderer },
                            { header: 'Period 8', width: 60, renderer: textboxRenderer },
                            { header: 'Period 9', width: 60, renderer: textboxRenderer },
                            { header: 'Period 10', width: 60, renderer: textboxRenderer },
                            { header: 'Period 11', width: 60, renderer: textboxRenderer },
                            { header: 'Period 12', width: 60, renderer: textboxRenderer },
                            { header: 'Period 13', width: 60, renderer: textboxRenderer },
                            { header: 'Total', width: 60, renderer: textboxRenderer }
                        ]
                    })
                })
                ]
        });

        var gridIV = new WebLight.grid.GridPanel({
            title:'Depreciation Disposal Worksheet',
            ctCls: 'ux-grid-1', 
            store: this.arrayStore4,
            autoHeight: true,
            viewConfig: {
                forceFit: true
            },
            cm: new Ext.grid.ColumnModel({
                defaults: { sortable: false },
                columns: [
                    { header: 'Equipment Description', width: 150 },
                    { header: 'Period 1', width: 60 },
                    { header: 'Period 2', width: 60 },
                    { header: 'Period 3', width: 60 },
                    { header: 'Period 4', width: 60 },
                    { header: 'Period 5', width: 60 },
                    { header: 'Period 6', width: 60 },
                    { header: 'Period 7', width: 60 },
                    { header: 'Period 8', width: 60 },
                    { header: 'Period 9', width: 60 },
                    { header: 'Period 10', width: 60 },
                    { header: 'Period 11', width: 60 },
                    { header: 'Period 12', width: 60 },
                    { header: 'Period 13', width: 60 },
                    { header: 'Total', width: 60 }
                ]
            })
        });

        this.addChildControl(Ext.create({
            xtype: 'box', html: '<h2 class="page-title">Capital Expenditures</h2>'
        }), 'container');

        var tabs = new Ext.TabPanel({
            activeTab: 0,
            border: false,
            ctCls: 'ux-tab-1',
            autoHeight: true,
            items: [gridI, gridII, gridIII, gridIV]
        });

        this.addChildControl(tabs, 'container');

        //this.addChildControl(capitalExpSelect, 'container');

        this.addChildControl(gridTitleI = Ext.create({
            xtype: 'box', html: '<h2 class="page-sub-title">New Capital Equipment Worksheet</h2>'
        }), 'container');
        this.addChildControl(gridI, 'container');

        this.addChildControl(gridTitleII = Ext.create({
            hidden: true, xtype: 'box', html: '<h2 class="page-sub-title">Capital Equipment Disposal Worksheet</h2>'
        }), 'container');
        this.addChildControl(gridII, 'container');

        this.addChildControl(gridTitleIII = Ext.create({
            hidden: true, xtype: 'box', html: '<h2 class="page-sub-title">Depreciation Worksheet</h2>'
        }), 'container');
        this.addChildControl(gridIII, 'container');

        this.addChildControl(gridTitleIV = Ext.create({
            hidden: true, xtype: 'box', html: '<h2 class="page-sub-title">Depreciation Disposal Worksheet</h2>'
        }), 'container');
        this.addChildControl(gridIV, 'container');

        Bud.page.CapitalExpendituresPage.superclass.createChildControls.call(this);
    },
    dataBind: function () {
        this.arrayStore.loadData(Bdg.store.Captial);
        this.arrayStore1.loadData(Bdg.store.Captial1);
        this.arrayStore2.loadData(Bdg.store.Captial2);
        this.arrayStore3.loadData(Bdg.store.Captial3);
        this.arrayStore4.loadData(Bdg.store.Captial4);

        Bud.page.CapitalExpendituresPage.superclass.dataBind.call(this);
    }
});

WebLight.PageMgr.registerType('capitalexpenditures', Bud.page.CapitalExpendituresPage);
