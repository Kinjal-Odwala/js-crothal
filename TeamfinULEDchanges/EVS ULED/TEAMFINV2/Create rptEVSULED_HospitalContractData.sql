USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[rptEVSULED_HospitalContractData]    Script Date: 6/27/2018 3:18:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].rptEVSULED_HospitalContractData
(
	@NUserID varchar(50),
	@NLevel varchar(20),
	@NName varchar(8000),
	@NFscYear INT,
	@NFscPeriod INT
	--@NMetricSelection INT
)
AS
/*

Report Name:  TeamFin_EVS_ULED
Dataset:  HospitalContractData

Description
--------------------------------------------------------------------------------------------------------------------------------------------------------
This dataset is used to populate the Hospital and Contract Data Section of the EVS ULED report

Date		 Author				
---------------------------------------------------------------------------------------------------------------------------------------------------------
2018-06-27	Richa Khare		


DECLARE @NUserID VARCHAR(50)
DECLARE @NLevel VARCHAR(20)
DECLARE @NName VARCHAR(8000)
DECLARE @NFscYear INT
DECLARE @NFscPeriod INT
SET @NFscYear = 8
SET @NFscPeriod=93
SET @NLevel = 'SiteName'
SET @NUserID = 'compass-usa\MartiL04'
--SET @NName = '11063 - San Joaquin Community Hospital PT'
SET @NName = '1859 St Lukes Hospital'
--SET @NName = '1883 Akron General - PT'

*/


SET NOCOUNT ON
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED

DECLARE @StartDate datetime
DECLARE @EndDate datetime
DECLARE @NFscPeriodtitle int


SET @NFscPeriodtitle=(select FscPerTitle from fscperiods where FscPeriod=@NFscPeriod)

SET @StartDate = (select MIN([FscPerStartDate]) from [dbo].[FscPeriods] where [FscYear] = @NFscYear)
SET @EndDate = (select MAX([FscPerEndDate]) from [dbo].[FscPeriods] where [FscYear] = @NFscYear)
--Select @StartDate, @EndDate

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
--select * from @Hierarchy

/**Calculate business days base on fiscal year obtained from target date entered**/
DECLARE @YTDBusinessDays  INT
SET @YTDBusinessDays= (Select teamfinv2.dbo.fn_getBusinessDayCount( MIN(FscPerStartDate),MAX(FscPerEndDate)) from teamfinv2.dbo.FscPeriods
WHERE FscYear = @NFscYear
GROUP BY FscYear)


--Get # of Licensed beds
DECLARE @NumofLicensedBeds Int
SET @NumofLicensedBeds = 
(
SELECT CAST(
					  case when @NFscPeriodtitle=1 then hnm.HcmEVSmndPeriod1
						   when @NFscPeriodtitle=2 then hnm.HcmEVSmndPeriod2
						   when @NFscPeriodtitle=3 then hnm.HcmEVSmndPeriod3
						   when @NFscPeriodtitle=4 then hnm.HcmEVSmndPeriod4
						   when @NFscPeriodtitle=5 then hnm.HcmEVSmndPeriod5
						   when @NFscPeriodtitle=6 then hnm.HcmEVSmndPeriod6
						   when @NFscPeriodtitle=7 then hnm.HcmEVSmndPeriod7
						   when @NFscPeriodtitle=8 then hnm.HcmEVSmndPeriod8
						   when @NFscPeriodtitle=9 then hnm.HcmEVSmndPeriod9
						   when @NFscPeriodtitle=10 then hnm.HcmEVSmndPeriod10
						   when @NFscPeriodtitle=11 then hnm.HcmEVSmndPeriod11
						   when @NFscPeriodtitle=12 then hnm.HcmEVSmndPeriod12
						   when @NFscPeriodtitle=13 then hnm.HcmEVSmndPeriod12
					END as DECIMAL (18,2)) as NumofLicensedBeds
FROM TeamFinv2.dbo.HcmEVSMetrics hcm  INNER JOIN TeamFinv2.dbo.HcmEVSMetricTypes hcmt ON (HcmEVSmtSubType = 'EVS Statistics' And HcmEVSmtTitle ='# of Licensed Beds')
														INNER JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails hnm 
														ON (hcm.HcmEVSMetric=hnm.HcmEVSMetric and hnm.HcmEVSMetricType=hcmt.HcmEVSMetricType)
														INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc ON (hc.HcmHouseCode = hcm.HcmHouseCode)
														INNER JOIN ESMv2.dbo.AppUnits au ON au.HirNode = hc.HirNode
														INNER JOIN Esmv2..HirNodes hn ON hn.HirNode = au.HirNode
WHERE hcm.FscYear = @NFscYear
AND 
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
		  SELECT HouseCode FROM #Hierarchy)
)

--GET # of Staffed Beds

DECLARE @StaffedBeds Int
SET @StaffedBeds = 
(
SELECT CAST(
					  case when @NFscPeriodtitle=1 then hnm.HcmEVSmndPeriod1
						   when @NFscPeriodtitle=2 then hnm.HcmEVSmndPeriod2
						   when @NFscPeriodtitle=3 then hnm.HcmEVSmndPeriod3
						   when @NFscPeriodtitle=4 then hnm.HcmEVSmndPeriod4
						   when @NFscPeriodtitle=5 then hnm.HcmEVSmndPeriod5
						   when @NFscPeriodtitle=6 then hnm.HcmEVSmndPeriod6
						   when @NFscPeriodtitle=7 then hnm.HcmEVSmndPeriod7
						   when @NFscPeriodtitle=8 then hnm.HcmEVSmndPeriod8
						   when @NFscPeriodtitle=9 then hnm.HcmEVSmndPeriod9
						   when @NFscPeriodtitle=10 then hnm.HcmEVSmndPeriod10
						   when @NFscPeriodtitle=11 then hnm.HcmEVSmndPeriod11
						   when @NFscPeriodtitle=12 then hnm.HcmEVSmndPeriod12
						   when @NFscPeriodtitle=13 then hnm.HcmEVSmndPeriod12
					END as DECIMAL (18,2)) 
FROM TeamFinv2.dbo.HcmEVSMetrics hcm  INNER JOIN TeamFinv2.dbo.HcmEVSMetricTypes hcmt ON (HcmEVSmtSubType = 'EVS Statistics' And HcmEVSmtTitle = '# of Staffed Beds')
														INNER JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails hnm ON (hcm.HcmEVSMetric=hnm.HcmEVSMetric and hnm.HcmEVSMetricType=hcmt.HcmEVSMetricType)
														INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc ON (hc.HcmHouseCode = hcm.HcmHouseCode)
														INNER JOIN ESMv2.dbo.AppUnits au ON au.HirNode = hc.HirNode
														INNER JOIN Esmv2..HirNodes hn ON hn.HirNode = au.HirNode
WHERE hcm.FscYear = @NFscYear
AND 
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
		  SELECT HouseCode FROM #Hierarchy)
)


--GET AVERAGE DAILY CENSUS
DECLARE @AverageDailyCensus Int
SET @AverageDailyCensus = 
(
SELECT CAST(
					case when @NFscPeriodtitle=1 then hnm.HcmEVSmndPeriod1
						   when @NFscPeriodtitle=2 then hnm.HcmEVSmndPeriod2
						   when @NFscPeriodtitle=3 then hnm.HcmEVSmndPeriod3
						   when @NFscPeriodtitle=4 then hnm.HcmEVSmndPeriod4
						   when @NFscPeriodtitle=5 then hnm.HcmEVSmndPeriod5
						   when @NFscPeriodtitle=6 then hnm.HcmEVSmndPeriod6
						   when @NFscPeriodtitle=7 then hnm.HcmEVSmndPeriod7
						   when @NFscPeriodtitle=8 then hnm.HcmEVSmndPeriod8
						   when @NFscPeriodtitle=9 then hnm.HcmEVSmndPeriod9
						   when @NFscPeriodtitle=10 then hnm.HcmEVSmndPeriod10
						   when @NFscPeriodtitle=11 then hnm.HcmEVSmndPeriod11
						   when @NFscPeriodtitle=12 then hnm.HcmEVSmndPeriod12
						   when @NFscPeriodtitle=13 then hnm.HcmEVSmndPeriod12
					END as DECIMAL (18,2)) 
FROM TeamFinv2.dbo.HcmEVSMetrics hcm  INNER JOIN TeamFinv2.dbo.HcmEVSMetricTypes hcmt ON (HcmEVSmtSubType = 'EVS Statistics' And HcmEVSmtTitle = 'Average Daily Census')
														INNER JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails hnm ON (hcm.HcmEVSMetric=hnm.HcmEVSMetric and hnm.HcmEVSMetricType=hcmt.HcmEVSMetricType)
														INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc ON (hc.HcmHouseCode = hcm.HcmHouseCode)
														INNER JOIN ESMv2.dbo.AppUnits au ON au.HirNode = hc.HirNode
														INNER JOIN Esmv2..HirNodes hn ON hn.HirNode = au.HirNode
WHERE hcm.FscYear = @NFscYear
AND 
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
		  SELECT HouseCode FROM #Hierarchy)
)

--Get Annual Patient Days
DECLARE @AnnualPatientDays INT 
SET @AnnualPatientDays=
(
	SELECT
		(CAST( sum(num.NumofERVisits) as DECIMAL (18,2))) as AnnualPatientDays --* 12 ) as AnnualPatientDays
	FROM TeamFinv2.dbo.HcmEVSMetrics hcm 
	INNER JOIN TeamFinv2.dbo.HcmEVSMetricTypes hcmt
		ON (
				HcmEVSmtSubType = 'EVS Statistics'
				And HcmEVSmtTitle ='# of Patient Days'
			)
	INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc with (nolock)
		ON (hc.HcmHouseCode = hcm.HcmHouseCode)
	INNER JOIN ESMv2.dbo.AppUnits au with (nolock)
		ON au.HirNode = hc.HirNode
	INNER JOIN Esmv2..HirNodes hn with (nolock)
		ON hn.HirNode = au.HirNode
	LEFT OUTER JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
		Unpivot (
			NumofERVisits for Detail in (
				HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
				HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12
				)
			) as num
		ON (hcm.HcmEVSMetric = num.HcmEVSMetric and Cast(SUBSTRING(num.Detail,16, 2)as integer) = @NFscPeriodtitle 
			and num.HcmEVSMetricType=44 and hcm.FscYear=@NFscYear) 
		
	WHERE hcm.FscYear = @NFscYear
	AND 
	(
		CASE @NLevel 
			WHEN 'ENT' THEN hn.HirNodLevel1
			WHEN 'SVP' THEN hn.HirNodLevel2
			WHEN 'DVP' THEN hn.HirNodLevel3
			WHEN 'RVP' THEN hn.HirNodLevel4
			WHEN 'SRM' THEN hn.HirNodLevel5
			WHEN 'RM' THEN hn.HirNodLevel6
			WHEN 'AM' THEN hn.HirNodLevel7
			WHEN 'SiteName' THEN hn.HirNodLevel8
			ELSE ''
		END
	) IN (@NName)
	AND	au.AppUniBrief IN (SELECT HouseCode FROM #Hierarchy)
)


--Get Annual ERvisits
DECLARE @ERVisits INT 
SET @ERVisits=
(
	SELECT
		(CAST( sum(num.NumofERVisits) as DECIMAL (18,2)))as HcmEVS_ERVisits -- * 12 ) as HcmEVS_ERVisits
	FROM TeamFinv2.dbo.HcmEVSMetrics hcm 
	INNER JOIN TeamFinv2.dbo.HcmEVSMetricTypes hcmt
		ON (
				HcmEVSmtSubType = 'EVS Statistics'
				And HcmEVSmtTitle ='# of ER Visits'
			)
	INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc with (nolock)
		ON (hc.HcmHouseCode = hcm.HcmHouseCode)
	INNER JOIN ESMv2.dbo.AppUnits au with (nolock)
		ON au.HirNode = hc.HirNode
	INNER JOIN Esmv2..HirNodes hn with (nolock)
		ON hn.HirNode = au.HirNode
	LEFT OUTER JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
		Unpivot (
			NumofERVisits for Detail in (
				HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
				HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12
				)
			) as num
		ON (hcm.HcmEVSMetric = num.HcmEVSMetric and Cast(SUBSTRING(num.Detail,16, 2)as integer) = @NFscPeriodtitle 
			and num.HcmEVSMetricType=51 and hcm.FscYear=@NFscYear) 
		
	WHERE hcm.FscYear = @NFscYear
	AND 
	(
		CASE @NLevel 
			WHEN 'ENT' THEN hn.HirNodLevel1
			WHEN 'SVP' THEN hn.HirNodLevel2
			WHEN 'DVP' THEN hn.HirNodLevel3
			WHEN 'RVP' THEN hn.HirNodLevel4
			WHEN 'SRM' THEN hn.HirNodLevel5
			WHEN 'RM' THEN hn.HirNodLevel6
			WHEN 'AM' THEN hn.HirNodLevel7
			WHEN 'SiteName' THEN hn.HirNodLevel8
			ELSE ''
		END
	) IN (@NName)
	AND	au.AppUniBrief IN (SELECT HouseCode FROM #Hierarchy)
)


--Get Annual Discharges
DECLARE @AnnualDischarges INT 
SET @AnnualDischarges=
(
	SELECT
		(CAST( sum(num.NumofERVisits) as DECIMAL (18,2)) ) as AnnualDischarges -- * 12 ) as AnnualDischarges
	FROM TeamFinv2.dbo.HcmEVSMetrics hcm 
	INNER JOIN TeamFinv2.dbo.HcmEVSMetricTypes hcmt
		ON (
				HcmEVSmtSubType = 'EVS Statistics'
				And HcmEVSmtTitle ='# of Hospital Discharges'
			)
	INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc with (nolock)
		ON (hc.HcmHouseCode = hcm.HcmHouseCode)
	INNER JOIN ESMv2.dbo.AppUnits au with (nolock)
		ON au.HirNode = hc.HirNode
	INNER JOIN Esmv2..HirNodes hn with (nolock)
		ON hn.HirNode = au.HirNode
	LEFT OUTER JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
		Unpivot (
			NumofERVisits for Detail in (
				HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
				HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12
				)
			) as num
		ON (hcm.HcmEVSMetric = num.HcmEVSMetric and Cast(SUBSTRING(num.Detail,16, 2)as integer) = @NFscPeriodtitle 
		and num.HcmEVSMetricType=49 and hcm.FscYear=@NFscYear) 
		
	WHERE hcm.FscYear = @NFscYear
	AND 
	(
		CASE @NLevel 
			WHEN 'ENT' THEN hn.HirNodLevel1
			WHEN 'SVP' THEN hn.HirNodLevel2
			WHEN 'DVP' THEN hn.HirNodLevel3
			WHEN 'RVP' THEN hn.HirNodLevel4
			WHEN 'SRM' THEN hn.HirNodLevel5
			WHEN 'RM' THEN hn.HirNodLevel6
			WHEN 'AM' THEN hn.HirNodLevel7
			WHEN 'SiteName' THEN hn.HirNodLevel8
			ELSE ''
		END
	) IN (@NName)
	AND	au.AppUniBrief IN (SELECT HouseCode FROM #Hierarchy)
)

--Get Paid FTE Budgets
DECLARE @PaidFTEBudgets INT 
SET @PaidFTEBudgets=
(
	SELECT
		CAST(sum(ISNULL((num.BudgetedPaidTotalHours),0)) as DECIMAL (18,2)) as PaidFTEBudgets 
	FROM TeamFinv2.dbo.HcmEVSMetrics hcm 
	INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc with (nolock)
		ON (hc.HcmHouseCode = hcm.HcmHouseCode)
	INNER JOIN ESMv2.dbo.AppUnits au with (nolock)
		ON au.HirNode = hc.HirNode
	INNER JOIN Esmv2..HirNodes hn with (nolock)
		ON hn.HirNode = au.HirNode
	LEFT OUTER JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
		Unpivot (
			BudgetedPaidTotalHours for Detail in (
				HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
				HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12
				)
			) as num
		ON (hcm.HcmEVSMetric = num.HcmEVSMetric and Cast(SUBSTRING(num.Detail,16, 2)as integer) = @NFscPeriodtitle 
		and num.HcmEVSMetricType in (19,21,23) and hcm.FscYear=@NFscYear) 
		
	WHERE hcm.FscYear = @NFscYear
	AND 
	(
		CASE @NLevel 
			WHEN 'ENT' THEN hn.HirNodLevel1
			WHEN 'SVP' THEN hn.HirNodLevel2
			WHEN 'DVP' THEN hn.HirNodLevel3
			WHEN 'RVP' THEN hn.HirNodLevel4
			WHEN 'SRM' THEN hn.HirNodLevel5
			WHEN 'RM' THEN hn.HirNodLevel6
			WHEN 'AM' THEN hn.HirNodLevel7
			WHEN 'SiteName' THEN hn.HirNodLevel8
			ELSE ''
		END
	) IN (@NName)
	AND	au.AppUniBrief IN (SELECT HouseCode FROM #Hierarchy)
)


--Get Productive FTE Budgets
DECLARE @ProductiveFTEBudgets INT 
SET @ProductiveFTEBudgets=
(
	SELECT
		CAST(sum(ISNULL((num.BudgetedProductiveHours),0)) as DECIMAL (18,2)) as ProductiveFTEBudgets
	FROM TeamFinv2.dbo.HcmEVSMetrics hcm 
	INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc with (nolock)
		ON (hc.HcmHouseCode = hcm.HcmHouseCode)
	INNER JOIN ESMv2.dbo.AppUnits au with (nolock)
		ON au.HirNode = hc.HirNode
	INNER JOIN Esmv2..HirNodes hn with (nolock)
		ON hn.HirNode = au.HirNode
	LEFT OUTER JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
		Unpivot (
			BudgetedProductiveHours for Detail in (
				HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
				HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12
				)
			) as num
		ON (hcm.HcmEVSMetric = num.HcmEVSMetric and Cast(SUBSTRING(num.Detail,16, 2)as integer) = @NFscPeriodtitle 
		and num.HcmEVSMetricType in (19,21) and hcm.FscYear=@NFscYear) 
		
	WHERE hcm.FscYear = @NFscYear
	AND 
	(
		CASE @NLevel 
			WHEN 'ENT' THEN hn.HirNodLevel1
			WHEN 'SVP' THEN hn.HirNodLevel2
			WHEN 'DVP' THEN hn.HirNodLevel3
			WHEN 'RVP' THEN hn.HirNodLevel4
			WHEN 'SRM' THEN hn.HirNodLevel5
			WHEN 'RM' THEN hn.HirNodLevel6
			WHEN 'AM' THEN hn.HirNodLevel7
			WHEN 'SiteName' THEN hn.HirNodLevel8
			ELSE ''
		END
	) IN (@NName)
	AND	au.AppUniBrief IN (SELECT HouseCode FROM #Hierarchy)
)


SELECT
	au.AppUniBrief, 
	au.AppUniDescription,
	au.HirNode,
	hc.HcmHoucClientFirstName,
	hc.HcmHoucClientLastName,
	hc.HcmHoucClientTitle,
	hcm.HcmEVSmChiefNursingOfficer,
	hcm.HcmEVSmChiefFinancialOfficer,
	hcm.HcmEVSmChiefOperatingOfficer,
	hcm.HcmEVSmChiefExecutiveOfficer,
	ISNULL(@NumofLicensedBeds,0) HcmHoucBedsLicensed,--hc.HcmHoucBedsLicensed,
	ISNULL(@StaffedBeds,0) HcmHoucBedsActive, --hc.HcmHoucBedsActive,
	ISNULL(@AverageDailyCensus,0) HcmHoucAverageDailyCensus,--hc.HcmHoucAverageDailyCensus,
	@AnnualPatientDays as HcmHoucPatientDays,
	@ERVisits as AnnualEmergencyRoomVisits,
	@AnnualDischarges as HcmHoucAnnualDischarges,
	hc.HcmHoucAnnualTransfers,
	hcm.HcmEVSmContractStartDate,
	hcm.HcmEVSmContractRenewalDate,
	hcm.HcmEVSmCPIDueDate,
	hcm.HcmEVSmCPICap,
	cast(@PaidFTEBudgets*12/(52*CAST(ISNULL(HcmEvsmEmployeeProductiveHoursPerWeekStandard,1) AS DECIMAL(18,2))) as decimal(18,2)) as FTEBudget,
	cast(@ProductiveFTEBudgets*12/(52*CAST(ISNULL(HcmEvsmEmployeeProductiveHoursPerWeekStandard,1) AS DECIMAL(18,2))) as decimal(18,2)) as ProductiveFTEBudgets,
	HcmEVSmHourlyFTEVacancies AS HourlyFTEVacancies,
	hcm.HcmEVSmFullTimePartTimeRatio,
	hcm.HcmEVSmBudgetedProductivity,
	CASE WHEN ISNULL([HcmEVSmServiceLinePT],'') <> '' 
		THEN 'PT:' + [HcmEVSmServiceLinePT] + '; ' 
		ELSE ''
	END +
	CASE WHEN ISNULL([HcmEVSmServiceLineLaundry], '') <> ''
		THEN 'Laundry:' + [HcmEVSmServiceLineLaundry] + '; '
		ELSE ''
	END +
	CASE WHEN ISNULL([HcmEVSmServiceLinePOM], '') <> '' 
		THEN 'POM:' + [HcmEVSmServiceLinePOM] + '; ' 
		ELSE ''
	END +
	CASE WHEN ISNULL([HcmEVSmServiceLineCES], '') <> ''
		THEN 'CES:' + [HcmEVSmServiceLineCES] + '; ' 
		ELSE ''
	END
	as CompetitionInHouseServiceLine
FROM ESMv2.dbo.AppUnits au
INNER JOIN Esmv2..HirNodes hn
	ON au.HirNode = hn.HirNode
inner join TeamFinv2.dbo.HcmHouseCodes hc
	ON hc.HirNode = au.HirNode
inner join TeamFinv2.dbo.HcmServiceLines hcs
	ON hcs.HcmServiceLine = hc.HcmServiceLine
left outer join TeamFinv2.dbo.HcmEVSMetrics hcm
	ON hcm.HcmHouseCode = hc.HcmHouseCode
WHERE hcm.FscYear = @NFscYear
	AND 
		(
			CASE @NLevel 
				WHEN 'ENT' THEN hn.HirNodLevel1
				WHEN 'SVP' THEN hn.HirNodLevel2
				WHEN 'DVP' THEN hn.HirNodLevel3
				WHEN 'RVP' THEN hn.HirNodLevel4
				WHEN 'SRM' THEN hn.HirNodLevel5
				WHEN 'RM' THEN hn.HirNodLevel6
				WHEN 'AM' THEN hn.HirNodLevel7
				WHEN 'SiteName' THEN hn.HirNodLevel8
				ELSE ''
			END
		) IN (@NName)
		AND au.AppUniBrief IN (SELECT HouseCode FROM #Hierarchy)

DROP TABLE #Hierarchy
