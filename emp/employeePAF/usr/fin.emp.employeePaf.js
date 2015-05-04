window['_yCs'] = ['<section>    <h3 class="text-center header">PERSONNEL ACTION FORM<span ng-if="empAction.Number>0"> ( #{{empAction.Number}} )</span></h3></section><div class="customizer">    <div class="container bs-docs-container ">        <form name="pafForm">            <section>                <p class="bs-header text-center">(First Section to be filled out at all times by Hiring Manager, Manager and/or Associate)</p>                <div class="row">                    <div class="col-md-3">                        <div class="form-group" paf-invalid="pafForm.Date">                            <label>Date</label>                            <paf-datepicker dt-option="dateOptions" dt-popup="MM/dd/yyyy" dt-model="empAction.Date" dt-name="Date" dt-required="true"></paf-datepicker>                        </div>                    </div>                    <div class="col-md-9">                        <div class="form-group typeahead" paf-invalid="pafForm.HcmHouseCode">                            <label class="control-label">House Code or Unit Name</label>                            <paf-typeahead ng-model="empAction.HcmHouseCode" source="HcmHouseCodes"                                typeahead-option="{displayField:\'name\',valueField:\'id\',name:\'HcmHouseCode\'}" ng-required="true"></paf-typeahead>                        </div>                    </div>                </div>                <div class="row">                    <div class="col-md-3">                        <div class="form-group" ng-class="{\'has-error\':pafForm.EmployeeNumber.$invalid}">                            <label class="control-label">Employee/Clock Number</label>                            <input class="form-control input-sm" name="EmployeeNumber" ng-blur="onEmployeeNumberChanged(empAction.EmployeeNumber)"                                paf-enter="onEmployeeNumberChanged(empAction.EmployeeNumber)" ng-model="empAction.EmployeeNumber" ng-required="!empAction.NewHire" paf-numeric />                        </div>                    </div>                    <div class="col-md-3">                        <div class="form-group" ng-class="{\'has-error\':pafForm.FirstName.$invalid}">                            <label class="control-label">First Name</label>                            <input class="form-control input-sm" name="FirstName" ng-model="empAction.FirstName" ng-disabled="empAction.Data.Person" required />                        </div>                    </div>                    <div class="col-md-3">                        <div class="form-group">                            <label class="control-label">Middle Name</label>                            <input class="form-control input-sm" name="MiddleName" ng-model="empAction.MiddleName" ng-disabled="empAction.Data.Person" />                        </div>                    </div>                    <div class="col-md-3">                        <div class="form-group" ng-class="{\'has-error\':pafForm.LastName.$invalid}">                            <label class="control-label">Last Name</label>                            <input class="form-control input-sm" name="LastName" ng-model="empAction.LastName" ng-disabled="empAction.Data.Person" required />                        </div>                    </div>                </div>                <div class="row">                    <div class="col-md-6">                        <div class="form-group" ng-class="{\'has-error\':pafForm.AddressLine1.$invalid}">                            <label class="control-label">Address1</label>                            <input class="form-control input-sm" name="AddressLine1" ng-model="empAction.AddressLine1" ng-disabled="empAction.Data.Person" required />                        </div>                    </div>                    <div class="col-md-6">                        <div class="form-group">                            <label class="control-label">Address2</label>                            <input class="form-control input-sm" name="AddressLine2" ng-model="empAction.AddressLine2" ng-disabled="empAction.Data.Person" />                        </div>                    </div>                </div>                <div class="row">                    <div class="col-md-3" ng-class="{\'has-error\':pafForm.City.$invalid}">                        <label class="control-label">City</label>                        <input class="form-control input-sm" name="City" ng-model="empAction.City" ng-disabled="empAction.Data.Person" required />                    </div>                    <div class="col-md-3" ng-class="{\'has-error\':pafForm.StateType.$invalid}">                        <label class="control-label">State</label>                        <select class="form-control input-sm" name="StateType" ng-model="empAction.StateType" ng-disabled="empAction.Data.Person" ng-options="item.id as item.name for item in States" required>                            <option></option>                        </select>                    </div>                    <div class="col-md-3" ng-class="{\'has-error\':pafForm.PostalCode.$invalid}">                        <label>Zip</label>                        <input class="form-control input-sm" name="PostalCode" ng-model="empAction.PostalCode" paf-mask="zipcode" ng-disabled="empAction.Data.Person" required />                    </div>                    <div class="col-md-3">                        <div class="form-group" ng-class="{\'has-error\':pafForm.Phone.$invalid}">                            <label class="control-label">Phone #</label>                            <input class="form-control input-sm" name="Phone" ng-model="empAction.Phone" paf-mask="phone" ng-disabled="empAction.Data.Person" required />                        </div>                    </div>                </div>            </section>            <section>                <h4 style="display: inline-block">CHECK ALL THAT APPLY</h4>                <span class="has-error" ng-show="pafForm.$error.ActionType[0].$invalid" style="display: inline-block">&nbsp;<label class="glyphicon glyphicon-info-sign"></label><label> &nbsp;At least one action type should be checked.</label></span>                <p>(Position must be posted with Recruiter for any new hire, transfer, re-hire, or promotion)</p>                <div class="row" ng-class="{\'has-error\':pafForm.$error.ActionType[0].$invalid}">                    <div ng-repeat="type in PositionTypes" ng-class="{\'col-md-6 col-sm-6\':type.id==\'SalaryChange\',\'col-md-3 col-sm-6\':type.id!=\'SalaryChange\'}">                        <div class="form-group">                            <div class="checkbox">                                <label>                                    <input type="checkbox" name="CheckType" ng-checked="positionTypeChecked(type.id)" ng-value="type.id" ng-click="onPositionTypeChanged(type.id)" />{{type.display}}</label>                            </div>                        </div>                    </div>            </section>            <!--NEW HIRE-->            <section ng-if="empAction.NewHire" paf-scope="empAction.Data.NewHire">                <h4>NEW HIRE</h4>                <div ng-form="hireForm" ng-controller="hireCtrl">    <p>(Section to be completed by Hiring Manager and Application and Background Check Release faxed to HRG )</p>    <div class="row">        <div class="col-md-4">            <div class="form-group" paf-invalid="hireForm.HireDate">                <label>Hire Date</label>                <paf-datepicker dt-model="data.HireDate" dt-name="HireDate" dt-option="dateOptions"                    dt-popup="MM/dd/yyyy" dt-required="true"></paf-datepicker>            </div>        </div>        <div class="col-md-8">            <div class="form-group" paf-invalid="hireForm.PositionType">                <label>Position</label>                <select class="form-control input-sm" name="PositionType" ng-model="data.PositionType"                    ng-options="item.id as item.name for item in $parent.$parent.JobCodes" required>                    <option value=""></option>                </select>            </div>        </div>    </div>    <div class="row">        <div class="col-md-12">            <label>Status</label>            <div class="row">                <div class="col-lg-3 col-md-6 col-sm-9 col-xs-12">                    <div class="form-inline">                        <div class="form-group" paf-invalid="hireForm.FullTimeHours">                            <label>                                <input name="Status" ng-model="data.Status" required="required" type="radio" value="FullTimeHours" />&nbsp;Full Time</label>                            <input class="form-control input-sm" name="FullTimeHours" ng-show="data.Status==\'FullTimeHours\'"                                ng-model="data.FullTimeHours" ng-required="data.Status==\'FullTimeHours\'"                                paf-format="{0} hours/week" paf-numeric="" placeholder="0 hours/week"                                type="text" />                        </div>                    </div>                </div>                <div class="col-lg-3 col-md-6 col-sm-9 col-xs-12">                    <div class="form-inline">                        <div class="form-group" paf-invalid="hireForm.TemporaryHours">                            <label>                                <input name="Status" ng-model="data.Status" required="required" type="radio" value="TemporaryHours" />&nbsp;Temporary</label>                            <input class="form-control input-sm" name="TemporaryHours" ng-show="data.Status==\'TemporaryHours\'"                                ng-model="data.TemporaryHours" ng-required="data.Status==\'TemporaryHours\'"                                paf-format="{0} hours/week" paf-numeric="" placeholder="0 hours/week"                                type="text" />                        </div>                    </div>                </div>                <div class="col-lg-3 col-md-6 col-sm-9 col-xs-12">                    <div class="form-inline">                        <div class="form-group" paf-invalid="hireForm.PartTimeHours">                            <label>                                <input name="Status" ng-model="data.Status" required="required" type="radio" value="PartTimeHours" />&nbsp;Part Time</label>                            <input class="form-control input-sm" name="PartTimeHours" ng-show="data.Status==\'PartTimeHours\'"                                ng-model="data.PartTimeHours" ng-required="data.Status==\'PartTimeHours\'" paf-format="{0} hours/week"                                paf-numeric="" placeholder="0 hours/week"                                type="text" />                        </div>                    </div>                    <div class="clearfix"></div>                </div>                <div class="col-lg-3 col-md-6 col-sm-9 col-xs-12 ">                    <div class="form-inline">                        <div class="form-group" paf-invalid="hireForm.PerDiemValue">                            <label>                                <input name="Status" ng-model="data.Status" required="required" type="radio" value="PerDiemValue" />&nbsp;Per Diem</label>                            <input class="form-control input-sm" name="PerDiemValue" ng-show="data.Status==\'PerDiemValue\'"                                ng-model="data.PerDiemValue" ng-required="data.Status==\'PerDiemValue\'" paf-format="{0} per day"                                paf-numeric="" placeholder="0 per day" type="text" />                        </div>                    </div>                </div>            </div>            <div class="row">                <div class="col-md-3 form-inline">                    <div class="form-group" paf-invalid="hireForm.AnnualSalaryAmount">                        <label>                            <input name="PayStatus" ng-model="data.PayStatus" required="required" type="radio" value="AnnualSalaryAmount" />&nbsp;Salary</label>                        <input class="form-control input-sm" name="AnnualSalaryAmount"                            ng-show="data.PayStatus==\'AnnualSalaryAmount\'"                            ng-model="data.AnnualSalaryAmount" ng-required="data.PayStatus==\'AnnualSalaryAmount\'"                            paf-format="{0}/year" paf-numeric="" placeholder="0/year" style="width: 40%" type="text" />                    </div>                </div>                <div class="col-md-3 form-inline">                    <div class="form-group" paf-invalid="hireForm.AdminHourlyAmount">                        <label>                            <input name="PayStatus" ng-model="data.PayStatus" required="required" type="radio" value="AdminHourlyAmount" />&nbsp;Admin.Hourly</label>                        <input class="form-control input-sm" name="AdminHourlyAmount"                            ng-show="data.PayStatus==\'AdminHourlyAmount\'" ng-model="data.AdminHourlyAmount"                            ng-required="data.PayStatus==\'AdminHourlyAmount\'" paf-format="{0}/hour" paf-numeric=""                            placeholder="0/hour" style="width: 40%" type="text" />                    </div>                </div>                <div class="col-md-3 form-inline">                    <div class="form-group" paf-invalid="hireForm.HourlyRateAmount">                        <label>                            <input name="PayStatus" ng-model="data.PayStatus" required="required" type="radio" value="HourlyRateAmount" />&nbsp;Hourly</label>                        <input class="form-control input-sm" name="HourlyRateAmount" ng-show="data.PayStatus==\'HourlyRateAmount\'"                            ng-model="data.HourlyRateAmount" ng-required="data.PayStatus==\'HourlyRateAmount\'"                            paf-format="{0}/hour" paf-numeric="" placeholder="0/hour" style="width: 40%" type="text" />                    </div>                </div>            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="gorm-group" paf-invalid="hireForm.PayGrade">                <label>Pay Grade</label>                <select class="form-control input-sm" name="PayGrade" ng-model="data.PayGrade"                    ng-options="item.id as item.id+\' (\'+item.min+\' - \'+item.mid+\' - \'+item.max+\')\' for item in $parent.$parent.PayGrades" required="required">                    <option></option>                </select>            </div>        </div>        <div class="col-md-4">            <label>Pay Range</label>            <p class="form-control-static input-sm">{{ getPayRange()}}</p>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group">                <label>Name</label>                <input class="form-control input-sm" ng-model="data.ReportingName" />            </div>        </div>        <div class="col-md-4">            <div class="form-group">                <label>Title</label>                <input class="form-control input-sm" ng-model="data.ReportingTitle" />            </div>        </div>        <div class="col-md-4">            <div class="form-group" paf-invalid="hireForm.ReportingEmail">                <label>Email</label>                <input class="form-control input-sm" name="ReportingEmail" ng-model="data.ReportingEmail" type="email" />            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group">                <label>Training Location</label>                <paf-typeahead ng-model="data.HcmHouseCodeTrainingLocation" source="$parent.$parent.HcmHouseCodes"                    typeahead-option="{displayField:\'name\',valueField:\'id\',name:\'HcmHouseCodeTrainingLocation\'}"></paf-typeahead>            </div>        </div>        <div class="col-md-5">            <div class="form-group">                <label>Training Contact</label>                <input class="form-control input-sm" ng-model="data.TrainingContact" />            </div>        </div>        <div class="col-md-3">            <div class="form-group">                <label>Duration</label>                <input class="form-control input-sm" ng-model="data.Duration" paf-format="{0} weeks"                    paf-numeric="" placeholder="0 weeks" type="text" />            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group">                <label>                    Car Allowance</label>                <div class="input-group-btn" dropdown="">                    <input class="form-control input-sm" dropdown-toggle="" ng-model="data.CarAllowance"                        paf-format="{0}/month" paf-numeric="" placeholder="0/month" />                    <ul id="dropdown-menu" class="dropdown-menu" role="menu">                        <li ng-click="data.CarAllowance = item.Id;" ng-repeat="item in $parent.$parent.lkup.CarAllowances"><a>{{item.Description}}</a></li>                    </ul>                </div>            </div>        </div>        <div class="col-md-5">            <div class="form-group">                <label>Bonus Eligible</label>                <select class="form-control input-sm" ng-model="data.BonusEligibleType" ng-options="item.id as item.title for item in $parent.$parent.lkup.BounsEligibles">                    <option value=""></option>                </select>            </div>        </div>    </div></div>                                      </section>            <!--REHIRE-->            <section ng-if="empAction.ReHire" paf-scope="empAction.Data.ReHire">                <h4>REHIRE</h4>                <div ng-form="hireForm" ng-controller="hireCtrl">    <p>(Section to be completed by Hiring Manager and Application and Background Check Release faxed to HRG )</p>    <div class="row">        <div class="col-md-4">            <div class="form-group" paf-invalid="hireForm.HireDate">                <label>Hire Date</label>                <paf-datepicker dt-model="data.HireDate" dt-name="HireDate" dt-option="dateOptions"                    dt-popup="MM/dd/yyyy" dt-required="true"></paf-datepicker>            </div>        </div>        <div class="col-md-8">            <div class="form-group" paf-invalid="hireForm.PositionType">                <label>Position</label>                <select class="form-control input-sm" name="PositionType" ng-model="data.PositionType"                    ng-options="item.id as item.name for item in $parent.$parent.JobCodes" required>                    <option value=""></option>                </select>            </div>        </div>    </div>    <div class="row">        <div class="col-md-12">            <label>Status</label>            <div class="row">                <div class="col-lg-3 col-md-6 col-sm-9 col-xs-12">                    <div class="form-inline">                        <div class="form-group" paf-invalid="hireForm.FullTimeHours">                            <label>                                <input name="Status" ng-model="data.Status" required="required" type="radio" value="FullTimeHours" />&nbsp;Full Time</label>                            <input class="form-control input-sm" name="FullTimeHours" ng-show="data.Status==\'FullTimeHours\'"                                ng-model="data.FullTimeHours" ng-required="data.Status==\'FullTimeHours\'"                                paf-format="{0} hours/week" paf-numeric="" placeholder="0 hours/week"                                type="text" />                        </div>                    </div>                </div>                <div class="col-lg-3 col-md-6 col-sm-9 col-xs-12">                    <div class="form-inline">                        <div class="form-group" paf-invalid="hireForm.TemporaryHours">                            <label>                                <input name="Status" ng-model="data.Status" required="required" type="radio" value="TemporaryHours" />&nbsp;Temporary</label>                            <input class="form-control input-sm" name="TemporaryHours" ng-show="data.Status==\'TemporaryHours\'"                                ng-model="data.TemporaryHours" ng-required="data.Status==\'TemporaryHours\'"                                paf-format="{0} hours/week" paf-numeric="" placeholder="0 hours/week"                                type="text" />                        </div>                    </div>                </div>                <div class="col-lg-3 col-md-6 col-sm-9 col-xs-12">                    <div class="form-inline">                        <div class="form-group" paf-invalid="hireForm.PartTimeHours">                            <label>                                <input name="Status" ng-model="data.Status" required="required" type="radio" value="PartTimeHours" />&nbsp;Part Time</label>                            <input class="form-control input-sm" name="PartTimeHours" ng-show="data.Status==\'PartTimeHours\'"                                ng-model="data.PartTimeHours" ng-required="data.Status==\'PartTimeHours\'" paf-format="{0} hours/week"                                paf-numeric="" placeholder="0 hours/week"                                type="text" />                        </div>                    </div>                    <div class="clearfix"></div>                </div>                <div class="col-lg-3 col-md-6 col-sm-9 col-xs-12 ">                    <div class="form-inline">                        <div class="form-group" paf-invalid="hireForm.PerDiemValue">                            <label>                                <input name="Status" ng-model="data.Status" required="required" type="radio" value="PerDiemValue" />&nbsp;Per Diem</label>                            <input class="form-control input-sm" name="PerDiemValue" ng-show="data.Status==\'PerDiemValue\'"                                ng-model="data.PerDiemValue" ng-required="data.Status==\'PerDiemValue\'" paf-format="{0} per day"                                paf-numeric="" placeholder="0 per day" type="text" />                        </div>                    </div>                </div>            </div>            <div class="row">                <div class="col-md-3 form-inline">                    <div class="form-group" paf-invalid="hireForm.AnnualSalaryAmount">                        <label>                            <input name="PayStatus" ng-model="data.PayStatus" required="required" type="radio" value="AnnualSalaryAmount" />&nbsp;Salary</label>                        <input class="form-control input-sm" name="AnnualSalaryAmount"                            ng-show="data.PayStatus==\'AnnualSalaryAmount\'"                            ng-model="data.AnnualSalaryAmount" ng-required="data.PayStatus==\'AnnualSalaryAmount\'"                            paf-format="{0}/year" paf-numeric="" placeholder="0/year" style="width: 40%" type="text" />                    </div>                </div>                <div class="col-md-3 form-inline">                    <div class="form-group" paf-invalid="hireForm.AdminHourlyAmount">                        <label>                            <input name="PayStatus" ng-model="data.PayStatus" required="required" type="radio" value="AdminHourlyAmount" />&nbsp;Admin.Hourly</label>                        <input class="form-control input-sm" name="AdminHourlyAmount"                            ng-show="data.PayStatus==\'AdminHourlyAmount\'" ng-model="data.AdminHourlyAmount"                            ng-required="data.PayStatus==\'AdminHourlyAmount\'" paf-format="{0}/hour" paf-numeric=""                            placeholder="0/hour" style="width: 40%" type="text" />                    </div>                </div>                <div class="col-md-3 form-inline">                    <div class="form-group" paf-invalid="hireForm.HourlyRateAmount">                        <label>                            <input name="PayStatus" ng-model="data.PayStatus" required="required" type="radio" value="HourlyRateAmount" />&nbsp;Hourly</label>                        <input class="form-control input-sm" name="HourlyRateAmount" ng-show="data.PayStatus==\'HourlyRateAmount\'"                            ng-model="data.HourlyRateAmount" ng-required="data.PayStatus==\'HourlyRateAmount\'"                            paf-format="{0}/hour" paf-numeric="" placeholder="0/hour" style="width: 40%" type="text" />                    </div>                </div>            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="gorm-group" paf-invalid="hireForm.PayGrade">                <label>Pay Grade</label>                <select class="form-control input-sm" name="PayGrade" ng-model="data.PayGrade"                    ng-options="item.id as item.id+\' (\'+item.min+\' - \'+item.mid+\' - \'+item.max+\')\' for item in $parent.$parent.PayGrades" required="required">                    <option></option>                </select>            </div>        </div>        <div class="col-md-4">            <label>Pay Range</label>            <p class="form-control-static input-sm">{{ getPayRange()}}</p>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group">                <label>Name</label>                <input class="form-control input-sm" ng-model="data.ReportingName" />            </div>        </div>        <div class="col-md-4">            <div class="form-group">                <label>Title</label>                <input class="form-control input-sm" ng-model="data.ReportingTitle" />            </div>        </div>        <div class="col-md-4">            <div class="form-group" paf-invalid="hireForm.ReportingEmail">                <label>Email</label>                <input class="form-control input-sm" name="ReportingEmail" ng-model="data.ReportingEmail" type="email" />            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group">                <label>Training Location</label>                <paf-typeahead ng-model="data.HcmHouseCodeTrainingLocation" source="$parent.$parent.HcmHouseCodes"                    typeahead-option="{displayField:\'name\',valueField:\'id\',name:\'HcmHouseCodeTrainingLocation\'}"></paf-typeahead>            </div>        </div>        <div class="col-md-5">            <div class="form-group">                <label>Training Contact</label>                <input class="form-control input-sm" ng-model="data.TrainingContact" />            </div>        </div>        <div class="col-md-3">            <div class="form-group">                <label>Duration</label>                <input class="form-control input-sm" ng-model="data.Duration" paf-format="{0} weeks"                    paf-numeric="" placeholder="0 weeks" type="text" />            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group">                <label>                    Car Allowance</label>                <div class="input-group-btn" dropdown="">                    <input class="form-control input-sm" dropdown-toggle="" ng-model="data.CarAllowance"                        paf-format="{0}/month" paf-numeric="" placeholder="0/month" />                    <ul id="dropdown-menu" class="dropdown-menu" role="menu">                        <li ng-click="data.CarAllowance = item.Id;" ng-repeat="item in $parent.$parent.lkup.CarAllowances"><a>{{item.Description}}</a></li>                    </ul>                </div>            </div>        </div>        <div class="col-md-5">            <div class="form-group">                <label>Bonus Eligible</label>                <select class="form-control input-sm" ng-model="data.BonusEligibleType" ng-options="item.id as item.title for item in $parent.$parent.lkup.BounsEligibles">                    <option value=""></option>                </select>            </div>        </div>    </div></div>                                      </section>            <!--SEPARATION-->            <section ng-if="empAction.Separation" paf-scope="empAction.Data.Separation">                <div ng-form="separationForm" ng-controller="separationCtrl">    <h4>SEPARATION </h4>    <p>(SCETION to be completed by Manager) REVIEWED WITH HR: Select name from menu</p>    <div class="row">        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':separationForm.SeparationDate.$invalid}">                <label>                    Separation Date</label>                <paf-datepicker dt-option="dateOptions" dt-popup="MM/dd/yyyy" dt-name="SeparationDate" dt-model="data.SeparationDate" dt-required="true"></paf-datepicker>            </div>        </div>        <div class="col-md-4">            <div class="form-group">                <label>                    Number Vacation Days Due</label>                <input class="form-control input-sm" ng-model="data.VacationDaysDue" paf-numeric />            </div>        </div>        <div class="col-md-4">            <div class="form-group">                <label>                    Separation Pay Number of Weeks</label>                <input class="form-control input-sm" ng-model="data.PayNumberOfWeeks" paf-numeric />            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':separationForm.SeparationReason.$invalid||separationForm.ResignationType.$invalid}">                <label>                    <input type="radio" name="SeparationReason" ng-model="data.SeparationReason" value="ResignationType" />&nbsp;Resignation <span ng-if="data.SeparationReason==\'ResignationType\'">- <i>Enter Reason Code Below</i></span></label>                <select class="form-control input-sm" name="ResignationType" ng-model="data.ResignationType" ng-disabled="data.SeparationReason!=\'ResignationType\'" ng-options="item.id as item.brief+\' \'+item.title for item in $parent.$parent.lkup.Resignations" ng-required="data.SeparationReason==\'ResignationType\'">                    <option value=""></option>                </select>            </div>        </div>        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':separationForm.SeparationReason.$invalid||separationForm.TerminationType.$invalid}">                <label>                    <input type="radio" name="SeparationReason" ng-model="data.SeparationReason" value="TerminationType" />&nbsp;Termination <span ng-if="data.SeparationReason==\'TerminationType\'">- <i>Enter Reason Code Below</i></span></label>                <select class="form-control input-sm" name="TerminationType" ng-model="data.TerminationType" ng-disabled="data.SeparationReason!=\'TerminationType\'" ng-options="item.id as item.brief+\' \'+item.title for item in $parent.$parent.lkup.Terminations" ng-required="data.SeparationReason==\'TerminationType\'">                    <option value=""></option>                </select>            </div>        </div>        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':separationForm.SeparationReason.$invalid||separationForm.LayoffType.$invalid}">                <label>                    <input type="radio" name="SeparationReason" ng-model="data.SeparationReason" value="LayoffType" />&nbsp;Layoff <span ng-if="data.SeparationReason==\'LayoffType\'">- <i>Enter Reason Code Below</i></span></label>                <select class="form-control input-sm" name="LayoffType" ng-model="data.LayoffType" ng-disabled="data.SeparationReason!=\'LayoffType\'" ng-options="item.id as item.brief+\' \'+item.title for item in $parent.$parent.lkup.Layoffs" ng-required="data.SeparationReason==\'LayoffType\'">                    <option value=""></option>                </select>            </div>        </div>    </div>    <div class="row">        <div class="col-md-8">            <label>Note: </label>            &nbsp;Send all Separation Information (Resignation Letter,Progressive Counseling,etc.) to HRD        </div>        <div class="col-md-4 ">            <label>Rehire:</label>            <label class="radio-inline">                <input type="radio" ng-model="data.SeparationReHire" ng-value="true" />                Yes</label>            <label class="radio-inline">                <input type="radio" ng-model="data.SeparationReHire" ng-value="false" />                No            </label>        </div>    </div></div>                                      </section>            <!--LEAVE OF ABSENCE-->            <section ng-if="empAction.Loa" paf-scope="empAction.Data.Loa">                <div ng-form="loaForm" ng-controller="loaCtrl">    <h4 style="display: inline-block;">LEAVE OF ABSENCE</h4>    <span class="has-error" ng-show="loaForm.$$parentForm.$error.loa[0].$invalid" style="display: inline-block">&nbsp;<label class="glyphicon glyphicon-info-sign"></label><label> &nbsp;Require one of Loa Date or Date Return be entered.</label></span>    <p>(SCETION to be completed by Manager) REVIEWED WITH HR: Select name from menu</p>    <div class="row" ng-class="{\'has-error\':loaForm.$$parentForm.$error.loa[0].$invalid}">        <div class="col-md-4">            <div class="form-group">                <label>                    LOA Date</label>                <paf-datepicker dt-option="dateOptions" dt-popup="MM/dd/yyyy" dt-name="LoaDate" dt-model="data.LoaDate"></paf-datepicker>            </div>        </div>        <div class="col-md-4">            <div class="form-group">                <label>                    Date Return</label>                <paf-datepicker dt-option="dateOptions" dt-name="DateOfReturn" min-date="data.LoaDate" dt-popup="MM/dd/yyyy" dt-model="data.DateOfReturn"></paf-datepicker>            </div>        </div>    </div></div>                                             </section>            <!--PROMOTION-->            <section ng-if="empAction.Promotion" paf-scope="empAction.Data.Promotion">                <h4>PROMOTION</h4>                <div ng-form="pdsForm">    <p>(Section to be completed by Hiring Manager or Manager)</p>    <div class="row">        <div class="col-md-6">            <div class="form-group">                <label>                    Current Position</label>                <div class="form-control input-sm">{{$parent.empAction.Data.Compensation.CurrentPosition}}</div>                <!-- <input class="form-control input-sm" ng-disabled="true" ng-model="empAction.CurrentPositionType" />-->            </div>        </div>        <div class="col-md-6">            <div class="form-group" ng-class="{\'has-error\':pdsForm.NewPositionType.$invalid}">                <label>                    New Position</label>                <select class="form-control input-sm" name="NewPositionType" ng-model="data.NewPositionType" ng-options="item.id as item.name for item in $parent.JobCodes" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion">                    <option value=""></option>                </select>            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.EffectiveDate.$invalid}">                <label>                    Effective Date</label>                <paf-datepicker dt-model="data.EffectiveDate" dt-name="EffectiveDate" dt-option="dateOptions" dt-popup="MM/dd/yyyy" dt-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion"></paf-datepicker>            </div>        </div>        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.ChangeReasonType.$invalid}">                <label>                    Reason for Change*:</label>                <select class="form-control input-sm" name="ChangeReasonType" ng-model="data.ChangeReasonType" ng-options="item.id as item.title for item in $parent.lkup.Reason4Changes" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion"></select>            </div>        </div>        <div class="col-md-4">            <div class="form-group">                <label>&nbsp;</label><br />                <b>*Reason Code <span style="text-decoration: underline">MUST</span> be Entered</b>            </div>        </div>    </div>    <div class="row">        <div class="col-md-6">            <div class="form-group">                <label ng-if="!$parent.empAction.Demotion">                    Date Last Increase</label>                <label ng-if="$parent.empAction.Demotion">                    Date Last  Increase/Decrease                 </label>                <label class="form-control input-sm">{{$parent.empAction.Data.Compensation.DateLastIncrease}}</label>            </div>        </div>        <div class="col-md-6">            <div class="form-group">                <label ng-if="!$parent.empAction.Demotion">                    Percentage Last Increase</label>                <label ng-if="$parent.empAction.Demotion">                    Percentage Last Increase/Decrease                 </label>                <input class="form-control input-sm" ng-model="$parent.empAction.Data.Compensation.PercentLastIncrease" paf-numeric="" ng-disabled="true" />            </div>        </div>    </div>    <div class="row">        <div class="col-md-3">            <div class="form-group">                <label>                    Current Salary</label>                <input class="form-control input-sm" ng-model="$parent.empAction.Data.Compensation.CurrentSalary" paf-numeric="" ng-disabled="true" />            </div>        </div>        <div class="col-md-3">            <div class="form-group" ng-class="{\'has-error\':!data.IncreasePercentage&&pdsForm.IncreaseAmount.$invalid}">                <label ng-if="!$parent.empAction.Demotion">                    Increase Amt.</label>                <label ng-if="$parent.empAction.Demotion">                    Decrease Amt.                </label>                <input class="form-control input-sm" name="IncreaseAmount" ng-change="$parent.onSalaryChange(\'amt\')" ng-model="data.IncreaseAmount" ng-required="($parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion)&&!data.IncreasePercentage" paf-numeric="" />            </div>        </div>        <div class="col-md-3">            <div class="form-group" ng-class="{\'has-error\':!data.IncreaseAmount&&pdsForm.IncreasePercentage.$invalid}">                <label>                    Percentage</label>                <input class="form-control input-sm" name="IncreasePercentage" ng-change="$parent.onSalaryChange(\'percentage\')" ng-model="data.IncreasePercentage" ng-required="($parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion)&&!data.IncreaseAmount" paf-numeric="" />            </div>        </div>        <div class="col-md-3">            <div class="form-group">                <label>                    New Salary</label>                <input class="form-control input-sm" ng-model="data.NewSalary" paf-numeric="" ng-disabled="true" />            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group">                <label>                    Current Pay Grade</label>                <input class="form-control input-sm" ng-disabled="true" ng-model="$parent.empAction.Data.Compensation.CurrentPayGrade" ng-disabled="true" />            </div>        </div>        <div class="col-md-2">            <div class="form-group">                <label>Current Pay Range</label>                <input class="form-control input-sm" ng-disabled="true" ng-model="$parent.empAction.Data.Compensation.CurrentPayRange" ng-disabled="true" />            </div>        </div>        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.NewPayGrade.$invalid}">                <label>                    New Pay Grade</label>                <select class="form-control input-sm" name="NewPayGrade" ng-model="data.NewPayGrade" ng-options="item.id as item.id+\' (\'+item.min+\' - \'+item.mid+\' - \'+item.max+\')\' for item in $parent.PayGrades" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion">                    <option></option>                </select>            </div>        </div>        <div class="col-md-2">            <div class="form-group">                <label>New Pay Range</label>                <p class="form-control input-sm">{{ $parent.getPayRange(data.NewPayGrade,data.NewSalary)}}</p>            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.ReportingName.$invalid}">                <label>Name</label>                <input class="form-control input-sm" name="ReportingName" ng-model="data.ReportingName" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion" />            </div>        </div>        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.ReportingTitle.$invalid}">                <label>Title</label>                <input class="form-control input-sm" name="ReportingTitle" ng-model="data.ReportingTitle" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion" />            </div>        </div>        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.ReportingEmail.$invalid}">                <label>Email</label>                <input class="form-control input-sm" name="ReportingEmail" ng-model="data.ReportingEmail" type="email" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion" />            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group">                <label>Car Allowance</label>                <div class="input-group-btn" dropdown="">                    <input class="form-control input-sm" dropdown-toggle="" ng-model="data.NewCarAllowance" paf-format="{0}/month" paf-numeric="" placeholder="0/month" type="text" />                    <ul class="dropdown-menu" role="menu">                        <li ng-click="data.NewCarAllowance = item.Id" ng-repeat="item in $parent.lkup.CarAllowances"><a>{{item.Description}}</a></li>                    </ul>                </div>            </div>        </div>        <div class="col-md-4">            <div class="form-group">                <label>Bonus Eligible</label>                <select class="form-control input-sm" ng-model="data.NewBonusEligibleType" ng-options="item.id as item.title for item in $parent.lkup.BounsEligibles">                    <option value=""></option>                </select>            </div>        </div>        <div class="col-md-4">            <div class="form-group">                <label>Other Instructions</label>                <input class="form-control input-sm" ng-model="data.Instructions" />            </div>        </div>    </div></div>                                           </section>            <!--Demotion-->            <section ng-if="empAction.Demotion" paf-scope="empAction.Data.Demotion">                <h4>DEMOTION</h4>                <div ng-form="pdsForm">    <p>(Section to be completed by Hiring Manager or Manager)</p>    <div class="row">        <div class="col-md-6">            <div class="form-group">                <label>                    Current Position</label>                <div class="form-control input-sm">{{$parent.empAction.Data.Compensation.CurrentPosition}}</div>                <!-- <input class="form-control input-sm" ng-disabled="true" ng-model="empAction.CurrentPositionType" />-->            </div>        </div>        <div class="col-md-6">            <div class="form-group" ng-class="{\'has-error\':pdsForm.NewPositionType.$invalid}">                <label>                    New Position</label>                <select class="form-control input-sm" name="NewPositionType" ng-model="data.NewPositionType" ng-options="item.id as item.name for item in $parent.JobCodes" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion">                    <option value=""></option>                </select>            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.EffectiveDate.$invalid}">                <label>                    Effective Date</label>                <paf-datepicker dt-model="data.EffectiveDate" dt-name="EffectiveDate" dt-option="dateOptions" dt-popup="MM/dd/yyyy" dt-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion"></paf-datepicker>            </div>        </div>        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.ChangeReasonType.$invalid}">                <label>                    Reason for Change*:</label>                <select class="form-control input-sm" name="ChangeReasonType" ng-model="data.ChangeReasonType" ng-options="item.id as item.title for item in $parent.lkup.Reason4Changes" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion"></select>            </div>        </div>        <div class="col-md-4">            <div class="form-group">                <label>&nbsp;</label><br />                <b>*Reason Code <span style="text-decoration: underline">MUST</span> be Entered</b>            </div>        </div>    </div>    <div class="row">        <div class="col-md-6">            <div class="form-group">                <label ng-if="!$parent.empAction.Demotion">                    Date Last Increase</label>                <label ng-if="$parent.empAction.Demotion">                    Date Last  Increase/Decrease                 </label>                <label class="form-control input-sm">{{$parent.empAction.Data.Compensation.DateLastIncrease}}</label>            </div>        </div>        <div class="col-md-6">            <div class="form-group">                <label ng-if="!$parent.empAction.Demotion">                    Percentage Last Increase</label>                <label ng-if="$parent.empAction.Demotion">                    Percentage Last Increase/Decrease                 </label>                <input class="form-control input-sm" ng-model="$parent.empAction.Data.Compensation.PercentLastIncrease" paf-numeric="" ng-disabled="true" />            </div>        </div>    </div>    <div class="row">        <div class="col-md-3">            <div class="form-group">                <label>                    Current Salary</label>                <input class="form-control input-sm" ng-model="$parent.empAction.Data.Compensation.CurrentSalary" paf-numeric="" ng-disabled="true" />            </div>        </div>        <div class="col-md-3">            <div class="form-group" ng-class="{\'has-error\':!data.IncreasePercentage&&pdsForm.IncreaseAmount.$invalid}">                <label ng-if="!$parent.empAction.Demotion">                    Increase Amt.</label>                <label ng-if="$parent.empAction.Demotion">                    Decrease Amt.                </label>                <input class="form-control input-sm" name="IncreaseAmount" ng-change="$parent.onSalaryChange(\'amt\')" ng-model="data.IncreaseAmount" ng-required="($parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion)&&!data.IncreasePercentage" paf-numeric="" />            </div>        </div>        <div class="col-md-3">            <div class="form-group" ng-class="{\'has-error\':!data.IncreaseAmount&&pdsForm.IncreasePercentage.$invalid}">                <label>                    Percentage</label>                <input class="form-control input-sm" name="IncreasePercentage" ng-change="$parent.onSalaryChange(\'percentage\')" ng-model="data.IncreasePercentage" ng-required="($parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion)&&!data.IncreaseAmount" paf-numeric="" />            </div>        </div>        <div class="col-md-3">            <div class="form-group">                <label>                    New Salary</label>                <input class="form-control input-sm" ng-model="data.NewSalary" paf-numeric="" ng-disabled="true" />            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group">                <label>                    Current Pay Grade</label>                <input class="form-control input-sm" ng-disabled="true" ng-model="$parent.empAction.Data.Compensation.CurrentPayGrade" ng-disabled="true" />            </div>        </div>        <div class="col-md-2">            <div class="form-group">                <label>Current Pay Range</label>                <input class="form-control input-sm" ng-disabled="true" ng-model="$parent.empAction.Data.Compensation.CurrentPayRange" ng-disabled="true" />            </div>        </div>        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.NewPayGrade.$invalid}">                <label>                    New Pay Grade</label>                <select class="form-control input-sm" name="NewPayGrade" ng-model="data.NewPayGrade" ng-options="item.id as item.id+\' (\'+item.min+\' - \'+item.mid+\' - \'+item.max+\')\' for item in $parent.PayGrades" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion">                    <option></option>                </select>            </div>        </div>        <div class="col-md-2">            <div class="form-group">                <label>New Pay Range</label>                <p class="form-control input-sm">{{ $parent.getPayRange(data.NewPayGrade,data.NewSalary)}}</p>            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.ReportingName.$invalid}">                <label>Name</label>                <input class="form-control input-sm" name="ReportingName" ng-model="data.ReportingName" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion" />            </div>        </div>        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.ReportingTitle.$invalid}">                <label>Title</label>                <input class="form-control input-sm" name="ReportingTitle" ng-model="data.ReportingTitle" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion" />            </div>        </div>        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.ReportingEmail.$invalid}">                <label>Email</label>                <input class="form-control input-sm" name="ReportingEmail" ng-model="data.ReportingEmail" type="email" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion" />            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group">                <label>Car Allowance</label>                <div class="input-group-btn" dropdown="">                    <input class="form-control input-sm" dropdown-toggle="" ng-model="data.NewCarAllowance" paf-format="{0}/month" paf-numeric="" placeholder="0/month" type="text" />                    <ul class="dropdown-menu" role="menu">                        <li ng-click="data.NewCarAllowance = item.Id" ng-repeat="item in $parent.lkup.CarAllowances"><a>{{item.Description}}</a></li>                    </ul>                </div>            </div>        </div>        <div class="col-md-4">            <div class="form-group">                <label>Bonus Eligible</label>                <select class="form-control input-sm" ng-model="data.NewBonusEligibleType" ng-options="item.id as item.title for item in $parent.lkup.BounsEligibles">                    <option value=""></option>                </select>            </div>        </div>        <div class="col-md-4">            <div class="form-group">                <label>Other Instructions</label>                <input class="form-control input-sm" ng-model="data.Instructions" />            </div>        </div>    </div></div>                                           </section>            <!--SALARY CHANGE-->            <section ng-if="empAction.SalaryChange" paf-scope="empAction.Data.SalaryChange">                <h4>SALARY CHANGE</h4>                <div ng-form="pdsForm">    <p>(Section to be completed by Hiring Manager or Manager)</p>    <div class="row">        <div class="col-md-6">            <div class="form-group">                <label>                    Current Position</label>                <div class="form-control input-sm">{{$parent.empAction.Data.Compensation.CurrentPosition}}</div>                <!-- <input class="form-control input-sm" ng-disabled="true" ng-model="empAction.CurrentPositionType" />-->            </div>        </div>        <div class="col-md-6">            <div class="form-group" ng-class="{\'has-error\':pdsForm.NewPositionType.$invalid}">                <label>                    New Position</label>                <select class="form-control input-sm" name="NewPositionType" ng-model="data.NewPositionType" ng-options="item.id as item.name for item in $parent.JobCodes" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion">                    <option value=""></option>                </select>            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.EffectiveDate.$invalid}">                <label>                    Effective Date</label>                <paf-datepicker dt-model="data.EffectiveDate" dt-name="EffectiveDate" dt-option="dateOptions" dt-popup="MM/dd/yyyy" dt-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion"></paf-datepicker>            </div>        </div>        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.ChangeReasonType.$invalid}">                <label>                    Reason for Change*:</label>                <select class="form-control input-sm" name="ChangeReasonType" ng-model="data.ChangeReasonType" ng-options="item.id as item.title for item in $parent.lkup.Reason4Changes" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion"></select>            </div>        </div>        <div class="col-md-4">            <div class="form-group">                <label>&nbsp;</label><br />                <b>*Reason Code <span style="text-decoration: underline">MUST</span> be Entered</b>            </div>        </div>    </div>    <div class="row">        <div class="col-md-6">            <div class="form-group">                <label ng-if="!$parent.empAction.Demotion">                    Date Last Increase</label>                <label ng-if="$parent.empAction.Demotion">                    Date Last  Increase/Decrease                 </label>                <label class="form-control input-sm">{{$parent.empAction.Data.Compensation.DateLastIncrease}}</label>            </div>        </div>        <div class="col-md-6">            <div class="form-group">                <label ng-if="!$parent.empAction.Demotion">                    Percentage Last Increase</label>                <label ng-if="$parent.empAction.Demotion">                    Percentage Last Increase/Decrease                 </label>                <input class="form-control input-sm" ng-model="$parent.empAction.Data.Compensation.PercentLastIncrease" paf-numeric="" ng-disabled="true" />            </div>        </div>    </div>    <div class="row">        <div class="col-md-3">            <div class="form-group">                <label>                    Current Salary</label>                <input class="form-control input-sm" ng-model="$parent.empAction.Data.Compensation.CurrentSalary" paf-numeric="" ng-disabled="true" />            </div>        </div>        <div class="col-md-3">            <div class="form-group" ng-class="{\'has-error\':!data.IncreasePercentage&&pdsForm.IncreaseAmount.$invalid}">                <label ng-if="!$parent.empAction.Demotion">                    Increase Amt.</label>                <label ng-if="$parent.empAction.Demotion">                    Decrease Amt.                </label>                <input class="form-control input-sm" name="IncreaseAmount" ng-change="$parent.onSalaryChange(\'amt\')" ng-model="data.IncreaseAmount" ng-required="($parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion)&&!data.IncreasePercentage" paf-numeric="" />            </div>        </div>        <div class="col-md-3">            <div class="form-group" ng-class="{\'has-error\':!data.IncreaseAmount&&pdsForm.IncreasePercentage.$invalid}">                <label>                    Percentage</label>                <input class="form-control input-sm" name="IncreasePercentage" ng-change="$parent.onSalaryChange(\'percentage\')" ng-model="data.IncreasePercentage" ng-required="($parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion)&&!data.IncreaseAmount" paf-numeric="" />            </div>        </div>        <div class="col-md-3">            <div class="form-group">                <label>                    New Salary</label>                <input class="form-control input-sm" ng-model="data.NewSalary" paf-numeric="" ng-disabled="true" />            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group">                <label>                    Current Pay Grade</label>                <input class="form-control input-sm" ng-disabled="true" ng-model="$parent.empAction.Data.Compensation.CurrentPayGrade" ng-disabled="true" />            </div>        </div>        <div class="col-md-2">            <div class="form-group">                <label>Current Pay Range</label>                <input class="form-control input-sm" ng-disabled="true" ng-model="$parent.empAction.Data.Compensation.CurrentPayRange" ng-disabled="true" />            </div>        </div>        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.NewPayGrade.$invalid}">                <label>                    New Pay Grade</label>                <select class="form-control input-sm" name="NewPayGrade" ng-model="data.NewPayGrade" ng-options="item.id as item.id+\' (\'+item.min+\' - \'+item.mid+\' - \'+item.max+\')\' for item in $parent.PayGrades" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion||$parent.empAction.Demotion">                    <option></option>                </select>            </div>        </div>        <div class="col-md-2">            <div class="form-group">                <label>New Pay Range</label>                <p class="form-control input-sm">{{ $parent.getPayRange(data.NewPayGrade,data.NewSalary)}}</p>            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.ReportingName.$invalid}">                <label>Name</label>                <input class="form-control input-sm" name="ReportingName" ng-model="data.ReportingName" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion" />            </div>        </div>        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.ReportingTitle.$invalid}">                <label>Title</label>                <input class="form-control input-sm" name="ReportingTitle" ng-model="data.ReportingTitle" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion" />            </div>        </div>        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':pdsForm.ReportingEmail.$invalid}">                <label>Email</label>                <input class="form-control input-sm" name="ReportingEmail" ng-model="data.ReportingEmail" type="email" ng-required="$parent.empAction.SalaryChange||$parent.empAction.Promotion" />            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group">                <label>Car Allowance</label>                <div class="input-group-btn" dropdown="">                    <input class="form-control input-sm" dropdown-toggle="" ng-model="data.NewCarAllowance" paf-format="{0}/month" paf-numeric="" placeholder="0/month" type="text" />                    <ul class="dropdown-menu" role="menu">                        <li ng-click="data.NewCarAllowance = item.Id" ng-repeat="item in $parent.lkup.CarAllowances"><a>{{item.Description}}</a></li>                    </ul>                </div>            </div>        </div>        <div class="col-md-4">            <div class="form-group">                <label>Bonus Eligible</label>                <select class="form-control input-sm" ng-model="data.NewBonusEligibleType" ng-options="item.id as item.title for item in $parent.lkup.BounsEligibles">                    <option value=""></option>                </select>            </div>        </div>        <div class="col-md-4">            <div class="form-group">                <label>Other Instructions</label>                <input class="form-control input-sm" ng-model="data.Instructions" />            </div>        </div>    </div></div>                                           </section>            <!--TRANSFER-->            <section ng-if="empAction.Transfer" paf-scope="empAction.Data.Transfer">                <div ng-form="transferForm">    <h4>TRANSFER</h4>    <p>(Section to be completed by Hiring Manager)</p>    <div class="row">        <div class="col-md-4 ">            <div class="form-group" ng-class="{\'has-error\':transferForm.TransferEffectiveDate.$invalid}">                <label>Effective Date</label>                <paf-datepicker dt-option="dateOptions" dt-name="TransferEffectiveDate" dt-popup="MM/dd/yyyy" dt-model="data.TransferEffectiveDate" dt-required="true"></paf-datepicker>            </div>        </div>        <div class="col-md-4 ">            <div class="form-group">                <label>Current Unit</label>                <paf-typeahead ng-model="$parent.empAction.HcmHouseCode" source="$parent.HcmHouseCodes"                    typeahead-option="{displayField:\'name\',valueField:\'id\',name:\'HcmHouseCode\'}" ng-disabled="true"></paf-typeahead>            </div>        </div>        <div class="col-md-4 ">            <div class="form-group" ng-class="{\'has-error\':transferForm.HouseCodeTransfer.$invalid}">                <label>New Unit</label>                <paf-typeahead ng-model="data.HouseCodeTransfer" source="$parent.HcmHouseCodes" typeahead-option="{displayField:\'name\',valueField:\'id\',name:\'HouseCodeTransfer\'}" ng-required="true"></paf-typeahead>            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':transferForm.ReportingName.$invalid}">                <label>Name</label>                <input class="form-control input-sm" name="ReportingName" ng-model="data.ReportingName" ng-required="true" />            </div>        </div>        <div class="col-md-4">            <div class="form-group">                <label>Title</label>                <input class="form-control input-sm" name="ReportingTitle" ng-model="data.ReportingTitle" />            </div>        </div>        <div class="col-md-4">            <div class="form-group" ng-class="{\'has-error\':transferForm.ReportingEmail.$invalid}">                <label>Email</label>                <input type="email" class="form-control input-sm" name="ReportingEmail" ng-model="data.ReportingEmail" />            </div>        </div>    </div></div>                                                          </section>            <!--PERSONAL INFORMATION CHANGE-->            <section ng-if="empAction.PersonalInfoChange" paf-scope="empAction.Data.PersonalInfoChange">                <div ng-form="personalInfoForm">    <h4>PERSONAL INFORMATION CHANGE</h4>    <p>(Section to be completed by Associate)</p>    <div class="row">        <div class="col-md-3">            <label>Effective Date</label>            <paf-datepicker dt-model="data.InfoChangeEffectiveDate" dt-option="dateOptions" dt-popup="MM/dd/yyyy"></paf-datepicker>        </div>        <div class="col-md-3">            <label>First Name</label>            <input class="form-control input-sm" ng-model="data.InfoChangeFirstName" />        </div>        <div class="col-md-3">            <label>Middle Name</label>            <input class="form-control input-sm" ng-model="data.InfoChangeMiddleName" />        </div>        <div class="col-md-3">            <label>Last Name</label>            <input class="form-control input-sm" ng-model="data.InfoChangeLastName" />        </div>    </div>    <div class="row">        <div class="col-md-6">            <div class="form-group">                <label>Address1</label>                <input class="form-control input-sm" ng-model="data.InfoChangeAddressLine1" />            </div>        </div>        <div class="col-md-3">            <div class="form-group">                <label>Address2</label>                <input class="form-control input-sm" ng-model="data.InfoChangeAddressLine2" />            </div>        </div>        <div class="col-md-3">            <div class="form-group">                <label>Phone #</label>                <input class="form-control input-sm" ng-model="data.InfoChangePhone" paf-mask="phone" />            </div>        </div>    </div>    <div class="row">        <div class="col-md-4">            <label class="control-label">City</label>            <input class="form-control input-sm" ng-model="data.InfoChangeCity" />        </div>        <div class="col-md-4">            <label class="control-label">State</label>            <select class="form-control input-sm" ng-model="data.AppStateTypeInfoChange" ng-options="item.id as item.name for item in $parent.States">                <option></option>            </select>        </div>        <div class="col-md-4">            <label class="control-label">Zip</label>            <input class="form-control input-sm" ng-model="data.InfoChangePostalCode" paf-mask="zipcode" />        </div>    </div></div>                                         </section>            <!--REQUISITION-->            <section ng-if="empAction.NewHire||empAction.ReHire||empAction.SalaryChange||empAction.Promotion||empAction.Demotion||empAction.Transfer" paf-scope="empAction.Data.Requisition">                <div ng-form="requisitionForm">    <h4>REQUISITION</h4>    <p>(To Be completed by Recruiter)</p>    <div class="row">        <div class="col-md-6">            <div class="form-group">                <label>Requisition #</label>                <input class="form-control input-sm" ng-model="data.RequisitionNumber" paf-numeric />            </div>        </div>        <div class="col-md-6">            <div class="form-group" ng-class="{\'has-error\':requisitionForm.EmailAddress.$invalid}">                <label>Email Address</label>                <input type="email" class="form-control input-sm" ng-model="data.EmailAddress" name="EmailAddress" />            </div>        </div>    </div></div>                                  </section>            <!--RELOCATION-->            <section ng-if="empAction.Relocation" paf-scope="empAction.Data.Relocation">                <div ng-form="relocationForm">    <h4>RELOCATION</h4>    <div class="row">        <div class="col-md-6">            <div class="form-group" ng-class="{\'has-error\':relocationForm.RelocationApprovedBy.$invalid}">                <label>Relocation approved by</label><input class="form-control input-sm" name="RelocationApprovedBy" ng-model="data.RelocationApprovedBy" required="true" />            </div>        </div>        <div class="col-md-6">            <div class="form-group" ng-class="{\'has-error\':relocationForm.RelocationPlan.$invalid}">                <label>Plan/Details</label>                <select class="form-control input-sm" name="RelocationPlan" ng-model="data.RelocationPlan" ng-options="item.id as item.title for item in $parent.lkup.PlanDetails" required="true">                    <option value=""></option>                </select>            </div>        </div>    </div></div>                                           </section>            <!--COMMENTS-->            <section>                <div class="form-group">                    <h4>COMMENTS</h4>                    <textarea class="form-control input-sm" ng-model="empAction.Comments"></textarea>                </div>            </section>            <!--APPROVALS-->            <section class="margin-bottom20">                <h4>APPROVALS</h4><div class="row">    <div class="col-md-3 col-sm-6">        <div class="form-group">            <label>UD/Dept Mgr</label>            <input class="form-control input-sm" ng-model="empAction.UDDeptMgr" />        </div>    </div>    <div class="col-md-3 col-sm-6">        <div class="form-group">            <label>Date</label>            <paf-datepicker dt-model="empAction.UDDate" dt-option="dateOptions" dt-popup="MM/dd/yyyy"></paf-datepicker>        </div>    </div>    <div class="col-md-3 col-sm-6">        <div class="form-group">            <label>RVP/VP</label>            <input class="form-control input-sm" ng-model="empAction.RVP" />        </div>    </div>    <div class="col-md-3 col-sm-6">        <div class="form-group">            <label>Date</label>            <paf-datepicker dt-model="empAction.RVPDate" dt-option="dateOptions" dt-popup="MM/dd/yyyy"></paf-datepicker>        </div>    </div></div><div class="row">    <div class="col-md-3 col-sm-6">        <div class="form-group">            <label>Reg. Mgr</label>            <input class="form-control input-sm" ng-model="empAction.RegMgr" />        </div>    </div>    <div class="col-md-3 col-sm-6">        <div class="form-group">            <label>Date</label>            <paf-datepicker dt-model="empAction.RegDate" dt-option="dateOptions" dt-popup="MM/dd/yyyy"></paf-datepicker>        </div>    </div>    <div class="col-md-3 col-sm-6">        <div class="form-group">            <label>DVP/SVP</label>            <input class="form-control input-sm" ng-model="empAction.DVP" />        </div>    </div>    <div class="col-md-3 col-sm-6">        <div class="form-group">            <label>Date</label>            <paf-datepicker dt-model="empAction.DVPDate" dt-option="dateOptions" dt-popup="MM/dd/yyyy"></paf-datepicker>        </div>    </div></div><div class="row">    <div class="col-md-3 col-sm-6">        <div class="form-group">            <label>SHRC</label>            <input class="form-control input-sm" ng-model="empAction.SHRC" />        </div>    </div>    <div class="col-md-3 col-sm-6">        <div class="form-group">            <label>Date</label>            <paf-datepicker dt-model="empAction.ShrcDate" dt-option="dateOptions" dt-popup="MM/dd/yyyy"></paf-datepicker>        </div>    </div>    <div class="col-md-3 col-sm-6">        <div class="form-group">            <label>CEO/CFO</label>            <input class="form-control input-sm" ng-model="empAction.CEO" />        </div>    </div>    <div class="col-md-3 col-sm-6">        <div class="form-group">            <label>Date</label>            <paf-datepicker dt-model="empAction.CEODate" dt-option="dateOptions" dt-popup="MM/dd/yyyy"></paf-datepicker>        </div>    </div></div>                            </section>            <div class="pull-right margin-bottom20">                <button class="btn btn-primary" type="submit" ng-click="save()">Save</button>                <a class="btn btn-default" href="#/list">Cancel</a>            </div>        </form>        <div ng-show="isLoading()">            <div class="overlay"></div>            <div class="spinner">                <span class="glyphicon glyphicon-refresh glyphicon-spin"></span>&nbsp;LOADING....            </div>        </div>    </div></div>','<section>    <h3 class="text-center header">PERSONNEL ACTION FORM</h3></section><div class="container bs-docs-container ">    <div class="row  margin-bottom10">        <div class="col-lg-4 col-md-5">            <div class="row form-group">                <label class="col-md-5">PAF Number</label>                <div class="col-md-7">                    <input class="form-control input-sm" ng-model="pafFilter.PafNumber" />                </div>            </div>        </div>        <div class="col-lg-8 col-md-7">            <div class="row form-group">                <label class="col-md-3">House Code</label>                <div class="col-md-9">                    <paf-typeahead ng-model="pafFilter.HcmHouseCode" source="HcmHouseCodes" typeahead-option="{displayField:\'name\',valueField:\'id\',name:\'HcmHouseCode\'}"></paf-typeahead>                </div>            </div>        </div>        <div class="col-lg-4 col-md-5">            <div class="row form-group">                <label class="col-md-5">Employee Number</label>                <div class="col-md-7">                    <input class="form-control input-sm" ng-model="pafFilter.EmployeeNumber" />                </div>            </div>        </div>        <div class="col-lg-5 col-md-7">            <div class="row form-group">                <label class="col-lg-5 col-md-3">User Name</label>                <div class="col-lg-7 col-md-9">                    <input class="form-control input-sm" ng-model="pafFilter.UserName" />                </div>            </div>        </div>        <div class="col-lg-3 col-md-5">            <div class="row form-group">                <label class="col-md-5">Date</label>                <div class="col-md-7">                    <paf-datepicker dt-option="dateOptions" dt-name="Date" dt-popup="MM/dd/yyyy" dt-model="pafFilter.Date"></paf-datepicker>                </div>            </div>        </div>        <div class="col-lg-4 col-md-7">            <div class="row form-group">                <label class="col-lg-5 col-md-3">Status</label>                <div class="col-lg-7 col-md-9">                    <select ng-model="Status" class="form-control input-sm">                        <option value="0">[All]</option>                        <option value="1">In Process</option>                        <option value="2">Approved</option>                        <option value="3">Completed</option>                        <option value="4">Cancelled</option>                        <option value="5">Unappproved</option>                    </select>                </div>            </div>        </div>    </div>    <div class="row margin-bottom10">        <div class="col-md-4 col-sm-6 col-xs-12">            <a class="btn btn-primary " href="#/new">Add New</a>            <a class="btn btn-primary " ng-click="getPafList()">Search</a>        </div>    </div>    <table class="table table-striped table-hover">        <thead>            <tr class="heading" role="row">                <th>#</th>                <th>First Name</th>                <th>Last Name</th>                <th>House Code</th>                <th>Employee Number</th>                <th></th>            </tr>        </thead>        <tbody>            <tr ng-repeat="item in empActions">                <td>{{item.Number}}</td>                <td>{{item.FirstName}}</td>                <td>{{item.LastName}}</td>                <td>{{getHouseCodeDesc(item)}}</td>                <td>{{item.EmployeeNumber}}</td>                <td><a class="btn btn-sm btn-primary" href="#/edit/{{item.Id}}">Edit</a></td>            </tr>        </tbody>    </table></div><div ng-show="viewLoading">    <div class="overlay"></div>    <div class="spinner">        <span class="glyphicon glyphicon-refresh glyphicon-spin"></span>LOADING....    </div></div>',''];

/**
 * @license AngularJS v1.3.13
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular, undefined) {'use strict';

/**
 * @ngdoc module
 * @name ngRoute
 * @description
 *
 * # ngRoute
 *
 * The `ngRoute` module provides routing and deeplinking services and directives for angular apps.
 *
 * ## Example
 * See {@link ngRoute.$route#example $route} for an example of configuring and using `ngRoute`.
 *
 *
 * <div doc-module-components="ngRoute"></div>
 */
 /* global -ngRouteModule */
var ngRouteModule = angular.module('ngRoute', ['ng']).
                        provider('$route', $RouteProvider),
    $routeMinErr = angular.$$minErr('ngRoute');

/**
 * @ngdoc provider
 * @name $routeProvider
 *
 * @description
 *
 * Used for configuring routes.
 *
 * ## Example
 * See {@link ngRoute.$route#example $route} for an example of configuring and using `ngRoute`.
 *
 * ## Dependencies
 * Requires the {@link ngRoute `ngRoute`} module to be installed.
 */
function $RouteProvider() {
  function inherit(parent, extra) {
    return angular.extend(Object.create(parent), extra);
  }

  var routes = {};

  /**
   * @ngdoc method
   * @name $routeProvider#when
   *
   * @param {string} path Route path (matched against `$location.path`). If `$location.path`
   *    contains redundant trailing slash or is missing one, the route will still match and the
   *    `$location.path` will be updated to add or drop the trailing slash to exactly match the
   *    route definition.
   *
   *    * `path` can contain named groups starting with a colon: e.g. `:name`. All characters up
   *        to the next slash are matched and stored in `$routeParams` under the given `name`
   *        when the route matches.
   *    * `path` can contain named groups starting with a colon and ending with a star:
   *        e.g.`:name*`. All characters are eagerly stored in `$routeParams` under the given `name`
   *        when the route matches.
   *    * `path` can contain optional named groups with a question mark: e.g.`:name?`.
   *
   *    For example, routes like `/color/:color/largecode/:largecode*\/edit` will match
   *    `/color/brown/largecode/code/with/slashes/edit` and extract:
   *
   *    * `color: brown`
   *    * `largecode: code/with/slashes`.
   *
   *
   * @param {Object} route Mapping information to be assigned to `$route.current` on route
   *    match.
   *
   *    Object properties:
   *
   *    - `controller` – `{(string|function()=}` – Controller fn that should be associated with
   *      newly created scope or the name of a {@link angular.Module#controller registered
   *      controller} if passed as a string.
   *    - `controllerAs` – `{string=}` – A controller alias name. If present the controller will be
   *      published to scope under the `controllerAs` name.
   *    - `template` – `{string=|function()=}` – html template as a string or a function that
   *      returns an html template as a string which should be used by {@link
   *      ngRoute.directive:ngView ngView} or {@link ng.directive:ngInclude ngInclude} directives.
   *      This property takes precedence over `templateUrl`.
   *
   *      If `template` is a function, it will be called with the following parameters:
   *
   *      - `{Array.<Object>}` - route parameters extracted from the current
   *        `$location.path()` by applying the current route
   *
   *    - `templateUrl` – `{string=|function()=}` – path or function that returns a path to an html
   *      template that should be used by {@link ngRoute.directive:ngView ngView}.
   *
   *      If `templateUrl` is a function, it will be called with the following parameters:
   *
   *      - `{Array.<Object>}` - route parameters extracted from the current
   *        `$location.path()` by applying the current route
   *
   *    - `resolve` - `{Object.<string, function>=}` - An optional map of dependencies which should
   *      be injected into the controller. If any of these dependencies are promises, the router
   *      will wait for them all to be resolved or one to be rejected before the controller is
   *      instantiated.
   *      If all the promises are resolved successfully, the values of the resolved promises are
   *      injected and {@link ngRoute.$route#$routeChangeSuccess $routeChangeSuccess} event is
   *      fired. If any of the promises are rejected the
   *      {@link ngRoute.$route#$routeChangeError $routeChangeError} event is fired. The map object
   *      is:
   *
   *      - `key` – `{string}`: a name of a dependency to be injected into the controller.
   *      - `factory` - `{string|function}`: If `string` then it is an alias for a service.
   *        Otherwise if function, then it is {@link auto.$injector#invoke injected}
   *        and the return value is treated as the dependency. If the result is a promise, it is
   *        resolved before its value is injected into the controller. Be aware that
   *        `ngRoute.$routeParams` will still refer to the previous route within these resolve
   *        functions.  Use `$route.current.params` to access the new route parameters, instead.
   *
   *    - `redirectTo` – {(string|function())=} – value to update
   *      {@link ng.$location $location} path with and trigger route redirection.
   *
   *      If `redirectTo` is a function, it will be called with the following parameters:
   *
   *      - `{Object.<string>}` - route parameters extracted from the current
   *        `$location.path()` by applying the current route templateUrl.
   *      - `{string}` - current `$location.path()`
   *      - `{Object}` - current `$location.search()`
   *
   *      The custom `redirectTo` function is expected to return a string which will be used
   *      to update `$location.path()` and `$location.search()`.
   *
   *    - `[reloadOnSearch=true]` - {boolean=} - reload route when only `$location.search()`
   *      or `$location.hash()` changes.
   *
   *      If the option is set to `false` and url in the browser changes, then
   *      `$routeUpdate` event is broadcasted on the root scope.
   *
   *    - `[caseInsensitiveMatch=false]` - {boolean=} - match routes without being case sensitive
   *
   *      If the option is set to `true`, then the particular route can be matched without being
   *      case sensitive
   *
   * @returns {Object} self
   *
   * @description
   * Adds a new route definition to the `$route` service.
   */
  this.when = function(path, route) {
    //copy original route object to preserve params inherited from proto chain
    var routeCopy = angular.copy(route);
    if (angular.isUndefined(routeCopy.reloadOnSearch)) {
      routeCopy.reloadOnSearch = true;
    }
    if (angular.isUndefined(routeCopy.caseInsensitiveMatch)) {
      routeCopy.caseInsensitiveMatch = this.caseInsensitiveMatch;
    }
    routes[path] = angular.extend(
      routeCopy,
      path && pathRegExp(path, routeCopy)
    );

    // create redirection for trailing slashes
    if (path) {
      var redirectPath = (path[path.length - 1] == '/')
            ? path.substr(0, path.length - 1)
            : path + '/';

      routes[redirectPath] = angular.extend(
        {redirectTo: path},
        pathRegExp(redirectPath, routeCopy)
      );
    }

    return this;
  };

  /**
   * @ngdoc property
   * @name $routeProvider#caseInsensitiveMatch
   * @description
   *
   * A boolean property indicating if routes defined
   * using this provider should be matched using a case insensitive
   * algorithm. Defaults to `false`.
   */
  this.caseInsensitiveMatch = false;

   /**
    * @param path {string} path
    * @param opts {Object} options
    * @return {?Object}
    *
    * @description
    * Normalizes the given path, returning a regular expression
    * and the original path.
    *
    * Inspired by pathRexp in visionmedia/express/lib/utils.js.
    */
  function pathRegExp(path, opts) {
    var insensitive = opts.caseInsensitiveMatch,
        ret = {
          originalPath: path,
          regexp: path
        },
        keys = ret.keys = [];

    path = path
      .replace(/([().])/g, '\\$1')
      .replace(/(\/)?:(\w+)([\?\*])?/g, function(_, slash, key, option) {
        var optional = option === '?' ? option : null;
        var star = option === '*' ? option : null;
        keys.push({ name: key, optional: !!optional });
        slash = slash || '';
        return ''
          + (optional ? '' : slash)
          + '(?:'
          + (optional ? slash : '')
          + (star && '(.+?)' || '([^/]+)')
          + (optional || '')
          + ')'
          + (optional || '');
      })
      .replace(/([\/$\*])/g, '\\$1');

    ret.regexp = new RegExp('^' + path + '$', insensitive ? 'i' : '');
    return ret;
  }

  /**
   * @ngdoc method
   * @name $routeProvider#otherwise
   *
   * @description
   * Sets route definition that will be used on route change when no other route definition
   * is matched.
   *
   * @param {Object|string} params Mapping information to be assigned to `$route.current`.
   * If called with a string, the value maps to `redirectTo`.
   * @returns {Object} self
   */
  this.otherwise = function(params) {
    if (typeof params === 'string') {
      params = {redirectTo: params};
    }
    this.when(null, params);
    return this;
  };


  this.$get = ['$rootScope',
               '$location',
               '$routeParams',
               '$q',
               '$injector',
               '$templateRequest',
               '$sce',
      function($rootScope, $location, $routeParams, $q, $injector, $templateRequest, $sce) {

    /**
     * @ngdoc service
     * @name $route
     * @requires $location
     * @requires $routeParams
     *
     * @property {Object} current Reference to the current route definition.
     * The route definition contains:
     *
     *   - `controller`: The controller constructor as define in route definition.
     *   - `locals`: A map of locals which is used by {@link ng.$controller $controller} service for
     *     controller instantiation. The `locals` contain
     *     the resolved values of the `resolve` map. Additionally the `locals` also contain:
     *
     *     - `$scope` - The current route scope.
     *     - `$template` - The current route template HTML.
     *
     * @property {Object} routes Object with all route configuration Objects as its properties.
     *
     * @description
     * `$route` is used for deep-linking URLs to controllers and views (HTML partials).
     * It watches `$location.url()` and tries to map the path to an existing route definition.
     *
     * Requires the {@link ngRoute `ngRoute`} module to be installed.
     *
     * You can define routes through {@link ngRoute.$routeProvider $routeProvider}'s API.
     *
     * The `$route` service is typically used in conjunction with the
     * {@link ngRoute.directive:ngView `ngView`} directive and the
     * {@link ngRoute.$routeParams `$routeParams`} service.
     *
     * @example
     * This example shows how changing the URL hash causes the `$route` to match a route against the
     * URL, and the `ngView` pulls in the partial.
     *
     * <example name="$route-service" module="ngRouteExample"
     *          deps="angular-route.js" fixBase="true">
     *   <file name="index.html">
     *     <div ng-controller="MainController">
     *       Choose:
     *       <a href="Book/Moby">Moby</a> |
     *       <a href="Book/Moby/ch/1">Moby: Ch1</a> |
     *       <a href="Book/Gatsby">Gatsby</a> |
     *       <a href="Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
     *       <a href="Book/Scarlet">Scarlet Letter</a><br/>
     *
     *       <div ng-view></div>
     *
     *       <hr />
     *
     *       <pre>$location.path() = {{$location.path()}}</pre>
     *       <pre>$route.current.templateUrl = {{$route.current.templateUrl}}</pre>
     *       <pre>$route.current.params = {{$route.current.params}}</pre>
     *       <pre>$route.current.scope.name = {{$route.current.scope.name}}</pre>
     *       <pre>$routeParams = {{$routeParams}}</pre>
     *     </div>
     *   </file>
     *
     *   <file name="book.html">
     *     controller: {{name}}<br />
     *     Book Id: {{params.bookId}}<br />
     *   </file>
     *
     *   <file name="chapter.html">
     *     controller: {{name}}<br />
     *     Book Id: {{params.bookId}}<br />
     *     Chapter Id: {{params.chapterId}}
     *   </file>
     *
     *   <file name="script.js">
     *     angular.module('ngRouteExample', ['ngRoute'])
     *
     *      .controller('MainController', function($scope, $route, $routeParams, $location) {
     *          $scope.$route = $route;
     *          $scope.$location = $location;
     *          $scope.$routeParams = $routeParams;
     *      })
     *
     *      .controller('BookController', function($scope, $routeParams) {
     *          $scope.name = "BookController";
     *          $scope.params = $routeParams;
     *      })
     *
     *      .controller('ChapterController', function($scope, $routeParams) {
     *          $scope.name = "ChapterController";
     *          $scope.params = $routeParams;
     *      })
     *
     *     .config(function($routeProvider, $locationProvider) {
     *       $routeProvider
     *        .when('/Book/:bookId', {
     *         templateUrl: 'book.html',
     *         controller: 'BookController',
     *         resolve: {
     *           // I will cause a 1 second delay
     *           delay: function($q, $timeout) {
     *             var delay = $q.defer();
     *             $timeout(delay.resolve, 1000);
     *             return delay.promise;
     *           }
     *         }
     *       })
     *       .when('/Book/:bookId/ch/:chapterId', {
     *         templateUrl: 'chapter.html',
     *         controller: 'ChapterController'
     *       });
     *
     *       // configure html5 to get links working on jsfiddle
     *       $locationProvider.html5Mode(true);
     *     });
     *
     *   </file>
     *
     *   <file name="protractor.js" type="protractor">
     *     it('should load and compile correct template', function() {
     *       element(by.linkText('Moby: Ch1')).click();
     *       var content = element(by.css('[ng-view]')).getText();
     *       expect(content).toMatch(/controller\: ChapterController/);
     *       expect(content).toMatch(/Book Id\: Moby/);
     *       expect(content).toMatch(/Chapter Id\: 1/);
     *
     *       element(by.partialLinkText('Scarlet')).click();
     *
     *       content = element(by.css('[ng-view]')).getText();
     *       expect(content).toMatch(/controller\: BookController/);
     *       expect(content).toMatch(/Book Id\: Scarlet/);
     *     });
     *   </file>
     * </example>
     */

    /**
     * @ngdoc event
     * @name $route#$routeChangeStart
     * @eventType broadcast on root scope
     * @description
     * Broadcasted before a route change. At this  point the route services starts
     * resolving all of the dependencies needed for the route change to occur.
     * Typically this involves fetching the view template as well as any dependencies
     * defined in `resolve` route property. Once  all of the dependencies are resolved
     * `$routeChangeSuccess` is fired.
     *
     * The route change (and the `$location` change that triggered it) can be prevented
     * by calling `preventDefault` method of the event. See {@link ng.$rootScope.Scope#$on}
     * for more details about event object.
     *
     * @param {Object} angularEvent Synthetic event object.
     * @param {Route} next Future route information.
     * @param {Route} current Current route information.
     */

    /**
     * @ngdoc event
     * @name $route#$routeChangeSuccess
     * @eventType broadcast on root scope
     * @description
     * Broadcasted after a route dependencies are resolved.
     * {@link ngRoute.directive:ngView ngView} listens for the directive
     * to instantiate the controller and render the view.
     *
     * @param {Object} angularEvent Synthetic event object.
     * @param {Route} current Current route information.
     * @param {Route|Undefined} previous Previous route information, or undefined if current is
     * first route entered.
     */

    /**
     * @ngdoc event
     * @name $route#$routeChangeError
     * @eventType broadcast on root scope
     * @description
     * Broadcasted if any of the resolve promises are rejected.
     *
     * @param {Object} angularEvent Synthetic event object
     * @param {Route} current Current route information.
     * @param {Route} previous Previous route information.
     * @param {Route} rejection Rejection of the promise. Usually the error of the failed promise.
     */

    /**
     * @ngdoc event
     * @name $route#$routeUpdate
     * @eventType broadcast on root scope
     * @description
     *
     * The `reloadOnSearch` property has been set to false, and we are reusing the same
     * instance of the Controller.
     */

    var forceReload = false,
        preparedRoute,
        preparedRouteIsUpdateOnly,
        $route = {
          routes: routes,

          /**
           * @ngdoc method
           * @name $route#reload
           *
           * @description
           * Causes `$route` service to reload the current route even if
           * {@link ng.$location $location} hasn't changed.
           *
           * As a result of that, {@link ngRoute.directive:ngView ngView}
           * creates new scope and reinstantiates the controller.
           */
          reload: function() {
            forceReload = true;
            $rootScope.$evalAsync(function() {
              // Don't support cancellation of a reload for now...
              prepareRoute();
              commitRoute();
            });
          },

          /**
           * @ngdoc method
           * @name $route#updateParams
           *
           * @description
           * Causes `$route` service to update the current URL, replacing
           * current route parameters with those specified in `newParams`.
           * Provided property names that match the route's path segment
           * definitions will be interpolated into the location's path, while
           * remaining properties will be treated as query params.
           *
           * @param {!Object<string, string>} newParams mapping of URL parameter names to values
           */
          updateParams: function(newParams) {
            if (this.current && this.current.$$route) {
              newParams = angular.extend({}, this.current.params, newParams);
              $location.path(interpolate(this.current.$$route.originalPath, newParams));
              // interpolate modifies newParams, only query params are left
              $location.search(newParams);
            } else {
              throw $routeMinErr('norout', 'Tried updating route when with no current route');
            }
          }
        };

    $rootScope.$on('$locationChangeStart', prepareRoute);
    $rootScope.$on('$locationChangeSuccess', commitRoute);

    return $route;

    /////////////////////////////////////////////////////

    /**
     * @param on {string} current url
     * @param route {Object} route regexp to match the url against
     * @return {?Object}
     *
     * @description
     * Check if the route matches the current url.
     *
     * Inspired by match in
     * visionmedia/express/lib/router/router.js.
     */
    function switchRouteMatcher(on, route) {
      var keys = route.keys,
          params = {};

      if (!route.regexp) return null;

      var m = route.regexp.exec(on);
      if (!m) return null;

      for (var i = 1, len = m.length; i < len; ++i) {
        var key = keys[i - 1];

        var val = m[i];

        if (key && val) {
          params[key.name] = val;
        }
      }
      return params;
    }

    function prepareRoute($locationEvent) {
      var lastRoute = $route.current;

      preparedRoute = parseRoute();
      preparedRouteIsUpdateOnly = preparedRoute && lastRoute && preparedRoute.$$route === lastRoute.$$route
          && angular.equals(preparedRoute.pathParams, lastRoute.pathParams)
          && !preparedRoute.reloadOnSearch && !forceReload;

      if (!preparedRouteIsUpdateOnly && (lastRoute || preparedRoute)) {
        if ($rootScope.$broadcast('$routeChangeStart', preparedRoute, lastRoute).defaultPrevented) {
          if ($locationEvent) {
            $locationEvent.preventDefault();
          }
        }
      }
    }

    function commitRoute() {
      var lastRoute = $route.current;
      var nextRoute = preparedRoute;

      if (preparedRouteIsUpdateOnly) {
        lastRoute.params = nextRoute.params;
        angular.copy(lastRoute.params, $routeParams);
        $rootScope.$broadcast('$routeUpdate', lastRoute);
      } else if (nextRoute || lastRoute) {
        forceReload = false;
        $route.current = nextRoute;
        if (nextRoute) {
          if (nextRoute.redirectTo) {
            if (angular.isString(nextRoute.redirectTo)) {
              $location.path(interpolate(nextRoute.redirectTo, nextRoute.params)).search(nextRoute.params)
                       .replace();
            } else {
              $location.url(nextRoute.redirectTo(nextRoute.pathParams, $location.path(), $location.search()))
                       .replace();
            }
          }
        }

        $q.when(nextRoute).
          then(function() {
            if (nextRoute) {
              var locals = angular.extend({}, nextRoute.resolve),
                  template, templateUrl;

              angular.forEach(locals, function(value, key) {
                locals[key] = angular.isString(value) ?
                    $injector.get(value) : $injector.invoke(value, null, null, key);
              });

              if (angular.isDefined(template = nextRoute.template)) {
                if (angular.isFunction(template)) {
                  template = template(nextRoute.params);
                }
              } else if (angular.isDefined(templateUrl = nextRoute.templateUrl)) {
                if (angular.isFunction(templateUrl)) {
                  templateUrl = templateUrl(nextRoute.params);
                }
                templateUrl = $sce.getTrustedResourceUrl(templateUrl);
                if (angular.isDefined(templateUrl)) {
                  nextRoute.loadedTemplateUrl = templateUrl;
                  template = $templateRequest(templateUrl);
                }
              }
              if (angular.isDefined(template)) {
                locals['$template'] = template;
              }
              return $q.all(locals);
            }
          }).
          // after route change
          then(function(locals) {
            if (nextRoute == $route.current) {
              if (nextRoute) {
                nextRoute.locals = locals;
                angular.copy(nextRoute.params, $routeParams);
              }
              $rootScope.$broadcast('$routeChangeSuccess', nextRoute, lastRoute);
            }
          }, function(error) {
            if (nextRoute == $route.current) {
              $rootScope.$broadcast('$routeChangeError', nextRoute, lastRoute, error);
            }
          });
      }
    }


    /**
     * @returns {Object} the current active route, by matching it against the URL
     */
    function parseRoute() {
      // Match a route
      var params, match;
      angular.forEach(routes, function(route, path) {
        if (!match && (params = switchRouteMatcher($location.path(), route))) {
          match = inherit(route, {
            params: angular.extend({}, $location.search(), params),
            pathParams: params});
          match.$$route = route;
        }
      });
      // No route matched; fallback to "otherwise" route
      return match || routes[null] && inherit(routes[null], {params: {}, pathParams:{}});
    }

    /**
     * @returns {string} interpolation of the redirect path with the parameters
     */
    function interpolate(string, params) {
      var result = [];
      angular.forEach((string || '').split(':'), function(segment, i) {
        if (i === 0) {
          result.push(segment);
        } else {
          var segmentMatch = segment.match(/(\w+)(?:[?*])?(.*)/);
          var key = segmentMatch[1];
          result.push(params[key]);
          result.push(segmentMatch[2] || '');
          delete params[key];
        }
      });
      return result.join('');
    }
  }];
}

ngRouteModule.provider('$routeParams', $RouteParamsProvider);


/**
 * @ngdoc service
 * @name $routeParams
 * @requires $route
 *
 * @description
 * The `$routeParams` service allows you to retrieve the current set of route parameters.
 *
 * Requires the {@link ngRoute `ngRoute`} module to be installed.
 *
 * The route parameters are a combination of {@link ng.$location `$location`}'s
 * {@link ng.$location#search `search()`} and {@link ng.$location#path `path()`}.
 * The `path` parameters are extracted when the {@link ngRoute.$route `$route`} path is matched.
 *
 * In case of parameter name collision, `path` params take precedence over `search` params.
 *
 * The service guarantees that the identity of the `$routeParams` object will remain unchanged
 * (but its properties will likely change) even when a route change occurs.
 *
 * Note that the `$routeParams` are only updated *after* a route change completes successfully.
 * This means that you cannot rely on `$routeParams` being correct in route resolve functions.
 * Instead you can use `$route.current.params` to access the new route's parameters.
 *
 * @example
 * ```js
 *  // Given:
 *  // URL: http://server.com/index.html#/Chapter/1/Section/2?search=moby
 *  // Route: /Chapter/:chapterId/Section/:sectionId
 *  //
 *  // Then
 *  $routeParams ==> {chapterId:'1', sectionId:'2', search:'moby'}
 * ```
 */
function $RouteParamsProvider() {
  this.$get = function() { return {}; };
}

ngRouteModule.directive('ngView', ngViewFactory);
ngRouteModule.directive('ngView', ngViewFillContentFactory);


/**
 * @ngdoc directive
 * @name ngView
 * @restrict ECA
 *
 * @description
 * # Overview
 * `ngView` is a directive that complements the {@link ngRoute.$route $route} service by
 * including the rendered template of the current route into the main layout (`index.html`) file.
 * Every time the current route changes, the included view changes with it according to the
 * configuration of the `$route` service.
 *
 * Requires the {@link ngRoute `ngRoute`} module to be installed.
 *
 * @animations
 * enter - animation is used to bring new content into the browser.
 * leave - animation is used to animate existing content away.
 *
 * The enter and leave animation occur concurrently.
 *
 * @scope
 * @priority 400
 * @param {string=} onload Expression to evaluate whenever the view updates.
 *
 * @param {string=} autoscroll Whether `ngView` should call {@link ng.$anchorScroll
 *                  $anchorScroll} to scroll the viewport after the view is updated.
 *
 *                  - If the attribute is not set, disable scrolling.
 *                  - If the attribute is set without value, enable scrolling.
 *                  - Otherwise enable scrolling only if the `autoscroll` attribute value evaluated
 *                    as an expression yields a truthy value.
 * @example
    <example name="ngView-directive" module="ngViewExample"
             deps="angular-route.js;angular-animate.js"
             animations="true" fixBase="true">
      <file name="index.html">
        <div ng-controller="MainCtrl as main">
          Choose:
          <a href="Book/Moby">Moby</a> |
          <a href="Book/Moby/ch/1">Moby: Ch1</a> |
          <a href="Book/Gatsby">Gatsby</a> |
          <a href="Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
          <a href="Book/Scarlet">Scarlet Letter</a><br/>

          <div class="view-animate-container">
            <div ng-view class="view-animate"></div>
          </div>
          <hr />

          <pre>$location.path() = {{main.$location.path()}}</pre>
          <pre>$route.current.templateUrl = {{main.$route.current.templateUrl}}</pre>
          <pre>$route.current.params = {{main.$route.current.params}}</pre>
          <pre>$routeParams = {{main.$routeParams}}</pre>
        </div>
      </file>

      <file name="book.html">
        <div>
          controller: {{book.name}}<br />
          Book Id: {{book.params.bookId}}<br />
        </div>
      </file>

      <file name="chapter.html">
        <div>
          controller: {{chapter.name}}<br />
          Book Id: {{chapter.params.bookId}}<br />
          Chapter Id: {{chapter.params.chapterId}}
        </div>
      </file>

      <file name="animations.css">
        .view-animate-container {
          position:relative;
          height:100px!important;
          background:white;
          border:1px solid black;
          height:40px;
          overflow:hidden;
        }

        .view-animate {
          padding:10px;
        }

        .view-animate.ng-enter, .view-animate.ng-leave {
          -webkit-transition:all cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.5s;
          transition:all cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.5s;

          display:block;
          width:100%;
          border-left:1px solid black;

          position:absolute;
          top:0;
          left:0;
          right:0;
          bottom:0;
          padding:10px;
        }

        .view-animate.ng-enter {
          left:100%;
        }
        .view-animate.ng-enter.ng-enter-active {
          left:0;
        }
        .view-animate.ng-leave.ng-leave-active {
          left:-100%;
        }
      </file>

      <file name="script.js">
        angular.module('ngViewExample', ['ngRoute', 'ngAnimate'])
          .config(['$routeProvider', '$locationProvider',
            function($routeProvider, $locationProvider) {
              $routeProvider
                .when('/Book/:bookId', {
                  templateUrl: 'book.html',
                  controller: 'BookCtrl',
                  controllerAs: 'book'
                })
                .when('/Book/:bookId/ch/:chapterId', {
                  templateUrl: 'chapter.html',
                  controller: 'ChapterCtrl',
                  controllerAs: 'chapter'
                });

              $locationProvider.html5Mode(true);
          }])
          .controller('MainCtrl', ['$route', '$routeParams', '$location',
            function($route, $routeParams, $location) {
              this.$route = $route;
              this.$location = $location;
              this.$routeParams = $routeParams;
          }])
          .controller('BookCtrl', ['$routeParams', function($routeParams) {
            this.name = "BookCtrl";
            this.params = $routeParams;
          }])
          .controller('ChapterCtrl', ['$routeParams', function($routeParams) {
            this.name = "ChapterCtrl";
            this.params = $routeParams;
          }]);

      </file>

      <file name="protractor.js" type="protractor">
        it('should load and compile correct template', function() {
          element(by.linkText('Moby: Ch1')).click();
          var content = element(by.css('[ng-view]')).getText();
          expect(content).toMatch(/controller\: ChapterCtrl/);
          expect(content).toMatch(/Book Id\: Moby/);
          expect(content).toMatch(/Chapter Id\: 1/);

          element(by.partialLinkText('Scarlet')).click();

          content = element(by.css('[ng-view]')).getText();
          expect(content).toMatch(/controller\: BookCtrl/);
          expect(content).toMatch(/Book Id\: Scarlet/);
        });
      </file>
    </example>
 */


/**
 * @ngdoc event
 * @name ngView#$viewContentLoaded
 * @eventType emit on the current ngView scope
 * @description
 * Emitted every time the ngView content is reloaded.
 */
ngViewFactory.$inject = ['$route', '$anchorScroll', '$animate'];
function ngViewFactory($route, $anchorScroll, $animate) {
  return {
    restrict: 'ECA',
    terminal: true,
    priority: 400,
    transclude: 'element',
    link: function(scope, $element, attr, ctrl, $transclude) {
        var currentScope,
            currentElement,
            previousLeaveAnimation,
            autoScrollExp = attr.autoscroll,
            onloadExp = attr.onload || '';

        scope.$on('$routeChangeSuccess', update);
        update();

        function cleanupLastView() {
          if (previousLeaveAnimation) {
            $animate.cancel(previousLeaveAnimation);
            previousLeaveAnimation = null;
          }

          if (currentScope) {
            currentScope.$destroy();
            currentScope = null;
          }
          if (currentElement) {
            previousLeaveAnimation = $animate.leave(currentElement);
            previousLeaveAnimation.then(function() {
              previousLeaveAnimation = null;
            });
            currentElement = null;
          }
        }

        function update() {
          var locals = $route.current && $route.current.locals,
              template = locals && locals.$template;

          if (angular.isDefined(template)) {
            var newScope = scope.$new();
            var current = $route.current;

            // Note: This will also link all children of ng-view that were contained in the original
            // html. If that content contains controllers, ... they could pollute/change the scope.
            // However, using ng-view on an element with additional content does not make sense...
            // Note: We can't remove them in the cloneAttchFn of $transclude as that
            // function is called before linking the content, which would apply child
            // directives to non existing elements.
            var clone = $transclude(newScope, function(clone) {
              $animate.enter(clone, null, currentElement || $element).then(function onNgViewEnter() {
                if (angular.isDefined(autoScrollExp)
                  && (!autoScrollExp || scope.$eval(autoScrollExp))) {
                  $anchorScroll();
                }
              });
              cleanupLastView();
            });

            currentElement = clone;
            currentScope = current.scope = newScope;
            currentScope.$emit('$viewContentLoaded');
            currentScope.$eval(onloadExp);
          } else {
            cleanupLastView();
          }
        }
    }
  };
}

// This directive is called during the $transclude call of the first `ngView` directive.
// It will replace and compile the content of the element with the loaded template.
// We need this directive so that the element content is already filled when
// the link function of another directive on the same element as ngView
// is called.
ngViewFillContentFactory.$inject = ['$compile', '$controller', '$route'];
function ngViewFillContentFactory($compile, $controller, $route) {
  return {
    restrict: 'ECA',
    priority: -400,
    link: function(scope, $element) {
      var current = $route.current,
          locals = current.locals;

      $element.html(locals.$template);

      var link = $compile($element.contents());

      if (current.controller) {
        locals.$scope = scope;
        var controller = $controller(current.controller, locals);
        if (current.controllerAs) {
          scope[current.controllerAs] = controller;
        }
        $element.data('$ngControllerController', controller);
        $element.children().data('$ngControllerController', controller);
      }

      link(scope);
    }
  };
}


})(window, window.angular);

var uppercaseFirstLetter = function (input) {
    return (!!input) ? input.replace(/^(.)|(\s|\-)(.)/g, function ($1) {
        return $1.toUpperCase();
    }) : '';
}

var lowercaseFirstLetter = function (input) {
    return (!!input) ? input.replace(/^(.)|(\s|\-)(.)/g, function ($1) {
        return $1.toLowerCase();
    }) : '';
}

Object.byString = function (o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    while (a.length) {
        var n = a.shift();
        if (n in o) {
            o = o[n];
        } else {
            return;
        }
    }
    return o;
}

var deserializeXml = function (xml, nodeName, options) {
    // options = {upperFirstLetter: true, boolItems: [], dateItems: []}

    options = options || {};

    var upperCaseItems = function (input) {
        var items = [];
        if (input && input.length) {
            $.each(input, function (index, item) {
                items.push(item.toUpperCase());
            });
        }
        return items;
    }

    var convertAttrName = function (name) {
        if (options.upperFirstLetter)
            return uppercaseFirstLetter(name);
        else

            return name;
    }

    var intItems = upperCaseItems(options.intItems);
    var boolItems = upperCaseItems(options.boolItems);
    var dateItems = upperCaseItems(options.dateItems);
    var jsonItems = upperCaseItems(options.jsonItems);

    var $xml = null;

    if (angular.isString(xml)) {
        xml = $.parseXML(xml);
    }

    $xml = $(xml);

    var $el = $xml.find(nodeName);

    var items = [];

    $el.each(function (index, element) {
        var obj = {};
        $.each(element.attributes, function (index,key) {
            var value = key.value;

            if (boolItems.indexOf(key.name.toUpperCase()) >= 0)
                value = key.value == '1' || key.value == 'true';

            if (intItems.indexOf(key.name.toUpperCase()) >= 0)
                value = key.value == 0 ? null : parseInt(key.value);

            if (jsonItems.indexOf(key.name.toUpperCase()) >= 0) {
                if (!key.value)
                    value = {};
                else
                    value = angular.fromJson(key.value.replace(/###/gi, '"'));
            }

            if (dateItems.indexOf(key.name.toUpperCase()) >= 0)
            {
                value = !key.value || key.value.substr(0, 8) == '1/1/1900' ? null : key.value;
            }
          
            obj[convertAttrName(key.name)] = value;

        });

        if (Object.keys(obj).length > 0)
            items.push(obj);
    });
    return items;
}



var paf = angular.module('paf', ['ui.bootstrap', 'ngRoute']);

paf.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .when('/edit/:id', {
        controller: 'pafCtrl',
        template: window['_yCs'][0]
    })
    .when('/new', {
        controller: 'pafCtrl',
        template: window['_yCs'][0]

    })
    .when('/list', {
        controller: 'pafListCtrl',
        template: window['_yCs'][1]

    })
    .otherwise({
        redirectTo: '/list'
    });
}]);

// 

paf.controller('pafCtrl', ['$scope', '$document', 'EmpActions', '$filter', '$timeout', '$routeParams', '$modal', '$location', function ($scope, $document, EmpActions, $filter, $timeout, $routeParams, $modal, $location) {
    $scope.HcmHouseCodes = [];
    $scope.viewLoading = false;

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1,
        showWeeks: false
    };

    $scope.lkup = {
        CarAllowances: EmpActions.getCarAllowances(),
        BounsEligibles: null,
        PlanDetails: null,
        Reason4Changes: null,
        Layoffs: null,
        Terminations: null,
        Resignations: null
    }

    $scope.HcmHouseCodes = [];
    $scope.States = [];

    $scope.empAction = {
        Number: 0,
        HcmHouseCode: null,
        EmployeeNumber: null,
        FirstName: null,
        LastName: null,
        NewHire: false,
        ReHire: false,
        Separation: false,
        Loa: false,
        SalaryChange: false,
        Promotion: false,
        Demotion: false,
        Transfer: false,
        PersonalInfoChange: false,
        Relocation: false,
        Data: {
            NewHire: {},
            ReHire: {},
            Separation: {},
            Loa: {},
            Promotion: {},
            Demotion: {},
            SalaryChange: {},
            Transfer: {},
            PersonalInfoChange: {},
            Relocation: {},
            Requisition: {}
        }
    }

    var loadPersonActionTypes = function () {
        EmpActions.getPersonActionTypes(function (result) {
            var filters = function (item) {
                return $filter('filter')(result, { typeName: item });
            }
            $scope.lkup.BounsEligibles = filters("BonusEligible");
            $scope.lkup.PlanDetails = filters("Plan");
            $scope.lkup.Reason4Changes = filters("Reason4Change");
            $scope.lkup.Layoffs = filters("Layoff");
            $scope.lkup.Terminations = filters("Termination");
            $scope.lkup.Resignations = filters("Resignation");
        });
    }
    var loadStateTypes = function () {
        EmpActions.getStateTypes(function (result) {
            $scope.States = result;
        });
    }
    var loadHouseCodes = function () {
        EmpActions.getHcmHouseCodes(function (result) {
            $scope.HcmHouseCodes = result;
        });
    }
    var loadJobCodes = function () {
        EmpActions.getJobCodes(function (result) {
            $scope.JobCodes = result;
        });
    }
    var loadPayGrades = function () {
        EmpActions.getPayGrades(function (result) {
            $scope.PayGrades = result;
        });
    }

    var initReporting = function (positionType) {
        if (!$scope.empAction.Data.Compensation)
            return;

        var items = ["NewHire", "ReHire", "Promotion", "Demotion", "SalaryChange", "Transfer"];
        if (angular.isDefined(positionType) && items.indexOf(positionType) >= 0 && $scope.empAction.Data.Compensation) {
            $scope.empAction.Data[positionType].ReportingName = $scope.empAction.Data.Compensation.ReportingName;
            $scope.empAction.Data[positionType].ReportingTitle = $scope.empAction.Data.Compensation.ReportingTitle;
            $scope.empAction.Data[positionType].ReportingEmail = $scope.empAction.Data.Compensation.ReportingEmail;
        }
        else {
            angular.forEach(items, function (item, index) {
                if (!$scope.empAction.Data[item].ReportingName) {
                    $scope.empAction.Data[item].ReportingName = $scope.empAction.Data.Compensation.ReportingName;
                    $scope.empAction.Data[item].ReportingTitle = $scope.empAction.Data.Compensation.ReportingTitle;
                    $scope.empAction.Data[item].ReportingEmail = $scope.empAction.Data.Compensation.ReportingEmail;
                }
            });
        }
    }

    var loadCompensations = function (employeeNumber, positionType) {

        EmpActions.getEmpCompensation(employeeNumber, function (response) {

            $scope.empAction.Data.Compensation = {
                CurrentPayGrade: response.payGrade + " (" + response.minPayRange + " - " + response.midPayRange + " - " + response.maxPayRange + ")",
                CurrentSalary: parseFloat(response.annualPayAmt).toFixed(3),
                CurrentPayRange: $scope.getPayRange(response.payGrade, response.annualPayAmt),
                ReportingName: response.mgrFirstName + " " + response.mgrLastName,
                ReportingTitle: response.mgrTitle,
                ReportingEmail: response.mgrEmail,
                DateLastIncrease: $filter("date")(new Date(response.dateBeg), "MM/dd/yyyy"),
                PercentLastIncrease: ((response.annualPayAmt - response.priorAnnualPayAmt) / response.priorAnnualPayAmt).toFixed(3),
                CurrentPosition: response.mgrTitle,
                EmployeeNumber: response.empNumber
            }

            initReporting();
        });
    }

    var loadEmployee = function (employeeNumber, callback) {
        EmpActions.getEmployee(employeeNumber, 0, function (result) {
            $scope.empAction.Data.Employee = null;
            $scope.empAction.Data.Person = null;
            $scope.empAction.Data.Compensation = null;

            if (result == null) {
                callback(false);
            }
            else {
                $scope.empAction.EmployeeId = result.id;
                $scope.empAction.Data.Employee = result;
                $scope.empAction.Data.Employee.HcmHouseCode = EmpActions.getHcmHouseCodeByBrief(result.houseCode);
                $scope.empAction.HcmHouseCode = EmpActions.getHcmHouseCodeByBrief(result.houseCode);

                loadCompensations(employeeNumber);

                EmpActions.getPerson(result.id, function (response) {
                    $scope.empAction.PersonId = response.id;
                    $scope.empAction.FirstName = result.firstName;
                    $scope.empAction.MiddleName = response.middleName;
                    $scope.empAction.LastName = result.lastName;
                    $scope.empAction.AddressLine1 = response.addressLine1;
                    $scope.empAction.AddressLine2 = response.addressLine2;
                    $scope.empAction.City = response.city;
                    $scope.empAction.Phone = response.homePhone;
                    $scope.empAction.PostalCode = response.postalCode;
                    $scope.empAction.StateType = parseInt(response.state);
                    $scope.empAction.Data.Person = response;

                    callback(true);
                });
            }
        });
    }

    var lastEmployeeNumber = null;

    var init = function () {

        loadPersonActionTypes();
        loadStateTypes();
        loadHouseCodes();
        loadJobCodes();
        loadPayGrades();

    }

    $scope.getPayRange = function (payGrade, salary) {
        if (!payGrade || isNaN(salary))
            return '';

        var payGradeItem = $filter('filter')($scope.PayGrades, function (item) {
            return item.id == payGrade;
        });

        if (!payGradeItem)
            return '';
        payGradeItem = payGradeItem[0];

        var range = '';
        if (salary < payGradeItem.min)
            range = "Below Min";
        else if (salary == payGradeItem.min)
            range = "Min";
        else if (salary > payGradeItem.min && salary < payGradeItem.mid)
            range = "Min to Mid";
        else if (salary == payGradeItem.mid)
            range = "Mid";
        else if (salary > payGradeItem.mid && salary < payGradeItem.max)
            range = "Mid to Max";
        else if (salary == payGradeItem.max)
            range = "Max";
        else if (salary > payGradeItem.max)
            range = "Over Max";
        else
            range = "";

        return range;
    }

    init();

    if ($routeParams.id) {

        EmpActions.findEmployeePersonnelAction($routeParams.id, function (result) {
            if (!result) {
                $location.path('/list');
                return;
            }
            $scope.empAction = result;

            loadCompensations($scope.empAction.EmployeeNumber);
        });
    }

    var validateHcmHouseCode = function () {
        if ($scope.empAction.Data.Employee && $scope.empAction.Data.Employee.HcmHouseCode != $scope.empAction.HcmHouseCode) {
            $scope.pafForm.HcmHouseCode.$setValidity("matched", false);
        }
        else
            $scope.pafForm.HcmHouseCode.$setValidity("matched", true);
    }

    $scope.$watch('empAction.HcmHouseCode', function (newValue, oldValue) {
        if (!newValue && !oldValue)
            return;
        if ($scope.empAction.Data.Employee && $scope.empAction.Data.Employee.HcmHouseCode != newValue) {
            alert("House Code is not same as Employee Number House Code.");
        }
        validateHcmHouseCode();
    });

    $scope.onEmployeeNumberChanged = function (employeeNumber) {

        if ($scope.empAction.Data.Employee && $scope.empAction.Data.Employee.employeeNumber == employeeNumber)
            return;

        $scope.empAction.Data.Employee = null;
        $scope.empAction.Data.Person = null;
        $scope.empAction.Data.Compensation = null;

        if (employeeNumber) {
            loadEmployee(employeeNumber, function (matched) {
                if (matched) {
                    if ($scope.empAction.HcmHouseCode && $scope.empAction.Data.Employee.HcmHouseCode != $scope.empAction.HcmHouseCode) {
                        alert("Employee Number is out of House Code.");
                    }
                }
                validateHcmHouseCode();
            });
        }

    };

    $scope.isPersonEditable = function () {
        return $scope.empAction.Data.Person != null;
    }

    $scope.onHouseCodeChange = function () {
        if (lastEmployeeNumber != null) {

            if (_hcmHouseCode != $scope.empAction.HcmHouseCode) {
                alert("House Code is not same as Employee Number House Code.");
                $scope.pafForm.HcmHouseCode.$setValidity("required", false);
            }
            else {
                $scope.pafForm.EmployeeNumber.$setValidity("required", true);
            }
        }
        else {
            if ($scope.empAction.HcmHouseCode)
                $scope.pafForm.HcmHouseCode.$setValidity("required", true);
        }
    }

    $scope.PositionTypes = [
        { id: 'NewHire', display: 'New Hire' },
        { id: 'ReHire', display: 'Re-Hire' },
        { id: 'Separation', display: 'Separation' },
        { id: 'Loa', display: 'LOA' },
        { id: 'Promotion', display: 'Promotion' },
        { id: 'Demotion', display: 'Demotion' },
        { id: 'SalaryChange', display: 'Salary Change' },
        { id: 'Transfer', display: 'Transfer' },
        { id: 'PersonalInfoChange', display: 'Personal Info Change' },
        { id: 'Relocation', display: 'Relocation' }];

    var postionTypeGroups = [
        ['NewHire', 'ReHire', 'Separation', 'Loa'],
        ['Promotion', 'Demotion', 'SalaryChange'],
        'Transfer', 'PersonalInfoChange', 'Relocation'
    ];

    var positionFields = {
        NewHire: ["HireDate", "PositionType", "Status", "PayStatus", "FullTimeHours", "TemporaryHours", "PartTimeHours", "PerDiemValue", "AnnualSalaryAmount", "AdminHourlyAmount", "HourlyRateAmount", "PayGrade", "PayRange", "ReportingName", "ReportingTitle", "ReportingEmail", "HcmHouseCodeTrainingLocation", "TrainingContact", "Duration", "CarAllowance", "BonusEligibleType"],
        ReHire: ["HireDate", "PositionType", "Status", "PayStatus", "FullTimeHours", "TemporaryHours", "PartTimeHours", "PerDiemValue", "AnnualSalaryAmount", "AdminHourlyAmount", "HourlyRateAmount", "PayGrade", "PayRange", "ReportingName", "ReportingTitle", "ReportingEmail", "HcmHouseCodeTrainingLocation", "TrainingContact", "Duration", "CarAllowance", "BonusEligibleType"],
        Separation: ["SeparationDate", "VacationDaysDue", "PayNumberOfWeeks", "SeparationReason", "ResignationType", "TerminationType", "LayoffType", "SeparationReHire"],
        Loa: ["LoaDate", "DateOfReturn"],
        Requisition: ["RequisitionNumber", "EmailAddress"],
        Promotion: ["OldPositionType", "NewPositionType", "EffectiveDate", "ChangeReasonType", "LastIncreaseDate", "LastIncreasePercentage", "CurrentSalary", "IncreaseAmount", "IncreasePercentage", "NewSalary", "CurrentPayGrade", "NewPayGrade", "NewPayRange", "ReportingName", "ReportingTitle", "ReportingEmail", "NewCarAllowance", "NewBonusEligibleType", "Instructions"],
        Demotion: ["OldPositionType", "NewPositionType", "EffectiveDate", "ChangeReasonType", "LastIncreaseDate", "LastIncreasePercentage", "CurrentSalary", "IncreaseAmount", "IncreasePercentage", "NewSalary", "CurrentPayGrade", "NewPayGrade", "NewPayRange", "ReportingName", "ReportingTitle", "ReportingEmail", "NewCarAllowance", "NewBonusEligibleType", "Instructions"],
        SalaryChange: ["OldPositionType", "NewPositionType", "EffectiveDate", "ChangeReasonType", "LastIncreaseDate", "LastIncreasePercentage", "CurrentSalary", "IncreaseAmount", "IncreasePercentage", "NewSalary", "CurrentPayGrade", "NewPayGrade", "NewPayRange", "ReportingName", "ReportingTitle", "ReportingEmail", "NewCarAllowance", "NewBonusEligibleType", "Instructions"],
        Transfer: ["TransferEffectiveDate", "HouseCodeTransfer", "ReportingName", "ReportingTitle", "ReportingEmail"],
        PersonalInfoChange: ["InfoChangeEffectiveDate", "InfoChangeFirstName", "InfoChangeMiddleName", "InfoChangeLastName", "InfoChangeAddressLine1", "InfoChangeAddressLine2", "InfoChangePhone", "InfoChangeCity", "AppStateTypeInfoChange", "InfoChangePostalCode"],
        Relocation: ["RelocationApprovedBy", "RelocationPlan"]
    };

    var resetPositionTypeFields = function (positionType) {
        var obj = $scope.empAction.Data[positionType];

        if (angular.isObject(obj)) {
            angular.forEach(positionFields[positionType], function (item, index) {
                obj[item] = null;
            });

            initReporting(positionType);
        }
    }

    var initialEmpAction = function () {
        angular.forEach($scope.PositionTypes, function (item, index) {
            resetPositionTypeFields(item.id);
        });
    }

    initialEmpAction();


    var uncheckPositionType = function (positionType) {
        if (!$scope.empAction[positionType])
            return;

        $scope.empAction[positionType] = false;
        resetPositionTypeFields(positionType);
    }

    $scope.onPositionTypeChanged = function (positionType) {
        $scope.empAction[positionType] = !$scope.empAction[positionType];

        if ($scope.empAction[positionType])

            $.each(postionTypeGroups, function (gi, group) {

                if (group.indexOf(positionType) >= 0) {

                    $.each(group, function (ii, item) {
                        if (item != positionType)
                            uncheckPositionType(item);
                    });
                }
            });
        else {
            resetPositionTypeFields(positionType);
        }

        if (!($scope.empAction.NewHire || $scope.empAction.ReHire || $scope.empAction.SalaryChange || $scope.empAction.Promotion || $scope.empAction.Transfer || $scope.empAction.Demotion)) {
            resetPositionTypeFields('Requisition');
        }

        validateActionType();
    }

    $scope.positionTypeChecked = function (positionType) {

        return $scope.empAction[positionType];
    }

    $scope.onSalaryChange = function (type) {
        var data = null;
        if ($scope.empAction.Promotion)
            data = $scope.empAction.Data.Promotion;
        else if ($scope.empAction.Demotion)
            data = $scope.empAction.Data.Demotion;
        else
            data = $scope.empAction.Data.SalaryChange;

        var currentSalary = $scope.empAction.Data.Compensation.CurrentSalary;
        var increaseAmt = data.IncreaseAmount;
        var increasePercentage = data.IncreasePercentage;

        if (increaseAmt == null || increaseAmt == "")
            increaseAmt = 0;
        else if (increasePercentage == null || increasePercentage == "")
            increasePercentage = 0;

        increaseAmt = parseFloat(increaseAmt);
        increasePercentage = parseFloat(increasePercentage);

        if (currentSalary) {
            currentSalary = parseFloat(currentSalary);
            if (type == 'amt')
                data.IncreasePercentage = (increaseAmt * 100 / currentSalary).toFixed(3);
            else if (type == 'percentage')
                data.IncreaseAmount = (increasePercentage * currentSalary / 100).toFixed(3);


            if (!$scope.empAction.Demotion)
                data.NewSalary = (currentSalary + parseFloat(data.IncreaseAmount)).toFixed(3);
            else
                data.NewSalary = (currentSalary - parseFloat(data.IncreaseAmount)).toFixed(3);
        }
    }

    var validateActionType = function () {
        var isValid = false;

        angular.forEach($scope.PositionTypes, function (item) {
            if ($scope.empAction[item.id])
                isValid = true;
        });

        if (!isValid) {
            $scope.pafForm.$setValidity('ActionType', false, $scope.pafForm);
        }
        else {
            $scope.pafForm.$setValidity('ActionType', true, $scope.pafForm);
        }
        return isValid;
    }

    $scope.isLoading = function () {
        return $scope.loadingCount > 0;
    }

    $scope.validateLoa = function () {
        var isValid = false;

        if ($scope.empAction.Loa && angular.isObject($scope.empAction.Data.Loa)) {

            if ($scope.empAction.Data.Loa.LoaDate || $scope.empAction.Data.Loa.DateOfReturn) {
                isValid = true;
            }

            if (!isValid)
                $scope.pafForm.$setValidity('loa', false, $scope.pafForm);
            else
                $scope.pafForm.$setValidity('loa', true, $scope.pafForm);

        }
        else {
            isValid = true;
        }

        return isValid;
    }
    $scope.save = function () {
        validateActionType();
        $scope.validateLoa();
        if ($scope.pafForm.$valid) {

            EmpActions.saveEmployeePersonnelAction($scope.empAction, function (status) {
                document.location.hash = 'list';
            });
        }
    }
}
])
    .controller('hireCtrl', ['$scope', function ($scope) {
        //status changes
        var Status = ["FullTimeHours", "TemporaryHours", "PartTimeHours", "PerDiemValue"];
        $scope.$watch('data.Status', function (newValue, oldValue) {
            angular.forEach(Status, function (item) {
                if (item != newValue) {
                    $scope.data[item] = null;
                }
            });
        });

        //pay status changes
        var PayStatus = ["AnnualSalaryAmount", "AdminHourlyAmount", "HourlyRateAmount"];
        $scope.$watch('data.PayStatus', function (newValue, oldValue) {
            angular.forEach(PayStatus, function (item) {
                if (item != newValue) {
                    $scope.data[item] = null;
                }
            });
        });

        var calSalary = function () {
            var salary = 0;
            var payStatus = $scope.data.PayStatus;
            if (payStatus == 'AnnualSalaryAmount')
                salary = $scope.data.AnnualSalaryAmount;
            else if (payStatus == 'AdminHourlyAmount')
                salary = $scope.data.AdminHourlyAmount * 52 * 40;
            else if (payStatus == 'HourlyRateAmount')
                salary = $scope.data.HourlyRateAmount * 52 * 40;

            return salary;
        }

        $scope.getPayRange = function () {

            var salary = calSalary();

            return $scope.$parent.$parent.getPayRange($scope.data.PayGrade, salary);
        }
    }])
    .controller('separationCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
        var SeparationReason = ["ResignationType", "TerminationType", "LayoffType"];
        $scope.$watch('data.SeparationReason', function (newValue, oldValue) {
            if (!angular.isDefined(newValue) || newValue == null)
                return;
            angular.forEach(SeparationReason, function (item) {
                if (item != newValue) {
                    $scope.data[item] = null;
                }
            });

        });
    }])
    .controller('loaCtrl', ['$scope', function ($scope) {

        var dateChange = function (type) {
            $scope.$parent.$parent.validateLoa();
            if ($scope.data.DateOfReturn && !$scope.data.LoaDate || !$scope.data.DateOfReturn && $scope.data.LoaDate || !$scope.data.DateOfReturn && !$scope.data.LoaDate)
                return;
            var dateOfReturn = new Date($scope.data.DateOfReturn);
            var loaDate = new Date($scope.data.LoaDate);

            if (dateOfReturn.getTime() < loaDate.getTime()) {
                if (type == "LoaDate")
                    $scope.data.DateOfReturn = null;
                else
                    $scope.data.LoaDate = null;
            }
        }
        //date of return after loa date
        $scope.$watch('data.LoaDate', function (newValue, oldValue) {
            if (newValue != oldValue)
                dateChange("LoaDate");
        });

        //date of return change
        $scope.$watch('empAction.DateOfReturn', function (newValue, oldValue) {
            if (newValue != oldValue)
                dateChange("DateOfReturn");
        });


    }])
;

// 

paf.controller('pafListCtrl', ['$scope', 'EmpActions', function ($scope, EmpActions) {

    $scope.pafFilter = {
        PafNumber: null,
        HcmHouseCode: null,
        EmployeeNumber: null,
        UserName: null,
        Date: null
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1,
        showWeeks: false
    };

    $scope.getPafList = function () {

        EmpActions.getEmployeePersonnelActions($scope.pafFilter.HcmHouseCode, $scope.pafFilter.PafNumber, $scope.pafFilter.EmployeeNumber, $scope.pafFilter.Date, $scope.pafFilter.UserName, function (items) {
            $scope.empActions = items;
        });
    }

    var load = function () {
        EmpActions.getHcmHouseCodes(function (result) {

            $scope.HcmHouseCodes = result;
            $scope.getPafList();
        });
    }

    load();


    $scope.getHouseCodeDesc = function (item) {
        return EmpActions.getHouseCodeName(item.HcmHouseCode);
    }

}]);
//
paf.directive('pafDatepicker', ['$timeout', '$filter', function ($timeout, $filter) {
    return {
        scope: {
            dtOption: '=',
            dtModel: '=dtModel',
            minDate: '=',
            dtChange: '&dtChange'
        },
        restrict: 'E',
        require: '?ngModel',
        template: '<p class="input-group"><input class="form-control input-sm" name="{{dtName}}" min-date="minDate" ng-change="dtChange()" ng-required="dtRequired" datepicker-popup="MM/dd/yyyy" pdf-datepicker-popup-config ng-model="dtModel" is-open="opened"  show-button-bar="{{showButtonBar}}" datepicker-append-to-body="false" datepicker-options="dateOptions" date-disabled="disabled(date, mode)"  close-text="Close" /><span class="input-group-btn"><button type="button" class="btn btn-default btn-sm" ng-click="open($event)"><i class="glyphicon glyphicon-calendar"></i></button></span></p>',
        link: function (scope, elem, attrs, ngModel) {
            scope.opened = false;
            scope.dtPopup = "dd-MMMM-yyyy";
            scope.showButtonBar = false;


            scope.open = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                scope.opened = true;
            }

            if (angular.isDefined(attrs.dtPopup)) {
                scope.dtPopup = attrs.dtPopup;
            }

            if (angular.isDefined(attrs.dtName)) {
                scope.dtName = attrs.dtName;
            }

            if (angular.isDefined(attrs.dtRequired)) {
                scope.dtRequired = attrs.dtRequired;
            }
        }
    }
}])
.directive('pdfDatepickerPopupConfig', ['$filter', function ($filter) {
    return {
        restrict: 'A',
        require: '^ngModel',
        link: function (scope, elem, attrs, ngModel) {

            var dateFormat = attrs.datepickerPopup || "MM/dd/yyyy";
            ngModel.$formatters.push(function (value) {

                if (value && value != null)
                    return $filter('date')(new Date(value), dateFormat);

                return null;
            });
        }
    }
}])

.directive('pafInvalid', ['$rootScope', function ($rootScope) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var errorClass = 'has-error';

            var toggleClsss = function () {
                var hasError = Object.byString(scope, attrs.pafInvalid + '.$invalid');
                hasError ? element.addClass(errorClass) : element.removeClass(errorClass);
            }
            scope.$watch(attrs.pafInvalid + '.$invalid', toggleClsss);
            //scope.$watch(attrs.pafInvalid + '.$dirty', toggleClsss);
            //scope.$watch('$formAttempted', toggleClsss);
        }
    }
}])
.directive('pafFormat', ['$filter', function ($filter) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) {

            if (!ngModel) return;
            var focused = false;

            elem.bind('focus', function () {
                focused = true;

                if (elem.prop('readonly'))
                    return;

                if (typeof ngModel.$viewValue != 'undefined' && ngModel.$viewValue != null)
                    elem.val(ngModel.$viewValue);
            });

            var formatViewValue = function () {
                if (typeof ngModel.$viewValue != 'undefined' && ngModel.$viewValue != null) {
                    var format = /\{0\:?([^}]+)?\}/gi.exec(attrs.pafFormat);

                    if (ngModel.$viewValue != "")
                        elem.val(attrs.pafFormat.replace(/\{0(\:[^}]+)?\}/gi, (!format[1] ? ngModel.$viewValue : parseFloat(ngModel.$viewValue).numberFormat(format[1]))));
                }
            }

            elem.bind('blur', function () {
                focused = false;
                formatViewValue();
            });

            scope.$watch(attrs.ngModel, function () {
                if (!focused) {
                    formatViewValue();
                }
            });
        }
    };
}])
.directive('pafNumeric', function () {
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
                if (inputValue == undefined) return ''
                var transformedInput = inputValue.replace(/[^0-9+.]/g, '');
                if (transformedInput != inputValue) {
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                }

                return transformedInput;
            });
        }
    };
})
.directive('pafEnter', function () {
    return {
        link: function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.pafEnter);
                    });

                    event.preventDefault();
                }
            });
        }
    }
})
.directive('pafValidation', function () {
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {
            var type = angular.uppercase(attrs.pafValidation);

            switch (type) {
                case 'EMAIL':
                    var INTEGER_REGEXP = new RegExp('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', 'i');
                    ngModel.$parsers.unshift(function (viewValue) {
                        if (INTEGER_REGEXP.test(viewValue)) {
                            ngModel.$setValidity(attrs.name, true);
                            return viewValue;
                        }
                        else {
                            ngModel.$setValidity(attrs.name, false);
                            return null;
                        }
                    });
                    break;
                case 'NUMERIC':
                    ngModel.$parsers.push(function (inputValue) {
                        if (inputValue == undefined) return '';

                        var transformedInput = inputValue.replace(/[^0-9+.]/g, '');
                        if (transformedInput != inputValue) {
                            modelCtrl.$setViewValue(transformedInput);
                            modelCtrl.$render();
                        }

                        return transformedInput;
                    });
                    break;
            }
        }
    }
})
.factory('Validators', [function () {
    return {
        phoneNumber: function (ctrl, value, attr) {
            var valid = typeof (value) == "string" && value.length >= 10 && value.length <= 14;
            ctrl.$setValidity(attr.name, valid);
            return value;
        },
        zipCode: function (ctrl, value, attr) {
            var valid = typeof (value) == "string" && value.length >= 5 && value.length <= 10;
            ctrl.$setValidity(attr.name, valid);
            return value;
        },
    };
}])
.directive('pafMask', ['Validators', function (Validators) {
    /**
     * FIXME: all numbers will have 9 digits after 2016.
     * see http://portal.embratel.com.br/embratel/9-digito/
     */
    var StringMask = (function () {
        var tokens = {
            '0': { pattern: /\d/, _default: '0' },
            '9': { pattern: /\d/, optional: true },
            '#': { pattern: /\d/, optional: true, recursive: true },
            'S': { pattern: /[a-zA-Z]/ },
            '$': { escape: true }
        };
        var isEscaped = function (pattern, pos) {
            var count = 0;
            var i = pos - 1;
            var token = { escape: true };
            while (i >= 0 && token && token.escape) {
                token = tokens[pattern.charAt(i)];
                count += token && token.escape ? 1 : 0;
                i--;
            }
            return count > 0 && count % 2 === 1;
        };
        var calcOptionalNumbersToUse = function (pattern, value) {
            var numbersInP = pattern.replace(/[^0]/g, '').length;
            var numbersInV = value.replace(/[^\d]/g, '').length;
            return numbersInV - numbersInP;
        };
        var concatChar = function (text, character, options) {
            if (options.reverse) return character + text;
            return text + character;
        };
        var hasMoreTokens = function (pattern, pos, inc) {
            var pc = pattern.charAt(pos);
            var token = tokens[pc];
            if (pc === '') return false;
            return token && !token.escape ? true : hasMoreTokens(pattern, pos + inc, inc);
        };
        var insertChar = function (text, char, position) {
            var t = text.split('');
            t.splice(position >= 0 ? position : 0, 0, char);
            return t.join('');
        };
        var StringMask = function (pattern, opt) {
            this.options = opt || {};
            this.options = {
                reverse: this.options.reverse || false,
                usedefaults: this.options.usedefaults || this.options.reverse
            };
            this.pattern = pattern;

            StringMask.prototype.process = function proccess(value) {
                if (!value) return '';
                value = value + '';
                var pattern2 = this.pattern;
                var valid = true;
                var formatted = '';
                var valuePos = this.options.reverse ? value.length - 1 : 0;
                var optionalNumbersToUse = calcOptionalNumbersToUse(pattern2, value);
                var escapeNext = false;
                var recursive = [];
                var inRecursiveMode = false;

                var steps = {
                    start: this.options.reverse ? pattern2.length - 1 : 0,
                    end: this.options.reverse ? -1 : pattern2.length,
                    inc: this.options.reverse ? -1 : 1
                };

                var continueCondition = function (options) {
                    if (!inRecursiveMode && hasMoreTokens(pattern2, i, steps.inc)) {
                        return true;
                    } else if (!inRecursiveMode) {
                        inRecursiveMode = recursive.length > 0;
                    }

                    if (inRecursiveMode) {
                        var pc = recursive.shift();
                        recursive.push(pc);
                        if (options.reverse && valuePos >= 0) {
                            i++;
                            pattern2 = insertChar(pattern2, pc, i);
                            return true;
                        } else if (!options.reverse && valuePos < value.length) {
                            pattern2 = insertChar(pattern2, pc, i);
                            return true;
                        }
                    }
                    return i < pattern2.length && i >= 0;
                };

                for (var i = steps.start; continueCondition(this.options) ; i = i + steps.inc) {
                    var pc = pattern2.charAt(i);
                    var vc = value.charAt(valuePos);
                    var token = tokens[pc];
                    if (!inRecursiveMode || vc) {
                        if (this.options.reverse && isEscaped(pattern2, i)) {
                            formatted = concatChar(formatted, pc, this.options);
                            i = i + steps.inc;
                            continue;
                        } else if (!this.options.reverse && escapeNext) {
                            formatted = concatChar(formatted, pc, this.options);
                            escapeNext = false;
                            continue;
                        } else if (!this.options.reverse && token && token.escape) {
                            escapeNext = true;
                            continue;
                        }
                    }

                    if (!inRecursiveMode && token && token.recursive) {
                        recursive.push(pc);
                    } else if (inRecursiveMode && !vc) {
                        if (!token || !token.recursive) formatted = concatChar(formatted, pc, this.options);
                        continue;
                    } else if (recursive.length > 0 && token && !token.recursive) {
                        // Recursive tokens most be the last tokens of the pattern
                        valid = false;
                        continue;
                    } else if (!inRecursiveMode && recursive.length > 0 && !vc) {
                        continue;
                    }

                    if (!token) {
                        formatted = concatChar(formatted, pc, this.options);
                        if (!inRecursiveMode && recursive.length) {
                            recursive.push(pc);
                        }
                    } else if (token.optional) {
                        if (token.pattern.test(vc) && optionalNumbersToUse) {
                            formatted = concatChar(formatted, vc, this.options);
                            valuePos = valuePos + steps.inc;
                            optionalNumbersToUse--;
                        } else if (recursive.length > 0 && vc) {
                            valid = false;
                            break;
                        }
                    } else if (token.pattern.test(vc)) {
                        formatted = concatChar(formatted, vc, this.options);
                        valuePos = valuePos + steps.inc;
                    } else if (!vc && token._default && this.options.usedefaults) {
                        formatted = concatChar(formatted, token._default, this.options);
                    } else {
                        valid = false;
                        break;
                    }
                }

                return { result: formatted, valid: valid };
            };

            StringMask.prototype.apply = function (value) {
                return this.process(value).result;
            };

            StringMask.prototype.validate = function (value) {
                return this.process(value).valid;
            };
        };

        StringMask.process = function (value, pattern, options) {
            return new StringMask(pattern, options).process(value);
        };

        StringMask.apply = function (value, pattern, options) {
            return new StringMask(pattern, options).apply(value);
        };

        StringMask.validate = function (value, pattern, options) {
            return new StringMask(pattern, options).validate(value);
        };

        return StringMask;
    }());

    var phoneMask8D = new StringMask('(000) 000-0000'),
        phoneMask9D = new StringMask('(000) 000-0000X0000');

    var zipcodeMask5D = new StringMask('00000'),
        zipcodeMask6D = new StringMask('00000-00000');

    function clearValue(value) {
        if (!value) {
            return value;
        }

        return value.replace(/[^0-9]/g, '');
    }

    function applyPhoneMask(value) {
        if (!value) {
            return value;
        }

        var formatedValue;
        if (value.length < 11) {
            formatedValue = phoneMask8D.apply(value);
        } else {
            formatedValue = phoneMask9D.apply(value);
        }

        return formatedValue.trim().replace(/[^0-9]$/, '');
    }

    function applyZipCodeMask(value) {
        if (!value) {
            return value;
        }

        var formatedValue;
        if (value.length < 5) {
            formatedValue = zipcodeMask5D.apply(value);
        } else {
            formatedValue = zipcodeMask6D.apply(value);
        }

        return formatedValue.trim().replace(/[^0-9]$/, '');
    }

    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ctrl) {
            if (!ctrl) {
                return;
            }

            var maskType = angular.uppercase(attrs.pafMask);
            var $formatters = '';
            var $parsers = '';

            ctrl.$formatters.push(function (value) {
                if (maskType == 'PHONE')
                    return applyPhoneMask(Validators.phoneNumber(ctrl, value, attrs));
                else if (maskType == 'ZIPCODE')
                    return applyZipCodeMask(Validators.zipCode(ctrl, value, attrs));

                return null;
            });

            ctrl.$parsers.push(function (value) {
                if (!value) {
                    return value;
                }

                var cleanValue = clearValue(value);
                var formatedValue = '';
                if (maskType == 'ZIPCODE')
                    formatedValue = applyZipCodeMask(cleanValue);
                else if (maskType == 'PHONE')
                    formatedValue = applyPhoneMask(cleanValue);

                if (ctrl.$viewValue !== formatedValue) {
                    ctrl.$setViewValue(formatedValue);
                    ctrl.$render();
                }

                return clearValue(formatedValue);
            });

            ctrl.$parsers.push(function (value) {
                if (maskType == 'PHONE')
                    return Validators.phoneNumber(ctrl, value, attrs);
                else if (maskType == 'ZIPCODE')
                    return Validators.zipCode(ctrl, value, attrs);

                return null;
            });
        }
    };
}])
.directive('pafTypeahead', ['$filter', function ($filter) {
    return {
        restrict: 'ACE',
        scope: {
            source: '=',
            model: '=ngModel',
            onBlur: '&',
            disabled: '=ngDisabled',
            change: '=ngChange',
            required: '=ngRequired'
        },
        template: '<div><input ng-model="model" ng-required="required" name="{{inputName}}" class="hide"/><input type="text" class="form-control input-sm" ng-model="TypeaheadModel" ng-disabled="disabled" ng-change="change" typeahead-input-formatter="inputFormatter($model)" typeahead="item as item[displayField] for item in source|filter:itemFilter($viewValue)| limitTo:10" ng-blur="onBlur()" /></div>',
        replace: true,
        link: function (scope, elem, attrs) {

            var option = scope.$eval(attrs.typeaheadOption);
            scope.displayField = '';
            scope.inputName = '';

            if (angular.isDefined(option)) {
                scope.displayField = option.displayField;
                scope.inputName = option.name;
            }

            scope.inputFormatter = function ($model) {
                if ($model) {
                    scope.model = $model[option.valueField];

                    return $model[scope.displayField];
                }

                return '';
            }

            scope.itemFilter = function (value) {
                return function (item) {
                    return item[scope.displayField].toUpperCase().indexOf(value.toUpperCase()) >= 0;
                }
            }

            scope.$watch(function () { return scope.model }, function (value) {
                if (angular.isDefined(value) && value != null) {
                    scope.TypeaheadModel = $filter('filter')(scope.source, function (item) {
                        return item[option.valueField] == scope.model;
                    })[0];

                }
            });

            scope.$watch('TypeaheadModel', function (value) {
                if (typeof (value) == "string" && value.length == 0) {
                    scope.model = null;
                }

            });
        }
    }
}])


.directive('pafScope', ['$window', function ($window) {
    return {
        restrict: 'A',
        scope: {
            data: '=pafScope'
        },
        transclude: true,
        link: function (scope, element, attrs, ctrl, transclude) {

            transclude(scope, function (clone, scope) {
                element.append(clone);
            });
        }
    }
}])
;


$(function () {
    var focusedElement;
    $(document).on('focus', 'input', function () {
        if ($(this).closest('fieldset').prop('disabled')) {
            $(this).blur();
            return;
        }
        if (focusedElement == $(this)) return;  // already focused, return so user can now place cursor at specific point in input.
        focusedElement = $(this);
        setTimeout(function () { focusedElement.select(); }, 50);       // select all text in any field on focus for easy re-entry;
    });

});




paf.factory('EmpActions', ["$http", "$filter", '$rootScope', function ($http, $filter, $rootScope) {
    var CarAllowances = [
        { Id: '425', Description: '425/month' },
        { Id: '500', Description: '500/month' },
        { Id: '600', Description: '600/month' },
        { Id: '900', Description: '900/month' }];

    var cache = {};

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

        $rootScope.loadingCount = $rootScope.loadingCount || 0;
        $rootScope.loadingCount++;
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
            $rootScope.loadingCount--;
        })
        .error(function (error) {
            $rootScope.loadingCount--;
        });
    }

    var getEmployeePersonnelActions = function (housecode, pafNumber, employeeNumber, pafDate, createUser, callback) {
       
        apiRequest('emp', '<criteria>storeId:employeePersonnelActions,userId:[user] '+ ',hcmHouseCode:' + housecode+ ',pafNumber:' + pafNumber
            + ',employeeNumber:' + employeeNumber
            + ',pafDate:' + pafDate
            + ',createUser:' + createUser
            + '</criteria>', function (xml) {
                
                if (callback)
                    callback(deserializeXml(xml, 'item', { upperFirstLetter: true }));
            });

    }
    var findEmployeePersonnelAction = function (id, callback) {
        var boolItems = ["NewHire", "ReHire", "Separation", "LOA", "SalaryChange", "Promotion", "Demotion", "Transfer", "PersonalInfoChange", "Relocation"];
        var intItems = ["HcmHouseCode", "EmployeeNumber", "StateType", "PositionType", "TrainingLocation", "Duration", "CarAllowance", "BonusEligibleType", "LayoffType", "OldPositionType", "NewPositionType", "ChangeReasonType", "NewCarAllowance", "NewBonusEligibleType", "HouseCodeTransfer", "InfoChangeStateType", "RelocationPlan"];
        var dateItems = ["Date", "HireDate", "SeparationDate", "LoaDate", "DateOfReturn", "EffectiveDate", "LastIncreaseDate", "EffectiveDate", "TransferEffectiveDate", "InfoChangeEffectiveDate"];

        apiRequest('emp', '<criteria>storeId:employeePersonnelActions,userId:[user]' + ",actionId:" + id + ',</criteria>', function (xml) {
            if (callback) {
                var action = deserializeXml(xml, 'item', { upperFirstLetter: true, boolItems: boolItems, intItems: intItems, dateItems: dateItems, jsonItems: ['Data'] })[0];
                action.Data = action.Data || {};
                action.Data.NewHire = action.Data.NewHire || {};
                action.Data.ReHire = action.Data.ReHire || {};
                action.Data.Separation = action.Data.Separation || {};
                action.Data.Loa = action.Data.Loa || {};
                action.Data.Promotion = action.Data.Promotion || {};
                action.Data.Demotion = action.Data.Demotion || {};
                action.Data.SalaryChange = action.Data.SalaryChange || {};
                action.Data.Transfer = action.Data.Transfer || {};
                action.Data.PersonalInfoChange = action.Data.PersonalInfoChange || {};
                action.Data.Relocation = action.Data.Relocation || {};
                callback(action);
            }
        });
    }

    var getPayGrades = function (callback) {
        if (cache.payGrades)
            callback(cache.payGrades);
        else {
            apiRequest('emp', '<criteria>storeId:payGrades,userId:[user] ,</criteria>', function (xml) {
                cache.payGrades = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['min', 'max', 'mid'] });
                getPayGrades(callback);
            });
        }
    }

    var getHcmHouseCodes = function (callback) {

        if (cache.houseCodes) {
            callback(cache.houseCodes);
            return;
        }

        var criteriaXml = '<criteria>appUnitBrief:,storeId:hcmHouseCodes,userId:[user],</criteria>';

        var data = 'moduleId=hcm&requestId=1&requestXml=' + encodeURIComponent(criteriaXml) + '&targetId=iiCache';

        apiRequest('hcm', criteriaXml, function (xml) {
            cache.houseCodes = deserializeXml(xml, 'item', { upperFirstLetter: false });
            getHcmHouseCodes(callback);
        });
    }

    var getHouseCodeName = function (id) {
        if (cache.houseCodes == null)
            return '';

        var houseCodeName = 'N/A';

        angular.forEach(cache.houseCodes, function (item, index) {
            if (item.id == id) {
                houseCodeName = item.name;
            }
        });

        return houseCodeName;
    }

    var getHcmHouseCodeByBrief = function (brief) {
        if (cache.houseCodes == null)
            return '';

        var hcmHouseCode = 0;

        angular.forEach(cache.houseCodes, function (item, index) {
            if (item.brief == brief) {
                hcmHouseCode = item.id;
            }
        });

        return hcmHouseCode;
    }

    var getStateTypes = function (callback) {

        if (cache.stateTypes) {
            callback(cache.stateTypes);
            return;
        }
        apiRequest('emp', '<criteria>storeId:stateTypes,userId:[user],</criteria>', function (xml) {
            cache.stateTypes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
            getStateTypes(callback);
        });
    }

    var getEmployee = function (employeeNumber, hcmHouseCode, callback) {

        apiRequest('emp', '<criteria>storeId:employeeSearchs,userId:[user]'
                             + ',searchValue:' + employeeNumber
                             + ',hcmHouseCodeId:' + hcmHouseCode
                             + ',employeeType:SearchFull,filterType:Employee Number'
                + ',</criteria>', function (xml) {
                    if (callback) {
                        var matched = deserializeXml(xml, 'item', { upperFirstLetter: false });
                        callback(matched && matched.length > 0 ? matched[0] : null);
                    }
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

    var getEmpCompensation = function (employeeNumber, callback) {

        apiRequest('emp', '<criteria>storeId:employeeCompensation,userId:[user]'
                             + ',employeeNumber:' + employeeNumber
                + ',</criteria>', function (xml) {
                    if (callback)
                        callback(deserializeXml(xml, 'item', { upperFirstLetter: false })[0]);
                });
    }

    var getCarAllowances = function () {
        return CarAllowances;
    }

    var getJobCodes = function (callback) {
        if (cache.jobCodes) {
            callback(cache.jobCodes);
            return;
        }
        apiRequest('emp', '<criteria>storeId:jobCodes,userId:[user],</criteria>', function (xml) {
            cache.jobCodes = deserializeXml(xml, 'item', { upperFirstLetter: false });
            getJobCodes(callback);
        });
    }

    var getPersonActionTypes = function (callback) {

        if (cache.personActionTypes) {
            callback(cache.personActionTypes);
            return;
        }

        apiRequest('emp', '<criteria>storeId:personnelActionTypes,userId:[user],</criteria>', function (xml) {
            cache.personActionTypes = deserializeXml(xml, 'item', { upperFirstLetter: false });
            getPersonActionTypes(callback);
        });
    }

    var saveEmployeePersonnelAction = function (employeePersonnelAction, callback) {
        console.log(employeePersonnelAction);
        var xml = [];
        if (employeePersonnelAction.Id) {
            xml.push('<transaction actionId="' + employeePersonnelAction.Id + '">');
        }
        else {
            xml.push('<transaction actionId="0">');
        }
        xml.push('\r\n<employeePersonnelAction ');

        var xmlNode = [];
        angular.forEach(employeePersonnelAction, function (value, key) {
            key = lowercaseFirstLetter(key);

            if (value == null || !angular.isDefined(value))
                value = ""
            else if (angular.isDate(value)) {
                value = $filter('date')(value, "MM/dd/yyyy");
            }
            else if (angular.isObject(value)) {
                value = angular.toJson(value).replace(/"/gi, '###');
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
        getEmpCompensation: getEmpCompensation,
        getPersonActionTypes: getPersonActionTypes,
        getJobCodes: getJobCodes,
        getPayGrades: getPayGrades,
        saveEmployeePersonnelAction: saveEmployeePersonnelAction
    }
}]);



