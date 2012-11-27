-- Please consult development lead before executing the script.

-- Begin -- HouseCode Job Scripts >> Anis

-- need to update HirNodeId's as actual
Use Esmv2

Go

EXEC Esmv2.dbo.[HirNodeUpdate] 2180, 1, 2046, 33, 
	'Jobs', 'Jobs', 'Jobs', 0, 1, 'persistech\data conversion'

INSERT INTO [Esmv2].[dbo].[AppMenuItems]
           ([AppMenuAction]
           ,[AppMenuState]
           ,[HirNode]
           ,[AppMeniBrief]
           ,[AppMeniTitle]
           ,[AppMeniActive]
           ,[AppMeniDisplayOrder]
           ,[AppMeniID]
           ,[AppMeniActionData]
           ,[AppMeniModBy]
           ,[AppMeniModAt]
           ,[AppMenuDisplayType])
     VALUES
           (2
           ,4
           ,2180
           ,'Jobs'
           ,'Jobs'
           ,1
           ,704
           ,'job'
           ,'/fin/hcm/job/usr/markup.htm'
           ,'persistech\anis shikalgar'
           , getdate()
           ,1)
GO

EXEC Esmv2.dbo.[HirNodeUpdate] 0,
 1,
  (Select hirnode from hirnodes where hirnodfullpath = '\ii\framework\esm\ppl\master'),
   33,
    'FINESM',
     'FINESM',
      'FINESM', 
      0, 
      1, 
      'persistech\data conversion'

USE [TeamFinv2]
GO

Drop Table [HcmJobs]
Go

CREATE TABLE [dbo].[HcmJobs](
	[HcmJob] [int] IDENTITY(1,1) NOT NULL,
	[FscJDEJobCode] [int] NULL,
	[HcmJobBrief] [varchar](8) NOT NULL,
	[HcmJobTitle] [varchar](40) NOT NULL,
	[HcmJobDescription] [varchar](256) NOT NULL,
	[HcmJobAddress] [varchar](41) NULL,
	[HcmJobCity] [varchar](50) NULL,
	[AppStateType] Int NULL,
	[HcmJobPostalCode] [varchar](12) NULL,
	[HcmJobPhysicalLocation] Bit NOT NULL,
	[HcmJobDisplayOrder] Int NOT NULL,
	[HcmJobActive] Bit NOT NULL,
	[HcmJobModBy] varchar (50) NOT NULL,
	[HcmJobModAt] datetime NOT NULL,
	Constraint Pk_HcmJobs Primary Key Clustered ([HcmJob]) 
	On [Primary]
)
Go

Insert Into [HcmJobs] ([FscJDEJobCode], [HcmJobBrief], [HcmJobTitle], [HcmJobDescription], [HcmJobPhysicalLocation]
, [HcmJobAddress], [HcmJobCity],  [AppStateType],  [HcmJobPostalCode], [HcmJobDisplayOrder], [HcmJobActive], [HcmJobModBy], [HcmJobModAt] ) 
Values (null, '1231', 'Job1', 'Job1', 0, '1234 Broadway', 'Tucson', 4, '85750', 1, 1, 'persistech\data conversion', getdate())
Insert Into [HcmJobs] ([FscJDEJobCode], [HcmJobBrief], [HcmJobTitle], [HcmJobDescription], [HcmJobPhysicalLocation], [HcmJobAddress], [HcmJobCity],  [AppStateType],  [HcmJobPostalCode], [HcmJobDisplayOrder], [HcmJobActive], [HcmJobModBy], [HcmJobModAt] ) 
Values (null, '1232', 'Job2', 'Job2', 0, '1234 Broadway', 'Tucson', 4, '85750', 2, 1,  'persistech\data conversion', getdate())
Insert Into [HcmJobs] ([FscJDEJobCode], [HcmJobBrief], [HcmJobTitle], [HcmJobDescription], [HcmJobPhysicalLocation], [HcmJobAddress], [HcmJobCity],  [AppStateType],  [HcmJobPostalCode], [HcmJobDisplayOrder], [HcmJobActive], [HcmJobModBy], [HcmJobModAt] ) 
Values (null, '1233', 'Job3', 'Job3', 1, '1234 Broadway', 'Tucson', 4, '85750', 3, 1,  'persistech\data conversion', getdate())
Insert Into [HcmJobs] ([FscJDEJobCode], [HcmJobBrief], [HcmJobTitle], [HcmJobDescription], [HcmJobPhysicalLocation], [HcmJobAddress], [HcmJobCity],  [AppStateType],  [HcmJobPostalCode], [HcmJobDisplayOrder], [HcmJobActive], [HcmJobModBy], [HcmJobModAt] ) 
Values (null, '1234', 'Job4', 'Job4', 0, '1234 Broadway', 'Tucson', 4, '85750', 4, 1,  'persistech\data conversion', getdate())
Insert Into [HcmJobs] ([FscJDEJobCode], [HcmJobBrief], [HcmJobTitle], [HcmJobDescription], [HcmJobPhysicalLocation], [HcmJobAddress], [HcmJobCity],  [AppStateType],  [HcmJobPostalCode], [HcmJobDisplayOrder], [HcmJobActive], [HcmJobModBy], [HcmJobModAt] ) 
Values (null, '1235', 'Job5', 'Job5', 1, '1234 Broadway', 'Tucson', 4, '85750', 5, 1,  'persistech\data conversion', getdate())
Go

Drop Table [HcmHouseCodeJobs]
Go

CREATE TABLE [dbo].[HcmHouseCodeJobs](
	[HcmHouseCodeJob] [int] IDENTITY(1,1) NOT NULL,
	[HcmHouseCode] [int] NOT NULL,
	[HcmJob] [int] NOT NULL,
	[HcmHoucjActive] bit NOT NULL,
	[HcmHoucjModBy] varchar (50) NOT NULL,
	[HcmHoucjModAt] datetime NOT NULL,
	Constraint Pk_HcmHouseCodeJobs Primary Key Clustered ([HcmHouseCodeJob]) 
	On [Primary]
)

Go

Insert Into [HcmHouseCodeJobs] ([HcmHouseCode],[HcmJob],[HcmHoucjActive],[HcmHoucjModBy],[HcmHoucjModAt])
Values (286, 1, 1,  'persistech\data conversion', getdate())
Insert Into [HcmHouseCodeJobs] ([HcmHouseCode],[HcmJob],[HcmHoucjActive],[HcmHoucjModBy],[HcmHoucjModAt])
Values (286, 2, 1,  'persistech\data conversion', getdate())
Insert Into [HcmHouseCodeJobs] ([HcmHouseCode],[HcmJob],[HcmHoucjActive],[HcmHoucjModBy],[HcmHoucjModAt])
Values (787, 3, 1,  'persistech\data conversion', getdate())
Insert Into [HcmHouseCodeJobs] ([HcmHouseCode],[HcmJob],[HcmHoucjActive],[HcmHoucjModBy],[HcmHoucjModAt])
Values (116, 4, 1,  'persistech\data conversion', getdate())

Go

Drop Table [HcmJobTemplates]
Go

CREATE TABLE [dbo].[HcmJobTemplates](
	[HcmJobTemplate] [int] IDENTITY(1,1) NOT NULL,
	[HcmJobtTitle] [varchar](40) NOT NULL,
	[HcmJobtBrief] [varchar](8) NOT NULL,
	[HcmJobtDescription] [varchar](40) NOT NULL,
	[HcmJobtAddress] [varchar](41) NULL,
	[HcmJobtCity] [varchar](50) NULL,
	[AppStateType] Int NULL,
	[HcmJobtPostalCode] [varchar](12) NULL,
	[HcmJobtPhysicalLocation] Bit NOT NULL,
	[HcmJobtDisplayOrder] Int NOT NULL,
	[HcmJobtActive] Bit NOT NULL,
	[HcmJobtModBy] varchar (50) NOT NULL,
	[HcmJobtModAt] datetime NOT NULL,
	Constraint Pk_HcmJobTemplates Primary Key Clustered ([HcmJobTemplate]) 
	On [Primary]
)

Go

Truncate Table [HcmJobTemplates]
Go

INSERT INTO [Teamfinv2].[dbo].[HcmJobTemplates] ([HcmJobtTitle], [HcmJobtBrief], [HcmJobtDescription], [HcmJobtAddress], [HcmJobtCity], [AppStateType], [HcmJobtPostalCode], [HcmJobtPhysicalLocation], [HcmJobtDisplayOrder], [HcmJobtActive], [HcmJobtModBy], [HcmJobtModAt])
     VALUES('Template-1 Building', '7777', 'Building-1', '1333 Silver Blvd', 'Los Angeles', 5, '90028', 1, 1, 1, 'persistech\data conversion', getdate())

INSERT INTO [Teamfinv2].[dbo].[HcmJobTemplates] ([HcmJobtTitle], [HcmJobtBrief], [HcmJobtDescription], [HcmJobtAddress], [HcmJobtCity], [AppStateType], [HcmJobtPostalCode], [HcmJobtPhysicalLocation], [HcmJobtDisplayOrder], [HcmJobtActive], [HcmJobtModBy], [HcmJobtModAt])
     VALUES('Template-2 Building', '8888', 'Building-2', '1777 Broadway Blvd', 'Tucson', 4, '85750', 1, 2, 1, 'persistech\data conversion', getdate())

INSERT INTO [Teamfinv2].[dbo].[HcmJobTemplates] ([HcmJobtTitle], [HcmJobtBrief], [HcmJobtDescription], [HcmJobtAddress], [HcmJobtCity], [AppStateType], [HcmJobtPostalCode], [HcmJobtPhysicalLocation], [HcmJobtDisplayOrder], [HcmJobtActive], [HcmJobtModBy], [HcmJobtModAt])
     VALUES('Template-3 Landscape', '9999', 'Landscaping-1', null, null, null, null, 0, 3, 0, 'persistech\data conversion', getdate())

INSERT INTO [Teamfinv2].[dbo].[HcmJobTemplates] ([HcmJobtTitle], [HcmJobtBrief], [HcmJobtDescription], [HcmJobtAddress], [HcmJobtCity], [AppStateType], [HcmJobtPostalCode], [HcmJobtPhysicalLocation], [HcmJobtDisplayOrder], [HcmJobtActive], [HcmJobtModBy], [HcmJobtModAt])
     VALUES('Template-4 Landscape', '6666', 'Landscaping-2', null, null, null, null, 0, 4, 1, 'persistech\data conversion', getdate())
     
--Select * from HcmJobTemplates     
GO


/*
Update HouseCodeJobs & EmpEmployeeGenerals 

Truncate Table HcmHouseCodeJobs

Update HcmJobs Set 
	HcmJobTitle = 'Default', 
	HcmJobDescription = 'Default'
Where HcmJob = 1

Select * from EmpEmployeeGenerals Where HcmHouseCode = 286

Select * from HcmJobs
Select * from HcmHouseCodeJobs

*/

Set NoCount On
Go

Declare @HcmHouseCode Int
, @HcmHouseCodeJob Int

Declare tmpCur Cursor For 
	Select HcmHouseCode From HcmHouseCodes

Open tmpCur

While 1=1
Begin

	Fetch Next From tmpCur Into @HcmHouseCode
	If @@Fetch_Status <> 0 Break

	Insert Into HcmHouseCodeJobs 
		(HcmHouseCode, HcmJob, HcmHoucjActive, HcmHoucjModBy, HcmHoucjModAt) 
		Values(@HcmHouseCode, 1, 1, 'persistech\data conversion',GetDate())
	
	Set @HcmHouseCodeJob = @@Identity
	
	--Update Employee -- we may need to consider other tables for similar default update of HcmHouseCodeJob.
	Update EmpEmployeeGenerals 
		Set HcmHouseCodeJob = @HcmHouseCodeJob
			Where HcmHouseCode = @HcmHouseCode
End
Close tmpCur
Deallocate tmpCur

Go
-- End of HouseCode Job Scripts


-- Payroll Calendar Menu Insert
Declare @HirNode As Int

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodModBy, HirNodModAt)
Values(1, 33, 2171, 'Calendar', 'Calendar', 'Calendar', Null, 1, '\crothall\chimes\fin\Payroll\Calendar', 'crothall', 'chimes', 'fin', 'Payroll', 'Calendar', 'Persistech\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Payroll\Calendar'

Insert Into ESMV2.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt, AppMenuDisplayType)
Values(2, 4, @HirNode, 'Calendar', 'Calendar', 1, 304, 'cal', '/fin/pay/payCalendar/usr/markup.htm', 'Persistech\Data Conversion', GetDate(), 1)

------------------------PayEmployeeWeeklyPayrolls - 06-18-2010-------Kaushal Kishor Pandey----------

-- Adding HcmHouseCodeJob column in PayEmployeeWeeklyPayrolls  Table


1) Alter Table PayEmployeeWeeklyPayrolls add HcmHouseCodeJob int

2) Alter Table PayEmployeeWeeklyPayrolls  add PayrollHcmHouseCode int

3) update SP "PayEmployeeWeeklyPayrollSelect"

4) Update SP "PayEmployeeWeeklyPayrollUpdate"

--------------------------

---------------Employee General Type Table - 06-18-2010-------Kaushal Kishor Pandey----------
---Begin Employee General Type


-- Employee Generals
Alter Table EmpEmployeeGenerals Add EmpI9Type int not null default(1)

Alter Table EmpEmployeeGenerals Add EmpVetType int not null default(1)

Alter Table EmpEmployeeGenerals Add EmpSeparationCode int not null default(1)

----Job Code update

Insert Into EmpJobCodeTypes
Select IsNull([value], ''), IsNull(Description, ''), IsNull(Description, ''), '1', '1', 'Persistech/Kishor Pandey', getdate() From ['Job Codes$']

Alter Table EmpEmployeeGenerals Add EmpJobStartReasonType int not null default(1)

Alter Table empEmployeeGenerals Add EmpEmpgEffectiveDateJob Datetime

Alter Table empEmployeeGenerals Add EmpEmpgEffectiveDateCompensation Datetime
---------------------------------

Insert Into Emp	(Brief, Title, Description, DisplayOrder, Active, ModBy, ModAt)
Values ('', '', '', 1, 1, 'persistech\data conversion', GetDate())

/* -- Vets
Active Military	>>Other Protected Vet
Active Reserves	>>Active Reserves
Inactive Reserves	>>Inactive Reserves
Not a Veteran	>>Not a Veteran
Recently discharged veteran	>>1 Year Recently Separated Vet
Retired Military	>>Retired Military
Special Disabled Veteran	>>Special Disabled Veteran
Veteran	>>Veteran
Vietnam Era Veteran	>>Vietnam Era Veteran
*/

Create Table EmpVetTypes
(
	EmpVetType int identity(1,1) Primary Key
	, EmpVettBrief varchar(16)
	, EmpVettTitle varchar(64)
	, EmpVettDescription varchar(256)
	, EmpVettDisplayOrder int
	, EmpVettActive bit
	, EmpVettModBy varchar(50)
	, EmpVettModAt datetime
)
Go
--------------------------------------------------------
Insert Into EmpVetTypes	(EmpVettBrief, EmpVettTitle, EmpVettDescription, EmpVettDisplayOrder, EmpVettActive, EmpVettModBy, EmpVettModAt)
Values ('', 'Active Military', 'Other Protected Vet', 1, 1, 'persistech\data conversion', GetDate())

Insert Into EmpVetTypes	(EmpVettBrief, EmpVettTitle, EmpVettDescription, EmpVettDisplayOrder, EmpVettActive, EmpVettModBy, EmpVettModAt)
Values ('', 'Active Reserves', 'Active Reserves', 2, 1, 'persistech\data conversion', GetDate())

Insert Into EmpVetTypes	(EmpVettBrief, EmpVettTitle, EmpVettDescription, EmpVettDisplayOrder, EmpVettActive, EmpVettModBy, EmpVettModAt)
Values ('', 'Inactive Reserves', 'Inactive Reserves', 3, 1, 'persistech\data conversion', GetDate())

Insert Into EmpVetTypes	(EmpVettBrief, EmpVettTitle, EmpVettDescription, EmpVettDisplayOrder, EmpVettActive, EmpVettModBy, EmpVettModAt)
Values ('', 'Not a Veteran', 'Not a Veteran', 4, 1, 'persistech\data conversion', GetDate())

Insert Into EmpVetTypes	(EmpVettBrief, EmpVettTitle, EmpVettDescription, EmpVettDisplayOrder, EmpVettActive, EmpVettModBy, EmpVettModAt)
Values ('', 'Recently discharged veteran', '1 Year Recently Separated Vet', 5, 1, 'persistech\data conversion', GetDate())

Insert Into EmpVetTypes	(EmpVettBrief, EmpVettTitle, EmpVettDescription, EmpVettDisplayOrder, EmpVettActive, EmpVettModBy, EmpVettModAt)
Values ('', 'Retired Military', 'Retired Military', 6, 1, 'persistech\data conversion', GetDate())

Insert Into EmpVetTypes	(EmpVettBrief, EmpVettTitle, EmpVettDescription, EmpVettDisplayOrder, EmpVettActive, EmpVettModBy, EmpVettModAt)
Values ('', 'Special Disabled Veteran', 'Special Disabled Veteran', 7, 1, 'persistech\data conversion', GetDate())

Insert Into EmpVetTypes	(EmpVettBrief, EmpVettTitle, EmpVettDescription, EmpVettDisplayOrder, EmpVettActive, EmpVettModBy, EmpVettModAt)
Values ('', 'Veteran', 'Veteran', 8, 1, 'persistech\data conversion', GetDate())

Insert Into EmpVetTypes	(EmpVettBrief, EmpVettTitle, EmpVettDescription, EmpVettDisplayOrder, EmpVettActive, EmpVettModBy, EmpVettModAt)
Values ('', 'Vietnam Era Veteran', 'Vietnam Era Veteran', 9, 1, 'persistech\data conversion', GetDate())
------------------------------------
/* -- I-9
Citizen	Citizen
Permanent resident	Permanent resident
Registered alien	Registered alien
*/

Create Table EmpI9Types
(
	EmpI9Type int identity(1,1) Primary Key
	, EmpI9tBrief varchar(16)
	, EmpI9tTitle varchar(64)
	, EmpI9tDescription varchar(256)
	, EmpI9tDisplayOrder int
	, EmpI9tActive bit
	, EmpI9tModBy varchar(50)
	, EmpI9tModAt datetime
)
Go
---------------------------------------

Insert Into EmpI9Types	(EmpI9tBrief, EmpI9tTitle, EmpI9tDescription, EmpI9tDisplayOrder, EmpI9tActive, EmpI9tModBy, EmpI9tModAt)
Values ('', 'Citizen', 'Citizen', 1, 1, 'persistech\data conversion', GetDate())

Insert Into EmpI9Types	(EmpI9tBrief, EmpI9tTitle, EmpI9tDescription, EmpI9tDisplayOrder, EmpI9tActive, EmpI9tModBy, EmpI9tModAt)
Values ('', 'Permanent resident', 'Permanent resident', 2, 1, 'persistech\data conversion', GetDate())

Insert Into EmpI9Types	(EmpI9tBrief, EmpI9tTitle, EmpI9tDescription, EmpI9tDisplayOrder, EmpI9tActive, EmpI9tModBy, EmpI9tModAt)
Values ('', 'Registered alien', 'Registered alien', 3, 1, 'persistech\data conversion', GetDate())


/* Pay Frequency
B	Biweekly
W	Weekly
*/

Select * from PayPayFrequencyTypes

Insert Into PayPayFrequencyTypes (PayPayftBrief, PayPayftTitle, PayPayftDescription, PayPayftDisplayOrder, PayPayftActive, PayPayftModBy, PayPayftModAt)
Values ('B', 'Biweekly', 'Biweekly', 1, 1, 'persistech\data conversion', GetDate())
Values ('W', 'Weekly', 'Weekly', 1, 1, 'persistech\data conversion', GetDate())

/* -- Compensation Change >> Rate Change Reason
(none)						(none)
(Split)						(Split)
Annual Increase				Annual Increase
Cost of living adjustment	Cost of living adjustment
Demotion					Demotion
Increase - Level with peers	Increase - Level with peers
Increase in Responsibility	Increase in Responsibility
Less Responsibility			Less Responsibility
Merit Increase				Merit Increase
New hire					New hire
Probationary Increase		Probationary Increase
Promotion					Promotion
Rehire						Rehire
Transfer					Transfer
*/

Select * from EmpRateChangeReasonTypes

Insert Into EmpRateChangeReasonTypes (EmpRatcrtBrief, EmpRatcrtTitle, EmpRatcrtDescription, EmpRatcrtDisplayOrder, EmpRatcrtActive, EmpRatcrtModBy, EmpRatcrtModAt)
Values ('(none)', '(none)', '(none)', 1, 1, 'persistech\data conversion', GetDate())
Values ('(Split)', '(Split)', '(Split)', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Annual Increase', 'Annual Increase', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Cost of living adjustment', 'Cost of living adjustment', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Demotion', 'Demotion', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Increase - Level with peers', 'Increase - Level with peers', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Increase in Responsibility', 'Increase in Responsibility', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Less Responsibility', 'Less Responsibility', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Merit Increase', 'Merit Increase', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'New hire', 'New hire', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Probationary Increase', 'Probationary Increase', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Promotion', 'Promotion', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Rehire', 'Rehire', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Transfer', 'Transfer', 1, 1, 'persistech\data conversion', GetDate())

/* -- Employee Joining Reasons
(none)					(none)
Demotion				Demotion
Hourly Promotion		Hourly Promotion
Hrly Promotion/Trans	Hrly Promotion/Trans
Job Change				Job Change
New hire				New hire
Other					Other
Position Info Change	Position Info Change
Promotion				Promotion
Promotion/Transfer		Promotion/Transfer
Rehire					Rehire
Transfer				Transfer
*/

Insert Into Emp	(Brief, Title, Description, DisplayOrder, Active, ModBy, ModAt)
Values ('', '(none)', '(none)', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Demotion', 'Demotion', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Hourly Promotion', 'Hourly Promotion', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Hrly Promotion/Trans', 'Hrly Promotion/Trans', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Job Change', 'Job Change', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'New hire', 'New hire', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Other', 'Other', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Position Info Change', 'Position Info Change', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Promotion', 'Promotion', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Promotion/Transfer', 'Promotion/Transfer', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Rehire', 'Rehire', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Transfer', 'Transfer', 1, 1, 'persistech\data conversion', GetDate())

/* -- Employee Termination Reasons
(none)					(none)
Change in pay			Change in pay
Job Change				Job Change
Other					Other
Position Info Change	Position Info Change
Promotion				Promotion
Termination				Termination
Transfer				Transfer
*/

Select * from EmpTerminationReasonTypes

Insert Into EmpTerminationReasonTypes	(Brief, Title, Description, DisplayOrder, Active, ModBy, ModAt)
Values ('', '(none)', '(none)', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Change in pay', 'Change in pay', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Job Change', 'Job Change', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Other', 'Other', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Position Info Change', 'Position Info Change', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Promotion', 'Promotion', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Termination', 'Termination', 1, 1, 'persistech\data conversion', GetDate())
Values ('', 'Transfer', 'Transfer', 1, 1, 'persistech\data conversion', GetDate())

/* need a excel import to read records in table*/

/*
CN8	Crothall Healthcare Hourly Biweekly
FW4	Crothall Healthcare Management Biweekly
HV9	Crothall Healthcare Hourly Weekly
ME9	Crothall Healthcare Corporate Biweekly
MR8	Eurest Services Hourly Biweekly
MR9	Eurest Services Management Biweekly
NV9	Eurest Services Hourly Weekly
NQ4	CES Hourly Biweekly
NS6	CES Management Biweekly
ME7	Laundry Hourly Weekly
ME8	Laundry Management Biweekly
*/

Select * from PayPayrollCompanies

Update PayPayrollCompanies Set PayPaycTitle = 'Crothall Healthcare Hourly Biweekly'
	Where PayPaycBrief = 'CN8'
Update PayPayrollCompanies Set PayPaycTitle = 'Crothall Healthcare Management Biweekly'
	Where PayPaycBrief = 'FW4'
Update PayPayrollCompanies Set PayPaycTitle = 'Crothall Healthcare Hourly Weekly'
	Where PayPaycBrief = 'HV9'
Update PayPayrollCompanies Set PayPaycTitle = 'Crothall Healthcare Corporate Biweekly'
	Where PayPaycBrief = 'ME9'
Update PayPayrollCompanies Set PayPaycTitle = 'Eurest Services Hourly Biweekly'
	Where PayPaycBrief = 'MR8'
Update PayPayrollCompanies Set PayPaycTitle = 'Eurest Services Management Biweekly'
	Where PayPaycBrief = 'MR9'
Update PayPayrollCompanies Set PayPaycTitle = 'Eurest Services Hourly Weekly'
	Where PayPaycBrief = 'NV9'
Update PayPayrollCompanies Set PayPaycTitle = 'CES Hourly Biweekly'
	Where PayPaycBrief = 'NQ4'
Update PayPayrollCompanies Set PayPaycTitle = 'CES Management Biweekly'
	Where PayPaycBrief = 'NS6'
Update PayPayrollCompanies Set PayPaycTitle = 'Laundry Hourly Weekly'
	Where PayPaycBrief = 'ME7'
Update PayPayrollCompanies Set PayPaycTitle = 'Laundry Management Biweekly'
	Where PayPaycBrief = 'ME8'
	

/*
EmpJobStartReasonTypes
Start Reason	
(none)					(none)
Demotion				Demotion
Hourly Promotion		Hourly Promotion
Hrly Promotion/Trans	Hrly Promotion/Trans
Job Change				Job Change
New hire				New hire
Other					Other
Position Info Change	Position Info Change
Promotion				Promotion
Promotion/Transfer		Promotion/Transfer
Rehire					Rehire
Transfer				Transfer

*/

Create Table EmpJobStartReasonTypes
(
	EmpJobStartReasonType int identity(1,1) Primary Key
	, EmpJobsrtBrief varchar(16)
	, EmpJobsrtTitle varchar(64)
	, EmpJobsrtDescription varchar(256)
	, EmpJobsrtDisplayOrder int
	, EmpJobsrtActive bit
	, EmpJobsrtModBy varchar(50)
	, EmpJobsrtModAt datetime
)
Go
----------------------------------------------------------
Insert Into EmpJobStartReasonTypes	(EmpJobsrtBrief, EmpJobsrtTitle, EmpJobsrtDescription, EmpJobsrtDisplayOrder, EmpJobsrtActive, EmpJobsrtModBy, EmpJobsrtModAt)
Values ('', 'None', 'None', 1, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobStartReasonTypes	(EmpJobsrtBrief, EmpJobsrtTitle, EmpJobsrtDescription, EmpJobsrtDisplayOrder, EmpJobsrtActive, EmpJobsrtModBy, EmpJobsrtModAt)
Values ('', 'Demotion', 'Demotion', 2, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobStartReasonTypes	(EmpJobsrtBrief, EmpJobsrtTitle, EmpJobsrtDescription, EmpJobsrtDisplayOrder, EmpJobsrtActive, EmpJobsrtModBy, EmpJobsrtModAt)
Values ('', 'Hourly Promotion', 'Hourly Promotion', 3, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobStartReasonTypes	(EmpJobsrtBrief, EmpJobsrtTitle, EmpJobsrtDescription, EmpJobsrtDisplayOrder, EmpJobsrtActive, EmpJobsrtModBy, EmpJobsrtModAt)
Values ('', 'Hrly Promotion/Trans', 'Hrly Promotion/Trans', 4, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobStartReasonTypes	(EmpJobsrtBrief, EmpJobsrtTitle, EmpJobsrtDescription, EmpJobsrtDisplayOrder, EmpJobsrtActive, EmpJobsrtModBy, EmpJobsrtModAt)
Values ('', 'Job Change', 'Job Change', 5, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobStartReasonTypes	(EmpJobsrtBrief, EmpJobsrtTitle, EmpJobsrtDescription, EmpJobsrtDisplayOrder, EmpJobsrtActive, EmpJobsrtModBy, EmpJobsrtModAt)
Values ('', 'New hire', 'New hire', 6, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobStartReasonTypes	(EmpJobsrtBrief, EmpJobsrtTitle, EmpJobsrtDescription, EmpJobsrtDisplayOrder, EmpJobsrtActive, EmpJobsrtModBy, EmpJobsrtModAt)
Values ('', 'Other', 'Other', 7, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobStartReasonTypes	(EmpJobsrtBrief, EmpJobsrtTitle, EmpJobsrtDescription, EmpJobsrtDisplayOrder, EmpJobsrtActive, EmpJobsrtModBy, EmpJobsrtModAt)
Values ('', 'Position Info Change', 'Position Info Change', 8, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobStartReasonTypes	(EmpJobsrtBrief, EmpJobsrtTitle, EmpJobsrtDescription, EmpJobsrtDisplayOrder, EmpJobsrtActive, EmpJobsrtModBy, EmpJobsrtModAt)
Values ('', 'Promotion', 'Promotion', 9, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobStartReasonTypes	(EmpJobsrtBrief, EmpJobsrtTitle, EmpJobsrtDescription, EmpJobsrtDisplayOrder, EmpJobsrtActive, EmpJobsrtModBy, EmpJobsrtModAt)
Values ('', 'Promotion/Transfer', 'Promotion/Transfer', 10, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobStartReasonTypes	(EmpJobsrtBrief, EmpJobsrtTitle, EmpJobsrtDescription, EmpJobsrtDisplayOrder, EmpJobsrtActive, EmpJobsrtModBy, EmpJobsrtModAt)
Values ('', 'Rehire', 'Rehire', 11, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobStartReasonTypes	(EmpJobsrtBrief, EmpJobsrtTitle, EmpJobsrtDescription, EmpJobsrtDisplayOrder, EmpJobsrtActive, EmpJobsrtModBy, EmpJobsrtModAt)
Values ('', 'Transfer', 'Transfer', 12, 1, 'persistech\data conversion', GetDate())
Go
-----------------------------------------------------
/*
EmpJobEndReasonTypes
End Reason	
(none)					(none)
Change in pay			Change in pay
Job Change				Job Change
Other					Other
Position Info Change	Position Info Change
Promotion				Promotion
Termination				Termination
Transfer				Transfer

*/

Create Table EmpJobEndReasonTypes
(
	EmpJobEndReasonType int identity(1,1) Primary Key
	, EmpJobertBrief varchar(16)
	, EmpJobertTitle varchar(64)
	, EmpJobertDescription varchar(256)
	, EmpJobertDisplayOrder int
	, EmpJobertActive bit
	, EmpJobertModBy varchar(50)
	, EmpJobertModAt datetime
)
GO
------------------------------------------------------------
Insert Into EmpJobEndReasonTypes	(EmpJobertBrief, EmpJobertTitle, EmpJobertDescription, EmpJobertDisplayOrder, EmpJobertActive, EmpJobertModBy, EmpJobertModAt)
Values ('', 'None', 'None', 1, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobEndReasonTypes	(EmpJobertBrief, EmpJobertTitle, EmpJobertDescription, EmpJobertDisplayOrder, EmpJobertActive, EmpJobertModBy, EmpJobertModAt)
Values ('', 'Change in pay', 'Change in pay', 2, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobEndReasonTypes	(EmpJobertBrief, EmpJobertTitle, EmpJobertDescription, EmpJobertDisplayOrder, EmpJobertActive, EmpJobertModBy, EmpJobertModAt)
Values ('', 'Job Change', 'Job Change', 3, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobEndReasonTypes	(EmpJobertBrief, EmpJobertTitle, EmpJobertDescription, EmpJobertDisplayOrder, EmpJobertActive, EmpJobertModBy, EmpJobertModAt)
Values ('', 'Other', 'Other', 4, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobEndReasonTypes	(EmpJobertBrief, EmpJobertTitle, EmpJobertDescription, EmpJobertDisplayOrder, EmpJobertActive, EmpJobertModBy, EmpJobertModAt)
Values ('', 'Position Info Change', 'Position Info Change', 5, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobEndReasonTypes	(EmpJobertBrief, EmpJobertTitle, EmpJobertDescription, EmpJobertDisplayOrder, EmpJobertActive, EmpJobertModBy, EmpJobertModAt)
Values ('', 'Promotion', 'Promotion', 6, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobEndReasonTypes	(EmpJobertBrief, EmpJobertTitle, EmpJobertDescription, EmpJobertDisplayOrder, EmpJobertActive, EmpJobertModBy, EmpJobertModAt)
Values ('', 'Termination', 'Termination', 7, 1, 'persistech\data conversion', GetDate())

Insert Into EmpJobEndReasonTypes	(EmpJobertBrief, EmpJobertTitle, EmpJobertDescription, EmpJobertDisplayOrder, EmpJobertActive, EmpJobertModBy, EmpJobertModAt)
Values ('', 'Transfer', 'Transfer', 8, 1, 'persistech\data conversion', GetDate())
Go
------------------------------------
Create Table EmpSeparationCodes
(
	EmpSeparationCode int identity(1,1) Primary Key
	, EmpSepcBrief varchar(16)
	, EmpSepcTitle varchar(64)
	, EmpSepcDescription varchar(256)
	, EmpSepcDisplayOrder int
	, EmpSepcActive bit
	, EmpSepcModBy varchar(50)
	, EmpSepcModAt datetime
)
Go

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('100', 'Abandoned job', 'Abandoned job', 1, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('300', 'Reason unknown', 'Reason unknown', 2, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('400', 'In lieu of discharge', 'In lieu of discharge', 3, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('800', 'Did not return from leave', 'Did not return from leave', 4, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('1000', 'Retirement', 'Retirement', 5, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('1400', 'Accept another job', 'Accept another job', 6, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('1410', 'Go into own business', 'Go into own business', 7, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('1420', 'Military', 'Military', 8, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('1500', 'Relocate', 'Relocate', 9, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('1600', 'Personal-not job related', 'Personal-not job related', 10, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('1610', 'Marriage', 'Marriage', 11, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('1620', 'Family obligations', 'Family obligations', 12, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('1700', 'Transportation', 'Transportation', 13, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('1900', 'Illness', 'Illness', 14, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('2000', 'Maternity', 'Maternity', 15, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('2110', 'Dissatisfaction-work hours', 'Dissatisfaction-work hours', 16, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('2120', 'Dissatisfaction-salary', 'Dissatisfaction-salary', 17, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('2130', 'Dissatisfaction-working conditions', 'Dissatisfaction-working conditions', 18, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('2140', 'Dissatisfaction-performance review', 'Dissatisfaction-performance review', 19, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('2170', 'Dissatisfaction-company policies', 'Dissatisfaction-company policies', 20, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('2190', 'Dissatisfaction-supervisor', 'Dissatisfaction-supervisor', 21, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('2200', 'Walked off job', 'Walked off job', 22, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('2500', 'School', 'School', 23, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('8500', 'Death', 'Death', 24, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('3100', 'Reported under influence alcohol', 'Reported under influence alcohol', 25, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('3700', 'Tardiness-frequent', 'Tardiness-frequent', 26, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('3900', 'Leaving work station', 'Leaving work station', 27, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('4000', 'Absenteeism-excessive absences', 'Absenteeism-excessive absences', 28, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('4100', 'Absenteeism-unreported', 'Absenteeism-unreported', 29, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('4300', 'Fighting on company property', 'Fighting on company property', 30, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('4400', 'Quantity of work', 'Quantity of work', 31, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('4600', 'Destruction of co. property', 'Destruction of co. property', 32, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('4800', 'Violation of co. rules/policies', 'Violation of co. rules/policies', 33, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('4860', 'Reported under influence drugs', 'Reported under influence drugs', 34, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('4900', 'Insubordination', 'Insubordination', 35, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('5110', 'Misconduct', 'Misconduct', 36, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('5120', 'Quality of work', 'Quality of work', 37, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('5400', 'Violation of safety rules', 'Violation of safety rules', 38, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('5500', 'Dishonesty-monetary theft', 'Dishonesty-monetary theft', 39, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('5800', 'Falsification of records', 'Falsification of records', 40, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('9700', 'Probationary-not qualified for job', 'Probationary-not qualified for job', 41, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('7600', 'Reduction in force', 'Reduction in force', 42, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('7610', 'End of temporary employment', 'End of temporary employment', 43, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('7620', 'Job eliminated', 'Job eliminated', 44, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('7640', 'Account closed', 'Account closed', 45, 1, 'persistech\data conversion', GetDate())

Insert Into EmpSeparationCodes	(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Values ('7660', 'Client requested removal', 'Client requested removal', 46, 1, 'persistech\data conversion', GetDate())


Go



---End Employee General Type
---------------Employee General Type Table - 06-18-2010-------Kaushal Kishor Pandey----------

----------------- " ------------------------06-24-2010 -------Kaushal Kishor Pandey ---------



Alter Table EmpSeparationCodes Add EmpTerminationReasonType int default(1)

update EmpSeparationCodes 
Set EmpTerminationReasonType = (Select EmpTerminationReasonType From EmpTerminationReasonTypes Where EmpTerrtTitle =  'Resignation')
Where EmpSeparationCode between 1 and 24

update EmpSeparationCodes 
Set EmpTerminationReasonType = (Select EmpTerminationReasonType From EmpTerminationReasonTypes Where EmpTerrtTitle =  'Terminated')
Where EmpSeparationCode between 25 and 41

update EmpSeparationCodes 
Set EmpTerminationReasonType = (Select EmpTerminationReasonType From EmpTerminationReasonTypes Where EmpTerrtTitle =  'Layoff')
Where EmpSeparationCode between 42 and 46

==========================

Create Table EmpMaritalStatusTypes
(
	EmpMaritalStatusType int identity(1,1) Primary Key
	, EmpMarstBrief varchar(16)
	, EmpMarstTitle varchar(64)
	, EmpMarstDescription varchar(256)
	, EmpMarstDisplayOrder int
	, EmpMarstActive bit
	, EmpMarstModBy varchar(50)
	, EmpMarstModAt datetime
)

Insert Into EmpMaritalStatusTypes	(EmpMarstBrief, EmpMarstTitle, EmpMarstDescription, EmpMarstDisplayOrder, EmpMarstActive, EmpMarstModBy, EmpMarstModAt)
Values ('Divorced', 'Divorced', 'Divorced', 1, 1, 'persistech\data conversion', GetDate())

Insert Into EmpMaritalStatusTypes	(EmpMarstBrief, EmpMarstTitle, EmpMarstDescription, EmpMarstDisplayOrder, EmpMarstActive, EmpMarstModBy, EmpMarstModAt)
Values ('Married', 'Married', 'Married', 2, 1, 'persistech\data conversion', GetDate())

Insert Into EmpMaritalStatusTypes	(EmpMarstBrief, EmpMarstTitle, EmpMarstDescription, EmpMarstDisplayOrder, EmpMarstActive, EmpMarstModBy, EmpMarstModAt)
Values ('Non-married', 'Non-married partner', 'Non-married partner', 3, 1, 'persistech\data conversion', GetDate())

Insert Into EmpMaritalStatusTypes	(EmpMarstBrief, EmpMarstTitle, EmpMarstDescription, EmpMarstDisplayOrder, EmpMarstActive, EmpMarstModBy, EmpMarstModAt)
Values ('Separated', 'Separated', 'Separated', 4, 1, 'persistech\data conversion', GetDate())

Insert Into EmpMaritalStatusTypes	(EmpMarstBrief, EmpMarstTitle, EmpMarstDescription, EmpMarstDisplayOrder, EmpMarstActive, EmpMarstModBy, EmpMarstModAt)
Values ('Single', 'Single', 'Single', 5, 1, 'persistech\data conversion', GetDate())

Insert Into EmpMaritalStatusTypes	(EmpMarstBrief, EmpMarstTitle, EmpMarstDescription, EmpMarstDisplayOrder, EmpMarstActive, EmpMarstModBy, EmpMarstModAt)
Values ('Unknown', 'Unknown', 'Unknown', 6, 1, 'persistech\data conversion', GetDate())

Insert Into EmpMaritalStatusTypes	(EmpMarstBrief, EmpMarstTitle, EmpMarstDescription, EmpMarstDisplayOrder, EmpMarstActive, EmpMarstModBy, EmpMarstModAt)
Values ('Widow/Widower', 'Widow/Widower', 'Widow/Widower', 7, 1, 'persistech\data conversion', GetDate())

Select * from EmpMaritalStatusTypes

-------------------

exec sp_rename 'EmpEmployeeGenerals.EmpTaxMaritalStatusType', 'EmpMaritalStatusFederalTaxType', 'column'

exec sp_rename 'EmpEmployeeGenerals.EmpPrimaryMaritalStatusType', 'EmpMaritalStatusStateTaxTypePrimary', 'column'

exec sp_rename 'EmpEmployeeGenerals.EmpSecondaryMaritalStatusType', 'EmpMaritalStatusStateTaxTypeSecondary', 'column'

update sp [EmpMaritalStatusByStateSelect]

------------------------
Alter Procedure [dbo].[EmpMaritalStatusByStateSelect]      
@AppState int = 1     
-- Exec EmpMaritalStatusByStateSelect 1    
As      
Select EMST.*--.EmpMaritalStatusType,EMST.EmpMaritalStatusType, EMST.EmpMarstTitle        
from EmpMaritalStatusStateTaxTypes EMST      
Inner Join EmpMaritalStatusStateTaxStates EMSS ON EMSS.EmpMaritalStatusStateTaxType = EMST.EmpMaritalStatusStateTaxType      
Where AppStateType  = @AppState      
Order By EMST.EmpMarssttDisplayOrder

-----------------------

Select top 10 * from EmpMaritalStatusFederalTaxTypes

Create Table EmpMaritalStatusFederalTaxTypes
(
	[EmpMaritalStatusFederalTaxType] [int] IDENTITY(1,1) Primary Key,
	[EmpMarsfttBrief] [varchar](16) NOT NULL,
	[EmpMarsfttTitle] [varchar](64) NOT NULL,
	[EmpMarsfttDescription] [varchar](256) NOT NULL,
	[EmpMarsfttDisplayOrder] [int] NOT NULL,
	[EmpMarsfttActive] [bit] NOT NULL,
	[EmpMarsfttModBy] [varchar](50) NOT NULL,
	[EmpMarsfttModAt] [datetime] NOT NULL
)

-- EmpMaritalStatusTypes
-- EmpMaritalStatusStateTaxTypes

Create Table EmpMaritalStatusStateTaxTypes
(
	[EmpMaritalStatusStateTaxType] [int] IDENTITY(1,1) Primary Key,
	[EmpMarssttBrief] [varchar](16) NOT NULL,
	[EmpMarssttTitle] [varchar](64) NOT NULL,
	[EmpMarssttDescription] [varchar](256) NOT NULL,
	[EmpMarssttDisplayOrder] [int] NOT NULL,
	[EmpMarssttActive] [bit] NOT NULL,
	[EmpMarssttModBy] [varchar](50) NOT NULL,
	[EmpMarssttModAt] [datetime] NOT NULL
)

-- EmpMaritalStatusStates
-- EmpMaritalStatusStateTaxStates

Create Table EmpMaritalStatusStateTaxStates
(
	[EmpMaritalStatusStateTaxState] [int] IDENTITY(1,1) NOT NULL,
	[EmpMaritalStatusStateTaxType] [int] NULL,
	[AppStateType] [int] NULL,
)

-------------------


Alter Table EmpEmployeeGenerals Add EmpMaritalStatusType int default(1)

Alter Table EmpEmployeeGenerals Drop Column EmpPositionType

-- Delete constraint Alter Table EmpEmployeeGenerals Drop DF__EmpEmploy__EmpEm__702996C1
Alter Table EmpEmployeeGenerals Drop Column EmpEmpgPositionHours 

Alter Table EmpEmployeeGenerals Drop Column EmpLaundryStatusType


----------------

Insert Into EmpJobCodeTypes
Select IsNull([value], ''), IsNull(Description, ''), IsNull(Description, ''), '1', '1', 'Persistech/Kishor Pandey', getdate() From ['Job Codes$']

Alter Table EmpEmployeeGenerals Add EmpJobStartReasonType int not null default(1)

Alter Table empEmployeeGenerals Add EmpEmpgEffectiveDateJob Datetime

Alter Table empEmployeeGenerals Add EmpEmpgEffectiveDateCompensation Datetime


----------------- Employee Generals----------------06-24-2010 -------Kaushal Kishor Pandey ---------