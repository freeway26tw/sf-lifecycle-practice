/**
 * Looks up the 6-digit Chunghwa Post postal zip code for a Taiwan mailing address by calling
 * the Chunghwa Post TZIP33 GetZipCode SOAP web service (https://33wsp.post.gov.tw/LZWZIP/TZIP33.asmx).
 * The underlying API accepts a single address string per call, so bulk requests fan out to one
 * HTTP callout per list entry rather than a single batched call.
 */
public with sharing class ChunghwaPostZipCodeAction {
  private static final String ENDPOINT = 'https://33wsp.post.gov.tw/LZWZIP/TZIP33.asmx';
  private static final String SOAP_ACTION = '"http://tempuri.org/GetZipCode"';
  private static final String NS_SOAP_ENVELOPE = 'http://schemas.xmlsoap.org/soap/envelope/';
  private static final String NS_TEMPURI = 'http://tempuri.org/';
  private static final Integer CALLOUT_TIMEOUT_MS = 20000;

  @TestVisible
  private static final String ERROR_TYPE_VALIDATION = 'IllegalArgumentException';
  @TestVisible
  private static final String ERROR_TYPE_HTTP = 'CalloutException';
  @TestVisible
  private static final String ERROR_TYPE_NO_MATCH = 'NoMatchFound';

  /**
   * Flow/Agent input: a single Taiwan mailing address to resolve.
   */
  public class ChunghwaPostZipCodeRequest {
    @InvocableVariable(
      label='Address'
      description='Full Taiwan mailing address to look up, e.g. 台北市信義區市府路1號'
      required=true
    )
    public String address;
  }

  /**
   * Flow/Agent output: the resolved zip code plus the address as matched by Chunghwa Post,
   * or an error description when no match could be resolved.
   */
  public class ChunghwaPostZipCodeResponse {
    @InvocableVariable(
      label='Zip Code'
      description='The 6-digit Chunghwa Post postal zip code'
    )
    public String zipCode;

    @InvocableVariable(
      label='Matched Address'
      description='The address as matched/normalized by Chunghwa Post'
    )
    public String matchedAddress;

    @InvocableVariable(label='Is Success')
    public Boolean isSuccess;

    @InvocableVariable(label='Error Message')
    public String errorMessage;

    @InvocableVariable(label='Error Type')
    public String errorType;
  }

  /**
   * Resolves the 6-digit Chunghwa Post zip code for each requested address.
   * @param requests One Address input per lookup; processed as one callout per entry.
   * @return One response per input, in the same order, each carrying either a resolved
   * zipCode/matchedAddress or an isSuccess=false result with errorMessage/errorType.
   * @throws IllegalArgumentException when requests is null or empty.
   * @example
   * ChunghwaPostZipCodeAction.ChunghwaPostZipCodeRequest req = new ChunghwaPostZipCodeAction.ChunghwaPostZipCodeRequest();
   * req.address = '台北市信義區市府路1號';
   * String zipCode = ChunghwaPostZipCodeAction.getZipCodes(
   *   new List<ChunghwaPostZipCodeAction.ChunghwaPostZipCodeRequest>{ req }
   * )[0].zipCode;
   */
  @InvocableMethod(
    label='Get Chunghwa Post Zip Code'
    description='Looks up the 6-digit Chunghwa Post postal zip code for one or more Taiwan addresses.'
    category='Address'
    callout=true
  )
  public static List<ChunghwaPostZipCodeResponse> getZipCodes(
    List<ChunghwaPostZipCodeRequest> requests
  ) {
    if (requests == null || requests.isEmpty()) {
      throw new IllegalArgumentException(
        'No address provided to ChunghwaPostZipCodeAction.'
      );
    }

    List<ChunghwaPostZipCodeResponse> responses = new List<ChunghwaPostZipCodeResponse>();
    for (ChunghwaPostZipCodeRequest request : requests) {
      responses.add(lookupZipCode(request));
    }
    return responses;
  }

  private static ChunghwaPostZipCodeResponse lookupZipCode(
    ChunghwaPostZipCodeRequest request
  ) {
    ChunghwaPostZipCodeResponse response = new ChunghwaPostZipCodeResponse();

    if (request == null || String.isBlank(request.address)) {
      response.isSuccess = false;
      response.errorMessage = 'Address is required.';
      response.errorType = ERROR_TYPE_VALIDATION;
      return response;
    }

    try {
      HttpResponse calloutResponse = sendGetZipCodeRequest(request.address);

      if (calloutResponse.getStatusCode() != 200) {
        response.isSuccess = false;
        response.errorMessage =
          'Chunghwa Post service returned HTTP ' +
          calloutResponse.getStatusCode() +
          ': ' +
          calloutResponse.getStatus();
        response.errorType = ERROR_TYPE_HTTP;
        return response;
      }

      parseZipCodeResponse(calloutResponse.getBody(), response);
      response.isSuccess = String.isNotBlank(response.zipCode);

      if (!response.isSuccess) {
        response.errorMessage = 'No matching zip code was found for the given address.';
        response.errorType = ERROR_TYPE_NO_MATCH;
      }
    } catch (Exception ex) {
      response.isSuccess = false;
      response.errorMessage = ex.getMessage();
      response.errorType = ex.getTypeName();
    }

    return response;
  }

  private static HttpResponse sendGetZipCodeRequest(String address) {
    HttpRequest req = new HttpRequest();
    req.setEndpoint(ENDPOINT);
    req.setMethod('POST');
    req.setHeader('Content-Type', 'text/xml; charset=utf-8');
    req.setHeader('SOAPAction', SOAP_ACTION);
    req.setTimeout(CALLOUT_TIMEOUT_MS);
    req.setBody(buildGetZipCodeEnvelope(address));

    Http http = new Http();
    return http.send(req);
  }

  private static String buildGetZipCodeEnvelope(String address) {
    return '<?xml version="1.0" encoding="utf-8"?>' +
      '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="' +
      NS_SOAP_ENVELOPE +
      '">' +
      '<soap:Body>' +
      '<GetZipCode xmlns="' +
      NS_TEMPURI +
      '">' +
      '<addrStr>' +
      escapeXmlText(address) +
      '</addrStr>' +
      '</GetZipCode>' +
      '</soap:Body>' +
      '</soap:Envelope>';
  }

  private static String escapeXmlText(String value) {
    return value
      .replace('&', '&amp;')
      .replace('<', '&lt;')
      .replace('>', '&gt;')
      .replace('\'', '&apos;')
      .replace('"', '&quot;');
  }

  private static void parseZipCodeResponse(
    String responseBody,
    ChunghwaPostZipCodeResponse response
  ) {
    Dom.Document doc = new Dom.Document();
    doc.load(responseBody);

    Dom.XMLNode envelope = doc.getRootElement();
    Dom.XMLNode body = envelope?.getChildElement('Body', NS_SOAP_ENVELOPE);
    Dom.XMLNode fault = body?.getChildElement('Fault', NS_SOAP_ENVELOPE);

    if (fault != null) {
      Dom.XMLNode faultString = fault.getChildElement('faultstring', null);
      throw new ChunghwaPostZipCodeException(
        faultString != null
          ? faultString.getText()
          : 'Chunghwa Post service returned a SOAP fault.'
      );
    }

    Dom.XMLNode responseNode = body
      ?.getChildElement('GetZipCodeResponse', NS_TEMPURI);
    if (responseNode == null) {
      throw new ChunghwaPostZipCodeException(
        'Unexpected response format from Chunghwa Post service.'
      );
    }

    Dom.XMLNode resultNode = responseNode.getChildElement(
      'GetZipCodeResult',
      NS_TEMPURI
    );
    Dom.XMLNode addressNode = responseNode.getChildElement(
      'address',
      NS_TEMPURI
    );

    response.zipCode = resultNode?.getText();
    response.matchedAddress = addressNode?.getText();
  }

  private class ChunghwaPostZipCodeException extends Exception {
  }
}