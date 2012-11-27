Use Esmv2
Go
--Drop table HirNodeSecuritySetupSources
--select * from hirnodes where hirnodfullpath like '%read ssn%'
--delete from hirnodes where hirnodfullpath like '%read ssn%'

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
/*
Select * from HirNodeSecuritySetupSources order by HirNodeSecuritySetupSource desc
Select top 225 * from Hirnodes order by hirnode desc
Select max(hirnode) from Hirnodes order by hirnode desc
Truncate table HirNodeSecuritySetupSources 
*/

Truncate table HirNodeSecuritySetupSources 

Declare @HirNodeIdentity Int
Select @HirNodeIdentity = Max(HirNode) From Esmv2.dbo.HirNodes
Set @HirNodeIdentity = @HirNodeIdentity + 1
Print @HirNodeIdentity

Delete From HirNodes Where HirNode > 12962 --13691
--select * From HirNodes Where HirNode > 13691

Insert Into HirNodeSecuritySetupSources
values('tabPerson', 'TabPerson', 'tabPerson', 1, 9, '\crothall\chimes\fin\setup\employees', @HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPerson', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPerson', (-@@Identity)+@HirNodeIdentity)

--**
Insert Into HirNodeSecuritySetupSources
values('tabUser', 'TabUser', 'tabUser', 1, 9, '\crothall\chimes\fin\setup\employees', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabUser', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabUser', (-@@Identity)+@HirNodeIdentity)

--**
Insert Into HirNodeSecuritySetupSources
values('tabGeneral', 'TabGeneral', 'tabGeneral', 1, 9, '\crothall\chimes\fin\setup\employees', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral', (-@@Identity)+@HirNodeIdentity)

-----------------****---------
Insert Into HirNodeSecuritySetupSources
values('sectionGeneral', 'SectionGeneral', 'sectionGeneral', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('brief', 'Brief', 'brief', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\brief', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\brief', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('ssn', 'SSN', 'ssn', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\ssn', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\ssn', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('houseCode', 'HouseCode', 'houseCode', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\houseCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\houseCode', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('ceridianCompany', 'CeridianCompany', 'ceridianCompany', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\ceridianCompany', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\ceridianCompany', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('employeeNumber', 'EmployeeNumber', 'employeeNumber', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\employeeNumber', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\employeeNumber', (-@@Identity)+@HirNodeIdentity)

/*Insert Into HirNodeSecuritySetupSources
values('employeeNumber', 'EmployeeNumber', 'employeeNumber', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\employeeNumber', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\employeeNumber', (-@@Identity)+@HirNodeIdentity)
*/
Insert Into HirNodeSecuritySetupSources
values('gender', 'Gender', 'gender', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\gender', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\gender', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('birthDate', 'BirthDate', 'birthDate', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\birthDate', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\birthDate', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('maritalStatus', 'MaritalStatus', 'maritalStatus', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\maritalStatus', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\maritalStatus', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('ethnicity', 'Ethnicity', 'ethnicity', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\ethnicity', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\ethnicity', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('i9Status', 'I9Status', 'i9Status', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\i9Status', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\i9Status', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('active', 'Active', 'active', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\active', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\active', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('vets100Status', 'Vets100Status', 'vets100Status', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\vets100Status', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\vets100Status', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('status', 'Status', 'status', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\status', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\status', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('crothallEmployee', 'CrothallEmployee', 'crothallEmployee', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\crothallEmployee', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\crothallEmployee', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('currentHireDate', 'CurrentHireDate', 'currentHireDate', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\currentHireDate', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\currentHireDate', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('statusCategory', 'StatusCategory', 'statusCategory', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\statusCategory', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\statusCategory', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('originalHireDate', 'OriginalHireDate', 'originalHireDate', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\originalHireDate', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\originalHireDate', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('effectiveDate', 'EffectiveDate', 'effectiveDate', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\effectiveDate', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\effectiveDate', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('terminationDate', 'TerminationDate', 'terminationDate', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\terminationDate', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\terminationDate', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('seniorityDate', 'SeniorityDate', 'seniorityDate', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\seniorityDate', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\seniorityDate', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('terminationRea', 'TerminationReason', 'terminationReason', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\terminationReason', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\terminationReason', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('separationCode', 'SeparationCode', 'separationCode', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\separationCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionGeneral\separationCode', (-@@Identity)+@HirNodeIdentity)

---------****---------
Insert Into HirNodeSecuritySetupSources
values('sectionJob', 'SectionJob', 'sectionJob', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('effectiveDate', 'EffectiveDate', 'effectiveDate', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob\effectiveDate', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob\effectiveDate', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('jobChangeReason', 'JobChangeReason', 'jobChangeReason', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob\jobChangeReason', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob\jobChangeReason', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('jobCode', 'JobCode', 'jobCode', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob\jobCode', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob\jobCode', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('houseCodeJob', 'HouseCodeJob', 'houseCodeJob', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob\houseCodeJob', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob\houseCodeJob', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('employeeUnion', 'EmployeeUnion', 'employeeUnion', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob\employeeUnion', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob\employeeUnion', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('exempt', 'Exempt', 'exempt', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob\exempt', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob\exempt', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('backGroundCheck', 'BackGroundCheckDate', 'backGroundCheckDate', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob\backGroundCheckDate', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob\backGroundCheckDate', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('union', 'Union', 'union', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob\union', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionJob\union', (-@@Identity)+@HirNodeIdentity)

-------***-----
Insert Into HirNodeSecuritySetupSources
values('sectionCompen', 'SectionCompensation', 'sectionCompensation', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('effectiveDate', 'EffectiveDate', 'effectiveDate', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\effectiveDate', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\effectiveDate', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('rateChangeReason', 'RateChangeReason', 'rateChangeReason', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\rateChangeReason', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\rateChangeReason', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('payType', 'PayType', 'payType', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\payType', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\payType', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('hourlyPayRate', 'HourlyPayRate', 'hourlyPayRate', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\hourlyPayRate', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\hourlyPayRate', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('scheduledHours', 'ScheduledHours', 'scheduledHours', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\scheduledHours', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\scheduledHours', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('reviewDate', 'ReviewDate', 'reviewDate', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\reviewDate', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\reviewDate', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('workShift', 'WorkShift', 'workShift', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\workShift', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\workShift', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('compPaidBenefit', 'CompanyPaidBenefit', 'companyPaidBenefit', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\companyPaidBenefit', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\companyPaidBenefit', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('altPayRateA', 'AlternatePayRateA', 'alternatePayRateA', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\alternatePayRateA', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\alternatePayRateA', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('altPayRateB', 'AlternatePayRateB', 'alternatePayRateB', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\alternatePayRateB', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\alternatePayRateB', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('altPayRateC', 'AlternatePayRateC', 'alternatePayRateC', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\alternatePayRateC', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\alternatePayRateC', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('altPayRateD', 'AlternatePayRateD', 'alternatePayRateD', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\alternatePayRateD', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionCompensation\alternatePayRateD', (-@@Identity)+@HirNodeIdentity)

-------***-----
Insert Into HirNodeSecuritySetupSources
values('sectionPTO', 'SectionPTO', 'sectionPTO', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionPTO', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionPTO', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('accrHoursEntry', 'AccrualHoursEntry', 'accrualHoursEntry', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionPTO', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionPTO\accrualHoursEntry', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionPTO\accrualHoursEntry', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('startDate', 'StartDate', 'startDate', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionPTO', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionPTO\startDate', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabGeneral\sectionPTO\startDate', (-@@Identity)+@HirNodeIdentity)

---------*******-------
Insert Into HirNodeSecuritySetupSources
values('tabPayroll', 'TabPayroll', 'tabPayroll', 1, 9, '\crothall\chimes\fin\setup\employees', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll', (-@@Identity)+@HirNodeIdentity)

-----------------****---------
Insert Into HirNodeSecuritySetupSources
values('sectionFedTax', 'SectionFedTax', 'sectionFedTax', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionFedTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionFedTax', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('fedExemptions', 'FedExemptions', 'fedExemptions', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionFedTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionFedTax\fedExemptions', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionFedTax\fedExemptions', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('taxStatus', 'TaxStatus', 'taxStatus', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionFedTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionFedTax\taxStatus', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionFedTax\taxStatus', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('adjustmentType', 'AdjustmentType', 'adjustmentType', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionFedTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionFedTax\adjustmentType', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionFedTax\adjustmentType', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('adjustmentValue', 'AdjustmentValue', 'adjustmentValue', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionFedTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionFedTax\adjustmentValue', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionFedTax\adjustmentValue', (-@@Identity)+@HirNodeIdentity)

----*****---
Insert Into HirNodeSecuritySetupSources
values('sectionStateTax', 'SectionStateTax', 'sectionStateTax', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('primaryState', 'PrimaryState', 'primaryState', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\primaryState', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\primaryState', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('primaryStatus', 'PrimaryStatus', 'primaryStatus', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\primaryStatus', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\primaryStatus', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('secondaryState', 'SecondaryState', 'secondaryState', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\secondaryState', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\secondaryState', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('secondaryStatus', 'SecondaryStatus', 'secondaryStatus', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\secondaryStatus', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\secondaryStatus', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('stateExemptions', 'StateExemptions', 'stateExemptions', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\stateExemptions', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\stateExemptions', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('stateAdjType', 'StateAdjustmentType', 'stateAdjustmentType', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\stateAdjustmentType', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\stateAdjustmentType', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('stateAdjValue', 'StateAdjustmentValue', 'stateAdjustmentValue', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\stateAdjustmentValue', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\stateAdjustmentValue', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('stateSDIAdjType', 'StateSDIAdjustmentType', 'stateSDIAdjustmentType', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\stateSDIAdjustmentType', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\stateSDIAdjustmentType', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('stateSDIAdjValue', 'StateSDIAdjustmentValue', 'stateSDIAdjustmentValue', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\stateSDIAdjustmentValue', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionStateTax\stateSDIAdjustmentValue', (-@@Identity)+@HirNodeIdentity)

----*****---
Insert Into HirNodeSecuritySetupSources
values('sectionLocalTax', 'SectionLocalTax', 'sectionLocalTax', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionLocalTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionLocalTax', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('localTaxAdjType', 'LocalTaxAdjustmentType', 'localTaxAdjustmentType', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionLocalTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionLocalTax\localTaxAdjustmentType', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionLocalTax\localTaxAdjustmentType', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('localTaxAdjValue', 'LocalTaxAdjustmentValue', 'localTaxAdjustmentValue', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionLocalTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionLocalTax\localTaxAdjustmentValue', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionLocalTax\localTaxAdjustmentValue', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('localTaxCode1', 'LocalTaxCode1', 'localTaxCode1', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionLocalTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionLocalTax\localTaxCode1', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionLocalTax\localTaxCode1', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('localTaxCode2', 'LocalTaxCode2', 'localTaxCode2', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionLocalTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionLocalTax\localTaxCode2', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionLocalTax\localTaxCode2', (-@@Identity)+@HirNodeIdentity)

Insert Into HirNodeSecuritySetupSources
values('localTaxCode3', 'LocalTaxCode3', 'localTaxCode3', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionLocalTax', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionLocalTax\localTaxCode3', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPayroll\sectionLocalTax\localTaxCode3', (-@@Identity)+@HirNodeIdentity)

----*****----
Insert Into HirNodeSecuritySetupSources
values('tabPTO', 'TabPTO', 'tabPTO', 1, 9, '\crothall\chimes\fin\setup\employees', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\tabPTO', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\tabPTO', (-@@Identity)+@HirNodeIdentity)

--Select * from HirNodeSecuritySetupSources order by HirNodeSecuritySetupSource desc

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
