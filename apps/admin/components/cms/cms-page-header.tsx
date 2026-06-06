import React from 'react';

interface CmsPageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function CmsPageHeader({ title, description, children }: CmsPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="text-slate-500 mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </div>
  );
}
