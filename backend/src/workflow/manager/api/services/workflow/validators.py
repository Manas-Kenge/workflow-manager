from OFS.ObjectManager import checkValidId
from zope.i18n import translate
from Products.CMFCore.utils import getToolByName
from workflow.manager.utils import generate_id
from workflow.manager import WMMessageFactory as _


def not_empty(form, name):
    value = form.request.get(name, '').strip()
    if not value:
        form.errors[name] = translate(_('This field is required.'),
                                      context=form.request)
    return value


def id(form, name, container):
    elt_id = form.request.get(name, '').strip()
    if not elt_id:
        return ''

    putils = getToolByName(form.context, 'plone_utils')

    elt_id = generate_id(putils.normalizeString(elt_id),
                         container.objectIds())
    try:
        checkValidId(container, elt_id)
    except Exception:
        form.errors[name] = translate(_('Invalid name. Please try another.'),
                                      context=form.request)

    return elt_id


def parse_set_value(form, key):
    val = form.request.get(key)

    if isinstance(val, str):
        return {item.strip() for item in val.split(',') if item.strip()}
    
    if isinstance(val, (list, tuple, set)):
        return set(val)

    return set()