
paf.factory('EmpActions', ["$http", "$filter", function ($http, $filter) {
    var CarAllowances = [
        { Id: '425', Description: '425/month' },
        { Id: '500', Description: '500/month' },
        { Id: '600', Description: '600/month' },
        { Id: '900', Description: '900/month' }];

    var houseCodes = null;
    var stateTypes = null;
    var personActionTypes = null;
    var jobCodes = null;

    var apiRequest = function (moduleId, requestXml, callback) {
        //$.ajax({
        //    type: "POST",
        //    dataType: "xml",
        //    url: "/net/crothall/chimes/fin/" + moduleId + "/act/provider.aspx",
        //    data: "moduleId=" + moduleId + "&requestId=1&targetId=iiCache"
        //        + "&requestXml=" + encodeURIComponent(requestXml),
        //    success: function (xml) {
        //        if (callback)
        //            callback(xml);
        //    }
        //});
        $http({
            method: 'POST',
            url: '/net/crothall/chimes/fin/' + moduleId + '/act/Provider.aspx',
            data: "moduleId=" + moduleId + "&requestId=1&targetId=iiCache"
                + "&requestXml=" + encodeURIComponent(requestXml),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        }).success(function (result) {
            callback(result);
        })
        .error(function (error) {

        });
    }

    var getEmployeePersonnelActions = function (callback) {

        apiRequest('emp', '<criteria>storeId:employeePersonnelActions,userId:[user] ,</criteria>', function (xml) {
            if (callback)
                callback(deserializeXml(xml, 'item', { upperFirstLetter: true }));
        });

    }

    var findEmployeePersonnelAction = function (id, callback) {
        var boolItems = ["NewHire", "ReHire", "Separation", "LOA", "SalaryChange", "Promotion", "Demotion", "Transfer", "PersonalInfoChange", "Relocation"];
        var intItems = ["HcmHouseCode", "EmployeeNumber", "StateType", "PositionType", "TrainingLocation", "Duration", "CarAllowance", "BonusEligibleType", "LayoffType", "OldPositionType", "NewPositionType", "ChangeReasonType", "NewCarAllowance", "NewBonusEligibleType", "HouseCodeTransfer", "InfoChangeStateType", "RelocationPlan"];
        apiRequest('emp', '<criteria>storeId:employeePersonnelActions,userId:[user]' + ",id:" + id + ',</criteria>', function (xml) {
            if (callback)
                callback(deserializeXml(xml, 'item', { upperFirstLetter: true, boolItems: boolItems, intItems: intItems })[0]);
        });
    }

    var getHcmHouseCodes = function (callback) {

        var criteriaXml = '<criteria>appUnitBrief:,storeId:hcmHouseCodes,userId:[user],</criteria>';

        var data = 'moduleId=hcm&requestId=1&requestXml=' + encodeURIComponent(criteriaXml) + '&targetId=iiCache';

        if (houseCodes) {
            callback(houseCodes);
            return;
        }

        apiRequest('hcm', criteriaXml, function (xml) {
            houseCodes = deserializeXml(xml, 'item', { upperFirstLetter: false });
            if (callback)
                callback(houseCodes);
        });
    }

    var getHouseCodeName = function (id) {
        if (houseCodes == null)
            return '';

        var houseCodeName = 'N/A';

        angular.forEach(houseCodes, function (item, index) {
            if (item.id == id) {
                houseCodeName = item.name;
            }
        });

        return houseCodeName;
    }

    var getHcmHouseCodeByBrief = function (brief) {
        if (houseCodes == null)
            return '';

        var hcmHouseCode = 0;

        angular.forEach(houseCodes, function (item, index) {
            if (item.brief == brief) {
                hcmHouseCode = item.id;
            }
        });

        return hcmHouseCode;
    }

    var getStateTypes = function (callback) {

        if (stateTypes) {
            callback(stateTypes);
            return;
        }
        apiRequest('emp', '<criteria>storeId:stateTypes,userId:[user],</criteria>', function (xml) {
            stateTypes = deserializeXml(xml, 'item', { upperFirstLetter: false });
            if (callback)
                callback(stateTypes);
        });
    }

    var getEmployee = function (employeeNumber, hcmHouseCode, callback) {

        apiRequest('emp', '<criteria>storeId:employeeSearchs,userId:[user]'
                             + ',searchValue:' + employeeNumber
                             + ',hcmHouseCodeId:' + hcmHouseCode
                             + ',employeeType:SearchFull,filterType:Employee Number'
                + ',</criteria>', function (xml) {
                    if (callback)
                        callback(deserializeXml(xml, 'item', { upperFirstLetter: false })[0]);
                });
    }

    var getPerson = function (employeeId, callback) {

        apiRequest('emp', '<criteria>storeId:persons,userId:[user]'
                    + ',id:' + employeeId
                    + ',</criteria>', function (xml) {
                        if (callback)
                            callback(deserializeXml(xml, 'item', { upperFirstLetter: false })[0]);
                    });
    }

    var getCarAllowances = function () {
        return CarAllowances;
    }

    var getJobCodes = function (callback) {
        if (jobCodes) {
            callback(jobCodes);
            return;
        }
        apiRequest('emp', '<criteria>storeId:jobCodes,userId:[user],</criteria>', function (xml) {
            jobCodes = deserializeXml(xml, 'item', { upperFirstLetter: false });
            if (callback)
                callback(jobCodes);
        });
    }

    var getPersonActionTypes = function (callback) {

        if (personActionTypes) {
            callback(personActionTypes);
            return;
        }

        apiRequest('emp', '<criteria>storeId:personnelActionTypes,userId:[user],</criteria>', function (xml) {
            personActionTypes = deserializeXml(xml, 'item', { upperFirstLetter: false });
            if (callback)
                callback(personActionTypes);
        });
    }

    var saveEmployeePersonnelAction = function (employeePersonnelAction, callback) {

        var xml = ['<transaction id="1">\r\n<employeePersonnelAction '];
        var xmlNode = [];
        angular.forEach(employeePersonnelAction, function (value, key) {
            key = lowercaseFirstLetter(key);

            if (value == null || !angular.isDefined(value))
                value = ""
                //else if (value == true)
                //    value = "1";
                //else if (value == false)
                //    value = "0";
            else if (angular.isDate(value)) {
                value = $filter('date')(value, "MM/dd/yyyy");
            }


            xmlNode.push(key + '=' + '"' + value + '"');
        });
        xml.push(xmlNode.join(' '));

        xml.push('/>\r\n</transaction>');

        var data = 'moduleId=emp&requestId=1&requestXml=' + encodeURIComponent(xml.join(' ')) + '&&targetId=iiTransaction';

        jQuery.post('/net/crothall/chimes/fin/emp/act/Provider.aspx', data, function (data, status) {
            if (callback)
                callback(data, status);
        });
        //apiRequest('emp', encodeURIComponent(xml.join(' ')), function (result) {
        //    if (callback)
        //        callback(result);
        //});
    }

    return {
        getEmployeePersonnelActions: getEmployeePersonnelActions,
        findEmployeePersonnelAction: findEmployeePersonnelAction,
        getCarAllowances: getCarAllowances,
        getHcmHouseCodes: getHcmHouseCodes,
        getHouseCodeName: getHouseCodeName,
        getHcmHouseCodeByBrief: getHcmHouseCodeByBrief,
        getStateTypes: getStateTypes,
        getEmployee: getEmployee,
        getPerson: getPerson,
        getPersonActionTypes: getPersonActionTypes,
        getJobCodes: getJobCodes,
        saveEmployeePersonnelAction: saveEmployeePersonnelAction
    }
}]);


