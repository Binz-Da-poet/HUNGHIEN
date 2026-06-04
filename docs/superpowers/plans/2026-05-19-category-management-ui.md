# Category Management UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Category Management UI in the Admin application, including listing, adding, editing, and deleting categories.

**Architecture:** Use Next.js App Router, Tailwind CSS for styling, and fetch data from the Backend API. Refactor the `cn` utility to a shared location.

**Tech Stack:** Next.js, Tailwind CSS, Lucide React, clsx, tailwind-merge.

---

### Task 1: Refactor `cn` utility

**Files:**
- Create: `apps/admin/lib/utils.ts`
- Modify: `apps/admin/components/layout/sidebar.tsx`

- [ ] **Step 1: Create `apps/admin/lib/utils.ts`**

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Update `apps/admin/components/layout/sidebar.tsx` to use the new `cn` utility**

```typescript
import { cn } from '@/lib/utils';
// Remove local cn definition and imports of clsx/twMerge
```

- [ ] **Step 3: Commit**

```bash
git add apps/admin/lib/utils.ts apps/admin/components/layout/sidebar.tsx
git commit -m "refactor: move cn utility to lib/utils"
```

### Task 2: Create Category Table Component

**Files:**
- Create: `apps/admin/components/categories/category-table.tsx`

- [ ] **Step 1: Implement `CategoryTable` component**
The table should display category name and slug, with Edit and Delete actions.

```tsx
'use client';

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Slug</th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{category.name}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{category.slug}</td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <button 
                  onClick={() => onEdit(category)}
                  className="mr-3 text-blue-600 hover:text-blue-900"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => onDelete(category.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/components/categories/category-table.tsx
git commit -m "feat: add category table component"
```

### Task 3: Create Category Form Component

**Files:**
- Create: `apps/admin/components/categories/category-form.tsx`

- [ ] **Step 1: Implement `CategoryForm` component**
A simple form for creating/editing categories.

```tsx
'use client';

import React, { useState, useEffect } from 'react';

interface Category {
  id?: string;
  name: string;
  slug: string;
}

interface CategoryFormProps {
  initialData?: Category | null;
  onSubmit: (data: Omit<Category, 'id'>) => void;
  onCancel: () => void;
}

export function CategoryForm({ initialData, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSlug(initialData.slug);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, slug });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">
        {initialData ? 'Edit Category' : 'Add Category'}
      </h3>
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!initialData) setSlug(e.target.value.toLowerCase().replace(/ /g, '-'));
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
          required
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none"
        >
          {initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/components/categories/category-form.tsx
git commit -m "feat: add category form component"
```

### Task 4: Implement Category Page

**Files:**
- Create: `apps/admin/app/categories/page.tsx`

- [ ] **Step 1: Implement Categories management page**
Fetch data from API and handle Add, Edit, and Delete.

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { CategoryTable } from '@/components/categories/category-table';
import { CategoryForm } from '@/components/categories/category-form';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const API_URL = 'http://localhost:3001/api/categories';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleSubmit = async (data: Omit<Category, 'id'>) => {
    try {
      if (editingCategory) {
        await fetch(`${API_URL}/${editingCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      setIsFormOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={handleAdd}
          className="flex items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-6">
          <CategoryForm
            initialData={editingCategory}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <CategoryTable
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/app/categories/page.tsx
git commit -m "feat: implement category management page"
```
