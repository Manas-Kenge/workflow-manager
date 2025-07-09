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


@implementer(IExpandableElement)
@adapter(IWorkflowAware, Interface)
class GetWorkflows(Service):
    """
    Lists all available workflows with their detailed configuration.
    Endpoint: GET /@workflows
    """
    def reply(self):
        base = Base(self.context, self.request)
        portal_workflow = base.portal_workflow
        workflows = []

        for workflow_id in portal_workflow.listWorkflows():
            workflow = portal_workflow[workflow_id]
            workflow_info = {
                "id": workflow_id,
                "title": workflow.title or workflow_id,
                "description": getattr(workflow, "description", ""),
                "initial_state": workflow.initial_state,
                "states": [
                    {"id": s.id, "title": s.title, "transitions": s.transitions}
                    for s in workflow.states.objectValues()
                ],
                "transitions": [
                    {"id": t.id, "title": t.title, "new_state_id": t.new_state_id}
                    for t in workflow.transitions.objectValues()
                ],
                "assigned_types": base.get_assigned_types_for(workflow_id)
            }
            workflows.append(workflow_info)

        return {"workflows": workflows}


@implementer(IExpandableElement)
@adapter(IWorkflowAware, Interface)
class AddWorkflow(Service):
    """
    Adds a new workflow by cloning an existing one.
    Endpoint: POST /@workflows (using @workflow-add service name)
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

        # Note: CSRF protection disabled above, no need for base.authorize()
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
    Endpoint: DELETE /@workflows/{workflow_id} (using @workflow-delete service name)
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
        assigned_types = base.get_assigned_types_for(workflow_id)
        if assigned_types:
            self.request.response.setStatus(400)
            return {"error": f"Cannot delete workflow. It is still assigned to: {', '.join(assigned_types)}"}

        for transition in base.available_transitions:
            base.actions.delete_rule_for(transition)

        base.portal_workflow.manage_delObjects([workflow_id])
        return self.reply_no_content()


@implementer(IPublishTraverse)
@adapter(IWorkflowAware, Interface)
class UpdateSecuritySettings(Service):
    """
    Triggers a recursive update of role mappings on content objects.
    Endpoint: POST /@workflows/{workflow_id}/@update-security (using @workflow-update-security service name)
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        # Capture the workflow_id from the URL
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

        # Note: CSRF protection disabled above, no need for base.authorize()
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
    Endpoint: POST /@workflows/{workflow_id}/@assign (using @workflow-assign service name)
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        # Capture the workflow_id from the URL
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

        # Note: CSRF protection disabled above, no need for base.authorize()
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
    Endpoint: GET /@workflows/{workflow_id}/@sanity-check (using @workflow-sanity-check service name)
    """
    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        # Capture the workflow_id from the URL
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

        states = workflow.states
        transitions = workflow.transitions
        errors = {
            "state_errors": [],
            "transition_errors": [],
            "initial_state_error": False,
        }

        # Check for unreachable states
        for state in states.values():
            is_reachable = any(t.new_state_id == state.id for t in transitions.values())
            is_initial_with_exit = (workflow.initial_state == state.id and len(state.transitions) > 0)
            if not is_reachable and not is_initial_with_exit:
                errors["state_errors"].append({
                    "id": state.id, 
                    "title": state.title, 
                    "error": "State is not reachable"
                })
        
        # Check if initial state exists
        if workflow.initial_state not in states:
            errors["initial_state_error"] = True

        # Check for transitions that reference non-existent states
        for transition in transitions.values():
            if transition.new_state_id not in states:
                errors["transition_errors"].append({
                    "id": transition.id,
                    "title": transition.title,
                    "error": f"References non-existent state: {transition.new_state_id}"
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
            "message": _("Workflow validation complete"),
        }