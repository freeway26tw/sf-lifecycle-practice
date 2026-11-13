/**
 * @description Test class for Advanced Input Bindings Flows
 * Tests all flows used in the advanced input bindings recipe
 */
@IsTest
private class AdvancedInputBindingsFlowTest {
    @IsTest
    static void testGenerateReport() {
        // Set input variables for the flow
        Map<String, Object> inputs = new Map<String, Object>();
        inputs.put('report_type', 'Sales Report');
        inputs.put('start_date', Date.today().addDays(-30));
        inputs.put('end_date', Date.today());
        inputs.put('user_id', 'USER-12345');
        inputs.put('format', 'PDF');
        inputs.put('include_charts', true);
        inputs.put('options', '{"detailed":true}');

        // Run the flow
        Test.startTest();
        Flow.Interview.GenerateReport flowInterview = new Flow.Interview.GenerateReport(
            inputs
        );
        flowInterview.start();
        Test.stopTest();

        // Verify the expected outcome
        String reportUrl = (String) flowInterview.getVariableValue(
            'report_url'
        );
        Boolean success = (Boolean) flowInterview.getVariableValue('success');

        Assert.areNotEqual(null, reportUrl, 'Report URL should be returned');
        Assert.isTrue(
            reportUrl.startsWith('https://'),
            'Report URL should be a valid URL'
        );
        Assert.areEqual(true, success, 'Flow should succeed');

        // Verify report log was created
        List<ASR_Report_Log__c> logs = [
            SELECT Id, Report_Type__c, User_ID__c, Format__c
            FROM ASR_Report_Log__c
            WHERE User_ID__c = 'USER-12345'
        ];
        Assert.areEqual(1, logs.size(), 'Report log should be created');
    }
}
