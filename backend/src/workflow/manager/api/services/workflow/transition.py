import json
from Products.DCWorkflow.Transitions import TRIGGER_AUTOMATIC, TRIGGER_USER_ACTION
from plone.restapi.deserializer import json_body
from plone.restapi.services import Service
from workflow.manager import _
from workflow.manager.api.services.workflow.base import Base
from workflow.manager.utils import clone_transition
from zope.interface import implementer
from zope.publisher.interfaces import IPublishTraverse

# Helper function to serialize a transition object to a dictionary.
def serialize_transition(transition):
    """Serializes a workflow transition object to a dictionary."""
    if not transition:
        return None
    guard = transition.getGuard()
    return {
        'id': transition.id,
        'title': transition.title,
        'description': transition.description,
        'new_state_id': transition.new_state_id,
        'trigger_type': transition.trigger_type,
        'actbox_name': transition.actbox_name,
        'guard': {
            'permissions': guard.permissions,
            'roles': guard.roles,
            'groups': guard.groups,
        }
    }


@implementer(IPublishTraverse)
class EditTransition(Service):
    """
    Provides all data needed to build the transition editing UI.
    Endpoint: GET /@workflows/{workflow_id}/@transitions/{transition_id}
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        workflow_id, transition_id = self.params[0], self.params[2]
        base = Base(self.context, self.request, workflow_id=workflow_id, transition_id=transition_id)

        if not base.selected_workflow or not base.selected_transition:
            self.request.response.setStatus(404)
            return {"error": "Workflow or Transition not found."}

        transition = base.selected_transition
        workflow = base.selected_workflow

        return {
            "transition": serialize_transition(transition),
            "states_with_this_transition": [
                s.id for s in base.available_states if transition.id in s.transitions
            ],
            "available_states": [{'id': s.id, 'title': s.title} for s in base.available_states],
            "available_transitions": [{'id': t.id, 'title': t.title} for t in base.available_transitions],
            "guard_options": {
                "permissions": base.allowed_guard_permissions,
                "roles": workflow.getAvailableRoles(),
                "groups": base.getGroups()
            }
        }


@implementer(IPublishTraverse)
class AddTransition(Service):
    """
    Creates a new transition within a workflow.
    Endpoint: POST /@workflows/{workflow_id}/@transitions
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        workflow_id = self.params[0]
        base = Base(self.context, self.request, workflow_id=workflow_id)
        body = json_body(self.request)

        if not base.selected_workflow:
            self.request.response.setStatus(404)
            return {"error": f"Workflow '{workflow_id}' not found."}

        title = body.get('title')
        if not title:
            self.request.response.setStatus(400)
            return {"error": "A 'title' for the new transition is required."}

        base.authorize()
        transition_id = title.strip().replace(" ", "_").lower()
        if transition_id in base.selected_workflow.transitions:
            self.request.response.setStatus(409)
            return {"error": f"Transition with id '{transition_id}' already exists."}

        workflow = base.selected_workflow
        workflow.transitions.addTransition(transition_id)
        new_transition = workflow.transitions[transition_id]
        new_transition.title = title

        clone_from_id = body.get('clone_from_id')
        if clone_from_id and clone_from_id in workflow.transitions:
            clone_transition(new_transition, workflow.transitions[clone_from_id])
        else:
            # This logic is directly from the old AddTransition class
            new_transition.actbox_name = title
            new_transition.actbox_url = f"%(content_url)s/content_status_modify?workflow_action={transition_id}"
            new_transition.actbox_category = 'workflow'

        self.request.response.setStatus(201)
        return serialize_transition(new_transition)


@implementer(IPublishTraverse)
class SaveTransition(Service):
    """
    Updates an existing transition from a JSON payload.
    Endpoint: PATCH /@workflows/{workflow_id}/@transitions/{transition_id}
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        workflow_id, transition_id = self.params[0], self.params[2]
        base = Base(self.context, self.request, workflow_id=workflow_id, transition_id=transition_id)
        body = json_body(self.request)

        if not base.selected_workflow or not base.selected_transition:
            self.request.response.setStatus(404)
            return {"error": "Workflow or Transition not found."}

        base.authorize()
        transition = base.selected_transition

        # Update basic properties
        if 'title' in body:
            transition.title = body['title']
        if 'description' in body:
            transition.description = body['description']
        if 'new_state_id' in body:
            transition.new_state_id = body['new_state_id']
        if 'actbox_name' in body:
            transition.actbox_name = body['actbox_name']
        if 'trigger_type' in body:
            transition.trigger_type = body['trigger_type']

        # Update guard
        if 'guard' in body:
            guard = transition.getGuard()
            guard_data = body['guard']
            if 'permissions' in guard_data:
                guard.permissions = tuple(guard_data['permissions'])
            if 'roles' in guard_data:
                guard.roles = tuple(guard_data['roles'])
            if 'groups' in guard_data:
                guard.groups = tuple(guard_data['groups'])
            transition.guard = guard

        # Update which states have this transition
        if 'states_with_this_transition' in body:
            new_state_ids = set(body['states_with_this_transition'])
            for state in base.available_states:
                has_transition = transition.id in state.transitions
                should_have_transition = state.id in new_state_ids
                if should_have_transition and not has_transition:
                    state.transitions += (transition.id,)
                elif not should_have_transition and has_transition:
                    state.transitions = tuple(t for t in state.transitions if t != transition.id)

        return self.reply_no_content()


@implementer(IPublishTraverse)
class DeleteTransition(Service):
    """
    Deletes a transition and cleans up references.
    Endpoint: DELETE /@workflows/{workflow_id}/@transitions/{transition_id}
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        workflow_id, transition_id = self.params[0], self.params[2]
        base = Base(self.context, self.request, workflow_id=workflow_id, transition_id=transition_id)

        if not base.selected_workflow or not base.selected_transition:
            self.request.response.setStatus(404)
            return {"error": "Workflow or Transition not found."}

        base.authorize()
        # Delete any associated rules (from old DeleteTransition)
        base.actions.delete_rule_for(base.selected_transition)

        # Delete the transition itself
        base.selected_workflow.transitions.deleteTransitions([transition_id])

        # Clean up dangling references in states (from old DeleteTransition)
        for state in base.available_states:
            if transition_id in state.transitions:
                state.transitions = tuple(t for t in state.transitions if t != transition_id)

        return self.reply_no_content()