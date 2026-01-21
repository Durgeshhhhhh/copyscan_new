
import React, { useState, useRef } from 'react';
import { Button, Card } from './UI';
import { compareTexts } from '../services/searchService';
import { ComparisonResult } from '../types';

export const TextComparison: React.FC = () => {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingA, setIsDraggingA] = useState(false);
  const [isDraggingB, setIsDraggingB] = useState(false);

  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  const handleCompare = async () => {
    if (!textA.trim() || !textB.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await compareTexts(textA, textB);
      setResult(data);
    } catch (err) {
      setError("Failed to compare texts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const readFile = (file: File, target: 'A' | 'B') => {
    if (!file.type.match('text.*') && !file.name.endsWith('.md') && !file.name.endsWith('.rtf')) {
      setError("Only text-based files (.txt, .md, .rtf) are supported.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (target === 'A') {
        setTextA(content);
      } else {
        setTextB(content);
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'A' | 'B') => {
    const file = e.target.files?.[0];
    if (file) readFile(file, target);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent, target: 'A' | 'B') => {
    e.preventDefault();
    if (target === 'A') setIsDraggingA(false);
    else setIsDraggingB(false);

    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file, target);
  };

  const handlePaste = (e: React.ClipboardEvent, target: 'A' | 'B') => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          readFile(file, target);
          break;
        }
      }
    }
  };

  const clear = () => {
    setTextA('');
    setTextB('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Content Comparison</h2>
          <p className="text-gray-500 mt-1 text-sm">Directly compare two documents or files to visualize overlap and changes.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={clear} disabled={isLoading} className="bg-white border-gray-100">
            <i className="fas fa-redo mr-2"></i> Reset
          </Button>
          <Button onClick={handleCompare} isLoading={isLoading} disabled={!textA || !textB} className="shadow-lavender-200 px-6">
            <i className="fas fa-columns mr-2"></i> Compare Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document A */}
        <Card 
          className={`p-0 overflow-hidden flex flex-col h-[500px] border-lavender-50 shadow-xl shadow-lavender-500/5 ring-4 ring-white relative transition-all duration-300 ${isDraggingA ? 'scale-[1.02] border-lavender-400 ring-blue-100' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingA(true); }}
          onDragLeave={() => setIsDraggingA(false)}
          onDrop={(e) => handleDrop(e, 'A')}
        >
          <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Document Source (A)</span>
              {!result && (
                <button 
                  onClick={() => fileInputARef.current?.click()}
                  className="text-lavender-600 hover:text-lavender-800 transition-colors text-[10px] font-bold uppercase flex items-center bg-lavender-50 px-2 py-1 rounded"
                >
                  <i className="fas fa-file-import mr-1"></i> Upload
                </button>
              )}
            </div>
            <span className="text-[10px] font-bold text-gray-300 uppercase">{textA.length} chars</span>
          </div>

          <input 
            type="file" 
            ref={fileInputARef} 
            className="hidden" 
            accept=".txt,.md,.rtf" 
            onChange={(e) => handleFileUpload(e, 'A')} 
          />

          {isDraggingA && (
            <div className="absolute inset-0 bg-lavender-600/10 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center border-4 border-dashed border-lavender-400 m-2 rounded-xl pointer-events-none">
              <i className="fas fa-cloud-upload-alt text-4xl text-lavender-600 mb-2 animate-bounce"></i>
              <span className="text-lavender-700 font-black uppercase text-xs tracking-widest">Drop File A Here</span>
            </div>
          )}

          {result ? (
            <div 
              className="p-8 overflow-y-auto text-gray-800 leading-relaxed text-lg font-medium prose prose-indigo max-w-none scrollbar-thin"
              dangerouslySetInnerHTML={{ __html: result.highlightedTextA }}
            />
          ) : (
            <textarea
              className="flex-1 p-8 text-lg text-gray-800 placeholder-gray-300 focus:outline-none resize-none border-none leading-relaxed font-medium bg-transparent"
              placeholder="Paste content, paste a file (Ctrl+V), or drag a file here..."
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              onPaste={(e) => handlePaste(e, 'A')}
            />
          )}
        </Card>

        {/* Document B */}
        <Card 
          className={`p-0 overflow-hidden flex flex-col h-[500px] border-lavender-50 shadow-xl shadow-lavender-500/5 ring-4 ring-white relative transition-all duration-300 ${isDraggingB ? 'scale-[1.02] border-lavender-400 ring-blue-100' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingB(true); }}
          onDragLeave={() => setIsDraggingB(false)}
          onDrop={(e) => handleDrop(e, 'B')}
        >
          <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Comparison Target (B)</span>
              {!result && (
                <button 
                  onClick={() => fileInputBRef.current?.click()}
                  className="text-lavender-600 hover:text-lavender-800 transition-colors text-[10px] font-bold uppercase flex items-center bg-lavender-50 px-2 py-1 rounded"
                >
                  <i className="fas fa-file-import mr-1"></i> Upload
                </button>
              )}
            </div>
            <span className="text-[10px] font-bold text-gray-300 uppercase">{textB.length} chars</span>
          </div>

          <input 
            type="file" 
            ref={fileInputBRef} 
            className="hidden" 
            accept=".txt,.md,.rtf" 
            onChange={(e) => handleFileUpload(e, 'B')} 
          />

          {isDraggingB && (
            <div className="absolute inset-0 bg-lavender-600/10 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center border-4 border-dashed border-lavender-400 m-2 rounded-xl pointer-events-none">
              <i className="fas fa-cloud-upload-alt text-4xl text-lavender-600 mb-2 animate-bounce"></i>
              <span className="text-lavender-700 font-black uppercase text-xs tracking-widest">Drop File B Here</span>
            </div>
          )}

          {result ? (
            <div 
              className="p-8 overflow-y-auto text-gray-800 leading-relaxed text-lg font-medium prose prose-indigo max-w-none scrollbar-thin"
              dangerouslySetInnerHTML={{ __html: result.highlightedTextB }}
            />
          ) : (
            <textarea
              className="flex-1 p-8 text-lg text-gray-800 placeholder-gray-300 focus:outline-none resize-none border-none leading-relaxed font-medium bg-transparent"
              placeholder="Paste content, paste a file (Ctrl+V), or drag a file here..."
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              onPaste={(e) => handlePaste(e, 'B')}
            />
          )}
        </Card>
      </div>

      {result && (
        <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
          <Card className="bg-lavender-600 border-none p-8 shadow-2xl shadow-lavender-500/20 text-white">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold tracking-tighter">{result.score}%</div>
                <div className="text-[10px] font-semibold text-lavender-200 uppercase tracking-widest mt-1">Similarity</div>
              </div>
              <div className="h-16 w-px bg-white/20 hidden md:block"></div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-semibold uppercase tracking-widest text-lavender-200 flex items-center">
                  <i className="fas fa-info-circle mr-2"></i>
                  Comparison Intelligence
                </h4>
                <p className="text-lg font-medium leading-relaxed">
                  {result.summary}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-3">
                <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                  <div className="w-3 h-3 bg-amber-200 rounded-sm"></div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-lavender-100">Highlighted Matches</span>
                </div>
                <Button variant="secondary" onClick={() => setResult(null)} className="text-xs bg-white text-lavender-600 border-none">
                  <i className="fas fa-edit mr-2"></i> Adjust Texts
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-5 rounded-2xl flex items-center space-x-4 border border-red-100">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <p className="font-bold">{error}</p>
        </div>
      )}
    </div>
  );
};
