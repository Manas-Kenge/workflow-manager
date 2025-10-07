function randomString(length = 5) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join('');
}

describe('Workflow Manager - Create Workflow', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.goToWorkflowManager();
  });

  it('should create a new workflow by cloning a base workflow', () => {
    cy.wait(2000);

    cy.get('#toolbar-add-workflow').should('exist').scrollIntoView();

    cy.get('#toolbar-add-workflow').click({ force: true });

    cy.get('[role="dialog"]').should('be.visible');

    cy.get('[role="dialog"]').within(() => {
      const workflowName = `test-workflow-${randomString(5)}`;

      cy.get('[aria-label="New workflow name"]').type(workflowName);

      cy.get('[aria-label="Select a workflow to clone from"]').should(
        'be.visible',
      );
      cy.get('[aria-label="Select a workflow to clone from"]').click();
    });

    cy.get('[role="option"]').first().click();

    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Add').should('not.be.disabled').click();
    });

    cy.url().should('include', 'workflow=');

    cy.get('#toolbar-saving-workflow').should('exist');
  });

  it('should handle dialog cancellation', () => {
    cy.wait(2000);

    cy.get('#toolbar-add-workflow').should('exist').scrollIntoView();
    cy.get('#toolbar-add-workflow').click({ force: true });

    cy.get('[role="dialog"]').should('be.visible');

    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Cancel').click();
    });

    cy.get('[role="dialog"]').should('not.exist');
  });
});
