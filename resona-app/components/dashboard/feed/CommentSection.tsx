'use client';
import { useCallback, useEffect, useState } from 'react';
import { formatRelativeTime } from '@/lib/utils/timeUtils';
import { Heart } from 'lucide-react';

export interface CommentProps {
    id: string;
    postId: string;
    userId: string;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };
    content: string;
    createdAt: string;
    _count: {
        likes: number;
    };
    likes: Array<{
        userId: string;
        commentId: string;
    }>;
}

export default function CommentSection({ postId, onCommentAdded }: { postId: string; onCommentAdded?: () => void }) {
    const [comments, setComments] = useState<CommentProps[]>([]);
    const [input, setInput] = useState('');
    const [isCommentLoading, setIsCommentLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchComments = useCallback(async (signal?: AbortSignal) => {
        setIsCommentLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch(`/api/post/${postId}/comment`, { signal });
            let data: { comments?: CommentProps[]; error?: string } = {};

            try {
                data = await response.json();
            } catch {
                // keep fallback message below when JSON parsing fails
            }

            if (!response.ok) {
                const fallback =
                    response.status === 503
                        ? 'Comments are temporarily unavailable. Please try again.'
                        : 'Failed to load comments. Please try again.';
                setErrorMessage(
                    typeof data === 'object' && data && 'error' in data && data.error ? data.error : fallback
                );
                return;
            }

            // validate that data contains comments array before setting state
            if (Array.isArray(data.comments)) {
                setComments(data.comments);
                return;
            }

            // response was ok but invalid format
            setErrorMessage('Unexpected response format from comments API.');

            // if canceled request, silent exit
            // otherwise, show error message
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            setErrorMessage('Network error while loading comments.');
        } finally {
            setIsCommentLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        const controller = new AbortController();
        fetchComments(controller.signal);
        return () => controller.abort();
    }, [fetchComments]);

    const handleSubmit = async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput || isSubmitting) return;

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await fetch(`/api/post/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: trimmedInput }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data?.error ?? 'Failed to add comment');
                return;
            }

            if (data?.newComment) {
                setComments((prev) => [...prev, data.newComment as CommentProps]);
                setInput('');
                onCommentAdded?.();
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
            setErrorMessage('Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLikeToggle = async (commentId: string) => {
        const comment = comments.find(c => c.id === commentId);
        if (!comment) return;

        const previousIsLiked = (comment.likes?.length ?? 0) > 0;
        const previousLikeCount = comment._count?.likes ?? 0;

        setComments((prev) =>
            prev.map((comment) => {
                if (comment.id !== commentId) return comment;

                const isLiked = (comment.likes?.length ?? 0) > 0;
                const nextIsLiked = !isLiked;
                const nextLikeCount = Math.max(0, (comment._count?.likes ?? 0) + (nextIsLiked ? 1 : -1));

                return {
                    ...comment,
                    _count: {
                        ...(comment._count ?? { likes: 0 }),
                        likes: nextLikeCount,
                    },
                    likes: nextIsLiked ? [{} as { userId: string; commentId: string }] : [],
                };
            })
        );

        try {
            const response = await fetch(`/api/comment/${commentId}/like`, {
                method: 'POST',
            });

            if (!response.ok) throw new Error('Failed to toggle comment like');

            const data = await response.json();

            setComments((prev) =>
                prev.map((c) => {
                    if (c.id !== commentId) return c;
                    return {
                        ...c,
                        _count: { likes: data.likeCount },
                        likes: data.liked ? [{} as { userId: string; commentId: string }] : [],
                    };
                })
            );
        } catch (error) {
            console.error('Failed to toggle comment like:', error);
            setComments((prev) =>
                prev.map((c) => {
                    if (c.id !== commentId) return c;
                    return {
                        ...c,
                        _count: { likes: previousLikeCount },
                        likes: previousIsLiked ? [{} as { userId: string; commentId: string }] : [],
                    };
                })
            );
        }
    };

    return (
        <div className="mt-3 ml-10 rounded-xl bg-neutral-900/60 p-3">
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {isCommentLoading && <p className="text-sm text-neutral-400">Loading comments...</p>}

                {!isCommentLoading && comments.length === 0 && (
                    <p className="text-sm text-neutral-400">No comments yet.</p>
                )}

                {!isCommentLoading && comments.map((comment) => (
                    <div key={comment.id} className="rounded-md bg-neutral-800/80 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-white truncate">
                                {comment.user.name || 'Anonymous'}
                            </p>
                            <p className="text-xs text-neutral-500">
                                {formatRelativeTime(comment.createdAt)}
                            </p>
                        </div>
                        <p className="text-sm text-neutral-200 mt-1 break-words">{comment.content}</p>
                        <div className="mt-2">
                            <button
                                onClick={() => handleLikeToggle(comment.id)}
                                className={`flex items-center gap-1 text-xs ${(comment.likes?.length ?? 0) > 0 ? 'text-pink-400' : 'text-neutral-400 hover:text-pink-400'}`}
                            >
                                <Heart size={14} fill={(comment.likes?.length ?? 0) > 0 ? 'currentColor' : 'none'} />
                                <span>{comment._count?.likes ?? 0}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || input.trim().length === 0}
                    className="rounded-md border border-neutral-700 bg-neutral-700 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Posting...' : 'Post'}
                </button>
            </div>

            {errorMessage && (
                <p className="mt-2 text-xs text-red-400">{errorMessage}</p>
            )}
        </div>
    );
}
