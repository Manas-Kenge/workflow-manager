// Custom commands for Workflow Manager e2e testing

Cypress.Commands.add(
  'loginAsAdmin',
  (username = 'admin', password = 'admin') => {
    cy.visit('/login');

    cy.get(
      'input[name="login"], input[name="__ac_name"], input[id="login-name"]',
    )
      .first()
      .type(username);

    cy.get(
      'input[name="password"], input[name="__ac_password"], input[type="password"]',
    )
      .first()
      .type(password);

    cy.get(
      'input[type="submit"], button[type="submit"], button:contains("Log in")',
    )
      .first()
      .click();

    cy.url().should('not.include', '/login');
  },
);

Cypress.Commands.add('goToWorkflowManager', () => {
  cy.visit('/controlpanel/workflowmanager');
});
