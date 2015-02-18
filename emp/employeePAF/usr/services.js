
paf.factory('PAF', ["$http", function ($http) {
    var CarAllowances = [
        { Id: '425', Description: '425/month' },
        { Id: '500', Description: '500/month' },
        { Id: '600', Description: '600/month' },
        { Id: '900', Description: '900/month' }];

    var getPAFList = function (callback) {
        
       
        var serializeXml = function (xml) {
            var $el = angular.element(xml);
            var actions = [];
            $el.find('item').each(function (index, item) {
                var $item = angular.element(item);
                actions.push({ Id: $item.attr('id'), HouseCode:'', FirstName: $item.attr('firstName'), LastName: $item.attr('lastName'), EmployeeNumber: $item.attr('employeeNumber') });
            });
          
            if (actions.length > 0)
                callback(actions);
        }

        $.ajax({
            type: "POST",
            dataType: "xml",
            url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
            data: "moduleId=emp&requestId=1&targetId=iiCache"
                + "&requestXml=<criteria>storeId:employeePersonnelActions,userId:[user]"

                + ",<criteria>",

            success: function (xml) {
                serializeXml(xml);
            }
        });


        return;
        callback([{ Id: '1', FirstName: 'CHRIS', LastName: 'CCANDLESTREE', HcmHouseCode: '12382', EmployeeNumber: '6346546' }, { Id: '2', FirstName: 'ELLEN', LastName: 'EEMPRESSTREE', HcmHouseCode: '12382', EmployeeNumber: '45756767' }]);
    }

    var findPAFInfo = function (id, callback) {
        var pafDetail = {};

        var sampleXml = '<?xml version="1.0" encoding="utf-8"?><transaction id="1"><item id="1" firstName="Sherrie" lastName="Wendt" hcmHouseCode="259" employeeNumber="6346546" hcmHouseCodeTransfer="259" stateType="39" addressLine1="955 Chesterbrook Blvd" city="Wayne" phone="6105765219" postalCode="19087" date="02/04/2015" comments="eqw" newHire="1" hireDate="02/04/2015" status="FullTime" payStatus="Salary" yearlySalary="1000" reportingName="NEW HIRE" hcmHouseCodeTrainingLocation="NEW HIRE" trainingContact="NEW HIRE" duration="3" carAllowance="2" bonusEligibleType="4" requisitionNumber="none" emailAddress="123@test.com" promotion="1" demotion="1" reHire="1" separation="1" lOA="1" relocation="1" oldPositionType="SALARY CHANGE/PROMOTION" newPositionType="SALARY CHANGE/PROMOTION" effectiveDate="02/06/1902" changeReasonType="16" lastIncreaseDate="02/11/2015" lastIncreasePercentage="12" currentSalary="32" increaseAmount="123" increasePercentage="123" newSalary="321" currentPayGrade="3" newPayGrade="2" newReportingName="SALARY CHANGE/PROMOTION" newCarAllowance="2345" newBonusEligibleType="5" instructions="1" separationDate="02/04/2015" resignationType="46" terminationType="29" layoffType="22" separationReHire="1" payNumberOfWeeks="3" vacationDaysDue="2" salaryChange="1" lOADate="02/03/2015" dateOfReturn="02/28/2015" transfer="1" personalInfoChange="1" infoChangePhone="1231423" infoChangeAddressLine1="afsdqer" transferEffectiveDate="02/11/2015" transferReportingName="TRANSFER" /></transaction>';

        var uppercaseFirstLetter = function (input) {
            return (!!input) ? input.replace(/^(.)|(\s|\-)(.)/g, function ($1) {
                return $1.toUpperCase();
            }) : '';
        }

        var chkBox = ["NewHire", "ReHire", "Separation", "LOA", "SalaryChange", "Promotion", "Demotion", "Transfer", "PersonalInfoChange", "Relocation"];

        var serializeXml = function (xml) {
            
            var xmlDoc = xml;
           
            var $xml = $(xmlDoc);
            var $item = $xml.find("item");
            $item.each(function (index, element) {
                angular.forEach(element.attributes, function (key) {
                    if (chkBox.indexOf(uppercaseFirstLetter(key.name)) >= 0) {
                        pafDetail[uppercaseFirstLetter(key.name)] = key.value == "1";
                    }
                    else {
                        pafDetail[uppercaseFirstLetter(key.name)] = key.value;
                    }
                });
            });

            callback(pafDetail);
        }


        var convertStringToBool = function (value) {
            if (value == "1")
                return true;

            return false;
        }

        $.ajax({
            type: "POST",
            dataType: "xml",
            url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
            data: "moduleId=emp&requestId=1&targetId=iiCache"
                + "&requestXml=<criteria>storeId:employeePersonnelActions,userId:[user]"
                             + ",id:" + id
                + ",<criteria>",

            success: function (xml) {
                serializeXml(xml);
            }
        });
        return;

        serializeXml(sampleXml);

    }

    var getHcmHouseCodes = function (callback) {

        var houseCodes = [];

        var serializeXml = function (xml) {
            var $el = angular.element(xml);
            $el.find('item').each(function (index, item) {
                var $item = angular.element(item);
                houseCodes.push({ id: $item.attr('id'), number: $item.attr('number'), name: $item.attr('name'), appUnit: $item.attr('appUnit'), hirNode: $item.attr('hirNode') });
            });

            if (houseCodes.length > 0)
                callback(houseCodes);
        }

        var criteriaXml = '<criteria>appUnitBrief:,storeId:hcmHouseCodes,userId:[user],</criteria>';

        var data = 'moduleId=hcm&requestId=1&requestXml=' + encodeURIComponent(criteriaXml) + '&&targetId=iiCache';

        var hcmHouseCodeMappings = [];
        $.post('/net/crothall/chimes/fin/hcm/act/Provider.aspx', data, function (data, status) {
            var hcmHouseCodes = angular.element(data);
            hcmHouseCodes.find('item').each(function (index, item) {
                var $item = angular.element(item);
                hcmHouseCodeMappings.push({ id: $item.attr('id'), number: $item.attr('number'), name: $item.attr('name'), appUnit: $item.attr('appUnit'), hirNode: $item.attr('hirNode') });
            });

            if (hcmHouseCodeMappings.length > 0)
                callback(hcmHouseCodeMappings);
        });

        return;
        var sampleXml = '<?xml version="1.0" encoding="utf-8"?><transmission><target id="iiCache" requestId="3"><store id="hcmHouseCodes" activeId="9844" criteria="appUnitBrief:,storeId:hcmHouseCodes,userId:[user],"><item id="12351" number="12351" name="001 Bench Morbeck" brief="001" appUnit="12382" hirNode="14261" /><item id="9844" number="9844" name="062 IT Corporate" brief="062" appUnit="9873" hirNode="10604" /><item id="221" number="221" name="1111 St. Marys Hospital" brief="1111" appUnit="88" hirNode="454" /><item id="415" number="415" name="1424 Lehigh Valley Health Network - Cedar Crest 17th St" brief="1424" appUnit="282" hirNode="655" /><item id="268" number="268" name="1428 Westchester County Med Center" brief="1428" appUnit="135" hirNode="505" /><item id="36" number="36" name="1893 The Childrens Institute HSK" brief="1893" appUnit="390" hirNode="760" /><item id="190" number="190" name="1030 San Joaquin Community Hospital" brief="1030" appUnit="57" hirNode="422" /><item id="55" number="55" name="1023 St James MOBs" brief="1023" appUnit="409" hirNode="781" /><item id="227" number="227" name="1543 Baylor University" brief="1543" appUnit="94" hirNode="460" /><item id="392" number="392" name="1420 Catskill Regional Medical Center" brief="1420" appUnit="259" hirNode="624" /><item id="350" number="350" name="1432 University Hosp - HSK" brief="1432" appUnit="217" hirNode="584" /><item id="159" number="159" name="2303 Marion Hospital CES" brief="2303" appUnit="26" hirNode="391" /><item id="12303" number="12303" name="094 Jon Schmidt" brief="094" appUnit="12334" hirNode="14199" /><item id="10211" number="10211" name="1894 HUP" brief="1894" appUnit="10240" hirNode="175" /><item id="111" number="111" name="6008 Colonial Williamsburg" brief="6008" appUnit="465" hirNode="854" /><item id="11647" number="11647" name="907039 - 1400A - Combined 400 Building" brief="907039" appUnit="11678" hirNode="12449" /><item id="12238" number="12238" name="023 Medi-Dyn" brief="023" appUnit="12269" hirNode="14127" /><item id="12449" number="12449" name="6042 CLS - Chicago" brief="6042" appUnit="12480" hirNode="14391" /></store></target></transmission>';
        serializeXml(sampleXml);
    }

    var getStateTypes = function (callback) {
        var states = [];

        var serializeXml = function (xml) {
            var $el = angular.element(xml);
            $el.find('item').each(function (index, item) {
                var $item = angular.element(item);
                states.push({ id: $item.attr('id'), number: $item.attr('number'), name: $item.attr('name'), brief: $item.attr('brief'), minimumWage: $item.attr('minimumWage') });
            });

            if (states.length > 0)
                callback(states);
        }

        
                $.ajax({           
            type: "POST",
            dataType: "xml",
            url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
            data: "moduleId=emp&requestId=1&targetId=iiCache"
                + "&requestXml=<criteria>storeId:stateTypes,userId:[user]"
                + ",<criteria>",
 
            success: function(xml) {
                 serializeXml(xml);
              }
        });

        
                return;
        var sampleXml = '<?xml version="1.0" encoding="utf-8"?><transmission><target id="iiCache" requestId="3"><store id="stateTypes" activeId="1" criteria="storeId:stateTypes,userId:[user]"><item id="1" number="1" name="Alaska" brief="AK" minimumWage="12.02" /><item id="2" number="2" name="Alabama" brief="AL" minimumWage="9.20" /><item id="3" number="3" name="Arkansas" brief="AR" minimumWage="9.34" /><item id="4" number="4" name="Arizona" brief="AZ" minimumWage="7.81" /><item id="5" number="5" name="California" brief="CA" minimumWage="9.16" /><item id="6" number="6" name="Colorado" brief="CO" minimumWage="8.11" /><item id="7" number="7" name="Connecticut" brief="CT" minimumWage="8.28" /><item id="8" number="8" name="District of Columbia" brief="DC" minimumWage="8.25" /><item id="9" number="9" name="Delaware" brief="DE" minimumWage="7.25" /><item id="10" number="10" name="Florida" brief="FL" minimumWage="7.69" /><item id="11" number="11" name="Georgia" brief="GA" minimumWage="5.50" /><item id="12" number="12" name="Hawaii" brief="HI" minimumWage="15.68" /><item id="13" number="13" name="Iowa" brief="IA" minimumWage="7.25" /><item id="14" number="14" name="Idaho" brief="ID" minimumWage="7.25" /><item id="15" number="15" name="Illinois" brief="IL" minimumWage="8.30" /><item id="16" number="16" name="Indiana" brief="IN" minimumWage="8.55" /><item id="17" number="17" name="Kansas" brief="KS" minimumWage="7.25" /><item id="18" number="18" name="Kentucky" brief="KY" minimumWage="7.25" /><item id="19" number="19" name="Louisiana" brief="LA" minimumWage="0" /><item id="20" number="20" name="Massachusetts" brief="MA" minimumWage="8.00" /><item id="21" number="21" name="Maryland" brief="MD" minimumWage="7.25" /><item id="22" number="22" name="Maine" brief="ME" minimumWage="7.50" /><item id="23" number="23" name="Michigan" brief="MI" minimumWage="7.40" /><item id="24" number="24" name="Minnesota" brief="MN" minimumWage="6.15" /><item id="25" number="25" name="Missouri" brief="MO" minimumWage="7.25" /><item id="26" number="26" name="Mississippi" brief="MS" minimumWage="7.76" /><item id="27" number="27" name="Montana" brief="MT" minimumWage="9.50" /><item id="28" number="28" name="North Carolina" brief="NC" minimumWage="7.25" /><item id="29" number="29" name="North Dakota" brief="ND" minimumWage="7.25" /><item id="30" number="30" name="Nebraska" brief="NE" minimumWage="7.25" /><item id="31" number="31" name="New Hampshire" brief="NH" minimumWage="7.25" /><item id="32" number="32" name="New Jersey" brief="NJ" minimumWage="7.25" /><item id="33" number="33" name="New Mexico" brief="NM" minimumWage="7.50" /><item id="34" number="34" name="Nevada" brief="NV" minimumWage="8.25" /><item id="35" number="35" name="New York" brief="NY" minimumWage="7.25" /><item id="36" number="36" name="Ohio" brief="OH" minimumWage="11.00" /><item id="37" number="37" name="Oklahoma" brief="OK" minimumWage="7.25" /><item id="38" number="38" name="Oregon" brief="OR" minimumWage="8.80" /><item id="39" number="39" name="Pennsylvania" brief="PA" minimumWage="7.50" /><item id="40" number="40" name="Rhode Island" brief="RI" minimumWage="7.40" /><item id="41" number="41" name="South Carolina" brief="SC" minimumWage="0" /><item id="42" number="42" name="South Dakota" brief="SD" minimumWage="7.25" /><item id="43" number="43" name="Tennessee" brief="TN" minimumWage="0.00" /><item id="44" number="44" name="Texas" brief="TX" minimumWage="7.25" /><item id="45" number="45" name="Utah" brief="UT" minimumWage="7.25" /><item id="46" number="46" name="Virginia" brief="VA" minimumWage="7.25" /><item id="47" number="47" name="Vermont " brief="VT" minimumWage="8.46" /><item id="48" number="48" name="Washington" brief="WA" minimumWage="9.04" /><item id="49" number="49" name="Wisconsin" brief="WI" minimumWage="7.25" /><item id="50" number="50" name="West Virginia" brief="WV" minimumWage="7.25" /><item id="51" number="51" name="Wyoming" brief="WY" minimumWage="5.15" /><item id="52" number="52" name="Ontario" brief="ON" minimumWage="7.25" /><item id="53" number="53" name="Bahamas" brief="BS" minimumWage="7.25" /><item id="54" number="54" name="Canada" brief="CN" minimumWage="7.25" /><item id="55" number="55" name="International" brief="IT" minimumWage="7.25" /><item id="56" number="56" name="Puerto Rico" brief="PR" minimumWage="7.25" /><item id="57" number="57" name="Virgin Islands" brief="VI" minimumWage="7.25" /><item id="58" number="58" name="Pacific Islands" brief="PI" minimumWage="7.25" /><item id="59" number="59" name="Guam" brief="GU" minimumWage="7.25" /><item id="60" number="60" name="American Samoa" brief="AS" minimumWage="7.25" /><item id="61" number="61" name="Reserved" brief="PW" minimumWage="7.25" /><item id="62" number="62" name="AA" brief="AA" minimumWage="7.25" /><item id="63" number="63" name="AE" brief="AE" minimumWage="7.25" /><item id="64" number="64" name="AP" brief="AP" minimumWage="7.25" /><item id="65" number="65" name="Jamaica" brief="JM" minimumWage="7.25" /><item id="66" number="66" name="Cayman Islands" brief="Cayman Islands" minimumWage="7.25" /><item id="78" number="78" name="Turks &amp; Caicos Islands" brief="TC" minimumWage="7.25" /><item id="79" number="79" name="Aruba" brief="AW" minimumWage="7.25" /><item id="80" number="80" name="Panama" brief="Panama" minimumWage="7.25" /><item id="81" number="81" name="South Korea" brief="KR" minimumWage="7.25" /></store></target></transmission>';

        serializeXml(sampleXml);

    }

    var getEmployee = function (employeeNumber, houseCodeId, callback) {
        var employee = null;
        var serializeXml = function (xml) {
            var $el = angular.element(xml);

            $item = $el.find('item');

            if ($item.length == 0)
                return;

            employee = {
                id: $item.attr('id'), employeeNumber: $item.attr('employeeNumber'), lastName: $item.attr('lastName'), firstName: $item.attr('firstName'),
                brief: $item.attr('brief'), ssn: $item.attr('ssn'), payrollStatus: $item.attr('payrollStatus'), houseCodeRM: $item.attr('houseCodeRM'), houseCode: $item.attr('houseCode')
            };


            callback(employee);
        }

        $.ajax({
            type: "POST",
            dataType: "xml",
            url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
            data: "moduleId=emp&requestId=1&targetId=iiCache"
                + "&requestXml=<criteria>storeId:employeeSearchs,userId:[user]"
                             + ",searchValue:" + employeeNumber
                             + ",hcmHouseCodeId:" + houseCodeId
                             + ",employeeType:SearchFull,filterType:Employee Number"
                + ",<criteria>",

            success: function (xml) {
                serializeXml(xml);
            }
        });
        return;

        var sampleXml = '<?xml version="1.0" encoding="utf-8"?><transmission><target id="iiCache" requestId="1"><store id="employeeSearchs" activeId="44771" criteria="storeId:employeeSearchs,userId:[user],searchValue:687875,hcmHouseCodeId:10115,employeeType:SearchFull,filterType:Employee Number"><item id="44771" employeeNumber="687875" lastName="Wendt" firstName="Sherrie" brief="SherrWendtF6212" ssn="164986881" payrollStatus="T" houseCode="026" houseCodeRM="Corporate Office Costs RM" /></store></target></transmission>';
        serializeXml(sampleXml);
    }

    var getPerson = function (employeeId, callback) {
        var person = null;

        var serializeXml = function (xml) {
            var $el = angular.element(xml);
            var $item = $el.find('item');

            person = {
                id: $item.attr('id'), active: $item.attr('active'), brief: $item.attr('brief'), hirNode: $item.attr('hirNode'), firstName: $item.attr('firstName'),
                lastName: $item.attr('lastName'), middleName: $item.attr('middleName'), addressLine1: $item.attr('addressLine1'), addressLine2: $item.attr('addressLine2'),
                city: $item.attr('city'), state: $item.attr('state'), postalCode: $item.attr('postalCode'), homePhone: $item.attr('homePhone'), fax: $item.attr('fax'),
                cellPhone: $item.attr('cellPhone'), email: $item.attr('email'), pager: $item.attr('pager'), employeeHouseCodeUpdated: $item.attr('employeeHouseCodeUpdated')
            }

            callback(person);
        }

        $.ajax({
            type: "POST",
            dataType: "xml",
            url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
            data: "moduleId=emp&requestId=1&targetId=iiCache"
                + "&requestXml=<criteria>storeId:persons,userId:[user]"
                             + ",id:" + employeeId
                + ",<criteria>",

            success: function (xml) {
                serializeXml(xml);
            }
        });
        return;

        var sampleXml = '<?xml version="1.0" encoding="utf-8"?><transmission><target id="iiCache" requestId="1"><store id="persons" activeId="44771" criteria="storeId:persons,userId:RAYMOND_II\Raymond,id:44771"><item id="44771" active="true" brief="SherrWendtF6212" hirNode="10877" firstName="Sherrie" lastName="Wendt" middleName="L" addressLine1="955 Chesterbrook Blvd" addressLine2="Suite 300" city="Wayne" state="39" postalCode="19087" homePhone="6105765219" fax="" cellPhone="" email="" pager="" employeeHouseCodeUpdated="true" /></store></target></transmission>';

        serializeXml(sampleXml);
    }

    var getCarAllowances = function () {
        return CarAllowances;
    }

    var getPersonActionTypes = function (callback) {

        var types = [];

        var serializeXml = function (xml) {
            var $el = angular.element(xml);
            $el.find('item').each(function (index, item) {
                var $item = angular.element(item);
                types.push({ Id: $item.attr('id'), Description: $item.attr('title'), displayOrder: $item.attr('displayOrder'), brief: $item.attr('brief'), typeName: $item.attr('typeName') });
            });

            if (types.length > 0)
                callback(types);
        }
        $.ajax({
            type: "POST",
            dataType: "xml",
            url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
            data: "moduleId=emp&requestId=1&targetId=iiCache"
                + "&requestXml=<criteria>storeId:personnelActionTypes,userId:[user]"
                + ",<criteria>",

            success: function (xml) {
                serializeXml(xml);
            }
        });
        return;

        var sampleXml = '<?xml version="1.0" encoding="utf-8"?><transmission><target id="iiCache" requestId="1"><store id="personnelActionTypes" activeId="1" criteria="storeId:personnelActionTypes,userId:[user]"><item id="1" typeName="BonusEligible" brief="" title="Supervisor" displayOrder="1" /><item id="2" typeName="BonusEligible" brief="" title="Assistant Director" displayOrder="2" /><item id="3" typeName="BonusEligible" brief="" title="Unit Director" displayOrder="3" /><item id="4" typeName="BonusEligible" brief="" title="Res Reg Manager" displayOrder="4" /><item id="5" typeName="BonusEligible" brief="" title="Regional Manager" displayOrder="5" /><item id="6" typeName="BonusEligible" brief="" title="Regional Vice President" displayOrder="6" /><item id="7" typeName="Plan" brief="" title="Plan A NH" displayOrder="1" /><item id="8" typeName="Plan" brief="" title="Plan A Existing" displayOrder="2" /><item id="9" typeName="Plan" brief="" title="Plan B NH" displayOrder="3" /><item id="10" typeName="Plan" brief="" title="Plan B Existing" displayOrder="4" /><item id="11" typeName="Plan" brief="" title="Plan C" displayOrder="5" /><item id="12" typeName="Reason4Change" brief="" title="Merit" displayOrder="1" /><item id="13" typeName="Reason4Change" brief="" title="Annual" displayOrder="2" /><item id="14" typeName="Reason4Change" brief="" title="Promotion" displayOrder="3" /><item id="15" typeName="Reason4Change" brief="" title="Demotion" displayOrder="4" /><item id="16" typeName="Reason4Change" brief="" title="Hourly Promotion" displayOrder="5" /><item id="17" typeName="Reason4Change" brief="" title="Increase in Responsibilities" displayOrder="6" /><item id="18" typeName="Reason4Change" brief="" title="Decrease in Responsibilities" displayOrder="7" /><item id="19" typeName="Reason4Change" brief="" title="Other" displayOrder="8" /><item id="20" typeName="Layoff" brief="7600" title="Reduction in force" displayOrder="1" /><item id="21" typeName="Layoff" brief="7610" title="End of temporary employment" displayOrder="2" /><item id="22" typeName="Layoff" brief="7620" title="Job eliminated" displayOrder="3" /><item id="23" typeName="Layoff" brief="7640" title="Account closed" displayOrder="4" /><item id="24" typeName="Layoff" brief="7660" title="Client requested removal" displayOrder="5" /><item id="25" typeName="Termination" brief="3100" title="Reported under influence alcohol" displayOrder="1" /><item id="26" typeName="Termination" brief="3700" title="Tardiness-frequent" displayOrder="2" /><item id="27" typeName="Termination" brief="3900" title="Leaving work station" displayOrder="3" /><item id="28" typeName="Termination" brief="4000" title="Absenteeism-excessive absences" displayOrder="4" /><item id="29" typeName="Termination" brief="4100" title="Absenteeism-unreported" displayOrder="5" /><item id="30" typeName="Termination" brief="4300" title="Fighting on company property" displayOrder="6" /><item id="31" typeName="Termination" brief="4400" title="Quantity of work" displayOrder="7" /><item id="32" typeName="Termination" brief="4600" title="Destruction of co. property" displayOrder="8" /><item id="33" typeName="Termination" brief="4800" title="Violation of co. rules/policies" displayOrder="9" /><item id="34" typeName="Termination" brief="4860" title="Reported under influence drugs" displayOrder="10" /><item id="35" typeName="Termination" brief="4900" title="Insubordination" displayOrder="11" /><item id="36" typeName="Termination" brief="5110" title="Misconduct" displayOrder="12" /><item id="37" typeName="Termination" brief="5120" title="Quality of work" displayOrder="13" /><item id="38" typeName="Termination" brief="5400" title="Violation of safety rules" displayOrder="14" /><item id="39" typeName="Termination" brief="5500" title="Dishonesty-monetary theft" displayOrder="15" /><item id="40" typeName="Termination" brief="5800" title="Falsification of records" displayOrder="16" /><item id="41" typeName="Termination" brief="9700" title="Probationary-not qualified for job" displayOrder="17" /><item id="42" typeName="Resignation" brief="0100" title="Abandoned job" displayOrder="1" /><item id="43" typeName="Resignation" brief="0300" title="Reason unknown" displayOrder="2" /><item id="44" typeName="Resignation" brief="0400" title="In lieu of discharge" displayOrder="3" /><item id="45" typeName="Resignation" brief="0800" title="Did not return from leave" displayOrder="4" /><item id="46" typeName="Resignation" brief="1000" title="Retirement" displayOrder="5" /><item id="47" typeName="Resignation" brief="1400" title="Accept another job" displayOrder="6" /><item id="48" typeName="Resignation" brief="1410" title="Go into own business" displayOrder="7" /><item id="49" typeName="Resignation" brief="1420" title="Military" displayOrder="8" /><item id="50" typeName="Resignation" brief="1500" title="Relocate" displayOrder="9" /><item id="51" typeName="Resignation" brief="1600" title="Personal-not job related" displayOrder="10" /><item id="52" typeName="Resignation" brief="1610" title="Marriage" displayOrder="11" /><item id="53" typeName="Resignation" brief="1620" title="Family obligations" displayOrder="12" /><item id="54" typeName="Resignation" brief="1700" title="Transportation" displayOrder="13" /><item id="55" typeName="Resignation" brief="1900" title="Illness" displayOrder="14" /><item id="56" typeName="Resignation" brief="2000" title="Maternity" displayOrder="15" /><item id="57" typeName="Resignation" brief="2110" title="Dissatisfaction-work hours" displayOrder="16" /><item id="58" typeName="Resignation" brief="2120" title="Dissatisfaction-salary" displayOrder="17" /><item id="59" typeName="Resignation" brief="2130" title="Dissatisfaction-working conditions" displayOrder="18" /><item id="60" typeName="Resignation" brief="2140" title="Dissatisfaction-performance review" displayOrder="19" /><item id="61" typeName="Resignation" brief="2170" title="Dissatisfaction-company policies" displayOrder="20" /><item id="62" typeName="Resignation" brief="2190" title="Dissatisfaction-supervisor" displayOrder="21" /><item id="63" typeName="Resignation" brief="2200" title="Walked off job" displayOrder="22" /><item id="64" typeName="Resignation" brief="2500" title="School" displayOrder="23" /><item id="65" typeName="Resignation" brief="8500" title="Death" displayOrder="24" /></store></target></transmission>';

        serializeXml(sampleXml);
    }

    return {
        getPAFList: getPAFList,
        findPAFInfo: findPAFInfo,
        getCarAllowances: getCarAllowances,
        getHcmHouseCodes: getHcmHouseCodes,
        getStateTypes: getStateTypes,
        getEmployee: getEmployee,
        getPerson: getPerson,
        getPersonActionTypes: getPersonActionTypes
    }
}]);


