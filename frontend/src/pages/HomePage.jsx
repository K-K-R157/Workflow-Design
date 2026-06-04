import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Zap, Plus, Clock, FileText, ArrowRight, LogOut, Loader2, Trash2 } from 'lucide-react';
import { selectUser, selectIsAuthenticated, logout } from '../stores/authSlice';
import { apiGetWorkflows, apiCreateWorkflow, apiDeleteWorkflow } from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchWorkflows();
  }, [isAuthenticated, navigate]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const data = await apiGetWorkflows();
      setWorkflows(data.data || []);
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewWorkflow = async () => {
    try {
      const data = await apiCreateWorkflow({ name: 'Untitled Workflow' });
      navigate(`/editor/${data.data._id}`);
    } catch (err) {
      console.error('Failed to create workflow:', err);
    }
  };

  const handleOpenWorkflow = (id) => {
    navigate(`/editor/${id}`);
  };

  const handleDeleteWorkflow = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this workflow?')) return;
    try {
      await apiDeleteWorkflow(id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

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
          <div>
            <h1 className="text-lg font-bold text-white">Workflow Designer</h1>
            {user && (
              <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                {user.email}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNewWorkflow}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              color: 'white',
            }}
          >
            <Plus size={16} />
            New Workflow
          </motion.button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium cursor-pointer hover:bg-white/5 transition-colors"
            style={{ color: 'var(--color-text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--color-text-muted)' }}>
          Your Workflows
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin" style={{ color: '#8b5cf6' }} />
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px dashed rgba(139, 92, 246, 0.3)' }}>
              <FileText size={24} style={{ color: 'rgba(139, 92, 246, 0.5)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
              No workflows yet
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
              Create your first workflow to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((wf, i) => (
              <motion.div
                key={wf.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleOpenWorkflow(wf.id)}
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
                  <button
                    onClick={(e) => handleDeleteWorkflow(e, wf.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-500/10"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-1">{wf.name}</h3>
                <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  <span>{wf.nodeCount} nodes</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {timeAgo(wf.updatedAt)}
                  </span>
                  {wf.version > 1 && (
                    <>
                      <span>•</span>
                      <span>v{wf.version}</span>
                    </>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#8b5cf6' }}>
                  Open editor <ArrowRight size={12} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
