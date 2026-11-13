/**
 * @description Test class for GetProductInfo Flow
 * Tests the flow that retrieves product information based on product name
 */
@IsTest
private class GetProductInfoFlowTest {
    @TestSetup
    static void setup() {
        // Create test product data
        ASR_Product__c testProduct = new ASR_Product__c(
            Name = 'Test Product',
            Description__c = 'Test Product Description',
            Price__c = 99.99,
            In_Stock__c = true,
            Is_Active__c = true
        );
        insert testProduct;
    }

    @IsTest
    static void testGetProductInfoSuccess() {
        // Set input variables for the flow
        Map<String, Object> inputs = new Map<String, Object>();
        inputs.put('product_name', 'Test Product');

        // Run the flow
        Test.startTest();
        Flow.Interview.GetProductInfo flowInterview = new Flow.Interview.GetProductInfo(
            inputs
        );
        flowInterview.start();
        Test.stopTest();

        // Verify the expected outcome
        String productDetails = (String) flowInterview.getVariableValue(
            'product_details'
        );
        Decimal price = (Decimal) flowInterview.getVariableValue('price');
        Boolean inStock = (Boolean) flowInterview.getVariableValue('in_stock');

        Assert.areEqual(
            'Test Product Description',
            productDetails,
            'Product details should match'
        );
        Assert.areEqual(99.99, price, 'Price should match');
        Assert.areEqual(true, inStock, 'In stock status should be true');
    }

    @IsTest
    static void testGetProductInfoProductNotFound() {
        // Set input variables for non-existent product
        Map<String, Object> inputs = new Map<String, Object>();
        inputs.put('product_name', 'Non-Existent Product');

        // Run the flow
        // Note: The flow has assignNullValuesIfNoRecordsFound=false, so when no product is found,
        // the assignment will fail and the variables will remain null
        Test.startTest();
        Flow.Interview.GetProductInfo flowInterview = new Flow.Interview.GetProductInfo(
            inputs
        );
        flowInterview.start();
        Test.stopTest();

        // Verify flow handles missing product - variables should be null when product not found
        String productDetails = (String) flowInterview.getVariableValue(
            'product_details'
        );
        Decimal price = (Decimal) flowInterview.getVariableValue('price');
        Boolean inStock = (Boolean) flowInterview.getVariableValue('in_stock');

        // When product is not found, the flow variables remain null
        Assert.areEqual(
            null,
            productDetails,
            'Product details should be null when product not found'
        );
        Assert.areEqual(
            null,
            price,
            'Price should be null when product not found'
        );
        Assert.areEqual(
            null,
            inStock,
            'In stock should be null when product not found'
        );
    }
}
