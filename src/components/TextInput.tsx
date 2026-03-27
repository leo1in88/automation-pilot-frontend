import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Loader2, Target, CheckSquare, Square, ChevronDown } from 'lucide-react';

interface Worker {
  id: string;
  status: 'idle' | 'busy' | 'offline';
  current_task_id: string | null;
}

interface TextInputProps {
  onSendMessage: (text: string, imageUrl?: string, targetWorkers?: string[], taskType?: string) => void;
  isLoading: boolean;
  workers: Worker[];
}

export const TextInput: React.FC<TextInputProps> = ({ onSendMessage, isLoading, workers }) => {
  const [text, setText] = useState('');
  const [targetWorkers, setTargetWorkers] = useState<string[]>([]);
  const [taskType, setTaskType] = useState<'chatgpt' | 'gemini'>('chatgpt');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ảnh quá lớn. Vui lòng chọn ảnh < 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleWorker = (workerId: string) => {
    if (workerId === 'ALL') {
      setTargetWorkers(['ALL']);
      return;
    }
    if (workerId === '') {
      setTargetWorkers([]);
      return;
    }
    
    setTargetWorkers(prev => {
      // Nếu đang chọn ALL, hủy ALL và chỉ chọn máy này
      if (prev.includes('ALL')) return [workerId];
      
      if (prev.includes(workerId)) {
        return prev.filter(id => id !== workerId);
      } else {
        return [...prev, workerId];
      }
    });
  };

  const getDropdownLabel = () => {
    if (targetWorkers.length === 0) return '🎯 Tự động';
    if (targetWorkers.includes('ALL')) return '⚡ Tất cả máy';
    if (targetWorkers.length === 1) return `🤖 ${targetWorkers[0]}`;
    return `🤖 Đã chọn ${targetWorkers.length} máy`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || imagePreview) && !isLoading) {
      onSendMessage(text, imagePreview || undefined, targetWorkers, taskType);
      setText('');
      removeImage();
      // Tùy chọn: Nhấn gửi xong thì reset lại là Auto hay giữ nguyên máy? Giữ nguyên máy sẽ tiện hơn cho user.
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            if (file.size > 5 * 1024 * 1024) {
              alert("Ảnh quá lớn. Vui lòng chọn ảnh < 5MB.");
              return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
              setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50 transition-all duration-200 pb-2 relative z-20">
      {imagePreview && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-20 w-auto rounded-lg object-cover border border-gray-200 shadow-sm" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors border border-gray-100"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Tạo nhiệm vụ (Ví dụ: Thu thập Tiki.. hoặc Vẽ ảnh..)"
          className="w-full resize-none bg-transparent px-4 py-3 outline-none min-h-[80px] text-gray-700 placeholder:text-gray-400"
          disabled={isLoading}
        />

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between px-2 lg:px-4 mt-2 gap-3 lg:gap-0">
          <div className="flex items-center gap-2 flex-wrap order-2 lg:order-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent"
              disabled={isLoading}
              title="Đính kèm Hình ảnh"
            >
              <ImageIcon size={20} />
            </button>

            {/* TASK TYPE SELECTOR */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 ml-1 border border-gray-200">
              <button
                type="button"
                onClick={() => setTaskType('chatgpt')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  taskType === 'chatgpt' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
                disabled={isLoading}
              >
                ChatGPT
              </button>
              <button
                type="button"
                onClick={() => setTaskType('gemini')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  taskType === 'gemini' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
                disabled={isLoading}
              >
                Gemini
              </button>
            </div>

            {/* CUSTOM MULTI-SELECT DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
               <button 
                 type="button"
                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                 className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 ml-2 hover:border-gray-300 transition-colors min-w-[160px]"
                 disabled={isLoading}
               >
                 <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    <Target size={14} className="text-gray-400" />
                    {getDropdownLabel()}
                 </div>
                 <ChevronDown size={14} className="text-gray-400" />
               </button>

               {/* Dropdown Menu */}
               {isDropdownOpen && (
                 <div className="absolute top-full left-2 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50 py-1">
                    
                    {/* Auto Option */}
                    <div 
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => { toggleWorker(''); setIsDropdownOpen(false); }}
                    >
                      {targetWorkers.length === 0 ? <CheckSquare size={16} className="text-indigo-600" /> : <Square size={16} className="text-gray-300" />}
                      <span className="text-sm font-medium text-gray-700">🎯 Tự động (Máy rảnh rỗi)</span>
                    </div>

                    {/* All Option */}
                    <div 
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => { toggleWorker('ALL'); setIsDropdownOpen(false); }}
                    >
                      {targetWorkers.includes('ALL') ? <CheckSquare size={16} className="text-indigo-600" /> : <Square size={16} className="text-gray-300" />}
                      <span className="text-sm font-medium text-gray-700">⚡ Broadcast (Tất cả máy)</span>
                    </div>

                    <div className="h-px bg-gray-100 my-1 mx-4"></div>
                    <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chọn đích danh máy cày</div>

                    {/* Specific Workers */}
                    <div className="max-h-48 overflow-y-auto">
                      {workers.length === 0 && <div className="px-4 py-2 text-xs text-gray-400 italic">Không có máy nào đang bật</div>}
                      {workers.map(w => (
                        <div 
                          key={w.id}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-indigo-50/50 cursor-pointer transition-colors"
                          onClick={() => toggleWorker(w.id)}
                        >
                          {targetWorkers.includes(w.id) && !targetWorkers.includes('ALL') ? 
                            <CheckSquare size={16} className="text-indigo-600" /> : 
                            <Square size={16} className="text-gray-300" />
                          }
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">🤖 {w.id}</span>
                            <span className="text-[10px] text-gray-400 uppercase">{w.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
               )}
            </div>
            
          </div>
          
          <button
            type="submit"
            disabled={(!text.trim() && !imagePreview) || isLoading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm order-1 lg:order-2 w-full lg:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Queuing...</span>
              </>
            ) : (
              <>
                <span>Chạy Task</span>
                <Send size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
