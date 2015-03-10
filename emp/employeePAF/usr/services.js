
paf.factory('EmpActions', ["$http", "$filter", function ($http, $filter) {
    var CarAllowances = [
        { Id: '425', Description: '425/month' },
        { Id: '500', Description: '500/month' },
        { Id: '600', Description: '600/month' },
        { Id: '900', Description: '900/month' }];

    var PositionTypes = [
       { id: '1', name: 'Teacher' },
       { id: '2', name: 'Painter' },
       { id: '3', name: 'Architect' },
       { id: '4', name: 'Doctor' }];

    var houseCodes = null;

    var apiRequest = function (moduleId, requestXml, callback) {
        $.ajax({
            type: "POST",
            dataType: "xml",
            url: "/net/crothall/chimes/fin/" + moduleId + "/act/provider.aspx",
            data: "moduleId=" + moduleId + "&requestId=1&targetId=iiCache"
                + "&requestXml=" + requestXml,
            success: function (xml) {
                if (callback)
                    callback(xml);
            }
        });
    }

    var getEmployeePersonnelActions = function (callback) {

        apiRequest('emp', '<criteria>storeId:employeePersonnelActions,userId:[user] ,<criteria>', function (xml) {
            if (callback)
                callback(deserializeXml(xml, 'item', { upperFirstLetter: true }));
        });

    }

    var findEmployeePersonnelAction = function (id, callback) {

        var boolItems = ["NewHire", "ReHire", "Separation", "LOA", "SalaryChange", "Promotion", "Demotion", "Transfer", "PersonalInfoChange", "Relocation"];

        //$.ajax({
        //    type: "POST",
        //    dataType: "xml",
        //    url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
        //    data: "moduleId=emp&requestId=1&targetId=iiCache"
        //        + "&requestXml=<criteria>storeId:employeePersonnelActions,userId:[user]"
        //                     + ",id:" + id
        //        + ",<criteria>",

        //    success: function (xml) {

        //        var items = deserializeXml(xml, 'item', true, booleanItems);

        //        if (callback)
        //            callback(items[0]);
        //    }
        //});
        apiRequest('emp', '<criteria>storeId:employeePersonnelActions,userId:[user]' + ",id:" + id + ',<criteria>', function (xml) {
            if (callback)
                callback(deserializeXml(xml, 'item', { upperFirstLetter: true, boolItems: boolItems })[0]);
        });
    }

    var getHcmHouseCodes = function (callback) {

        var criteriaXml = '<criteria>appUnitBrief:,storeId:hcmHouseCodes,userId:[user],</criteria>';

        //var data = 'moduleId=hcm&requestId=1&requestXml=' + encodeURIComponent(criteriaXml) + '&&targetId=iiCache';

        //$.post('/net/crothall/chimes/fin/hcm/act/Provider.aspx', data, function (data, status) {
        //    var items = deserializeXml(data, 'item', false);

        //    if (callback)
        //        callback(items);
        //});

        apiRequest('hcm', encodeURIComponent(criteriaXml), function (xml) {
            houseCodes = deserializeXml(xml, 'item', { upperFirstLetter: false });
            if (callback)
                callback(houseCodes);
        });
    }

    var getHouseCodeName = function (id) {
        if (houseCodes == null)
            return '';

        var items = $filter('filter')(houseCodes, { id: id });
        if (items != null && items.length>0) {
            return items[0].name;
        }
        else {
            return 'N/A';
        }
    }

    var getStateTypes = function (callback) {

        //$.ajax({
        //    type: "POST",
        //    dataType: "xml",
        //    url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
        //    data: "moduleId=emp&requestId=1&targetId=iiCache"
        //        + "&requestXml=<criteria>storeId:stateTypes,userId:[user]"
        //        + ",<criteria>",

        //    success: function (xml) {

        //        var items = deserializeXml(xml, 'item', false);

        //        if (callback)
        //            callback(items);
        //    }
        //});
        apiRequest('emp', '<criteria>storeId:stateTypes,userId:[user],<criteria>', function (xml) {
            if (callback)
                callback(deserializeXml(xml, 'item', { upperFirstLetter: false }));
        });
    }

    var getEmployee = function (employeeNumber, houseCodeId, callback) {

        //$.ajax({
        //    type: "POST",
        //    dataType: "xml",
        //    url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
        //    data: "moduleId=emp&requestId=1&targetId=iiCache"
        //        + "&requestXml=<criteria>storeId:employeeSearchs,userId:[user]"
        //                     + ",searchValue:" + employeeNumber
        //                     + ",hcmHouseCodeId:" + houseCodeId
        //                     + ",employeeType:SearchFull,filterType:Employee Number"
        //        + ",<criteria>",

        //    success: function (xml) {
        //        var items = deserializeXml(xml, 'item', false);

        //        if (callback)
        //            callback(items);
        //    }
        //});
        apiRequest('emp', '<criteria>storeId:employeeSearchs,userId:[user]'
                             + ',searchValue:' + employeeNumber
                             + ',hcmHouseCodeId:' + houseCodeId
                             + ',employeeType:SearchFull,filterType:Employee Number'
                + ',<criteria>', function (xml) {
                    if (callback)
                        callback(deserializeXml(xml, 'item', { upperFirstLetter: false })[0]);
                });
    }

    var getPerson = function (employeeId, callback) {

        //$.ajax({
        //    type: "POST",
        //    dataType: "xml",
        //    url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
        //    data: "moduleId=emp&requestId=1&targetId=iiCache"
        //        + "&requestXml=<criteria>storeId:persons,userId:[user]"
        //                     + ",id:" + employeeId
        //        + ",<criteria>",

        //    success: function (xml) {

        //        var items = deserializeXml(xml, 'item', false);

        //        if (callback)
        //            callback(items);
        //    }
        //});
        apiRequest('emp', '<criteria>storeId:persons,userId:[user]'
                    + ',id:' + employeeId
                    + ',<criteria>', function (xml) {
                        if (callback)
                            callback(deserializeXml(xml, 'item', { upperFirstLetter: false })[0]);
                    });
    }

    var getCarAllowances = function () {
        return CarAllowances;
    }

    var getPositionTypes = function () {
        return PositionTypes;
    }

    var getPersonActionTypes = function (callback) {

        //$.ajax({
        //    type: "POST",
        //    dataType: "xml",
        //    url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
        //    data: "moduleId=emp&requestId=1&targetId=iiCache"
        //        + "&requestXml=<criteria>storeId:personnelActionTypes,userId:[user]"
        //        + ",<criteria>",

        //    success: function (xml) {

        //        var items = deserializeXml(xml, 'item', false);

        //        if (callback)
        //            callback(items);
        //    }
        //});
        apiRequest('emp', '<criteria>storeId:personnelActionTypes,userId:[user],<criteria>', function (xml) {
            if (callback)
                callback(deserializeXml(xml, 'item', { upperFirstLetter: false }));
        });
    }

    var saveEmployeePersonnelAction = function (xmlNode, callback) {

        var xml = ['<transaction id="1">\r\n<employeePersonnelAction '];

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
        getStateTypes: getStateTypes,
        getEmployee: getEmployee,
        getPerson: getPerson,
        getPersonActionTypes: getPersonActionTypes,
        getPositionTypes: getPositionTypes,
        saveEmployeePersonnelAction: saveEmployeePersonnelAction
    }
}]);


