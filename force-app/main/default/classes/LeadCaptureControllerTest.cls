/**
 * Verifies Lead creation behavior of LeadCaptureController.
 */
@isTest
private class LeadCaptureControllerTest {
    @isTest
    static void testCreateLeadSuccess() {
        Test.startTest();
        Id leadId = LeadCaptureController.createLead(
            'Jane Doe',
            'Acme Inc',
            'jane.doe@example.com',
            '5551234567',
            'https://acme.example.com',
            'TW',
            'Web',
            'Pricing question',
            'Interested in the enterprise plan.'
        );
        Test.stopTest();

        Lead createdLead = [SELECT LastName, Company, Email, Phone, Website, CountryCode, LeadSource, Description FROM Lead WHERE Id = :leadId];
        System.assertEquals('Jane Doe', createdLead.LastName, 'Last name should match contact name input.');
        System.assertEquals('Acme Inc', createdLead.Company, 'Company should match input.');
        System.assertEquals('jane.doe@example.com', createdLead.Email, 'Email should match input.');
        System.assertEquals('5551234567', createdLead.Phone, 'Phone should match input.');
        System.assertEquals('https://acme.example.com', createdLead.Website, 'Website should match input.');
        System.assertEquals('TW', createdLead.CountryCode, 'Country code should match input.');
        System.assertEquals('Web', createdLead.LeadSource, 'Lead source should match input.');
        System.assertEquals(
            'Subject: Pricing question\n\nInterested in the enterprise plan.',
            createdLead.Description,
            'Description should combine subject and description.'
        );
    }

    @isTest
    static void testCreateLeadMissingSubjectThrows() {
        Test.startTest();
        try {
            LeadCaptureController.createLead(
                'Jane Doe',
                'Acme Inc',
                'jane.doe@example.com',
                '5551234567',
                'https://acme.example.com',
                'TW',
                'Web',
                null,
                'Interested in the enterprise plan.'
            );
            System.assert(false, 'Expected an AuraHandledException for missing Subject.');
        } catch (AuraHandledException ex) {
            System.assert(true);
        }
        Test.stopTest();
    }

    @isTest
    static void testCreateLeadMissingCompanyThrows() {
        Test.startTest();
        try {
            LeadCaptureController.createLead(
                'Jane Doe',
                null,
                'jane.doe@example.com',
                '5551234567',
                'https://acme.example.com',
                'TW',
                'Web',
                'Pricing question',
                'Interested in the enterprise plan.'
            );
            System.assert(false, 'Expected an AuraHandledException for missing Company.');
        } catch (AuraHandledException ex) {
            System.assert(true);
        }
        Test.stopTest();
    }
}