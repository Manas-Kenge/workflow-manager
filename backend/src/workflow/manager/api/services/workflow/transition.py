import json
from Products.DCWorkflow.Transitions import TRIGGER_AUTOMATIC, TRIGGER_USER_ACTION
from Products.DCWorkflow.Expression import Expression
from plone.protect.interfaces import IDisableCSRFProtection
from plone.restapi.deserializer import json_body
from plone.restapi.services import Service
from workflow.manager import _
from workflow.manager.api.services.workflow.base import Base
from workflow.manager.utils import clone_transition
from zope.interface import alsoProvides
from zope.interface import implementer
from zope.publisher.interfaces import IPublishTraverse
import re


def serialize_transition(transition):
    """Serializes a workflow transition object to a dictionary."""
    if not transition:
        return None
    guard = transition.getGuard()
    return {
        'id': transition.id,
        'title': getattr(transition, 'title', ''),
        'description': getattr(transition, 'description', ''),
        'new_state_id': getattr(transition, 'new_state_id', ''),
        'trigger_type': getattr(transition, 'trigger_type', TRIGGER_USER_ACTION),
        'guard': {
            'permissions': getattr(guard, 'permissions', ()),
            'roles': getattr(guard, 'roles', ()),
            'groups': getattr(guard, 'groups', ()),
            'expr': getattr(guard, 'expr', ''),
        }
    }


@implementer(IPublishTraverse)
class ListTransitions(Service):
    """
    Lists all transitions in a workflow.
    Endpoint: GET /@transitions/{workflow_id}
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        if len(self.params) < 1:
            self.request.response.setStatus(400)
            return {"error": "Invalid URL format. Expected: /@transitions/{workflow_id}"}
            
        workflow_id = self.params[0]
        base = Base(self.context, self.request, workflow_id=workflow_id)

        if not base.selected_workflow:
            self.request.response.setStatus(404)
            return {"error": f"Workflow '{workflow_id}' not found."}

        transitions = [serialize_transition(t) for t in base.available_transitions]
        return {
            "workflow_id": workflow_id,
            "workflow_title": getattr(base.selected_workflow, 'title', workflow_id),
            "transitions": transitions
        }


@implementer(IPublishTraverse)
class GetTransition(Service):
    """
    Gets details for a specific transition.
    Endpoint: GET /@transitions/{workflow_id}/{transition_id}
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        if len(self.params) < 2:
            self.request.response.setStatus(400)
            return {"error": "Invalid URL format. Expected: /@transitions/{workflow_id}/{transition_id}"}
            
        workflow_id = self.params[0]
        transition_id = self.params[1]
        
        base = Base(self.context, self.request, workflow_id=workflow_id, transition_id=transition_id)

        if not base.selected_workflow:
            self.request.response.setStatus(404)
            return {"error": f"Workflow '{workflow_id}' not found."}
            
        if not base.selected_transition:
            self.request.response.setStatus(404)
            return {"error": f"Transition '{transition_id}' in workflow '{workflow_id}' not found."}

        transition = base.selected_transition
        workflow = base.selected_workflow

        return {
            "workflow_id": workflow_id,
            "transition": serialize_transition(transition),
            "states_with_this_transition": [
                s.id for s in base.available_states if transition.id in getattr(s, 'transitions', ())
            ],
            "available_states": [{'id': s.id, 'title': s.title} for s in base.available_states],
            "available_transitions": [{'id': t.id, 'title': t.title} for t in base.available_transitions],
            "guard_options": {
                "permissions": base.allowed_guard_permissions,
                "roles": list(workflow.getAvailableRoles()),
                "groups": base.getGroups()
            }
        }


@implementer(IPublishTraverse)
class AddTransition(Service):
    """
    Creates a new transition within a workflow.
    Endpoint: POST /@transitions/{workflow_id}/{transition_id}
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        alsoProvides(self.request, IDisableCSRFProtection)
        
        if len(self.params) < 2:
            self.request.response.setStatus(400)
            return {"error": "Invalid URL format. Expected: /@transitions/{workflow_id}/{transition_id}"}
            
        workflow_id = self.params[0]
        transition_id = self.params[1]
        
        base = Base(self.context, self.request, workflow_id=workflow_id)
        
        try:
            body = json_body(self.request)
        except Exception as e:
            self.request.response.setStatus(400)
            return {"error": f"Invalid JSON payload: {str(e)}"}

        if not base.selected_workflow:
            self.request.response.setStatus(404)
            return {"error": f"Workflow '{workflow_id}' not found."}

        title = body.get('title')
        if not title:
            self.request.response.setStatus(400)
            return {"error": "A 'title' for the new transition is required in the request body."}

        if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', transition_id):
            self.request.response.setStatus(400)
            return {"error": "Invalid transition ID format. Use only letters, numbers, and underscores."}

        if transition_id in base.selected_workflow.transitions.objectIds():
            self.request.response.setStatus(409)
            return {"error": f"Transition with id '{transition_id}' already exists."}

        try:
            workflow = base.selected_workflow
            
            workflow.transitions.addTransition(transition_id)
            new_transition = workflow.transitions[transition_id]
            new_transition.title = title
            
            if 'description' in body:
                new_transition.description = body['description']
            
            if 'new_state_id' in body:
                new_state_id = body['new_state_id']
                if new_state_id in workflow.states.objectIds():
                    new_transition.new_state_id = new_state_id
                else:
                    self.request.response.setStatus(400)
                    return {"error": f"State '{new_state_id}' does not exist in workflow."}

            clone_from_id = body.get('clone_from_id')
            if clone_from_id and clone_from_id in workflow.transitions.objectIds():
                clone_transition(new_transition, workflow.transitions[clone_from_id])
            else:
                new_transition.trigger_type = TRIGGER_USER_ACTION

            initial_states = body.get('initial_states', [])
            if initial_states:
                for state in base.available_states:
                    if state.id in initial_states:
                        current_transitions = list(getattr(state, 'transitions', ()))
                        if transition_id not in current_transitions:
                            current_transitions.append(transition_id)
                            state.transitions = tuple(current_transitions)

            workflow._p_changed = True

            self.request.response.setStatus(201)
            return {
                "status": "success",
                "transition": serialize_transition(new_transition),
                "message": _("Transition created successfully")
            }
        except Exception as e:
            self.request.response.setStatus(500)
            return {"error": f"Failed to create transition: {str(e)}"}


@implementer(IPublishTraverse)
class UpdateTransition(Service):
    """
    Updates an existing transition from a JSON payload.
    Endpoint: PATCH /@transitions/{workflow_id}/{transition_id}
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        alsoProvides(self.request, IDisableCSRFProtection)
        
        if len(self.params) < 2:
            self.request.response.setStatus(400)
            return {"error": "Invalid URL format. Expected: /@transitions/{workflow_id}/{transition_id}"}
            
        workflow_id = self.params[0]
        transition_id = self.params[1]
        
        base = Base(self.context, self.request, workflow_id=workflow_id, transition_id=transition_id)
        
        try:
            body = json_body(self.request)
        except Exception as e:
            self.request.response.setStatus(400)
            return {"error": f"Invalid JSON payload: {str(e)}"}

        if not base.selected_workflow:
            self.request.response.setStatus(404)
            return {"error": f"Workflow '{workflow_id}' not found."}
            
        if not base.selected_transition:
            self.request.response.setStatus(404)
            return {"error": f"Transition '{transition_id}' in workflow '{workflow_id}' not found."}

        try:
            transition = base.selected_transition
            workflow = base.selected_workflow

            if 'title' in body:
                transition.title = body['title']
            if 'description' in body:
                transition.description = body['description']
            if 'new_state_id' in body:
                new_state_id = body['new_state_id']
                if new_state_id in workflow.states.objectIds():
                    transition.new_state_id = new_state_id
                else:
                    self.request.response.setStatus(400)
                    return {"error": f"State '{new_state_id}' does not exist in workflow."}
            if 'trigger_type' in body:
                trigger_type = body['trigger_type']
                if trigger_type in [TRIGGER_AUTOMATIC, TRIGGER_USER_ACTION]:
                    transition.trigger_type = trigger_type
                else:
                    self.request.response.setStatus(400)
                    return {"error": f"Invalid trigger_type. Must be {TRIGGER_AUTOMATIC} or {TRIGGER_USER_ACTION}."}

            if 'guard' in body:
                guard = transition.getGuard()
                guard_data = body['guard']
                if 'permissions' in guard_data:
                    guard.permissions = tuple(
                        Expression('string:%s' % p) for p in guard_data['permissions']
                    )
                if 'roles' in guard_data:
                    guard.roles = tuple(
                        Expression('string:%s' % r) for r in guard_data['roles']
                    )
                if 'groups' in guard_data:
                    guard.groups = tuple(
                        Expression('string:%s' % g) for g in guard_data['groups']
                    )
                if 'expr' in guard_data and guard_data['expr']:
                    guard.expr = Expression(guard_data['expr'])
                else:
                    guard.expr = Expression('')
                transition.guard = guard

            if 'states_with_this_transition' in body:
                new_state_ids = set(body['states_with_this_transition'])
                for state in base.available_states:
                    current_transitions = list(getattr(state, 'transitions', ()))
                    has_transition = transition_id in current_transitions
                    should_have_transition = state.id in new_state_ids
                    
                    if should_have_transition and not has_transition:
                        current_transitions.append(transition_id)
                        state.transitions = tuple(current_transitions)
                    elif not should_have_transition and has_transition:
                        current_transitions.remove(transition_id)
                        state.transitions = tuple(current_transitions)

            workflow._p_changed = True

            return {
                "status": "success",
                "transition": serialize_transition(transition),
                "message": _("Transition updated successfully")
            }
        except Exception as e:
            self.request.response.setStatus(500)
            return {"error": f"Failed to update transition: {str(e)}"}


@implementer(IPublishTraverse)
class DeleteTransition(Service):
    """
    Deletes a transition and cleans up references.
    Endpoint: DELETE /@transitions/{workflow_id}/{transition_id}
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        alsoProvides(self.request, IDisableCSRFProtection)
        
        if len(self.params) < 2:
            self.request.response.setStatus(400)
            return {"error": "Invalid URL format. Expected: /@transitions/{workflow_id}/{transition_id}"}
            
        workflow_id = self.params[0]
        transition_id = self.params[1]
        
        base = Base(self.context, self.request, workflow_id=workflow_id, transition_id=transition_id)

        if not base.selected_workflow:
            self.request.response.setStatus(404)
            return {"error": f"Workflow '{workflow_id}' not found."}
            
        if not base.selected_transition:
            self.request.response.setStatus(404)
            return {"error": f"Transition '{transition_id}' in workflow '{workflow_id}' not found."}

        try:
            workflow = base.selected_workflow
            
            base.actions.delete_rule_for(base.selected_transition)
            
            for state in base.available_states:
                current_transitions = list(getattr(state, 'transitions', ()))
                if transition_id in current_transitions:
                    current_transitions.remove(transition_id)
                    state.transitions = tuple(current_transitions)
            
            workflow.transitions.deleteTransitions([transition_id])
            
            workflow._p_changed = True

            return {
                "status": "success",
                "message": _("Transition deleted successfully")
            }
        except Exception as e:
            self.request.response.setStatus(500)
            return {"error": f"Failed to delete transition: {str(e)}"}