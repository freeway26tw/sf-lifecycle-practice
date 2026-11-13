/**
 * Verifies ChunghwaPostZipCodeAction's bulk lookup, validation, and error handling for the
 * Chunghwa Post GetZipCode SOAP callout via HttpCalloutMock.
 */
@isTest
private class ChunghwaPostZipCodeActionTest {
  private static final String TAIPEI_ADDRESS = '台北市大安區敦化南路二段1號';
  private static final String TAIPEI_ZIP = '106619';
  private static final String TAIPEI_MATCHED_ADDRESS = '台北市大安區敦化南路二段1號';

  private static final String KAOHSIUNG_ADDRESS = '高雄市苓雅區四維三路2號';
  private static final String KAOHSIUNG_ZIP = '802019';
  private static final String KAOHSIUNG_MATCHED_ADDRESS = '高雄市苓雅區四維三路2號';

  private class SuccessMock implements HttpCalloutMock {
    public HttpResponse respond(HttpRequest req) {
      String zip;
      String matchedAddress;

      if (req.getBody().contains(TAIPEI_ADDRESS)) {
        zip = TAIPEI_ZIP;
        matchedAddress = TAIPEI_MATCHED_ADDRESS;
      } else if (req.getBody().contains(KAOHSIUNG_ADDRESS)) {
        zip = KAOHSIUNG_ZIP;
        matchedAddress = KAOHSIUNG_MATCHED_ADDRESS;
      } else {
        zip = '';
        matchedAddress = '';
      }

      HttpResponse res = new HttpResponse();
      res.setStatusCode(200);
      res.setHeader('Content-Type', 'text/xml; charset=utf-8');
      res.setBody(buildGetZipCodeResponseBody(zip, matchedAddress));
      return res;
    }
  }

  private class HttpErrorMock implements HttpCalloutMock {
    public HttpResponse respond(HttpRequest req) {
      HttpResponse res = new HttpResponse();
      res.setStatusCode(500);
      res.setStatus('Internal Server Error');
      res.setBody('Service unavailable');
      return res;
    }
  }

  private class SoapFaultMock implements HttpCalloutMock {
    public HttpResponse respond(HttpRequest req) {
      HttpResponse res = new HttpResponse();
      res.setStatusCode(200);
      res.setHeader('Content-Type', 'text/xml; charset=utf-8');
      res.setBody(
        '<?xml version="1.0" encoding="utf-8"?>' +
          '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
          '<soap:Body>' +
          '<soap:Fault>' +
          '<faultcode>soap:Server</faultcode>' +
          '<faultstring>Invalid address format</faultstring>' +
          '</soap:Fault>' +
          '</soap:Body>' +
          '</soap:Envelope>'
      );
      return res;
    }
  }

  private static String buildGetZipCodeResponseBody(
    String zip,
    String matchedAddress
  ) {
    return '<?xml version="1.0" encoding="utf-8"?>' +
      '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
      '<soap:Body>' +
      '<GetZipCodeResponse xmlns="http://tempuri.org/">' +
      '<GetZipCodeResult>' +
      zip +
      '</GetZipCodeResult>' +
      '<address>' +
      matchedAddress +
      '</address>' +
      '</GetZipCodeResponse>' +
      '</soap:Body>' +
      '</soap:Envelope>';
  }

  private static ChunghwaPostZipCodeAction.ChunghwaPostZipCodeRequest buildRequest(
    String address
  ) {
    ChunghwaPostZipCodeAction.ChunghwaPostZipCodeRequest request = new ChunghwaPostZipCodeAction.ChunghwaPostZipCodeRequest();
    request.address = address;
    return request;
  }

  @isTest
  static void testGetZipCodesWithNullRequestListThrows() {
    try {
      Test.startTest();
      ChunghwaPostZipCodeAction.getZipCodes(null);
      Test.stopTest();
      System.assert(
        false,
        'Expected an IllegalArgumentException for a null request list.'
      );
    } catch (IllegalArgumentException ex) {
      System.assert(
        ex.getMessage().contains('No address provided'),
        'Exception message should describe the missing input.'
      );
    }
  }

  @isTest
  static void testGetZipCodesWithBlankAddressReturnsValidationError() {
    List<ChunghwaPostZipCodeAction.ChunghwaPostZipCodeRequest> requests = new List<ChunghwaPostZipCodeAction.ChunghwaPostZipCodeRequest>{
      buildRequest('')
    };

    Test.startTest();
    List<ChunghwaPostZipCodeAction.ChunghwaPostZipCodeResponse> responses = ChunghwaPostZipCodeAction.getZipCodes(
      requests
    );
    Test.stopTest();

    System.assertEquals(
      1,
      responses.size(),
      'One response should be returned for one request.'
    );
    System.assertEquals(
      false,
      responses[0].isSuccess,
      'A blank address should not attempt a callout and should fail validation.'
    );
    System.assertEquals(
      ChunghwaPostZipCodeAction.ERROR_TYPE_VALIDATION,
      responses[0].errorType,
      'A blank address should surface a validation error type.'
    );
  }

  @isTest
  static void testGetZipCodesWithSuccessfulResponsesResolvesEachAddress() {
    Test.setMock(HttpCalloutMock.class, new SuccessMock());

    List<ChunghwaPostZipCodeAction.ChunghwaPostZipCodeRequest> requests = new List<ChunghwaPostZipCodeAction.ChunghwaPostZipCodeRequest>{
      buildRequest(TAIPEI_ADDRESS),
      buildRequest(KAOHSIUNG_ADDRESS)
    };

    Test.startTest();
    List<ChunghwaPostZipCodeAction.ChunghwaPostZipCodeResponse> responses = ChunghwaPostZipCodeAction.getZipCodes(
      requests
    );
    Test.stopTest();

    System.assertEquals(
      2,
      responses.size(),
      'One response should be returned per request.'
    );

    System.assertEquals(
      true,
      responses[0].isSuccess,
      'The Taipei address should resolve successfully.'
    );
    System.assertEquals(
      TAIPEI_ZIP,
      responses[0].zipCode,
      'The Taipei address should resolve to its 6-digit zip code.'
    );
    System.assertEquals(
      TAIPEI_MATCHED_ADDRESS,
      responses[0].matchedAddress,
      'The matched address should come from the SOAP response.'
    );

    System.assertEquals(
      true,
      responses[1].isSuccess,
      'The Kaohsiung address should resolve successfully.'
    );
    System.assertEquals(
      KAOHSIUNG_ZIP,
      responses[1].zipCode,
      'The Kaohsiung address should resolve to its own 6-digit zip code.'
    );
  }

  @isTest
  static void testGetZipCodesWithNoMatchReturnsUnsuccessful() {
    Test.setMock(HttpCalloutMock.class, new SuccessMock());

    List<ChunghwaPostZipCodeAction.ChunghwaPostZipCodeRequest> requests = new List<ChunghwaPostZipCodeAction.ChunghwaPostZipCodeRequest>{
      buildRequest('不存在的地址12345')
    };

    Test.startTest();
    List<ChunghwaPostZipCodeAction.ChunghwaPostZipCodeResponse> responses = ChunghwaPostZipCodeAction.getZipCodes(
      requests
    );
    Test.stopTest();

    System.assertEquals(
      false,
      responses[0].isSuccess,
      'An address with no matching zip code should be marked unsuccessful.'
    );
    System.assertEquals(
      ChunghwaPostZipCodeAction.ERROR_TYPE_NO_MATCH,
      responses[0].errorType,
      'A blank GetZipCodeResult should surface a no-match error type.'
    );
  }

  @isTest
  static void testGetZipCodesWithHttpErrorReturnsUnsuccessful() {
    Test.setMock(HttpCalloutMock.class, new HttpErrorMock());

    List<ChunghwaPostZipCodeAction.ChunghwaPostZipCodeRequest> requests = new List<ChunghwaPostZipCodeAction.ChunghwaPostZipCodeRequest>{
      buildRequest(TAIPEI_ADDRESS)
    };

    Test.startTest();
    List<ChunghwaPostZipCodeAction.ChunghwaPostZipCodeResponse> responses = ChunghwaPostZipCodeAction.getZipCodes(
      requests
    );
    Test.stopTest();

    System.assertEquals(
      false,
      responses[0].isSuccess,
      'A non-200 response should be marked unsuccessful.'
    );
    System.assertEquals(
      ChunghwaPostZipCodeAction.ERROR_TYPE_HTTP,
      responses[0].errorType,
      'A non-200 response should surface an HTTP error type.'
    );
  }

  @isTest
  static void testGetZipCodesWithSoapFaultReturnsUnsuccessful() {
    Test.setMock(HttpCalloutMock.class, new SoapFaultMock());

    List<ChunghwaPostZipCodeAction.ChunghwaPostZipCodeRequest> requests = new List<ChunghwaPostZipCodeAction.ChunghwaPostZipCodeRequest>{
      buildRequest(TAIPEI_ADDRESS)
    };

    Test.startTest();
    List<ChunghwaPostZipCodeAction.ChunghwaPostZipCodeResponse> responses = ChunghwaPostZipCodeAction.getZipCodes(
      requests
    );
    Test.stopTest();

    System.assertEquals(
      false,
      responses[0].isSuccess,
      'A SOAP fault should be marked unsuccessful.'
    );
    System.assertEquals(
      'Invalid address format',
      responses[0].errorMessage,
      'The fault string from the SOAP fault should surface as the error message.'
    );
  }
}