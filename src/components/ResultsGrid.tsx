import React from 'react';
import { Clock, Image as ImageIcon, Bot, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Task {
  id: string;
  status: string;
  task_type: string;
  input_text: string;
  input_image_url: string | null;
  output_text: string | null;
  output_image_url: string | null;
  worker_id: string | null;
  created_at: string;
  updated_at: string;
  error_message?: string;
}

interface ResultsGridProps {
  tasks: Task[];
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({ tasks }) => {
  // Format date nicely
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'completed':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-100"><CheckCircle2 size={12}/> Done</span>;
      case 'failed':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded border border-red-100"><AlertCircle size={12}/> Failed</span>;
      case 'running':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded border border-blue-100 shadow-sm"><Loader2 size={12} className="animate-spin"/> Working</span>;
      default:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded border border-gray-200">Pending</span>;
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#FAFAFA] w-full">
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
          <div className="p-4 bg-gray-50 rounded-full mb-4">
            <ImageIcon size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Chưa có kết quả nào</h3>
          <p className="text-sm text-gray-500 max-w-[250px]">Hãy gửi một yêu cầu từ màn hình Dashboard để bắt đầu nhận thành phẩm.</p>
        </div>
      </div>
    );
  }

  // Render
  return (
    <div className="flex-1 w-full overflow-y-auto bg-[#FAFAFA]">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
        
        {/* Header List */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2 tracking-tight">
               Tủ kính Thành phẩm
            </h2>
            <p className="text-sm text-gray-500 mt-1">Lưới tổng hợp toàn bộ kết quả sản xuất từ các Bot.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm font-semibold px-4 py-2 bg-white border border-gray-200 text-indigo-700 rounded-xl shadow-sm">
            <span className="text-gray-500 font-medium">Tổng số:</span> {tasks.length}
          </div>
        </div>

        {/* Grid Map */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {tasks.map((task) => (
            <div key={task.id} className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-indigo-100 transition-all duration-300 group">
              
              {/* Media Section: Khung vuông ảnh */}
              <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden">
                {task.output_image_url ? (
                  <img 
                    src={task.output_image_url} 
                    alt="Result" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : task.input_image_url && !task.output_image_url ? (
                  <img 
                    src={task.input_image_url} 
                    alt="Input context" 
                    className="w-full h-full object-contain p-4 opacity-50 grayscale mix-blend-multiply"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                    <ImageIcon size={24} strokeWidth={1.5} className="opacity-40" />
                    <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Không có ảnh</span>
                  </div>
                )}

                {/* Status Float */}
                <div className="absolute top-3 right-3 shadow-md rounded">
                  <StatusBadge status={task.status} />
                </div>
                
                {/* Type Badge */}
                <div className="absolute top-3 left-3 shadow-sm rounded">
                   <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border truncate max-w-[100px] shadow-sm ${
                      task.task_type === 'chatgpt' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                      task.task_type === 'gemini' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                   }`}>
                      {task.task_type}
                   </span>
                </div>
              </div>

              {/* Tóm tắt thông tin Text */}
              <div className="p-4 flex flex-col flex-1 min-h-[140px]">
                
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium mb-2 w-full truncate">
                   <Clock size={12} className="shrink-0" />
                   <span className="truncate">{formatDate(task.created_at)}</span>
                </div>
                  
                {/* Input Text Box */}
                <div className="font-semibold text-gray-800 text-sm line-clamp-2 leading-relaxed mb-auto" title={task.input_text}>
                  {task.input_text || "Không có nội dung đầu vào..."}
                </div>

                {/* Output Text / Error */}
                <div className="pt-3 mt-3 border-t border-gray-100">
                  {task.output_text && (
                     <div className="text-[13px] text-gray-600 line-clamp-1 italic truncate px-2 border-l-2 border-indigo-300">
                       {task.output_text}
                     </div>
                  )}
                  {task.error_message && (
                     <div className="text-[12px] text-red-600 line-clamp-1 bg-red-50 px-2 py-1 rounded border border-red-100 truncate w-full" title={task.error_message}>
                       {task.error_message}
                     </div>
                  )}
                  {!task.output_text && !task.error_message && task.status === 'completed' && (
                     <div className="text-[12px] text-gray-400 italic">Chỉ có dạng ảnh</div>
                  )}
                </div>

                {/* Footer Worker Meta */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md border border-gray-100 max-w-[120px]">
                    <Bot size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate">{task.worker_id || "Chưa phân công"}</span>
                  </div>
                  
                  {task.output_image_url && (
                    <a 
                      href={task.output_image_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm active:scale-95 shrink-0"
                    >
                      BẢN GỐC <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
};
