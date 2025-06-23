# -*- coding: utf-8 -*-
"""
A stateless helper base class for workflow API services.

This class provides shared business logic and utility methods for accessing
workflow data. It is initialized by the API service with the relevant IDs
(workflow, state, etc.) which are extracted from the URL path. This makes
it a clean, reusable, and testable utility.
"""
from AccessControl import Unauthorized
from Products.CMFCore.utils import getToolByName
from plone.memoize.view import memoize
from workflow.manager.actionmanager import ActionManager
from workflow.manager.permissions import (
    allowed_guard_permissions,
    managed_permissions,
)
from zope.component import getMultiAdapter
from zope.schema.interfaces import IVocabularyFactory
from zope.component import getUtility
import json


class Base:
    """A stateless helper for workflow API services."""

    def __init__(self, context, request, workflow_id=None, state_id=None, transition_id=None):
        """
        Initialize with context, request, and specific IDs from the service.
        """
        self.context = context
        self.request = request
        self._workflow_id = workflow_id
        self._state_id = state_id
        self._transition_id = transition_id

    # --- Core Plone Tool Properties ---

    @property
    @memoize
    def portal(self):
        """Returns the portal object."""
        return getToolByName(self.context, "portal_url").getPortalObject()

    @property
    @memoize
    def portal_workflow(self):
        """Returns the portal_workflow tool."""
        return getToolByName(self.context, "portal_workflow")

    # --- Selected Object Properties (Driven by __init__) ---

    @property
    @memoize
    def selected_workflow(self):
        """Gets the workflow object based on the ID provided at initialization."""
        if self._workflow_id and self._workflow_id in self.portal_workflow.objectIds():
            return self.portal_workflow.get(self._workflow_id)
        return None

    @property
    @memoize
    def selected_state(self):
        """Gets the state object based on the IDs provided at initialization."""
        workflow = self.selected_workflow
        if workflow and self._state_id and self._state_id in workflow.states.objectIds():
            return workflow.states.get(self._state_id)
        return None

    @property
    @memoize
    def selected_transition(self):
        """Gets the transition object based on the IDs provided at initialization."""
        workflow = self.selected_workflow
        if workflow and self._transition_id and self._transition_id in workflow.transitions.objectIds():
            return workflow.transitions.get(self._transition_id)
        return None

    # --- Available Object Listings ---

    @property
    @memoize
    def available_states(self):
        """Returns sorted states for the selected workflow."""
        if not self.selected_workflow:
            return []
        return sorted(
            self.selected_workflow.states.objectValues(),
            key=lambda x: x.title.lower(),
        )

    @property
    @memoize
    def available_transitions(self):
        """Returns sorted transitions for the selected workflow."""
        if not self.selected_workflow:
            return []
        return sorted(
            self.selected_workflow.transitions.objectValues(),
            key=lambda x: x.title.lower(),
        )

    # --- Utility Methods and Properties ---

    @property
    @memoize
    def actions(self):
        """Returns the ActionManager utility."""
        return ActionManager()

    def authorize(self):
        """Verifies the CSRF token for state-changing requests."""
        authenticator = getMultiAdapter(
            (self.context, self.request), name="authenticator"
        )
        if not authenticator.verify():
            raise Unauthorized("CSRF token validation failed")

    def get_state(self, state_id):
        """Safely gets a state by its ID from the selected workflow."""
        if self.selected_workflow and state_id in self.selected_workflow.states.objectIds():
            return self.selected_workflow.states[state_id]
        return None

    def get_transition(self, transition_id):
        """Safely gets a transition by its ID from the selected workflow."""
        if self.selected_workflow and transition_id in self.selected_workflow.transitions.objectIds():
            return self.selected_workflow.transitions[transition_id]
        return None

    @property
    @memoize
    def managed_permissions(self):
        """Returns permissions managed by this workflow."""
        if not self.selected_workflow:
            return []
        return managed_permissions(self.selected_workflow.getId())

    @property
    @memoize
    def allowed_guard_permissions(self):
        """Returns permissions allowed in transition guards."""
        if not self.selected_workflow:
            return []
        return allowed_guard_permissions(self.selected_workflow.getId())

    @property
    @memoize
    def assignable_types(self):
        """Returns a list of all user-friendly content types."""
        vocab_factory = getUtility(IVocabularyFactory,
            name="plone.app.vocabularies.ReallyUserFriendlyTypes")
        return sorted(
            [{"id": v.value, "title": v.title} for v in vocab_factory(self.context)],
            key=lambda v: v['title']
        )

    def get_assigned_types_for(self, workflow_id):
        """Returns a list of content type IDs assigned to a workflow."""
        assigned = []
        for p_type, chain in self.portal_workflow.listChainOverrides():
            if workflow_id in chain:
                assigned.append(p_type)
        return assigned

    def getGroups(self):
        """Gets a list of all groups in the portal."""
        # This is a simplified version of the original getGroups.
        # The original was tied to Acquisition, which is less common now.
        acl_users = getToolByName(self.context, 'acl_users')
        return sorted(
            [
                {'id': g.getId(), 'title': g.getProperty('title') or g.getId()}
                for g in acl_users.source_groups.getGroups()
            ],
            key=lambda g: g['title'].lower()
        )

    # --- Removed Methods ---
    # The following methods were removed as they are specific to classic
    # Plone page templates and not used by REST API services:
    # - handle_response, wrap_template, render_*
    # - get_url, next_url
    # - context_state