public with sharing class AccountBillingZipAction {
    public class Request {
        @InvocableVariable(label='帳單縣市／省')
        public String billingState;

        @InvocableVariable(label='帳單城市／行政區')
        public String billingCity;

        @InvocableVariable(label='帳單街道' required=true)
        public String billingStreet;
    }

    public class Result {
        @InvocableVariable(label='查詢成功')
        public Boolean success;

        @InvocableVariable(label='郵遞區號')
        public String postalCode;

        @InvocableVariable(label='訊息')
        public String message;
    }

    @InvocableMethod(
        label='查詢中華郵政帳單郵遞區號'
        description='依帳單地址查詢郵遞區號，供 Flow 更新 Account'
        callout=true
    )
    public static List<Result> lookup(List<Request> requests) {
        List<Result> results = new List<Result>();

        for (Request item : requests) {
            Result output = new Result();
            output.success = false;

            if (item == null || String.isBlank(item.billingStreet)) {
                output.message = '請先填寫並儲存帳單街道地址。';
                results.add(output);
                continue;
            }

            String fullAddress =
                clean(item.billingState) +
                clean(item.billingCity) +
                clean(item.billingStreet);

            try {
                ChunghwaPostZipService.ZipResult response =
                    ChunghwaPostZipService.getZipCode(fullAddress);

                String code = response.resultText == null
                    ? ''
                    : response.resultText.trim();

                // 此版本只接受純六碼的 3+3 郵遞區號。
                // 避免把錯誤訊息或其他格式寫進郵遞區號欄位。
                if (!Pattern.matches('^[0-9]{6}$', code)) {
                    output.message =
                        'API 未回傳純六碼郵遞區號，未更新資料。' +
                        '請確認地址與 API 實際回傳格式。';
                } else {
                    output.success = true;
                    output.postalCode = code;
                    output.message = '查詢成功。';
                }
            } catch (Exception e) {
                output.message = '查詢失敗：' + e.getMessage();
            }

            results.add(output);
        }

        return results;
    }

    private static String clean(String value) {
        return String.isBlank(value)
            ? ''
            : value.trim().replace('\r', '').replace('\n', '');
    }
}