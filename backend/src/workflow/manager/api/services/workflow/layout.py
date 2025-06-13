from Products.Five.browser import BrowserView
import json
from plone import api


class GraphLayout(BrowserView):
    """Class to handle the Workflow Manager graph layouts."""

    REGISTRY_KEY = "workflow.manager.layouts"

    def __init__(self, context, request, workflow=None):
        super().__init__(context, request)
        self.workflow = (
            workflow or self.request.form.get("workflow") or None
        )

        self.layout = {}
        layouts = self.getLayouts() or {}

        if self.workflow not in layouts:
            layouts[self.workflow] = "{}"
        else:
            try:
                self.layout = json.loads(layouts[self.workflow])
            except json.JSONDecodeError:
                self.layout = {}

    def __call__(self):
        layout_json = self.request.form.get("layout")
        if layout_json:
            try:
                self.layout = json.loads(layout_json)
                self.saveLayout()
            except json.JSONDecodeError:
                pass  # Optionally log error here

    def getLayouts(self):
        try:
            return api.portal.get_registry_record(self.REGISTRY_KEY)
        except Exception:
            return {}

    def saveLayout(self):
        layouts = self.getLayouts() or {}
        layouts[self.workflow] = json.dumps(self.layout)
        api.portal.set_registry_record(self.REGISTRY_KEY, layouts)

    def getLayout(self):
        return json.dumps(self.layout) if self.workflow else False
