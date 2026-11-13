/**
 * @description Service for sending weather alerts
 */
public with sharing class WeatherAlertService {
    /**
     * @description Request class for weather alerts
     */
    public class AlertRequest {
        @InvocableVariable(
            label='Message'
            description='The weather alert message to send'
            required=true
        )
        public String message;

        @InvocableVariable(
            label='Severity'
            description='The severity level of the weather alert (e.g., Low, Medium, High, Critical)'
            required=true
        )
        public String severity;
    }

    /**
     * @description Response class for weather alerts
     */
    public class AlertResponse {
        @InvocableVariable(
            label='Alert Message'
            description='The formatted weather alert message that was sent'
        )
        public String alertMessage;
    }

    /**
     * @description Sends a weather alert
     * @param requests List of AlertRequest objects
     * @return List of AlertResponse objects with formatted alert messages
     */
    @InvocableMethod(label='Send Alert' description='Sends a weather alert')
    public static List<AlertResponse> sendAlert(List<AlertRequest> requests) {
        List<AlertResponse> responses = new List<AlertResponse>();

        for (AlertRequest req : requests) {
            String formattedMessage =
                'Weather Alert: ' +
                req.message +
                ' Severity: ' +
                req.severity;
            System.debug(LoggingLevel.INFO, formattedMessage);

            AlertResponse response = new AlertResponse();
            response.alertMessage = formattedMessage;
            responses.add(response);
        }

        return responses;
    }
}
