# Category Form Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Category Add/Edit form to use a Dialog/Modal.

**Architecture:** Create a reusable Dialog component and update the categories page to use it.

**Tech Stack:** Next.js, Tailwind CSS, Lucide React.

---

### Task 1: Create Reusable Dialog Component

**Files:**
- Create: `apps/admin/components/ui/dialog.tsx`

- [ ] **Step 1: Implement the Dialog component**

```tsx
'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/components/ui/dialog.tsx
git commit -m "feat: add reusable dialog component"
```

---

### Task 2: Refactor Categories Page to use Dialog

**Files:**
- Modify: `apps/admin/app/categories/page.tsx`

- [ ] **Step 1: Import Dialog and wrap CategoryForm**

Update `apps/admin/app/categories/page.tsx` to use the `Dialog` component.

```tsx
// ... imports
import { Dialog } from '@/components/ui/dialog';

// ... inside CategoriesPage component
      <Dialog 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <CategoryForm
          initialData={editingCategory}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </Dialog>
```

- [ ] **Step 2: Remove old inline form rendering**

Remove:
```tsx
      {isFormOpen && (
        <div className="mb-6">
          <CategoryForm
            initialData={editingCategory}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      )}
```

- [ ] **Step 3: Commit**

```bash
git add apps/admin/app/categories/page.tsx
git commit -m "refactor: use dialog for category form"
```

---

### Task 3: Verification

- [ ] **Step 1: Verify build and basic functionality**

Run: `pnpm --filter admin lint` and manually verify UI if possible. (Note: In this environment, we just ensure no lint errors).

- [ ] **Step 2: Final commit if needed**
