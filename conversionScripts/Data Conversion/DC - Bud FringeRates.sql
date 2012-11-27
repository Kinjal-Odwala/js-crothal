  
Select * From [TeamFin].[dbo].[bgtFringeRates] Where FiscalYear = 2010
Select * From TeamFinV2.dbo.BudFringeRates
Truncate Table TeamFinV2.dbo.BudFringeRates
Go

Insert Into TeamFinV2.dbo.BudFringeRates
	( FscYear
	, FscJDECompany
	, AppStateType
	, BudFrirGeneralLiabilty
	, BudFrirHourlyFringeRate
	, BudFrirMgtFringeRate
	)
Select  
	  FY.FscYear
	, JDE.fscJDECompany
    , AppStateType
    , GeneralLiabilty
    , HourlyFringeRate
    , MgtFringeRate
From [TeamFin].[dbo].[bgtFringeRates] FR
	Inner Join TeamFinV2.dbo.FscJDECompanies JDE On FR.CompanyCode = JDE.FSCJdecBrief
	Inner Join TeamFinV2.dbo.FscYears FY On FR.FiscalYear = FY.FscYeaTitle
	Inner Join ESMV2.dbo.AppStateTypes ST On FR.[State] = ST.AppStatBrief
  
 
