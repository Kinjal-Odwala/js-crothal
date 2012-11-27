/*
Truncate Table ESmv2_DC.dbo.AppSites
Truncate Table ESmv2_DC.dbo.AppUnits
Truncate Table ESmv2_DC.dbo.AppSiteUnits
Truncate Table TeamFinv2_DC.dbo.FscJdeCompanies
Truncate Table TeamFinv2_DC.dbo.HCMHouseCodes
Truncate Table TeamFinv2_DC.dbo.HcmHouseCodeServices

Select * From ESmv2_DC.dbo.AppSites
Select * From ESmv2_DC.dbo.AppUnits
Select * From ESmv2_DC.dbo.AppSiteUnits
Select * From TeamFinv2_DC.dbo.FscJdeCompanies
Select * From Teamfinv2_DC.dbo.HcmHouseCodes
Select * From TeamFinv2_DC.dbo.HcmHouseCodeServices
*/

-- Pre-Condition, all types table should be available
-- Estimated Time 25 Sec

Set XACT_ABORT On
Set NoCount On

Declare 
	@RollupNum varchar(50), @RMEmail varchar(50), @RVPEmail varchar(50), @ServiceProvided varchar(50)
	, @TeamChimesAcct bit, @ClientType varchar(50), @StartDate datetime
	, @PriStreet1 varchar(50), @PriStreet2 varchar(50), @PriCity varchar(50)
	, @PriState varchar(50), @PriZip varchar(15)
	, @SecStreet1 varchar(50), @SecStreet2 varchar(50), @SecCity varchar(50)
	, @SecState varchar(50), @SecZip varchar(15), @BankFax varchar(20)
	, @CrothallCo varchar(50), @StartingInvoiceNum varchar(1), @ContractType varchar(50), @TermsOfContract varchar(50)
	, @PercentTax decimal, @CurExchRate decimal, @ExchRateAsOf datetime, @BankCode varchar(50), @BankAcctNum varchar(50)
	, @BankName varchar(50), @BankContact varchar(50), @BankStreet1 varchar(50), @BankStreet2 varchar(50)
	, @BankCity varchar(50), @BankState varchar(50), @BankZip varchar(15), @BankPhone varchar(50), @BankEmail varchar(50)
	, @ManagerName varchar(50), @ManagerEmail varchar(50), @ManagerPhone varchar(50), @ManagerFax varchar(50)
	, @NumManagedEmployees int, @NumCrothallEmployees int, @NumBeds int, @NumOccupiedBeds int
	, @NumCleanSqrFt int, @PayTo varchar(100), @PaytoStreet1 varchar(50), @PayToStreet2 varchar(50)
	, @PayToCity varchar(50), @PayToState varchar(50), @PayToZip varchar(15), @HouseCodeType as varchar(10)
	, @PayrollCycle varchar(50), @PayrollProcessing varchar(50), @BillingFreq varchar(50), @NumLaundrylbs decimal
	, @NumTransportRuns int, @WeeklyFTECap int, @TimeAndAttendance int, @DefaultLunchBreak decimal
	, @LunchBreakTrigger decimal, @TFUser varchar(50), @EnteredAt datetime, @Site varchar(100), @Company varchar(10), @Housecode varchar(5), @LocType varchar(50), @Profit varchar(50)
	, @Owner varchar(50), @Pribus varchar(50), @Trauma varchar, @GPO varchar(50), @GPOWrite varchar(50), @MasterSite bit
	, @EVS bit, @PT bit, @Linen bit, @bActive bit, @Ltmaint bit, @POM bit, @CAM bit, @Security bit, @HRC bit, @Biomed bit
	, @Dist bit, @Grounds bit, @Sterile bit, @Mail bit, @CleanRm bit, @Construction bit
	, @MgrFirstName varchar(50), @MgrLastName varchar(50), @ManagerCell varchar(50), @ManagerPager varchar(50), @MgrAsstName varchar(50)
	, @MgrAsstPhone varchar(50), @ClientFName varchar(50), @ClientLName varchar(50), @ClientPhone varchar(50), @ClientFax varchar(50)
	, @ClientAsstNme varchar(50), @ClientAsstPh varchar(50), @ClientTitle varchar(50)
	, @County varchar(50), @MasterSiteNum varchar(50), @Laundry bit, @EnforceLaborControl bit, @LaborServiceType varchar(1)
	, @NumLicBeds int, @NumPtDays int, @NumAdjPtDays int,@RoundingTimePeriod varchar(20), @NumDischarges int, @NumTransfers int, @TurnAroundTime int
	, @Id Int, @MaxId Int, @HcmHouseCode Int, @AppSite Int, @HirNode Int

-- Insert the unique JDE Companies before inserting housecodes
Insert Into [TeamFinV2_DC].[dbo].[FscJdeCompanies]
	( FscPattern
	, FscJDEcBrief
	, FscJDEcTitle
	, FscJDEcDisplayOrder
	, FscJDEcActive
	, FscJDEcModBy
	, FscJDEcModAt
	)
Select Distinct
	 1
	, Company
	, Company
	, 0
	, 1
	, 'Persistech\Data Conversion'
	, GetDate()	
From TeamFin.dbo.SiteSetup

Select @Id = Min(Id), @MaxId = Max(Id) From TeamFin.dbo.SiteSetup

While 1=1
Begin

	Select @RollupNum = RollupNum, @RMEmail = RMEmail, @RVPEmail = RVPEmail
		, @ServiceProvided = ServiceProvided, @TeamChimesAcct = TeamChimesAcct
		, @ClientType = ClientType, @StartDate = StartDate
		, @PriStreet1 = PriStreet1, @PriStreet2 = PriStreet2, @PriCity = PriCity
		, @PriState = PriState, @PriZip = PriZip
		, @SecStreet1 = SecStreet1, @SecStreet2 = SecStreet2, @SecCity = SecCity
		, @SecState = SecState, @SecZip = SecZip
		, @CrothallCo = CrothallCo, @StartingInvoiceNum = StartingInvoiceNum, @ContractType = ContractType
		, @TermsOfContract = TermsOfContract
		, @PercentTax = PercentTax, @CurExchRate = CurExchRate, @ExchRateAsOf = ExchRateAsOf, @BankCode = BankCode
		, @BankAcctNum = BankAcctNum, @RoundingTimePeriod = RoundingTimePeriod
		, @BankName = BankName, @BankContact = BankContact, @BankStreet1 = BankStreet1, @BankStreet2 = BankStreet2
		, @BankCity = BankCity, @BankState = BankState, @BankZip = BankZip, @BankPhone = BankPhone, @BankEmail = BankEmail
		, @ManagerName = ManagerName, @ManagerEmail = ManagerEmail, @ManagerPhone = ManagerPhone, @ManagerFax = ManagerFax
		, @NumManagedEmployees = NumManagedEmployees, @NumCrothallEmployees = NumCrothallEmployees, @NumBeds = NumBeds
		, @NumOccupiedBeds = NumOccupiedBeds
		, @NumCleanSqrFt = NumCleanSqrFt, @PayTo = PayTo, @PaytoStreet1 = PaytoStreet1, @PayToStreet2 = PayToStreet2
		, @PayToCity = PayToCity, @PayToState = PayToState, @PayToZip = PayToZip
		, @PayrollCycle = PayrollCycle, @PayrollProcessing = PayrollProcessing, @BillingFreq = BillingFreq
		, @NumLaundrylbs = NumLaundrylbs, @ClientTitle = ClientTitle
		, @NumTransportRuns = NumTransportRuns--, @WeeklyFTECap = WeeklyFTECap
		, @TimeAndAttendance = TimeAndAttendance
		, @DefaultLunchBreak = DefaultLunchBreak
		, @LunchBreakTrigger = LunchBreakTrigger, @TfUser = TfUser, @EnteredAt = EnteredAt
		, @Site = Site, @Company = Company, @Housecode = Housecode, @LocType = LocType
		, @Profit= Profit, @HouseCodeType = HouseCodeType
		, @Owner = Owner, @Pribus = Pribus, @Trauma = Trauma, @GPO = GPO, @GPOWrite = GPOWrite, @MasterSite = MasterSite
		, @EVS = EVS, @PT = pt, @Linen = Linen, @bActive = bActive, @Ltmaint = Ltmaint, @POM = POM, @CAM = CAM, @Security = [Security]
		, @HRC = HRC, @Biomed = Biomed
		, @Dist = Dist, @Grounds = Grounds, @Sterile = Sterile, @Mail = Mail, @CleanRm = CleanRm, @Construction = Construction
		, @MgrFirstName = MgrFirstName, @MgrLastName = MgrLastName, @ManagerCell = ManagerCell
		, @ManagerPager = ManagerPager, @MgrAsstName = MgrAsstName
		, @MgrAsstPhone = MgrAsstPhone, @ClientFName = ClientFName, @ClientLName = ClientLName, @ClientPhone = ClientPhone
		, @ClientFax = ClientFax, @ClientAsstNme = ClientAsstNme, @ClientAsstPh = ClientAsstPh
		, @County = County, @MasterSiteNum = MasterSiteNum, @Laundry = Laundry, @EnforceLaborControl = EnforceLaborControl
		, @LaborServiceType = LaborServiceType
		, @NumLicBeds = NumLicBeds, @NumPtDays = NumPtDays, @NumAdjPtDays = NumAdjPtDays, @NumDischarges = NumDischarges
		, @NumTransfers = NumTransfers, @TurnAroundTime = TurnAroundTime
	From TeamFin.dbo.SiteSetup
	Where Id = @Id

	If @@RowCount > 0
	Begin
		Begin Transaction

		Declare @HcmIndustryType int
		   , @HcmLocationType int
		   , @HcmProfitType int
		   , @HcmOwnershipType int
		   , @HcmPrimaryBusinessType int
		   , @HcmTraumaType int
		   , @HcmGPOType int
		   , @HcmStateType int

		Select @HcmIndustryType = IsNull(Max(AppIndustryType), 0) 
		From ESMV2_DC.[dbo].AppIndustryTypes Where AppIndtTitle = ''

		Select @HcmLocationType = IsNull(Max(AppLocationType), 0) 
		From ESMV2_DC.[dbo].AppLocationTypes Where ApploctTitle = @LocType

		Select @HcmProfitType = IsNull(Max(AppProfitDesignationType), 0) 
		From ESMV2_DC.[dbo].AppProfitDesignationTypes Where AppProdtTitle = @Profit

		Select @HcmOwnershipType = IsNull(Max(AppOwnershipType), 0) 
		From ESMV2_DC.[dbo].AppOwnershipTypes Where AppOwntTitle = @Owner

		Select @HcmPrimaryBusinessType = IsNull(Max(AppPrimaryBusinessType), 0) 
		From ESMV2_DC.[dbo].AppPrimaryBusinessTypes Where AppPribtTitle = @PriBus

		Select @HcmTraumaType = IsNull(Max(AppTraumaLevelType), 0) 
		From ESMV2_DC.[dbo].AppTraumaLevelTypes Where AppTraltTitle = @Trauma

		Select @HcmGPOType = IsNull(Max(AppGPOType), 0) 
		From ESMV2_DC.[dbo].AppGPOTypes Where AppGpotTitle = @GPO

		Select @HcmStateType = IsNull(Max(AppStateType), 0) 
		From ESMV2_DC.[dbo].AppStateTypes Where AppStatBrief = @PriState

		Insert Into [ESMv2_DC].[dbo].[AppSites]
		   ( AppSitTitle
		   , [AppSitAddressLine1]
		   , [AppSitAddressLine2]
		   , [AppSitCity]
		   , [AppStateType]
		   , [AppSitPostalCode]
		   , [AppSitCounty]
		   , [AppIndustryType]
		   , [AppPrimaryBusinessType]
		   , [AppLocationType]
		   , [AppTraumaLevelType]
		   , [AppProfitDesignationType]
		   , [AppGPOType]
		   , [AppSitSpecifyGPO]
		   , [AppOwnershipType]
		   , [AppSitActive]
		   , [AppSitCrtdBy]
		   , [AppSitCrtdAt]
		   , [AppSitModBy]
		   , [AppSitModAt]
		   , [AppSitVersion])
		 Values
		   ( @Site
		   , IsNull(@PriStreet1,'')
		   , IsNull(@PriStreet2,'')
		   , IsNull(@PriCity,'')
		   , IsNull(@HcmStateType,0)
		   , IsNull(@PriZip,'')
		   , IsNull(@County,'')
		   , IsNull(@HcmIndustryType,0)
		   , IsNull(@HcmPrimaryBusinessType,0)
		   , IsNull(@HcmLocationType,0)
		   , IsNull(@HcmTraumaType,0)
		   , IsNull(@HcmProfitType,0)
		   , IsNull(@HcmGPOType,0)
		   , IsNull(@GpoWrite,0)
		   , @HcmOwnershipType
		   , @bActive -- Active
		   , @TfUser --'Persistech\Data Conversion'
		   , @EnteredAt --Getdate()
		   , @TfUser --'Persistech\Data Conversion'
		   , @EnteredAt --Getdate()
		   , 1 -- Version
		   )

		Select @HirNode = HirNode From ESMV2_DC.dbo.HirNodes Where HirNodBrief = @HouseCode

		Insert Into [ESMV2_DC].[dbo].[AppUnits]
			( [HirNode]
			, [AppUniBrief]
			, [AppUniTitle]
			, [AppUniDescription]
			, [AppUniDisplayOrder]
			, [AppUniActive]
			, [AppUniModBy]
			, [AppUniModAt]
			)
		 Values
			( @HirNode -- HirNode
			, @HouseCode
			, @Housecode
			, @Site
			, 0 -- DisplayOrder
			, @bActive -- Active
			, @TfUser --'Persistech\Data Conversion'
			, @EnteredAt --Getdate()
			)

		Declare @AppUnit int
			, @HcmShippingStateType int
			, @HcmBillingFrequencyType int
			, @HcmLaborTrackingType int
			, @HcmPayrollProcessType int
			, @HcmHouseCodeType int
			, @HcmContractType int
			, @HcmBankStateType int
			, @HcmContractTermsType int
			, @FscJdeCompany int
			, @HcmRemitToLocation int

		Select @FscJdeCompany = IsNull(Max(FscJdeCompany), 0) 
		From [TeamFinV2_DC].[dbo].[FscJdeCompanies] Where [FscJdecTitle] = @Company

		Select @AppUnit = IsNull(Max([AppUnit]), 0) 
		From [ESMV2_DC].[dbo].[AppUnits] Where [AppUniTitle] = @HouseCode

		Select @HcmShippingStateType = IsNull(Max(AppStateType), 0) 
		From ESMV2_DC.[dbo].AppStateTypes Where AppStatBrief = @SecState

		Select @HcmBillingFrequencyType = IsNull(Max(PayPayFrequencyType), 0) 
		From [TeamFinV2_DC].[dbo].PayPayFrequencyTypes Where PayPayftTitle = @BillingFreq

		Select @HcmPayrollProcessType = IsNull(Max(HcmPayrollProcessingLocationType), 0) 
		From [TeamFinV2_DC].[dbo].HcmPayrollProcessingLocationTypes Where HcmPaypltTitle = @PayrollProcessing

		Select @HcmShippingStateType = IsNull(Max(AppStateType), 0) 
		From [ESMV2_DC].[dbo].AppStateTypes Where AppStatBrief = @SecState

		Select @HcmBankStateType = IsNull(Max(AppStateType), 0) 
		From [ESMV2_DC].[dbo].AppStateTypes Where AppStatBrief = @BankState

		Select @HcmContractType = IsNull(Max(HcmContractType), 0) 
		From [TeamFinV2_DC].[dbo].HcmContractTypes Where HcmContTitle = @ContractType

		Select @HcmBillingFrequencyType = IsNull(Max(HcmBillingCycleFrequencyType), 0) 
		From [TeamFinV2_DC].[dbo].HcmBillingCycleFrequencyTypes Where HcmBilcftTitle = @BillingFreq

		Select @HcmContractTermsType = IsNull(Max(HcmContractType), 0) 
		From [TeamFinV2_DC].[dbo].HcmContractTypes Where HcmContTitle = @ContractType

		--Select @HcmLaborTrackingType = IsNull(Max(HcmLaborTrackingType), 0) 
		--From [TeamFinV2_DC].[dbo].HcmLaborTrackingTypes Where HcmLabttTitle = @LaborServiceType

		Select @HcmHouseCodeType = IsNull(Max(HcmHouseCodeType), 0) 
		From [TeamFinV2_DC].[dbo].HcmHouseCodeTypes Where HcmHouctTitle = @HouseCodeType

		Select @HcmRemitToLocation = IsNull(Max(HcmRemitToLocation), 0) 
		From [TeamFinV2_DC].[dbo].HcmRemitToLocations Where HcmRemtlTitle = @PayTo

		Insert Into [TeamFinv2_DC].[dbo].[HcmHouseCodes]
			( [AppUnit]
			, [FscJDECompany]
			, [HcmHoucStartDate]
			, [HcmServiceType]
			, [HcmHoucEnforceLaborControl]
			, [HcmHoucManagerName]
			, [HcmHoucManagerPhone]
			, [HcmHoucManagerCellPhone]
			, [HcmHoucManagerFax]
			, [HcmHoucManagerPager]
			, [HcmHoucManagerAssistantName]
			, [HcmHoucManagerAssistantPhone]
			, [HcmHoucClientFirstName]
			, [HcmHoucClientLastName]
			, [HcmHoucClientTitle]
			, [HcmHoucClientPhone]
			, [HcmHoucClientFax]
			, [HcmHoucClientAssistantName]
			, [HcmHoucClientAssistantPhone]
			, [HcmHoucManagedEmployees]
			, [HcmHoucBedsLicensed]
			, [HcmHoucPatientDays]
			, [HcmHoucAverageDailyCensus]
			, [HcmHoucAnnualDischarges]
			, [HcmHoucAverageBedTurnaroundTime]
			, [HcmHoucNetCleanableSqft]
			, [HcmHoucAverageLaundryLbs]
			, [HcmHoucCrothallEmployees]
			, [HcmHoucBedsActive]
			, [HcmHoucAdjustedPatientDaysBudgeted]
			, [HcmHoucAnnualTransfers]
			, [HcmHoucAnnualTransports]
			, [HcmHoucShippingAddress1]
			, [HcmHoucShippingAddress2]
			, [HcmHoucShippingCity]
			, [HcmHoucShippingState]
			, [HcmHoucShippingZip]
			, [HcmRemitToLocation]
			, [HcmContractType]
			, [HcmBillingCycleFrequencyType]
			, [HcmHoucBankCodeNumber]
			, [HcmHoucBankAccountNumber]
			, [HcmHoucBankName]
			, [HcmHoucBankContact]
			, [HcmHoucBankAddress1]
			, [HcmHoucBankAddress2]
			, [HcmHoucBankCity]
			, [HcmHoucBankState]
			, [HcmHoucBankZip]
			, [HcmHoucBankPhone]
			, [HcmHoucBankFax]
			, [HcmHoucBankEmail]
			, [HcmHoucStateTaxPercent]
			, [HcmHoucLocalTaxPercent]
			, [HcmPayrollProcessingLocationType]
			, [HcmHoucDefaultLunchBreak]
			, [HcmHoucLunchBreakTrigger]
			, [HcmHouseCodeType]
			, [HcmLaborTrackingType]
			, [HcmHoucRoundingTimePeriod]
			, [HcmHoucModBy]
			, [HcmHoucModAt]
			)
		 Values
			( @AppUnit
			, @FscJdeCompany -- JDE CompanyId
			, @StartDate
			, @HcmLaborTrackingType
			, @EnforceLaborControl
			, @ManagerName
			, @ManagerPhone
			, @ManagerCell
			, @ManagerFax
			, @ManagerPager
			, @MgrAsstName
			, @MgrAsstPhone
			, @ClientFName
			, @ClientLName
			, @ClientTitle
			, @ClientPhone
			, @ClientFax
			, @ClientAsstNme
			, @ClientAsstPh
			, @NumManagedEmployees
			, @NumLicBeds
			, @NumPtDays
			, @NumOccupiedBeds --[HcmHoucAverageDailyCensus]
			, @NumDischarges
			, @TurnAroundTime
			, @NumCleanSqrFt
			, @NumLaundryLbs
			, @NumCrothallEmployees
			, @bActive
			, @NumAdjPtDays
			, @NumTransfers
			, @NumTransportRuns
			, @SecStreet1
			, @SecStreet2
			, @SecCity
			, @HcmShippingStateType
			, @SecZip
			, @HcmRemitToLocation
			, @HcmContractType
			, @HcmBillingFrequencyType
			, @BankCode
			, @BankAcctNum
			, @BankName
			, @BankContact
			, @BankStreet1
			, @BankStreet2
			, @BankCity
			, @HcmBankStateType
			, @BankZip
			, @BankPhone
			, @BankFax
			, @BankEmail
			, @PercentTax -- StateTaxPercent
			, @PercentTax -- LocalTax
			, @HcmPayrollProcessType
			, @DefaultLunchBreak
			, @LunchBreakTrigger
			, @HcmHouseCodeType
			, Null -- HcmLaborTrackingType
			, Replace(@RoundingTimePeriod, 'm', '')
			, @TfUser -- 'Persistech\Data Conversion'
			, @EnteredAt -- Getdate()
			)

		Select @HcmHouseCode = Max(HcmHouseCode) From [TeamFinV2_DC].[dbo].[HcmHouseCodes]

		/*
		@MasterSite bit
		@MasterSiteNum bit
		1 Biomedical Engg @Biomed
		2 CAM @CAM
		3 Central Distn @Dist
		4 Clean Room @CleanRm
		5 Construction @Construction
		6 EVS @EVS
		7 HRC @HRC
		8 Laundry
		9 Light Maint @Ltmaint
		10 Linen Distn @Linen
		11 Mail Room @Mail
		12 Patient Trans @PT
		13 POM @POM
		14 Security @Security	
		*/

		If @Biomed = 1
			Insert Into TeamFinv2_DC.dbo.HcmHouseCodeServices (HcmHouseCode, HcmServiceType, HcmHoucsModBy, HcmHoucsModAt)
			Values(@HcmHouseCode, 1, IsNull(@TfUser, 'Persistech\Data Conversion'), IsNull(@EnteredAt, GetDate()))

		If @CAM = 1
			Insert Into TeamFinv2_DC.dbo.HcmHouseCodeServices (HcmHouseCode, HcmServiceType, HcmHoucsModBy, HcmHoucsModAt)
			Values(@HcmHouseCode, 2, IsNull(@TfUser, 'Persistech\Data Conversion'), IsNull(@EnteredAt, GetDate()))

		If @Dist = 1
			Insert Into TeamFinv2_DC.dbo.HcmHouseCodeServices (HcmHouseCode, HcmServiceType, HcmHoucsModBy, HcmHoucsModAt)
				Values(@HcmHouseCode, 3, IsNull(@TfUser, 'Persistech\Data Conversion'), IsNull(@EnteredAt, GetDate()))

		If @CleanRm = 1
			Insert Into TeamFinv2_DC.dbo.HcmHouseCodeServices (HcmHouseCode, HcmServiceType, HcmHoucsModBy, HcmHoucsModAt)
			Values(@HcmHouseCode, 4, IsNull(@TfUser, 'Persistech\Data Conversion'), IsNull(@EnteredAt, GetDate()))

		If @Construction = 1
			Insert Into TeamFinv2_DC.dbo.HcmHouseCodeServices (HcmHouseCode, HcmServiceType, HcmHoucsModBy, HcmHoucsModAt)
			Values(@HcmHouseCode, 5, IsNull(@TfUser, 'Persistech\Data Conversion'), IsNull(@EnteredAt, GetDate()))

		If @EVS = 1
			Insert Into TeamFinv2_DC.dbo.HcmHouseCodeServices (HcmHouseCode, HcmServiceType, HcmHoucsModBy, HcmHoucsModAt)
			Values(@HcmHouseCode, 6, IsNull(@TfUser, 'Persistech\Data Conversion'), IsNull(@EnteredAt, GetDate()))

		If @HRC = 1
			Insert Into TeamFinv2_DC.dbo.HcmHouseCodeServices (HcmHouseCode, HcmServiceType, HcmHoucsModBy, HcmHoucsModAt)
			Values(@HcmHouseCode, 7, IsNull(@TfUser, 'Persistech\Data Conversion'), IsNull(@EnteredAt, GetDate()))

		/*If @Laundry = true
			Insert Into TeamFinv2_DC.dbo.HcmHouseCodeServices (HcmHouseCode, HcmServiceType, HcmHoucsModBy, HcmHoucsModAt)
			Values(@HcmHouseCode, 8, IsNull(@TfUser, 'Persistech\Data Conversion'), Isnull(@EnteredAt, GetDate()))
	    */
		If @Ltmaint = 1
			Insert Into TeamFinv2_DC.dbo.HcmHouseCodeServices (HcmHouseCode, HcmServiceType, HcmHoucsModBy, HcmHoucsModAt)
			Values(@HcmHouseCode, 9, IsNull(@TfUser, 'Persistech\Data Conversion'), IsNull(@EnteredAt, GetDate()))

		If @Linen = 1
			Insert Into TeamFinv2_DC.dbo.HcmHouseCodeServices (HcmHouseCode, HcmServiceType, HcmHoucsModBy, HcmHoucsModAt)
			Values(@HcmHouseCode, 10, IsNull(@TfUser, 'Persistech\Data Conversion'), IsNull(@EnteredAt, GetDate()))

		If @Mail = 1
			Insert Into TeamFinv2_DC.dbo.HcmHouseCodeServices (HcmHouseCode, HcmServiceType, HcmHoucsModBy, HcmHoucsModAt)
			Values(@HcmHouseCode, 11, IsNull(@TfUser, 'Persistech\Data Conversion'), IsNull(@EnteredAt, GetDate()))

		If @PT = 1
			Insert Into TeamFinv2_DC.dbo.HcmHouseCodeServices (HcmHouseCode, HcmServiceType, HcmHoucsModBy, HcmHoucsModAt)
			Values(@HcmHouseCode, 12, IsNull(@TfUser, 'Persistech\Data Conversion'), IsNull(@EnteredAt, GetDate()))

		If @POM = 1
			Insert Into TeamFinv2_DC.dbo.HcmHouseCodeServices (HcmHouseCode, HcmServiceType, HcmHoucsModBy, HcmHoucsModAt)
				Values(@HcmHouseCode, 13, IsNull(@TfUser, 'Persistech\Data Conversion'), IsNull(@EnteredAt, GetDate()))

		If @Security = 1
			Insert Into TeamFinv2_DC.dbo.HcmHouseCodeServices (HcmHouseCode, HcmServiceType, HcmHoucsModBy, HcmHoucsModAt)
			Values(@HcmHouseCode, 14, IsNull(@TfUser, 'Persistech\Data Conversion'), IsNull(@EnteredAt, GetDate()))

		Commit Transaction 
	End

	Set @Id = @Id + 1
	If @Id > @MaxId Break

End

-- Update AppSiteUnits Table
Select @Id = Min(Id), @MaxId = Max(Id) From TeamFin.dbo.SiteSetup Where MasterSiteNum > 0

While 1=1
Begin
	
	Select @MasterSiteNum = MasterSiteNum
	From TeamFin.dbo.SiteSetup
	Where Id = @Id

	If @@RowCount > 0
	Begin
		If(@MasterSiteNum > 0) 
		Begin
			Select @AppSite = AppSite From ESMV2_DC.dbo.AppSites Where AppSitTitle Like '%' + @MasterSiteNum + '%'
			Select @AppUnit = AppUnit From ESMV2_DC.dbo.AppUnits Where AppUniBrief Like '%' + @MasterSiteNum + '%'
			Insert Into ESMV2_DC.dbo.AppSiteUnits Values(@AppSite, @AppUnit)
		End
	End

	Set @Id = @Id + 1
	If @Id > @MaxId Break
End