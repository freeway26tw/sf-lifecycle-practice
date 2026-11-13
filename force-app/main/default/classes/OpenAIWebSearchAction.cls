public with sharing class OpenAIWebSearchAction {
    
    // Input class for Flow: collects the API key and the user’s search query.
    public class OpenAIWebSearchInput {
        @InvocableVariable(label='OpenAI API Key' required=true)
        public String apiKey;
        
        @InvocableVariable(label='Search Query' required=true)
        public String searchQuery;
    }
    
    // Output class for Flow: returns the text portion of the response
    // plus the entire JSON response (for logging or troubleshooting).
    public class OpenAIWebSearchOutput {
        @InvocableVariable(label='Response Text')
        public String responseText;

        @InvocableVariable(label='Response ID')
        public String responseId;

        @InvocableVariable(label='Status')
        public String status;

        @InvocableVariable(label='Input Tokens')
        public Integer inputTokens;

        @InvocableVariable(label='Output Tokens')
        public Integer outputTokens;

        @InvocableVariable(label='Total Tokens')
        public Integer totalTokens;

        @InvocableVariable(label='Citations')
        public String citations;

        @InvocableVariable(label='Full JSON Response')
        public String fullJsonResponse;
    }
    
    @InvocableMethod(
        label='Call OpenAI Web Search' 
        description='Calls the OpenAI Web Search endpoint with the provided API key and search query.'
    )
    public static List<OpenAIWebSearchOutput> callOpenAIWebSearch(List<OpenAIWebSearchInput> inputList) {
        
        // Validate that we have at least one record.
        if(inputList == null || inputList.isEmpty()) {
            throw new IllegalArgumentException('No input provided to OpenAIWebSearchAction.');
        }
        
        // We’ll only process the first record for simplicity.
        OpenAIWebSearchInput input = inputList[0];
        
        // Construct the HTTP request to the OpenAI /v1/responses endpoint.
        String endpoint = 'https://api.openai.com/v1/responses';

        // Set apiStatusCode
        Integer statusCode;
        
        // Build the JSON body as shown in your sample request:
        // {
        //   "model": "gpt-4o",
        //   "tools": [{"type": "web_search"}],
        //   "input": "<user's search query>"
        // }
        Map<String, Object> requestBody = new Map<String, Object>{
            'model' => 'gpt-5-nano',
            'tools' => new List<Object>{ new Map<String, Object>{ 'type' => 'web_search' } },
            'input' => input.searchQuery
        };
        
        // Serialize the body to JSON.
        String body = JSON.serialize(requestBody);
        
        // Prepare the HTTP request.
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('POST');
        
        // OpenAI expects a Bearer token in the Authorization header.
        // This is the user-provided API key.
        req.setHeader('Authorization', 'Bearer ' + input.apiKey);
        req.setHeader('Content-Type', 'application/json');
        
        // Attach the request body.
        req.setBody(body);
        
        // You can optionally set a higher timeout if you expect longer processing.
        req.setTimeout(120000); // 120 seconds
        
        Http http = new Http();
        OpenAIWebSearchOutput output = new OpenAIWebSearchOutput();
        
        try {
            // Make the callout.
            HttpResponse res = http.send(req);

            statusCode = res.getStatusCode();
            
            // Check for success (HTTP 200).
            if(statusCode == 200) {
                // Parse the JSON response.
                Map<String, Object> jsonResponse = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                
                // Store the full JSON for debugging or logs.
                output.fullJsonResponse = res.getBody();

                // Lightweight top-level fields, much smaller than the full JSON body.
                output.responseId = (String) jsonResponse.get('id');
                output.status = (String) jsonResponse.get('status');

                if(jsonResponse.get('usage') != null) {
                    // JSON.deserializeUntyped surfaces whole numbers as Long, so go through
                    // String rather than casting straight to Integer (which would throw).
                    Map<String, Object> usage = (Map<String, Object>) jsonResponse.get('usage');
                    output.inputTokens = usage.get('input_tokens') != null ? Integer.valueOf(String.valueOf(usage.get('input_tokens'))) : null;
                    output.outputTokens = usage.get('output_tokens') != null ? Integer.valueOf(String.valueOf(usage.get('output_tokens'))) : null;
                    output.totalTokens = usage.get('total_tokens') != null ? Integer.valueOf(String.valueOf(usage.get('total_tokens'))) : null;
                }

                // Find the "message" item in the "output" array. Its position is not
                // fixed: reasoning models (like gpt-5-nano) can emit "reasoning" and
                // "web_search_call" items before the actual "message" item.
                if(jsonResponse.containsKey('output')) {
                    List<Object> outputList = (List<Object>) jsonResponse.get('output');
                    List<String> citationList = new List<String>();

                    if(outputList != null) {
                        for(Object item : outputList) {
                            Map<String, Object> itemObj = (Map<String, Object>) item;
                            if(itemObj.get('type') != 'message' || !itemObj.containsKey('content')) {
                                continue;
                            }

                            List<Object> contentArray = (List<Object>) itemObj.get('content');
                            if(contentArray == null) {
                                continue;
                            }

                            for(Object contentItem : contentArray) {
                                Map<String, Object> contentObj = (Map<String, Object>) contentItem;
                                if(contentObj.containsKey('text')) {
                                    output.responseText = (String) contentObj.get('text');
                                }

                                // Web search citations: much smaller and more precise
                                // than the full JSON if all you need is the sources used.
                                if(contentObj.get('annotations') != null) {
                                    for(Object annotation : (List<Object>) contentObj.get('annotations')) {
                                        Map<String, Object> annotationObj = (Map<String, Object>) annotation;
                                        if(annotationObj.get('type') == 'url_citation') {
                                            citationList.add(
                                                (String) annotationObj.get('title') + ': ' + (String) annotationObj.get('url')
                                            );
                                        }
                                    }
                                }
                            }

                            break;
                        }
                    }

                    if(!citationList.isEmpty()) {
                        output.citations = String.join(citationList, '\n');
                    }
                }

                // If parsing fails or structure is unexpected, responseText might remain null/blank.
                // You could add more robust checks as needed.

            } else {
                // Non-200 response: capture status code and entire response for clarity.
                output.status = 'http_error';
                output.responseText = 'Error: ' + statusCode + ' ' + res.getStatus();
                output.fullJsonResponse = res.getBody();
            }

        } catch(Exception ex) {
            // Capture the exception details in the output.
            statusCode = 400;
            output.status = 'exception';
            output.responseText = 'Exception: ' + ex.getMessage();
            output.fullJsonResponse = 'No response body due to exception.';
        }

        // Create API Log
        // APILogService.createApiLog(String.valueOf(statusCode), output.responseText, output.fullJsonResponse);
        
        // Return a single record back to the Flow.
        return new List<OpenAIWebSearchOutput>{ output };
    }
}