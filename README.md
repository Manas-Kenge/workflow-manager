# Volto Workflow Manager

Volto Workflow Manager is a visual workflow editor for Plone.  
It lets you create, manage, and edit workflows inside the Volto UI using a simple graph-based interface.

---

## Installation

This package is a Volto add-on. To install it in your Volto project:

1. Add `workflow-manager` to your project's `package.json`:

    ```json
    {
      "addons": ["workflow-manager"]
    }
    ```

2. Install dependencies:

    ```bash
    pnpm install
    ```

3. Start the Volto development server:

    ```bash
    pnpm start
    ```

---

## How to Use

1. Open the **Control Panel** and select **Workflow Manager**.
2. Create a new workflow if one does not exist.
3. Add states and transitions using the graph interface.
4. Edit state and transition details from the sidebar.
5. Assign permissions and roles as needed.
6. Save changes using the Volto toolbar.

---

## Development Setup

If you want to contribute or customize the add-on locally:

## Requirements

- [Node.js 22](https://6.docs.plone.org/install/create-project.html#node-js) 
- [pnpm](https://pnpm.io/)
- [UV](https://6.docs.plone.org/install/create-project-cookieplone.html#uv)

### Installation 

1. Clone the repository:

```sh
git clone https://github.com/Manas-Kenge/workflow-manager.git
cd workflow-manager
```

2. Install dependencies for both Backend and Frontend:

```sh
make install
```

### Start the Servers

1. Start the **Backend** (Plone) at [http://localhost:8080/](http://localhost:8080/):

```sh
make backend-start
```

2. In a new terminal, start the **Frontend** (Volto) at [http://localhost:3000/](http://localhost:3000/):

```sh
make frontend-start
```

 Your Plone development environment is now live!


# License

This project is licensed under the MIT License.