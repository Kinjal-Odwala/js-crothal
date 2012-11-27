/// <reference path="../Core.js" />


WebLight.namespace('Bud.page');

Bud.page.BudgetPage = WebLight.extend(WebLight.Page, {

    _fscYear: 0,
    _fscYearTitle: '',
    _hcmHouseCode: 0,
    _hcmHouseCodeTitle: '',
    _hcmJob: 0,
    _hcmJobTitle: '',


    // obsolete methods
    getFiscalYearId: function () { return this._fscYear; },
    getFiscalYear: function () { return this._fscYearTitle; },
    getHouseCode: function () { return this._hcmHouseCode; },
    getJobCode: function () { return this._hcmJob; },

    getFscYear: function () { return this._fscYear; },
    getHcmHouseCode: function () { return this._hcmHouseCode; },
    getHcmJob: function () { return this._hcmJob; },
    getFscYearTitle: function () { return this._fscYearTitle; },
    getHcmHouseCodeTitle: function () { return this._hcmHouseCodeTitle; },
    getHcmJobTitle: function () { return this._hcmJobTitle; },

    setContext: function (hcmHouseCode, hcmJob, fscYear, hcmHouseCodeTitle, hcmJobTitle, fscYearTitle) {
        if (!hcmHouseCode || hcmHouseCode == ''
                || !hcmJob || hcmJob == ''
                || !fscYear || fscYear == ''
        )
            return;

        if (this._fscYear == fscYear && this._hcmHouseCode == hcmHouseCode && this._hcmJob == hcmJob)
            return;

        this._fscYearTitle = fscYearTitle;
        this._hcmHouseCode = hcmHouseCode;
        this._hcmJob = hcmJob;
        this._fscYear = fscYear;
        this._hcmHouseCodeTitle = hcmHouseCodeTitle;
        this._hcmJobTitle = hcmJobTitle;

        this.fireEvent('contextChanged');
    }
});