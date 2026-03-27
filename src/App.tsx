import { useState, useEffect } from 'react';
import { WorkerStatus } from './components/WorkerStatus';
import { TaskQueue } from './components/TaskQueue';
import { TextInput } from './components/TextInput';
import { RecentHistory } from './components/RecentHistory';
import { Bot, LineChart, Settings, LayoutDashboard, ShoppingCart } from 'lucide-react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://automation-api.your-subdomain.workers.dev/api';

function App() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch initial Data & Setup Polling
  useEffect(() => {
    fetchWorkers();
    fetchTasks();
    
    // Tự động làm mới dữ liệu mỗi 3 giây (Rất nhẹ trên Cloudflare)
    const interval = setInterval(() => {
      fetchWorkers();
      fetchTasks();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/workers`);
      const data = await res.json();
      if (Array.isArray(data)) setWorkers(data);
    } catch (err) {
      console.error("Lỗi tải workers:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks`);
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
    } catch (err) {
      console.error("Lỗi tải tasks:", err);
    }
  };

  const handleSendMessage = async (text: string, imageUrl?: string, targetWorkers?: string[], taskType: string = 'chatgpt') => {
    setLoading(true);
    let finalImageUrl = imageUrl;

    try {
      // Nếu imageUrl là Base64 (từ TextInput), ta hãy upload nó lên R2 trước qua Worker
      if (imageUrl && imageUrl.startsWith('data:')) {
        const formData = new FormData();
        const blob = await (await fetch(imageUrl)).blob();
        formData.append('file', blob, 'upload.png');

        const uploadRes = await fetch(`${API_BASE_URL}/upload-image`, {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.public_url) {
          finalImageUrl = uploadData.public_url;
        }
      }

      // Gửi lệnh tạo Task với URL ảnh thật (R2) và loại Task
      const res = await fetch(`${API_BASE_URL}/run-automation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            content: text, 
            image_url: finalImageUrl, 
            target_workers: targetWorkers,
            task_type: taskType 
        })
      });
      if (!res.ok) throw new Error("Failed to send task");
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối tới Cloudflare Worker API. Vui lòng kiểm tra lại URL.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearQueue = async () => {
    try {
      await fetch(`${API_BASE_URL}/clear-tasks`, { method: 'POST' });
      fetchTasks(); // Cập nhật trạng thái mới nhất
    } catch (err) {
      console.error("Failed to clear queue", err);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#FAFAFA] overflow-hidden text-gray-900 font-sans selection:bg-indigo-100">

      {/* Top Header & Feature Navigation */}
      <header className="shrink-0 bg-white border-b border-gray-200 shadow-sm z-20 flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-6 py-3 md:py-0 md:h-[72px] gap-3 md:gap-0">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl text-white shadow-indigo-200 shadow-lg shrink-0">
            <Bot size={22} className="stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-gray-800 text-lg leading-tight tracking-tight truncate">Automation Pilot</h1>
            <p className="text-[11px] font-semibold tracking-wider text-indigo-500 uppercase truncate">System Dashboard</p>
          </div>
        </div>

        {/* Feature Buttons */}
        <div className="flex items-center gap-2 bg-gray-50/80 p-1.5 rounded-lg border border-gray-100 overflow-x-auto w-full md:w-auto hide-scrollbar">
          <button className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-white rounded-md text-sm font-medium text-indigo-700 shadow-sm border border-gray-200/50 shrink-0">
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button className="flex items-center gap-2 px-3 lg:px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-colors shrink-0">
            <ShoppingCart size={16} /> <span className="hidden md:inline">E-Commerce</span>
          </button>
          <button className="flex items-center gap-2 px-3 lg:px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-colors shrink-0">
            <LineChart size={16} /> <span className="hidden md:inline">Analytics</span>
          </button>
          <button className="flex items-center gap-2 px-3 lg:px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-colors shrink-0">
            <Settings size={16} /> <span className="hidden lg:inline">Config</span>
          </button>
        </div>
      </header>

      {/* Main 3-Column Layout Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-[#FAFAFA]">

        {/* Left Column: Worker Status */}
        <WorkerStatus workers={workers} />

        {/* Center Column: Command Input & Feed */}
        <div className="flex-1 flex flex-col p-4 lg:p-6 w-full relative min-h-0 lg:h-full overflow-visible lg:overflow-y-auto shrink-0 lg:shrink order-3 lg:order-none bg-white lg:shadow-xl lg:shadow-gray-200/40 lg:rounded-t-3xl lg:border lg:border-gray-100 lg:mt-2">
          {/* Top Panel: Task Input Area */}
          <div className="shrink-0 mb-4 lg:mb-2">
            <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-3 lg:mb-4 tracking-tight px-1">Create Automation Task</h2>
            <TextInput onSendMessage={handleSendMessage} isLoading={loading} workers={workers} />
          </div>

          {/* Bottom Feed: Recent History Log */}
          <RecentHistory tasks={tasks} />
        </div>

        {/* Right Column: Task Queue */}
        <TaskQueue tasks={tasks} onClearQueue={handleClearQueue} />

      </div>

    </div>
  );
}

export default App;
