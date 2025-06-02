from workflow.manager import _
from Products.CMFCore.utils import getToolByName
from zope.component.hooks import getSite


def managed_permissions(wfid=None):
    if wfid is None:
        return []

    site = getSite()
    wtool = getToolByName(site, "portal_workflow")
    wf = wtool.get(wfid)
    items = []
    for permission in wf.permissions:
        data = {}
        data["perm"] = permission
        data["name"] = _(permission)
        data["description"] = ""
        items.append(data)

    return items


def allowed_guard_permissions(wfid=None):
    return {item.get("name"): item.get("name") for item in managed_permissions(wfid)}