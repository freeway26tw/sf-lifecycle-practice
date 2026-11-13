@IsTest
private class ChunghwaPostZipServiceTest {
    private class PostMock implements HttpCalloutMock {
        private Boolean returnFault;

        PostMock(Boolean returnFault) {
            this.returnFault = returnFault;
        }

        public HttpResponse respond(HttpRequest request) {
            System.assertEquals('POST', request.getMethod());
            System.assertEquals(
                '"http://tempuri.org/GetZipCode"',
                request.getHeader('SOAPAction')
            );

            // 確認地址中的 & 被正確編碼且可還原。
            Dom.Document requestDoc = new Dom.Document();
            requestDoc.load(request.getBody());

            Dom.XmlNode soapBody =
                requestDoc.getRootElement().getChildElement(
                    'Body',
                    'http://schemas.xmlsoap.org/soap/envelope/'
                );

            String sentAddress =
                soapBody.getChildElement(
                    'GetZipCode', 'http://tempuri.org/'
                ).getChildElement(
                    'addrStr', 'http://tempuri.org/'
                ).getText();

            System.assertEquals('測試地址 A&B', sentAddress);

            HttpResponse response = new HttpResponse();
            response.setHeader('Content-Type', 'text/xml; charset=utf-8');
            response.setStatusCode(returnFault ? 500 : 200);

            String bodyContent = returnFault
                ? '<soap:Fault>' +
                    '<faultcode>soap:Server</faultcode>' +
                    '<faultstring>Service unavailable</faultstring>' +
                  '</soap:Fault>'
                : '<GetZipCodeResponse xmlns="http://tempuri.org/">' +
                    '<GetZipCodeResult>123456</GetZipCodeResult>' +
                    '<address>測試回傳地址</address>' +
                  '</GetZipCodeResponse>';

            response.setBody(
                '<soap:Envelope xmlns:soap="' +
                'http://schemas.xmlsoap.org/soap/envelope/">' +
                    '<soap:Body>' + bodyContent + '</soap:Body>' +
                '</soap:Envelope>'
            );
            return response;
        }
    }

    @IsTest
    static void parsesSuccessfulResponse() {
        Test.setMock(HttpCalloutMock.class, new PostMock(false));

        Test.startTest();
        ChunghwaPostZipService.ZipResult result =
            ChunghwaPostZipService.getZipCode('測試地址 A&B');
        Test.stopTest();

        System.assertEquals('123456', result.resultText);
        System.assertEquals('測試回傳地址', result.returnedAddress);
    }

    @IsTest
    static void handlesSoapFault() {
        Test.setMock(HttpCalloutMock.class, new PostMock(true));

        Test.startTest();
        try {
            ChunghwaPostZipService.getZipCode('測試地址 A&B');
            System.assert(false, '預期應拋出 SOAP Fault 例外');
        } catch (ChunghwaPostZipService.ZipServiceException e) {
            System.assert(e.getMessage().contains('SOAP Fault'));
        }
        Test.stopTest();
    }

    @IsTest
    static void rejectsBlankAddress() {
        try {
            ChunghwaPostZipService.getZipCode(' ');
            System.assert(false, '預期應拒絕空白地址');
        } catch (ChunghwaPostZipService.ZipServiceException e) {
            System.assertEquals('請提供地址。', e.getMessage());
        }
    }
}