# Frontend Structure

## app
Root Vue application, app-level configuration, constants, and bootstrap-related files.

## components
Reusable presentational UI components.

## pages
Vue Router page components.

- `pages/auth`: authentication pages, such as LoginPage.
- `pages/admin`: authenticated application pages.
- `pages/admin/project-board`: components and page-level UI specific to a collaboration board.

## router
Vue Router configuration, route definitions, and navigation guards.

## stores
Pinia stores for global application state.

## composables
Reusable Vue Composition API logic.

## actions
Feature-specific business logic and interaction logic, especially for project board features.

## helpers
Pure helper functions such as debounce, clipboard, formatting, and parsing utilities.

## types
Shared TypeScript types and interfaces.
