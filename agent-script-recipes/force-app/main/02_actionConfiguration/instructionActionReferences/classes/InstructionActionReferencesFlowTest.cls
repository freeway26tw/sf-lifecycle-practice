/**
 * @description Test class for Instruction Action References Flows
 * Tests the CreateCase flow used in the instruction action references recipe
 */
@IsTest
private class InstructionActionReferencesFlowTest {
    @IsTest
    static void testCreateCaseSuccess() {
        // Set input variables for the flow
        Map<String, Object> inputs = new Map<String, Object>();
        inputs.put('subject', 'Test Case Subject');

        // Run the flow
        Test.startTest();
        Flow.Interview.CreateCase flowInterview = new Flow.Interview.CreateCase(
            inputs
        );
        flowInterview.start();
        Test.stopTest();

        // Verify the expected outcome
        String caseNumber = (String) flowInterview.getVariableValue(
            'case_number'
        );

        Assert.areNotEqual(null, caseNumber, 'Case number should be returned');
        Assert.areEqual(
            '00001234',
            caseNumber,
            'Case number should match the expected stub value'
        );
    }
}
