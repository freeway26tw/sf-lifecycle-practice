/**
 * Verifies OpenAIWebSearchController's input validation and its handling of successful and
 * failed OpenAIWebSearchAction callouts via HttpCalloutMock.
 */
@isTest
private class OpenAIWebSearchControllerTest {
  private class SuccessMock implements HttpCalloutMock {
    public HttpResponse respond(HttpRequest req) {
      HttpResponse res = new HttpResponse();
      res.setStatusCode(200);
      res.setHeader('Content-Type', 'application/json');
      res.setBody(
        '{' +
          '"id":"resp_123",' +
          '"status":"completed",' +
          '"usage":{"input_tokens":10,"output_tokens":20,"total_tokens":30},' +
          '"output":[' +
          '{"type":"reasoning"},' +
          '{"type":"web_search_call"},' +
          '{"type":"message","content":[' +
          '{"text":"Here is the answer.","annotations":[' +
          '{"type":"url_citation","title":"Example Source","url":"https://example.com"}' +
          ']}' +
          ']}' +
          ']' +
          '}'
      );
      return res;
    }
  }

  private class ErrorMock implements HttpCalloutMock {
    public HttpResponse respond(HttpRequest req) {
      HttpResponse res = new HttpResponse();
      res.setStatusCode(401);
      res.setStatus('Unauthorized');
      res.setBody('{"error":"invalid_api_key"}');
      return res;
    }
  }

  @isTest
  static void testSearchWithBlankInputsSetsValidationError() {
    OpenAIWebSearchController controller = new OpenAIWebSearchController();
    controller.apiKey = '';
    controller.searchQuery = '';

    Test.startTest();
    PageReference result = controller.search();
    Test.stopTest();

    System.assertEquals(
      null,
      result,
      'Search should not navigate away from the page.'
    );
    System.assertEquals(
      OpenAIWebSearchController.VALIDATION_ERROR_MESSAGE,
      controller.errorMessage,
      'Blank inputs should surface a validation message without invoking the callout.'
    );
    System.assertEquals(
      false,
      controller.hasResult,
      'No result should be populated for invalid input.'
    );
  }

  @isTest
  static void testSearchWithSuccessfulResponsePopulatesResult() {
    Test.setMock(HttpCalloutMock.class, new SuccessMock());

    OpenAIWebSearchController controller = new OpenAIWebSearchController();
    controller.apiKey = 'sk-test-key';
    controller.searchQuery = 'What is Salesforce Agentforce?';

    Test.startTest();
    controller.search();
    Test.stopTest();

    System.assertEquals(
      null,
      controller.errorMessage,
      'A successful response should not set an error message.'
    );
    System.assertEquals(
      true,
      controller.hasResult,
      'A completed status should mark a result as available.'
    );
    System.assertEquals(
      'Here is the answer.',
      controller.responseText,
      'Response text should come from the message output item.'
    );
    System.assertEquals(
      30,
      controller.totalTokens,
      'Total tokens should come from the usage block.'
    );
    System.assertEquals(
      true,
      controller.hasCitations,
      'Citations from the mock response should be detected.'
    );
    System.assertEquals(
      1,
      controller.citationLines.size(),
      'One citation line should be parsed from the mock response.'
    );
  }

  @isTest
  static void testSearchWithHttpErrorPopulatesErrorMessage() {
    Test.setMock(HttpCalloutMock.class, new ErrorMock());

    OpenAIWebSearchController controller = new OpenAIWebSearchController();
    controller.apiKey = 'sk-invalid-key';
    controller.searchQuery = 'What is Salesforce Agentforce?';

    Test.startTest();
    controller.search();
    Test.stopTest();

    System.assertEquals(
      false,
      controller.hasResult,
      'A non-completed status should not be treated as a result.'
    );
    System.assertEquals(
      true,
      controller.hasError,
      'An HTTP error status should surface an error message.'
    );
  }
}
