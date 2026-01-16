
import React, { useState, useEffect } from 'react';
import { UserProfile, CommunityPost, ReportedPost } from '../types';

interface AdminDashboardProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onUsersChange: (users: UserProfile[]) => void;
  communityPosts: CommunityPost[];
  onPostsChange: (posts: CommunityPost[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  currentUser, 
  allUsers, 
  onUsersChange, 
  communityPosts, 
  onPostsChange 
}) => {
  const [reports, setReports] = useState<ReportedPost[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'posts'>('reports');

  useEffect(() => {
    const savedReports = localStorage.getItem('pawsay_admin_reports');
    if (savedReports) setReports(JSON.parse(savedReports));
  }, []);

  const handleDismissReport = (reportId: string) => {
    const updated = reports.filter(r => r.id !== reportId);
    setReports(updated);
    localStorage.setItem('pawsay_admin_reports', JSON.stringify(updated));
    
    // Also reset reports array on the post if dismissing everything
    const reportToDismiss = reports.find(r => r.id === reportId);
    if (reportToDismiss) {
      onPostsChange(communityPosts.map(p => {
        if (p.id === reportToDismiss.postId) {
          return { ...p, reports: [] }; // Reset reports so it becomes visible again
        }
        return p;
      }));
    }
  };

  const handleDeletePost = (postId: string) => {
    onPostsChange(communityPosts.filter(p => p.id !== postId));
    // Also remove related reports
    const updatedReports = reports.filter(r => r.postId !== postId);
    setReports(updatedReports);
    localStorage.setItem('pawsay_admin_reports', JSON.stringify(updatedReports));
    alert("Post removed from community feed.");
  };

  const handleDeactivateUser = (userId: string) => {
    if (userId === currentUser.id) return alert("You cannot deactivate yourself!");
    
    onUsersChange(allUsers.map(u => u.id === userId ? { ...u, isDeactivated: !u.isDeactivated } : u));
    alert("User status updated.");
  };

  const handleIssueWarning = (userId: string) => {
    onUsersChange(allUsers.map(u => u.id === userId ? { ...u, warnings: (u.warnings || 0) + 1 } : u));
    alert("Warning issued to user.");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-300">
      <div className="bg-white p-4 border-b border-slate-200 sticky top-[80px] z-30 shadow-sm">
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl overflow-x-auto no-scrollbar">
          {(['reports', 'users', 'posts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[100px] py-2 rounded-xl text-xs font-bold capitalize transition ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
            >
              {tab} {tab === 'reports' && reports.length > 0 && <span className="bg-red-500 text-white px-1.5 rounded-full text-[8px] ml-1">{reports.length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex-1">
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <span className="mr-2">🚨</span> Active Reports
            </h3>
            {reports.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-dashed border-slate-300">
                <p className="text-slate-400">Everything looks clean! No reports found.</p>
              </div>
            ) : (
              reports.map(report => {
                const post = communityPosts.find(p => p.id === report.postId);
                const reportCount = post ? (Array.isArray(post.reports) ? post.reports.length : (typeof post.reports === 'number' ? post.reports : 0)) : 0;
                const isAutoHidden = reportCount > 3;

                return (
                  <div key={report.id} className={`bg-white rounded-3xl p-5 shadow-sm border animate-in slide-in-from-bottom-2 duration-300 ${isAutoHidden ? 'border-red-400 ring-2 ring-red-100' : 'border-red-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 px-2 py-0.5 rounded">Report #{report.id}</span>
                          {isAutoHidden && <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-red-600 px-2 py-0.5 rounded animate-pulse">Auto-Hidden</span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{new Date(report.timestamp).toLocaleString()}</p>
                      </div>
                      <button onClick={() => handleDismissReport(report.id)} className="text-slate-300 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">Flagged Content Preview:</p>
                      {post ? (
                        <div className="flex items-start space-x-3">
                          {post.imageUrl && <img src={post.imageUrl} className="w-12 h-12 rounded-lg object-cover" />}
                          <div className="flex-1">
                            <p className="text-sm text-slate-700 italic">"{post.text}"</p>
                            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Unique Reporters: {reportCount}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">Original post has been deleted.</p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button 
                        onClick={() => post && handleDeletePost(post.id)} 
                        disabled={!post}
                        className="flex-1 bg-red-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition disabled:opacity-30"
                      >
                        Delete Post
                      </button>
                      <button 
                        onClick={() => post && handleDeactivateUser(post.authorId)} 
                        disabled={!post}
                        className="flex-1 bg-slate-800 text-white py-2 rounded-xl text-xs font-bold hover:bg-slate-900 transition disabled:opacity-30"
                      >
                        Deactivate Author
                      </button>
                      <button 
                        onClick={() => handleDismissReport(report.id)} 
                        className="flex-1 bg-slate-100 text-slate-500 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <span className="mr-2">👥</span> User Management
            </h3>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Warnings</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allUsers.map(user => (
                    <tr key={user.id} className={`${user.isDeactivated ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border">
                            {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px]">👤</div>}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-none">{user.username}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {user.isDeactivated ? (
                          <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold">Deactivated</span>
                        ) : (
                          <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full font-bold">Active</span>
                        )}
                        {user.isAdmin && <span className="bg-yellow-100 text-yellow-600 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">Admin</span>}
                      </td>
                      <td className="px-4 py-4 text-slate-600 font-bold">{user.warnings || 0}</td>
                      <td className="px-4 py-4 text-right space-x-1">
                        <button onClick={() => handleIssueWarning(user.id)} className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition" title="Warn">
                          ⚠️
                        </button>
                        <button 
                          onClick={() => handleDeactivateUser(user.id)} 
                          className={`p-2 rounded-lg transition ${user.isDeactivated ? 'text-green-500 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                          title={user.isDeactivated ? "Reactivate" : "Deactivate"}
                        >
                          {user.isDeactivated ? '🔓' : '🚫'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <span className="mr-2">🖼️</span> Global Feed Control
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {communityPosts.map(post => {
                 const reportCount = Array.isArray(post.reports) ? post.reports.length : (typeof post.reports === 'number' ? post.reports : 0);
                 const isAutoHidden = reportCount > 3;

                 return (
                  <div key={post.id} className={`bg-white p-4 rounded-3xl shadow-sm border flex items-center justify-between ${isAutoHidden ? 'border-red-400 bg-red-50/20' : 'border-slate-100'}`}>
                    <div className="flex items-center space-x-3 overflow-hidden">
                      {post.imageUrl ? (
                        <img src={post.imageUrl} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">📝</div>
                      )}
                      <div className="overflow-hidden">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-bold text-slate-800 truncate">{post.text || 'Photo post'}</p>
                          {isAutoHidden && <span className="bg-red-600 text-white text-[8px] font-bold px-1.5 rounded uppercase shrink-0">Hidden</span>}
                        </div>
                        <p className="text-[10px] text-slate-400">By {post.authorName} • {reportCount} reports</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                );
              })}
              {communityPosts.length === 0 && <p className="text-center text-slate-400 py-10">No posts in the community feed.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
