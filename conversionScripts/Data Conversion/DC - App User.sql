/*
There is no FirstName, LastName, Address1, 2, City, State, Zip 

Truncate Table [ESMV2_DC].[dbo].AppUsers
--Truncate Table [ESMV2_DC].[dbo].PplPersonRoles
--Truncate Table [ESMV2_DC].[dbo].PplPeople

Select * From [ESMV2_DC].[dbo].AppUsers
Select Top 10 * From [ESMV2_DC].[dbo].PplPersonRoles Order by PplPersonRole Desc
Select Top 10 * From [ESMV2_DC].[dbo].PplPeople Order by PplPerson Desc
*/

Set NoCount On

Declare 
	@Id int         
	, @Code Varchar(50)                                             
	, @SecurityProfile Varchar(50)                                                 
	, @Description  Varchar(250)                                                                                                                                                                                                                                                    
	, @Notes  Varchar(250)                                                                                                                                                                                                                                                          
	, @Active bit
	, @WorkPhone  Varchar(20)                                        
	, @HomePhone     Varchar(20)                                     
	, @CellPhone    Varchar(20)                                      
	, @Fax  Varchar(20)                                              
	, @Pager Varchar(20)                                             
	, @Password  Varchar(20)                                         
	, @OldPassword  Varchar(20)                                       
	, @PasswordCreated Datetime     
	, @MaxPasswordAge Int
	, @IdleLogoutDuration Int 
	, @Facility  Varchar(250)
	, @EMail  Varchar(50)
	, @Company Varchar(50)
	, @HouseCode Varchar(50)
	, @TeamCoach Bit
	, @TeamFin Bit
	, @OrganizationContinuum Varchar(20)
	, @UnitContinuum  Varchar(20)
	, @TimeTransactionContinuum Decimal(20,10)
	, @LoginAttempts Int
	, @AccountLockedOutTime DateTime
	, @bAccountLockOut Bit
	, @bAccountLockedOut Bit
	, @MaxId Int
	, @PplPerson Int
	, @TotalCount int 
	, @Count int

Select @Id = Min(Id), @MaxId = Max(Id), @TotalCount = Count(Id) From TeamFin.dbo.Users

Set @Count = 0

While 1=1
Begin
	Select
		@Code = Code
		, @SecurityProfile = SecurityProfile
		, @Description = Description
		, @Notes = Notes
		, @Active = Active
		, @WorkPhone = WorkPhone
		, @HomePhone = HomePhone
		, @CellPhone = CellPhone
		, @Fax = Fax
		, @Pager = Pager
		, @Password = Password
		, @OldPassword =OldPassword
		, @PasswordCreated = PasswordCreated  
		, @MaxPasswordAge =  MaxPasswordAge
		, @IdleLogoutDuration = IdleLogoutDuration
		, @Facility = Facility
		, @EMail = EMail
		, @Company = Company
		, @HouseCode = HouseCode
		, @TeamCoach = TeamCoach
		, @TeamFin = TeamFin
		, @OrganizationContinuum = OrganizationContinuum
		, @UnitContinuum = UnitContinuum
		, @TimeTransactionContinuum = TimeTransactionContinuum
		, @LoginAttempts = LoginAttempts
		, @AccountLockedOutTime = AccountLockedOutTime
		, @bAccountLockOut = bAccountLockOut
		, @bAccountLockedOut = bAccountLockedOut
	From Teamfin.dbo.Users
	Where Id = @Id

	If @@RowCount > 0
	Begin
		Set @Count = @Count + 1
		Print 'Inserting Record ' + Cast(@Count As Varchar(10)) + ' of ' + Cast(@TotalCount As Varchar(10)) + ' - ID : ' + Cast(@Id As Varchar(10))

		Insert Into [ESMV2_DC].[dbo].[PplPeople]
			( [pplPeoBrief]
			, [pplPeoFirstName]
			, [pplPeoLastName]
			, [pplPeoMiddleName]
			, [pplPeoAddressLine1]
			, [pplPeoAddressLine2]
			, [pplPeoCity]
			, [AppStateType] 
			, [pplPeoPostalCode]
			, [pplPeoHomePhone]
			, [pplPeoFax] 
			, [pplPeoCellPhone]
			, [pplPeoEmail] 
			, [pplPeoPager] 
			, [pplPeoActive]
			, [pplPeoModBy]
			, [pplPeoModAt]
			)
		Values
			( Left(@Code + '', 16)
			, Left(@Code + '', 32)
			, 'User' --isnull(@LName, '')
			, '' -- isnull(@Minitial,'')
			, 'None' --isnull(@Address1,'')
			, '' --isnull(@Address2, '')
			, '' --isnull(@City,'')
			, 5 --@AppStateType
			, '' ---isnull(@Zip,'')
			, IsNull(@HomePhone,'')
			, IsNull(@WorkPhone,'')
			, IsNull(@Fax,'')
			, IsNull(@CellPhone,'')
			, IsNull(@Pager,'')
			, @Active
			, 'Persistech\Data Conversion'
			, GetDate()
			)

		Set @PplPerson = (Select Max(PplPerson) From ESMV2_DC.dbo.PplPeople)
		
		Insert Into ESMV2_DC.dbo.AppUsers
			( AppUseBrief
			, PplPerson   
			, HirNodeTop  
			, HirNodeCurrent 
			, AppUseActive 
			, AppUseUserName                   
			, AppUsePassword                   
			, AppUseModBy                                        
			, AppUseModAt             
			)
		Values
			( Left(@Code + '', 16)
			, @PplPerson
			, 0 -- nodeTop
			, 0 -- nodeCurrent
			, @Active
			, @Code
			, @Password
			, 'Persistech\Data Conversion'
			, GetDate()
			)

		Insert Into [ESMV2_DC].dbo.[PplPersonRoles]
			( PplPerson
			, PplRole
			, PplPerrModBy
			, PplPerrModAt
			)   
		Values
			(@pplPerson
			, 1 --User,  2 -- Employee, 3-Performer
			, 'Persistech\Data Conversion'
			, GetDate()
			)
	End

	Set @Id = @Id + 1 
	If @Id > @MaxId Break

End
