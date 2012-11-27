Deployment Notes

Notes to remember while deploying RMS – ESM
Replace esm\cmn\med with rms\cmn\med
Replace following skin.css with RMSskin.css under module/med/default/
i.	App\user
ii.	App\userSearch
iii.	Ppl\Master
iv.	Ppl\person
v.	Hir\hierarchy
vi.	Hir\security
Replace following .css and .gif and .png files under respective folders with corresponding RMS file
i.	Esm\cmn\checkList\checkList.css
ii.	Esm\cmn\toolbar\toolbar.css
iii.	Esm\cmn\hierarchy\hierarchy.css
iv.	Esm\cmn\hierarchy\access.gif
v.	Esm\cmn\input\input.css
vi.	Jquery\tabpages\tab.png
vii.	Jquery\tabpages\tabs.css

1.	Deploy the Database structure for ESMv2 and TeamFinv2 from iiT to CT.
2.	Copy all “types” table records from iiT to CT. Following is the list. 
3.	List for ESMv2

AppAlertClearTypes
AppAlertDisplayTypes
AppAlertTypes
AppGPOTypes
AppIndustryTypes
AppLocationTypes
AppOwnershipTypes
AppPrimaryBusinessTypes
AppProfitDesignationTypes
AppStateTypes
AppTraumaLevelTypes
HirGroupTypes
PplSkillTypes

AppAlertExclusions
AppAlerts
AppFunctionalAreas (needs to review the data and update, as this may affect other applications)
AppMenuActions
AppMenuItems (needs to review the data and update, as this may affect other applications)
AppMenuStates
HirHierarchies (needs to review the data and update, as this may affect other applications)
HirLevels (needs to review the data and update, as this may affect other applications)
HirNodes (needs to review the data and update, as this may affect other applications)
PplRoles


4.	List for TeamFinv2

AppTransactionStatusTypes
EmpDeviceGroupTypes
EmpEthnicityTypes
EmpFederalAdjustmentTypes
EmpGenderTypes
EmpJobCodeTypes
EmpLaundryStatusTypes
EmpMaritalStatusTypes
EmpRateChangeReasonTypes
EmpStateAdjustmentTypes
EmpStatusTypes
EmpTerminationReasonTypes
GlmJournalTransferTypes
GlmRecurringFixedCostIntervalTypes
GlmRecurringFixedCostTypes
HcmBillingCycleFrequencyTypes
HcmContractTypes
HcmHouseCodeTypes
HcmPayrollProcessingLocationTypes
HcmServiceTypes
HcmTermsOfContractTypes
PurPOSendMethodTypes
RevTableTypes
EmpWorkShifts
FscAccountCategories
HcmRemitToLocations
PayPayCodes
PayPayrollCompanies

5.	Execute data conversion scripts for AppSites, AppUnits, HcmHousecodes, HcmRemiToLocations, etc.
6.	iiFramework setup (IIS) is required on application server.
7.	Deploy the applications EsmV2 & TeamfinV2
8.	Setup security Hierarchy [fin>>setup>>hierarchy] -- HirNodes
9.	Setup security Groups [fin>>setup>>security] -- HirGroups
10.	Setup application Users for Security [fin>>employees>>person>>user] -- AppUsers
11.	Using application setup Fiscal Pattern,  Fiscal Calendar, JDE Company,  Chart of Accounts


-	Backup ESMv2 & TeamfinV2 DB
-	Make sure that DB tables have a primary key (Clustered)
-	After application deployment, check for web.config & spring-persistence.xml for application setting and connection strings. Find this information under \net\enterprise\suite\application\module\act\web.config & \net\ enterprise\suite\application\module\act\config\spring-persistence.xml. This applies for both ESM and TeamFin application.
-	Make sure to check the USER used in connection string is set as db_owner under Sql-server >> Security >> Login >> user >> right click properties >> user_mapping >> select DB >> select db_owner in DB role membership list.
-	Make sure all the virtual directories are set for “Integrated Windows Authentication” 
-	After both application deployment and data converted, check if Coach is working as expected.
-	Make sure if we have linked server available so as to run conversion scripts between old >> new
-	Check all \act\Web.config for (example C:\Build\net\ii\framework\esm\app\act\Web.config) and similar values. 
-	<add key="ESMHirPath" value="/net/ii/framework/esm/hir/act/provider.aspx?moduleId=hir" />
-	<add key="ESMPplPath" value="/net/ii/framework/esm/ppl/act/provider.aspx?moduleId=ppl" />
-	Web.config updates in pur/act, glm/act & rev/act for Email & Export procedures.
-	Update folder physically ‘D:\Build\js\crothall\chimes\fin\exportToJDE’
-	‘D:\Build\js\crothall\chimes\fin\importFromJDE’
-	Add keys in net\rev\act\web.config
-	    <add key="ExportFilePath" value="D:\Build\js\crothall\chimes\fin\exportToJDE\" />
-	    <add key="ImportFilePath" value="D:\Build\js\crothall\chimes\fin\importFromJDE\" />
-	Also check these key in net\glm\act\web.config & net\pay\act\web.config



Know issues – Employee User UI will not work as ESMv2 DB is undergoing some modifications. Same thing may happen with Sites, Units, Security, Hierarchy UI as they come from ESMv2 DB
CT Deployment 27Oct2009
1.	Updated AppRoleCurrent in AppUsers table for user Kaym01(50) & gmssr(52)
2.	Updated HirNodeCurrent to 1400 in AppRoles table for each ‘Default’ Role.
3.	Updated HirGroupTypes table to add HirHierarchy field. This was not updated by dbScripter as it is a ‘not null’ column.
4.	ALter table hirGroupTypes Add HirHierarchy Int DEfault 0 not null
5.	update hirGroupTypes set HirHierarchy = hirGroupType
6.	remove the default value 0 from hirHierarchy field.
7.	
8.	Script execution for Transaction Summary is pending (Kishor)
9.	Updated AppMenuItems table with action as “\fin\rev\master\usr\markup.htm” for “rev” menu item.
10.	Added a record each to RevStateTaxes & RevMunicipalityTaxTypes table in Teamfinv2
11.	Spring-persistant.xml & web.config updated for rev module
12.	Web.config updated for app module to add “<add key="FinRevPath" value="/net/crothall/chimes/fin/rev/act/provider.aspx?moduleId=rev" />”
13.	Created virtual directory rev & rev/act under “net\crothall\chimes\fin\”
14.	Check net\glm\act\web.config, net\pur\act\web.config for 
15.	 <add key="FinSenderEmail" value="anis.shikalgar@iicorporate.com" />
16.	 <add key="FinAccountsDepartmentEmail" value="anis.shikalgar@iicorporate.com" />
17.	 <add key="FinSMTPServer" value="NET-COLAB-AZ1.persistech.com" />
29Oct2009

CREATE TABLE [dbo].[EmpPositionTypes](
	[EmpPositionType] [int] IDENTITY(1,1) NOT NULL Primary Key,
	[EmpPostBrief] [varchar](16) NOT NULL,
	[EmpPostTitle] [varchar](64) NOT NULL,
	[EmpPostDescription] [varchar](256) NOT NULL,
	[EmpPostDisplayOrder] [int] NULL,
	[EmpPostActive] [bit] NOT NULL,
	[EmpPostModBy] [varchar](50) NOT NULL,
	[EmpPostModAt] [datetime] NOT NULL
)

CREATE TABLE [dbo].[EmpUnionTypes](
	[EmpUnionType] [int] IDENTITY(1,1) NOT NULL Primary Key,
	[EmpUnitBrief] [varchar](16) NOT NULL,
	[EmpUnitTitle] [varchar](64) NOT NULL,
	[EmpUnitDescription] [varchar](256) NOT NULL,
	[EmpUnitDisplayOrder] [int] NULL,
	[EmpUnitActive] [bit] NOT NULL,
	[EmpUnitModBy] [varchar](50) NOT NULL,
	[EmpUnitModAt] [datetime] NOT NULL
)

CREATE TABLE [dbo].[EmpStatusCategoryTypes](
	[EmpStatusCategoryType] [int] IDENTITY(1,1) NOT NULL Primary Key,
	[EmpStatusType] [int] NOT NULL,
	[EmpStactBrief] [varchar](16) NOT NULL,
	[EmpStactTitle] [varchar](64) NOT NULL,
	[EmpStactDescription] [varchar](256) NOT NULL,
	[EmpStactDisplayOrder] [int] NULL,
	[EmpStactActive] [bit] NOT NULL,
	[EmpStactModBy] [varchar](50) NOT NULL,
	[EmpStactModAt] [datetime] NOT NULL
)

Insert Into [EmpPositionTypes] Values ('Position 1', 'Position 1', 'Position 1', 1,1,'persistech\data conversion', getdate())
Insert Into [EmpPositionTypes] Values ('Position 2', 'Position 2', 'Position 2', 1,1,'persistech\data conversion', getdate())

Insert Into [EmpUnionTypes] Values ('Union 1', 'Union 1', 'Union 1', 1,1,'persistech\data conversion', getdate())
Insert Into [EmpUnionTypes] Values ('Union 2', 'Union 2', 'Union 2', 1,1,'persistech\data conversion', getdate())

Insert Into [EmpStatusCategoryTypes] Values (1, 'Category1', 'Status Category1', 'Status Category1', 1,1,'persistech\data conversion', getdate())
Insert Into [EmpStatusCategoryTypes] Values (2, 'Category2', 'Status Category2', 'Status Category2', 1,1,'persistech\data conversion', getdate())
Insert Into [EmpStatusCategoryTypes] Values (3, 'Category3', 'Status Category3', 'Status Category3', 1,1,'persistech\data conversion', getdate())
Insert Into [EmpStatusCategoryTypes] Values (4, 'Category4', 'Status Category4', 'Status Category4', 1,1,'persistech\data conversion', getdate())
Insert Into [EmpStatusCategoryTypes] Values (5, 'Category5', 'Status Category5', 'Status Category5', 1,1,'persistech\data conversion', getdate())
Insert Into [EmpStatusCategoryTypes] Values (6, 'Category6', 'Status Category6', 'Status Category6', 1,1,'persistech\data conversion', getdate())
Insert Into [EmpStatusCategoryTypes] Values (7, 'Category7', 'Status Category7', 'Status Category7', 1,1,'persistech\data conversion', getdate())


Update EmpEmployeeGenerals Table

update empEmployeeGenerals 
	Set empStatusType = 6, empempgActive = 0 -- Terminated
where empempgTerminationDate <> '1900-01-01'

update empEmployeeGenerals 
	Set empStatusType = 1, empempgActive = 1 -- Employee
where empempgTerminationDate = '1900-01-01'

20Nov2009

update  empemployeegenerals 
set empstatustype = 6, empstatusCategorytype = 1, empempgactive =0
where empempgterminationdate <> '1900-01-01'

update  empemployeegenerals 
set empstatustype = 1, empstatusCategorytype = 1, empempgactive =1
where empempgterminationdate = '1900-01-01'

27Nov2009
Web service to update employee information received from SAP
Please add new module “net.crothall.chimes.fin.srv” to your script.
Also we need to set a virtual directory “srv” & “act” for “D:\Build\net\crothall\chimes\fin\srv\act” on iiT.
Here is the link to check with..
http://crothall2.persistech.com/net/crothall/chimes/fin/srv/act/TeamFinService.asmx
Copy Web.config as well.
Changes to DB to accommodate new ‘DisplayType’ feature in iiMenu structure.
Insert into appmenudisplaytypes
values('Inline','Inline','Inline',1, 1, 'compass-usa\crothall_service', GetDate())

Insert into appmenudisplaytypes
values('Grouped','Grouped','Grouped',1, 1, 'compass-usa\crothall_service', GetDate())

Date-21Jan10
update appmenuitems set appmenibrief = 'Annual Projection' where appmenuitem = 9

Check for all web.config for Key updates. Exampe Ppl, Hir mismatch.
18-03-2010
Fixes in this release
-	AppUser Roles (can add, update with single role) – known issues with hierarchy control
-	B-04356 – Purchase Order Fixes
-	B-04357 – Transaction Summary, Weekly Payrolls
-	B-04213 – Employee Fixes (Chandru)
-	B- need to get items from Chandru and Kishor.
Execute following script to update EmpEmployeeGenerals. Also  check for new columns PrevPrevPayRate etc.
Declare @PayRate decimal(15,2)
                , @PayRateEnteredBy varchar(50)
                , @PayrateEnteredAt dateTime
                , @PrevPayRate decimal(15,2)
                , @PrevPayRateEnteredBy varchar(50)
                , @PrevPayRateEnteredAt dateTime
                , @PrevPrevPayRate decimal(15,2)
                , @PrevPrevPayRateEnteredBy varchar(50)
                , @PrevPrevPayRateEnteredAt dateTime

Declare @maxId int, @MinId int

Select @maxId = Max(EmployeeNum), @MinId = Min(EmployeeNum) from teamfin.dbo.Employees 
--print @MinId
--print @maxId

While 1=1
Begin
Set @PayRate = 0
Select @PayRate = PayRate 
                , @PayRateEnteredBy = PayRateEnteredBy
                , @PayrateEnteredAt = PayrateEnteredAt
                , @PrevPayRate = PrevPayRate
                , @PrevPayRateEnteredBy = PrevPayRateEnteredBy
                , @PrevPayRateEnteredAt = PrevPayRateEnteredAt
                , @PrevPrevPayRate = PrevPrevPayRate
                , @PrevPrevPayRateEnteredBy = PrevPrevPayRateEnteredBy
                , @PrevPrevPayRateEnteredAt = PrevPrevPayRateEnteredAt
From teamfin.dbo.Employees Where EmployeeNum = @MinId

/*print @PayRate
print @PayRateEnteredBy
print @PayrateEnteredAt
print @PrevPayRate
print @PrevPayRateEnteredBy
print @PrevPayRateEnteredAt
print @PrevPrevPayRate
print @PrevPrevPayRateEnteredBy
print @PrevPrevPayRateEnteredAt 
*/
if (@PayRate != 0) 
Begin
--print @PayRate
                Update EmpEmployeeGenerals Set
                                  EmpEmpgPayRate = @PayRate
                                , EmpEmpgPayRateEnteredBy = @PayRateEnteredBy
                                , EmpEmpgPayRateEnteredAt = @PayrateEnteredAt
                                , EmpEmpgPrevPayRate = @PrevPayRate
                                , EmpEmpgPrevPayRateEnteredBy = @PrevPayRateEnteredBy
                                , EmpEmpgPrevPayRateEnteredAt = @PrevPayRateEnteredAt
                                , EmpEmpgPrevPrevPayRate = @PrevPrevPayRate
                                , EmpEmpgPrevPrevPayRateEnteredBy = @PrevPrevPayRateEnteredBy
                                , EmpEmpgPrevPrevPayRateEnteredAt = @PrevPrevPayRateEnteredAt
                Where EmpEmpgEmployeeNumber = @MinId
--print @MinId
End


Set @MinId = @MinId + 1
if @MinId > @MaxId Break
End
Kishor updated EmpEmployeeGenerals table for following fields
EmpEmpgPayRateEnteredBy
EmpEmpgPayRateEnteredAt
EmpEmpgPrevPayRate
EmpEmpgPrevPayRateEnteredBy
EmpEmpgPrevPayRateEnteredAt
EmpEmpgPrevPrevPayRate
EmpEmpgPrevPrevPayRateEnteredBy
EmpEmpgPrevPrevPayRateEnteredAt


Following DB changes are required in CT Database deployment.

1.	Column Week should be removed from TeamFinV2.dbo.PurPurchaseOrders table.

2.	Following 2 types table data should be updated.
•	EmpRateChangeReasonTypes
•	EmpEthnicityTypes

3.	One record should be inserted into HirNodes table. You can run the following Sql query.

Declare @HirLevel As Int
Declare @HirNodeParent As Int

Select @HirLevel = HirLevel, @HirNodeParent = HirNodeParent 
From ESMV2.dbo.HirNodes
Where HirNodFullPath = '\crothall\chimes\fin\Setup\Employees'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeParent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodModBy, HirNodModAt)
Values(1, @HirLevel, @HirNodeParent, 'SSN', 'SSN ReadOnly', 'SSN ReadOnly', 1, '\crothall\chimes\fin\Setup\SSNReadOnly', 'crothall', 'chimes', 'fin', 'Setup', 'SSNReadOnly', ' Compass-usa\Crothall_service ', GetDate())

Thank you,
Chandru
23-Apr-2010

Employee Payroll (types table????)
AppUser Roles
Transaction Summary
Invoice not saving
Next deployment – April End

1.	EmpStatusTypes
2.	EmpStatusCategoryTypes

select * from empStatusTypes
select * from empStatuscategoryTypes

--Truncate Table empStatusTypes
Insert into empStatusTypes Values ('Active', 'Active', 'Active', 1, 1, 'persistech\anis shikalgar', getdate())
Insert into empStatusTypes Values ('FMLA', 'FMLA_LOA', 'FMLA_LOA', 2, 1, 'persistech\anis shikalgar', getdate())
Insert into empStatusTypes Values ('Inactive', 'Inactive', 'Inactive', 3, 1, 'persistech\anis shikalgar', getdate())
Insert into empStatusTypes Values ('Leave Of Absence', 'Leave Of Absence', 'Leave Of Absence', 4, 1, 'persistech\anis shikalgar', getdate())
Insert into empStatusTypes Values ('Severance', 'Severance', 'Severance', 5, 1, 'persistech\anis shikalgar', getdate())
Insert into empStatusTypes Values ('Terminated', 'Terminated', 'Terminated', 6, 1, 'persistech\anis shikalgar', getdate())

--Truncate Table empStatuscategoryTypes
Insert into empStatuscategoryTypes Values (1, 'F', 'Full Time', 'Full Time', 1, 1, 'persistech\anis shikalgar', getdate())
Insert into empStatuscategoryTypes Values (1, 'FH', 'Field Hourly', 'Field Hourly', 2, 1, 'persistech\anis shikalgar', getdate())
Insert into empStatuscategoryTypes Values (1, 'I', 'Intern', 'Intern', 3, 1, 'persistech\anis shikalgar', getdate())
Insert into empStatuscategoryTypes Values (1, 'O', 'Other', 'Other', 4, 1, 'persistech\anis shikalgar', getdate())
Insert into empStatuscategoryTypes Values (1, 'P', 'Part Time', 'Part Time', 5, 1, 'persistech\anis shikalgar', getdate())
Insert into empStatuscategoryTypes Values (1, 'T', 'Temporary', 'Temporary', 6, 1, 'persistech\anis shikalgar', getdate())

Insert into empStatuscategoryTypes Values (2, 'FMLA_LOA', 'FMLA_LOA', 'FMLA_LOA', 1, 1, 'persistech\anis shikalgar', getdate())

Insert into empStatuscategoryTypes Values (3, 'IN', 'Inactive', 'Inactive', 1, 1, 'persistech\anis shikalgar', getdate())
Insert into empStatuscategoryTypes Values (3, 'SEVA1', 'Separation Agreement 1', 'Separation Agreement 1', 2, 1, 'persistech\anis shikalgar', getdate())
Insert into empStatuscategoryTypes Values (3, 'SEVA2', 'Separation Agreement 2', 'Separation Agreement 2', 3, 1, 'persistech\anis shikalgar', getdate())
Insert into empStatuscategoryTypes Values (3, 'SEVA3', 'Separation Agreement 3', 'Separation Agreement 3', 4, 1, 'persistech\anis shikalgar', getdate())
Insert into empStatuscategoryTypes Values (3, 'Workers Comp', 'Workers Comp', 'Workers Comp', 5, 1, 'persistech\anis shikalgar', getdate())
Insert into empStatuscategoryTypes Values (3, 'O', 'Other', 'Other', 6, 1, 'persistech\anis shikalgar', getdate())

Insert into empStatuscategoryTypes Values (4, 'FMLA_LOA', 'FMLA_LOA', 'FMLA_LOA', 1, 1, 'persistech\anis shikalgar', getdate())
Insert into empStatuscategoryTypes Values (4, 'MIL', 'Military Leave', 'Military Leave', 2, 1, 'persistech\anis shikalgar', getdate())

Insert into empStatuscategoryTypes Values (5, 'IN', 'Inactive', 'Inactive', 1, 1, 'persistech\anis shikalgar', getdate())
Insert into empStatuscategoryTypes Values (6, 'IN', 'Inactive', 'Inactive', 1, 1, 'persistech\anis shikalgar', getdate())


V1.0.1

-- Begin >> PayPayCodeAccounts table updates

Declare @PayCode as varchar(20)
Declare @AccountCode as varchar(10)
Declare @JobCode as varchar(25)
Declare @RCount int, @PayPayCode int, @FscAccount int, @JobCodeType int
Set @RCount = 1

While 1=1
Begin
	if exists (Select * from TeamFin.dbo.PayCodesToAcctCodes where Id = @RCount )
	Begin
	
		Set @PayPayCode = 0
		Set @FscAccount = 0
		Set @JobCodeType = 0
		
		Select @PayCode = PayCode, @AccountCode = AcctCode, @JobCode = JobCode
			From TeamFin.dbo.PayCodesToAcctCodes Where Id = @RCount
			
		Print @PayCode Print @AccountCode Print @JobCode

		Select @PayPayCode = payPayCode From PayPayCodes where PayPayCBrief = @PayCode
		Select @FscAccount = FscAccount From FscAccounts where FscAccCode = @AccountCode
		Select @JobCodeType = EmpJobCodeType from EmpJobCodeTypes where EmpJobctTitle = @JobCode 

		INSERT INTO [TeamFinv2].[dbo].[PayPayCodeAccounts]
		   ([PayPayCode]
		   ,[FscAccount]
		   ,[EmpJobCodeType])
		VALUES
		   (@PayPayCode
		   ,@FscAccount
		   ,@JobCodeType)
	End


Set @RCount = @RCount+1
if @RCount > 560 Break
End

-- End >> PayPayCodeAccounts table updates


V1.0.1 Deployed on CT 7th May 2010
-*-*-*-*-*-*

V1.0.2








