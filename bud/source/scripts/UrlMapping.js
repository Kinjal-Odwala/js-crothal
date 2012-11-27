/// <reference path="../references/jquery-1.4.1.js" />
/// <reference path="ext-all-budget.js" />
/// <reference path="../references/ext-jquery-adapter.js" />
/// <reference path="../references/weblight4extjs.js" />

WebLight.Router.mapRoute('^budget/startbudget$', {
    xtype: 'startbudget'
});
WebLight.Router.mapRoute('^budget/contractbilling$', {
    xtype: 'contractbilling'
});
WebLight.Router.mapRoute('^budget/staffing$', {
    xtype: 'staffing'
});
WebLight.Router.mapRoute('^budget/employee$', {
    xtype: 'employee'
});
WebLight.Router.mapRoute('^budget/mgthist$', {
    xtype: 'managementhistory'
});
WebLight.Router.mapRoute('^budget/laborcalculate$', {
    xtype: 'laborcalculations'
});
WebLight.Router.mapRoute('^budget/fnllaborcalc$', {
    xtype: 'finallaborcalculations'
});
WebLight.Router.mapRoute('^budget/supplyexp$', {
    xtype: 'supplyexpenditures'
});
WebLight.Router.mapRoute('^budget/capitalexp$', {
    xtype: 'capitalexpenditures'
});
WebLight.Router.mapRoute('^budget/bgtadj$', {
    xtype: 'budgetadjustments'
});
WebLight.Router.mapRoute('^budget/bgtdetails$', {
    xtype: 'budgetdetails'
});
WebLight.Router.mapRoute('^budget/bgtsummary$', {
    xtype: 'budgetsummary'
});
WebLight.Router.mapRoute('^budget/bgtapproval$', {
    xtype: 'budgetapproval'
});