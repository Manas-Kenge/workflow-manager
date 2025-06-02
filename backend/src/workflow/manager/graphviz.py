import os
import subprocess
from tempfile import NamedTemporaryFile
from os.path import join

from Products.CMFCore.utils import getToolByName

DOT_EXE = "dot"
bin_search_path = []

if os.name == "nt":
    DOT_EXE = "dot.exe"
    try:
        import win32api
        import win32con

        try:
            key = win32api.RegOpenKeyEx(
                win32con.HKEY_LOCAL_MACHINE, r"SOFTWARE\ATT\Graphviz"
            )
            value, _ = win32api.RegQueryValueEx(key, "InstallPath")
            bin_search_path = [join(str(value), "bin")]
        except Exception:
            pass
    except ImportError:
        pass
else:
    path = os.getenv("PATH", "")
    bin_search_path = path.split(":")


class MissingBinary(Exception):
    pass


def bin_search(binary):
    for p in bin_search_path:
        path = join(p, binary)
        if os.access(path, os.R_OK | os.X_OK):
            return path
    raise MissingBinary(f'Unable to find binary "{binary}"')


try:
    bin_path = bin_search(DOT_EXE)
    HAS_GRAPHVIZ = True
except MissingBinary:
    HAS_GRAPHVIZ = False
    bin_path = None


def getObjectTitle(obj):
    obj_id = obj.getId()
    title = obj.title or obj_id
    return f"{title}\\n(id: {obj_id})" if obj.title else title


def getGuardTitle(guard):
    out = []
    if guard:
        if guard.expr:
            out.append(f"Expression: {guard.expr.text};")
        if guard.permissions:
            out.append(f'Permissions: {",".join(guard.permissions)};')
        if guard.roles:
            out.append(f'Roles: {",".join(guard.roles)};')
        if guard.groups:
            out.append(f'Groups: {",".join(guard.groups)};')
    return " ".join(out)


def getPOT(wf):
    out = [f'digraph "{wf.title}" {{']
    transitions = {}
    transitions_with_init_state = []

    for s in wf.states.objectValues():
        s_id = s.getId()
        s_title = getObjectTitle(s)
        out.append(
            f'"{s_id}" [shape=box,label="{s_title}",style="filled",fillcolor="#ffcc99"];'
        )

        for t_id in s.transitions:
            transitions_with_init_state.append(t_id)
            t = wf.transitions.get(t_id)
            if not t:
                out.append(f'# transition "{t_id}" from state "{s_id}" is missing')
                continue

            new_state_id = t.new_state_id or s_id
            key = (s_id, new_state_id)
            transitions.setdefault(key, []).append(
                f"{getObjectTitle(t)} {getGuardTitle(t.guard)}"
            )

    for t in wf.transitions.objectValues():
        if t.getId() not in transitions_with_init_state:
            new_state_id = t.new_state_id or None
            key = (None, new_state_id)
            transitions.setdefault(key, []).append(
                f"{getObjectTitle(t)} {getGuardTitle(t.guard)}"
            )

    for (src, dest), labels in transitions.items():
        out.append(f'"{src}" -> "{dest}" [label="{",".join(labels)}"];')

    out.append("}")
    return "\n".join(out)


def getGraph(workflow, output_format="gif"):
    pot = getPOT(workflow)
    portal_properties = getToolByName(workflow, "portal_properties")
    encoding = portal_properties.site_properties.getProperty("default_charset", "utf-8")
    pot = pot.encode(encoding) if isinstance(pot, str) else pot

    with NamedTemporaryFile(suffix=".dot", delete=False) as infile:
        infile.write(pot)
        infile_path = infile.name

    with NamedTemporaryFile(suffix=f".{output_format}", delete=False) as outfile:
        outfile_path = outfile.name

    subprocess.run(
        [bin_path, f"-T{output_format}", "-o", outfile_path, infile_path], check=True
    )

    with open(outfile_path, "rb") as out:
        result = out.read()

    os.remove(outfile_path)
    os.remove(infile_path)
    return result