describe('Workflow Manager - Assign Workflow', () => {
  before(() => {
    cy.createTestWorkflow();
  });

  beforeEach(() => {
    cy.goToTestWorkflow();
  });

  it('should assign workflow to content types', () => {
    cy.wait(3000);

    cy.contains('button', 'Assign').click();

    cy.get('[role="dialog"]').should('be.visible');

    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Select').click();
    });

    cy.get('[role="option"]').first().click();

    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Assign').should('not.be.disabled').click();
    });

    cy.get('[role="dialog"]').should('not.exist');
  });
});
