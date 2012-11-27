TRUNCATE TABLE TeamFinV2.dbo.BudProjectedDetails
GO

Insert Into TeamFinV2.dbo.BudProjectedDetails
Select HC.HcmHouseCode
	, 1 As HcmJob
	, FY.FscYear
	, FA.FscAccount
	, Period1 = (Select CASE WHEN ca.bNegVal = 1 THEN iBD.ForecastAmt * -1 ELSE iBD.ForecastAmt END From CHIUSCHP303.TeamFin.dbo.BudgetSummary iBD INNER JOIN CHIUSCHP303.TeamFin.dbo.ChartofAcc ca ON iBD.AccCode = ca.Accountcode Where BD.HouseCode = iBD.Housecode 
		And BD.AccCode = iBD.AccCode And BD.FiscalYear = iBD.FiscalYear And Period = 1)
	, Period2 = (Select CASE WHEN ca.bNegVal = 1 THEN iBD.ForecastAmt * -1 ELSE iBD.ForecastAmt END From CHIUSCHP303.TeamFin.dbo.BudgetSummary iBD INNER JOIN CHIUSCHP303.TeamFin.dbo.ChartofAcc ca ON iBD.AccCode = ca.Accountcode Where BD.HouseCode = iBD.Housecode 
		And BD.AccCode = iBD.AccCode And BD.FiscalYear = iBD.FiscalYear And Period = 2)
	, Period3 = (Select CASE WHEN ca.bNegVal = 1 THEN iBD.ForecastAmt * -1 ELSE iBD.ForecastAmt END From CHIUSCHP303.TeamFin.dbo.BudgetSummary iBD INNER JOIN CHIUSCHP303.TeamFin.dbo.ChartofAcc ca ON iBD.AccCode = ca.Accountcode Where BD.HouseCode = iBD.Housecode 
		And BD.AccCode = iBD.AccCode And BD.FiscalYear = iBD.FiscalYear And Period = 3)
	, Period4 = (Select CASE WHEN ca.bNegVal = 1 THEN iBD.ForecastAmt * -1 ELSE iBD.ForecastAmt END From CHIUSCHP303.TeamFin.dbo.BudgetSummary iBD INNER JOIN CHIUSCHP303.TeamFin.dbo.ChartofAcc ca ON iBD.AccCode = ca.Accountcode Where BD.HouseCode = iBD.Housecode 
		And BD.AccCode = iBD.AccCode And BD.FiscalYear = iBD.FiscalYear And Period = 4)
	, Period5 = (Select CASE WHEN ca.bNegVal = 1 THEN iBD.ForecastAmt * -1 ELSE iBD.ForecastAmt END From CHIUSCHP303.TeamFin.dbo.BudgetSummary iBD INNER JOIN CHIUSCHP303.TeamFin.dbo.ChartofAcc ca ON iBD.AccCode = ca.Accountcode Where BD.HouseCode = iBD.Housecode 
		And BD.AccCode = iBD.AccCode And BD.FiscalYear = iBD.FiscalYear And Period = 5)
	, Period6 = (Select CASE WHEN ca.bNegVal = 1 THEN iBD.ForecastAmt * -1 ELSE iBD.ForecastAmt END From CHIUSCHP303.TeamFin.dbo.BudgetSummary iBD INNER JOIN CHIUSCHP303.TeamFin.dbo.ChartofAcc ca ON iBD.AccCode = ca.Accountcode Where BD.HouseCode = iBD.Housecode 
		And BD.AccCode = iBD.AccCode And BD.FiscalYear = iBD.FiscalYear And Period = 6)
	, Period7 = (Select CASE WHEN ca.bNegVal = 1 THEN iBD.ForecastAmt * -1 ELSE iBD.ForecastAmt END From CHIUSCHP303.TeamFin.dbo.BudgetSummary iBD INNER JOIN CHIUSCHP303.TeamFin.dbo.ChartofAcc ca ON iBD.AccCode = ca.Accountcode Where BD.HouseCode = iBD.Housecode 
		And BD.AccCode = iBD.AccCode And BD.FiscalYear = iBD.FiscalYear And Period = 7)
	, Period8 = (Select CASE WHEN ca.bNegVal = 1 THEN iBD.ForecastAmt * -1 ELSE iBD.ForecastAmt END From CHIUSCHP303.TeamFin.dbo.BudgetSummary iBD INNER JOIN CHIUSCHP303.TeamFin.dbo.ChartofAcc ca ON iBD.AccCode = ca.Accountcode Where BD.HouseCode = iBD.Housecode 
		And BD.AccCode = iBD.AccCode And BD.FiscalYear = iBD.FiscalYear And Period = 8)
	, Period9 = (Select CASE WHEN ca.bNegVal = 1 THEN iBD.ForecastAmt * -1 ELSE iBD.ForecastAmt END From CHIUSCHP303.TeamFin.dbo.BudgetSummary iBD INNER JOIN CHIUSCHP303.TeamFin.dbo.ChartofAcc ca ON iBD.AccCode = ca.Accountcode Where BD.HouseCode = iBD.Housecode 
		And BD.AccCode = iBD.AccCode And BD.FiscalYear = iBD.FiscalYear And Period = 9)
	, Period10 = (Select CASE WHEN ca.bNegVal = 1 THEN iBD.ForecastAmt * -1 ELSE iBD.ForecastAmt END From CHIUSCHP303.TeamFin.dbo.BudgetSummary iBD INNER JOIN CHIUSCHP303.TeamFin.dbo.ChartofAcc ca ON iBD.AccCode = ca.Accountcode Where BD.HouseCode = iBD.Housecode 
		And BD.AccCode = iBD.AccCode And BD.FiscalYear = iBD.FiscalYear And Period = 10)
	, Period11 = (Select CASE WHEN ca.bNegVal = 1 THEN iBD.ForecastAmt * -1 ELSE iBD.ForecastAmt END From CHIUSCHP303.TeamFin.dbo.BudgetSummary iBD INNER JOIN CHIUSCHP303.TeamFin.dbo.ChartofAcc ca ON iBD.AccCode = ca.Accountcode Where BD.HouseCode = iBD.Housecode 
		And BD.AccCode = iBD.AccCode And BD.FiscalYear = iBD.FiscalYear And Period = 11)
	, Period12 = (Select CASE WHEN ca.bNegVal = 1 THEN iBD.ForecastAmt * -1 ELSE iBD.ForecastAmt END From CHIUSCHP303.TeamFin.dbo.BudgetSummary iBD INNER JOIN CHIUSCHP303.TeamFin.dbo.ChartofAcc ca ON iBD.AccCode = ca.Accountcode Where BD.HouseCode = iBD.Housecode 
		And BD.AccCode = iBD.AccCode And BD.FiscalYear = iBD.FiscalYear And Period = 12)
	, Period13 = (Select CASE WHEN ca.bNegVal = 1 THEN iBD.ForecastAmt * -1 ELSE iBD.ForecastAmt END From CHIUSCHP303.TeamFin.dbo.BudgetSummary iBD INNER JOIN CHIUSCHP303.TeamFin.dbo.ChartofAcc ca ON iBD.AccCode = ca.Accountcode Where BD.HouseCode = iBD.Housecode 
		And BD.AccCode = iBD.AccCode And BD.FiscalYear = iBD.FiscalYear And Period = 13)
	, 0 As Period14
	, Min(BD.TFUser) As EnteredBy
	, Min(BD.LastForecastChange) As EnteredAt
From TeamFin.dbo.BudgetSummary BD
	Inner Join TeamFinV2.dbo.FscYears FY On FY.FscYeaTitle = CAST((BD.FiscalYear + 2000) AS VARCHAR(64))
	Inner Join TeamFinV2.dbo.FscAccounts FA On FA.FscAccCode = BD.AccountCode
	Inner Join ESMV2.dbo.AppUnits AU On AU.AppUniBrief = BD.HouseCode
	Inner Join TeamFinV2.dbo.HcmHouseCodes HC On AU.AppUnit = HC.AppUnit
Group By FY.FscYear, FA.FscAccount, HouseCode, BD.FiscalYear, BD.AccountCode, HC.HcmHouseCode