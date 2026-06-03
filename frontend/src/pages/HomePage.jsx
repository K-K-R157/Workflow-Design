import { motion } from 'framer-motion';
import { Zap, Plus, Clock, FileText, ArrowRight } from 'lucide-react';

const mockWorkflows = [
  { id: 1, name: 'Research & Summarize', nodes: 4, updated: '2h ago', status: 'draft' },
  { id: 2, name: 'Data Pipeline', nodes: 6, updated: '1d ago', status: 'published' },
  { id: 3, name: 'Email Digest Automation', nodes: 5, updated: '3d ago', status: 'draft' },
];

export default function HomePage({ onNavigate }) {
  return (
    <div className="h-screen w-screen flex flex-col" style={{ background: 'var(--color-surface-0)' }}>
      {/* Header */}
      <header className="px-8 py-5 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid var(--color-border-default)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-bold text-white">Workflow Designer</h1>
        </div>
        <button
          onClick={() => onNavigate?.('editor')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            color: 'white',
          }}
        >
          <Plus size={16} />
          New Workflow
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--color-text-muted)' }}>
          Your Workflows
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockWorkflows.map((wf, i) => (
            <motion.div
              key={wf.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onNavigate?.('editor')}
              className="group rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.02]"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                  <FileText size={18} style={{ color: '#8b5cf6' }} />
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                  style={{
                    background: wf.status === 'published' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: wf.status === 'published' ? '#10b981' : '#f59e0b',
                  }}>
                  {wf.status}
                </span>
              </div>
              <h3 className="text-[15px] font-semibold text-white mb-1">{wf.name}</h3>
              <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                <span>{wf.nodes} nodes</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock size={10} /> {wf.updated}</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: '#8b5cf6' }}>
                Open editor <ArrowRight size={12} />
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
