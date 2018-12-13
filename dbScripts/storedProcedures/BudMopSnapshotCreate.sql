USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[BudMopSnapshotCreate]    Script Date: 12/12/2018 4:05:26 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROC [dbo].[BudMopSnapshotCreate]
( @fscJDECompany INT, @fscPeriod INT, @createdBy varchar(255), @description varchar(2048))
AS

BEGIN	
	DECLARE @budSnapshot INT

	INSERT INTO BudMopSnapshots
		(FscJDECompany, FscPeriod, BudMopsCrtdAt, BudMopsCrtdBy, BudMopsDescription)
	VALUES
		(@fscJDECompany, @fscPeriod, GETDATE(), @createdBy, @description)

	SET @budSnapshot = SCOPE_IDENTITY()

	DECLARE @fscYear INT	
	 DECLARE @currentPeriodNumber INT

	SELECT @currentPeriodNumber = FscPerTitle, @fscYear= fscYear
	FROM FscPeriods
	WHERE fscPeriod = @fscPeriod

	IF (@currentPeriodNumber IS NULL)
		RETURN;

	INSERT INTO [dbo].[BudMopSnapshotItems]
           ([BudMopSnapshot]
           ,[HcmhouseCode]
           ,[FscAccount]
           ,[BudMopsiPeriod1]
           ,[BudMopsiPeriod2]
           ,[BudMopsiPeriod3]
           ,[BudMopsiPeriod4]
           ,[BudMopsiPeriod5]
           ,[BudMopsiPeriod6]
           ,[BudMopsiPeriod7]
           ,[BudMopsiPeriod8]
           ,[BudMopsiPeriod9]
           ,[BudMopsiPeriod10]
           ,[BudMopsiPeriod11]
           ,[BudMopsiPeriod12])
    
	SELECT
		@budSnapshot,
		VBudSnapshotPreviews.HcmHouseCode,
		VBudSnapshotPreviews.FscAccount Id,
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
	WHERE FscYear = @fscYear AND FscJDECompany=@fscJDECompany 
	GROUP BY VBudSnapshotPreviews.FscAccount, VBudSnapshotPreviews.HcmHouseCode

END