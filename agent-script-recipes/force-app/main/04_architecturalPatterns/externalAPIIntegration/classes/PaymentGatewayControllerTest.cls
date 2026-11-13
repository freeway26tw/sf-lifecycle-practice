/**
 * @description Test class for PaymentGatewayController
 * Tests the payment processing invocable method
 */
@IsTest
private class PaymentGatewayControllerTest {
    @IsTest
    static void testProcessPaymentSuccess() {
        // Create test payment input with valid amount
        PaymentGatewayController.PaymentInput input = new PaymentGatewayController.PaymentInput();
        input.amount = 100.00;
        input.paymentToken = 'TOKEN-12345';
        input.currencyName = 'USD';
        List<PaymentGatewayController.PaymentInput> inputs = new List<PaymentGatewayController.PaymentInput>{
            input
        };

        // Execute test
        Test.startTest();
        List<PaymentGatewayController.PaymentOutput> outputs = PaymentGatewayController.processPayment(
            inputs
        );
        Test.stopTest();

        // Verify successful payment processing
        Assert.areEqual(1, outputs.size(), 'Should return one output');
        Assert.areEqual(
            true,
            outputs[0].success,
            'Payment should be successful'
        );
        Assert.areEqual(
            'Processed',
            outputs[0].status,
            'Status should be Processed'
        );
        Assert.areNotEqual(
            null,
            outputs[0].transactionId,
            'Transaction ID should be generated'
        );
        Assert.isTrue(
            outputs[0].transactionId.startsWith('TXN-'),
            'Transaction ID should start with TXN-'
        );
        Assert.areEqual(
            null,
            outputs[0].errorMessage,
            'Error message should be null for successful payment'
        );
    }

    @IsTest
    static void testProcessPaymentFailureInvalidAmount() {
        // Create test payment input with invalid amount (zero)
        PaymentGatewayController.PaymentInput input = new PaymentGatewayController.PaymentInput();
        input.amount = 0;
        input.paymentToken = 'TOKEN-12345';
        input.currencyName = 'USD';
        List<PaymentGatewayController.PaymentInput> inputs = new List<PaymentGatewayController.PaymentInput>{
            input
        };

        // Execute test
        Test.startTest();
        List<PaymentGatewayController.PaymentOutput> outputs = PaymentGatewayController.processPayment(
            inputs
        );
        Test.stopTest();

        // Verify failed payment processing
        Assert.areEqual(1, outputs.size(), 'Should return one output');
        Assert.areEqual(false, outputs[0].success, 'Payment should fail');
        Assert.areEqual('Failed', outputs[0].status, 'Status should be Failed');
        Assert.areEqual(
            'Invalid Amount',
            outputs[0].errorMessage,
            'Error message should indicate invalid amount'
        );
        Assert.areEqual(
            null,
            outputs[0].transactionId,
            'Transaction ID should be null for failed payment'
        );
    }

    @IsTest
    static void testProcessPaymentFailureNegativeAmount() {
        // Create test payment input with negative amount
        PaymentGatewayController.PaymentInput input = new PaymentGatewayController.PaymentInput();
        input.amount = -50.00;
        input.paymentToken = 'TOKEN-12345';
        input.currencyName = 'EUR';
        List<PaymentGatewayController.PaymentInput> inputs = new List<PaymentGatewayController.PaymentInput>{
            input
        };

        // Execute test
        Test.startTest();
        List<PaymentGatewayController.PaymentOutput> outputs = PaymentGatewayController.processPayment(
            inputs
        );
        Test.stopTest();

        // Verify failed payment processing
        Assert.areEqual(1, outputs.size(), 'Should return one output');
        Assert.areEqual(
            false,
            outputs[0].success,
            'Payment should fail for negative amount'
        );
        Assert.areEqual('Failed', outputs[0].status, 'Status should be Failed');
        Assert.areEqual(
            'Invalid Amount',
            outputs[0].errorMessage,
            'Error message should indicate invalid amount'
        );
    }

    @IsTest
    static void testProcessPaymentBulkPayments() {
        // Create multiple payment inputs for bulk testing
        List<PaymentGatewayController.PaymentInput> inputs = new List<PaymentGatewayController.PaymentInput>();

        PaymentGatewayController.PaymentInput input1 = new PaymentGatewayController.PaymentInput();
        input1.amount = 100.00;
        input1.paymentToken = 'TOKEN-001';
        input1.currencyName = 'USD';
        inputs.add(input1);

        PaymentGatewayController.PaymentInput input2 = new PaymentGatewayController.PaymentInput();
        input2.amount = 250.50;
        input2.paymentToken = 'TOKEN-002';
        input2.currencyName = 'EUR';
        inputs.add(input2);

        PaymentGatewayController.PaymentInput input3 = new PaymentGatewayController.PaymentInput();
        input3.amount = 0;
        input3.paymentToken = 'TOKEN-003';
        input3.currencyName = 'GBP';
        inputs.add(input3);

        PaymentGatewayController.PaymentInput input4 = new PaymentGatewayController.PaymentInput();
        input4.amount = 75.25;
        input4.paymentToken = 'TOKEN-004';
        input4.currencyName = 'USD';
        inputs.add(input4);

        // Execute test
        Test.startTest();
        List<PaymentGatewayController.PaymentOutput> outputs = PaymentGatewayController.processPayment(
            inputs
        );
        Test.stopTest();

        // Verify all payments were processed
        Assert.areEqual(4, outputs.size(), 'Should return four outputs');

        // Verify first payment (success)
        Assert.areEqual(
            true,
            outputs[0].success,
            'First payment should be successful'
        );
        Assert.areEqual(
            'Processed',
            outputs[0].status,
            'First payment status should be Processed'
        );

        // Verify second payment (success)
        Assert.areEqual(
            true,
            outputs[1].success,
            'Second payment should be successful'
        );

        // Verify third payment (failure)
        Assert.areEqual(false, outputs[2].success, 'Third payment should fail');
        Assert.areEqual(
            'Failed',
            outputs[2].status,
            'Third payment status should be Failed'
        );
        Assert.areEqual(
            'Invalid Amount',
            outputs[2].errorMessage,
            'Third payment should have error message'
        );

        // Verify fourth payment (success)
        Assert.areEqual(
            true,
            outputs[3].success,
            'Fourth payment should be successful'
        );
    }

    @IsTest
    static void testProcessPaymentLargeAmount() {
        // Test with large amount
        PaymentGatewayController.PaymentInput input = new PaymentGatewayController.PaymentInput();
        input.amount = 999999.99;
        input.paymentToken = 'TOKEN-LARGE';
        input.currencyName = 'USD';
        List<PaymentGatewayController.PaymentInput> inputs = new List<PaymentGatewayController.PaymentInput>{
            input
        };

        // Execute test
        Test.startTest();
        List<PaymentGatewayController.PaymentOutput> outputs = PaymentGatewayController.processPayment(
            inputs
        );
        Test.stopTest();

        // Verify large amount is processed successfully
        Assert.areEqual(1, outputs.size(), 'Should return one output');
        Assert.areEqual(
            true,
            outputs[0].success,
            'Large amount payment should be successful'
        );
        Assert.areNotEqual(
            null,
            outputs[0].transactionId,
            'Transaction ID should be generated'
        );
    }

    @IsTest
    static void testProcessPaymentSmallAmount() {
        // Test with small amount
        PaymentGatewayController.PaymentInput input = new PaymentGatewayController.PaymentInput();
        input.amount = 0.01;
        input.paymentToken = 'TOKEN-SMALL';
        input.currencyName = 'USD';
        List<PaymentGatewayController.PaymentInput> inputs = new List<PaymentGatewayController.PaymentInput>{
            input
        };

        // Execute test
        Test.startTest();
        List<PaymentGatewayController.PaymentOutput> outputs = PaymentGatewayController.processPayment(
            inputs
        );
        Test.stopTest();

        // Verify small amount is processed successfully
        Assert.areEqual(1, outputs.size(), 'Should return one output');
        Assert.areEqual(
            true,
            outputs[0].success,
            'Small amount payment should be successful'
        );
        Assert.areEqual(
            'Processed',
            outputs[0].status,
            'Status should be Processed'
        );
    }

    @IsTest
    static void testProcessPaymentTransactionIdUniqueness() {
        // Test that transaction IDs are unique
        PaymentGatewayController.PaymentInput input1 = new PaymentGatewayController.PaymentInput();
        input1.amount = 100.00;
        input1.paymentToken = 'TOKEN-001';
        input1.currencyName = 'USD';

        PaymentGatewayController.PaymentInput input2 = new PaymentGatewayController.PaymentInput();
        input2.amount = 200.00;
        input2.paymentToken = 'TOKEN-002';
        input2.currencyName = 'USD';

        List<PaymentGatewayController.PaymentInput> inputs = new List<PaymentGatewayController.PaymentInput>{
            input1,
            input2
        };

        // Execute test
        Test.startTest();
        List<PaymentGatewayController.PaymentOutput> outputs = PaymentGatewayController.processPayment(
            inputs
        );
        Test.stopTest();

        // Verify transaction IDs are unique
        Assert.areEqual(2, outputs.size(), 'Should return two outputs');
        Assert.areNotEqual(
            outputs[0].transactionId,
            outputs[1].transactionId,
            'Transaction IDs should be unique'
        );
    }
}
