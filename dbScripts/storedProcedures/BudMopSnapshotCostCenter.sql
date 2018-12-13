USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[BudMopSnapshotCostCenter]    Script Date: 12/12/2018 4:07:15 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROC [dbo].[BudMopSnapshotCostCenter]
( @fscJDECompany INT, @fscPeriod INT, @revenue BIT)
AS

DECLARE @currentPeriodNumber INT
DECLARE @fscYear INT
SELECT @currentPeriodNumber = FscPerTitle, @fscyear = FscYear
FROM FscPeriods
WHERE FscPeriod = @fscPeriod

IF (@currentPeriodNumber IS NULL)
	RETURN ;

DECLARE @budSnapshot INT

SELECT @budSnapshot = budMopSnapshot
FROM BudMopSnapshots
WHERE BudMopSnapshots.FscJDECompany = @fscJDECompany AND BudMopSnapshots.FscPeriod = @fscPeriod

IF @budSnapshot IS NOT NULL
BEGIN
	SELECT 
		BudMopSnapshotItems.HcmhouseCode Id,
		SUM(ISNULL(BudMopsiPeriod1,0)) AS Period1,
		SUM(ISNULL(BudMopsiPeriod2,0)) AS Period2,
		SUM(ISNULL(BudMopsiPeriod3,0)) AS Period3,
		SUM(ISNULL(BudMopsiPeriod4,0)) AS Period4,
		SUM(ISNULL(BudMopsiPeriod5,0)) AS Period5,
		SUM(ISNULL(BudMopsiPeriod6,0)) AS Period6,
		SUM(ISNULL(BudMopsiPeriod7,0)) AS Period7,
		SUM(ISNULL(BudMopsiPeriod8,0)) AS Period8,
		SUM(ISNULL(BudMopsiPeriod9,0)) AS Period9,
		SUM(ISNULL(BudMopsiPeriod10,0)) AS Period10,
		SUM(ISNULL(BudMopsiPeriod11,0)) AS Period11,
		SUM(ISNULL(BudMopsiPeriod12,0)) AS Period12
	FROM BudMopSnapshotItems
	INNER JOIN FscAccounts ON BudMopSnapshotItems.FscAccount = FscAccounts.FscAccount
	WHERE BudMopSnapshot = @budSnapshot
	AND (@revenue =0 OR FscAccNegativeValue = 1)
	GROUP BY BudMopSnapshotItems.HcmhouseCode
END
ELSE
BEGIN

SELECT
	HcmHouseCode Id,
	SUM((CASE WHEN @currentPeriodNumber>1 THEN ISNULL(Actual1,0) ELSE ISNULL(Forecast1,0) END) 
		* (CASE WHEN FscAccounts.FscAccNegativeValue = 1 THEN 1 ELSE -1 END)) AS Period1,
	SUM((CASE WHEN @currentPeriodNumber>2 THEN ISNULL(Actual2,0) ELSE ISNULL(Forecast2,0) END) 
		* (CASE WHEN FscAccounts.FscAccNegativeValue = 1 THEN 1 ELSE -1 END)) AS Period2,
	SUM((CASE WHEN @currentPeriodNumber>3 THEN ISNULL(Actual3,0) ELSE ISNULL(Forecast3,0) END) 
		* (CASE WHEN FscAccounts.FscAccNegativeValue = 1 THEN 1 ELSE -1 END)) AS Period3,
	SUM((CASE WHEN @currentPeriodNumber>4 THEN ISNULL(Actual4,0) ELSE ISNULL(Forecast4,0) END) 
		* (CASE WHEN FscAccounts.FscAccNegativeValue = 1 THEN 1 ELSE -1 END)) AS Period4,
	SUM((CASE WHEN @currentPeriodNumber>5 THEN ISNULL(Actual5,0) ELSE ISNULL(Forecast5,0) END) 
		* (CASE WHEN FscAccounts.FscAccNegativeValue = 1 THEN 1 ELSE -1 END)) AS Period5,
	SUM((CASE WHEN @currentPeriodNumber>6 THEN ISNULL(Actual6,0) ELSE ISNULL(Forecast6,0) END) 
		* (CASE WHEN FscAccounts.FscAccNegativeValue = 1 THEN 1 ELSE -1 END)) AS Period6,
	SUM((CASE WHEN @currentPeriodNumber>7 THEN ISNULL(Actual7,0) ELSE ISNULL(Forecast7,0) END) 
		* (CASE WHEN FscAccounts.FscAccNegativeValue = 1 THEN 1 ELSE -1 END)) AS Period7,
	SUM((CASE WHEN @currentPeriodNumber>8 THEN ISNULL(Actual8,0) ELSE ISNULL(Forecast8,0) END) 
		* (CASE WHEN FscAccounts.FscAccNegativeValue = 1 THEN 1 ELSE -1 END)) AS Period8,
	SUM((CASE WHEN @currentPeriodNumber>9 THEN ISNULL(Actual9,0) ELSE ISNULL(Forecast9,0) END) 
		* (CASE WHEN FscAccounts.FscAccNegativeValue = 1 THEN 1 ELSE -1 END)) AS Period9,
	SUM((CASE WHEN @currentPeriodNumber>10 THEN ISNULL(Actual10,0) ELSE ISNULL(Forecast10,0) END) 
		* (CASE WHEN FscAccounts.FscAccNegativeValue = 1 THEN 1 ELSE -1 END)) AS Period10,
	SUM((CASE WHEN @currentPeriodNumber>11 THEN ISNULL(Actual11,0) ELSE ISNULL(Forecast11,0) END) 
		* (CASE WHEN FscAccounts.FscAccNegativeValue = 1 THEN 1 ELSE -1 END)) AS Period11,
	SUM((CASE WHEN @currentPeriodNumber>12 THEN ISNULL(Actual12,0) ELSE ISNULL(Forecast12,0) END) 
		* (CASE WHEN FscAccounts.FscAccNegativeValue = 1 THEN 1 ELSE -1 END)) AS Period12
FROM VBudSnapshotPreviews
INNER JOIN FscAccounts ON VBudSnapshotPreviews.FscAccount = FscAccounts.FscAccount
WHERE FscYear = @fscYear AND FscJDECompany = @fscJDECompany AND (@revenue =0 OR FscAccNegativeValue = 1)
GROUP BY HcmHouseCode
END