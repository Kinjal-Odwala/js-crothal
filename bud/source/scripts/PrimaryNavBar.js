/// <reference path="../references/jquery-1.4.1.js" />
/// <reference path="ext-all-budget.js" />
/// <reference path="../references/ext-jquery-adapter.js" />
/// <reference path="../references/weblight4extjs.js" />

WebLight.namespace('Bud');

Bud.PrimaryNavbarItem = Ext.extend(Ext.Button, {
    url: null,
    initComponent: function () {

        Bud.PrimaryNavbarItem.superclass.initComponent.call(this);

        if (!this.handler && this.url) {
            this.setHandler(function () {
                WebLight.Router.route(this.url);
            }, this);
        }

    }
});

Bud.PrimaryNavbar = Ext.extend(Ext.Toolbar, {
    initComponent: function () {
        var menuItems = [];

        menuItems.push(new Bud.PrimaryNavbarItem({ text: 'Start Budget', pattern: 'budget/startbudget', url: '/budget/startbudget' }));
        menuItems.push(new Bud.PrimaryNavbarItem({ text: 'Contract Billing', pattern: 'budget/contractbilling', url: '/budget/contractbilling' }));
        menuItems.push(new Bud.PrimaryNavbarItem({ text: 'Staffing', pattern: 'budget/staffing', url: '/budget/staffing' }));
        menuItems.push(new Bud.PrimaryNavbarItem({ text: 'Employee', pattern: 'budget/employee', url: '/budget/employee' }));
        menuItems.push(new Bud.PrimaryNavbarItem({ text: 'Mgt Hist', pattern: 'budget/mgthist', url: '/budget/mgthist' }));
        menuItems.push(new Bud.PrimaryNavbarItem({ text: 'Labor Calc', pattern: 'budget/laborcalculate', url: '/budget/laborcalculate' }));
        menuItems.push(new Bud.PrimaryNavbarItem({ text: 'Fnl Labor Calc', pattern: 'budget/fnllaborcalc', url: '/budget/fnllaborcalc' }));
        menuItems.push(new Bud.PrimaryNavbarItem({ text: 'Supply Exp', pattern: 'budget/supplyexp', url: '/budget/supplyexp' }));
        menuItems.push(new Bud.PrimaryNavbarItem({ text: 'Capital Exp', pattern: 'budget/capitalexp', url: '/budget/capitalexp' }));
        menuItems.push(new Bud.PrimaryNavbarItem({ text: 'Bgt Adj', pattern: 'budget/bgtadj', url: '/budget/bgtadj' }));
        menuItems.push(new Bud.PrimaryNavbarItem({ text: 'Bgt Details', pattern: 'budget/bgtdetails', url: '/budget/bgtdetails' }));
        menuItems.push(new Bud.PrimaryNavbarItem({ text: 'Bgt Summary', pattern: 'budget/bgtsummary', url: '/budget/bgtsummary' }));
        menuItems.push(new Bud.PrimaryNavbarItem({ text: 'Bgt Approval', pattern: 'budget/bgtapproval', url: '/budget/bgtapproval' }));

        this.items = menuItems;

        Bud.PrimaryNavbar.superclass.initComponent.call(this);

        var toggleActiveButton = function (url) {
            Ext.each(menuItems, function (item) {
                if (item.pattern) {
                    var regex = new RegExp(item.pattern, 'gi');
                    regex.test(url) ? item.addClass('x-btn-active') : item.removeClass('x-btn-active');
                }
            });
        };

        WebLight.PageMgr.on('load', function (url, page) {
            toggleActiveButton(url);
        });

        WebLight.PageMgr.on('resume', function (url, page) {
            toggleActiveButton(url);
        });
    }
});