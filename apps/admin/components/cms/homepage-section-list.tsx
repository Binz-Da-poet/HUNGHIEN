'use client';

import React, { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { StatusToggle } from './status-toggle';
import { OrderControls } from './order-controls';
import { CmsFeedback } from './cms-feedback';
import { Loader2 } from 'lucide-react';

export function HomepageSectionList() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' }>({
    message: '',
    type: 'success',
  });

  const fetchSections = async () => {
    try {
      const data = await adminFetch('/admin/homepage/sections');
      setSections(data);
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await adminFetch(`/admin/homepage/sections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
      setSections(sections.map(s => s.id === id ? { ...s, isActive } : s));
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    
    // Optimistic update
    setSections(newSections);

    try {
      await adminFetch('/admin/homepage/sections/reorder', {
        method: 'POST',
        body: JSON.stringify({ ids: newSections.map(s => s.id) }),
      });
      setFeedback({ message: 'Đã cập nhật thứ tự', type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
      fetchSections(); // Rollback on failure
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
            <tr>
              <th className="px-6 py-3 w-24 text-center">Thứ tự</th>
              <th className="px-6 py-3">Tiêu đề</th>
              <th className="px-6 py-3">Loại</th>
              <th className="px-6 py-3 w-32 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sections.map((section, index) => (
              <tr key={section.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 flex justify-center">
                  <OrderControls
                    isFirst={index === 0}
                    isLast={index === sections.length - 1}
                    onMoveUp={() => handleMove(index, 'up')}
                    onMoveDown={() => handleMove(index, 'down')}
                  />
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">{section.title}</td>
                <td className="px-6 py-4 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  {section.type.replace(/_/g, ' ')}
                </td>
                <td className="px-6 py-4 text-center">
                  <StatusToggle
                    isActive={section.isActive}
                    onToggle={(active) => handleToggle(section.id, active)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <CmsFeedback
        message={feedback.message}
        type={feedback.type}
        onClear={() => setFeedback({ ...feedback, message: '' })}
      />
    </div>
  );
}
