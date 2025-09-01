from Persistence import PersistentMapping
from Products.CMFCore.interfaces._content import IWorkflowAware
from plone.app.workflow.remap import remap_workflow
from plone.protect.interfaces import IDisableCSRFProtection
from plone.restapi.deserializer import json_body
from plone.restapi.services import Service
from workflow.manager import _
from workflow.manager.api.services.workflow.base import Base
from workflow.manager.utils import clone_state
from zope.interface import alsoProvides
from zope.interface import implementer
from zope.publisher.interfaces import IPublishTraverse
import re


# Helper to serialize a state object to a dictionary for JSON responses.
def serialize_state(state):
    """Serializes a workflow state object to a dictionary."""
    if not state:
        return None
    
    transitions = getattr(state, 'transitions', None)
    if transitions is None:
        transitions = []
    elif not isinstance(transitions, (list, tuple)):
        transitions = list(transitions) if transitions else []
    else:
        transitions = list(transitions)
    
    permission_roles = getattr(state, 'permission_roles', None)
    if permission_roles is None:
        permission_roles = {}
    elif hasattr(permission_roles, 'items'):
        permission_roles = dict(permission_roles)
    else:
        permission_roles = {}

    group_roles = getattr(state, 'group_roles', None)
    if group_roles is None:
        group_roles = {}
    elif hasattr(group_roles, 'items'):
        group_roles = dict(group_roles)
    else:
        group_roles = {}
    
    return {
        'id': state.id,
        'title': getattr(state, 'title', ''),
        'description': getattr(state, 'description', ''),
        'transitions': transitions,
        'permission_roles': permission_roles,
        'group_roles': group_roles
    }

@implementer(IPublishTraverse)
class EditState(Service):
    """
    Updates an existing state from a JSON payload.
    Endpoint: PATCH /@states/{workflow_id}/{state_id}
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        # Disable CSRF protection for REST API service
        alsoProvides(self.request, IDisableCSRFProtection)
        
        if len(self.params) < 2:
            self.request.response.setStatus(400)
            return {"error": "Invalid URL format. Expected: /@states/{workflow_id}/{state_id}"}
        
        workflow_id = self.params[0]
        state_id = self.params[1]
        
        base = Base(self.context, self.request, workflow_id=workflow_id, state_id=state_id)
        
        try:
            body = json_body(self.request)
        except Exception as e:
            self.request.response.setStatus(400)
            return {"error": f"Invalid JSON payload: {str(e)}"}

        if not base.selected_workflow:
            self.request.response.setStatus(404)
            return {"error": f"Workflow '{workflow_id}' not found."}
            
        if not base.selected_state:
            self.request.response.setStatus(404)
            return {"error": f"State '{state_id}' in workflow '{workflow_id}' not found."}

        state = base.selected_state
        workflow = base.selected_workflow

        if 'title' in body:
            state.title = body['title']
        if 'description' in body:
            state.description = body['description']
        if body.get('is_initial_state') is True:
            workflow.initial_state = state.id
        if 'transitions' in body and isinstance(body['transitions'], list):
            state.transitions = tuple(body['transitions'])
        if 'permission_roles' in body:
            state.permission_roles = PersistentMapping(body['permission_roles'])
        if 'group_roles' in body:
            state.group_roles = PersistentMapping(body['group_roles'])

        return {
            "status": "success",
            "state": serialize_state(state),
            "message": _("State updated successfully")
        }


@implementer(IPublishTraverse)
class AddState(Service):
    """
    Creates a new state within a workflow from a JSON payload.
    Endpoint: POST /@states/{workflow_id}
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        # Disable CSRF protection for REST API service
        alsoProvides(self.request, IDisableCSRFProtection)
        
        if len(self.params) < 1:
            self.request.response.setStatus(400)
            return {"error": "Invalid URL format. Expected: /@states/{workflow_id}"}
            
        workflow_id = self.params[0]
        
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
            return {"error": "A 'title' for the new state is required."}

        state_id = title.strip().replace(" ", "_").lower()
        state_id = re.sub(r'[^a-z0-9_]', '', state_id)
        
        if not state_id:
            self.request.response.setStatus(400)
            return {"error": "Unable to generate valid state ID from title."}
            
        if state_id in base.selected_workflow.states.objectIds():
            self.request.response.setStatus(409)
            return {"error": f"State with id '{state_id}' already exists."}

        try:
            workflow = base.selected_workflow
            
            from Products.DCWorkflow.States import StateDefinition
            new_state = StateDefinition(state_id)
            new_state.title = title
            
            if 'description' in body:
                new_state.description = body['description']
            
            workflow.states._setObject(state_id, new_state)
            new_state = workflow.states[state_id]  
            
            if not hasattr(new_state, 'permission_roles'):
                new_state.permission_roles = PersistentMapping()
            if not hasattr(new_state, 'group_roles'):
                new_state.group_roles = PersistentMapping()
            if not hasattr(new_state, 'transitions'):
                new_state.transitions = ()

            clone_from_id = body.get('clone_from_id')
            if clone_from_id and clone_from_id in workflow.states.objectIds():
                clone_state(new_state, workflow.states[clone_from_id])

            workflow._p_changed = True

            self.request.response.setStatus(201)
            return {
                "status": "success",
                "state": serialize_state(new_state),
                "message": _("State created successfully")
            }
        except Exception as e:
            self.request.response.setStatus(500)
            return {"error": f"Failed to create state: {str(e)}"}


@implementer(IPublishTraverse)
class DeleteState(Service):
    """
    Deletes a state, remapping content if necessary.
    Endpoint: DELETE /@states/{workflow_id}/{state_id}
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        # Disable CSRF protection for REST API service
        alsoProvides(self.request, IDisableCSRFProtection)
        
        if len(self.params) < 2:
            self.request.response.setStatus(400)
            return {"error": "Invalid URL format. Expected: /@states/{workflow_id}/{state_id}"}
            
        workflow_id = self.params[0]
        state_id = self.params[1]
        
        base = Base(self.context, self.request, workflow_id=workflow_id, state_id=state_id)

        if not base.selected_workflow:
            self.request.response.setStatus(404)
            return {"error": f"Workflow '{workflow_id}' not found."}
            
        if not base.selected_state:
            self.request.response.setStatus(404)
            return {"error": f"State '{state_id}' in workflow '{workflow_id}' not found."}

        workflow = base.selected_workflow
        
        is_using_state = any(
            getattr(t, 'new_state_id', None) == state_id 
            for t in base.available_transitions
        )

        if is_using_state:
            try:
                body = json_body(self.request)
            except Exception as e:
                self.request.response.setStatus(400)
                return {"error": f"Invalid JSON payload: {str(e)}"}
                
            replacement_id = body.get('replacement_state_id')
            if not replacement_id or replacement_id not in workflow.states.objectIds():
                self.request.response.setStatus(400)
                return {"error": "This state is a destination for one or more transitions. A valid 'replacement_state_id' is required in the request body."}

            for transition in base.available_transitions:
                if getattr(transition, 'new_state_id', None) == state_id:
                    transition.new_state_id = replacement_id

            chains = base.portal_workflow.listChainOverrides()
            types_ids = [c[0] for c in chains if workflow_id in c[1]]
            if types_ids:
                remap_workflow(self.context, types_ids, (workflow_id,), {state_id: replacement_id})

        workflow.states.deleteStates([state_id])
        
        return {
            "status": "success",
            "message": _("State deleted successfully")
        }


@implementer(IPublishTraverse)
class ListStates(Service):
    """
    Lists all states in a workflow.
    Endpoint: GET /@states/{workflow_id}
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
            return {"error": "Invalid URL format. Expected: /@states/{workflow_id}"}
            
        workflow_id = self.params[0]
        
        base = Base(self.context, self.request, workflow_id=workflow_id)

        if not base.selected_workflow:
            self.request.response.setStatus(404)
            return {"error": f"Workflow '{workflow_id}' not found."}

        states = [serialize_state(state) for state in base.available_states]
        
        return {
            "workflow_id": workflow_id,
            "workflow_title": getattr(base.selected_workflow, 'title', workflow_id),
            "initial_state": getattr(base.selected_workflow, 'initial_state', None),
            "states": states
        }