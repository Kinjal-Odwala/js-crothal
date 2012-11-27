/*


VacationDays	float
DueIncrease bit
DifferentialPayRate float
OtherPayRate float

FscPeriodOfIncrease int

TypeMeritPromotion varchar(1)
FiscalIncrease float
MeritIncrease bit
LastIncreaseDate datetime



*/

/// <reference path="../Core.js" />

WebLight.namespace('Bud.data');

Bud.data.EmployeeLockStore = WebLight.extend(Bud.data.XmlStore, {

    constructor: function (config) {
        config = Ext.apply(config || {}, { record: 'item',
            idProperty: '@id',
            fields: [
               { name: 'id', mapping: '@id', type: 'int' },
               { name: 'fullname', mapping: '@fullname' },
               { name: 'yearOfService', mapping: '@yearOfService', type: 'int' },
               { name: 'vacationDays', mapping: '@vacationDays', type: 'float' },
               { name: 'dueIncrease', mapping: '@dueIncrease', type: 'bool' },
               { name: 'baseWageRute', mapping: '@baseWageRute', type: 'float' },
               { name: 'differentialPayRate', mapping: '@differentialPayRate', type: 'float' },
               { name: 'otherPayRate', mapping: '@otherPayRate', type: 'float' },
               { name: 'totalCurrentWageRatePerHour', mapping: '@totalCurrentWageRatePerHour', type: 'float' },
               { name: 'hoursWorkedPerPayPeriod', mapping: '@hoursWorkedPerPayPeriod', type: 'float' },
               { name: 'costPerPayPeriod', mapping: '@costPerPayPeriod', type: 'float' },
               { name: 'costBeforeDifferential', mapping: '@costBeforeDifferential', type: 'float' },
               { name: 'fscPeriodOfIncrease', mapping: '@fscPeriodOfIncrease', type: 'float' },
               { name: 'typeMeritPromotion', mapping: '@typeMeritPromotion', type: 'float' },
               { name: 'fiscalIncrease', mapping: '@fiscalIncrease', type: 'float' },
               { name: 'mritIncrease', mapping: '@mritIncrease', type: 'float' },
               { name: 'lastIncreaseDate', mapping: '@lastIncreaseDate', type: 'date', dateFormat: 'Y-m-d H:i:s' },
               { name: 'annual', mapping: '@annual', type: 'float' }
           ]
        });
        Bud.data.EmployeeLockStore.superclass.constructor.call(this, config);

        this.on({

            add: { fn: this.updateTotals },

            remove: { fn: this.updateTotals },

            update: { fn: this.updateTotals },

            datachanged: { fn: this.updateTotals }

        });

    },
    storeId: 'budEmployeeLock',

    loadSampleData: function () {
        this.loadData('<% import path="BudEmployeeLockSample.xml" %>');
    }
});