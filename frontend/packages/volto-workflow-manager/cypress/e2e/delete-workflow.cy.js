describe('Workflow Manager - Delete Workflow', () => {
  before(() => {
    cy.createTestWorkflow();
  });

  beforeEach(() => {
    cy.goToTestWorkflow();
  });

  it('should delete a workflow from the workflow table', () => {
    cy.visit('/controlpanel/workflowmanager');
    cy.wait(3000);

    cy.get('[aria-label="Workflow table"]').should('be.visible');

    cy.readFile('cypress/fixtures/test-workflow-id.json').then((data) => {
      const workflowName = data.workflowName || data.workflowId;

      cy.get('[aria-label="Workflow table"]').within(() => {
        cy.contains('[role="row"]', workflowName).within(() => {
          cy.get('[aria-label="Workflow actions"]').click();
        });
      });

      cy.get('[role="menu"]').within(() => {
        cy.contains('Delete').click();
      });

      cy.get('[role="dialog"]').should('be.visible');
      cy.get('[role="dialog"]').within(() => {
        cy.contains('button', 'Delete').click();
      });
    });
  });
});
