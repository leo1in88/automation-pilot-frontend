import React from 'react';
import { ExternalLink, CheckCircle2, AlertCircle, Bot, Zap } from 'lucide-react';

interface Task {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input_text: string;
  input_image_url: string | null;
  output_text: string | null;
  output_image_url: string | null;
  worker_id: string | null;
  error_message: string | null;
  created_at: string;
}

export const RecentHistory: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const historyTasks = tasks.filter(t => t.status === 'completed' || t.status === 'failed');

  const parseOutput = (text: string | null) => {
    if (!text) return { content: '', sessionUrl: null };
    const parts = text.split('---SESSION_URL---');
    if (parts.length > 1) {
      return {
        content: parts[0].trim(),
        sessionUrl: parts[1].trim()
      };
    }
    return { content: text.trim(), sessionUrl: null };
  };

  return (
    <div className="w-full flex-1 overflow-y-auto mt-6 pr-2 custom-scrollbar">
      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6">
        <Zap className="text-yellow-500 fill-yellow-500" size={18} />
        Recent History
      </h3>
      
      <div className="space-y-6">
        {historyTasks.map((task) => {
          const { content, sessionUrl } = parseOutput(task.output_text);
          const isSuccess = task.status === 'completed';

          return (
            <div key={task.id} className="bg-white border text-sm border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent to-transparent group-hover:from-indigo-400 group-hover:to-purple-500 transition-all"></div>
              
              {/* Header: Status & Worker */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  {isSuccess ? 
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md font-semibold text-xs border border-emerald-100">
                      <CheckCircle2 size={14} /> Success
                    </span> : 
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-md font-semibold text-xs border border-red-100">
                      <AlertCircle size={14} /> Failed
                    </span>
                  }
                  <span className="text-[11px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full">
                    {new Date(task.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {sessionUrl && (
                    <a href={sessionUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:text-indigo-800 hover:underline">
                      <ExternalLink size={13} /> Browser Session
                    </a>
                  )}
                  {task.worker_id && (
                     <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 font-mono">
                        <Bot size={13} className="text-gray-400" />
                        {task.worker_id}
                     </div>
                  )}
                </div>
              </div>

              {/* Body: Grid Layout 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left: Input */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Input Prompt</span>
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <p className="text-gray-700 text-sm leading-relaxed">{task.input_text || "No text prompt"}</p>
                    {task.input_image_url && (
                      <div className="mt-3 relative aspect-video w-32 rounded-lg overflow-hidden border border-gray-200">
                        <img src={task.input_image_url} alt="Input" className="object-cover w-full h-full" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Output */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Output Result</span>
                  <div className={`p-4 rounded-xl border ${isSuccess ? 'bg-indigo-50/30 border-indigo-50' : 'bg-red-50/50 border-red-100'}`}>
                    <p className={`text-sm leading-relaxed ${isSuccess ? 'text-gray-700' : 'text-red-600 font-medium'}`}>
                       {content || task.error_message || "No output provided."}
                    </p>
                    {task.output_image_url && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 shadow-sm inline-block bg-checkerboard">
                        <a href={task.output_image_url} target="_blank" rel="noreferrer">
                          <img src={task.output_image_url} alt="Generative Output" className="max-h-40 max-w-full object-contain hover:scale-105 transition-transform cursor-pointer" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          );
        })}

        {historyTasks.length === 0 && (
          <div className="text-center py-16 px-6 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
            <Bot size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Your task history is empty.</p>
            <p className="text-sm text-gray-400 mt-1">Submit a new automation request above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};
