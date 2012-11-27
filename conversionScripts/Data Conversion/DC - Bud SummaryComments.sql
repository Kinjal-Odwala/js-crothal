TRUNCATE TABLE TeamFinV2..BudSummaryComments
GO

INSERT INTO TeamFinV2..BudSummaryComments
select
	FA.FscAccount,
	Comment,
	FY.FscYear,
	hc.HcmHouseCode,
	1,
	EnteredBy,
	EnteredAt
from teamfin..bgtsummarycomments SC
INNER JOIN TeamFinV2..FscAccounts FA ON FA.FscAccCode = SC.AccountCode
INNER JOIN TeamFinV2..FscYears FY ON FY.FscYeaTitle = SC.FiscalYear
INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = sc.HouseCode
	INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit