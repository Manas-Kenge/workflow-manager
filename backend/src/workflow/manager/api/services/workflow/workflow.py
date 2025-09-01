from Products.CMFCore.interfaces._content import IWorkflowAware
from plone.protect.interfaces import IDisableCSRFProtection
from plone.restapi.deserializer import json_body
from plone.restapi.interfaces import IExpandableElement
from plone.restapi.services import Service
from workflow.manager import _
from workflow.manager.api.services.workflow.base import Base
from zope.component import adapter
from zope.interface import alsoProvides
from zope.interface import implementer
from zope.interface import Interface
from zope.publisher.interfaces import IPublishTraverse

def _serialize_workflow(workflow, base):
    """Serializes a single workflow object into a dictionary."""
    workflow_base = Base(base.context, base.request, workflow_id=workflow.id)
    
    return {
        "id": workflow.id,
        "title": workflow.title or workflow.id,
        "description": getattr(workflow, "description", ""),
        "initial_state": workflow.initial_state,
        "states": [
            {
                "id": s.id,
                "title": s.title,
                "description": getattr(s, "description", ""),
                "transitions": s.transitions
            }
            for s in workflow.states.objectValues()
        ],
        "transitions": [
            {
                "id": t.id,
                "title": t.title,
                "description": getattr(t, "description", ""),
                "new_state_id": t.new_state_id
            }
            for t in workflow.transitions.objectValues()
        ],
        "assigned_types": workflow_base._get_assigned_types_for(workflow.id),
        "context_data": {
            "assignable_types": workflow_base.get_assignable_types_for(workflow.id),
            "managed_permissions": workflow_base.managed_permissions,
            "available_roles": list(workflow.getAvailableRoles()),
            "groups": workflow_base.getGroups()
        }
    }

@implementer(IPublishTraverse)
@adapter(IWorkflowAware, Interface)
class GetWorkflows(Service):
    """
    Lists all available workflows with their detailed configuration.
    Endpoint: GET /@workflows
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self
    
    def reply(self):
        if self.params:
            workflow_id = self.params[0]
            base = Base(self.context, self.request, workflow_id=workflow_id)
            workflow = base.selected_workflow

            if not workflow:
                self.request.response.setStatus(404)
                return {"error": f"Workflow '{workflow_id}' not found."}
            
            return _serialize_workflow(workflow, base)

        else:
            base = Base(self.context, self.request)
            portal_workflow = base.portal_workflow
            workflows = []

            for workflow_id in portal_workflow.listWorkflows():
                workflow = portal_workflow.get(workflow_id)
                workflows.append(_serialize_workflow(workflow, base))

            return {"workflows": workflows}


@implementer(IExpandableElement)
@adapter(IWorkflowAware, Interface)
class AddWorkflow(Service):
    """
    Adds a new workflow by cloning an existing one.
    """
    def reply(self):
        # Disable CSRF protection for REST API service
        alsoProvides(self.request, IDisableCSRFProtection)
        
        base = Base(self.context, self.request)
        body = json_body(self.request)
        workflow_title = body.get("workflow-name")
        clone_from_id = body.get("clone-from-workflow")

        if not workflow_title or not clone_from_id:
            self.request.response.setStatus(400)
            return {"error": "Missing 'workflow-name' or 'clone-from-workflow'."}

        workflow_id = workflow_title.strip().replace(" ", "_").lower()
        cloned_from_workflow = base.portal_workflow[clone_from_id]

        base.portal_workflow.manage_clone(cloned_from_workflow, workflow_id)
        new_workflow = base.portal_workflow[workflow_id]
        new_workflow.title = workflow_title
        base.portal_workflow._p_changed = True
        
        self.request.response.setStatus(201)
        return {
            "status": "success",
            "workflow_id": new_workflow.id,
            "message": _("Workflow created successfully"),
        }


@implementer(IPublishTraverse)
@adapter(IWorkflowAware, Interface)
class DeleteWorkflow(Service):
    """
    Deletes a workflow and its associated transition rules.
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
        
        if not self.params:
            self.request.response.setStatus(400)
            return {"error": "No workflow ID provided in URL"}
            
        workflow_id = self.params[0]
        base = Base(self.context, self.request, workflow_id=workflow_id)

        if not base.selected_workflow:
            self.request.response.setStatus(404)
            return {"error": f"Workflow '{workflow_id}' not found."}

        # Safety Check: Prevent deletion if workflow is in use.
        assigned_types = base._get_assigned_types_for(workflow_id)
        if assigned_types:
            self.request.response.setStatus(400)
            return {"error": f"Cannot delete workflow. It is still assigned to: {', '.join(assigned_types)}"}

        for transition in base.available_transitions:
            base.actions.delete_rule_for(transition)

        base.portal_workflow.manage_delObjects([workflow_id])
        return self.reply_no_content()


@implementer(IPublishTraverse)
@adapter(IWorkflowAware, Interface)
class UpdateWorkflow(Service):
    """
    Updates properties of a workflow.
    Endpoint: PATCH /@workflows/{workflow_id}
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        if not self.params:
            self.request.response.setStatus(400)
            return {"error": "No workflow ID provided."}

        workflow_id = self.params[0]
        base = Base(self.context, self.request, workflow_id=workflow_id)
        workflow = base.selected_workflow

        if not workflow:
            self.request.response.setStatus(404)
            return {"error": f"Workflow '{workflow_id}' not found."}

        data = json_body(self.request)
        changed = False
        if 'title' in data:
            workflow.title = data['title']
            changed = True
        if 'description' in data:
            workflow.description = data['description']
            changed = True

        if changed:
            workflow._p_changed = True
        
        return _serialize_workflow(workflow, base)


@implementer(IPublishTraverse)
@adapter(IWorkflowAware, Interface)
class UpdateSecuritySettings(Service):
    """
    Triggers a recursive update of role mappings on content objects.
    Endpoint: POST /@workflows/{workflow_id}/@update-security
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
        
        if not self.params:
            self.request.response.setStatus(400)
            return {"error": "No workflow ID provided in URL"}
            
        workflow_id = self.params[0]
        base = Base(self.context, self.request, workflow_id=workflow_id)

        if not base.selected_workflow:
            self.request.response.setStatus(404)
            return {"error": f"Workflow '{workflow_id}' not found."}

        count = base.portal_workflow._recursiveUpdateRoleMappings(
            base.portal,
            {base.selected_workflow.id: base.selected_workflow},
        )
        return {
            "status": "success",
            "message": _("msg_updated_objects", default=f"Updated {count} objects."),
        }


@implementer(IPublishTraverse)
@adapter(IWorkflowAware, Interface)
class AssignWorkflow(Service):
    """
    Assigns a workflow to a specific content type.
    Endpoint: POST /@workflow-assign/{workflow_id}
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
        
        if not self.params:
            self.request.response.setStatus(400)
            return {"error": "No workflow ID provided in URL"}
            
        workflow_id = self.params[0]
        base = Base(self.context, self.request, workflow_id=workflow_id)
        body = json_body(self.request)
        type_id = body.get("type_id")

        if not base.selected_workflow:
            self.request.response.setStatus(404)
            return {"error": f"Workflow '{workflow_id}' not found."}
        if not type_id:
            self.request.response.setStatus(400)
            return {"error": "No content type ('type_id') specified."}

        chain = (workflow_id,)
        base.portal_workflow.setChainForPortalTypes((type_id,), chain)

        return {
            "status": "success",
            "workflow": workflow_id,
            "type": type_id,
            "message": _("Workflow assigned successfully"),
        }


@implementer(IPublishTraverse)
@adapter(IWorkflowAware, Interface)
class SanityCheck(Service):
    """
    Performs a sanity check on a workflow.
    Endpoint: GET /@sanity-check/{workflow_id}
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        if not self.params:
            self.request.response.setStatus(400)
            return {"error": "No workflow ID provided in URL"}
            
        workflow_id = self.params[0]
        base = Base(self.context, self.request, workflow_id=workflow_id)
        workflow = base.selected_workflow

        if not workflow:
            self.request.response.setStatus(404)
            return {"error": f"Workflow '{workflow_id}' not found."}

        states = list(workflow.states.objectValues())
        transitions = list(workflow.transitions.objectValues())
        state_ids = [s.id for s in states]
        
        errors = {
            "state_errors": [],
            "transition_errors": [],
            "initial_state_error": False,
        }

        if not workflow.initial_state or workflow.initial_state not in state_ids:
            errors["initial_state_error"] = True

        all_destination_ids = {t.new_state_id for t in transitions}
        for state in states:
            if state.id != workflow.initial_state and state.id not in all_destination_ids:
                errors["state_errors"].append({
                    "id": state.id, 
                    "title": state.title, 
                    "error": "State is not reachable by any transition."
                })
        
        all_used_transition_ids = set()
        for state in states:
            for transition_id in getattr(state, 'transitions', ()):
                all_used_transition_ids.add(transition_id)

        for transition in transitions:
            if not transition.new_state_id or transition.new_state_id not in state_ids:
                errors["transition_errors"].append({
                    "id": transition.id,
                    "title": transition.title,
                    "error": f"Transition points to a non-existent state: '{transition.new_state_id}'."
                })
            
            if transition.id not in all_used_transition_ids:
                errors["transition_errors"].append({
                    "id": transition.id,
                    "title": transition.title,
                    "error": "Transition is not available from any state."
                })

        has_errors = any([
            errors["state_errors"],
            errors["transition_errors"], 
            errors["initial_state_error"]
        ])
        
        return {
            "status": "success" if not has_errors else "error",
            "workflow": workflow.id,
            "errors": errors,
            "message": "Workflow validation complete.",
        }