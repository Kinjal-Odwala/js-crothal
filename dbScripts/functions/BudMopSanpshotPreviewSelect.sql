USE [Teamfinv2]
GO
/****** Object:  UserDefinedFunction [dbo].[BudMopSanpshotPreviewSelect]    Script Date: 12/13/2018 7:20:32 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER FUNCTION [dbo].[BudMopSanpshotPreviewSelect] 
(
	@FscYear Int
	, @DivisionIds Varchar(256) = ''
)
RETURNS 
@BudMopSanpshotItems TABLE 
(
	HcmHouseCode Int
	, FscYear Int
	, FscAccount Int
	, HcmHoucCostCenterShortName Varchar(50)
	, Forecast1 Decimal(18, 2)
	, Forecast2 Decimal(18, 2)
	, Forecast3 Decimal(18, 2)
	, Forecast4 Decimal(18, 2)
	, Forecast5 Decimal(18, 2)
	, Forecast6 Decimal(18, 2)
	, Forecast7 Decimal(18, 2)
	, Forecast8 Decimal(18, 2)
	, Forecast9 Decimal(18, 2)
	, Forecast10 Decimal(18, 2)
	, Forecast11 Decimal(18, 2)
	, Forecast12 Decimal(18, 2)
	, Actual1 Decimal(18, 2)
	, Actual2 Decimal(18, 2)
	, Actual3 Decimal(18, 2)
	, Actual4 Decimal(18, 2)
	, Actual5 Decimal(18, 2)
	, Actual6 Decimal(18, 2)
	, Actual7 Decimal(18, 2)
	, Actual8 Decimal(18, 2)
	, Actual9 Decimal(18, 2)
	, Actual10 Decimal(18, 2)
	, Actual11 Decimal(18, 2)
	, Actual12 Decimal(18, 2)
)
AS
BEGIN
	-- Select * From dbo.BudMopSanpshotPreviewSelect(10, '3') Where FscYear = 10 And HcmHouseCode = 120
	-- Created on 12/07/2018 by Chandru - To list the snapshot items.

	Declare @BudHouseCodeAccounts Table (
		HcmHouseCode Int
		, FscYear Int
		, FscAccount Int
		, HcmHoucCostCenterShortName Varchar(50)
		)

	Insert Into @BudHouseCodeAccounts
	Select Distinct PD.HcmHouseCode, FscYear, FscAccount, HcmHoucCostCenterShortName
	From dbo.BudProjectedDetails PD With (NoLock)
		Inner Join dbo.HcmHouseCodes HC With (NoLock) On PD.HcmHouseCode = HC.HcmHouseCode 
	Where FscYear = @FscYear
		And Left(HcmHoucCostCenterShortName, 2) In (Select HcmDivProfileCode From dbo.HcmDivisions HD With (NoLock) Where HcmDivision In (Select Data From dbo.Split(@DivisionIds, '~')))

	Union

	Select Distinct T.HcmHouseCode, FscYear, FscAccount, HcmHoucCostCenterShortName
	FROM dbo.AppJDEGLTransactions T With (NoLock)
		Inner Join dbo.HcmHouseCodes HC With (NoLock) On T.HcmHouseCode = HC.HcmHouseCode 
	Where FscYear = @FscYear
		And Left(HcmHoucCostCenterShortName, 2) In (Select HcmDivProfileCode From dbo.HcmDivisions HD With (NoLock) Where HcmDivision In (Select Data From dbo.Split(@DivisionIds, '~')))

	Insert Into @BudMopSanpshotItems
	SELECT HC.HcmHouseCode
		, HC.FscYear
		, HC.FscAccount
		, HC.HcmHoucCostCenterShortName
		, Forecast1, Forecast2, Forecast3, Forecast4, Forecast5, Forecast6, Forecast7, Forecast8, Forecast9, Forecast10, Forecast11, Forecast12
		, Actual1, Actual2, Actual3, Actual4, Actual5, Actual6, Actual7, Actual8, Actual9, Actual10, Actual11, Actual12
	FROM @BudHouseCodeAccounts HC

	LEFT JOIN (
		SELECT FscYear
			, PD.HcmHouseCode
			, FscAccount
			, SUM(BudProdPeriod1) AS Forecast1
			, SUM(BudProdPeriod2) AS Forecast2
			, SUM(BudProdPeriod3) AS Forecast3
			, SUM(BudProdPeriod4) AS Forecast4
			, SUM(BudProdPeriod5) AS Forecast5
			, SUM(BudProdPeriod6) AS Forecast6
			, SUM(BudProdPeriod7) AS Forecast7
			, SUM(BudProdPeriod8) AS Forecast8
			, SUM(BudProdPeriod9) AS Forecast9
			, SUM(BudProdPeriod10) AS Forecast10
			, SUM(BudProdPeriod11) AS Forecast11
			, SUM(BudProdPeriod12) AS Forecast12 
		FROM dbo.BudProjectedDetails PD WITH (NOLOCK)
			--INNER JOIN dbo.HcmHouseCodes ON PD.HirNode = HcmHouseCodes.HirNode
		--WHERE LEFT(HcmHoucCostCenterShortName, 2) IN (SELECT HcmDivProfileCode FROM dbo.HcmDivisions HD WITH (NOLOCK) WHERE HcmDivision In (SELECT Data FROM dbo.Split(@DivisionIds, '~')))
		GROUP BY FscYear, PD.HcmHouseCode, FscAccount)
	Forecasts ON HC.HcmHouseCode = Forecasts.HcmHouseCode AND HC.FscYear = Forecasts.FscYear AND HC.FscAccount = Forecasts.FscAccount

	LEFT JOIN (
		SELECT
			FscYear
			, HcmhouseCode
			, FscAccount
			, SUM(Actual1) AS Actual1
			, SUM(Actual2) AS Actual2
			, SUM(Actual3) AS Actual3
			, SUM(Actual4) AS Actual4
			, SUM(Actual5) AS Actual5
			, SUM(Actual6) AS Actual6
			, SUM(Actual7) AS Actual7
			, SUM(Actual8) AS Actual8
			, SUM(Actual9) AS Actual9
			, SUM(Actual10) AS Actual10
			, SUM(Actual11) AS Actual11
			, SUM(Actual12) AS Actual12
		FROM
		(
			SELECT FscYear
				, HcmhouseCode
				, FscAccount
				, CASE WHEN PeriodNumber = 1 THEN Value ELSE 0 END AS Actual1
				, CASE WHEN PeriodNumber = 2 THEN Value ELSE 0 END AS Actual2
				, CASE WHEN PeriodNumber = 3 THEN Value ELSE 0 END AS Actual3
				, CASE WHEN PeriodNumber = 4 THEN Value ELSE 0 END AS Actual4
				, CASE WHEN PeriodNumber = 5 THEN Value ELSE 0 END AS Actual5
				, CASE WHEN PeriodNumber = 6 THEN Value ELSE 0 END AS Actual6
				, CASE WHEN PeriodNumber = 7 THEN Value ELSE 0 END AS Actual7
				, CASE WHEN PeriodNumber = 8 THEN Value ELSE 0 END AS Actual8
				, CASE WHEN PeriodNumber = 9 THEN Value ELSE 0 END AS Actual9
				, CASE WHEN PeriodNumber = 10 THEN Value ELSE 0 END AS Actual10
				, CASE WHEN PeriodNumber = 11 THEN Value ELSE 0 END AS Actual11
				, CASE WHEN PeriodNumber = 12 THEN Value ELSE 0 END AS Actual12
			FROM 
			(
				SELECT D.HcmHouseCode
					, D.FscYear
					, D.FscAccount
					, FscPerTitle PeriodNumber
					, SUM(AppJDEtAmount) Value
				FROM AppJDEGLTransactions D
					INNER JOIN dbo.HcmHouseCodes H WITH (NOLOCK) ON D.HcmHouseCode = H.HcmHouseCode
					INNER JOIN dbo.FscAccounts FA WITH (NOLOCK) ON D.FscAccount = FA.FscAccount
					INNER JOIN dbo.FscPeriods FP WITH (NOLOCK) ON D.FscPeriod = FP.FscPeriod
				--WHERE LEFT(HcmHoucCostCenterShortName, 2) IN (SELECT HcmDivProfileCode FROM dbo.HcmDivisions HD WITH (NOLOCK) WHERE HcmDivision In (SELECT Data FROM dbo.Split(@DivisionIds, '~')))
				GROUP BY D.FscYear, D.HcmHouseCode, D.FscAccount, FP.FscPerTitle
			) A1
		) A2
		GROUP BY FscYear, HcmhouseCode, FscAccount)
	Actuals ON HC.HcmHouseCode = Actuals.HcmHouseCode AND HC.FscYear = Actuals.FscYear AND HC.FscAccount = Actuals.FscAccount

	Return 
END