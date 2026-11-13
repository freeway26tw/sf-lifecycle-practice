/**
 * @description Test class for WeatherService
 * Tests the weather retrieval invocable method
 */
@IsTest
private class WeatherServiceTest {
    @IsTest
    static void testGetWeatherSuccess() {
        // Create test weather request with valid city Name
        WeatherService.WeatherRequest request = new WeatherService.WeatherRequest();
        request.cityName = 'San Francisco';
        List<WeatherService.WeatherRequest> requests = new List<WeatherService.WeatherRequest>{
            request
        };

        // Execute test
        Test.startTest();
        List<WeatherService.WeatherResponse> responses = WeatherService.getWeather(
            requests
        );
        Test.stopTest();

        // Verify successful weather retrieval
        Assert.areEqual(1, responses.size(), 'Should return one response');
        Assert.areEqual(
            true,
            responses[0].success,
            'Weather request should be successful'
        );
        Assert.areEqual(
            72,
            responses[0].temperature,
            'Temperature should be 72'
        );
        Assert.areEqual(45, responses[0].humidity, 'Humidity should be 45');
        Assert.areEqual(
            'Sunny',
            responses[0].conditions,
            'Conditions should be Sunny'
        );
    }

    @IsTest
    static void testGetWeatherWithBlankcityName() {
        // Create test weather request with blank cityName
        WeatherService.WeatherRequest request = new WeatherService.WeatherRequest();
        request.cityName = '';
        List<WeatherService.WeatherRequest> requests = new List<WeatherService.WeatherRequest>{
            request
        };

        // Execute test
        Test.startTest();
        List<WeatherService.WeatherResponse> responses = WeatherService.getWeather(
            requests
        );
        Test.stopTest();

        // Verify failed weather retrieval
        Assert.areEqual(1, responses.size(), 'Should return one response');
        Assert.areEqual(
            false,
            responses[0].success,
            'Weather request should fail for blank cityName'
        );
        Assert.areEqual(
            null,
            responses[0].temperature,
            'Temperature should be null'
        );
        Assert.areEqual(null, responses[0].humidity, 'Humidity should be null');
        Assert.areEqual(
            null,
            responses[0].conditions,
            'Conditions should be null'
        );
    }

    @IsTest
    static void testGetWeatherWithNullcityName() {
        // Create test weather request with null cityName
        WeatherService.WeatherRequest request = new WeatherService.WeatherRequest();
        request.cityName = null;
        List<WeatherService.WeatherRequest> requests = new List<WeatherService.WeatherRequest>{
            request
        };

        // Execute test
        Test.startTest();
        List<WeatherService.WeatherResponse> responses = WeatherService.getWeather(
            requests
        );
        Test.stopTest();

        // Verify failed weather retrieval
        Assert.areEqual(1, responses.size(), 'Should return one response');
        Assert.areEqual(
            false,
            responses[0].success,
            'Weather request should fail for null cityName'
        );
        Assert.areEqual(
            null,
            responses[0].temperature,
            'Temperature should be null for null cityName'
        );
        Assert.areEqual(
            null,
            responses[0].humidity,
            'Humidity should be null for null cityName'
        );
        Assert.areEqual(
            null,
            responses[0].conditions,
            'Conditions should be null for null cityName'
        );
    }

    @IsTest
    static void testGetWeatherBulkRequests() {
        // Create multiple weather requests for bulk testing
        List<WeatherService.WeatherRequest> requests = new List<WeatherService.WeatherRequest>();

        WeatherService.WeatherRequest request1 = new WeatherService.WeatherRequest();
        request1.cityName = 'New York';
        requests.add(request1);

        WeatherService.WeatherRequest request2 = new WeatherService.WeatherRequest();
        request2.cityName = 'Los Angeles';
        requests.add(request2);

        WeatherService.WeatherRequest request3 = new WeatherService.WeatherRequest();
        request3.cityName = '';
        requests.add(request3);

        WeatherService.WeatherRequest request4 = new WeatherService.WeatherRequest();
        request4.cityName = 'Chicago';
        requests.add(request4);

        // Execute test
        Test.startTest();
        List<WeatherService.WeatherResponse> responses = WeatherService.getWeather(
            requests
        );
        Test.stopTest();

        // Verify all requests were processed
        Assert.areEqual(4, responses.size(), 'Should return four responses');

        // Verify first request (success)
        Assert.areEqual(
            true,
            responses[0].success,
            'First request should be successful'
        );
        Assert.areEqual(
            72,
            responses[0].temperature,
            'First request temperature should be 72'
        );

        // Verify second request (success)
        Assert.areEqual(
            true,
            responses[1].success,
            'Second request should be successful'
        );
        Assert.areEqual(
            'Sunny',
            responses[1].conditions,
            'Second request conditions should be Sunny'
        );

        // Verify third request (failure - blank cityName)
        Assert.areEqual(
            false,
            responses[2].success,
            'Third request should fail'
        );
        Assert.areEqual(
            null,
            responses[2].temperature,
            'Third request temperature should be null'
        );

        // Verify fourth request (success)
        Assert.areEqual(
            true,
            responses[3].success,
            'Fourth request should be successful'
        );
        Assert.areEqual(
            45,
            responses[3].humidity,
            'Fourth request humidity should be 45'
        );
    }

    @IsTest
    static void testGetWeatherWithZipCode() {
        // Test with zip code as cityName
        WeatherService.WeatherRequest request = new WeatherService.WeatherRequest();
        request.cityName = '94105';
        List<WeatherService.WeatherRequest> requests = new List<WeatherService.WeatherRequest>{
            request
        };

        // Execute test
        Test.startTest();
        List<WeatherService.WeatherResponse> responses = WeatherService.getWeather(
            requests
        );
        Test.stopTest();

        // Verify successful weather retrieval with zip code
        Assert.areEqual(1, responses.size(), 'Should return one response');
        Assert.areEqual(
            true,
            responses[0].success,
            'Weather request with zip code should be successful'
        );
        Assert.areEqual(
            72,
            responses[0].temperature,
            'Temperature should be 72'
        );
    }

    @IsTest
    static void testGetWeatherWithWhitespacecityName() {
        // Test with whitespace-only cityName
        WeatherService.WeatherRequest request = new WeatherService.WeatherRequest();
        request.cityName = '   ';
        List<WeatherService.WeatherRequest> requests = new List<WeatherService.WeatherRequest>{
            request
        };

        // Execute test
        Test.startTest();
        List<WeatherService.WeatherResponse> responses = WeatherService.getWeather(
            requests
        );
        Test.stopTest();

        // Verify failed weather retrieval for whitespace-only cityName
        Assert.areEqual(1, responses.size(), 'Should return one response');
        Assert.areEqual(
            false,
            responses[0].success,
            'Weather request should fail for whitespace-only cityName'
        );
    }
}
