public with sharing class ExperienceController {
    public static List<ASR_Experience__c> getExperiences(Id contactId) {
        // Retrieve contact's interests
        List<ASR_Customer_Interest__c> interests = [
            SELECT Interest_Type__c
            FROM ASR_Customer_Interest__c
            WHERE Contact__c = :contactId
            WITH USER_MODE
        ];

        List<String> interestList = new List<String>();

        for (ASR_Customer_Interest__c ci : interests) {
            interestList.add(ci.Interest_Type__c);
        }

        // Get related experiences
        List<ASR_Experience__c> experiences = [
            SELECT Name, Duration_Hours__c, Start_Time__c, Type__c
            FROM ASR_Experience__c
            WHERE Type__c IN :interestList
            WITH USER_MODE
        ];

        return experiences;
    }
}
