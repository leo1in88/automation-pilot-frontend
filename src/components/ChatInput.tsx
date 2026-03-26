import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, X, Image as ImageIcon } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string, imageUrl?: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert('Chỉ hỗ trợ dán/tải hình ảnh!');
      return;
    }
    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const pastedFile = items[i].getAsFile();
        if (pastedFile) {
          handleFile(pastedFile);
          e.preventDefault();
        }
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submitHandler = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() && !file) return;

    let finalImageUrl: string | undefined = undefined;

    if (file) {
      try {
        // Gửi file trực tiếp đến Backend qua FormData (Bỏ qua CORS của R2)
        const formData = new FormData();
        formData.append('file', file);

        const apiUrl = `http://10.100.100.62:8000/api/upload-image`;
        const res = await fetch(apiUrl, {
          method: 'POST',
          body: formData
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        finalImageUrl = data.public_url;

      } catch (err) {
        console.error("Error uploading file:", err);
        alert("Có lỗi khi upload ảnh vào Backend. (Chưa điền API Key R2 ở Backend?)");
        return;
      }
    }

    // Gửi Message sang component cha để gọi Backend /api/run-automation
    onSendMessage(text, finalImageUrl);
    setText('');
    removeImage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitHandler();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 pt-2">
      {/* Image Preview Area */}
      {previewUrl && (
        <div className="mb-3 relative inline-block p-1 bg-gray-50 border rounded-lg">
          <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-md" />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-0.5 hover:bg-red-500"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors shrink-0"
          title="Attach Image"
          disabled={isLoading}
        >
          <Paperclip size={20} />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder="Type a message or paste an image (Ctrl+V)..."
          className="flex-1 max-h-32 min-h-11 py-2.5 px-3 bg-transparent resize-none outline-none text-gray-800 placeholder-gray-400"
          rows={1}
          disabled={isLoading}
        />

        <button
          onClick={() => submitHandler()}
          disabled={isLoading || (!text.trim() && !file)}
          className={`p-2.5 rounded-full shrink-0 transition-colors ${isLoading || (!text.trim() && !file) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Send size={18} className="translate-x-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};
