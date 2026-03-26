import React from 'react';
import { Activity, CheckCircle2, Clock, PlayCircle, XCircle } from 'lucide-react';

interface Task {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input_text: string;
}

interface TaskQueueProps {
  tasks: Task[];
  onClearQueue: () => void;
}

export const TaskQueue: React.FC<TaskQueueProps> = ({ tasks, onClearQueue }) => {
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const runningTasks = tasks.filter(t => t.status === 'running');

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-green-500" size={16} />;
      case 'running': return <PlayCircle className="text-blue-500 animate-pulse" size={16} />;
      case 'failed': return <XCircle className="text-red-500" size={16} />;
      default: return <Clock className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className="w-full lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 lg:h-full flex flex-col shrink-0 order-last lg:order-none">
      <div className="p-4 lg:p-5 flex-1 lg:pb-10 lg:overflow-y-auto">
        <div className="flex items-center justify-between mb-3 lg:mb-4 sticky top-0 bg-gray-50 pb-2 z-10">
          <h3 className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Activity size={14} /> Task Queue ({pendingTasks.length + runningTasks.length})
          </h3>
          {(pendingTasks.length > 0 || runningTasks.length > 0) && (
            <button 
              onClick={onClearQueue}
              className="text-[10px] text-red-500 hover:bg-red-50 px-2 py-1 rounded border border-red-200 transition-colors"
              title="Cancel all stuck tasks"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="flex flex-row lg:flex-col gap-3 lg:gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 snap-x">
          {runningTasks.map(task => (
             <div key={task.id} className="flex items-start gap-3 p-2.5 lg:p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl shadow-sm min-w-[200px] lg:min-w-0 flex-shrink-0 snap-start">
                <div className="mt-0.5">{getStatusIcon(task.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-800 font-medium truncate mb-0.5">Running Task</p>
                  <p className="text-[10px] lg:text-[11px] text-gray-500 truncate">{task.input_text}</p>
                </div>
             </div>
          ))}
          
          {pendingTasks.map(task => (
            <div key={task.id} className="flex items-start gap-3 p-2.5 lg:p-3 hover:bg-white rounded-xl group transition-all border border-transparent hover:border-gray-200 hover:shadow-sm min-w-[200px] lg:min-w-0 flex-shrink-0 snap-start">
              <div className="mt-0.5">{getStatusIcon(task.status)}</div>
              <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 font-medium truncate group-hover:text-gray-900 mb-0.5">Pending</p>
                  <p className="text-[10px] lg:text-[11px] text-gray-400 truncate group-hover:text-gray-500">{task.input_text}</p>
              </div>
            </div>
          ))}
          
          {pendingTasks.length === 0 && runningTasks.length === 0 && (
            <div className="text-center p-4 lg:p-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50 mt-2 lg:mt-4 w-full">
              <Clock size={20} className="mx-auto text-gray-300 mb-2" />
              <p className="text-xs lg:text-sm text-gray-400">Queue is empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
