USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[rptEVSULED_QAAuditScore]    Script Date: 7/16/2018 2:32:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[rptEVSULED_QAAuditScore]
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
SET @NFscYear = 8
SET @NLevel = 'SiteName'
SET @NUserID = 'compass-usa\MartiL04'
SET @NName = '11146 - Chippenham Hospital PT'
--'1991 Brookwood PT' 
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

CREATE TABLE #DATA (AppUniBrief VARCHAR(50),
							AppUniDescription VARCHAR(200),
							HirNode INT,
							AuditType varchar(20),
							--ProgramIntegrity DECIMAL(5,3),
							Standardization DECIMAL(5,3),
							OverallScore DECIMAL(5,3)
							  )
INSERT INTO #DATA (AppUniBrief,
							AppUniDescription,
							HirNode,
							AuditType,
							--ProgramIntegrity,
							Standardization ,
							OverallScore 
							  )
SELECT p.AppUniBrief, 
       p.AppUniDescription,
	   p.HirNode,
	   p.AuditType,
	  -- (Sum(p.ProgramIntegrity)/100) AS ProgramIntegrity,
	   (Sum(p.Standardization)/100) AS Standardization,
	   (Sum(p.OverallScore)/100) AS OverallScore
FROM (
SELECT au.AppUniBrief as AppUniBrief, 
       au.AppUniDescription as AppUniDescription,
	   au.HirNode as HirNode,
	   hcmmt.HcmEVSmtTitle as AuditScore,
	   hcmas.Detail as AuditPeriod,
	   Cast(SUBSTRING(hcmas.Detail,12, 7) as varchar) as AuditType,
	/*   Case When hcmmt.HcmEVSmtTitle = 'Program Integrity'
	        Then hcmas.AuditType 
			Else 0 
	   End as 'ProgramIntegrity',
	  */ Case When hcmmt.HcmEVSmtTitle = 'Standardization'
	        Then hcmas.AuditType 
			Else 0 
	   End as 'Standardization',
	   Case When hcmmt.HcmEVSmtTitle = 'Overall Score'
	        Then hcmas.AuditType 
			Else 0 
	   End as 'OverallScore'
FROM TeamFinv2.dbo.HcmEVSMetricAuditScores
Unpivot
(AuditType for Detail in (HcmEVSmasBiAnnual1, HcmEVSmasBiAnnual2)) hcmas
INNER JOIN TeamFinv2.dbo.HcmEVSMetrics hcm
ON hcmas.HcmEVSMetric = hcm.HcmEVSMetric
INNER JOIN TeamFinv2.dbo.HcmEVSMetricTypes hcmmt
ON hcmmt.HcmEVSMetricType = hcmas.HcmEVSMetricType
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
) p

GROUP BY
p.AppUniBrief, 
p.AppUniDescription,
p.HirNode,
p.AuditType

declare @annual1exists int
declare @annual2exists int

set @annual1exists = (select count(1) from #DATA where AuditType='Annual1')
set @annual2exists = (select count(1) from #DATA where AuditType='Annual2')

IF @annual1exists=0 and @annual2exists=1 insert into #data values ( '1','1',1,'Annual01',0,0)--,0) Program Integrity 
else if @annual1exists=1 and @annual2exists=0 insert into #data values ( '1','1',1,'Annual20',0,0)--,0) Program Integrity 
else if @annual1exists=0 and @annual2exists=0 
begin
 insert into #data values ( '1','1',1,'Annual20',0,0)--,0) Program Integrity
  insert into #data values ( '1','1',1,'Annual01',0,0)--,0) Program Integrity
end

SELECT * FROM #DATA order by AuditType

DROP TABLE #DATA
DROP TABLE #Hierarchy
