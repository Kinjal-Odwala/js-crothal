USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[rptULED_AccountFinancialPerformance]    Script Date: 7/5/2018 2:19:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[rptEVSULED_AccountFinancialPerformance]
(
	@NUserID varchar(50),
	@NLevel varchar(20),
	@NName varchar(8000),
	@NFscYear INT,
	@NFscPeriod INT
)
AS



/*
DECLARE @NUserID VARCHAR(50)
DECLARE @NLevel VARCHAR(20)
DECLARE @NName VARCHAR(8000)
DECLARE @NFscYear INT
DECLARE @NFscPeriod INT
SET @NFscYear = 7
SET @NFscPeriod = 80
SET @NLevel = 'SiteName'
SET @NUserID = 'compass-usa\MartiL04'
SET @NName = '1859 St Lukes Hospital'
*/

SET NOCOUNT ON
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED


DECLARE @FscPerTitle INT
SELECT @FscPerTitle = FscPerTitle FROM TeamFinv2..FscPeriods WHERE [FscPeriod] = @NFscPeriod

--Determine actual and forecast cutoff
--Replace variable with config in future
DECLARE @ForecastNoDays int
--SET @ForecastNoDays = 7
SET @ForecastNoDays = (Select [AppSysVariableValue] from APPSystemVariables where [AppSysVariableName] = 'FiscalPeriodCloseDays')
-----------

DECLARE @CurrentDate DateTime
--SET @CurrentDate = GETDATE()
SET @CurrentDate = (SELECT DATEADD(dd, 0, DATEDIFF(dd, 0, GETDATE())))

DECLARE @AdJustForecastDate DateTime
SET @AdJustForecastDate = DATEADD(MONTH, DATEDIFF(MONTH, 0, @CurrentDate), 0)+ (@ForecastNoDays -1)

--SELECT @AdJustForecastDate
--SELECT @CurrentDate

DECLARE @CurrentYear INT
DECLARE @CurrentPerTitle INT

--Set actual and forecast cutoff year and period
IF @CurrentDate >= @AdJustForecastDate 
   --actual
   BEGIN
      SELECT @CurrentYear = FscYear FROM TeamFinv2..FscPeriods WHERE @CurrentDate between FscPerStartDate AND FscPerEndDate
      SELECT @CurrentPerTitle = FscPerTitle FROM TeamFinv2..FscPeriods WHERE @CurrentDate between FscPerStartDate AND FscPerEndDate
   END
ELSE 
   --forecast
   BEGIN
      SELECT @CurrentYear = FscYear FROM TeamFinv2..FscPeriods WHERE @CurrentDate between FscPerStartDate AND FscPerEndDate
      SELECT @CurrentPerTitle = FscPerTitle - 1 FROM TeamFinv2..FscPeriods WHERE @CurrentDate between FscPerStartDate AND FscPerEndDate
   END

--SELECT @CurrentYear
--SELECT @CurrentPerTitle
------------------------------------------ lam add end 04/01/2013

--DECLARE @NFscYear INT
DECLARE @PriorPeriod INT
DECLARE @PerCount INT
DECLARE @PriorPerCount INT

--SET @PriorPeriod = @NFscPeriod - 1
SELECT @PriorPeriod = FscPeriod FROM TeamFinv2..FscPeriods WHERE FscPerEndDate = (SELECT CAST(CONVERT(VARCHAR(10),FscPerStartDate,101) + ' 11:59:00 PM' AS DATETIME) -1 FROM TeamFinv2..FscPeriods WHERE FscPeriod = @NFscPeriod)
--SELECT @NFscYear = FscYear FROM TeamFinv2..FscPeriods WHERE FscPeriod = @NFscPeriod
SET @PerCount = (SELECT  TeamFinv2.dbo.BudGetPeriodDayCountByFscPeriod(@NFscPeriod))
SET @PriorPerCount = (SELECT  TeamFinv2.dbo.BudGetPeriodDayCountByFscPeriod(@PriorPeriod))

CREATE TABLE #Hierarchy
    (
	   ENT VARCHAR(64),
	   SVP VARCHAR(64),
	   DVP VARCHAR(64),
	   RVP VARCHAR(64),
	   SRM VARCHAR(64),
	   RM VARCHAR(64),
	   AM VARCHAR(64),
	   SiteName VARCHAR(64),
	   HouseCode VARCHAR(16),
	   HirNode INT
    )
INSERT INTO #Hierarchy 
    (
	   ENT,
	   SVP,
	   DVP,
	   RVP,
	   SRM,
	   RM,
	   AM,
	   SiteName,
	   HouseCode,
	   HirNode
    )

SELECT
    hn.HirNodLevel1 AS ENT,
    hn.HirNodLevel2 AS SVP,
    hn.HirNodLevel3 AS DVP,
    hn.HirNodLevel4 AS RVP,
    hn.HirNodLevel5 AS SRM,
    hn.HirNodLevel6 AS RM,
    hn.HirNodLevel7 AS AM,
    hn.HirNodLevel8 AS SiteName,
    u.AppUniBrief AS HouseCode,
    u.HirNode
FROM 
    Esmv2.dbo.AppUserHouseCodesSelectFunction(@NUserID) u 
    INNER JOIN Esmv2.dbo.HirNodes hn ON
    u.HirNode = hn.HirNode
WHERE 
    (CASE @NLevel 
    WHEN 'ENT' THEN hn.HirNodLevel1  
    WHEN 'SVP' THEN hn.HirNodLevel2 
    WHEN 'DVP' THEN hn.HirNodLevel3 
    WHEN 'RVP' THEN hn.HirNodLevel4 
    WHEN 'SRM' THEN hn.HirNodLevel5 
    WHEN 'RM' THEN hn.HirNodLevel6
    WHEN 'AM' THEN hn.HirNodLevel7  
    WHEN 'SiteName' THEN hn.HirNodLevel8
    ELSE '' END) IN (@NName)
ORDER BY
    hn.HirNodLevel1,
    hn.HirNodLevel2,
    hn.HirNodLevel3,
    hn.HirNodLevel4,
    hn.HirNodLevel5,
    hn.HirNodLevel6,
    hn.HirNodLevel7,
    hn.HirNodLevel8,
    u.AppUniBrief,
    u.HirNode

--select * from #Hierarchy


DECLARE @HousePeriodTable TABLE (HouseCode VARCHAR(16) NOT NULL,
                                 HirNode [int] NOT NULL,
                                 FscYear  [int] NOT NULL,
                                 FscPeriod [int] NOT NULL,
							     FscPerTitle [int] NOT NULL
                                 PRIMARY KEY (HouseCode,HirNode, FscYear,FscPeriod,FscPerTitle)) 

INSERT INTO @HousePeriodTable
SELECT hg.HouseCode AS HouseCode,
       hg.HirNode AS HirNode,
       fp.FscYear AS FscYear,
       fp.FscPeriod AS FscPeriod,
	   fp.FscPerTitle AS FscPerTitle
FROM #Hierarchy hg
Inner JOIN dbo.FscPeriods fp
ON fp.FscYear = @NFscYear  
ORDER BY
      hg.HouseCode,
	  hg.HirNode,
      fp.FscYear DESC,
      fp.FscPeriod DESC, 
	  fp.FscPerTitle DESC


--Select * from @HousePeriodTable

SELECT 
    grp.SiteName AS SiteName,
    grp.HouseCode AS HouseCode,
	grp.Period AS Period,
	grp.PeriodTitle AS PeriodTitle,
    Sum(grp.MOPTotal) AS MOPTotal,
    Sum(grp.SumMOPTotal) AS SumMOPTotal,
    Sum(grp.BudgetTotal) AS BudgetTotal,
    Sum(grp.SumBudgetTotal) AS SumBudgetTotal,
    Sum(grp.CurrentActuals) AS CurrentActuals,
    Sum(grp.SumCurrentActuals) AS SumCurrentActuals
FROM (
SELECT
    hn.HirNodLevel8 AS SiteName,
    au.AppUniBrief AS HouseCode,
	w.FscPeriod AS Period,
	w.FscPerTitle AS PeriodTitle,
    SUM(ISNULL(w.BudBudworfWeek1,0) + ISNULL(w.BudBudworfWeek2,0) + ISNULL(w.BudBudworfWeek3,0) + ISNULL(w.BudBudworfWeek4,0) + ISNULL(w.BudBudworfWeek5,0) + ISNULL(w.BudBudworfWeek6,0)) AS MOPTotal,
    SUM(CASE
	   WHEN fa.FscAccNegativeValue = 1
	   THEN -(ISNULL(w.BudBudworfWeek1,0) + ISNULL(w.BudBudworfWeek2,0) + ISNULL(w.BudBudworfWeek3,0) + ISNULL(w.BudBudworfWeek4,0) + ISNULL(w.BudBudworfWeek5,0) + ISNULL(w.BudBudworfWeek6,0))
	   ELSE ISNULL(w.BudBudworfWeek1,0) + ISNULL(w.BudBudworfWeek2,0) + ISNULL(w.BudBudworfWeek3,0) + ISNULL(w.BudBudworfWeek4,0) + ISNULL(w.BudBudworfWeek5,0) + ISNULL(w.BudBudworfWeek6,0)
    END) AS SumMOPTotal,
    SUM(ISNULL(b.PeriodValue,0)) AS BudgetTotal,
    SUM(CASE
	   WHEN fa.FscAccNegativeValue = 1
	   THEN -(ISNULL(b.PeriodValue,0))
	   ELSE ISNULL(b.PeriodValue,0)
    END) AS SumBudgetTotal,
    SUM(CAST(ISNULL(jc.Amount,0) AS NUMERIC(18,2))) AS CurrentActuals,
    SUM(CASE
	   WHEN fa.FscAccNegativeValue = 1
	   THEN -(CAST(ISNULL(jc.Amount,0) AS NUMERIC(18,2)))
	   ELSE CAST(ISNULL(jc.Amount,0) AS NUMERIC(18,2))
    END) AS SumCurrentActuals

FROM
(
SELECT
    w.FscYear,
    w.FscPeriod,
	fp.FscPerTitle,
    w.HirNode,
    w.HcmJob,
    w.FscAccount,
    w.BudBudworfWeek1,
    w.BudBudworfWeek2,
    w.BudBudworfWeek3,
    w.BudBudworfWeek4,
    w.BudBudworfWeek5,
    w.BudBudworfWeek6
FROM
    TeamFinv2..BudBudgetWORForecasts w WITH (NOLOCK)
    INNER JOIN Esmv2..AppUnits au WITH (NOLOCK) ON
    w.HirNode = au.HirNode
    INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode
	inner join TeamFinv2..FscPeriods fp WITH (NOLOCK) ON
	fp.FscPeriod = w.FscPeriod
WHERE
 (CASE @NLevel 
	   WHEN 'ENT' THEN hn.HirNodLevel1
	   WHEN 'SVP' THEN hn.HirNodLevel2
	   WHEN 'DVP' THEN hn.HirNodLevel3
	   WHEN 'RVP' THEN hn.HirNodLevel4
	   WHEN 'SRM' THEN hn.HirNodLevel5
	   WHEN 'RM' THEN hn.HirNodLevel6
	   WHEN 'AM' THEN hn.HirNodLevel7
	   WHEN 'SiteName' THEN hn.HirNodLevel8
	   ELSE '' END) IN (@NName) AND
	   au.AppUniBrief IN (
		  SELECT HouseCode FROM #Hierarchy) AND
    --w.FscPeriod = @NFscPeriod LAM01/07
	w.FscYear = @NFscYear
) w
FULL OUTER JOIN 
(
SELECT
    unpvt.FscYear,
    unpvt.HirNode,
    unpvt.HcmJob,
    unpvt.FscAccount,
    CAST(SUBSTRING(unpvt.Period,7,2) AS INT) AS Period,
    p.FscPeriod,
    CAST(unpvt.PeriodValue AS NUMERIC(18,2)) AS PeriodValue
FROM
    (
	   SELECT
		  FscYear,
		  HirNode,
		  HcmJob,
		  FscAccount,
		  CAST(CAST(ISNULL(BudDetPeriod1,0) AS NUMERIC(18,2)) AS VARCHAR(254)) Period1,
		  CAST(CAST(ISNULL(BudDetPeriod2,0) AS NUMERIC(18,2)) AS VARCHAR(254)) Period2,
		  CAST(CAST(ISNULL(BudDetPeriod3,0) AS NUMERIC(18,2)) AS VARCHAR(254)) Period3,
		  CAST(CAST(ISNULL(BudDetPeriod4,0) AS NUMERIC(18,2)) AS VARCHAR(254)) Period4,
		  CAST(CAST(ISNULL(BudDetPeriod5,0) AS NUMERIC(18,2)) AS VARCHAR(254)) Period5,
		  CAST(CAST(ISNULL(BudDetPeriod6,0) AS NUMERIC(18,2)) AS VARCHAR(254)) Period6,
		  CAST(CAST(ISNULL(BudDetPeriod7,0) AS NUMERIC(18,2)) AS VARCHAR(254)) Period7,
		  CAST(CAST(ISNULL(BudDetPeriod8,0) AS NUMERIC(18,2)) AS VARCHAR(254)) Period8,
		  CAST(CAST(ISNULL(BudDetPeriod9,0) AS NUMERIC(18,2)) AS VARCHAR(254)) Period9,
		  CAST(CAST(ISNULL(BudDetPeriod10,0) AS NUMERIC(18,2)) AS VARCHAR(254)) Period10,
		  CAST(CAST(ISNULL(BudDetPeriod11,0) AS NUMERIC(18,2)) AS VARCHAR(254)) Period11,
		  CAST(CAST(ISNULL(BudDetPeriod12,0) AS NUMERIC(18,2)) AS VARCHAR(254)) Period12,
		  CAST(CAST(ISNULL(BudDetPeriod13,0) AS NUMERIC(18,2)) AS VARCHAR(254)) Period13,
		  CAST(CAST(ISNULL(BudDetPeriod14,0) AS NUMERIC(18,2)) AS VARCHAR(254)) Period14,
		  CAST(CAST(ISNULL(BudDetPeriod15,0) AS NUMERIC(18,2)) AS VARCHAR(254)) Period15,
		  CAST(CAST(ISNULL(BudDetPeriod16,0) AS NUMERIC(18,2)) AS VARCHAR(254)) Period16
	   FROM
		  TeamFinv2..BudDetails
    ) pvt
    UNPIVOT
	   (PeriodValue FOR Period IN (
		  Period1,
		  Period2,
		  Period3,
		  Period4,
		  Period5,
		  Period6,
		  Period7,
		  Period8,
		  Period9,
		  Period10,
		  Period11,
		  Period12,
		  Period13,
		  Period14,
		  Period15,
		  Period16))
	   AS unpvt INNER JOIN TeamFinv2..FscPeriods p ON
	   unpvt.FscYear = p.FscYear AND CAST(SUBSTRING(unpvt.Period,7,2) AS INT) = p.FscPerTitle
	   INNER JOIN Esmv2..AppUnits au WITH (NOLOCK) ON
	   unpvt.HirNode = au.HirNode
	   INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
	   au.HirNode = hn.HirNode
WHERE
 (CASE @NLevel 
	   WHEN 'ENT' THEN hn.HirNodLevel1
	   WHEN 'SVP' THEN hn.HirNodLevel2
	   WHEN 'DVP' THEN hn.HirNodLevel3
	   WHEN 'RVP' THEN hn.HirNodLevel4
	   WHEN 'SRM' THEN hn.HirNodLevel5
	   WHEN 'RM' THEN hn.HirNodLevel6
	   WHEN 'AM' THEN hn.HirNodLevel7
	   WHEN 'SiteName' THEN hn.HirNodLevel8
	   ELSE '' END) IN (@NName) AND
	   au.AppUniBrief IN (
		  SELECT HouseCode FROM #Hierarchy) AND
    --p.FscPeriod = @NFscPeriod LAM01/07
	unpvt.FscYear = @NFscYear
) b ON
w.HirNode = b.HirNode AND w.FscYear = b.FscYear AND w.FscPeriod = b.FscPeriod AND w.FscAccount = b.FscAccount AND w.HcmJob = b.HcmJob

FULL OUTER JOIN
 (
SELECT
    j.FscYear,
    j.FscPeriod,
    j.HirNode,
    j.HcmJob,
    j.FscAccount,
    SUM(AppJDEtAmount) AS Amount
FROM
    TeamFinv2..AppJDEGLTransactions j WITH (NOLOCK) 
    INNER JOIN Esmv2..AppUnits au WITH (NOLOCK) ON
    j.HirNode = au.HirNode
    INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode 
WHERE
   (CASE @NLevel 
	   WHEN 'ENT' THEN hn.HirNodLevel1
	   WHEN 'SVP' THEN hn.HirNodLevel2
	   WHEN 'DVP' THEN hn.HirNodLevel3
	   WHEN 'RVP' THEN hn.HirNodLevel4
	   WHEN 'SRM' THEN hn.HirNodLevel5
	   WHEN 'RM' THEN hn.HirNodLevel6
	   WHEN 'AM' THEN hn.HirNodLevel7
	   WHEN 'SiteName' THEN hn.HirNodLevel8
	   ELSE '' END) IN (@NName) AND
	   au.AppUniBrief IN (
		  SELECT HouseCode FROM #Hierarchy) AND
    --j.FscPeriod = @NFscPeriod LAM01/07
	j.FscYear = @NFscYear
GROUP BY
    j.FscYear,
    j.FscPeriod,
    j.HirNode,
    j.HcmJob,
    j.FscAccount
) jc ON
w.HirNode =  jc.HirNode AND w.FscYear = jc.FscYear AND w.FscPeriod = jc.FscPeriod AND w.FscAccount = jc.FscAccount AND w.HcmJob = jc.HcmJob
FULL OUTER JOIN
(
SELECT
    j.FscYear,
    j.FscPeriod,
    j.HirNode,
    j.HcmJob,
    j.FscAccount,
    SUM(AppJDEtAmount) AS Amount
FROM
    TeamFinv2..AppJDEGLTransactions j WITH (NOLOCK)
    INNER JOIN TeamFinv2..FscYears fy WITH (NOLOCK) ON
    j.FscYear = fy.FscYear
    INNER JOIN TeamFinv2..FscPeriods fp WITH (NOLOCK) ON
    j.FscPeriod = fp.FscPeriod
    INNER JOIN Esmv2..AppUnits au WITH (NOLOCK) ON
    j.HirNode = au.HirNode
    INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode 
WHERE
 (CASE @NLevel 
	   WHEN 'ENT' THEN hn.HirNodLevel1
	   WHEN 'SVP' THEN hn.HirNodLevel2
	   WHEN 'DVP' THEN hn.HirNodLevel3
	   WHEN 'RVP' THEN hn.HirNodLevel4
	   WHEN 'SRM' THEN hn.HirNodLevel5
	   WHEN 'RM' THEN hn.HirNodLevel6
	   WHEN 'AM' THEN hn.HirNodLevel7
	   WHEN 'SiteName' THEN hn.HirNodLevel8
	   ELSE '' END) IN (@NName) AND
	   au.AppUniBrief IN (
		  SELECT HouseCode FROM #Hierarchy) AND
    j.FscPeriod = @PriorPeriod
GROUP BY
    j.FscYear,
    j.FscPeriod,
    j.HirNode,
    j.HcmJob,
    j.FscAccount
) jp ON
w.HirNode =  jp.HirNode AND w.FscAccount = jp.FscAccount AND w.HcmJob = jp.HcmJob
LEFT OUTER JOIN
(
SELECT
    unpvt.FscYear,
    unpvt.HirNode,
    unpvt.HcmJob,
    unpvt.FscAccount,
    CAST(SUBSTRING(unpvt.Period,7,2) AS INT) AS Period,
    p.FscPeriod,
    unpvt.PeriodValue AS PeriodValue
FROM
    (
	   SELECT
		  FscYear,
		  HirNode,
		  HcmJob,
		  FscAccount,
		  CAST(ISNULL(BudProcPeriod1,0) AS VARCHAR(254)) Period1,
		  CAST(ISNULL(BudProcPeriod2,0) AS VARCHAR(254)) Period2,
		  CAST(ISNULL(BudProcPeriod3,0) AS VARCHAR(254)) Period3,
		  CAST(ISNULL(BudProcPeriod4,0) AS VARCHAR(254)) Period4,
		  CAST(ISNULL(BudProcPeriod5,0) AS VARCHAR(254)) Period5,
		  CAST(ISNULL(BudProcPeriod6,0) AS VARCHAR(254)) Period6,
		  CAST(ISNULL(BudProcPeriod7,0) AS VARCHAR(254)) Period7,
		  CAST(ISNULL(BudProcPeriod8,0) AS VARCHAR(254)) Period8,
		  CAST(ISNULL(BudProcPeriod9,0) AS VARCHAR(254)) Period9,
		  CAST(ISNULL(BudProcPeriod10,0) AS VARCHAR(254)) Period10,
		  CAST(ISNULL(BudProcPeriod11,0) AS VARCHAR(254)) Period11,
		  CAST(ISNULL(BudProcPeriod12,0) AS VARCHAR(254)) Period12,
		  CAST(ISNULL(BudProcPeriod13,0) AS VARCHAR(254)) Period13,
		  CAST(ISNULL(BudProcPeriod14,0) AS VARCHAR(254)) Period14,
		  CAST(ISNULL(BudProcPeriod15,0) AS VARCHAR(254)) Period15,
		  CAST(ISNULL(BudProcPeriod16,0) AS VARCHAR(254)) Period16
	   FROM
		  TeamFinv2..BudProjectedComments
    ) pvt
	   UNPIVOT
		  (PeriodValue FOR Period IN (
			 Period1,
			 Period2,
			 Period3,
			 Period4,
			 Period5,
			 Period6,
			 Period7,
			 Period8,
			 Period9,
			 Period10,
			 Period11,
			 Period12,
			 Period13,
			 Period14,
			 Period15,
			 Period16))
	   AS unpvt INNER JOIN TeamFinv2..FscPeriods p ON
	   unpvt.FscYear = p.FscYear AND CAST(SUBSTRING(unpvt.Period,7,2) AS INT) = p.FscPerTitle
	   INNER JOIN Esmv2..AppUnits au WITH (NOLOCK) ON
	   unpvt.HirNode = au.HirNode
	   INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
	   au.HirNode = hn.HirNode
WHERE
   (CASE @NLevel 
	   WHEN 'ENT' THEN hn.HirNodLevel1
	   WHEN 'SVP' THEN hn.HirNodLevel2
	   WHEN 'DVP' THEN hn.HirNodLevel3
	   WHEN 'RVP' THEN hn.HirNodLevel4
	   WHEN 'SRM' THEN hn.HirNodLevel5
	   WHEN 'RM' THEN hn.HirNodLevel6
	   WHEN 'AM' THEN hn.HirNodLevel7
	   WHEN 'SiteName' THEN hn.HirNodLevel8
	   ELSE '' END) IN (@NName) AND
	   au.AppUniBrief IN (
		  SELECT HouseCode FROM #Hierarchy) AND
    p.FscPeriod = @NFscPeriod
) c ON
w.HirNode =  c.HirNode AND w.FscAccount = c.FscAccount AND w.HcmJob = c.HcmJob
FULL OUTER JOIN
(
SELECT
    b.FscYear,
    b.FscAccount,
    b.HirNode,
    b.HcmJob,
    ISNULL(b.BudDetPeriod1,0) + ISNULL(b.BudDetPeriod2,0) + ISNULL(b.BudDetPeriod3,0) + ISNULL(b.BudDetPeriod4,0) + ISNULL(b.BudDetPeriod5,0) + 
    ISNULL(b.BudDetPeriod6,0) + ISNULL(b.BudDetPeriod7,0) + ISNULL(b.BudDetPeriod8,0) + ISNULL(b.BudDetPeriod9,0) + ISNULL(b.BudDetPeriod10,0) + 
    ISNULL(b.BudDetPeriod11,0) + ISNULL(b.BudDetPeriod12,0) + ISNULL(b.BudDetPeriod13,0) + ISNULL(b.BudDetPeriod14,0) + ISNULL(b.BudDetPeriod15,0) + 
    ISNULL(b.BudDetPeriod16,0) AS BudgetTotal
FROM
    TeamFinv2..BudDetails b WITH (NOLOCK) 
    INNER JOIN Esmv2..AppUnits au WITH (NOLOCK) ON
    b.HirNode = au.HirNode
    INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode
WHERE
 (CASE @NLevel 
	   WHEN 'ENT' THEN hn.HirNodLevel1
	   WHEN 'SVP' THEN hn.HirNodLevel2
	   WHEN 'DVP' THEN hn.HirNodLevel3
	   WHEN 'RVP' THEN hn.HirNodLevel4
	   WHEN 'SRM' THEN hn.HirNodLevel5
	   WHEN 'RM' THEN hn.HirNodLevel6
	   WHEN 'AM' THEN hn.HirNodLevel7
	   WHEN 'SiteName' THEN hn.HirNodLevel8
	   ELSE '' END) IN (@NName) AND
	   au.AppUniBrief IN (
		  SELECT HouseCode FROM #Hierarchy) AND
    FscYear = @NFscYear
) bt ON
w.HirNode =  bt.HirNode AND w.FscAccount = bt.FscAccount AND w.HcmJob = bt.HcmJob
FULL OUTER JOIN
(
SELECT
    w.FscYear,
--    w.FscPeriod,
    w.HirNode,
    w.HcmJob,
    w.FscAccount,
    SUM(ISNULL(w.BudBudworfWeek1,0) + ISNULL(w.BudBudworfWeek2,0) + ISNULL(w.BudBudworfWeek3,0) + ISNULL(w.BudBudworfWeek4,0) + ISNULL(w.BudBudworfWeek5,0) + ISNULL(w.BudBudworfWeek6,0)) AS ProjTotal,
    SUM(CASE
	   WHEN fa.FscAccNegativeValue = 1
	   THEN -(ISNULL(w.BudBudworfWeek1,0) + ISNULL(w.BudBudworfWeek2,0) + ISNULL(w.BudBudworfWeek3,0) + ISNULL(w.BudBudworfWeek4,0) + ISNULL(w.BudBudworfWeek5,0) + ISNULL(w.BudBudworfWeek6,0))
	   ELSE ISNULL(w.BudBudworfWeek1,0) + ISNULL(w.BudBudworfWeek2,0) + ISNULL(w.BudBudworfWeek3,0) + ISNULL(w.BudBudworfWeek4,0) + ISNULL(w.BudBudworfWeek5,0) + ISNULL(w.BudBudworfWeek6,0)
    END) AS SUMProjTotal
FROM
    TeamFinv2..BudBudgetWORForecasts w WITH (NOLOCK) 
    INNER JOIN Esmv2..AppUnits au WITH (NOLOCK) ON
    w.HirNode = au.HirNode
    INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode
    --lam add start 04/01/2013
    INNER JOIN dbo.FscPeriods fc WITH (NOLOCK) ON
    fc.FscPeriod = w.FscPeriod and fc.FscYear = w.FscYear
    --lam add end 04/01/2013
    INNER JOIN TeamFinv2..FscAccounts fa WITH (NOLOCK) ON
    fa.FscAccount = w.FscAccount
WHERE
     (CASE @NLevel 
	   WHEN 'ENT' THEN hn.HirNodLevel1
	   WHEN 'SVP' THEN hn.HirNodLevel2
	   WHEN 'DVP' THEN hn.HirNodLevel3
	   WHEN 'RVP' THEN hn.HirNodLevel4
	   WHEN 'SRM' THEN hn.HirNodLevel5
	   WHEN 'RM' THEN hn.HirNodLevel6
	   WHEN 'AM' THEN hn.HirNodLevel7
	   WHEN 'SiteName' THEN hn.HirNodLevel8
	   ELSE '' END) IN (@NName) AND
	   au.AppUniBrief IN (
		  SELECT HouseCode FROM #Hierarchy) and
    w.FscYear = @NFscYear AND
    --lam add start 04/01/2013
    fc.FscYear >= @CurrentYear AND
    fc.FscPerTitle >= @CurrentPerTitle
    --lam add end 04/01/2013
GROUP BY
    w.FscYear,
--    w.FscPeriod,
    w.HirNode,
    w.HcmJob,
    w.FscAccount
) pt ON
w.HirNode =  pt.HirNode AND w.FscYear = pt.FscYear /*AND w.FscPeriod = pt.FscPeriod*/ AND w.FscAccount = pt.FscAccount AND w.HcmJob = pt.HcmJob
--lam add start 04/01/2013
FULL OUTER JOIN
 (
SELECT
    j.FscYear,
    j.HirNode,
    j.HcmJob,
    j.FscAccount,
    SUM(ISNULL(AppJDEtAmount,0)) AS Amount,
    SUM(CASE
	   WHEN fa.FscAccNegativeValue = 1
	   THEN -(ISNULL(AppJDEtAmount,0))
	   ELSE ISNULL(AppJDEtAmount,0)
    END) AS SumAmount
FROM
    TeamFinv2..AppJDEGLTransactions j WITH (NOLOCK) 
    INNER JOIN Esmv2..AppUnits au WITH (NOLOCK) ON
    j.HirNode = au.HirNode
    INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode 
    INNER JOIN dbo.FscPeriods fc WITH (NOLOCK) ON
    fc.FscPeriod = j.FscPeriod and fc.FscYear = j.FscYear
    INNER JOIN TeamFinv2..FscAccounts fa WITH (NOLOCK) ON
    fa.FscAccount = j.FscAccount
WHERE
 (CASE @NLevel 
	   WHEN 'ENT' THEN hn.HirNodLevel1
	   WHEN 'SVP' THEN hn.HirNodLevel2
	   WHEN 'DVP' THEN hn.HirNodLevel3
	   WHEN 'RVP' THEN hn.HirNodLevel4
	   WHEN 'SRM' THEN hn.HirNodLevel5
	   WHEN 'RM' THEN hn.HirNodLevel6
	   WHEN 'AM' THEN hn.HirNodLevel7
	   WHEN 'SiteName' THEN hn.HirNodLevel8
	   ELSE '' END) IN (@NName) AND
	   au.AppUniBrief IN (
		  SELECT HouseCode FROM #Hierarchy) AND
	-- 10/13/2015 modified to include prior year actual
    --j.FscYear = @NFscYear AND
    --fc.FscYear <= @CurrentYear AND
    --fc.FscPerTitle < @CurrentPerTitle 
	(
	(j.FscYear = @NFscYear AND
    fc.FscYear <= @CurrentYear AND
    fc.FscPerTitle < @CurrentPerTitle) 
OR 
    (j.FscYear = @NFscYear AND
	fc.FscYear < @CurrentYear)
    ) 
	--lam   
GROUP BY
    j.FscYear,
    j.HirNode,
    j.HcmJob,
    j.FscAccount
) ajc ON
w.HirNode =  ajc.HirNode AND w.FscYear = ajc.FscYear /*AND w.FscPeriod = ajc.FscPeriod*/ AND w.FscAccount = ajc.FscAccount AND w.HcmJob = ajc.HcmJob
--lam add end 04/01/2013
FULL OUTER JOIN
(
SELECT
    p.FscYear,
    p.FscAccount,
    p.HirNode,
    p.HcmJob,
    ISNULL(p.BudProdPeriod1,0) + ISNULL(p.BudProdPeriod2,0) + ISNULL(p.BudProdPeriod3,0) + ISNULL(p.BudProdPeriod4,0) + ISNULL(p.BudProdPeriod5,0) + 
    ISNULL(p.BudProdPeriod6,0) + ISNULL(p.BudProdPeriod7,0) + ISNULL(p.BudProdPeriod8,0) + ISNULL(p.BudProdPeriod9,0) + ISNULL(p.BudProdPeriod10,0) + 
    ISNULL(p.BudProdPeriod11,0) + ISNULL(p.BudProdPeriod12,0) + ISNULL(p.BudProdPeriod13,0) + ISNULL(p.BudProdPeriod14,0) AS ProdTotal
FROM
    TeamFinv2..BudProjectedDetails p WITH (NOLOCK)
    INNER JOIN Esmv2..AppUnits au WITH (NOLOCK) ON
    p.HirNode = au.HirNode
    INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode
WHERE
 (CASE @NLevel 
	   WHEN 'ENT' THEN hn.HirNodLevel1
	   WHEN 'SVP' THEN hn.HirNodLevel2
	   WHEN 'DVP' THEN hn.HirNodLevel3
	   WHEN 'RVP' THEN hn.HirNodLevel4
	   WHEN 'SRM' THEN hn.HirNodLevel5
	   WHEN 'RM' THEN hn.HirNodLevel6
	   WHEN 'AM' THEN hn.HirNodLevel7
	   WHEN 'SiteName' THEN hn.HirNodLevel8
	   ELSE '' END) IN (@NName) AND
	   au.AppUniBrief IN (
		  SELECT HouseCode FROM #Hierarchy) AND
    p.FscYear = @NFscYear
) tt ON
    w.HirNode =  tt.HirNode AND w.FscAccount = tt.FscAccount AND w.HcmJob = tt.HcmJob
    LEFT OUTER JOIN Esmv2.dbo.AppUnits au WITH (NOLOCK) ON
    au.HirNode = COALESCE(w.HirNode,b.HirNode,jc.HirNode,jp.HirNode,c.HirNode,bt.HirNode,pt.HirNode,tt.HirNode,ajc.HirNode)
    LEFT OUTER JOIN Esmv2.dbo.HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode
    INNER JOIN TeamFinv2..FscAccounts fa WITH (NOLOCK) ON
    fa.FscAccount = COALESCE(w.FscAccount,b.FscAccount,jc.FscAccount,jp.FscAccount,c.FscAccount,bt.FscAccount,pt.FscAccount,tt.FscAccount,ajc.FscAccount)
    INNER JOIN TeamFinv2..FscAccountCategories fc WITH (NOLOCK) ON
    fa.FscAccountCategory = fc.FscAccountCategory
WHERE w.FscPerTitle <= @FscPerTitle
GROUP BY
       hn.HirNodLevel8,
       au.AppUniBrief,
	   w.FscPeriod,
	   w.FscPerTitle

UNION

SELECT
    au.AppUniDescription AS SiteName,
    au.AppUniBrief AS HouseCode,
	hpt.FscPeriod AS Period,
	hpt.FscPerTitle AS PeriodTitle,
    0 AS MOPTotal,
    0 AS SumMOPTotal,
    0 AS BudgetTotal,
    0 AS SumBudgetTotal,
    0 AS CurrentActuals,
    0 AS SumCurrentActuals
FROM @HousePeriodTable hpt
INNER JOIN ESMv2.dbo.AppUnits au
ON au.HirNode = hpt.HirNode
) grp

GROUP BY
    grp.SiteName,
    grp.HouseCode,
	grp.Period,
	grp.PeriodTitle


DROP TABLE #Hierarchy
