# Category Form Modal Design

**Goal:** Refactor the category management UI to use a Dialog/Modal for adding and editing categories instead of rendering the form inline.

**Architecture:**
- Create a reusable `Dialog` component using Tailwind CSS.
- Update `CategoriesPage` to wrap `CategoryForm` within the `Dialog`.
- Maintain existing state management for adding/editing categories.

**Components:**
1. `Dialog` (`apps/admin/components/ui/dialog.tsx`):
   - Props: `isOpen`, `onClose`, `title`, `children`.
   - Uses `Fixed` positioning for the overlay and centered container.
2. `CategoriesPage` (`apps/admin/app/categories/page.tsx`):
   - Replaces inline `{isFormOpen && ...}` with `<Dialog isOpen={isFormOpen} ...><CategoryForm ... /></Dialog>`.

**Data Flow:**
- `handleAdd` / `handleEdit` sets `isFormOpen` to `true`.
- `Dialog` handles closing via `onClose` (passed to `onCancel` of `CategoryForm`).
- `handleSubmit` in `CategoriesPage` closes the dialog on success.

**Testing:**
- Verify clicking "Add Category" opens the modal.
- Verify clicking "Edit" on a category row opens the modal with pre-filled data.
- Verify clicking the overlay or "Cancel" closes the modal.
- Verify successful submission closes the modal and refreshes the table.
