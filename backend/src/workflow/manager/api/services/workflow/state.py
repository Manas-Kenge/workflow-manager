from Persistence import PersistentMapping
from plone.app.workflow.remap import remap_workflow
from plone.restapi.deserializer import json_body
from plone.restapi.services import Service
from workflow.manager import _
from workflow.manager.api.services.workflow.base import Base
from workflow.manager.utils import clone_state
from zope.interface import implementer
from zope.publisher.interfaces import IPublishTraverse

# Helper to serialize a state object to a dictionary for JSON responses.
def serialize_state(state):
    """Serializes a workflow state object to a dictionary."""
    if not state:
        return None
    return {
        'id': state.id,
        'title': state.title,
        'description': state.description,
        'transitions': state.transitions,
        'permission_roles': dict(state.permission_roles),
        'group_roles': dict(state.group_roles)
    }


@implementer(IPublishTraverse)
class EditState(Service):
    """
    Provides all data needed to build the state editing UI in the frontend.
    Endpoint: GET /@workflows/{workflow_id}/@states/{state_id}
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        # Correctly extract IDs from the traversed URL path
        workflow_id = self.params[0]
        state_id = self.params[2]
        base = Base(self.context, self.request, workflow_id=workflow_id, state_id=state_id)

        if not base.selected_workflow or not base.selected_state:
            self.request.response.setStatus(404)
            return {"error": f"State '{state_id}' in workflow '{workflow_id}' not found."}

        state = base.selected_state
        workflow = base.selected_workflow

        return {
            "state": serialize_state(state),
            "is_initial_state": workflow.initial_state == state.id,
            "available_transitions": [{'id': t.id, 'title': t.title} for t in base.available_transitions],
            "available_states": [{'id': s.id, 'title': s.title} for s in base.available_states],
            "managed_permissions": base.managed_permissions,
            "available_roles": state.getAvailableRoles(),
            "groups": base.getGroups()
        }


@implementer(IPublishTraverse)
class AddState(Service):
    """
    Creates a new state within a workflow from a JSON payload.
    Endpoint: POST /@workflows/{workflow_id}/@states
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
            return {"error": "A 'title' for the new state is required."}

        base.authorize()
        state_id = title.strip().replace(" ", "_").lower()
        if state_id in base.selected_workflow.states:
            self.request.response.setStatus(409) # Conflict
            return {"error": f"State with id '{state_id}' already exists."}

        workflow = base.selected_workflow
        workflow.states.addState(state_id)
        new_state = workflow.states[state_id]
        new_state.title = title

        clone_from_id = body.get('clone_from_id')
        if clone_from_id and clone_from_id in workflow.states:
            clone_state(new_state, workflow.states[clone_from_id])

        self.request.response.setStatus(201) # Created
        return serialize_state(new_state)


@implementer(IPublishTraverse)
class SaveState(Service):
    """
    Updates an existing state from a JSON payload.
    Endpoint: PATCH /@workflows/{workflow_id}/@states/{state_id}
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        # Correctly extract IDs from the traversed URL path
        workflow_id = self.params[0]
        state_id = self.params[2]
        base = Base(self.context, self.request, workflow_id=workflow_id, state_id=state_id)
        body = json_body(self.request)

        if not base.selected_workflow or not base.selected_state:
            self.request.response.setStatus(404)
            return {"error": f"State '{state_id}' in workflow '{workflow_id}' not found."}

        base.authorize()
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

        return self.reply_no_content()


@implementer(IPublishTraverse)
class DeleteState(Service):
    """
    Deletes a state, remapping content if necessary.
    Endpoint: DELETE /@workflows/{workflow_id}/@states/{state_id}
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        # Correctly extract IDs from the traversed URL path
        workflow_id = self.params[0]
        state_id = self.params[2]
        base = Base(self.context, self.request, workflow_id=workflow_id, state_id=state_id)

        if not base.selected_workflow or not base.selected_state:
            self.request.response.setStatus(404)
            return {"error": f"State '{state_id}' in workflow '{workflow_id}' not found."}

        base.authorize()
        workflow = base.selected_workflow
        is_using_state = any(t.new_state_id == state_id for t in base.available_transitions)

        if is_using_state:
            body = json_body(self.request)
            replacement_id = body.get('replacement_state_id')
            if not replacement_id or replacement_id not in workflow.states:
                self.request.response.setStatus(400)
                return {"error": "This state is a destination for one or more transitions. A valid 'replacement_state_id' is required in the request body."}

            for transition in base.available_transitions:
                if state_id == transition.new_state_id:
                    transition.new_state_id = replacement_id

            chains = base.portal_workflow.listChainOverrides()
            types_ids = [c[0] for c in chains if workflow_id in c[1]]
            remap_workflow(self.context, types_ids, (workflow_id,), {state_id: replacement_id})

        workflow.states.deleteStates([state_id])
        return self.reply_no_content()