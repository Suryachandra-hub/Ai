import React, { useState } from 'react';
import type { Profile, PptContent } from '../../types';
import { generatePptContent } from '../../services/geminiService';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Spinner } from '../common/Spinner';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { DocumentArrowDownIcon } from '../Icons';

interface PptMakerViewProps {
  profile: Profile;
}

export const PptMakerView: React.FC<PptMakerViewProps> = ({ profile }) => {
  const [topic, setTopic] = useState('');
  const [slidesCount, setSlidesCount] = useState<number>(5);
  const [includeSpeakerNotes, setIncludeSpeakerNotes] = useState(true);
  const [tone, setTone] = useState(profile.preferredTone);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<PptContent | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setGeneratedContent(null);
    const content = await generatePptContent(topic, slidesCount, includeSpeakerNotes, tone);
    setGeneratedContent(content);
    setIsLoading(false);
  };
  
  const downloadJson = () => {
    if (!generatedContent) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(generatedContent, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${topic.replace(/\s+/g, '_')}_presentation.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <Card className="p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-yellow-300 mb-6 font-montserrat">PPT Content Generator</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-yellow-300 mb-2">Presentation Topic</label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-gray-800 border-2 border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
              placeholder="e.g., The History of Ancient Rome"
              required
            />
          </div>

          <div>
            <label htmlFor="slidesCount" className="block text-sm font-medium text-yellow-300 mb-2">Number of Slides: {slidesCount}</label>
            <input
              id="slidesCount"
              type="range"
              min="3"
              max="15"
              value={slidesCount}
              onChange={(e) => setSlidesCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <ToggleSwitch label="Include Speaker Notes" enabled={includeSpeakerNotes} onChange={setIncludeSpeakerNotes} />
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-yellow-300">Tone:</span>
              <Button type="button" variant={tone === 'student' ? 'primary' : 'secondary'} onClick={() => setTone('student')}>Student</Button>
              <Button type="button" variant={tone === 'ai' ? 'primary' : 'secondary'} onClick={() => setTone('ai')}>AI</Button>
            </div>
          </div>

          <Button type="submit" className="w-full mt-4" disabled={isLoading || !topic.trim()}>
            {isLoading ? <Spinner size="sm" /> : 'Generate Content'}
          </Button>
        </form>
      </Card>

      <Card className="p-6 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-yellow-300">Generated Content</h3>
            {generatedContent && (
                <Button variant="secondary" onClick={downloadJson} className="flex items-center gap-2">
                    <DocumentArrowDownIcon className="w-5 h-5"/> Download JSON
                </Button>
            )}
        </div>
        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Spinner size="lg" />
              <p className="mt-4">Generating your presentation... this may take a moment.</p>
            </div>
          )}
          {generatedContent && !isLoading ? (
            <div className="space-y-6">
              {generatedContent.slides.map((slide, index) => (
                <div key={index} className="bg-gray-700/50 p-4 rounded-lg border border-yellow-500/20">
                  <h4 className="font-bold text-yellow-400">Slide {index + 1}: {slide.title}</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300 text-sm">
                    {slide.bullets.map((bullet, i) => <li key={i}>{bullet}</li>)}
                  </ul>
                  {includeSpeakerNotes && slide.speakerNotes && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <p className="text-xs text-yellow-200/80 font-semibold">Speaker Notes:</p>
                      <p className="text-xs text-gray-400 mt-1">{slide.speakerNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <p>Your generated presentation content will appear here.</p>
              <p className="text-xs mt-2">(Note: This tool generates text content. A backend service would be needed to create a downloadable .pptx file.)</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};