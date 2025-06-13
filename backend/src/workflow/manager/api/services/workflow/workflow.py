# -*- coding: utf-8 -*-
from plone.restapi.interfaces import IExpandableElement
from Products.CMFCore.interfaces._content import IWorkflowAware
from plone.restapi.services import Service
from zope.component import adapter
from zope.interface import implementer
from zope.interface import Interface
from urllib.parse import urlencode
from plone.restapi.deserializer import json_body

from zope.publisher.interfaces import IPublishTraverse
from workflow.manager import _
from workflow.manager.api.services.workflow.base import Base
from urllib.parse import urlencode

plone_shipped_workflows = [
    "folder_workflow",
    "intranet_folder_workflow",
    "intranet_workflow",
    "one_state_workflow",
    "plone_workflow",
    "simple_publication_workflow",
    "comment_review_workflow",
]


@implementer(IExpandableElement)
@adapter(IWorkflowAware, Interface)
class DeleteWorkflow(Service):
    def __init__(self, context, request):
        self.request = json_body(request)
        self.context = context
        self.base = Base(context, request)

    def reply(self):
        self.errors = {}

        # self.can_delete = len(self.assigned_types) == 0 # get assigned types to a workflow somehow

        # if not self.can_delete:
        #     return {"status": "error", "message": "Cant delete workflow unless assigned types removed and attached to some other workflow."}
        self.base.authorize()
        # delete all rules also.
        for transition in self.base.available_transitions:
            self.base.actions.delete_rule_for(transition)

        self.base.portal_workflow.manage_delObjects([self.base.selected_workflow.id])
        return {"status": "success", "message": "Workflow deleted successfully"}


@implementer(IPublishTraverse)
@adapter(IWorkflowAware, Interface)
class AddWorkflow(Service):
    def __init__(self, context, request):
        super().__init__(context, request)
        # Disable CSRF protection
        from zope.interface import alsoProvides
        import plone.protect.interfaces

        if "IDisableCSRFProtection" in dir(plone.protect.interfaces):
            alsoProvides(self.request, plone.protect.interfaces.IDisableCSRFProtection)

        self.request = request
        self.context = context
        self.base = Base(context, request)

    def reply(self):
        body = json_body(self.request)
        workflow = body.get("workflow-name")
        workflow_id = workflow.strip().replace("-", "_")
        if not workflow or not workflow_id:
            return {"error": "Missing required workflow information"}

        cloned_from_workflow = self.base.portal_workflow[
            body.get("clone-from-workflow")
        ]

        self.base.portal_workflow.manage_clone(cloned_from_workflow, workflow_id)
        new_workflow = self.base.portal_workflow[workflow_id]
        new_workflow.title = workflow

        return {
            "status": "success",
            "workflow_id": new_workflow.id,
            "message": _("Workflow created successfully"),
        }


@implementer(IExpandableElement)
@adapter(IWorkflowAware, Interface)
class UpdateSecuritySettings(Service):
    def __init__(self, context, request):
        self.request = json_body(request)
        self.context = context
        self.base = Base(context, request)

    def reply(self):
        self.base.authorize()
        count = self.base.portal_workflow._recursiveUpdateRoleMappings(
            self.base.portal,
            {self.base.selected_workflow.id: self.base.selected_workflow},
        )
        return {
            "status": "success",
            "message": _(
                "msg_updated_objects",
                default="Updated ${count} objects.",
                mapping={"count": count},
            ),
        }


@implementer(IExpandableElement)
@adapter(IWorkflowAware, Interface)
class Assign(Service):
    def __init__(self, context, request):
        self.request = request
        self.context = context
        self.base = Base(context, request)

    def reply(self):
        self.errors = {}

        self.base.authorize()
        params = urlencode(
            {
                "type_id": self.request.get("type_id"),
                "new_workflow": self.base.selected_workflow.id,
            }
        )
        return {
            "status": "success",
            "message": "Workflow assigned successfully",
            "redirect": self.context_state.portal_url()
            + "/@@content-controlpanel?"
            + params,
        }


@implementer(IExpandableElement)
@adapter(IWorkflowAware, Interface)
class SanityCheck(Service):
    def __init__(self, context, request):
        self.request = request
        self.context = context
        self.base = Base(context, request)

    def reply(self):
        self.errors = {}
        states = self.base.available_states
        transitions = self.base.available_transitions
        self.errors["state-errors"] = []
        self.errors["transition-errors"] = []

        for state in states:
            found = False
            for transition in transitions:
                if transition.new_state_id == state.id:
                    found = True
                    break

            if (
                self.base.selected_workflow.initial_state == state.id
                and len(state.transitions) > 0
            ):
                found = True

            if not found:
                self.errors["state-errors"].append(state)

        for transition in transitions:
            found = False
            if not transition.new_state_id:
                found = True

            for state in states:
                if transition.id in state.transitions:
                    found = True
                    break

            if not found:
                self.errors["transition-errors"].append(transition)

        state_ids = [s.id for s in states]
        if (
            not self.base.selected_workflow.initial_state
            or self.base.selected_workflow.initial_state not in state_ids
        ):
            self.errors["initial-state-error"] = True

        has_errors = (
            len(self.errors["state-errors"]) > 0
            or len(self.errors["transition-errors"]) > 0
            or "initial-state-error" in self.errors
        )

        return {
            "status": "success" if not has_errors else "error",
            "errors": self.errors,
        }


@implementer(IExpandableElement)
@adapter(IWorkflowAware, Interface)
class UpdateSecurityService(Service):
    def __init__(self, context, request):
        self.request = request
        self.context = context
        self.base = Base(context, request)

    def reply(self):

        workflow = self.get_selected_workflow()
        if not workflow:
            return {"error": "No workflow selected"}

        count = self.base.portal_workflow._recursiveUpdateRoleMappings(
            self.base.context, {workflow.id: workflow}
        )

        return {
            "status": "success",
            "count": count,
            "message": _(
                "msg_updated_objects",
                default="Updated ${count} objects.",
                mapping={"count": count},
            ),
        }

    def get_selected_workflow(self):
        workflow_id = self.request.get("selected-workflow")
        if workflow_id:
            return self.portal_workflow.get(workflow_id)
        return None


@implementer(IExpandableElement)
@adapter(IWorkflowAware, Interface)
class AssignWorkflowService(Service):
    def __init__(self, context, request):
        self.request = request
        self.context = context
        self.base = Base(context, request)

    def reply(self):
        workflow = self.get_selected_workflow()
        if not workflow:
            return {"error": "No workflow selected"}

        type_id = self.request.get("type_id")
        if not type_id:
            return {"error": "No content type specified"}

        # Update workflow chain for type
        chain = (workflow.id,)
        self.base.portal_workflow.setChainForPortalTypes((type_id,), chain)

        return {
            "status": "success",
            "workflow": workflow.id,
            "type": type_id,
            "message": _("Workflow assigned successfully"),
        }

    def get_selected_workflow(self):
        workflow_id = self.request.get("selected-workflow")
        if workflow_id:
            return self.base.portal_workflow.get(workflow_id)
        return None


@adapter(IWorkflowAware, Interface)
class DeleteWorkflowService(Service):
    def __init__(self, context, request):
        self.request = request
        self.context = context
        self.base = Base(context, request)

    def reply(self):
        workflow = self.get_selected_workflow()
        if not workflow:
            return {"error": "No workflow selected"}

        workflow_id = workflow.id
        self.base.portal_workflow.manage_delObjects([workflow_id])

        return {
            "status": "success",
            "workflow": workflow_id,
            "message": _("Workflow deleted successfully"),
        }

    def get_selected_workflow(self):
        body = json_body(self.request)
        workflow_id = body.get("selected-workflow")
        if workflow_id:
            return self.base.portal_workflow.get(workflow_id)
        return None


@adapter(IWorkflowAware, Interface)
class SanityCheckService(Service):
    def __init__(self, context, request):
        self.request = request
        self.context = context
        self.base = Base(context, request)

    def reply(self):
        workflow = self.get_selected_workflow()
        if not workflow:
            return {"error": "No workflow selected"}

        states = workflow.states
        transitions = workflow.transitions
        errors = {
            "state_errors": [],
            "transition_errors": [],
            "initial_state_error": False,
        }

        # Check states
        for state in states.values():
            found = False
            for transition in transitions.values():
                if transition.new_state_id == state.id:
                    found = True
                    break

            if workflow.initial_state == state.id and len(state.transitions) > 0:
                found = True

            if not found:
                errors["state_errors"].append(
                    {
                        "id": state.id,
                        "title": state.title,
                        "error": "State is not reachable",
                    }
                )

        # Check transitions
        for transition in transitions.values():
            found = False
            if not transition.new_state_id:
                found = True

            for state in states.values():
                if transition.id in state.transitions:
                    found = True
                    break

            if not found:
                errors["transition_errors"].append(
                    {
                        "id": transition.id,
                        "title": transition.title,
                        "error": "Transition is not used by any state",
                    }
                )

        # Check initial state
        state_ids = [s.id for s in states.values()]
        if not workflow.initial_state or workflow.initial_state not in state_ids:
            errors["initial_state_error"] = True

        has_errors = (
            len(errors["state_errors"]) > 0
            or len(errors["transition_errors"]) > 0
            or errors["initial_state_error"]
        )

        return {
            "status": "success" if not has_errors else "error",
            "workflow": workflow.id,
            "errors": errors,
            "message": _("Workflow validation complete"),
        }

    def get_selected_workflow(self):
        workflow_id = self.request.get("selected-workflow")
        if workflow_id:
            return self.base.portal_workflow.get(workflow_id)
        return None


@implementer(IExpandableElement)
@adapter(IWorkflowAware, Interface)
class GetWorkflowsService(Service):
    def __init__(self, context, request):
        self.request = request
        self.context = context
        self.base = Base(context, request)

    def reply(self):
        portal_workflow = self.base.portal_workflow
        workflows = []

        for workflow_id in portal_workflow.listWorkflows():
            workflow = portal_workflow[workflow_id]

            # # Skip Plone shipped workflows if needed
            # if workflow_id in plone_shipped_workflows:
            #     continue

            workflow_info = {
                "id": workflow_id,
                "title": workflow.title or workflow_id,
                "description": getattr(workflow, "description", ""),
                "initial_state": workflow.initial_state,
                "states": [
                    {
                        "id": state_id,
                        "title": state.title,
                        "transitions": state.transitions,
                    }
                    for state_id, state in workflow.states.items()
                ],
                "transitions": [
                    {
                        "id": trans_id,
                        "title": trans.title,
                        "new_state": trans.new_state_id,
                        "description": getattr(trans, "description", ""),
                    }
                    for trans_id, trans in workflow.transitions.items()
                ],
            }

            # Get content types using this workflow
            chain_types = []
            for portal_type, chain in self.base.portal_workflow.listChainOverrides():
                if workflow_id in chain:
                    chain_types.append(portal_type)

            workflow_info["assigned_types"] = chain_types
            workflows.append(workflow_info)

        return {"workflows": workflows}