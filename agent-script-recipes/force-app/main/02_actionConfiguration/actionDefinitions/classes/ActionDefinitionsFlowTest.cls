/**
 * @description Test class for Action Definitions Flows
 * Tests all flows used in the action definitions recipe
 */
@IsTest
private class ActionDefinitionsFlowTest {
    @IsTest
    static void testGetCurrentWeather() {
        // Set input variables for the flow
        Map<String, Object> inputs = new Map<String, Object>();
        inputs.put('city_name', 'San Francisco');
        inputs.put('units', 'Fahrenheit');

        // Run the flow
        Test.startTest();
        Flow.Interview.GetCurrentWeather flowInterview = new Flow.Interview.GetCurrentWeather(
            inputs
        );
        flowInterview.start();
        Test.stopTest();

        // Verify the expected outcome
        Decimal temperature = (Decimal) flowInterview.getVariableValue(
            'temperature'
        );
        String weatherCondition = (String) flowInterview.getVariableValue(
            'weather_condition'
        );
        Decimal humidity = (Decimal) flowInterview.getVariableValue('humidity');
        Decimal windSpeed = (Decimal) flowInterview.getVariableValue(
            'wind_speed'
        );

        Assert.areNotEqual(null, temperature, 'Temperature should be returned');
        Assert.areNotEqual(
            null,
            weatherCondition,
            'Weather condition should be returned'
        );
        Assert.areNotEqual(null, humidity, 'Humidity should be returned');
        Assert.areNotEqual(null, windSpeed, 'Wind speed should be returned');
    }

    @IsTest
    static void testGetWeatherForecast() {
        // Set input variables for the flow
        Map<String, Object> inputs = new Map<String, Object>();
        inputs.put('city_name', 'New York');
        inputs.put('days', 5);

        // Run the flow
        Test.startTest();
        Flow.Interview.GetWeatherForecast flowInterview = new Flow.Interview.GetWeatherForecast(
            inputs
        );
        flowInterview.start();
        Test.stopTest();

        // Verify the flow executes without errors
        Assert.areNotEqual(
            null,
            flowInterview,
            'Flow should execute successfully'
        );
    }
}
