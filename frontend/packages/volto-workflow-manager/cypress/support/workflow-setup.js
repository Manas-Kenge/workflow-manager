function randomString(length = 5) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join('');
}

Cypress.Commands.add('createTestWorkflow', () => {
  cy.loginAsAdmin();
  cy.goToWorkflowManager();

  cy.wait(2000);

  cy.get('#toolbar-add-workflow')
    .should('exist')
    .scrollIntoView()
    .click({ force: true });

  cy.get('[role="dialog"]').should('be.visible');
  cy.wait(1000);

  const workflowName = `test-workflow-${randomString(8)}`;

  cy.get('[role="dialog"]').within(() => {
    cy.get('[aria-label="New workflow name"]')
      .should('be.visible')
      .clear()
      .type(workflowName);

    cy.get('[aria-label="Select a workflow to clone from"]')
      .should('be.visible')
      .click();
  });

  cy.get('[role="option"]').first().click();

  cy.get('[role="dialog"]').within(() => {
    cy.contains('button', 'Add')
      .should('not.be.disabled')
      .should('be.visible')
      .click();
  });

  cy.url().should('include', 'workflow=');

  cy.url().then((url) => {
    const workflowParam = url.split('workflow=')[1];
    if (workflowParam) {
      cy.writeFile('cypress/fixtures/test-workflow-id.json', {
        workflowId: workflowParam,
        workflowName: workflowName,
      });
    }
  });

  cy.get('#toolbar-saving-workflow').should('exist');
  cy.log(`Created test workflow: ${workflowName}`);
});

Cypress.Commands.add('goToTestWorkflow', () => {
  cy.readFile('cypress/fixtures/test-workflow-id.json').then((data) => {
    if (!data || !data.workflowId) {
      throw new Error(
        'No test workflow found. Make sure createTestWorkflow was called first.',
      );
    }

    cy.log(
      `Navigating to test workflow: ${data.workflowName || data.workflowId}`,
    );
    cy.visit(`/controlpanel/workflowmanager?workflow=${data.workflowId}`);
  });

  cy.wait(1000);

  cy.url().should('include', 'workflowmanager');
  cy.url().should('include', 'workflow=');
});
