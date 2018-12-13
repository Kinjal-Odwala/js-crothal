USE [TeamFinv2]
GO

/****** Object:  View [dbo].[VBudSnapshotPreviews]    Script Date: 12/12/2018 3:56:45 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

ALTER VIEW [dbo].[VBudSnapshotPreviews]
AS
SELECT 
	HcmHouseCodes.FscJDECompany,
	HcmHouseCodes.HcmHouseCode,
	Forecasts.FscYear,
	Forecasts.FscAccount,
	Forecast1,Forecast2,Forecast3,Forecast4,Forecast5,Forecast6,Forecast7,Forecast8,Forecast9,Forecast10,Forecast11,Forecast12,
	Actual1,Actual2,Actual3,Actual4,Actual5,Actual6,Actual7,Actual8,Actual9,Actual10,Actual11,Actual12

FROM HcmHouseCodes

LEFT JOIN (
SELECT FscYear, PD.HcmHouseCode, FscAccount,
SUM(BudProdPeriod1) AS Forecast1 ,
SUM(BudProdPeriod2) AS Forecast2 ,
SUM(BudProdPeriod3) AS Forecast3 ,
SUM(BudProdPeriod4) AS Forecast4 ,
SUM(BudProdPeriod5) AS Forecast5 ,
SUM(BudProdPeriod6) AS Forecast6 ,
SUM(BudProdPeriod7) AS Forecast7 ,
SUM(BudProdPeriod8) AS Forecast8 ,
SUM(BudProdPeriod9) AS Forecast9 ,
SUM(BudProdPeriod10) AS Forecast10 ,
SUM(BudProdPeriod11) AS Forecast11 ,
SUM(BudProdPeriod12) AS Forecast12 
FROM BudProjectedDetails PD
INNER JOIN HcmHouseCodes ON PD.HirNode = HcmHouseCodes.HirNode
GROUP BY FscYear, PD.HcmHouseCode, FscAccount ) Forecasts ON HcmHousecodes.HcmHouseCode = Forecasts.HcmHouseCode

LEFT JOIN (
	SELECT
		FscYear, HcmhouseCode, FscAccount,
		SUM(Actual1) AS Actual1,
		SUM(Actual2) AS Actual2,
		SUM(Actual3) AS Actual3,
		SUM(Actual4) AS Actual4,
		SUM(Actual5) AS Actual5,
		SUM(Actual6) AS Actual6,
		SUM(Actual7) AS Actual7,
		SUM(Actual8) AS Actual8,
		SUM(Actual9) AS Actual9,
		SUM(Actual10) AS Actual10,
		SUM(Actual11) AS Actual11,
		SUM(Actual12) AS Actual12
	FROM
	(
	SELECT 
	 FscYear, HcmhouseCode, FscAccount,
	 CASE WHEN PeriodNumber =1 THEN Value ELSE 0 END AS Actual1,
	 CASE WHEN PeriodNumber =2 THEN Value ELSE 0 END AS Actual2,
	 CASE WHEN PeriodNumber =3 THEN Value ELSE 0 END AS Actual3,
	 CASE WHEN PeriodNumber =4 THEN Value ELSE 0 END AS Actual4,
	 CASE WHEN PeriodNumber =5 THEN Value ELSE 0 END AS Actual5,
	 CASE WHEN PeriodNumber =6 THEN Value ELSE 0 END AS Actual6,
	 CASE WHEN PeriodNumber =7 THEN Value ELSE 0 END AS Actual7,
	 CASE WHEN PeriodNumber =8 THEN Value ELSE 0 END AS Actual8,
	 CASE WHEN PeriodNumber =9 THEN Value ELSE 0 END AS Actual9,
	 CASE WHEN PeriodNumber =10 THEN Value ELSE 0 END AS Actual10,
	 CASE WHEN PeriodNumber =11 THEN Value ELSE 0 END AS Actual11,
	 CASE WHEN PeriodNumber =12 THEN Value ELSE 0 END AS Actual12
	FROM (
	SELECT 
	HcmHouseCodes.HcmHouseCode,D.FscYear, D.FscAccount, FscPerTitle PeriodNumber, SUM(AppJDEtAmount) Value
	FROM AppJDEGLTransactions D
	INNER JOIN HcmHouseCodes ON D.HirNode = HcmHouseCodes.HirNode
	INNER JOIN FscAccounts ON D.FscAccount = FscAccounts.FscAccount
	INNER JOIN FscPeriods ON FscPeriods.FscPeriod = D.FscPeriod
	GROUP BY D.FscYear, HcmHouseCodes.HcmHouseCode, D.FscAccount, FscPeriods.FscPerTitle ) A
	) A2
	GROUP BY FscYear, HcmhouseCode, FscAccount ) Actuals ON 
		HcmHouseCodes.HcmHouseCode = Actuals.HcmHouseCode AND Forecasts.FscYear = Actuals.FscYear AND Forecasts.FscAccount = Actuals.FscAccount


GO


