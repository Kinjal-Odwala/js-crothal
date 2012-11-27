TRUNCATE TABLE TeamFinV2..BudAdjustments
GO

INSERT INTO TeamFinV2..BudAdjustments
select  
	FY.FscYear,FA.FscAccount,hc.HcmHouseCode,1, MIN(BA.EnteredBy),MIN(BA.EnteredAt),
	Period1=ISNULL((SELECT Adjustment FROM TeamFin..BgtAdjustments iBA WHERE iBA.Housecode=BA.HouseCode 
		AND BA.AccountCode=iBA.AccountCode AND BA.FiscalYear=iBA.FiscalYear AND Period =1),0),
	Period2=ISNULL((SELECT Adjustment FROM TeamFin..BgtAdjustments iBA WHERE iBA.Housecode=BA.HouseCode 
		AND BA.AccountCode=iBA.AccountCode AND BA.FiscalYear=iBA.FiscalYear AND Period =2),0),
	Period3=ISNULL((SELECT Adjustment FROM TeamFin..BgtAdjustments iBA WHERE iBA.Housecode=BA.HouseCode 
		AND BA.AccountCode=iBA.AccountCode AND BA.FiscalYear=iBA.FiscalYear AND Period =3),0),
	Period4=ISNULL((SELECT Adjustment FROM TeamFin..BgtAdjustments iBA WHERE iBA.Housecode=BA.HouseCode 
		AND BA.AccountCode=iBA.AccountCode AND BA.FiscalYear=iBA.FiscalYear AND Period =4),0),
	Period5=ISNULL((SELECT Adjustment FROM TeamFin..BgtAdjustments iBA WHERE iBA.Housecode=BA.HouseCode 
		AND BA.AccountCode=iBA.AccountCode AND BA.FiscalYear=iBA.FiscalYear AND Period =5),0),
	Period6=ISNULL((SELECT Adjustment FROM TeamFin..BgtAdjustments iBA WHERE iBA.Housecode=BA.HouseCode 
		AND BA.AccountCode=iBA.AccountCode AND BA.FiscalYear=iBA.FiscalYear AND Period =6),0),
	Period7=ISNULL((SELECT Adjustment FROM TeamFin..BgtAdjustments iBA WHERE iBA.Housecode=BA.HouseCode 
		AND BA.AccountCode=iBA.AccountCode AND BA.FiscalYear=iBA.FiscalYear AND Period =7),0),
	Period8=ISNULL((SELECT Adjustment FROM TeamFin..BgtAdjustments iBA WHERE iBA.Housecode=BA.HouseCode 
		AND BA.AccountCode=iBA.AccountCode AND BA.FiscalYear=iBA.FiscalYear AND Period =8),0),
	Period9=ISNULL((SELECT Adjustment FROM TeamFin..BgtAdjustments iBA WHERE iBA.Housecode=BA.HouseCode 
		AND BA.AccountCode=iBA.AccountCode AND BA.FiscalYear=iBA.FiscalYear AND Period =9),0),
	Period10=ISNULL((SELECT Adjustment FROM TeamFin..BgtAdjustments iBA WHERE iBA.Housecode=BA.HouseCode 
		AND BA.AccountCode=iBA.AccountCode AND BA.FiscalYear=iBA.FiscalYear AND Period =10),0),
	Period11=ISNULL((SELECT Adjustment FROM TeamFin..BgtAdjustments iBA WHERE iBA.Housecode=BA.HouseCode 
		AND BA.AccountCode=iBA.AccountCode AND BA.FiscalYear=iBA.FiscalYear AND Period =11),0),
	Period12=ISNULL((SELECT Adjustment FROM TeamFin..BgtAdjustments iBA WHERE iBA.Housecode=BA.HouseCode 
		AND BA.AccountCode=iBA.AccountCode AND BA.FiscalYear=iBA.FiscalYear AND Period =12),0),
	Period13=ISNULL((SELECT Adjustment FROM TeamFin..BgtAdjustments iBA WHERE iBA.Housecode=BA.HouseCode 
		AND BA.AccountCode=iBA.AccountCode AND BA.FiscalYear=iBA.FiscalYear AND Period =13),0),
	0,0,0	
 from TeamFin..BgtAdjustments BA
 INNER JOIN TeamFinV2..FscYears FY ON FY.FscYeaTitle = BA.FiscalYear
 INNER JOIN TeamFinV2..FscAccounts FA ON FA.FscAccCode = BA.AccountCode
 INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = ba.HouseCode
INNER JOIN TeamFinV2..HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit
group by FY.FscYear,FA.FscAccount,HouseCode,BA.FiscalYear,BA.AccountCode,hc.hcmhousecode

