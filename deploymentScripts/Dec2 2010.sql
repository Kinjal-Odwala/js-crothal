--last production update
--2nd Dec 2010


Add the following key in pur-->act-->web.config file.
<add key="ReportFilePath" value="D:\Build\Reports\temp\" />

-- Dec 7th

--CT ESMv2 database updated for hirLevels - 48 49 50
--Also updated hirNodes for levels

-------------Create Clustered Index---------------------------


Create Clustered Index PK_EmpMaritalStatusTypes
On [EmpMaritalStatusTypes]
(
	[EmpMaritalStatusType] ASC
)

ALTER TABLE [dbo].[EmpMaritalStatusTypes] drop [PK__EmpMaritalStatus__5F7E2DAC] 

----------------------------------------------------------------

Add "EmployeeNumberCrothallNew" new Name in AppSystemVariables with Top EmployeeNumber From EmpEmployeeGenerals Table

Select IsNull(Max(EmpEmpgEmployeeNumber), 0) + 1 from EmpEmployeeGenerals where EmpEmpgCrothallEmployee = 1

Add "EmployeeNumberNonCrothallNew" new Name in AppSystemVariables with Top EmployeeNumber

Select IsNull(Max(EmpEmpgEmployeeNumber), 0) + 1 from EmpEmployeeGenerals where EmpEmpgCrothallEmployee = 0

-- Report Embedded 8 Dec

--select * from appmenuitems where appmeniId = 'rpt' and appmenibrief = 'Reports'
update appmenuitems set appmeniActiondata = '/fin/rpt/report/usr/markup.htm?redirectURL=https://test3.compass-usa.com/gateway/app/usr/markup.htm' where appmenuitem = 75

-- Dec 14 2007
INSERT INTO [Esmv2].[dbo].[HirLevels]
([HirHierarchy],[HirLevelParent],[HirLevBrief],[HirLevTitle],[HirLevDescription],[HirLevDisplayOrder],[HirLevActive],[HirLevFullPath],[HirLevModBy],[HirLevModAt],[HirLevSource],[HirLevReference],[HirLevChild])
VALUES(1,Null,'Security','Security','Security',Null,1,'\Security','compass-usa\data migration',getdate(),Null,Null,Null)
GO
