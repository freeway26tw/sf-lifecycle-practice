/**
 * @description Invocable service for retrieving weather information
 */
public with sharing class WeatherService {
    /**
     * @description Input class for weather request
     */
    public class WeatherRequest {
        @InvocableVariable(
            label='City Name'
            description='The name of the city to get weather for'
            required=true
        )
        public String cityName;
    }

    /**
     * @description Output class for weather response
     */
    public class WeatherResponse {
        @InvocableVariable(
            label='Success'
            description='Indicates if the weather request was successful'
        )
        public Boolean success;

        @InvocableVariable(
            label='Error Message'
            description='The error message if the weather request was not successful'
        )
        public String error_message;

        @InvocableVariable(
            label='Temperature'
            description='The current temperature in degrees'
        )
        public Integer temperature;

        @InvocableVariable(
            label='Humidity'
            description='The current humidity percentage'
        )
        public Integer humidity;

        @InvocableVariable(
            label='Conditions'
            description='The current weather conditions (e.g., Sunny, Cloudy, Rainy)'
        )
        public String conditions;
    }

    /**
     * @description Retrieves weather information for a given location
     * @param requests List of WeatherRequest objects
     * @return List of WeatherResponse objects with weather data
     */
    @InvocableMethod(
        label='Get Weather'
        description='Retrieves current weather information for a specified location'
    )
    public static List<WeatherResponse> getWeather(
        List<WeatherRequest> requests
    ) {
        List<WeatherResponse> responses = new List<WeatherResponse>();

        for (WeatherRequest req : requests) {
            WeatherResponse response = new WeatherResponse();

            // Mock implementation - replace with actual API call in your custom code
            if (String.isNotBlank(req.cityName)) {
                response.success = true;
                response.temperature = 72;
                response.humidity = 45;
                response.conditions = 'Sunny';
            } else {
                response.success = false;
                response.temperature = null;
                response.humidity = null;
                response.conditions = null;
                response.error_message = 'City name is required';
            }

            responses.add(response);
        }

        return responses;
    }
}
