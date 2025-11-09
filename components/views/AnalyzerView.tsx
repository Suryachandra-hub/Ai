import React, { useState } from 'react';
import type { Profile, AnalysisReport } from '../../types';
import { analyzeText } from '../../services/geminiService';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Spinner } from '../common/Spinner';
import { ArrowUpTrayIcon } from '../Icons';
import { extractTextFromFile } from '../../utils/fileUtils';

interface AnalyzerViewProps {
  profile: Profile;
}

const ScoreDonut: React.FC<{ score: number }> = ({ score }) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  const color = score > 70 ? 'text-red-400' : score > 40 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="relative h-40 w-40">
      <svg className="h-full w-full" viewBox="0 0 100 100">
        <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
        <circle
          className={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className={`absolute inset-0 flex flex-col items-center justify-center font-bold ${color}`}>
        <span className="text-4xl">{score}</span>
        <span className="text-sm">% AI</span>
      </div>
    </div>
  );
};


export const AnalyzerView: React.FC<AnalyzerViewProps> = ({ profile }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setReport(null);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setReport(null);
    setError(null);

    try {
      const textToAnalyze = await extractTextFromFile(selectedFile);
      const result = await analyzeText(textToAnalyze, profile.preferredTone);
      setReport(result);
    } catch (err) {
      console.error("Error processing file:", err);
      setError((err as Error).message || "An unknown error occurred during file processing.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
      <div className="lg:col-span-2 flex flex-col">
        <Card className="p-6 flex-1 flex flex-col">
          <h2 className="text-2xl font-bold text-yellow-300 mb-4 font-montserrat">Writing Analyzer</h2>
           <div className="bg-yellow-400/10 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-4 text-xs">
             This tool provides suggestions to improve writing. It is not an official plagiarism checker.
           </div>
           
           <div className="flex-1 flex flex-col items-center justify-center w-full bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
             <ArrowUpTrayIcon className="w-12 h-12 text-gray-500 mb-4"/>
             <h3 className="text-lg font-semibold text-gray-200">Upload a document</h3>
             <p className="text-sm text-gray-400 mt-1">PDF, DOCX, PPTX, or TXT</p>
             <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.docx,.pptx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
                onChange={handleFileChange}
                disabled={isLoading}
             />
             <Button 
                variant="secondary" 
                className="mt-4" 
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isLoading}
              >
               Choose File
             </Button>
             {selectedFile && <p className="text-xs text-yellow-300 mt-4">Selected: {selectedFile.name}</p>}
           </div>
          
          <Button onClick={handleSubmit} className="w-full mt-4" disabled={isLoading || !selectedFile}>
            {isLoading ? <Spinner size="sm" /> : 'Analyze Document'}
          </Button>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card className="p-6 h-full overflow-y-auto">
          <h3 className="text-xl font-bold text-yellow-300 mb-4">Analysis Report</h3>
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Spinner size="lg" />
              <p className="mt-4">Analyzing your document... this can take a few moments.</p>
            </div>
          )}
          {!isLoading && !report && (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
              {error ? (
                <div className="text-red-400">
                  <h4 className="font-bold">Analysis Failed</h4>
                  <p className="text-sm mt-2">{error}</p>
                </div>
              ) : (
                <p>Upload a document to see the analysis report here.</p>
              )}
            </div>
          )}
          {report && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-700/50 p-6 rounded-lg">
                <ScoreDonut score={report.aiScore} />
                <div>
                  <h4 className="text-lg font-semibold text-yellow-300">AI Signature Score</h4>
                  <p className="text-sm text-gray-300 mt-1">This score estimates the likelihood that the text was written by an AI. A lower score suggests more human-like writing. Scores above 70 may indicate a high presence of AI writing patterns.</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">AI-Generated Highlights</h4>
                {report.aiHighlights.length > 0 ? (
                  <div className="space-y-3">
                    {report.aiHighlights.map((h, i) => (
                      <div key={i} className="p-3 bg-gray-900/50 rounded-md border-l-4 border-red-400">
                        <p className="text-sm text-gray-200">"{h.sentence}"</p>
                        <p className="text-xs text-red-300 mt-1 font-semibold">Reason: {h.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-400">No major AI signatures detected. Good job!</p>}
              </div>

               <div>
                <h4 className="font-semibold text-yellow-400 mb-2">Grammar & Spelling</h4>
                {report.grammarSuggestions.length === 0 && report.spellingErrors.length === 0 ? <p className="text-sm text-gray-400">No grammar or spelling issues found.</p> : (
                    <div className="space-y-3">
                        {report.grammarSuggestions.map((g, i) => (
                           <div key={i} className="p-3 bg-gray-900/50 rounded-md border-l-4 border-blue-400">
                             <p className="text-sm text-gray-400 line-through">{g.sentence}</p>
                             <p className="text-sm text-blue-300 mt-1">Suggestion: {g.suggestion}</p>
                           </div>
                        ))}
                         {report.spellingErrors.map((s, i) => (
                           <div key={i} className="p-3 bg-gray-900/50 rounded-md border-l-4 border-orange-400">
                             <p className="text-sm text-gray-200">Found: <span className="font-bold text-orange-300">{s.word}</span></p>
                             <p className="text-sm text-gray-300 mt-1">Did you mean: {s.suggestions.join(', ')}?</p>
                           </div>
                        ))}
                    </div>
                )}
               </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};