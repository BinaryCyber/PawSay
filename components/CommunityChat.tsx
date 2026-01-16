
import React, { useState, useRef } from 'react';
import { UserProfile, CommunityPost, CommunityComment, ReportedPost } from '../types';

interface CommunityChatProps {
  currentUser: UserProfile;
  posts: CommunityPost[];
  onPostsChange: (posts: CommunityPost[]) => void;
}

const CommunityChat: React.FC<CommunityChatProps> = ({ currentUser, posts, onPostsChange }) => {
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePost = () => {
    if (!newPostText.trim() && !newPostImage) return;

    const post: CommunityPost = {
      id: Date.now().toString(),
      authorId: currentUser.id,
      authorName: currentUser.username,
      authorAvatar: currentUser.avatarUrl,
      text: newPostText,
      imageUrl: newPostImage || undefined,
      timestamp: Date.now(),
      likes: [],
      reports: [],
      comments: []
    };

    onPostsChange([post, ...posts]);
    setNewPostText('');
    setNewPostImage(null);
  };

  const handleLike = (postId: string) => {
    onPostsChange(posts.map(post => {
      if (post.id === postId) {
        const hasLiked = post.likes.includes(currentUser.id);
        return {
          ...post,
          likes: hasLiked 
            ? post.likes.filter(id => id !== currentUser.id)
            : [...post.likes, currentUser.id]
        };
      }
      return post;
    }));
  };

  const handleReport = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Safety: don't let user report multiple times
    if (Array.isArray(post.reports) && post.reports.includes(currentUser.id)) {
      alert("You have already reported this post.");
      return;
    }

    // 1. Update post object's internal reports array
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        const currentReports = Array.isArray(p.reports) ? p.reports : [];
        return { ...p, reports: [...currentReports, currentUser.id] };
      }
      return p;
    });
    onPostsChange(updatedPosts);

    // 2. Save detailed report to the "Admin Database"
    const savedReports = localStorage.getItem('pawsay_admin_reports');
    const reportsList: ReportedPost[] = savedReports ? JSON.parse(savedReports) : [];
    
    const newReport: ReportedPost = {
      id: Date.now().toString(),
      postId: postId,
      reporterId: currentUser.id,
      timestamp: Date.now(),
      reason: "User reported content as violating terms."
    };

    localStorage.setItem('pawsay_admin_reports', JSON.stringify([...reportsList, newReport]));
    
    const newReportCount = (Array.isArray(post.reports) ? post.reports.length : 0) + 1;
    if (newReportCount > 3) {
      alert("Post reported. Since this post has received multiple reports, it has been hidden until an admin can review it. Thank you for your help!");
    } else {
      alert("Post reported. Our moderators will review it shortly. Thank you for keeping PawSay safe!");
    }
  };

  const handleReply = (postId: string) => {
    if (!replyText.trim()) return;

    const comment: CommunityComment = {
      id: Date.now().toString(),
      authorId: currentUser.id,
      authorName: currentUser.username,
      authorAvatar: currentUser.avatarUrl,
      text: replyText,
      timestamp: Date.now()
    };

    onPostsChange(posts.map(post => post.id === postId ? { ...post, comments: [...post.comments, comment] } : post));
    setReplyText('');
    setActiveReplyPostId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter out posts with more than 3 reports (hidden until admin review)
  // Also handle cases where reports might still be a number from old data
  const filteredPosts = posts.filter(post => {
    const reportCount = Array.isArray(post.reports) ? post.reports.length : (typeof post.reports === 'number' ? post.reports : 0);
    return reportCount <= 3;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Post Creator */}
      <div className="bg-white p-4 border-b border-slate-100 shadow-sm sticky top-[80px] z-30">
        <div className="flex space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden border">
            {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400">👤</div>}
          </div>
          <div className="flex-1">
            <textarea
              placeholder="What's your pet up to?"
              className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100 transition resize-none text-black"
              rows={2}
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
            />
            {newPostImage && (
              <div className="mt-2 relative inline-block">
                <img src={newPostImage} className="max-h-32 rounded-lg border border-slate-200" />
                <button onClick={() => setNewPostImage(null)} className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 shadow-md">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            <div className="flex items-center justify-between mt-3">
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-2 text-slate-400 hover:text-blue-500 text-xs font-bold transition">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span>Add Photo</span>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              <button 
                onClick={handlePost} 
                disabled={!newPostText.trim() && !newPostImage}
                className="bg-slate-800 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-slate-900 transition disabled:opacity-50"
              >
                Post Moment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="p-4 space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 text-slate-400 italic">
            {posts.length > filteredPosts.length ? "Posts are hidden pending review." : "No posts yet. Be the first!"}
          </div>
        ) : filteredPosts.map(post => (
          <div key={post.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border">
                  {post.authorAvatar ? <img src={post.authorAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">👤</div>}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{post.authorName}</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">{new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <button 
                onClick={() => handleReport(post.id)} 
                className={`p-1 transition ${Array.isArray(post.reports) && post.reports.includes(currentUser.id) ? 'text-red-500' : 'text-slate-300 hover:text-red-400'}`}
                title="Report post"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </button>
            </div>

            <div className="px-4 pb-3">
              <p className="text-slate-700 text-sm leading-relaxed">{post.text}</p>
            </div>

            {post.imageUrl && (
              <div className="w-full bg-slate-100 flex items-center justify-center overflow-hidden max-h-[400px]">
                <img src={post.imageUrl} className="w-full object-contain" />
              </div>
            )}

            <div className="px-4 py-3 flex items-center space-x-6 border-t border-slate-50">
              <button 
                onClick={() => handleLike(post.id)}
                className={`flex items-center space-x-1 transition ${post.likes.includes(currentUser.id) ? 'text-pink-500' : 'text-slate-400 hover:text-pink-400'}`}
              >
                <svg className={`h-5 w-5 ${post.likes.includes(currentUser.id) ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                <span className="text-xs font-bold">{post.likes.length || ''}</span>
              </button>
              <button 
                onClick={() => setActiveReplyPostId(activeReplyPostId === post.id ? null : post.id)}
                className="flex items-center space-x-1 text-slate-400 hover:text-blue-500 transition"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <span className="text-xs font-bold">{post.comments.length || ''}</span>
              </button>
            </div>

            {/* Comments List */}
            {post.comments.length > 0 && (
              <div className="px-4 pb-4 space-y-3 bg-slate-50/50">
                {post.comments.map(comment => (
                  <div key={comment.id} className="flex space-x-2 animate-in fade-in slide-in-from-left-2 duration-200">
                    <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden shrink-0">
                      {comment.authorAvatar ? <img src={comment.authorAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400">👤</div>}
                    </div>
                    <div className="bg-white rounded-2xl p-3 border border-slate-100 flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-800">{comment.authorName}</span>
                        <span className="text-[8px] text-slate-400">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-slate-600">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input */}
            {activeReplyPostId === post.id && (
              <div className="p-4 border-t border-slate-50 flex space-x-2 animate-in slide-in-from-top-2 duration-200">
                <input
                  autoFocus
                  className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-blue-100 outline-none text-black"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleReply(post.id)}
                />
                <button 
                  onClick={() => handleReply(post.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityChat;
