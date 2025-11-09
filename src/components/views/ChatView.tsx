import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Spinner } from '../common/Spinner';
import { PaperAirplaneIcon, SparklesIcon, UserIcon, ArrowPathIcon, PaperClipIcon, XMarkIcon, DocumentIcon } from '../Icons';
import { getChatResponse } from '../../services/geminiService';
import type { Profile, ChatMessage, WritingTone } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { extractTextFromFile } from '../../utils/fileUtils';

interface ChatViewProps {
  profile: Profile;
}

const ChatMessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-400/20 flex items-center justify-center gold-glow">
          <SparklesIcon className="h-6 w-6 text-yellow-300" />
        </div>
      )}
      <div className={`max-w-xl p-4 rounded-2xl ${isUser ? 'bg-yellow-500/80 text-gray-900 rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
        {message.attachment && (
            <div className="mb-2 p-2 bg-yellow-400/20 rounded-lg text-sm flex items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-yellow-200"/>
                <span className="font-semibold text-yellow-100">{message.attachment.name}</span>
            </div>
        )}
        <p className="whitespace-pre-wrap">{message.text}</p>
        {!isUser && <span className="text-xs text-yellow-400/70 mt-2 block">Format: {message.tone === 'student' ? 'Student' : 'AI'}</span>}
      </div>
      {isUser && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
          <UserIcon className="h-6 w-6 text-gray-300" />
        </div>
      )}
    </div>
  );
};

export const ChatView: React.FC<ChatViewProps> = ({ profile }) => {
  const [sessionId, setSessionId] = useState(() => `session-${Date.now()}`);
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(`chat-history-${sessionId}`, []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAssignmentMode, setAssignmentMode] = useState(false);
  const [isStudentWritten, setStudentWritten] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages]);
  
  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    setSessionId(newId);
    setMessages([]);
    setAttachedFile(null);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: input,
      timestamp: new Date().toISOString(),
      tone: profile.preferredTone,
      ...(attachedFile && { attachment: { name: attachedFile.name } }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let messageWithContext = input;

    if (attachedFile) {
        try {
            const fileText = await extractTextFromFile(attachedFile);
            messageWithContext = `CONTEXT FROM FILE: ${attachedFile.name}\n---\n${fileText}\n---\n\nBased on the document above, please answer the following question: ${input}`;
        } catch (error) {
             const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                role: 'model',
                text: `Sorry, I couldn't read the file "${attachedFile.name}". Please try a different file.`,
                timestamp: new Date().toISOString(),
                tone: 'ai',
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
            setAttachedFile(null);
            return;
        }
    }

    const chatHistory = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    try {
      const responseText = await getChatResponse(
        sessionId,
        messageWithContext,
        chatHistory,
        profile.preferredTone,
        isAssignmentMode,
        isStudentWritten
      );

      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: responseText,
        timestamp: new Date().toISOString(),
        tone: profile.preferredTone,
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'model',
        text: 'An error occurred while fetching the response. Please check your connection and API key.',
        timestamp: new Date().toISOString(),
        tone: 'ai',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setAttachedFile(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="mb-4 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-yellow-300">Assignment Helper Mode</h2>
        <div className="flex items-center gap-4">
          <ToggleSwitch label="Enable" enabled={isAssignmentMode} onChange={setAssignmentMode} />
          {isAssignmentMode && <ToggleSwitch label="Make it sound student-written" enabled={isStudentWritten} onChange={setStudentWritten} />}
        </div>
         <Button variant="secondary" onClick={handleNewChat} className="flex items-center gap-2">
            <ArrowPathIcon className="w-5 h-5"/> New Chat
        </Button>
      </Card>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div ref={chatContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <SparklesIcon className="h-16 w-16 text-yellow-500/50 mb-4" />
              <h3 className="text-xl font-semibold">Welcome to AiRus Chat</h3>
              <p>Ask a question or attach a file to get started.</p>
            </div>
          ) : (
            messages.map((msg) => <ChatMessageBubble key={msg.id} message={msg} />)
          )}
          {isLoading && (
             <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-400/20 flex items-center justify-center gold-glow">
                    <SparklesIcon className="h-6 w-6 text-yellow-300" />
                </div>
                <div className="max-w-xl p-4 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none flex items-center">
                    <Spinner size="sm" />
                    <span className="ml-3">AiRus is thinking...</span>
                </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-yellow-500/20">
          {attachedFile && (
            <div className="mb-2 p-2 bg-gray-700 rounded-lg text-sm flex justify-between items-center">
                <div className="flex items-center gap-2 text-yellow-200">
                    <DocumentIcon className="w-5 h-5"/>
                    <span className="font-medium">{attachedFile.name}</span>
                </div>
                <button onClick={() => setAttachedFile(null)} className="text-gray-400 hover:text-white">
                    <XMarkIcon className="w-5 h-5"/>
                </button>
            </div>
          )}
          <div className="relative flex items-center">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.docx,.pptx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-3 text-gray-400 hover:text-yellow-400 transition-colors disabled:opacity-50"
                aria-label="Attach file"
            >
                <PaperClipIcon className="h-6 w-6" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about a lesson, or attach a file..."
              className="w-full bg-gray-800 border-2 border-gray-600 rounded-lg pl-4 pr-16 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all resize-none"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !attachedFile)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 !px-3 !py-2"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};