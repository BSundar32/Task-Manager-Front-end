import { useState, useEffect } from 'react';
import { commentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatRelative, getAvatarUrl } from '../../utils/helpers';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const CommentItem = ({ comment, taskId, onReply, onDelete, onUpdate, currentUserId, depth = 0 }) => {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      await onUpdate(comment._id, editContent);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-slate-100 pl-4' : ''}`}>
      <div className="flex gap-3">
        <img
          src={getAvatarUrl(comment.author?.avatar, comment.author?.name)}
          alt={comment.author?.name}
          className="w-8 h-8 rounded-full shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-slate-50 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-slate-800">{comment.author?.name}</span>
              <span className="text-xs text-slate-400">{formatRelative(comment.createdAt)}</span>
            </div>
            {editing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" loading={saving} onClick={handleSave}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>
            )}
            {comment.isEdited && !editing && (
              <span className="text-xs text-slate-400 mt-1 block">(edited)</span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 ml-2">
            {depth === 0 && (
              <button
                onClick={() => onReply(comment)}
                className="text-xs text-slate-500 hover:text-primary-600 font-medium"
              >
                Reply
              </button>
            )}
            {comment.author?._id === currentUserId && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(comment._id)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies?.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              taskId={taskId}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onReply={onReply}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentSection = ({ taskId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const { data } = await commentsAPI.getByTask(taskId);
      setComments(data.comments);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const payload = { taskId, content };
      if (replyTo) payload.parentCommentId = replyTo._id;
      const { data } = await commentsAPI.create(payload);

      if (replyTo) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === replyTo._id
              ? { ...c, replies: [...(c.replies || []), data.comment] }
              : c
          )
        );
      } else {
        setComments((prev) => [...prev, { ...data.comment, replies: [] }]);
      }

      setContent('');
      setReplyTo(null);
      toast.success('Comment added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentsAPI.delete(commentId);
      setComments((prev) =>
        prev
          .filter((c) => c._id !== commentId)
          .map((c) => ({ ...c, replies: c.replies?.filter((r) => r._id !== commentId) || [] }))
      );
      toast.success('Comment deleted');
    } catch {}
  };

  const handleUpdate = async (commentId, newContent) => {
    const { data } = await commentsAPI.update(commentId, { content: newContent });
    setComments((prev) =>
      prev.map((c) => {
        if (c._id === commentId) return { ...data.comment, replies: c.replies };
        return { ...c, replies: c.replies?.map((r) => r._id === commentId ? data.comment : r) || [] };
      })
    );
    toast.success('Comment updated');
  };

  return (
    <div>
      <h3 className="text-base font-semibold text-slate-800 mb-4">
        Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
      </h3>

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="mb-6">
        {replyTo && (
          <div className="flex items-center justify-between bg-primary-50 text-primary-700 text-xs px-3 py-2 rounded-t-lg border border-b-0 border-primary-200">
            <span>Replying to <strong>{replyTo.author?.name}</strong></span>
            <button type="button" onClick={() => setReplyTo(null)} className="hover:text-red-500">×</button>
          </div>
        )}
        <div className="flex gap-3">
          <img
            src={getAvatarUrl(user?.avatar, user?.name)}
            alt={user?.name}
            className="w-9 h-9 rounded-full shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <div className="flex justify-end mt-2">
              <Button type="submit" size="sm" loading={submitting} disabled={!content.trim()}>
                {replyTo ? 'Post Reply' : 'Post Comment'}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments list */}
      {loading ? (
        <div className="text-center py-8 text-slate-400 text-sm">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p className="text-3xl mb-2">💬</p>
          <p className="text-sm">No comments yet. Start the discussion!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              taskId={taskId}
              onReply={setReplyTo}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              currentUserId={user?._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
