TRUNCATE TABLE TeamFinV2.[dbo].[BudStaffingHours]
GO
INSERT INTO TeamFinV2.[dbo].[BudStaffingHours]
	(HcmHouseCode, HcmJob, FscYear,
	BudStahUnit, BudShiftType, 
	BudStahCurrentSunday,
	BudStahCurrentMonday,
	BudStahCurrentTuesday,
	BudStahCurrentWednesday,
	BudStahCurrentThursday,
	BudStahCurrentFriday,
	BudStahCurrentSaturday,
	BudStahCurrentHolidays,
	BudStahProposedSunday,
	BudStahProposedMonday,
	BudStahProposedTuesday,
	BudStahProposedWednesday,
	BudStahProposedThursday,
	BudStahProposedFriday,
	BudStahProposedSaturday,
	BudStahProposedHolidays,
	BudStahModBy,
	BudStahModAt
	)
SELECT hc.HcmHouseCode, 1, fy.FscYear, Bu.title, bgtShiftType,
	CurrentSunday, CurrentMonday, CurrentTuesday, CurrentWednesday, 
	CurrentThursday, CurrentFriday, CurrentSaturday, CurrentHolidays,
	ProposedSunday, ProposedMonday, ProposedTuesday, ProposedWednesday, 
	ProposedThursday, ProposedFriday, ProposedSaturday, ProposedHolidays,
	sh.EnteredBy, sh.EnteredAt
	FROM TeamFin.dbo.bgtStaffingHours sh
	INNER JOIN TeamFinV2..FscYears fy ON fy.FscYeaTitle= sh.FISCALYEAR
	INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = sh.HouseCode
	INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit
	INNER JOIN TeamFin..bgtUnits BU ON BU.bgtUnit = sh.BgtUnit