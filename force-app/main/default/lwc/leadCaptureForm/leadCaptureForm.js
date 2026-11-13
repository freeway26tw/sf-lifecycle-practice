import { LightningElement } from 'lwc';
import createLead from '@salesforce/apex/LeadCaptureController.createLead';

const COUNTRY_OPTIONS = [
    { value: 'TW', label: '台灣' },
    { value: 'CN', label: '中國' },
    { value: 'HK', label: '香港' },
    { value: 'JP', label: '日本' },
    { value: 'US', label: '美國' }
];

const LEAD_SOURCE_OPTIONS = [
    { value: 'Web', label: '網路搜尋' },
    { value: 'Phone Inquiry', label: '電話詢問' },
    { value: 'Partner Referral', label: '合作夥伴推薦' },
    { value: 'Purchased List', label: '名單購買' },
    { value: 'Other', label: '其他' }
];

export default class LeadCaptureForm extends LightningElement {
    subject = '';
    contactName = '';
    email = '';
    phone = '';
    company = '';
    website = '';
    country = COUNTRY_OPTIONS[0].value;
    leadSource = '';
    description = '';

    isSubmitting = false;
    isSuccess = false;
    errorMessage = '';

    get countryOptions() {
        return COUNTRY_OPTIONS.map((option) => ({
            ...option,
            selected: option.value === this.country
        }));
    }

    get leadSourceOptions() {
        const placeholder = { value: '', label: '- Select Value -', selected: this.leadSource === '' };
        const options = LEAD_SOURCE_OPTIONS.map((option) => ({
            ...option,
            selected: option.value === this.leadSource
        }));
        return [placeholder, ...options];
    }

    handleSubjectChange(event) {
        this.subject = event.target.value;
    }

    handleContactNameChange(event) {
        this.contactName = event.target.value;
    }

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handlePhoneChange(event) {
        this.phone = event.target.value;
    }

    handleCompanyChange(event) {
        this.company = event.target.value;
    }

    handleWebsiteChange(event) {
        this.website = event.target.value;
    }

    handleCountryChange(event) {
        this.country = event.target.value;
    }

    handleLeadSourceChange(event) {
        this.leadSource = event.target.value;
    }

    handleDescriptionChange(event) {
        this.description = event.target.value;
    }

    isMissingRequiredField() {
        return (
            !this.subject ||
            !this.contactName ||
            !this.email ||
            !this.phone ||
            !this.company ||
            !this.country ||
            !this.description
        );
    }

    async handleSubmit() {
        if (this.isMissingRequiredField()) {
            this.errorMessage = '請完整填寫所有必填欄位（標示 * 的欄位）。';
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        try {
            await createLead({
                contactName: this.contactName,
                company: this.company,
                email: this.email,
                phone: this.phone,
                website: this.website,
                countryCode: this.country,
                leadSource: this.leadSource,
                subject: this.subject,
                description: this.description
            });
            this.isSuccess = true;
        } catch (error) {
            this.errorMessage = error?.body?.message ?? '送出時發生問題，請稍後再試。';
        } finally {
            this.isSubmitting = false;
        }
    }

    handleReset() {
        this.subject = '';
        this.contactName = '';
        this.email = '';
        this.phone = '';
        this.company = '';
        this.website = '';
        this.country = COUNTRY_OPTIONS[0].value;
        this.leadSource = '';
        this.description = '';
        this.isSuccess = false;
        this.errorMessage = '';
    }
}
