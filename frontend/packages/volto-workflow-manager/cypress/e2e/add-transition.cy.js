function randomString(length = 5) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join('');
}

describe('Workflow Manager - Add Transition', () => {
  before(() => {
    cy.createTestWorkflow();
  });

  beforeEach(() => {
    cy.goToTestWorkflow();
  });

  it('should add a new transition to the workflow', () => {
    cy.contains('button', 'Add Transition').click();

    cy.get('[role="dialog"]').should('be.visible');

    cy.get('[role="dialog"]').within(() => {
      cy.get(
        '[aria-label="Select the destination state for the transition"]',
      ).click();
    });

    cy.get('[role="option"]').first().click();

    cy.get('[role="dialog"]').within(() => {
      const transitionName = `test-transition-${randomString(5)}`;
      cy.get('[aria-label="New transition name"]').type(transitionName);

      cy.get('[aria-label="Transition description"]').type(
        'Test transition description',
      );

      cy.contains('button', 'Add Transition').click();
    });

    cy.wait(3000);
  });
});
