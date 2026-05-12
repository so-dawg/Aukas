# Models

Database access layer. One file per entity (e.g. `user.model.js`, `opportunity.model.js`).

Each model exports functions like `findById`, `create`, `update`, `delete` that run SQL via the pool in `../db/`.
