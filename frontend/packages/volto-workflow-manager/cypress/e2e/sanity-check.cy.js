describe('Workflow Manager - Sanity Check', () => {
  before(() => {
    cy.createTestWorkflow();
  });

  beforeEach(() => {
    cy.goToTestWorkflow();
  });

  it('should run sanity check and view results', () => {
    cy.contains('button', 'Sanity Check', { timeout: 3000 })
      .should('be.visible')
      .click();

    cy.contains('button', 'View Validation Results', {
      timeout: 3000,
    })
      .should('be.visible')
      .click();

    cy.get('[role="alertdialog"]', { timeout: 3000 }).should('be.visible');

    cy.get('[role="alertdialog"]').within(() => {
      cy.contains('Validation Results').should('be.visible');

      cy.contains('button', 'Close').click();
    });

    cy.get('[role="alertdialog"]').should('not.exist');
  });
});
