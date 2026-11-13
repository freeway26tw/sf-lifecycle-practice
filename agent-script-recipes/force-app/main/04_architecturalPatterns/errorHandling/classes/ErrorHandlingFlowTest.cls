/**
 * @description Test class for Error Handling Flows
 * Tests flows that demonstrate error handling patterns
 */
@IsTest
private class ErrorHandlingFlowTest {
    @TestSetup
    static void setup() {
        // Create test financial accounts
        ASR_Financial_Account__c testAccount1 = new ASR_Financial_Account__c(
            Account_Number__c = 'ACC-12345',
            Balance__c = 1000.00
        );
        ASR_Financial_Account__c testAccount2 = new ASR_Financial_Account__c(
            Account_Number__c = 'ACC-67890',
            Balance__c = 500.00
        );
        insert new List<ASR_Financial_Account__c>{ testAccount1, testAccount2 };
    }

    @IsTest
    static void testGetAccountBalanceSuccess() {
        // Set input variables for the flow
        Map<String, Object> inputs = new Map<String, Object>();
        inputs.put('account_number', 'ACC-12345');

        // Run the flow
        Test.startTest();
        Flow.Interview.GetAccountBalance flowInterview = new Flow.Interview.GetAccountBalance(
            inputs
        );
        flowInterview.start();
        Test.stopTest();

        // Verify the expected outcome
        Decimal balance = (Decimal) flowInterview.getVariableValue('balance');
        Boolean accountValid = (Boolean) flowInterview.getVariableValue(
            'account_valid'
        );

        Assert.areEqual(1000.00, balance, 'Balance should match');
        Assert.areEqual(true, accountValid, 'Account should be valid');
    }

    @IsTest
    static void testGetAccountBalanceAccountNotFound() {
        // Set input variables for non-existent account
        Map<String, Object> inputs = new Map<String, Object>();
        inputs.put('account_number', 'ACC-NONEXISTENT');

        // Run the flow
        Test.startTest();
        Flow.Interview.GetAccountBalance flowInterview = new Flow.Interview.GetAccountBalance(
            inputs
        );
        flowInterview.start();
        Test.stopTest();

        // Verify the expected outcome - account should be invalid
        Boolean accountValid = (Boolean) flowInterview.getVariableValue(
            'account_valid'
        );
        Assert.areEqual(false, accountValid, 'Account should be invalid');
    }

    @IsTest
    static void testExecuteTransferSuccess() {
        // Set input variables for the flow
        Map<String, Object> inputs = new Map<String, Object>();
        inputs.put('from_account', 'ACC-12345');
        inputs.put('to_account', 'ACC-67890');
        inputs.put('amount', 100.00);

        // Run the flow
        Test.startTest();
        Flow.Interview.ExecuteTransfer flowInterview = new Flow.Interview.ExecuteTransfer(
            inputs
        );
        flowInterview.start();
        Test.stopTest();

        // Verify the expected outcome
        Boolean success = (Boolean) flowInterview.getVariableValue('success');
        String transactionId = (String) flowInterview.getVariableValue(
            'transaction_id'
        );

        Assert.areEqual(true, success, 'Transfer should succeed');
        Assert.areNotEqual(
            null,
            transactionId,
            'Transaction ID should be returned'
        );

        // Verify transaction log was created
        List<ASR_Transaction_Log__c> logs = [
            SELECT Id
            FROM ASR_Transaction_Log__c
            WHERE Id = :transactionId
        ];
        Assert.areEqual(1, logs.size(), 'Transaction log should be created');
    }
}
