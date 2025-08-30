import json
from plone import api
from plone.restapi.deserializer import json_body
from plone.restapi.services import Service
from zope.interface import Interface
from zope.interface import implementer
from zope.component import adapter
from zope.publisher.interfaces import IPublishTraverse
from Products.CMFPlone.interfaces import IPloneSiteRoot


@implementer(IPublishTraverse)
@adapter(IPloneSiteRoot, Interface)
class WorkflowLayout(Service):
    """
    Accessed via the /@workflow-layout/{workflow_id} endpoint.
    """
    
    REGISTRY_KEY = "workflow.manager.layouts"

    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        """Captures the workflow_id from the URL path."""
        self.params.append(name)
        return self

    def get(self):
        if not self.params:
            self.request.response.setStatus(400)
            return {"error": "Workflow ID must be provided in the URL."}

        workflow_id = self.params[0]
        all_layouts = self._get_all_layouts_from_registry()
        layout_json_string = all_layouts.get(workflow_id, '{}')

        try:
            layout_data = json.loads(layout_json_string)
        except json.JSONDecodeError:
            layout_data = {}

        return {
            "workflow_id": workflow_id,
            "layout": layout_data
        }

    def post(self):
        if not self.params:
            self.request.response.setStatus(400)
            return {"error": "Workflow ID must be provided in the URL."}

        workflow_id = self.params[0]
        all_layouts = self._get_all_layouts_from_registry()
        new_layout_data = json_body(self.request)

        all_layouts[workflow_id] = json.dumps(new_layout_data)
        
        api.portal.set_registry_record(self.REGISTRY_KEY, all_layouts)

        self.request.response.setStatus(200)
        return {
            "status": "success",
            "message": f"Layout for workflow '{workflow_id}' saved."
        }

    def _get_all_layouts_from_registry(self):
        """Helper to safely retrieve the main layouts dictionary."""
        try:
            layouts = api.portal.get_registry_record(self.REGISTRY_KEY)
            return layouts if isinstance(layouts, dict) else {}
        except Exception:
            return {}