/*
Last production release version 2.04.005 Dtd-15th March 2012
*/

**********DOUBLE check if Teamfinv2.dbo.FscPeriods W1-W6 data is not lost..

Update Esmv2.dbo.M_ENV_ENVIRONMENTS
	Set M_ENV_ENV_Application_Version = '2.04.006', M_ENV_ENV_Database_Version = '2.04.006'
Where M_ENV_Environment < 4

Update M_env_environments 
	Set M_ENV_ENV_DEFAULT  = 0
		, M_ENV_ENV_SESSION_TIMEOUT_MSEC='3600000'
		, M_ENV_ENV_SESSION_WARNING_MSEC='4000'

--set as per the environment
Update M_env_environments Set m_env_env_default  = 1 Where M_env_environment = 2

--update user last logon date
Update appusers set appuselastlogon = '1/1/1900' where appuselastlogon is null

--Menu Fin>Reports>SSRS

	Exec AppMenuItemUpdate 
		'SSRS' --@MenuTitle Varchar(64)
		,2 --@MenuAction Int
		,4 --@MenuState Int 
		,753 --@DisplayOrderMenu Int
		,'/fin/rpt/ssrsReport/usr/markup.htm' --@MenuFilePath varchar(500)
		,11852 --@HirNodeParent Int
		
--Menu Fin>Housecode>Housecode Wizard

	Exec AppMenuItemUpdate 
		'Housecode Wizard' --@MenuTitle Varchar(64)
		,2 --@MenuAction Int 1-DSubItems(main menu), 2-ContentLoad(Actual UI invoker)
		,4 --@MenuState Int 1-None, 2-Invisible, 3-Selected, 4-Enabled, 5-Disabled
		,706 --@DisplayOrderMenu Int
		,'/fin/hcm/houseCodeWizard/usr/markup.htm'
		,0 -- 65 @HirNodeParent (Default 0) - Use this when query fetches duplicate parent menus.

Go

Update Esmv2.dbo.AppSTateTypes table with MinimumWage column and values.

Go

--Menu Fin>Information>TeamFin CBT //already updated to prod

		Exec AppMenuItemUpdate 
			'Information' --@MenuTitle Varchar(64)
			,1 --@MenuAction Int 1-DSubItems(main menu), 2-ContentLoad(Actual UI invoker)
			,4 --@MenuState Int 1-None, 2-Invisible, 3-Selected, 4-Enabled, 5-Disabled
			,900 --@DisplayOrderMenu Int
			,'MainMenu'
			,7 --@HirNodeParent (Default 0) - Use this when query fetches duplicate parent menus.

		Exec AppMenuItemUpdate 
			'TeamFin CBT' --@MenuTitle Varchar(64)
			,2 --@MenuAction Int 1-DSubItems(main menu), 2-ContentLoad(Actual UI invoker)
			,4 --@MenuState Int 1-None, 2-Invisible, 3-Selected, 4-Enabled, 5-Disabled
			,901 --@DisplayOrderMenu Int
			,'/fin/app/information/usr/markup.htm'
			,17096 --@HirNodeParent (Default 0) - Use this when query fetches duplicate parent menus.

Go

Create virtual directory for http://localhost/teamfincbt/player.html

Go

--Add new security nodes for BudgeAnnualzed2012 //already updated to prod


select * from hirnodes where hirnodfullpath like '\crothall\chimes\fin\Budgeting\Annualize%'
order by hirnode --hirnodfullpath
select max(hirnode) from hirnodes

      EXEC Esmv2.dbo.[HirNodeUpdate] 
            0 -- hirNode
            , 1 -- hirHierarchy
            , 17077 -- hirNodeParent
            , 9 -- hirLevel
            , 'Read' -- Title
            , 'Read' --Brief
            , 'Read' -- Description
            , 17086 -- DisplayOrder
            , 1 -- Active
            , 'compass-usa\data conversion' -- modBy

      EXEC Esmv2.dbo.[HirNodeUpdate] 
            0 -- hirNode
            , 1 -- hirHierarchy
            , 17077 -- hirNodeParent
            , 9 -- hirLevel
            , 'Write' -- Title
            , 'Write' --Brief
            , 'Write' -- Description
            , 17087 -- DisplayOrder
            , 1 -- Active
            , 'compass-usa\data conversion' -- modBy

      EXEC Esmv2.dbo.[HirNodeUpdate] 
            0 -- hirNode
            , 1 -- hirHierarchy
            , 17077 -- hirNodeParent
            , 9 -- hirLevel
            , 'ApproveBudget' -- Title
            , 'ApproveBudget' --Brief
            , 'ApproveBudget' -- Description
            , 17088 -- DisplayOrder
            , 1 -- Active
            , 'compass-usa\data conversion' -- modBy

      EXEC Esmv2.dbo.[HirNodeUpdate] 
            0 -- hirNode
            , 1 -- hirHierarchy
            , 17088 -- hirNodeParent
            , 9 -- hirLevel
            , 'Approve' -- Title
            , 'Approve' --Brief
            , 'Approve' -- Description
            , 17089 -- DisplayOrder
            , 1 -- Active
            , 'compass-usa\data conversion' -- modBy

      EXEC Esmv2.dbo.[HirNodeUpdate] 
            0 -- hirNode
            , 1 -- hirHierarchy
            , 17088 -- hirNodeParent
            , 9 -- hirLevel
            , 'Reject' -- Title
            , 'Reject' --Brief
            , 'Reject' -- Description
            , 17090 -- DisplayOrder
            , 1 -- Active
            , 'compass-usa\data conversion' -- modBy


****

New Columns to Site and HcmHousecodes


Use Esmv2
Go

Alter Table Esmv2.dbo.AppSites Add 
AppSitMedicareProviderId Varchar(50),
AppSitMorrisonAccount Bit,
AppSitSitePhone Varchar(15)

Use Teamfinv2
Go

Insert Into AppModulecolumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcISNullable, AppModcValidation, AppModcAdHocActive, AppModuleAssociate)
Values (4, 'AppSitMedicareProviderId', 'Medicare Provider Id', 100, 1, 'compass-usa\data conversion',getdate(), 'varchar', 1, Null, 1, Null)
Insert Into AppModulecolumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcISNullable, AppModcValidation, AppModcAdHocActive, AppModuleAssociate)
Values (4, 'AppSitMorrisonAccount', 'Morrison Account', 101, 1, 'compass-usa\data conversion',getdate(), 'bit', 1, 'bit', 1, Null)
Insert Into AppModulecolumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcISNullable, AppModcValidation, AppModcAdHocActive, AppModuleAssociate)
Values (4, 'AppSitSitePhone', 'Site Phone', 102, 1, 'compass-usa\data conversion',getdate(), 'varchar', 1, 'phone', 1, Null)


Alter Table Teamfinv2.dbo.HcmHouseCodes Add
HcmHoucReference Bit,
HcmHoucFormerProvider Varchar(50),
HcmHoucPayrollConversion DateTime,
HcmHoucClosedDate Datetime,
HcmHoucClosedReason Varchar(Max),
HcmHoucLostTo Varchar(50),
HcmHoucLocation Varchar(50)

Go

Insert Into AppModulecolumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcISNullable, AppModcValidation, AppModcAdHocActive, AppModuleAssociate)
Values (1, 'HcmHoucReference', 'Reference', 103, 1, 'compass-usa\data conversion',getdate(), 'bit', 1, 'bit', 1, Null)
Insert Into AppModulecolumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcISNullable, AppModcValidation, AppModcAdHocActive, AppModuleAssociate)
Values (1, 'HcmHoucFormerProvider', 'Former Provider', 104, 1, 'compass-usa\data conversion',getdate(), 'varchar', 1, Null, 1, Null)
Insert Into AppModulecolumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcISNullable, AppModcValidation, AppModcAdHocActive, AppModuleAssociate)
Values (1, 'HcmHoucPayrollConversion', 'Payroll Conversion', 105, 1, 'compass-usa\data conversion',getdate(), 'datetime', 1, 'datetime', 1, Null)
Insert Into AppModulecolumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcISNullable, AppModcValidation, AppModcAdHocActive, AppModuleAssociate)
Values (1, 'HcmHoucClosedDate', 'Closed Date', 106, 1, 'compass-usa\data conversion',getdate(), 'datetime', 1, 'datetime', 1, Null)
Insert Into AppModulecolumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcISNullable, AppModcValidation, AppModcAdHocActive, AppModuleAssociate)
Values (1, 'HcmHoucClosedReason', 'Closed Reason', 107, 1, 'compass-usa\data conversion',getdate(), 'varchar', 1, Null, 1, Null)
Insert Into AppModulecolumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcISNullable, AppModcValidation, AppModcAdHocActive, AppModuleAssociate)
Values (1, 'HcmHoucLostTo', 'Lost To', 108, 1, 'compass-usa\data conversion',getdate(), 'varchar', 1, Null, 1, Null)
Insert Into AppModulecolumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcISNullable, AppModcValidation, AppModcAdHocActive, AppModuleAssociate)
Values (1, 'HcmHoucLocation', 'Location', 109, 1, 'compass-usa\data conversion',getdate(), 'varchar', 1, Null, 1, Null)


-- Hierarchy Management Read/Write security

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\HirManagement'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Setup\HirManagement\Read', 'crothall', 'chimes', 'fin', 'Setup', 'HirManagement', 'Read', 'Compass-USA\Data Conversion', GetDate())

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 2, 1, '\crothall\chimes\fin\Setup\HirManagement\Write', 'crothall', 'chimes', 'fin', 'Setup', 'HirManagement', 'Write', 'Compass-USA\Data Conversion', GetDate())

-- AP Import Menu Insert [Begin]

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\AccountsReceivable'

EXEC ESMV2.dbo.HirNodeUpdate
	0 -- hirNode
	, 1 -- hirHierarchy
	, @HirNode -- hirNodeParent
	, 33 -- hirLevel
	, 'APImport' -- Title
	, 'AP Import' -- Brief
	, 'AP Import' -- Description
	, @DisplayOrder -- DisplayOrder
	, 1 -- Active
	, 'Compass-USA\Data Conversion' -- modBy

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\AccountsReceivable\APImport'

Insert Into ESMV2.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt, AppMenuDisplayType)
Values(2, 4, @HirNode, 'AP Import', 'AP Import', 1, 809, 'apimp', '/fin/rev/apImport/usr/markup.htm', 'Compass-USA\Data Conversion', GetDate(), 1)

Insert into ESMV2.dbo.HirGroupNodes Values (@HirNode, 1, 'Compass-USA\Data Conversion', GetDate())

-- AP Import Menu Insert [End]

-- AP Search Menu Insert [Begin]

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\AccountsReceivable'

EXEC ESMV2.dbo.HirNodeUpdate
	0 -- hirNode
	, 1 -- hirHierarchy
	, @HirNode -- hirNodeParent
	, 33 -- hirLevel
	, 'APSearch' -- Title
	, 'AP Search' -- Brief
	, 'AP Search' -- Description
	, @DisplayOrder -- DisplayOrder
	, 1 -- Active
	, 'Compass-USA\Data Conversion' -- modBy

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\AccountsReceivable\APSearch'

Insert Into ESMV2.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt, AppMenuDisplayType)
Values(2, 4, @HirNode, 'AP Search', 'AP Search', 1, 809, 'apsrh', '/fin/rev/apSearch/usr/markup.htm', 'Compass-USA\Data Conversion', GetDate(), 1)

Insert into ESMV2.dbo.HirGroupNodes Values (@HirNode, 1, 'Compass-USA\Data Conversion', GetDate())

-- AP Search Menu Insert [End]

-- SSRS Parameters setup [Begin]
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('WOR Report', 'WOR Report', 'WOR Report', 'WOR', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 1, Null, Null)

INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Payroll Report', 'Payroll Report', 'Payroll Report', 'Payroll', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 1, Null, Null)

INSERT INTO Teamfinv2.dbo.RptReportParameters
(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive, RptReppModBy, RptReppModAt)
VALUES(1, 'HirNode', 'HirNode', 'Integer', 'TreeView', '1', 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO Teamfinv2.dbo.RptReportParameters
(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive, RptReppModBy, RptReppModAt)
VALUES(1, 'Fiscal Year', 'FscYear', 'Integer', 'DropDown', '3', 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO Teamfinv2.dbo.RptReportParameters
(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive, RptReppModBy, RptReppModAt)
VALUES(1, 'Fiscal Period', 'FscPeriod', 'Integer', 'DropDown', '1', 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO Teamfinv2.dbo.RptReportParameters
(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive, RptReppModBy, RptReppModAt)
VALUES(2, 'HirNode', 'HirNode', 'Integer', 'TreeView', '1', 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO Teamfinv2.dbo.RptReportParameters
(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive, RptReppModBy, RptReppModAt)
VALUES(2, 'Fiscal Year', 'FscYear', 'Integer', 'DropDown', '3', 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO Teamfinv2.dbo.RptReportParameters
(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive, RptReppModBy, RptReppModAt)
VALUES(2, 'Fiscal Period', 'FscPeriod', 'Integer', 'DropDown', '1', 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO Teamfinv2.dbo.RptReportParameters
(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive, RptReppModBy, RptReppModAt)
VALUES(2, 'Fiscal Week', 'PayEmpwpWeek', 'Integer', 'DropDown', '1', 1, 'Compass-USA\Data Conversion', GetDate())

-- SSRS Parameters setup [End]

-- Verify AppModuleColumns datatype and validation columns
Update AppModuleColumns Set AppModcAdHocActive=1 Where AppModcAdHocActive Is Null And AppModule=1 -- HouseCode
Update AppModuleColumns Set AppModcAdHocActive=0 Where AppModuleColumn=1 -- HouseCode

--Create the virtual directory for rpt module and update the following details on web.config file.
-- CT Server
<add key="SSRSWebServiceURL" value="https://ctreports.crothall.com/reportserver/reportservice2005.asmx" />
<add key="SSRSReportPath" value="/Applications/TeamFin/SkunkWorks/TeamFin Subscriptions/" />
-- Production Server
<add key="SSRSWebServiceURL" value="https://reports.crothall.com/reportserver/reportservice2005.asmx" />
<add key="SSRSReportPath" value="/Applications/TeamFin/SkunkWorks/TeamFin Subscriptions/" />

--CT deployed 2.04.006 5/10/2012

--**Monthly Oeperating Projection

	Exec AppMenuItemUpdate 
		'MOP' --@MenuTitle Varchar(64)
		,2 --@MenuAction Int 1-DSubItems(main menu), 2-ContentLoad(Actual UI invoker)
		,4 --@MenuState Int 1-None, 2-Invisible, 3-Selected, 4-Enabled, 5-Disabled
		,106 --@DisplayOrderMenu Int
		,'/fin/bud/mop/usr/markup.htm'
		,41 --@HirNodeParent (Default 0) - Use this when query fetches duplicate parent menus.

	Update AppMenuItems Set AppMeniTitle = 'Monthly Oeperating Projection' Where AppMeniBrief  = 'MOP'

--**Security Node

      EXEC Esmv2.dbo.[HirNodeUpdate] 
            0 -- hirNode
            , 1 -- hirHierarchy
            , 16035 -- hirNodeParent
            , 9 -- hirLevel
            , 'FMLALOAStatusEditable' -- Title
            , 'FMLALOAStatusEdi' --Brief
            , 'FMLALOAStatusEditable' -- Description
            , --17520 -- DisplayOrder
            , 1 -- Active
            , 'compass-usa\data conversion' -- modBy
 
-- Update AppModuleColumns
Select 
	AppModcTitle, 
	AppModcDescription, 
	AppModcAdHocActive	 
From AppModuleColumns 
--Update AppModuleColumns Set AppModcAdHocActive = 0
Where AppModcAdHocActive = 1 And 
	(AppModcTitle Like '%brief' 
	Or AppModcTitle Like '%modby' 
	Or AppModcTitle Like '%modat'
	Or AppModcTitle Like '%crtdat'
	Or AppModcTitle Like '%crtdby'
	Or (AppModcTitle Like '%active' And AppModcTitle <> 'HcmHoucBedsActive')
	Or AppModcTitle Like 'pplperson'
	Or AppModcTitle Like 'appUser'
	Or AppModcTitle Like 'appsite'
	Or (AppModcTitle Like 'appUnit' And AppModcDescription Like 'appUnit')
	Or AppModcTitle Like 'hirnode'
	Or AppModcTitle Like 'hirhierarchy'
	Or AppModcTitle Like 'hirlevel'
	Or AppModcTitle Like 'empemployeeGeneral'
	Or AppModcTitle Like 'revinvoice'
	Or AppModcTitle Like '%version')


-- SSRS Reports security nodes [Begin]

Declare @HirNodeParent As Int
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @HirNode = HirNode, @HirNodeParent = HirNodeParent, @DisplayOrder = HirNodDisplayOrder From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS'
EXEC ESMV2.dbo.HirNodeUpdate @HirNode, 1, @HirNodeParent, 33, 'SSRS Reports', 'SSRS Reports', 'SSRS Reports', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports'
Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNodeParent, 9, 'AR Reports', 'AR Reports', 'AR Reports', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\AR Reports'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'By Invoice Number', 'By Invoice Numbe', 'By Invoice Number', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Print by User ID', 'Print by User ID', 'Print by User ID', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Invoice Status', 'Invoice Status', 'Invoice Status', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNodeParent, 9, 'Budget Reports', 'Budget Reports', 'Budget Reports', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Annual Summary', 'Annual Summary', 'Annual Summary', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Budget vs Actual', 'Budget vs Actual', 'Budget vs Actual', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Detail Rollup', 'Detail Rollup', 'Detail Rollup', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Hierarchy', 'Hierarchy', 'Hierarchy', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Period Projections', 'Period Projectio', 'Period Projections', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Budget Summary', 'Budget Summary', 'Budget Summary', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Annual Status', 'Annual Status', 'Annual Status', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Labor Calculations', 'Labor Calculatns', 'Labor Calculations', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Contract Billing', 'Contract Billing', 'Contract Billing', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Adjustments', 'Adjustments', 'Adjustments', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Capital Expenses', 'Capital Expenses', 'Capital Expenses', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Hourly Labor Increase', 'Hourly Labor', 'Hourly Labor Increase', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Management Labor Increase', 'Management Labor', 'Management Labor Increase', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Detail Pivot', 'Detail Pivot', 'Detail Pivot', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNodeParent, 9, 'Employee Reports', 'Employee Reports', 'Employee Reports', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Employee Reports'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Personnel Listing', 'Personnel List', 'Personnel Listing', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Personnel New Hires', 'New Hires', 'Personnel New Hires', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Personnel Pay Rate Change', 'Pay Rate Change', 'Personnel Pay Rate Change', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Personnel Review', 'Personnel Review', 'Personnel Review', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Personnel Seniority', 'Personnel Seniority', 'Personnel Seniority', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Personnel Termination', 'Termination', 'Personnel Termination', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNodeParent, 9, 'GL Reports', 'GL Reports', 'GL Reports', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\GL Reports'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Detailed Profit and Loss', 'Profit and Loss', 'Detailed Profit and Loss', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Job Cost Analysis', 'Job Cost Analys', 'Job Cost Analysis', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Transaction Details', 'Transaction Det', 'Transaction Details', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Period Summary', 'Period Summary', 'Period Summary', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNodeParent, 9, 'Payroll Reports', 'Payroll Reports', 'Payroll Reports', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Payroll Reports'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Payroll by PayCode', 'By PayCode', 'Payroll by PayCode', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Payroll Details', 'Payroll Details', 'Payroll Details', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Payroll Log', 'Payroll Log', 'Payroll Log', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Payroll Summmary', 'Payroll Summmary', 'Payroll Summmary', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Payroll Register', 'Payroll Register', 'Payroll Register', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Payroll Daily Hours', 'Daily Hours', 'Payroll Daily Hours', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Payroll Sign Sheet', 'Sign Sheet', 'Payroll Sign Sheet', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNodeParent, 9, 'PO Reports', 'PO Reports', 'PO Reports', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\PO Reports'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'By Org and Time', 'By Org and Time', 'By Org and Time', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'By PO Number', 'By PO Number', 'By PO Number', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNodeParent, 9, 'WOR Projection Reports', 'WOR Projection', 'WOR Projection Reports', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\WOR Projection Reports'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Forecasts by Site', 'Forecasts by Sit', 'Forecasts by Site', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'League Standings', 'League Standings', 'League Standings', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Period Forecasts', 'Period Forecasts', 'Period Forecasts', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Summary', 'Summary', 'Summary', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNodeParent, 9, 'Work Order Reports', 'WO Reports', 'Work Order Reports', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Work Order Reports'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Work Order Request', 'WO Request', 'Work Order Request', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Work Order Status', 'WO Status', 'Work Order Status', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNodeParent, 9, 'Informational Reports', 'Informational', 'Informational Reports', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Informational Reports'
Set @DisplayOrder = @DisplayOrder + 1
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'House Code Information', 'House Code Info', 'House Code Information', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

--Set @DisplayOrder = @DisplayOrder + 1
--EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNodeParent, 9, 'Ceridian Reports', 'Ceridian Reports', 'Ceridian Reports', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
--
--Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports'
--Set @DisplayOrder = @DisplayOrder + 1
--EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Audit Report', 'Audit Report', 'Audit Report', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
--Set @DisplayOrder = @DisplayOrder + 1
--EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'EPay Act vs Bud', 'EPay Act vs Bud', 'EPay Act vs Bud', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
--Set @DisplayOrder = @DisplayOrder + 1
--EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Labor Dashboard', 'Labor Dashboard', 'Labor Dashboard', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
--
--Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\Audit Report'
--INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
--VALUES('Audit Report', 'Audit Report', 'Audit Report', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fPayroll_Audit_Report&rs:Command=Render', @HirNode)
--
--Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\EPay Act vs Bud'
--INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
--VALUES('EPay Act vs Bud', 'EPay Act vs Bud', 'EPay Act vs Bud', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fEpayBudgetTimesheetCustomer&rs:Command=Render', @HirNode)
--
--Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\Labor Dashboard'
--INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
--VALUES('Labor Dashboard', 'Labor Dashboard', 'Labor Dashboard', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fTeamFin_Labor_Dashboard&rs:Command=Render', @HirNode)
--
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports\Hierarchy'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Budget Hierarchy', 'Budget Hierarchy', 'Budget Hierarchy', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Budgeting%2fBudget_Hierarchy&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports\Budget Summary'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Budget Summary', 'Budget Summary', 'Budget Summary', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Budgeting%2fBudget_Summary&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports\Detail Pivot'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Detail Pivot', 'Budget Detail Pivot', 'Budget Detail Pivot', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Budgeting%2fBudget_Detail_Pivot&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports\Hourly Labor Increase'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Hourly Labor', 'Hourly Labor Increase', 'Hourly Labor Increase', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Budgeting%2fHourly_Labor_Increase&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports\Management Labor Increase'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Management Labor', 'Management Labor Increase', 'Management Labor Increase', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Budgeting%2fMgmt_Labor_Increase&rs:Command=Render', @HirNode)

-- SSRS Reports security nodes [End]


SET NOCOUNT ON;
SET DATEFORMAT ymd;

SET IDENTITY_INSERT [dbo].[EmpUnionStatusTypes] ON;

INSERT INTO [dbo].[EmpUnionStatusTypes] ([EmpUnionStatusType], [EmpUnistBrief], [EmpUnistTitle], [EmpUnistDescription], [EmpUnistDisplayOrder], [EmpUnistActive], [EmpUnistModBy], [EmpUnistModAt]) 
	VALUES ( 1, 'Non-Union', 'Non-Union', 'Non-Union', 1, 1, 'compass-usa\data conversion', '2012-05-16 12:00:50.393' );

INSERT INTO [dbo].[EmpUnionStatusTypes] ([EmpUnionStatusType], [EmpUnistBrief], [EmpUnistTitle], [EmpUnistDescription], [EmpUnistDisplayOrder], [EmpUnistActive], [EmpUnistModBy], [EmpUnistModAt]) 
	VALUES ( 2, 'Unionw/oCroBenef', 'Union w/Crothall Benefits', 'Union w/Crothall Benefits', 2, 1, 'compass-usa\data conversion', '2012-05-16 12:00:50.393' );

INSERT INTO [dbo].[EmpUnionStatusTypes] ([EmpUnionStatusType], [EmpUnistBrief], [EmpUnistTitle], [EmpUnistDescription], [EmpUnistDisplayOrder], [EmpUnistActive], [EmpUnistModBy], [EmpUnistModAt]) 
	VALUES ( 3, 'Unionw/oCroBenef', 'Union w/o Crothall Benefits', 'Union w/o Crothall Benefits', 3, 1, 'compass-usa\data conversion', '2012-05-16 12:00:50.393' );

SET IDENTITY_INSERT [dbo].[EmpUnionStatusTypes] OFF;

-- CT deployed June 8, 2012

-- New Ceridian Reports (already updated on CT)
Use esmv2
Go

Alter Table Esmv2..AppMenuItems Alter column AppMeniActionData Varchar(500) Null
Go

Declare  @DisplayOrderMenu Int
Select @DisplayOrderMenu =  max(appmenidisplayorder)+1 from esmv2..appmenuitems where appmeniactiondata like '/fin/rpt/ceridianReport/usr%'

--select max(hirnode) from hirnodes

--Menu Fin>CeridianReports>ChargeTo
	Exec AppMenuItemUpdate 
		'ChargeTo' --@MenuTitle Varchar(64)
		,2 --@MenuAction Int 1-mainmenu, 2-submenu
		,4 --@MenuState Int 3-selected, 4-enabled
		,@DisplayOrderMenu 
		,'/fin/rpt/ceridianReport/usr/markup.htm?reportId=ChargeTo&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridian_ChargeTo&rs:Command=Render'
		,17016 --@HirNodeParent

Set @DisplayOrderMenu=@DisplayOrderMenu+1

--Menu Fin>CeridianReports>PTD Register Employee Detail
	Exec AppMenuItemUpdate 
		'PTD Register Employee Detail' --@MenuTitle Varchar(64)
		,2 --@MenuAction Int 1-mainmenu, 2-submenu
		,4 --@MenuState Int 3-selected, 4-enabled
		,@DisplayOrderMenu
		,'/fin/rpt/ceridianReport/usr/markup.htm?reportId=PTD Register Employee Detail&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridianPTDRegisterEmployeeDetail&rs:Command=Render'
		,17016 --@HirNodeParent

Set @DisplayOrderMenu=@DisplayOrderMenu+1

--Menu Fin>CeridianReports>YTD Register Employee Detail
	Exec AppMenuItemUpdate 
		'YTD Register Employee Detail' --@MenuTitle Varchar(64)
		,2 --@MenuAction Int 1-mainmenu, 2-submenu
		,4 --@MenuState Int 3-selected, 4-enabled
		,356--@DisplayOrderMenu 
		,'/fin/rpt/ceridianReport/usr/markup.htm?reportId=YTD Register Employee Detail&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridianYTDRegisterEmployeeDetail&rs:Command=Render'
		,17016 --@HirNodeParent

Set @DisplayOrderMenu=@DisplayOrderMenu+1

--Menu Fin>CeridianReports>Employee Active Not Paid
	Exec AppMenuItemUpdate 
		'Employee Active Not Paid' --@MenuTitle Varchar(64)
		,2 --@MenuAction Int 1-mainmenu, 2-submenu
		,4 --@MenuState Int 3-selected, 4-enabled
		,@DisplayOrderMenu 
		,'/fin/rpt/ceridianReport/usr/markup.htm?reportId=Employee Active Not Paid&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fEmployeeActiveNotPaid&rs:Command=Render'
		,17016 --@HirNodeParent

Set @DisplayOrderMenu=@DisplayOrderMenu+1

--Menu Fin>CeridianReports>Employee Master Listing
	Exec AppMenuItemUpdate 
		'Employee Master Listing' --@MenuTitle Varchar(64)
		,2 --@MenuAction Int 1-mainmenu, 2-submenu
		,4 --@MenuState Int 3-selected, 4-enabled
		,@DisplayOrderMenu 
		,'/fin/rpt/ceridianReport/usr/markup.htm?reportId=Employee Master Listing&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fEmployeeMasterListing&rs%3aCommand=Render'
		,17016 --@HirNodeParent

Set @DisplayOrderMenu=@DisplayOrderMenu+1

--Menu Fin>CeridianReports>Payroll IDR
	Exec AppMenuItemUpdate 
		'Payroll IDR' --@MenuTitle Varchar(64)
		,2 --@MenuAction Int 1-mainmenu, 2-submenu
		,4 --@MenuState Int 3-selected, 4-enabled
		,@DisplayOrderMenu 
		,'/fin/rpt/ceridianReport/usr/markup.htm?reportId=Payroll IDR&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fPayroll_IDR_Report&rs%3aCommand=Render'
		,17016 --@HirNodeParent

Go

update m_env_environments set m_env_env_logout_url = 'https://finct.crothall.com/fin/app/usr/closeBrowser.htm' where m_env_environment = 3
update m_env_environments set m_env_env_logout_url = 'https://teamfin.crothall.com/fin/app/usr/closeBrowser.htm' where m_env_environment = 4
select * from m_env_environments

--**
manual update (copy over) main.js

adh > setup > main.js
emp > employeeSearch > main.js
hcm > housecode > main.js
hcm > housecodeWizard > main.js
inv > inventoryItem > main.js

--**
--Menu Fin>Payables
Select max(hirnode) from hirnodes
Select top 15 * from hirnodes order by hirnode desc

	  Exec AppMenuItemUpdate 
			'Payables' --@MenuTitle Varchar(64)
			,1 --@MenuAction Int
			,4 --@MenuState Int 
			,470 --@DisplayOrderMenu Int
			,null --@MenuFilePath varchar(500)
			,7 --@HirNodeParent Int -- fin

      EXEC Esmv2.dbo.[HirNodeUpdate] 
            17465 -- hirNode
            , 1 -- hirHierarchy
            , --17530 -- hirNodeParent
            , 33 -- hirLevel
            , 'AP Import' -- Title
            , 'AP Import' --Brief
            , 'AP Import' -- Description
            , 17465 -- DisplayOrder
            , 1 -- Active
            , 'compass-usa\data conversion' -- modBy

      EXEC Esmv2.dbo.[HirNodeUpdate] 
            17466 -- hirNode
            , 1 -- hirHierarchy
            , --17530 -- hirNodeParent
            , 33 -- hirLevel
            , 'AP Search' -- Title
            , 'AP Search' --Brief
            , 'AP Search' -- Description
            , 17466 -- DisplayOrder
            , 1 -- Active
            , 'compass-usa\data conversion' -- modBy

--Update appmenuitems set appmenidisplayorder = '470' where appmenuitem = --117
Update appmenuitems set appmenidisplayorder = '471' where appmenuitem = 104
Update appmenuitems set appmenidisplayorder = '472' where appmenuitem = 105
--** Payables

Update [HcmServiceTypes] Set HcmSertBrief = 'PT' Where HcmServiceType  = 12

