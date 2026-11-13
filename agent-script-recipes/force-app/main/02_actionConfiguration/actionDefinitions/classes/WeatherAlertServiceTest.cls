/**
 * @description Test class for WeatherAlertService
 * Tests the weather alert service invocable method
 */
@IsTest
private class WeatherAlertServiceTest {
    @IsTest
    static void testSendAlertSingleRequest() {
        // Create test data
        WeatherAlertService.AlertRequest request = new WeatherAlertService.AlertRequest();
        request.message = 'Severe thunderstorm warning';
        request.severity = 'High';
        List<WeatherAlertService.AlertRequest> requests = new List<WeatherAlertService.AlertRequest>{
            request
        };

        // Execute test
        Test.startTest();
        List<WeatherAlertService.AlertResponse> responses = WeatherAlertService.sendAlert(
            requests
        );
        Test.stopTest();

        // Verify the response
        Assert.areEqual(
            1,
            responses.size(),
            'Response list should contain one response'
        );
        Assert.areEqual(
            'Weather Alert: Severe thunderstorm warning Severity: High',
            responses[0].alertMessage,
            'Alert message should be formatted correctly'
        );
    }

    @IsTest
    static void testSendAlertBulkRequests() {
        // Create multiple test requests for bulk testing
        List<WeatherAlertService.AlertRequest> requests = new List<WeatherAlertService.AlertRequest>();

        WeatherAlertService.AlertRequest request1 = new WeatherAlertService.AlertRequest();
        request1.message = 'Tornado warning';
        request1.severity = 'Critical';
        requests.add(request1);

        WeatherAlertService.AlertRequest request2 = new WeatherAlertService.AlertRequest();
        request2.message = 'Flood advisory';
        request2.severity = 'Medium';
        requests.add(request2);

        WeatherAlertService.AlertRequest request3 = new WeatherAlertService.AlertRequest();
        request3.message = 'Heat advisory';
        request3.severity = 'Low';
        requests.add(request3);

        // Execute test
        Test.startTest();
        List<WeatherAlertService.AlertResponse> responses = WeatherAlertService.sendAlert(
            requests
        );
        Test.stopTest();

        // Verify all requests were processed
        Assert.areEqual(3, responses.size(), 'Should return three responses');
        Assert.areEqual(
            'Weather Alert: Tornado warning Severity: Critical',
            responses[0].alertMessage,
            'First alert message should be formatted correctly'
        );
        Assert.areEqual(
            'Weather Alert: Flood advisory Severity: Medium',
            responses[1].alertMessage,
            'Second alert message should be formatted correctly'
        );
        Assert.areEqual(
            'Weather Alert: Heat advisory Severity: Low',
            responses[2].alertMessage,
            'Third alert message should be formatted correctly'
        );
    }

    @IsTest
    static void testSendAlertWithEmptyMessage() {
        // Test with empty message
        WeatherAlertService.AlertRequest request = new WeatherAlertService.AlertRequest();
        request.message = '';
        request.severity = 'Low';
        List<WeatherAlertService.AlertRequest> requests = new List<WeatherAlertService.AlertRequest>{
            request
        };

        // Execute test
        Test.startTest();
        List<WeatherAlertService.AlertResponse> responses = WeatherAlertService.sendAlert(
            requests
        );
        Test.stopTest();

        // Verify the method handles empty message
        Assert.areEqual(1, responses.size(), 'Response should be returned');
        Assert.areEqual(
            'Weather Alert:  Severity: Low',
            responses[0].alertMessage,
            'Alert message should be formatted with empty message'
        );
    }
}
