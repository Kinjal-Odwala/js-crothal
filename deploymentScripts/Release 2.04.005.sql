/*
Last production release version 2.04.004 dtd-7th Dec 2011
We are expecting to update version with every build to iiT, not sure how it will affect manual updates which we do to CT/Prod.
*/

-- Hierarchy Management Menu Insert [Begin]

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodModBy, HirNodModAt)
Values(1, 33, @HirNode, 'Hierarchy Mgmt', 'Hierarchy Management', 'Hierarchy Management', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Setup\HirManagement', 'crothall', 'chimes', 'fin', 'Setup', 'HirManagement', 'Compass-USA\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\HirManagement'

Insert Into ESMV2.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt, AppMenuDisplayType)
Values(2, 4, @HirNode, 'Hierarchy Mgmt', 'Hierarchy Management', 1, 812, 'hirm', '/fin/app/hierarchy/usr/markup.htm', 'Compass-USA\Data Conversion', GetDate(), 1)

Insert Into ESMV2.dbo.HirGroupNodes(HirNode, HirGroup, HirGronModBy, HirGronModAt) Values(@HirNode, 1, 'Compass-USA\Data Conversion', GetDate())

-- Hierarchy Management Menu Insert [End]

--Menu Fin>Reports>SSRS

	Exec AppMenuItemUpdate 
		'SSRS' --@MenuTitle Varchar(64)
		,2 --@MenuAction Int
		,4 --@MenuState Int 
		,'/fin/rpt/ssrsReport/usr/markup.htm' --@MenuFilePath varchar(500)
		,753 --@DisplayOrderMenu Int
		,'\crothall\chimes\fin\reports' --@HirNodeParentFullPath varchar(2000)
		,74 --@DisplayOrder Int
		
--Menu Fin>Reports>SSRS

--Menu Fin>CeridianReports>Labor Dashboard
	Exec AppMenuItemUpdate 
		'Labor Dashboard' --@MenuTitle Varchar(64)
		,2 --@MenuAction Int 1-mainmenu, 2-submenu
		,4 --@MenuState Int 3-selected, 4-enabled
		,'/fin/rpt/ceridianReport/usr/markup.htm?reportId=Labor Dashboard&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fTeamFin_Labor_Dashboard&rs:Command=Render'
		,353 --@DisplayOrderMenu Int
		,'\crothall\chimes\fin\ceridianreports' --@HirNodeParentFullPath varchar(2000)
		,17081 --@DisplayOrder Int
--Menu Fin>CeridianReports>Labor Dashboard


--- Adhoc multiple module associate update

USE [Teamfinv2]
GO

CREATE TABLE [dbo].[AppModuleAssociations](
	[AppModuleAssociation] [int] IDENTITY(1,1) NOT NULL Primary Key,
	[AppModule] [int] NOT NULL,
	[AppModuleAssociate] [int] NOT NULL,
	[AppModaActive] [bit] NOT NULL,
	[AppModaModBy] [varchar](50) NOT NULL,
	[AppModaModAt] [datetime] NOT NULL,
 ) 


--Select * from appmodules
-- Add Rows in [AppModules] 
Insert Into [AppModules] Values('HouseCode', 'HcmHouseCodes', 1, 1,'compass-usa\data conversion',getDate())
Insert Into [AppModules] Values('Employee', 'EmpEmployeeGenerals', 1, 1,'compass-usa\data conversion',getDate())
Insert Into [AppModules] Values('Invoice', 'RevInvoices', 1, 1,'compass-usa\data conversion',getDate())
Insert Into [AppModules] Values('Site', 'AppSites', 1, 1,'compass-usa\data conversion',getDate())
Insert Into [AppModules] Values('Person', 'PplPeople', 1, 1,'compass-usa\data conversion',getDate())
Insert Into [AppModules] Values('User', 'AppUsers', 1, 1,'compass-usa\data conversion',getDate())
Insert Into [AppModules] Values('HirNode', 'HirNodes', 1, 1,'compass-usa\data conversion',getDate())
Insert Into [AppModules] Values('Unit', 'AppUnits', 1, 1,'compass-usa\data conversion',getDate())

--Add Rows in [AppModuleAssociations]
--select * from [AppModuleAssociations]
Insert Into [AppModuleAssociations] Values (1, 2, 1, 'compass-usa\data conversion', getdate())
Insert Into [AppModuleAssociations] Values (1, 3, 1, 'compass-usa\data conversion', getdate())
Insert Into [AppModuleAssociations] Values (1, 4, 1, 'compass-usa\data conversion', getdate())
Insert Into [AppModuleAssociations] Values (1, 5, 1, 'compass-usa\data conversion', getdate())
Insert Into [AppModuleAssociations] Values (1, 6, 1, 'compass-usa\data conversion', getdate())
Insert Into [AppModuleAssociations] Values (1, 7, 1, 'compass-usa\data conversion', getdate())
Insert Into [AppModuleAssociations] Values (1, 8, 1, 'compass-usa\data conversion', getdate())


--Select * from [AppModuleColumns] where [AppModuleColumn] > 79
-- EmpEmployeeGeneral

INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmployeeGeneral','EmpEmployeeGeneral',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'PplPerson','PplPerson',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgBrief','Brief',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgSSN','SSN',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpStatusType','Status Type',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'PayPayrollCompany','Payroll Company',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpDeviceGroupType','EmpDeviceGroupType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgExempt','Exempt',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpJobCodeType','EmpJobCodeType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgHourly','Hourly',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgHireDate','Hire Date',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpRateChangeReasonType','EmpRateChangeReasonType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgRateChangeDate','Rate Change Date',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgSeniorityDate','Seniority Date',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgTerminationDate','Termination Date',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpTerminationReasonType','EmpTerminationReasonType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpWorkShift','Work Shift',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgBenefitsPercentage','Benefits Percentage',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgScheduledHours','Scheduled Hours',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgUnion','Union',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgCrothallEmployee','Crothall Employee',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgEmployeeNumber','EmployeeNumber',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgExportETax','ExportETax',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgExportEBase','ExportEBase',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgExportECard','ExportECard',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgExportEPerson','ExportEPerson',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgExportEJob','ExportEJob',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgExportEComp','ExportEComp',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgExportEPayroll','ExportEPayroll',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgExportEEmploy','ExportEEmploy',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgExportEUnion','ExportEUnion',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgCrtdBy','CrtdBy',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgCrtdAt','CrtdAt',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgModBy','ModBy',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgModAt','ModAt',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgVersion','Version',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgActive','Active',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'HcmHouseCode','HcmHouseCode',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgAlternatePayRateA','Alternate PayRateA',80,1,'persistech\data conversion',GetDate(),'decimal',1,'decimal',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgAlternatePayRateB','Alternate PayRateB',80,1,'persistech\data conversion',GetDate(),'decimal',1,'decimal',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgAlternatePayRateC','AlternatePayRateC',80,1,'persistech\data conversion',GetDate(),'decimal',1,'decimal',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgAlternatePayRateD',' Alternate PayRateD',80,1,'persistech\data conversion',GetDate(),'decimal',1,'decimal',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgPTOStartDate','PTOStartDate',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES 

(2,'EmpEmpgPTOAccruedHourEntryAutomatic','PTOAccruedHourEntryAutomatic',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgOriginalHireDate','Original HireDate',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgEffectiveDate','Effective Date',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpUnionType','EmpUnionType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpStatusCategoryType','EmpStatusCategoryType',80,1,'persistech\data conversion',GetDate(),'int',1,'int',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgPayRate','Pay Rate',80,1,'persistech\data conversion',GetDate(),'decimal',1,'decimal',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgPayRateEnteredBy','Pay Rate EnteredBy',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgPayRateEnteredAt','Pay Rate EnteredAt',80,1,'persistech\data conversion',GetDate(),'datetime',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgPrevPayRate','PrevPayRate',80,1,'persistech\data conversion',GetDate(),'decimal',1,'decimal',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgPrevPayRateEnteredBy','PrevPayRate EnteredBy',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgPrevPayRateEnteredAt','PrevPayRate EnteredAt',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgPrevPrevPayRate','PrevPrevPayRate',80,1,'persistech\data conversion',GetDate(),'decimal',1,'decimal',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgPrevPrevPayRateEnteredBy','PrevPrevPayRate EnteredBy',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgPrevPrevPayRateEnteredAt','PrevPrevPayRate EnteredAt',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpGenderType','EmpGenderType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEthnicityType','EmpEthnicityType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgBirthDate','Birth Date',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgReviewDate','Review Date',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgWorkPhone','Work Phone',80,1,'persistech\data conversion',GetDate(),'varchar',1,'phone',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgWorkPhoneExt','WorkPhoneExt',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgBackGroundCheckDate','BackGround Check Date',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgFederalExemptions','FederalExemptions',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpFederalAdjustmentType','EmpFederalAdjustmentType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES 

(2,'EmpMaritalStatusFederalTaxType','EmpMaritalStatusFederalTaxType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES 

(2,'EmpEmpgFederalAdjustmentAmount','FederalAdjustmentAmount',80,1,'persistech\data conversion',GetDate(),'decimal',1,'decimal',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgPrimaryState','Primary State',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgSecondaryState','Secondary State',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES 

(2,'EmpMaritalStatusStateTaxTypePrimary','EmpMaritalStatusStateTaxTypePrimary',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES 

(2,'EmpMaritalStatusStateTaxTypeSecondary','EmpMaritalStatusStateTaxTypeSecondary',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgStateExemptions','EmpEmpgStateExemptions',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpStateAdjustmentType','EmpStateAdjustmentType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES 

(2,'EmpEmpgStateAdjustmentAmount','EmpEmpgStateAdjustmentAmount',80,1,'persistech\data conversion',GetDate(),'decimal',1,'decimal',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpSDIAdjustmentType','EmpSDIAdjustmentType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgSDIRate','SDIRate',80,1,'persistech\data conversion',GetDate(),'decimal',1,'decimal',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES 

(2,'EmpLocalTaxAdjustmentType','EmpLocalTaxAdjustmentType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgLocalTaxAdjustmentAmount','LocalTax Adjustment 

Amount',80,1,'persistech\data conversion',GetDate(),'decimal',1,'decimal',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgLocalTaxCode1','EmpEmpgLocalTaxCode1',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgLocalTaxCode2','EmpEmpgLocalTaxCode2',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgLocalTaxCode3','EmpEmpgLocalTaxCode3',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgPayrollStatus','Payroll Status',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgPreviousPayrollStatus','Previous Payroll Status',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'AppTransactionStatusType','AppTransactionStatusType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'PayPayFrequencyType','PayPayFrequencyType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'HcmHouseCodeJob','HcmHouseCodeJob',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpI9Type','EmpI9Type',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpVetType','EmpVetType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpSeparationCode','EmpSeparationCode',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpJobStartReasonType','EmpJobStartReasonType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgEffectiveDateJob','Effective Date Job',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgEffectiveDateCompensation','Effective Date 

Compensation',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpMaritalStatusType','EmpMaritalStatusType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgCurrentStatusCode','Current Status Code',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'EmpEmpgChangeStatusCode','Change Status Code',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (2,'HirNode','HirNode',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO

-----------------------------------------
-- RevInvoices

INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvoice','RevInvoice',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'HcmHouseCode','HcmHouseCode',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvInvoiceNumber','Invoice Number',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvInvoiceDate','Invoice Date',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvDueDate','Due Date',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvServicePeriodStartDate','Service Period Start Date',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvServicePeriodEndDate','Service Period End Date',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvBillTo','BillTo',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvCompany','Company',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvAddress1','Address1',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvAddress2','Address2',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvCity','City',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'AppStateType','AppStateType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvPostalCode','Postal Code',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvPrinted','Printed',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvPrintedBy','PrintedBy',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvLastPrinted','Last Printed',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvCreditMemoLastPrinted','Credit Memo Last Printed',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvWeek','Week',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'FscPeriod','FscPeriod',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'FscYear','FscYear',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvPaidOff','PaidOff',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'AppTransactionStatusType','AppTransactionStatusType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvTaxExempt','Tax Exempt',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvTaxNumber','Tax Number',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvStateTax','State Tax',80,1,'persistech\data conversion',GetDate(),'decimal',1,'decimal',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevMunicipalityTax','Municipality Tax',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvOtherMunicipality','Other Municipality',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvLocalTax','Local Tax',80,1,'persistech\data conversion',GetDate(),'decimal',1,'decimal',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvActive','Active',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvVersion','Version',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvCrtdBy','CrtdBy',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvCrtdAt','CrtdAt',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvModBy','ModBy',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvModAt','ModAt',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvPONumber','RevInvPONumber',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'WomWorkOrder','WomWorkOrder',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvExported','Exported',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvExportedDate','ExportedDate',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'HcmJobBrief','HcmJobBrief',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'HirNode','HirNode',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvInvoiceByHouseCode','RevInvInvoiceByHouseCode',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (3,'RevInvNotes','Notes',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO


----------------------
---- AppSites- (AppModule for AppSites is 4)

INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppSite','AppSite',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppSitTitle','Title',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppSitAddressLine1','AddressLine1',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppSitAddressLine2','AddressLine2',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppSitCity','City',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppStateType','AppStateType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppSitPostalCode','PostalCode',80,1,'persistech\data conversion',GetDate(),'varchar',1,'zip',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppSitCounty','County',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppIndustryType','AppIndustryType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppPrimaryBusinessType','AppPrimaryBusinessType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppLocationType','AppLocationType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppTraumaLevelType','AppTraumaLevelType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppProfitDesignationType','AppProfitDesignationType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppGPOType','AppGPOType',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppSitSpecifyGPO','Specify GPO',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppOwnershipType','Ownership Type',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppSitActive','Active',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppSitCrtdBy','Created By',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppSitCrtdAt','Created At',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppSitModBy','ModBy',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppSitModAt','ModAt',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppSitVersion','Version',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (4,'AppSitGEOCode','GEOCode',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO

-- PplPeople - (AppModule for pplPeople is 5)

INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]  VALUES (5,'PplPerson','Person',80,1,'persistech\data conversion',GetDate(),'int',1,'int',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'PplPeoBrief','Brief',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'PplPeoFirstName','First Name',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'PplPeoLastName','Last Name',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'PplPeoMiddleName','Middle Name',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'PplPeoAddressLine1','AddressLine1',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'PplPeoAddressLine2','AddressLine2',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'PplPeoCity','City',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'AppStateType','AppStateType',80,1,'persistech\data conversion',GetDate(),'int',1,'int',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'PplPeoPostalCode','Postal Code',80,1,'persistech\data conversion',GetDate(),'varchar',1,'zip',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'PplPeoHomePhone','Home Phone',80,1,'persistech\data conversion',GetDate(),'varchar',1,'phone',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'PplPeoFax','Fax',80,1,'persistech\data conversion',GetDate(),'varchar',1,'phone',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'PplPeoCellPhone','Cell Phone',80,1,'persistech\data conversion',GetDate(),'varchar',1,'phone',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'PplPeoEmail','Email',80,1,'persistech\data conversion',GetDate(),'varchar',1,'email',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'PplPeoPager','Pager',80,1,'persistech\data conversion',GetDate(),'varchar',1,'phone',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'PplPeoActive','Person Active',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'PplPeoModBy','ModBy',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'PplPeoModAt','ModAt',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'HirNode','HirNode',80,1,'persistech\data conversion',GetDate(),'int',1,'int',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (5,'PplPeoEmployeeHouseCodeUpdated','Employee HouseCode Updated',80,1,'persistech\data conversion',GetDate(),'bit',1,null,1, 1)
GO
------------------------------
---- AppUsers - (AppModule for AppUsers is 6)

INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (6,'AppUser','AppUser',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (6,'PplPerson','PplPerson',80,1,'persistech\data conversion',GetDate(),'int',1,'int',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (6,'HirNodeTop','HirNodeTop',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (6,'HirNodeCurrent','HirNodeCurrent',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (6,'AppUseActive','Active',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (6,'AppUseUserName','UserName',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (6,'AppUsePassword','Password',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (6,'AppUseModBy','ModBy',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (6,'AppUseModAt','ModAt',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (6,'AppUseBrief','Brief',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (6,'AppRoleCurrent','AppRoleCurrent',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
------------------

--- HirNodes - (AppModule for HirNodes is 9)

INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNode','HirNode',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirHierarchy','PplPerson',80,1,'persistech\data conversion',GetDate(),'int',1,'int',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirLevel','HirLevel',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodeParent','HirNodeParent',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodBrief','Brief',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodTitle','Title',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodDescription','Description',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodDisplayOrder','DisplayOrder',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodActive','Active',80,1,'persistech\data conversion',GetDate(),'bit',1,'bit',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodFullPath','FullPath',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodLevel1','HirNodLevel1',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodLevel2','HirNodLevel2',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodLevel3','HirNodLevel3',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodLevel4','HirNodLevel4',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodLevel5','HirNodLevel5',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodLevel6','HirNodLevel6',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodLevel7','HirNodLevel7',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns] VALUES (7,'HirNodLevel8','HirNodLevel8',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodLevel9','HirNodLevel9',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodLevel10','HirNodLevel10',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodLevel11','HirNodLevel11',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodLevel12','HirNodLevel12',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodLevel13','HirNodLevel13',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodLevel14','HirNodLevel14',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodLevel15','HirNodLevel15',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodLevel16','HirNodLevel16',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodModBy','ModBy',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodModAt','ModAt',80,1,'persistech\data conversion',GetDate(),'datetime',1,'datetime',1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodSource','Source',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (7,'HirNodReference','Reference',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO

----------
--AppUnit (10-appModule)
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (8,'AppUnit','AppUnit',80,1,'persistech\data conversion',GetDate(),'int',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (8,'AppUniBrief','Unit Brief',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (8,'AppUniTitle','Unit Title',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)
GO
INSERT INTO [Teamfinv2].[dbo].[AppModuleColumns]
 VALUES (8,'AppUniDescription','Unit Description',80,1,'persistech\data conversion',GetDate(),'varchar',1,null,1, 1)


-----------------
-- DB Foreign Key 

-- Primary Key
-- ALTER TABLE HcmEPayGroupTypes ADD CONSTRAINT PK_HcmEPayGroupType PRIMARY KEY (HcmEPayGroupType)


--HcmServiceLine
update [HcmHouseCodes] Set [HcmServiceLine] = null where [HcmServiceLine] = 0
ALTER TABLE [dbo].[HcmHouseCodes]  WITH CHECK ADD  CONSTRAINT [FK_HcmServiceLine] FOREIGN KEY([HcmServiceLine])
REFERENCES [dbo].[HcmServiceLines] ([HcmServiceLine])

--FscJDECompany 

Update HcmHouseCodes Set FscJDECompany = null Where FscJDECompany = 0
ALTER TABLE [dbo].[HcmHouseCodes]  WITH CHECK ADD  CONSTRAINT [FK_FscJDECompany] FOREIGN KEY([FscJDECompany])
REFERENCES [dbo].[FscJDECompanies] ([FscJDECompany])

--HcmBillingCycleFrequencyType

Update HcmHouseCodes Set [HcmBillingCycleFrequencyType] = null Where [HcmBillingCycleFrequencyType] = 0
ALTER TABLE [dbo].[HcmHouseCodes]  WITH CHECK ADD  CONSTRAINT [FK_HcmBillingCycleFrequencyType] FOREIGN KEY([HcmBillingCycleFrequencyType])
REFERENCES [dbo].[HcmBillingCycleFrequencyTypes] ([HcmBillingCycleFrequencyType])

--[HcmContractType] 

Update HcmHouseCodes Set [HcmContractType] = null Where [HcmContractType] = 0
ALTER TABLE [dbo].[HcmHouseCodes]  WITH CHECK ADD  CONSTRAINT [FK_HcmContractType] FOREIGN KEY([HcmContractType])
REFERENCES [dbo].[HcmContractTypes] ([HcmContractType])

--[HcmEPayGroupType] 

Update HcmHouseCodes Set [HcmEPayGroupType] = null Where [HcmEPayGroupType] = 0 
ALTER TABLE [dbo].[HcmHouseCodes]  WITH CHECK ADD  CONSTRAINT [FK_HcmEPayGroupType] FOREIGN KEY([HcmEPayGroupType])
REFERENCES [dbo].[HcmEPayGroupTypes] ([HcmEPayGroupType])

--([HcmHouseCodeType])

Update HcmHouseCodes Set [HcmHouseCodeType] = null Where [HcmHouseCodeType] = 0 
ALTER TABLE [dbo].[HcmHouseCodes]  WITH CHECK ADD  CONSTRAINT [FK_HcmHouseCodeType] FOREIGN KEY([HcmHouseCodeType])
REFERENCES [dbo].[HcmHouseCodeTypes] ([HcmHouseCodeType])

--[HcmInvoiceLogoType] 

Update HcmHouseCodes Set [HcmInvoiceLogoType] = null Where [HcmInvoiceLogoType] = 0 
ALTER TABLE [dbo].[HcmHouseCodes]  WITH CHECK ADD  CONSTRAINT [FK_HcmInvoiceLogoType] FOREIGN KEY([HcmInvoiceLogoType])
REFERENCES [dbo].[HcmInvoiceLogoTypes] ([HcmInvoiceLogoType])

--[HcmPayrollProcessingLocationType] 

Update HcmHouseCodes Set [HcmPayrollProcessingLocationType] = null Where [HcmPayrollProcessingLocationType] = 0 
ALTER TABLE [dbo].[HcmHouseCodes]  WITH CHECK ADD  CONSTRAINT [FK_HcmPayrollProcessingLocationType] FOREIGN KEY([HcmPayrollProcessingLocationType])
REFERENCES [dbo].[HcmPayrollProcessingLocationTypes] ([HcmPayrollProcessingLocationType])

--[HcmRemitToLocation] 

Update HcmHouseCodes Set [HcmRemitToLocation] = null Where [HcmRemitToLocation] = 0 
ALTER TABLE [dbo].[HcmHouseCodes]  WITH CHECK ADD  CONSTRAINT [FK_HcmRemitToLocation] FOREIGN KEY([HcmRemitToLocation])
REFERENCES [dbo].[HcmRemitToLocations] ([HcmRemitToLocation])

--[HcmServiceLine] 

Update HcmHouseCodes Set [HcmServiceLine] = null Where [HcmServiceLine] = 0 
ALTER TABLE [dbo].[HcmHouseCodes]  WITH CHECK ADD  CONSTRAINT [FK_HcmServiceLine] FOREIGN KEY([HcmServiceLine])
REFERENCES [dbo].[HcmServiceLines] ([HcmServiceLine])

--[HcmServiceType] 

update [HcmHouseCodes] Set [HcmServiceType] = null where [HcmServiceType] = 0
ALTER TABLE [dbo].[HcmHouseCodes]  WITH CHECK ADD  CONSTRAINT [FK_HcmServiceType] FOREIGN KEY([HcmServiceType])
REFERENCES [dbo].[HcmServiceTypes] ([HcmServiceType])

--[HcmTermsOfContractType] 

update [HcmHouseCodes] Set [HcmTermsOfContractType] = null Where [HcmTermsOfContractType] = 0
ALTER TABLE [HcmHouseCodes] Add constraint FK_HcmTermsOfContractType FOREIGN KEY([HcmTermsOfContractType])
REFERENCES [HcmTermsOfContractTypes] ([HcmTermsOfContractType])

--- EmpStatusType
Alter Table dbo.EmpEmployeeGenerals With Check Add Constraint FK_EmpStatusType Foreign Key (EmpStatusType)
References dbo.EmpStatusTypes (EmpStatusType)



----------------by Anis

Alter table AppSites Alter column AppStateType Int Null
Update AppSites Set AppStateType = null Where AppStateType = 0
ALTER TABLE [dbo].[AppSites]  WITH CHECK ADD  CONSTRAINT [FK_AppSiteAppStateType] FOREIGN KEY([AppStateType])
REFERENCES [dbo].[AppStateTypes] ([AppStateType])

Alter table AppSites Alter column AppIndustryType Int Null
Update AppSites Set AppIndustryType = null Where AppIndustryType = 0
ALTER TABLE [dbo].[AppSites]  WITH CHECK ADD  CONSTRAINT [FK_AppIndustryType] FOREIGN KEY(AppIndustryType)
REFERENCES [dbo].AppIndustryTypes (AppIndustryType)

Alter table AppSites Alter column AppProfitDesignationType Int Null
Update AppSites Set AppProfitDesignationType = null Where AppProfitDesignationType = 0
ALTER TABLE [dbo].[AppSites]  WITH CHECK ADD  CONSTRAINT [FK_AppProfitDesignationType] FOREIGN KEY(AppProfitDesignationType)
REFERENCES [dbo].AppProfitDesignationTypes (AppProfitDesignationType)

Alter table AppSites Alter column AppLocationType Int Null
Update AppSites Set AppLocationType = null Where AppLocationType = 0
ALTER TABLE [dbo].[AppSites]  WITH CHECK ADD  CONSTRAINT [FK_AppLocationType] FOREIGN KEY(AppLocationType)
REFERENCES [dbo].AppLocationTypes (AppLocationType)

Alter table AppSites Alter column AppOwnershipType Int Null
Update AppSites Set AppOwnershipType = null Where AppOwnershipType = 0
ALTER TABLE [dbo].[AppSites]  WITH CHECK ADD  CONSTRAINT [FK_AppOwnershipType] FOREIGN KEY(AppOwnershipType)
REFERENCES [dbo].AppOwnershipTypes (AppOwnershipType)

Alter table AppSites Alter column AppPrimaryBusinessType Int Null
Update AppSites Set AppPrimaryBusinessType = null Where AppPrimaryBusinessType = 0
ALTER TABLE [dbo].[AppSites]  WITH CHECK ADD  CONSTRAINT [FK_AppPrimaryBusinessType] FOREIGN KEY(AppPrimaryBusinessType)
REFERENCES [dbo].AppPrimaryBusinessTypes (AppPrimaryBusinessType)

Alter table AppSites Alter column AppTraumaLevelType Int Null
Update AppSites Set AppTraumaLevelType = null Where AppTraumaLevelType = 0
ALTER TABLE [dbo].[AppSites]  WITH CHECK ADD  CONSTRAINT [FK_AppTraumaLevelType] FOREIGN KEY(AppTraumaLevelType)
REFERENCES [dbo].AppTraumaLevelTypes (AppTraumaLevelType)

Alter table AppSites Alter column AppGPOType Int Null
Update AppSites Set AppGPOType = null Where AppGPOType = 0
ALTER TABLE [dbo].[AppSites]  WITH CHECK ADD  CONSTRAINT [FK_AppGPOType] FOREIGN KEY(AppGPOType)
REFERENCES [dbo].AppGPOTypes (AppGPOType)

--CT deployed on 02/09/2012

-- Add new system variable
Add new system variable "NewBatchNumber" with the value maximum Batch id
Select Max(IsNull(AppgiBatch, 0)) From dbo.AppGenericImports

--Menu Fin > Inventory>Administration .. Report

		Exec AppMenuItemUpdate 
			'Inventory Mid Year And Year End' --@MenuTitle Varchar(64)
			,2 --@MenuAction Int 1-DSubItems(main menu), 2-ContentLoad(Actual UI invoker)
			,5 --@MenuState Int 1-None, 2-Invisible, 3-Selected, 4-Enabled, 5-Disabled
			,422 --@DisplayOrderMenu Int
			,'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Inventory%2fTeamFinv2_Mid_and_Year_End&rs:Command=Render' --@MenuFilePath varchar(500)
			,16026 --@HirNodeParent (Default 0) - Use this when query fetches duplicate parent menus.

--Menu Fin > Budgeting > Annualized 2012

		Exec AppMenuItemUpdate 
			'Annualized 2012' --@MenuTitle Varchar(64)
			,2 --@MenuAction Int 1-DSubItems(main menu), 2-ContentLoad(Actual UI invoker)
			,4 --@MenuState Int 1-None, 2-Invisible, 3-Selected, 4-Enabled, 5-Disabled
			,105 --@DisplayOrderMenu Int
			,'/fin/bud/annualizedbudgetmaster/usr/markup2012.htm'
			,41 --@HirNodeParent (Default 0) - Use this when query fetches duplicate parent menus.


Update m_env_environments set m_env_env_logout_url = 'https://finct.crothall.com/app/usr/closeBrowser.htm'
where m_env_environment = 3

Update m_env_environments set m_env_env_logout_url = 'https://teamfin.crothall.com/app/usr/closeBrowser.htm'
where m_env_environment = 4

--CT deployed on 02/23/2012


--Menu Fin > Budgeting > Import

		Exec AppMenuItemUpdate 
			'Import' --@MenuTitle Varchar(64)
			,2 --@MenuAction Int 1-DSubItems(main menu), 2-ContentLoad(Actual UI invoker)
			,4 --@MenuState Int 1-None, 2-Invisible, 3-Selected, 4-Enabled, 5-Disabled
			,106 --@DisplayOrderMenu Int
			,'/fin/bud/importbudget/usr/markup.htm'
			,41 --@HirNodeParent (Default 0) - Use this when query fetches duplicate parent menus.


--CT deployed on 03/02/2012


--Move 'ApproveBudget' security node from Administartion to Annualized Budget.
 EXEC Esmv2.dbo.[HirNodeUpdate] 
            17029--hirNode
            , 1 -- hirHierarchy
            , 42 -- hirNodeParent
            , 9 -- hirLevel
            , 'ApproveBudget' -- Title
            , 'approveBudget' --Brief
            , 'approveBudget' -- Description
            , 17029 -- DisplayOrder
            , 1 -- Active
            , 'compass-usa\data conversion' -- modBy

Go            

Update M_ENV_ENVIRONMENTS
      Set M_ENV_ENV_Application_Version = '2.04.005',
            M_ENV_ENV_Database_Version = '2.04.005'
Where M_ENV_ENVIRONMENT < 4

Go

--New menu under Housecode.. mostly for next release.

		Exec AppMenuItemUpdate 
			'Housecode Wizard' --@MenuTitle Varchar(64)
			,2 --@MenuAction Int 1-DSubItems(main menu), 2-ContentLoad(Actual UI invoker)
			,4 --@MenuState Int 1-None, 2-Invisible, 3-Selected, 4-Enabled, 5-Disabled
			,706 --@DisplayOrderMenu Int
			,'/fin/hcm/houseCodeWizard/usr/markup.htm'
			,65 --@HirNodeParent (Default 0) - Use this when query fetches duplicate parent menus.

Go

Check CT configuration for ..
net/crothall/chimes/fin/adh/act/web.config
net/crothall/chimes/fin/bud/act/web.config

///
Manual changes for Budgeting Module, SP from Matt..
	Dll and all.js
	Repelated SP's - will go over from CT to PROD during Deployment.
