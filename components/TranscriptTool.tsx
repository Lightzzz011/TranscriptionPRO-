
import React, { useState } from 'react';
import { Youtube, FileText, Copy, CheckCircle2, AlignLeft, Download, AlertCircle, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { Transcript } from '../types';
import { getYoutubeTranscript } from '../services/youtube';

interface TranscriptToolProps {
  onTranscriptGenerated: (t: Transcript) => void;
}

export const TranscriptTool: React.FC<TranscriptToolProps> = ({ onTranscriptGenerated }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Transcript | null>(null);

  const handleGenerate = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Extract video ID
      // Supports: youtube.com/watch?v=ID, youtu.be/ID, etc.
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : null;

      if (!videoId) {
        throw new Error("Invalid YouTube URL. Please double check the link.");
      }

      // Fetch Real Transcript
      const content = await getYoutubeTranscript(videoId);
      
      const newTranscript: Transcript = {
        id: Math.random().toString(36).substr(2, 9),
        title: `Transcript: ${videoId}`,
        videoId: url,
        date: new Date().toISOString(),
        content: content,
        wordCount: content.split(' ').length
      };

      setResult(newTranscript);
      onTranscriptGenerated(newTranscript);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch transcript.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDemoFallback = () => {
       const demoContent = `[00:00] This is a demo transcript generated for demonstration purposes.
[00:05] It appears that the direct connection to YouTube was blocked by network restrictions or CORS.
[00:10] In a real production environment, this request would be routed through a dedicated backend server.
[00:15] However, you can still experience the full UI and functionality of TranscriptPRO.
[00:20] Notice how the dashboard updates in real-time when new transcripts are added.
[00:25] The grid layout and responsiveness are designed for professional use cases.`;

      const newTranscript: Transcript = {
        id: 'demo-fallback',
        title: `Demo Transcript (Connection Blocked)`,
        videoId: url || 'https://youtube.com/demo',
        date: new Date().toISOString(),
        content: demoContent,
        wordCount: 75
      };

      setResult(newTranscript);
      onTranscriptGenerated(newTranscript);
      setError(null);
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.content);
      // Small visual feedback could be added here
    }
  };

  const downloadTranscript = () => {
      if (!result) return;
      const element = document.createElement("a");
      const file = new Blob([result.content], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `transcript-${result.id}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-fade-in pb-24 pt-8">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
          Extract Transcripts
        </h1>
        <p className="text-slate-400 text-lg">
           Enter a YouTube link to fetch the official captions directly from the video.
        </p>
      </div>

      {/* Input Area */}
      <div className="flex flex-col gap-4 max-w-2xl mx-auto mb-12">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-50 group-hover:opacity-100 transition duration-200 blur"></div>
          <div className="relative flex items-center bg-black/80 backdrop-blur-sm rounded-xl p-2 border border-slate-800">
            <div className="pl-4 text-slate-500">
              <Youtube className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL here..."
              className="w-full bg-transparent border-none text-white text-lg px-4 py-3 focus:ring-0 placeholder:text-slate-600 font-light"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !url}
              className="bg-white text-black hover:bg-slate-200 px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" />
                    <span className="text-sm">Fetching...</span>
                </div>
              ) : (
                <>
                  <span>Extract</span>
                  <AlignLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
        
        {error && (
            <div className="flex flex-col gap-4 text-red-400 bg-red-500/10 p-6 rounded-lg border border-red-500/20 text-sm animate-fade-in">
                <div className="flex items-start gap-3">
                   <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                   <div>
                       <p className="font-semibold text-base mb-1">Error Generating Transcript</p>
                       <p className="opacity-80 leading-relaxed">{error}</p>
                   </div>
                </div>
                
                <div className="flex flex-wrap gap-3 pl-8">
                     <button 
                        onClick={handleGenerate}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
                     >
                        <RefreshCw className="w-3 h-3" />
                        Retry
                     </button>
                     <button 
                        onClick={handleDemoFallback}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
                     >
                        <Sparkles className="w-3 h-3" />
                        Use Demo Data
                     </button>
                </div>
            </div>
        )}
      </div>

      {/* Output Area */}
      {result && (
        <div className="animate-fade-in">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                <span className="text-slate-300 font-medium">Transcript Output</span>
                <span className="text-slate-600 text-sm ml-2 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">{result.wordCount.toLocaleString()} words</span>
              </div>
              <div className="flex gap-2">
                 <button 
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" 
                  title="Copy Text"
                 >
                    <Copy className="w-5 h-5" />
                 </button>
                 <button 
                  onClick={downloadTranscript}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" 
                  title="Download TXT"
                 >
                    <Download className="w-5 h-5" />
                 </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar bg-black/20">
              <pre className="font-mono text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
                {result.content}
              </pre>
            </div>
          </div>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="text-center text-slate-700 py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="font-light">Ready to process video</p>
        </div>
      )}
    </div>
  );
};
