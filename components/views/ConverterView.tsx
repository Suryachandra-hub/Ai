import React, { useState, useCallback } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { ArrowUpTrayIcon, DocumentDuplicateIcon, ArrowsRightLeftIcon, ArrowLeftIcon } from '../Icons';

const API_BASE_URL = 'http://localhost:8000';

interface Tool {
  id: 'pdf-to-docx' | 'docx-to-pdf' | 'xlsx-to-csv' | 'csv-to-xlsx' | 'pdf-merge' | 'pdf-split' | 'pdf-unlock' | 'txt-to-json';
  name: string;
  description: string;
  accept: string;
  multiple: boolean;
  icon: React.ReactNode;
}

const tools: Tool[] = [
  { id: 'pdf-to-docx', name: 'PDF to Word', description: 'Convert PDF to editable DOCX.', accept: '.pdf,application/pdf', multiple: false, icon: <ArrowsRightLeftIcon className="w-8 h-8"/> },
  { id: 'docx-to-pdf', name: 'Word to PDF', description: 'Convert DOCX to PDF.', accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document', multiple: false, icon: <ArrowsRightLeftIcon className="w-8 h-8"/> },
  { id: 'xlsx-to-csv', name: 'Excel to CSV', description: 'Convert XLSX to CSV.', accept: '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', multiple: false, icon: <ArrowsRightLeftIcon className="w-8 h-8"/> },
  { id: 'csv-to-xlsx', name: 'CSV to Excel', description: 'Convert CSV to XLSX.', accept: '.csv,text/csv', multiple: false, icon: <ArrowsRightLeftIcon className="w-8 h-8"/> },
  { id: 'pdf-merge', name: 'Merge PDF', description: 'Combine multiple PDFs.', accept: '.pdf,application/pdf', multiple: true, icon: <DocumentDuplicateIcon className="w-8 h-8"/> },
  { id: 'pdf-split', name: 'Split PDF', description: 'Split a PDF into pages.', accept: '.pdf,application/pdf', multiple: false, icon: <DocumentDuplicateIcon className="w-8 h-8"/> },
  { id: 'pdf-unlock', name: 'Unlock PDF', description: 'Remove PDF restrictions.', accept: '.pdf,application/pdf', multiple: false, icon: <DocumentDuplicateIcon className="w-8 h-8"/> },
  { id: 'txt-to-json', name: 'Text to JSON', description: 'Convert TXT to JSON.', accept: '.txt,text/plain', multiple: false, icon: <ArrowsRightLeftIcon className="w-8 h-8"/> },
];

const ToolCard: React.FC<{ tool: Tool; onSelect: () => void }> = ({ tool, onSelect }) => (
  <button
    onClick={onSelect}
    className="bg-gray-800 p-6 rounded-lg text-center border-2 border-gray-700 hover:border-yellow-400 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105 group"
  >
    <div className="mx-auto text-yellow-400 group-hover:text-yellow-300 transition-colors">{tool.icon}</div>
    <h3 className="mt-4 font-semibold text-white">{tool.name}</h3>
    <p className="text-sm text-gray-400 mt-1">{tool.description}</p>
  </button>
);

export const ConverterView: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
      setError(null);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setFiles(Array.from(event.dataTransfer.files));
      setError(null);
      event.dataTransfer.clearData();
    }
  }, []);

  const handleDragEvents = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setIsDragOver(true);
    } else if (event.type === 'dragleave') {
      setIsDragOver(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTool || files.length === 0) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('tool', selectedTool.id);
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/convert`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const disposition = response.headers.get('content-disposition');
      let filename = 'download';
      if (disposition && disposition.includes('attachment')) {
        const filenameMatch = /filename="([^"]+)"/.exec(disposition);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setFiles([]);

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderToolSelection = () => (
    <>
      <h2 className="text-2xl font-bold text-yellow-300 mb-6 font-montserrat">Converter Suite</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tools.map(tool => (
          <ToolCard key={tool.id} tool={tool} onSelect={() => setSelectedTool(tool)} />
        ))}
      </div>
    </>
  );

  const renderConverterWorkspace = () => {
    if (!selectedTool) return null;
    return (
      <>
        <div className="flex items-center mb-6">
          <button onClick={() => { setSelectedTool(null); setFiles([]); setError(null); }} className="p-2 rounded-full hover:bg-gray-700 mr-4">
            <ArrowLeftIcon className="w-6 h-6 text-yellow-300" />
          </button>
          <h2 className="text-2xl font-bold text-yellow-300 font-montserrat">{selectedTool.name}</h2>
        </div>
        
        <div 
          onDrop={handleDrop}
          onDragEnter={handleDragEvents}
          onDragOver={handleDragEvents}
          onDragLeave={handleDragEvents}
          className={`flex-1 flex flex-col items-center justify-center w-full bg-gray-800 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver ? 'border-yellow-400' : 'border-gray-600'}`}
        >
          <ArrowUpTrayIcon className="w-12 h-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-200">Drag & Drop Your File(s) Here</h3>
          <p className="text-sm text-gray-400 mt-1">or</p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept={selectedTool.accept}
            multiple={selectedTool.multiple}
            onChange={handleFileChange}
            disabled={isLoading}
          />
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isLoading}
          >
            Choose File(s)
          </Button>
          <p className="text-xs text-gray-500 mt-2">Accepted format: {selectedTool.accept}</p>
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-yellow-200">Selected Files:</h4>
            <ul className="list-disc list-inside text-gray-300 text-sm mt-2">
              {files.map(file => <li key={file.name}>{file.name}</li>)}
            </ul>
          </div>
        )}

        <Button onClick={handleSubmit} className="w-full mt-6" disabled={isLoading || files.length === 0}>
          {isLoading ? <Spinner size="sm" /> : 'Convert & Download'}
        </Button>

        {error && (
          <div className="mt-4 text-center p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg">
            {error}
          </div>
        )}
      </>
    );
  };

  return (
    <Card className="p-6 h-full flex flex-col">
      {selectedTool ? renderConverterWorkspace() : renderToolSelection()}
    </Card>
  );
};
