--Invoice System Variable

INSERT INTO [TeamFinv2].[dbo].[AppSystemVariables]
([AppSysBrief],[AppSysTitle],[AppSysDescription],[AppSysVariableName],[AppSysVariableValue],[AppSysDisplayOrder],[AppSysActive],[AppSysModBy],[AppSysModAt])
VALUES
(null,null,null,'StartingInvoiceNumber','100000',1,1,'compass-usa\data conversion',GetDate())

INSERT INTO [TeamFinv2].[dbo].[AppSystemVariables]
([AppSysBrief],[AppSysTitle],[AppSysDescription],[AppSysVariableName],[AppSysVariableValue],[AppSysDisplayOrder],[AppSysActive],[AppSysModBy],[AppSysModAt])
VALUES
(null,null,null,'StartingCreditMemoNumber','100000',1,1,'compass-usa\data conversion',GetDate())

INSERT INTO [TeamFinv2].[dbo].[AppSystemVariables]
([AppSysBrief],[AppSysTitle],[AppSysDescription],[AppSysVariableName],[AppSysVariableValue],[AppSysDisplayOrder],[AppSysActive],[AppSysModBy],[AppSysModAt])
VALUES
(null,null,null,'LastPayrollExportDate','10/31/2009',1,1,'compass-usa\data conversion',GetDate())

INSERT INTO [TeamFinv2].[dbo].[AppSystemVariables]
([AppSysBrief],[AppSysTitle],[AppSysDescription],[AppSysVariableName],[AppSysVariableValue],[AppSysDisplayOrder],[AppSysActive],[AppSysModBy],[AppSysModAt])
VALUES
(null,null,null,'PayrollWeeklyCompanies','HV9',1,1,'compass-usa\data conversion',GetDate())

--Invoice System Variable

-- Budget Submenu update
update esmv2.dbo.appmenuitems
set appmeniactiondata = '/fin/bud/annualprojectionMaster/usr/markup.htm',
appmenibrief = 'Annual Proj'
where appmenuitem = 36

-- Budget Submenu

--Purchase order start number

Alter Table AppSystemVariables
Drop Column AppSysBrief, AppSysTitle, AppSysDescription, AppSysDisplayOrder

Insert Into AppSystemVariables (AppSysVariableName, AppSysVariableValue, AppSysModBy, AppSysModAt)
Values ('StartingPONumber', '50001', 'compass-usa\data conversion', Getdate())

--Purchase order
