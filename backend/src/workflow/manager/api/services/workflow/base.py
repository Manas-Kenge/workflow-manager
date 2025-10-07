from AccessControl import Unauthorized
from Products.CMFCore.utils import getToolByName
from plone.memoize.view import memoize
from plone.protect.interfaces import IDisableCSRFProtection
from workflow.manager.actionmanager import ActionManager
from workflow.manager.permissions import (
    allowed_guard_permissions,
    managed_permissions,
)
from zope.component import getMultiAdapter
from zope.interface import alsoProvides
from zope.schema.interfaces import IVocabularyFactory
from zope.component import getUtility
import json


class Base:
    def __init__(self, context, request, workflow_id=None, state_id=None, transition_id=None):
        self.context = context
        self.request = request
        self._workflow_id = workflow_id
        self._state_id = state_id
        self._transition_id = transition_id

    @property
    @memoize
    def portal(self):
        return getToolByName(self.context, "portal_url").getPortalObject()

    @property
    @memoize
    def portal_workflow(self):
        return getToolByName(self.context, "portal_workflow")

    @property
    @memoize
    def portal_types(self):
        return getToolByName(self.context, "portal_types")

    @property
    @memoize
    def selected_workflow(self):
        if self._workflow_id and self._workflow_id in self.portal_workflow.objectIds():
            return self.portal_workflow.get(self._workflow_id)
        return None

    @property
    @memoize
    def selected_state(self):
        workflow = self.selected_workflow
        if workflow and self._state_id and self._state_id in workflow.states.objectIds():
            return workflow.states.get(self._state_id)
        return None

    @property
    @memoize
    def selected_transition(self):
        workflow = self.selected_workflow
        if workflow and self._transition_id and self._transition_id in workflow.transitions.objectIds():
            return workflow.transitions.get(self._transition_id)
        return None

    @property
    @memoize
    def available_states(self):
        if not self.selected_workflow:
            return []
        return sorted(
            self.selected_workflow.states.objectValues(),
            key=lambda x: x.title.lower(),
        )

    @property
    @memoize
    def available_transitions(self):
        if not self.selected_workflow:
            return []
        return sorted(
            self.selected_workflow.transitions.objectValues(),
            key=lambda x: x.title.lower(),
        )

    @property
    @memoize
    def actions(self):
        return ActionManager()

    def authorize(self):
        authenticator = getMultiAdapter(
            (self.context, self.request), name="authenticator"
        )
        if not authenticator.verify():
            raise Unauthorized("CSRF token validation failed")

    def disable_csrf_protection(self):
        alsoProvides(self.request, IDisableCSRFProtection)

    def get_csrf_token(self):
        authenticator = getMultiAdapter(
            (self.context, self.request), name="authenticator"
        )
        return authenticator.token()

    def validate_csrf_token(self, token):
        try:
            authenticator = getMultiAdapter(
                (self.context, self.request), name="authenticator"
            )
            original_token = self.request.form.get('_authenticator')
            self.request.form['_authenticator'] = token

            result = authenticator.verify()

            if original_token is not None:
                self.request.form['_authenticator'] = original_token
            else:
                self.request.form.pop('_authenticator', None)

            return result
        except Exception:
            return False

    def get_state(self, state_id):
        if self.selected_workflow and state_id in self.selected_workflow.states.objectIds():
            return self.selected_workflow.states[state_id]
        return None

    def get_transition(self, transition_id):
        if self.selected_workflow and transition_id in self.selected_workflow.transitions.objectIds():
            return self.selected_workflow.transitions[transition_id]
        return None

    @property
    @memoize
    def managed_permissions(self):
        if not self.selected_workflow:
            return []
        return managed_permissions(self.selected_workflow.getId())

    @property
    @memoize
    def allowed_guard_permissions(self):
        if not self.selected_workflow:
            return []
        return allowed_guard_permissions(self.selected_workflow.getId())

    @property
    @memoize
    def assignable_types(self):
        vocab_factory = getUtility(IVocabularyFactory,
            name="plone.app.vocabularies.ReallyUserFriendlyTypes")
        return sorted(
            [{"id": v.value, "title": v.title} for v in vocab_factory(self.context)],
            key=lambda v: v['title']
        )

    def get_assignable_types_for(self, workflow_id):
        assigned_types = self._get_assigned_types_for(workflow_id)

        vocab_factory = getUtility(IVocabularyFactory,
            name="plone.app.vocabularies.ReallyUserFriendlyTypes")
        all_types = vocab_factory(self.context)

        assignable_types = []
        for term in all_types:
            if term.value not in assigned_types:
                assignable_types.append({
                    "id": term.value,
                    "title": term.title
                })

        return sorted(assignable_types, key=lambda v: v['title'])

    def _get_assigned_types_for(self, workflow_id):
        assigned = []
        for p_type, chain in self.portal_workflow.listChainOverrides():
            if workflow_id in chain:
                assigned.append(p_type)
        return assigned

    def getGroups(self):
        acl_users = getToolByName(self.context, 'acl_users')
        return sorted(
            [
                {'id': g.getId(), 'title': g.getProperty('title') or g.getId()}
                for g in acl_users.source_groups.getGroups()
            ],
            key=lambda g: g['title'].lower()
        )
