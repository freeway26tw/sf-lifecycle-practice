/**
 * Provides Lightning Web Component access to create Leads from the public-facing demo capture form.
 */
public with sharing class LeadCaptureController {
    /**
     * Creates a single Lead from form input submitted by the LWC. Subject has no standard Lead
     * field, so it is prepended to Description.
     * @param contactName Lead contact name, stored as Last Name (required)
     * @param company Lead company name (required)
     * @param email Lead email address (required)
     * @param phone Lead phone number (required)
     * @param website Lead website URL
     * @param countryCode Lead country ISO code, e.g. "TW" (required; org uses State/Country picklists)
     * @param leadSource Lead source picklist value
     * @param subject Inquiry subject, merged into Description (required)
     * @param description Inquiry details (required)
     * @return The Id of the newly created Lead
     * @throws AuraHandledException when required fields are missing or the insert fails
     * @example
     * const leadId = await createLead({ contactName, company, email, phone, website, country, leadSource, subject, description });
     */
    @AuraEnabled
    public static Id createLead(
        String contactName,
        String company,
        String email,
        String phone,
        String website,
        String countryCode,
        String leadSource,
        String subject,
        String description
    ) {
        if (
            String.isBlank(contactName) ||
            String.isBlank(company) ||
            String.isBlank(email) ||
            String.isBlank(phone) ||
            String.isBlank(countryCode) ||
            String.isBlank(subject) ||
            String.isBlank(description)
        ) {
            throw new AuraHandledException('Please complete all required fields.');
        }

        Lead newLead = new Lead(
            LastName = contactName,
            Company = company,
            Email = email,
            Phone = phone,
            Website = website,
            CountryCode = countryCode,
            LeadSource = leadSource,
            Description = 'Subject: ' + subject + '\n\n' + description
        );

        try {
            insert as user newLead;
        } catch (DmlException dmlException) {
            throw new AuraHandledException('Unable to create lead: ' + dmlException.getDmlMessage(0));
        }

        return newLead.Id;
    }
}