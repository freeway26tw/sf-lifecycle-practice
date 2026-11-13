/**
 * @description Controller for processing payments via external gateway
 */
public with sharing class PaymentGatewayController {
    /**
     * @description Input class for payment processing
     */
    public class PaymentInput {
        @InvocableVariable(label='Amount' required=true)
        public Decimal amount;
        @InvocableVariable(label='Payment Token' required=true)
        public String paymentToken;
        @InvocableVariable(label='Currency')
        public String currencyName;
    }

    /**
     * @description Output class for payment processing
     */
    public class PaymentOutput {
        @InvocableVariable(label='Transaction ID')
        public String transactionId;
        @InvocableVariable(label='Status')
        public String status;
        @InvocableVariable(label='Success')
        public Boolean success;
        @InvocableVariable(label='Error Message')
        public String errorMessage;
    }

    /**
     * @description Process a payment via external gateway
     * @param inputs List of PaymentInput objects
     * @return List of PaymentOutput objects with transaction details
     */
    @InvocableMethod(
        label='Process Payment'
        description='Process a payment via external gateway'
    )
    public static List<PaymentOutput> processPayment(
        List<PaymentInput> inputs
    ) {
        List<PaymentOutput> outputs = new List<PaymentOutput>();
        for (PaymentInput input : inputs) {
            PaymentOutput output = new PaymentOutput();
            // Mock Logic
            if (input.amount > 0) {
                output.success = true;
                output.status = 'Processed';
                output.transactionId = 'TXN-' + UUID.randomUUID();
            } else {
                output.success = false;
                output.status = 'Failed';
                output.errorMessage = 'Invalid Amount';
            }
            outputs.add(output);
        }
        return outputs;
    }
}
