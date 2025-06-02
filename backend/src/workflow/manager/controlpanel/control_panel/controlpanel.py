from plone.app.registry.browser.controlpanel import ControlPanelFormWrapper
from plone.app.registry.browser.controlpanel import RegistryEditForm
from plone.restapi.controlpanels import RegistryConfigletPanel
from workflow.manager import _
from workflow.manager.interfaces import IPloneWorkflowmanagerLayer
from plone.z3cform import layout
from zope import schema
from zope.component import adapter
from zope.interface import Interface


class IControlPanel(Interface):
    myfield_name = schema.TextLine(
        title=_(
            "This is an example field for this control panel",
        ),
        description=_(
            "",
        ),
        default="",
        required=False,
        readonly=False,
    )


class ControlPanel(RegistryEditForm):
    schema = IControlPanel
    schema_prefix = "workflow.manager.control_panel"
    label = _("Control Panel")


ControlPanelView = layout.wrap_form(ControlPanel, ControlPanelFormWrapper)


@adapter(Interface, IPloneWorkflowmanagerLayer)
class ControlPanelConfigletPanel(RegistryConfigletPanel):
    """Control Panel endpoint"""

    schema = IControlPanel
    configlet_id = "control_panel-controlpanel"
    configlet_category_id = "Products"
    title = _("Control Panel")
    group = ""
    schema_prefix = "workflow.manager.control_panel"