import React from 'react';
import { ServerCog, Activity } from 'lucide-react';

interface Worker {
  id: string;
  status: 'idle' | 'busy' | 'offline';
  current_task_id: string | null;
}

interface WorkerStatusProps {
  workers: Worker[];
}

export const WorkerStatus: React.FC<WorkerStatusProps> = ({ workers }) => {
  return (
    <div className="w-full lg:w-64 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 lg:h-full flex flex-col shrink-0">
      <div className="p-3 lg:p-5 flex-1 lg:overflow-y-auto">
        <h3 className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 lg:mb-4 flex items-center gap-2">
          <ServerCog size={14} /> Python Workers
        </h3>
        <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 lg:space-y-3 snap-x">
          {workers.map(worker => (
            <div key={worker.id} className="flex flex-col bg-white p-2.5 lg:p-3 border border-gray-100 rounded-xl shadow-sm hover:border-indigo-100 transition-colors min-w-[140px] lg:min-w-0 flex-shrink-0 snap-start">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`relative flex h-2 w-2 lg:h-2.5 lg:w-2.5 rounded-full ${worker.status === 'idle' ? 'bg-green-500' : worker.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'}`}>
                    {worker.status === 'busy' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>}
                  </span>
                  <span className="text-xs lg:text-sm font-semibold text-gray-800 truncate">{worker.id}</span>
                </div>
                <span className={`text-[9px] lg:text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${worker.status === 'idle' ? 'bg-green-100 text-green-700' : worker.status === 'busy' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                  {worker.status}
                </span>
              </div>
              {worker.current_task_id && worker.status === 'busy' && (
                 <div className="text-[9px] lg:text-[10px] text-gray-500 flex items-center gap-1 mt-1 truncate">
                    <Activity size={10} className="text-indigo-400 shrink-0" />
                    <span className="truncate">Task: {worker.current_task_id.substring(0,8)}...</span>
                 </div>
              )}
            </div>
          ))}
          {workers.length === 0 && (
             <div className="text-center p-3 lg:p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50 min-w-[140px] flex-shrink-0">
               <p className="text-xs lg:text-sm text-gray-400 italic">No workers</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
