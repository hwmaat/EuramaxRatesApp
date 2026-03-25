\# AngularBaseShell repository instructions



\## Purpose



This repository is a reusable Angular base shell.



It is \*\*not\*\* a business-specific application.

Keep the repository generic, clean, and reusable for future Angular applications.



The goal is to preserve and extend a starter framework that already includes:



\- application shell

\- landing page

\- authentication flow

\- bootstrap flow

\- login page

\- header

\- footer

\- side menu

\- content layout

\- router structure

\- shared services

\- shared generic models

\- theme handling

\- global error handling

\- API base infrastructure



Do \*\*not\*\* reintroduce old business-specific pages, planning pages, basedata pages, or business models unless explicitly requested.



\---



\## Architectural intent



Treat this repository as a \*\*starter shell\*\*.



Preserve these concepts:



\- standalone Angular architecture

\- route-based application shell

\- reusable layout components

\- shared infrastructure in services, helpers, guards, interceptors, and models

\- minimal generic landing page

\- minimal generic menu

\- reusable auth/bootstrap/login structure



Avoid coupling generic infrastructure to any domain such as:

\- production

\- planning

\- base data

\- ERP

\- customers

\- orders

\- reports

\- company-specific master data



If domain functionality is needed later, it must be added explicitly as a separate feature area.



\---



\## Keep these parts unless explicitly told otherwise



Keep and preserve:



\- `src/app/app.\*`

\- `src/app/app.routes.ts`

\- `src/app/layout/\*\*`

\- `src/app/login/\*\*`

\- `src/app/bootstrap/\*\*`

\- `src/app/authentication-failed/\*\*`

\- shared guards

\- shared interceptors

\- shared helpers

\- shared generic services

\- generic menu infrastructure

\- generic config loading

\- theme infrastructure

\- generic error handling



Keep these shared services:



\- `globals.service`

\- `api.service`

\- `error.service`

\- `header.service`

\- `menu.service`

\- `theme.service`



Keep these shared models:



\- `app-config.model`

\- `app-error.model`



Do not remove a shared generic file just because it currently has limited usage.

Remove only when clearly obsolete and explicitly safe.



\---



\## Remove or avoid reintroducing



Do not add back:



\- old page modules from removed business areas

\- business-specific menu groups

\- business-specific models

\- business-specific DTOs

\- company-specific naming

\- business logic in the shell layout

\- hardcoded API endpoints for domain features

\- feature-specific UI in header, footer, or side menu



Avoid placeholder code that suggests a fake business domain.

Use neutral names such as:

\- Home

\- Dashboard

\- Settings

\- Profile

\- Administration

only when explicitly requested.



\---



\## Routing rules



Maintain a minimal and valid routing structure.



Current intent:



\- landing flow remains intact

\- authentication flow remains intact

\- login remains intact

\- home remains the default authenticated landing page

\- menu route for Home must match `/home`



Do not add lazy-loaded feature routes unless explicitly requested.



Do not leave dead routes, missing imports, or route references to deleted pages.



When changing routes:



1\. keep imports clean

2\. remove obsolete route references

3\. ensure redirects are still valid

4\. ensure the app builds successfully



\---



\## Menu rules



The side menu must remain generic.



Default menu should stay minimal.

Do not add feature groups unless explicitly requested.



When editing the menu:



\- keep it reusable

\- avoid business terminology

\- ensure every menu path exists

\- ensure removed routes are also removed from the menu

\- avoid access rules tied to old domain assumptions unless they are part of generic auth infrastructure



\---



\## UI and Angular conventions



Follow these conventions unless explicitly told otherwise:



\- use standalone components

\- prefer `inject()` over constructor injection

\- keep components focused on UI behavior

\- keep reusable logic in services

\- keep route config simple

\- keep templates clean and readable

\- avoid unnecessary abstraction

\- avoid premature generic frameworks inside the app



When creating new components:



\- create small, focused components

\- keep styling local where possible

\- do not introduce large business workflows into shell components

\- do not duplicate layout logic already present in the shell



\---



\## Service conventions



Shared services in this repository are infrastructure services.

Treat them as reusable application foundation pieces.



When modifying shared services:



\- preserve backward compatibility where reasonable

\- do not inject business-specific behavior

\- do not hardcode company-specific assumptions

\- keep API handling generic

\- keep config handling generic

\- keep error handling generic



If a service starts becoming domain-specific, move that logic into a new feature service instead of expanding the shell service.



\---



\## Model conventions



Only keep generic reusable models in the shell.



Examples of acceptable shell models:



\- app config

\- app error

\- generic auth/session models

\- generic menu event models

\- generic version/config metadata



Do not add domain entity models to the shell unless explicitly requested.



\---



\## Refactoring rules



When asked to clean up or extend the repository:



1\. preserve the existing shell architecture

2\. remove business-specific dependencies

3\. remove unused imports

4\. remove dead code only when clearly safe

5\. do not rewrite working infrastructure unnecessarily

6\. prefer minimal targeted changes over broad rewrites

7\. keep the app buildable after every change



Do not perform large structural rewrites unless explicitly requested.



\---



\## Validation expectations



After making code changes, always verify:



\- imports are correct

\- routes are valid

\- menu items point to valid routes

\- deleted files are no longer referenced

\- the application builds successfully



If you changed multiple files, summarize:



\- what was changed

\- what was removed

\- what was intentionally kept



\---



\## Output style for coding tasks



When proposing changes:



\- be precise

\- make minimal changes

\- preserve existing working code where possible

\- do not invent files that are not needed

\- do not add business features unless explicitly requested



If a request is ambiguous, prefer preserving the base shell and avoiding domain-specific additions.



\---



\## Summary



This repository is a \*\*generic Angular base shell\*\*.

Protect the shell.

Keep it reusable.

Keep it minimal.

Keep it buildable.

Do not let old business-specific application details creep back into the codebase unless explicitly requested.

