--Select * From EsmV2.dbo.HirNodes Where HirNode = 17467 --Or HirNodeParent = 17467
--Select * From EsmV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard'
--Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard%' order by HirNode
-- Note: Double confirm hirNode and hirNodeParent value when executing the following SP on production.
EXEC Esmv2.dbo.[HirNodeUpdate] 
	17468 -- hirNode
	, 1 -- hirHierarchy
	, 65 -- hirNodeParent
	, 33 -- hirLevel
	, 'HouseCodeWizard' -- Title
	, 'HouseCodeWizard' --Brief
	, 'HouseCodeWizard' -- Description
	, 17467 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy

Use Esmv2
Go
Drop table HirNodeSecuritySetupSources

Create table HirNodeSecuritySetupSources
(
      HirNodeSecuritySetupSource Int Not Null 
            Constraint Id_HirNodeSecuritySetupSource Identity(-1,-1),
      HirNodsssBrief Varchar(16) Not Null,
      HirNodsssTitle Varchar(64) Not Null,
      HirNodsssDescription Varchar(256) Not Null,
      HirHierarchy Int Not Null,
      HirLevel Int Not Null,
      HirNodeParentFullPath Varchar(250),
      HirNodsssDisplayOrder Int Not Null
      Constraint Pk_HirNodeSecuritySetupSource Primary Key (HirNodeSecuritySetupSource)
)

Truncate table HirNodeSecuritySetupSources 

Declare @HirNodeIdentity Int
Select @HirNodeIdentity = Max(HirNode) From Esmv2.dbo.HirNodes
Set @HirNodeIdentity = @HirNodeIdentity + 1
Print @HirNodeIdentity

--HouseCodeSetup\houseCodeWizard

Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard', @HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard', (-@@Identity)+@HirNodeIdentity)
-------------------------
--tabHouseCode
Insert Into HirNodeSecuritySetupSources
values('tabHouseCode', 'TabHouseCode', 'tabHouseCode', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode', (-@@Identity)+@HirNodeIdentity)

--sectionHouseCode
Insert Into HirNodeSecuritySetupSources
values('sectionHouseCode', 'SectionHouseCode', 'sectionHouseCode', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionHouseCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionHouseCode', (-@@Identity)+@HirNodeIdentity)

--jdeCompany
Insert Into HirNodeSecuritySetupSources
values('jdeCompany', 'JDECompany', 'jdeCompany', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionHouseCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionHouseCode\jdeCompany', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionHouseCode\jdeCompany', (-@@Identity)+@HirNodeIdentity)

--site
Insert Into HirNodeSecuritySetupSources
values('site', 'Site', 'site', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionHouseCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionHouseCode\site', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionHouseCode\site', (-@@Identity)+@HirNodeIdentity)

--houseCode
Insert Into HirNodeSecuritySetupSources
values('houseCode', 'HouseCode', 'houseCode', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionHouseCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionHouseCode\houseCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionHouseCode\houseCode', (-@@Identity)+@HirNodeIdentity)

--startDate
Insert Into HirNodeSecuritySetupSources
values('startDate', 'StartDate', 'startDate', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionHouseCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionHouseCode\startDate', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionHouseCode\startDate', (-@@Identity)+@HirNodeIdentity)

--sectionServices
Insert Into HirNodeSecuritySetupSources
values('sectionServices', 'SectionServices', 'sectionServices', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionServices', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionServices', (-@@Identity)+@HirNodeIdentity)

--primaryService
Insert Into HirNodeSecuritySetupSources
values('primaryService', 'PrimaryService', 'primaryService', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionServices', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionServices\primaryService', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionServices\primaryService', (-@@Identity)+@HirNodeIdentity)

--additionalServices
Insert Into HirNodeSecuritySetupSources
values('additionalSrv', 'AdditionalServices', 'additionalServices', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionServices', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionServices\additionalServices', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionServices\additionalServices', (-@@Identity)+@HirNodeIdentity)

--enforceLaborControl
Insert Into HirNodeSecuritySetupSources
values('enforceLbrCtr', 'EnforceLaborControl', 'enforceLaborControl', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionServices', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionServices\enforceLaborControl', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionServices\enforceLaborControl', (-@@Identity)+@HirNodeIdentity)

--serviceLine
Insert Into HirNodeSecuritySetupSources
values('serviceLine', 'ServiceLine', 'serviceLine', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionServices', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionServices\serviceLine', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionServices\serviceLine', (-@@Identity)+@HirNodeIdentity)

--sectionManager
Insert Into HirNodeSecuritySetupSources
values('sectionManager', 'SectionManager', 'sectionManager', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)

--managerName
Insert Into HirNodeSecuritySetupSources
values('managerName', 'ManagerName', 'managerName', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager\managerName', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager\managerName', (-@@Identity)+@HirNodeIdentity)

--phone
Insert Into HirNodeSecuritySetupSources
values('phone', 'Phone', 'phone', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager\phone', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager\phone', (-@@Identity)+@HirNodeIdentity)

--fax
Insert Into HirNodeSecuritySetupSources
values('fax', 'Fax', 'fax', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager\fax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager\fax', (-@@Identity)+@HirNodeIdentity)

--cellPhone
Insert Into HirNodeSecuritySetupSources
values('cellPhone', 'CellPhone', 'cellPhone', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager\cellPhone', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager\cellPhone', (-@@Identity)+@HirNodeIdentity)

--pager 
Insert Into HirNodeSecuritySetupSources
values('pager', 'Pager', 'pager', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager\pager', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager\pager', (-@@Identity)+@HirNodeIdentity)

--assistantName
Insert Into HirNodeSecuritySetupSources
values('assistantName', 'AssistantName', 'assistantName', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager\assistantName', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager\assistantName', (-@@Identity)+@HirNodeIdentity)

--assistantPhone
Insert Into HirNodeSecuritySetupSources
values('assistantPhone', 'AssistantPhone', 'assistantPhone', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager\assistantPhone', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionManager\assistantPhone', (-@@Identity)+@HirNodeIdentity)

--sectionClient 
Insert Into HirNodeSecuritySetupSources
values('sectionClient', 'SectionClient', 'sectionClient', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)

--firstName 
Insert Into HirNodeSecuritySetupSources
values('firstName', 'FirstName', 'firstName', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient\firstName', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient\firstName', (-@@Identity)+@HirNodeIdentity)

--lastName 
Insert Into HirNodeSecuritySetupSources
values('lastName', 'LastName', 'lastName', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient\lastName', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient\lastName', (-@@Identity)+@HirNodeIdentity)

--title 
Insert Into HirNodeSecuritySetupSources
values('title', 'Title', 'title', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient\title', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient\title', (-@@Identity)+@HirNodeIdentity)

--phone 
Insert Into HirNodeSecuritySetupSources
values('phone', 'Phone', 'phone', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient\phone', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient\phone', (-@@Identity)+@HirNodeIdentity)

--fax 
Insert Into HirNodeSecuritySetupSources
values('fax', 'Fax', 'fax', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient\fax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient\fax', (-@@Identity)+@HirNodeIdentity)

--assistantName 
Insert Into HirNodeSecuritySetupSources
values('assistantName', 'AssistantName', 'assistantName', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient\assistantName', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient\assistantName', (-@@Identity)+@HirNodeIdentity)

--assistantPhone 
Insert Into HirNodeSecuritySetupSources
values('assistantPhone', 'AssistantPhone', 'assistantPhone', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient\assistantPhone', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabHouseCode\sectionClient\assistantPhone', (-@@Identity)+@HirNodeIdentity)

--------------------------------
--tabStatistics
Insert Into HirNodeSecuritySetupSources
values('tabStatistics', 'TabStatistics', 'tabStatistics', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics', (-@@Identity)+@HirNodeIdentity)

--managedEmployees
Insert Into HirNodeSecuritySetupSources
values('managedEmployee', 'ManagedEmployees', 'managedEmployees', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\managedEmployees', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\managedEmployees', (-@@Identity)+@HirNodeIdentity)

--crothallEmployees
Insert Into HirNodeSecuritySetupSources
values('crothallEmployee', 'CrothallEmployees', 'crothallEmployees', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\crothallEmployees', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\crothallEmployees', (-@@Identity)+@HirNodeIdentity)

--bedsLicensed
Insert Into HirNodeSecuritySetupSources
values('bedsLicensed', 'BedsLicensed', 'bedsLicensed', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\bedsLicensed', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\bedsLicensed', (-@@Identity)+@HirNodeIdentity)

--bedsActive
Insert Into HirNodeSecuritySetupSources
values('bedsActive', 'BedsActive', 'bedsActive', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\bedsActive', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\bedsActive', (-@@Identity)+@HirNodeIdentity)

--patientDays
Insert Into HirNodeSecuritySetupSources
values('patientDays', 'PatientDays', 'patientDays', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\patientDays', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\patientDays', (-@@Identity)+@HirNodeIdentity)

--adjustedPatientDays
Insert Into HirNodeSecuritySetupSources
values('adjPatientDays', 'AdjustedPatientDays', 'adjustedPatientDays', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\adjustedPatientDays', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\adjustedPatientDays', (-@@Identity)+@HirNodeIdentity)

--dailyCensus
Insert Into HirNodeSecuritySetupSources
values('dailyCensus', 'DailyCensus', 'dailyCensus', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\dailyCensus', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\dailyCensus', (-@@Identity)+@HirNodeIdentity)

--annualDischarges
Insert Into HirNodeSecuritySetupSources
values('annualDischarges', 'AnnualDischarges', 'annualDischarges', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\annualDischarges', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\annualDischarges', (-@@Identity)+@HirNodeIdentity)

--annualTransfers
Insert Into HirNodeSecuritySetupSources
values('annualTransfers', 'AnnualTransfers', 'annualTransfers', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\annualTransfers', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\annualTransfers', (-@@Identity)+@HirNodeIdentity)

--bedTurnaroundTime
Insert Into HirNodeSecuritySetupSources
values('bedTurnaroundTim', 'BedTurnaroundTime', 'bedTurnaroundTime', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\bedTurnaroundTime', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\bedTurnaroundTime', (-@@Identity)+@HirNodeIdentity)

--cleanableSquareFeet
Insert Into HirNodeSecuritySetupSources
values('cleanSquareFeet', 'CleanableSquareFeet', 'cleanableSquareFeet', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\cleanableSquareFeet', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\cleanableSquareFeet', (-@@Identity)+@HirNodeIdentity)

--annualTransports
Insert Into HirNodeSecuritySetupSources
values('annualTransports', 'AnnualTransports', 'annualTransports', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\annualTransports', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\annualTransports', (-@@Identity)+@HirNodeIdentity)

--lundry 
Insert Into HirNodeSecuritySetupSources
values('lundry', 'Lundry', 'lundry', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\lundry', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabStatistics\lundry', (-@@Identity)+@HirNodeIdentity)

---------------------------------
--tabFinancial
Insert Into HirNodeSecuritySetupSources
values('tabFinancial', 'TabFinancial', 'tabFinancial', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial', (-@@Identity)+@HirNodeIdentity)

--sectionShipping
Insert Into HirNodeSecuritySetupSources
values('sectionShipping', 'SectionShipping', 'sectionShipping', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping', (-@@Identity)+@HirNodeIdentity)

--company
Insert Into HirNodeSecuritySetupSources
values('company', 'Company', 'company', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping\company', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping\company', (-@@Identity)+@HirNodeIdentity)

--address1
Insert Into HirNodeSecuritySetupSources
values('address1', 'Address1', 'address1', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping\address1', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping\address1', (-@@Identity)+@HirNodeIdentity)

--address2
Insert Into HirNodeSecuritySetupSources
values('address2', 'Address2', 'address2', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping\address2', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping\address2', (-@@Identity)+@HirNodeIdentity)

--city
Insert Into HirNodeSecuritySetupSources
values('city', 'City', 'city', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping\city', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping\city', (-@@Identity)+@HirNodeIdentity)

--state
Insert Into HirNodeSecuritySetupSources
values('state', 'State', 'state', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping\state', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping\state', (-@@Identity)+@HirNodeIdentity)

--postalCode
Insert Into HirNodeSecuritySetupSources
values('postalCode', 'PostalCode', 'postalCode', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping\postalCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionShipping\postalCode', (-@@Identity)+@HirNodeIdentity)

--sectionInvoices
Insert Into HirNodeSecuritySetupSources
values('sectionInvoices', 'SectionInvoices', 'sectionInvoices', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)

--remitTo
Insert Into HirNodeSecuritySetupSources
values('remitTo', 'RemitTo', 'remitTo', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices\remitTo', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices\remitTo', (-@@Identity)+@HirNodeIdentity)

--title
Insert Into HirNodeSecuritySetupSources
values('title', 'Title', 'title', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices\title', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices\title', (-@@Identity)+@HirNodeIdentity)

--address1
Insert Into HirNodeSecuritySetupSources
values('address1', 'Address1', 'address1', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices\address1', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices\address1', (-@@Identity)+@HirNodeIdentity)

--address2
Insert Into HirNodeSecuritySetupSources
values('address2', 'Address2', 'address2', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices\address2', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices\address2', (-@@Identity)+@HirNodeIdentity)

--city
Insert Into HirNodeSecuritySetupSources
values('city', 'City', 'city', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices\city', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices\city', (-@@Identity)+@HirNodeIdentity)

--state
Insert Into HirNodeSecuritySetupSources
values('state', 'State', 'state', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices\state', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices\state', (-@@Identity)+@HirNodeIdentity)

--postalCode
Insert Into HirNodeSecuritySetupSources
values('postalCode', 'PostalCode', 'postalCode', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices\postalCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionInvoices\postalCode', (-@@Identity)+@HirNodeIdentity)

--sectionFinancial 
Insert Into HirNodeSecuritySetupSources
values('sectionFinancial', 'SectionFinancial', 'sectionFinancial', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)

--contractType 
Insert Into HirNodeSecuritySetupSources
values('contractType', 'ContractType', 'contractType', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\contractType', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\contractType', (-@@Identity)+@HirNodeIdentity)

--termsOfContract 
Insert Into HirNodeSecuritySetupSources
values('termsOfContract', 'TermsOfContract', 'termsOfContract', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\termsOfContract', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\termsOfContract', (-@@Identity)+@HirNodeIdentity)

--billingCycleFrequency 
Insert Into HirNodeSecuritySetupSources
values('billingCycleFrq', 'BillingCycleFrequency', 'billingCycleFrequency', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\billingCycleFrequency', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\billingCycleFrequency', (-@@Identity)+@HirNodeIdentity)

--percentTax 
Insert Into HirNodeSecuritySetupSources
values('percentTax', 'PercentTax', 'percentTax', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\percentTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\percentTax', (-@@Identity)+@HirNodeIdentity)

--localTaxPercent 
Insert Into HirNodeSecuritySetupSources
values('localTaxPercent', 'LocalTaxPercent', 'localTaxPercent', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\localTaxPercent', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\localTaxPercent', (-@@Identity)+@HirNodeIdentity)

--bankCode 
Insert Into HirNodeSecuritySetupSources
values('bankCode', 'BankCode', 'bankCode', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\bankCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\bankCode', (-@@Identity)+@HirNodeIdentity)

--bankAccount 
Insert Into HirNodeSecuritySetupSources
values('bankAccount', 'BankAccount', 'bankAccount', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\bankAccount', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\bankAccount', (-@@Identity)+@HirNodeIdentity)

--bankName 
Insert Into HirNodeSecuritySetupSources
values('bankName', 'BankName', 'bankName', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\bankName', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\bankName', (-@@Identity)+@HirNodeIdentity)

--contact 
Insert Into HirNodeSecuritySetupSources
values('contact', 'Contact', 'contact', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\contact', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\contact', (-@@Identity)+@HirNodeIdentity)

--address1 
Insert Into HirNodeSecuritySetupSources
values('address1', 'Address1', 'address1', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\address1', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\address1', (-@@Identity)+@HirNodeIdentity)

--address2 
Insert Into HirNodeSecuritySetupSources
values('address2', 'Address2', 'address2', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\address2', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\address2', (-@@Identity)+@HirNodeIdentity)

--city 
Insert Into HirNodeSecuritySetupSources
values('city', 'City', 'city', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\city', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\city', (-@@Identity)+@HirNodeIdentity)

--state 
Insert Into HirNodeSecuritySetupSources
values('state', 'State', 'state', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\state', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\state', (-@@Identity)+@HirNodeIdentity)

--postalCode 
Insert Into HirNodeSecuritySetupSources
values('postalCode', 'PostalCode', 'postalCode', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\postalCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\postalCode', (-@@Identity)+@HirNodeIdentity)

--phone 
Insert Into HirNodeSecuritySetupSources
values('phone', 'Phone', 'phone', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\phone', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\phone', (-@@Identity)+@HirNodeIdentity)

--fax 
Insert Into HirNodeSecuritySetupSources
values('fax', 'Fax', 'fax', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\fax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\fax', (-@@Identity)+@HirNodeIdentity)

--email 
Insert Into HirNodeSecuritySetupSources
values('email', 'Email', 'email', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\email', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\email', (-@@Identity)+@HirNodeIdentity)

--invoiceLogo 
Insert Into HirNodeSecuritySetupSources
values('invoiceLogo', 'InvoiceLogo', 'invoiceLogo', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\invoiceLogo', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\invoiceLogo', (-@@Identity)+@HirNodeIdentity)

-----------------------------------
--tabPayroll
Insert Into HirNodeSecuritySetupSources
values('tabPayroll', 'TabPayroll', 'tabPayroll', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll', (-@@Identity)+@HirNodeIdentity)

--payrollProcessingLocation
Insert Into HirNodeSecuritySetupSources
values('payrollProcLoc', 'PayrollProcessingLocation', 'payrollProcessingLocation', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\payrollProcessingLocation', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\payrollProcessingLocation', (-@@Identity)+@HirNodeIdentity)

--timeAndAttendance
Insert Into HirNodeSecuritySetupSources
values('timeAndAttendanc', 'TimeAndAttendance', 'timeAndAttendance', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\timeAndAttendance', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\timeAndAttendance', (-@@Identity)+@HirNodeIdentity)

--defaultLunchBreak
Insert Into HirNodeSecuritySetupSources
values('dftLunchBreak', 'DefaultLunchBreak', 'defaultLunchBreak', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\defaultLunchBreak', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\defaultLunchBreak', (-@@Identity)+@HirNodeIdentity)

--lunchBreakTrigger
Insert Into HirNodeSecuritySetupSources
values('lunchBreakTrg', 'LunchBreakTrigger', 'lunchBreakTrigger', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\lunchBreakTrigger', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\lunchBreakTrigger', (-@@Identity)+@HirNodeIdentity)

--houseCodeType
Insert Into HirNodeSecuritySetupSources
values('houseCodeType', 'HouseCodeType', 'houseCodeType', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\houseCodeType', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\houseCodeType', (-@@Identity)+@HirNodeIdentity)

--roundingTimePeriod
Insert Into HirNodeSecuritySetupSources
values('roundingTimePrd', 'RoundingTimePeriod', 'roundingTimePeriod', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\roundingTimePeriod', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\roundingTimePeriod', (-@@Identity)+@HirNodeIdentity)

--ePaySite 
Insert Into HirNodeSecuritySetupSources
values('ePaySite', 'EPaySite', 'ePaySite', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\ePaySite', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\ePaySite', (-@@Identity)+@HirNodeIdentity)

--ceridianCompanyHourly
Insert Into HirNodeSecuritySetupSources
values('ceridianCompHour', 'CeridianCompanyHourly', 'ceridianCompanyHourly', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\ceridianCompanyHourly', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\ceridianCompanyHourly', (-@@Identity)+@HirNodeIdentity)

--ceridianCompanySalaried
Insert Into HirNodeSecuritySetupSources
values('ceridianCompSal', 'CeridianCompanySalaried', 'ceridianCompanySalaried', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\ceridianCompanySalaried', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabPayroll\ceridianCompanySalaried', (-@@Identity)+@HirNodeIdentity)

--FinancialEntity 
Insert Into HirNodeSecuritySetupSources
values('financialEntity', 'FinancialEntity', 'financialEntity', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial', @HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\financialEntity', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\tabFinancial\sectionFinancial\financialEntity', (-@@Identity)+@HirNodeIdentity)

--MgmtFeeTerminatedHourlyEmployees
Insert Into HirNodeSecuritySetupSources
values('MFTermHourlyEmp', 'MgmtFeeTerminatedHourlyEmployees', 'MgmtFeeTerminatedHourlyEmployees', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics', @HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\MgmtFeeTerminatedHourlyEmployees', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\MgmtFeeTerminatedHourlyEmployees', (-@@Identity)+@HirNodeIdentity)

--MgmtFeeActiveHourlyEmployees
Insert Into HirNodeSecuritySetupSources
values('MFActivHourlyEmp', 'MgmtFeeActiveHourlyEmployees', 'MgmtFeeActiveHourlyEmployees', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\MgmtFeeActiveHourlyEmployees', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\MgmtFeeActiveHourlyEmployees', (-@@Identity)+@HirNodeIdentity)

--MgmtFeeTotalProductiveLaborHoursWorked
Insert Into HirNodeSecuritySetupSources
values('MFTPrdLabHrsWked', 'MgmtFeeTotalProductiveLaborHoursWorked', 'MgmtFeeTotalProductiveLaborHoursWorked', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\MgmtFeeTotalProductiveLaborHoursWorked', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\MgmtFeeTotalProductiveLaborHoursWorked', (-@@Identity)+@HirNodeIdentity)

--MgmtFeeTotalNonProductiveLaborHours
Insert Into HirNodeSecuritySetupSources
values('MFeeTNPrdLabHrs', 'MgmtFeeTotalNonProductiveLaborHours', 'MgmtFeeTotalNonProductiveLaborHours', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\MgmtFeeTotalNonProductiveLaborHours', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\MgmtFeeTotalNonProductiveLaborHours', (-@@Identity)+@HirNodeIdentity)

--MgmtFeeTotalProductiveLaborDollarsPaid
Insert Into HirNodeSecuritySetupSources
values('MFTPrdLbrDolPd', 'MgmtFeeTotalProductiveLaborDollarsPaid', 'MgmtFeeTotalProductiveLaborDollarsPaid', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\MgmtFeeTotalProductiveLaborDollarsPaid', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\MgmtFeeTotalProductiveLaborDollarsPaid', (-@@Identity)+@HirNodeIdentity)

--MgmtFeeTotalNonProductiveLaborDollarsPaid
Insert Into HirNodeSecuritySetupSources
values('MFTNPrdLbrDolPd', 'MgmtFeeTotalNonProductiveLaborDollarsPaid', 'MgmtFeeTotalNonProductiveLaborDollarsPaid', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\MgmtFeeTotalNonProductiveLaborDollarsPaid', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\MgmtFeeTotalNonProductiveLaborDollarsPaid', (-@@Identity)+@HirNodeIdentity)

--HospitalPaidJanitorialPaperPlasticSupplyCost
Insert Into HirNodeSecuritySetupSources
values('HplPaidJanCost', 'HospitalPaidJanitorialPaperPlasticSupplyCost', 'HospitalPaidJanitorialPaperPlasticSupplyCost', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\HospitalPaidJanitorialPaperPlasticSupplyCost', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\HospitalPaidJanitorialPaperPlasticSupplyCost', (-@@Identity)+@HirNodeIdentity)

Declare 
      @Brief varchar(16), 
      @Title varchar(64), 
      @Desc varchar(256), 
      @ParentFullPath varchar(500), 
      @DispOrder Int, 
      @HirNodeParent Int

Declare curTemp Cursor For 
      Select HirNodsssBrief, HirNodsssTitle, HirNodsssDescription, HirNodeParentFullPath, HirNodsssDisplayOrder
      From Esmv2.dbo.HirNodeSecuritySetupSources
      Order By HirNodeSecuritySetupSource Desc

Open curTemp

While(1=1)
Begin
      Fetch Next From curTemp Into @Brief, @Title, @Desc, @ParentFullPath, @DispOrder
      If @@Fetch_Status <> 0 Break
      
      Print @Brief
      Select @HirNodeParent = HirNode from hirnodes where hirnodfullpath = @ParentFullPath

      EXEC Esmv2.dbo.[HirNodeUpdate] 
            0 -- hirNode
            , 1 -- hirHierarchy
            , @HirNodeParent -- hirNodeParent
            , 9 -- hirLevel
            , @Title -- Title
            , @Brief --Brief
            , @Desc -- Description
            , @DispOrder -- DisplayOrder
            , 1 -- Active
            , 'compass-usa\data conversion' -- modBy
      
End

close curTemp
deallocate curTemp

