/// <reference path="XmlStore.js" />

Bud.data.BudStaffingHourStore = Ext.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/bud/act/Provider.aspx',

    moduleId: 'bud',

    storeId: 'budStaffingHours',

    getCriteria: function () {
        return { hcmHouseCode: this._hcmHouseCode, hcmJob: this._hcmJob, fscYear: this._fscYear, budShiftType: this._budShiftType };
    },

    _hcmHouseCode: 0,
    _hcmJob: 0,
    _fscYear: 0,
    _budShiftType: 0,

    constructor: function (config) {
        Bud.data.BudStaffingHourStore.superclass.constructor.call(this, config);
        this.on({

            add: { fn: this.updateTotals },

            remove: { fn: this.updateTotals },

            update: { fn: this.updateTotals },

            datachanged: { fn: this.updateTotals }

        });
    },

    updateTotals: function () {
        this.suspendEvents(false);

        for (var i = 0; i < this.getCount(); i++) {
            var r = this.getAt(i);
            r.set('currentTotal', r.get('currentMonday') + r.get('currentTuesday')
                    + r.get('currentWednesday') + r.get('currentThursday')
                    + r.get('currentFriday') + r.get('currentSaturday') + r.get('currentSunday'));

            r.set('proposedTotal', r.get('proposedMonday') + r.get('proposedTuesday')
                    + r.get('proposedWednesday') + r.get('proposedThursday')
                    + r.get('proposedFriday') + r.get('proposedSaturday') + r.get('proposedSunday'));
        }

        this.resumeEvents();
    },

    load: function (hcmHouseCode, hcmJob, fscYear, budShiftType) {

        this._fscYear = fscYear;
        this._hcmHouseCode = hcmHouseCode;
        this._hcmJob = hcmJob;
        this._budShiftType = budShiftType;

        Bud.data.BudStaffingHourStore.superclass.load.call(this);
    },

    addAttributes: function (data) {
        Ext.apply(data, { hcmHouseCode: this._hcmHouseCode, hcmJob: this._hcmJob, fscYear: this._fscYear, budShiftType: this._budShiftType });
    },

    fields: [
     { name: 'id', mapping: '@id', type: 'float' },
     { name: 'hcmHouseCode', mapping: '@hcmHouseCode', type: 'float' },
     { name: 'hcmJob', mapping: '@hcmJob', type: 'float' },
     { name: 'fscYear', mapping: '@fscYear', type: 'float' },
     { name: 'budShiftType', mapping: '@budShiftType', type: 'float' },
     { name: 'unit', mapping: '@unit' },
     { name: 'currentMonday', mapping: '@currentMonday', type: 'float' },
     { name: 'currentTuesday', mapping: '@currentTuesday', type: 'float' },
     { name: 'currentWednesday', mapping: '@currentWednesday', type: 'float' },
     { name: 'currentThursday', mapping: '@currentThursday', type: 'float' },
     { name: 'currentFriday', mapping: '@currentFriday', type: 'float' },
     { name: 'currentSaturday', mapping: '@currentSaturday', type: 'float' },
     { name: 'currentSunday', mapping: '@currentSunday', type: 'float' },
     { name: 'currentHolidays', mapping: '@currentHolidays', type: 'float' },
     { name: 'proposedMonday', mapping: '@proposedMonday', type: 'float' },
     { name: 'proposedTuesday', mapping: '@proposedTuesday', type: 'float' },
     { name: 'proposedWednesday', mapping: '@proposedWednesday', type: 'float' },
     { name: 'proposedThursday', mapping: '@proposedThursday', type: 'float' },
     { name: 'proposedFriday', mapping: '@proposedFriday', type: 'float' },
     { name: 'proposedSaturday', mapping: '@proposedSaturday', type: 'float' },
     { name: 'proposedSunday', mapping: '@proposedSunday', type: 'float' },
     { name: 'proposedHolidays', mapping: '@proposedHolidays', type: 'float' },
     { name: 'currentTotal', type: 'float' },
     { name: 'proposedTotal', type: 'float' }
    ],

    newRecord: function (data) {
        data = data || {};

        Ext.applyIf(data, { unit:'New Unit',
            currentMonday: 0, currentTuesday: 0, currentWednesday: 0, currentThursday: 0,
            currentFriday: 0, currentSaturday: 0, currentSunday: 0, currentHolidays: 0,
            proposedMonday: 0, proposedTuesday: 0, proposedWednesday: 0, proposedThursday: 0,
            proposedFriday: 0, proposedSaturday: 0, proposedSunday: 0, proposedHolidays: 0
        });

        return Bud.data.BudStaffingHourStore.superclass.newRecord.call(this, data);
    }

});