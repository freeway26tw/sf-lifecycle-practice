public with sharing class ChunghwaPostZipService {
    private static final String ENDPOINT =
        'https://33wsp.post.gov.tw/LZWZIP/TZIP33.asmx';

    private static final String SOAP_NS =
        'http://schemas.xmlsoap.org/soap/envelope/';

    private static final String SERVICE_NS =
        'http://tempuri.org/';

    public class ZipServiceException extends Exception {}

    public class ZipResult {
        // 保留 API 原始文字，不預設一定是六碼郵遞區號。
        public String resultText;
        public String returnedAddress;
    }

    public static ZipResult getZipCode(String addressText) {
        if (String.isBlank(addressText)) {
            throw new ZipServiceException('請提供地址。');
        }

        // Escape XML 特殊字元，避免地址內容破壞 XML。
        String escapedAddress = addressText.trim().escapeXml();

        String requestBody =
            '<?xml version="1.0" encoding="utf-8"?>' +
            '<soap:Envelope xmlns:soap="' + SOAP_NS + '">' +
                '<soap:Body>' +
                    '<GetZipCode xmlns="' + SERVICE_NS + '">' +
                        '<addrStr>' + escapedAddress + '</addrStr>' +
                    '</GetZipCode>' +
                '</soap:Body>' +
            '</soap:Envelope>';

        HttpRequest request = new HttpRequest();
        request.setEndpoint(ENDPOINT);
        request.setMethod('POST');
        request.setHeader('Content-Type', 'text/xml; charset=utf-8');
        request.setHeader(
            'SOAPAction',
            '"http://tempuri.org/GetZipCode"'
        );
        request.setTimeout(20000);
        request.setBody(requestBody);

        HttpResponse response;
        try {
            response = new Http().send(request);
        } catch (System.CalloutException e) {
            throw new ZipServiceException(
                '中華郵政連線失敗：' + e.getMessage()
            );
        }

        Integer statusCode = response.getStatusCode();

        // 先嘗試解析 XML，因為 HTTP 500 也可能包含 SOAP Fault。
        Dom.Document document = new Dom.Document();
        try {
            document.load(response.getBody());
        } catch (Exception e) {
            throw new ZipServiceException(
                '回應不是有效 XML，HTTP ' + statusCode
            );
        }

        Dom.XmlNode envelope = document.getRootElement();
        Dom.XmlNode body = envelope.getChildElement('Body', SOAP_NS);

        if (body == null) {
            throw new ZipServiceException(
                '回應缺少 SOAP Body，HTTP ' + statusCode
            );
        }

        Dom.XmlNode fault = body.getChildElement('Fault', SOAP_NS);
        if (fault != null) {
            Dom.XmlNode faultMessage =
                fault.getChildElement('faultstring', null);

            throw new ZipServiceException(
                '中華郵政 SOAP Fault：' +
                (faultMessage == null
                    ? '未提供錯誤說明'
                    : faultMessage.getText())
            );
        }

        if (statusCode < 200 || statusCode >= 300) {
            throw new ZipServiceException(
                '中華郵政 HTTP 錯誤：' + statusCode
            );
        }

        Dom.XmlNode responseNode =
            body.getChildElement('GetZipCodeResponse', SERVICE_NS);

        if (responseNode == null) {
            throw new ZipServiceException(
                '回應缺少 GetZipCodeResponse。'
            );
        }

        Dom.XmlNode resultNode =
            responseNode.getChildElement('GetZipCodeResult', SERVICE_NS);

        Dom.XmlNode addressNode =
            responseNode.getChildElement('address', SERVICE_NS);

        if (resultNode == null) {
            throw new ZipServiceException(
                '回應缺少 GetZipCodeResult。'
            );
        }

        ZipResult result = new ZipResult();
        result.resultText = resultNode.getText();
        result.returnedAddress =
            addressNode == null ? null : addressNode.getText();

        return result;
    }
}