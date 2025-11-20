function randomString(length = 5) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join('');
}

describe('Workflow Manager - Add State', () => {
  before(() => {
    cy.createTestWorkflow();
  });

  beforeEach(() => {
    cy.goToTestWorkflow();
  });

  it('should add a new state to the workflow', () => {
    cy.contains('button', 'Add State').click();

    cy.get('[role="dialog"]').should('be.visible');

    cy.get('[role="dialog"]').within(() => {
      const stateName = `test-state-${randomString(5)}`;
      cy.get('[aria-label="State name"]').type(stateName);

      cy.get('[aria-label="State description"]').type('Test state description');

      cy.contains('button', 'Add State').click();
    });

    cy.get('[role="dialog"]').should('not.exist');

    cy.get('body').should('contain', 'test-state-');
  });
});
