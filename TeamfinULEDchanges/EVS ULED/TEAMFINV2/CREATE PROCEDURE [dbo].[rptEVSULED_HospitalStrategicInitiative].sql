USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[rptEVSULED_HospitalStrategicInitiative]    Script Date: 7/5/2018 12:08:45 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[rptEVSULED_HospitalStrategicInitiative]
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
SET @NFscYear = 7
SET @NLevel = 'SiteName'
SET @NUserID = 'compass-usa\MartiL04'
SET @NName = '11063 - San Joaquin Community Hospital PT'
*/

SET NOCOUNT ON
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED

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

SELECT au.AppUniBrief as AppUniBrief, 
       au.AppUniDescription as AppUniDescription,
	   au.HirNode as HirNode,
	   hcmsi.HcmEVSmsiHospitalIntiative as HospitalInitiative,
	   hcmsi.HcmEVSmsiExpectedOutcome as ExpectedOutcome,
	   hcmsi.HcmEVSmsiDepartmentIntiative as DepartmentIntiative
FROM TeamFinv2.dbo.HcmEVSMetrics hcm
INNER JOIN TeamFinv2.dbo.HcmEVSMetricStrategicInitiatives hcmsi
ON  hcmsi.HcmEVSMetric = hcm.HcmEVSMetric
INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc
ON hc.HcmHouseCode = hcm.HcmHouseCode
INNER JOIN ESMv2.dbo.AppUnits au
ON au.HirNode = hc.HirNode
INNER JOIN Esmv2..HirNodes hn
ON hn.HirNode = au.HirNode
WHERE hcm.FscYear = @NFscYear AND 
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


DROP TABLE #Hierarchy
