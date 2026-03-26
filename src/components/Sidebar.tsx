import React from 'react';
import { Activity, ServerCog, CheckCircle2, Clock, PlayCircle, XCircle } from 'lucide-react';

interface Task {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input_text: string;
}

interface Worker {
  id: string;
  status: 'idle' | 'busy' | 'offline';
  current_task_id: string | null;
}

interface SidebarProps {
  workers: Worker[];
  tasks: Task[];
  onClearQueue: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ workers, tasks, onClearQueue }) => {

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const runningTasks = tasks.filter(t => t.status === 'running');
  const historyTasks = tasks.filter(t => t.status === 'completed' || t.status === 'failed').slice(0, 5); // Last 5

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-green-500" size={16} />;
      case 'running': return <PlayCircle className="text-blue-500 animate-pulse" size={16} />;
      case 'failed': return <XCircle className="text-red-500" size={16} />;
      default: return <Clock className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 h-screen overflow-y-auto flex flex-col hidden md:flex">
      
      {/* Workers Section */}
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ServerCog size={14} /> Python Workers
        </h3>
        <div className="space-y-3">
          {workers.map(worker => (
            <div key={worker.id} className="flex items-center justify-between bg-white p-3 border border-gray-100 rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <span className={`relative flex h-2.5 w-2.5 rounded-full ${worker.status === 'idle' ? 'bg-green-500' : worker.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'}`}>
                  {worker.status === 'busy' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>}
                </span>
                <span className="text-sm font-medium text-gray-700">{worker.id}</span>
              </div>
              <span className="text-xs text-gray-400 uppercase">{worker.status}</span>
            </div>
          ))}
          {workers.length === 0 && <p className="text-sm text-gray-400 italic">No workers available</p>}
        </div>
      </div>

       {/* Task Queue Section */}
       <div className="p-5 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
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
        <div className="space-y-2">
          {runningTasks.map(task => (
             <div key={task.id} className="flex items-center gap-3 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                {getStatusIcon(task.status)}
                <span className="text-xs text-blue-800 font-medium truncate">{task.input_text}</span>
             </div>
          ))}
          {pendingTasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg group transition-colors">
              {getStatusIcon(task.status)}
              <span className="text-xs text-gray-600 truncate group-hover:text-gray-900">{task.input_text}</span>
            </div>
          ))}
          {pendingTasks.length === 0 && runningTasks.length === 0 && (
            <p className="text-sm text-gray-400 italic">No pending tasks</p>
          )}
        </div>
      </div>

       {/* Task History Section */}
       <div className="p-5 flex-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Recent History
        </h3>
        <div className="space-y-2">
          {historyTasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors">
              {getStatusIcon(task.status)}
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs text-gray-800 truncate">{task.input_text}</span>
                <span className="text-[10px] text-gray-400">{task.id.split('-')[0]}</span>
              </div>
            </div>
          ))}
          {historyTasks.length === 0 && <p className="text-sm text-gray-400 italic">No task history</p>}
        </div>
      </div>

    </div>
  );
};
