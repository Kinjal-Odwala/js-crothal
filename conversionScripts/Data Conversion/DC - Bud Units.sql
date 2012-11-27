INSERT INTO TeamFinv2.dbo.BudUnits

SELECT
	hc.HcmHouseCode,
	LEFT(bu.Title,16) AS BudUniBrief,
	bu.Title AS BudUniTitle,
	bu.Title AS BudUniDescription,
	1 AS BudUniDisplayOrder,
	1 AS BudUniActive,
	bu.EnteredBy AS BudUniModifiedBy,
	bu.EnteredAt AS BudUniModifiedAt
FROM 
	[TeamFin].[dbo].bgtUnits bu 
	INNER JOIN Esmv2.dbo.AppUnits au ON
	bu.HouseCode = CAST(au.AppUniBrief AS VARCHAR(10))
	INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc ON
	au.AppUnit = hc.AppUnit