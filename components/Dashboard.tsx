
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Transcript } from '../types';
import { FileText, Type, Clock, Zap, TrendingUp } from 'lucide-react';

interface DashboardProps {
  transcripts: Transcript[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transcripts }) => {
  
  // Calculate Stats
  const totalWords = transcripts.reduce((acc, t) => acc + t.wordCount, 0);
  const totalTranscripts = transcripts.length;
  
  // Mock efficiency metric
  const hoursSaved = (totalWords / 150 / 60).toFixed(1); // Assuming 150 wpm reading/transcribing speed

  // Group by Date for Activity Charts
  const rawChartData = transcripts.reduce((acc: any[], t) => {
    const dateObj = new Date(t.date);
    const dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue...
    
    // Find existing entry for this date
    const existing = acc.find(item => item.date === dateLabel);
    
    if (existing) {
      existing.count += 1;
      existing.words += t.wordCount;
    } else {
      acc.push({ 
        date: dateLabel, 
        count: 1, 
        words: t.wordCount,
        timestamp: dateObj.getTime()
      });
    }
    return acc;
  }, []).sort((a, b) => a.timestamp - b.timestamp);

  // Generate a full week (or at least some empty days) if no data
  const emptyData = [
    { date: 'Mon', count: 0, words: 0 },
    { date: 'Tue', count: 0, words: 0 },
    { date: 'Wed', count: 0, words: 0 },
    { date: 'Thu', count: 0, words: 0 },
    { date: 'Fri', count: 0, words: 0 },
    { date: 'Sat', count: 0, words: 0 },
    { date: 'Sun', count: 0, words: 0 },
  ];

  const chartData = rawChartData.length > 0 ? rawChartData : emptyData;

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in pb-24 pt-12">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
              <h1 className="text-3xl font-bold text-white">Overview</h1>
              <p className="text-slate-400 mt-1">Your transcription activity and performance metrics.</p>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Transcripts Generated', value: totalTranscripts, icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Total Words Processed', value: totalWords.toLocaleString(), icon: Type, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Hours Saved', value: `${hoursSaved} hrs`, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[50px] transform translate-x-10 -translate-y-10 group-hover:translate-x-0 transition-transform duration-700"></div>
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <Zap className="w-4 h-4 text-slate-700" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 relative z-10">{stat.value}</h3>
              <p className="text-slate-400 text-sm font-medium relative z-10">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Section - Always Visible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Usage Volume (Bar Chart) */}
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                      <h3 className="text-lg font-semibold text-white leading-tight">Weekly Usage</h3>
                      <p className="text-xs text-slate-500">Transcripts generated per day</p>
                  </div>
                </div>
            </div>
            {/* 
                Fixed Height wrapper to prevent Recharts from calculating 0 height initially 
            */}
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" tick={{fontSize: 12}} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} 
                    cursor={{fill: '#334155', opacity: 0.2}}
                  />
                  <Bar dataKey="count" name="Transcripts" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Word Volume (Area Chart) */}
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Type className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                      <h3 className="text-lg font-semibold text-white leading-tight">Content Volume</h3>
                      <p className="text-xs text-slate-500">Words processed per day</p>
                  </div>
                </div>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} 
                  />
                  <Area type="monotone" dataKey="words" name="Words" stroke="#10b981" fillOpacity={1} fill="url(#colorWords)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent List */}
          <div className="col-span-1 lg:col-span-2 bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl overflow-hidden min-h-[200px]">
              <h3 className="text-lg font-semibold text-white mb-6">Recent History</h3>
              {transcripts.length > 0 ? (
                <div className="space-y-4">
                  {transcripts.slice().reverse().slice(0, 5).map((t, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-800/50 hover:bg-slate-800/50 transition-colors cursor-default group">
                        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                          <FileText className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium truncate">{t.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{new Date(t.date).toLocaleDateString()}</span>
                              <span className="text-xs text-slate-500">{t.wordCount.toLocaleString()} words</span>
                          </div>
                        </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                    <p>No transcripts generated yet.</p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
