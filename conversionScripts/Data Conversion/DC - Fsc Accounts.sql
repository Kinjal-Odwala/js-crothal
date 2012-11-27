Set Nocount On

/*
Select * From TeamFinV2_DC.dbo.FscAccounts
Truncate Table TeamFinV2_DC.dbo.FscAccounts
*/

Declare @ID	int
	, @FscAccountCategory int
	, @FscAccCode int
	, @FscAccDescription varchar(256)
	, @FscAccGLHeader varchar(200)
	, @FscAccPostingEditCode varchar(50)
	, @FscAccNegativeValue bit
	, @FscAccBlockImportExport bit
	, @FscAccBudget bit
	, @FscAccAccountsPayable bit
	, @FscAccSalariesWages bit
	, @FscAccRecurringExpenses bit
	, @FscAccFieldTransfers bit
	, @FscAccInventory bit
	, @FscAccPayrollWorksheet bit
	, @FscAccManagementFee bit
	, @FscAccDirectCost bit
	, @FscAccSupplies bit
	, @FscAccAccountReceivables bit
	, @FscAccWOR bit
	, @FscAccOtherRevenue bit
	, @FscAccDisplayOrder int
	, @FscAccActive bit	
	, @FscAccModBy varchar(50)
	, @FscAccModAt dateTime
	, @MaxId int

Select @Id = Min(id), @MaxId = Max(id) From TeamFin.dbo.chartofAcc 

While 1=1
Begin

	Select 
		@FscAccCode = Accountcode
		, @FscAccDescription = Description
		, @FscAccGLHeader = GLHeader
		, @FscAccPostingEditCode =[Posting Edit Code]
		, @FscAccNegativeValue = bNegVal
		, @FscAccBlockImportExport = bBlockImportExport
		, @FscAccBudget = Budget
		, @FscAccAccountsPayable = AccountPayables
		, @FscAccSalariesWages = SalariesWages
		, @FscAccRecurringExpenses = RecurringExpenses
		, @FscAccFieldTransfers = FieldTransfers
		, @FscAccInventory = Inventory
		, @FscAccPayrollWorksheet = PayrollWorksheet
		, @FscAccManagementFee = ManagementFee
		, @FscAccDirectCost = DirectCost
		, @FscAccSupplies = Supplies
		, @FscAccAccountReceivables = AccountReceivables
		, @FscAccWOR = WOR
		, @FscAccOtherRevenue = OtherRevenue
	From TeamFin.dbo.chartofAcc 
	Where ID = @ID
	
	If @@RowCount > 0
	Begin
		
		Insert Into TeamFinV2_DC.dbo.FscAccounts
			( FscAccountCategory
			, FscAccCode
			, FscAccDescription
			, FscAccGLHeader
			, FscAccPostingEditCode
			, FscAccNegativeValue
			, FscAccBlockImportExport
			, FscAccBudget
			, FscAccAccountsPayable
			, FscAccSalariesWages
			, FscAccRecurringExpenses
			, FscAccFieldTransfers
			, FscAccInventory
			, FscAccPayrollWorksheet
			, FscAccManagementFee
			, FscAccDirectCost
			, FscAccSupplies
			, FscAccAccountReceivables
			, FscAccWOR
			, FscAccOtherRevenue
			, FscAccDisplayOrder
			, FscAccActive
			, FscAccModBy
			, FscAccModAt
			) 
		values
			( 1
			, @FscAccCode
			, @FscAccDescription
			, @FscAccGLHeader 
			, @FscAccPostingEditCode 
			, @FscAccNegativeValue 
			, @FscAccBlockImportExport 
			, @FscAccBudget 
			, @FscAccAccountsPayable 
			, @FscAccSalariesWages 
			, @FscAccRecurringExpenses 
			, @FscAccFieldTransfers  
			, @FscAccInventory  
			, @FscAccPayrollWorksheet  
			, @FscAccManagementFee  
			, @FscAccDirectCost  
			, @FscAccSupplies  
			, @FscAccAccountReceivables  
			, @FscAccWOR 
			, @FscAccOtherRevenue  
			, 1
			, 1
			, 'Persistech\Data Conversion'
			, GetDate()
			)
	
	End
 
	Set @ID = @ID + 1
	If @ID > @MaxId Break 

End