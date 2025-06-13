from Products.CMFCore.utils import getToolByName
import json
from urllib.parse import urlencode

from AccessControl import Unauthorized

from zope.component import getUtility, getMultiAdapter
from zope.schema.interfaces import IVocabularyFactory
from Products.CMFCore.utils import getToolByName
from plone.memoize.view import memoize

from workflow.manager.api.services.workflow.layout import GraphLayout
from workflow.manager.permissions import (
    managed_permissions,
    allowed_guard_permissions,
)
from workflow.manager.actionmanager import ActionManager
from workflow.manager import _

plone_shipped_workflows = [
    "folder_workflow",
    "intranet_folder_workflow",
    "intranet_workflow",
    "one_state_workflow",
    "plone_workflow",
    "simple_publication_workflow",
    "comment_review_workflow",
]

class Base:
    def __init__(self, context, request):
        self.context = context
        self.request = request

    debug = False
    errors = {}
    next_id = None  # the id of the next workflow to be viewed
    label = _("Workflow Manager")
    description = _("Manage your custom workflows TTW.")

    @property
    @memoize
    def managed_permissions(self):
        return managed_permissions(self.selected_workflow.getId())

    @property
    @memoize
    def actions(self):
        return ActionManager()

    @property
    @memoize
    def allowed_guard_permissions(self):
        return allowed_guard_permissions(self.selected_workflow.getId())

    @property
    @memoize
    def portal(self):
        utool = getToolByName(self.context, "portal_url")
        return utool.getPortalObject()

    @property
    @memoize
    def portal_workflow(self):
        return getToolByName(self.context, "portal_workflow")

    @property
    @memoize
    def available_workflows(self):
        return [w for w in self.workflows if w.id not in plone_shipped_workflows]

    @property
    @memoize
    def workflows(self):
        pw = self.portal_workflow
        ids = pw.portal_workflow.listWorkflows()
        return [pw[id] for id in sorted(ids)]

    @property
    @memoize
    def selected_workflow(self):
        selected = self.request.get("selected-workflow")
        if isinstance(selected, list) and selected:
            selected = selected[0]
        return (
            self.portal_workflow.get(selected)
            if selected in self.portal_workflow.objectIds()
            else None
        )

    @property
    @memoize
    def selected_state(self):
        state = self.request.get("selected-state")
        if isinstance(state, list) and state:
            state = state[0]

        workflow = self.selected_workflow
        if workflow and state in workflow.states.objectIds():
            return workflow.states.get(state)

        return None

    @property
    @memoize
    def selected_transition(self):
        transition = self.request.get("selected-transition")
        if isinstance(transition, list) and transition:
            transition = transition[0]

        workflow = self.selected_workflow
        if workflow and transition in workflow.transitions.objectIds():
            return workflow.transitions.get(transition)

        return None

    @property
    @memoize
    def available_states(self):
        return (
            sorted(
                self.selected_workflow.states.objectValues(),
                key=lambda x: x.title.lower(),
            )
            if self.selected_workflow
            else []
        )

    @property
    @memoize
    def available_transitions(self):
        return (
            sorted(
                self.selected_workflow.transitions.objectValues(),
                key=lambda x: x.title.lower(),
            )
            if self.selected_workflow
            else []
        )

    def authorize(self):
        authenticator = getMultiAdapter(
            (self.context, self.request), name="authenticator"
        )
        if not authenticator.verify():
            raise Unauthorized

    def render_transitions_template(self):
        return self.workflow_transitions_template(
            available_states=self.available_states,
            available_transitions=self.available_transitions)

    def get_transition(self, id):
        if id in self.selected_workflow.transitions.objectIds():
            return self.selected_workflow.transitions[id]

    @property
    @memoize
    def assignable_types(self):
        vocab_factory = getUtility(IVocabularyFactory,
            name="plone.app.vocabularies.ReallyUserFriendlyTypes")
        types = []
        for v in vocab_factory(self.context):
            types.append(dict(id=v.value, title=v.title))

        def _key(v):
            return v['title']

        types.sort(key=_key)
        return types

    @property
    def assigned_types(self):
        types = []
        try:
            chain = self.portal_workflow.listChainOverrides()
            nondefault = [info[0] for info in chain]
            for type_ in self.assignable_types:
                if type_['id'] in nondefault:
                    chain = self.portal_workflow.getChainForPortalType(
                        type_['id'])
                    if len(chain) > 0 and chain[0] == \
                     self.selected_workflow.id:
                        types.append(type_)
        except:
            pass

        return types

    def get_transition_list(self, state):
        transitions = state.getTransitions()
        return [t for t in self.available_transitions if t.id in transitions]

    def get_state(self, id):
        if id in self.selected_workflow.states.objectIds():
            return self.selected_workflow.states[id]
        else:
            return None

    def get_transition_paths(self, state=None):

        if state is not None:
            states = [state,]
        else:
            states = self.available_states

        paths = dict()
        transitions = self.available_transitions
        for state in states:

            stateId = state.id

            for trans in state.transitions:
                current_transition = self.get_transition(trans)
                if current_transition is not None:
                    if current_transition.id is not None and current_transition.new_state_id is not None:

                        nextState = current_transition.new_state_id

                        if stateId not in paths:
                            paths[stateId] = dict()

                        if nextState not in paths[stateId]:
                           paths[stateId][nextState] = dict()

                        paths[state.id][nextState][current_transition.id] = current_transition.title

        return json.dumps(paths)

    def get_graphLayout(self, workflow):
        gl = GraphLayout(self.context, self.request, workflow.id)
        return gl.getLayout()

    def get_debug_mode(self):
        return self.debug
    
    def get_transition_paths(self, state=None):
        states = [state] if state else self.available_states
        paths = {}
        for state in states:
            stateId = state.id
            paths[stateId] = {
                trans.new_state_id: {trans.id: trans.title}
                for trans in map(self.get_transition, state.transitions)
                if trans and trans.new_state_id
            }
        return json.dumps(paths)

    @property
    @memoize
    def next_url(self):
        return self.get_url()

    def get_url(
        self, relative=None, workflow=None, transition=None, state=None, **kwargs
    ):
        url = (
            f"{self.context.absolute_url()}/@@workflowmanager"
            if not relative
            else f"{self.context.absolute_url()}/{relative.lstrip('/')}"
        )
        params = {
            "selected-workflow": (
                workflow.id
                if workflow
                else (
                    self.next_id
                    or (self.selected_workflow.id if self.selected_workflow else None)
                )
            ),
            "selected-transition": transition.id if transition else None,
            "selected-state": state.id if state else None,
            **kwargs,
        }
        params = {k: v for k, v in params.items() if v is not None}
        return f"{url}?{urlencode(params)}" if params else url

    @property
    @memoize
    def context_state(self):
        return getMultiAdapter((self.context, self.request), name="plone_portal_state")