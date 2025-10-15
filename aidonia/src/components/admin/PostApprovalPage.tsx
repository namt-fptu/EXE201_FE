"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Post, postsService } from "@/services/postsServiceWithAxios";
import { dashboardService } from "@/services/dashboard";
import PostDetailModal from "./PostDetailModal";
import ConfirmDialog from "./ConfirmDialog";

export default function PostApprovalPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvedTotal, setApprovedTotal] = useState<number | null>(null);
  const [rejectedTotal, setRejectedTotal] = useState<number | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "approve" | "reject" | null;
    post: Post | null;
  }>({
    isOpen: false,
    type: null,
    post: null,
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      // Load posts and statistical totals in parallel
      const [postsResp, activeResp, inactiveResp] = await Promise.all([
        postsService.getAll(1, 100),
        dashboardService.getTotalActivePosts(),
        dashboardService.getTotalInactivePosts(),
      ]);

      if (postsResp.isSuccess) {
        setPosts(postsResp.data);
      } else {
        toast.error(postsResp.message || "Unable to load post list");
      }

      // Fallback counts from the loaded posts if statistical endpoints fail
      const fallbackApproved = postsResp.isSuccess
        ? postsResp.data.filter((p) => p.status === 'APPROVED').length
        : 0;
      const fallbackRejected = postsResp.isSuccess
        ? postsResp.data.filter((p) => p.status === 'REJECTED').length
        : 0;

      if (activeResp?.isSuccess) {
        setApprovedTotal(activeResp.data);
      } else {
        setApprovedTotal(fallbackApproved);
      }

      if (inactiveResp?.isSuccess) {
        setRejectedTotal(inactiveResp.data);
      } else {
        setRejectedTotal(fallbackRejected);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Unable to load post list");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (post: Post) => {
    setConfirmDialog({
      isOpen: true,
      type: "approve",
      post,
    });
  };

  const handleReject = async (post: Post) => {
    setConfirmDialog({
      isOpen: true,
      type: "reject",
      post,
    });
  };

  const handleConfirmAction = async () => {
    const { type, post } = confirmDialog;
    if (!post) return;

    setConfirmDialog({ isOpen: false, type: null, post: null });
    setLoadingAction(post.id);

    try {
      if (type === "approve") {
        toast.loading(`Approving post "${post.title}"...`);
        const response = await postsService.approve(post.id);

        if (response.isSuccess) {
          toast.success(`Post "${post.title}" approved successfully.`);
          setPosts((prevPosts) =>
            prevPosts.map((p) =>
              p.id === post.id ? { ...p, status: "APPROVED" as const } : p
            )
          );
        } else {
          toast.error(response.message || "Failed to approve the post.");
        }
      } else if (type === "reject") {
        toast.loading(`Rejecting post "${post.title}"...`);
        const response = await postsService.reject(post.id);

        if (response.isSuccess) {
          toast.success(`Post "${post.title}" rejected successfully.`);
          setPosts((prevPosts) =>
            prevPosts.map((p) =>
              p.id === post.id ? { ...p, status: "REJECTED" as const } : p
            )
          );
        } else {
          toast.error(response.message || "Failed to reject the post.");
        }
      }
    } catch (error: any) {
      console.error(`Error ${type}ing post:`, error);
      toast.error(error.message || `Failed to ${type} the post.`);
    } finally {
      setLoadingAction(null);
      toast.dismiss();
    }
  };

  const handleCancelAction = () => {
    setConfirmDialog({ isOpen: false, type: null, post: null });
  };

  const handleViewDetail = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900/25 dark:text-yellow-400">
            Pending
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/25 dark:text-green-400">
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900/25 dark:text-red-400">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-900/25 dark:text-gray-400">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[10px] border border-gray-200 bg-white px-7.5 py-6 shadow-lg shadow-gray-100/25">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-1/4 rounded-md bg-gray-200"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-5 gap-4 border-b border-gray-100 py-3"
              >
                <div className="h-4 rounded bg-gray-200"></div>
                <div className="h-4 rounded bg-gray-200"></div>
                <div className="h-4 rounded bg-gray-200"></div>
                <div className="h-4 rounded bg-gray-200"></div>
                <div className="h-4 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-[10px] border border-gray-200 bg-white px-7.5 py-16 text-center shadow-lg shadow-gray-100/25">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No posts found
          </h3>
          <p className="text-gray-500">
            There are no posts pending approval at the moment.
          </p>
        </div>
      </div>
    );
  }

  const pendingCount = posts.filter((p) => p.status === "PENDING").length;
  const approvedCount = posts.filter((p) => p.status === "APPROVED").length;
  const rejectedCount = posts.filter((p) => p.status === "REJECTED").length;

  return (
    <div className="mx-auto max-w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-bold text-slate-900">
            Post Management
          </h2>
          <p className="text-body font-medium text-slate-600">
            Review, approve, and manage posts from users
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">

  

  {/* ✅ Approved Posts - FIXED */}
  <div className="rounded-[10px] border px-7.5 py-6 shadow-lg transition-all duration-300"
     style={{ 
       borderColor: '#BBF7D0',        // border-green-200
       background: 'linear-gradient(to bottom right, #FFFFFF, #ECFDF5)', // green-50
       boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
     }}
>
  <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full" style={{ backgroundColor: '#D1FAE5' }}>
    <svg className="fill-green-600" width="22" height="22" viewBox="0 0 20 20" fill="none">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
    </svg>
  </div>
  <div className="mt-4">
    <h4 className="text-title-md font-bold text-slate-900">{approvedTotal ?? approvedCount}</h4>
    <span className="text-body-sm font-semibold" style={{ color: '#047857' }}>Approved Posts</span>
  </div>
</div>

  {/* Rejected Posts */}
  <div className="rounded-[10px] border px-7.5 py-6 shadow-lg transition-all duration-300"
     style={{
       borderColor: '#FECACA', // red-200
       background: 'linear-gradient(to bottom right, #FFFFFF, #FEF2F2)', // red-50
       boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)'
     }}
  >
    <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full" style={{ backgroundColor: '#FEE2E2' }}>
      <svg className="fill-red-600" width="22" height="22" viewBox="0 0 20 20" fill="none">
        <path fillRule="evenodd" d="M6 18L18 6M6 6l12 12" clipRule="evenodd" />
      </svg>
    </div>
    <div className="mt-4">
      <h4 className="text-title-md font-bold text-slate-900">{rejectedTotal ?? rejectedCount}</h4>
      <span className="text-body-sm font-semibold" style={{ color: '#B91C1C' }}>Rejected Posts</span>
    </div>
  </div>



</div>




      {/* Posts Table */}
      <div className="rounded-[10px] border border-stroke bg-white px-7.5 py-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <h4 className="text-title-lg font-bold text-dark dark:text-white">
            Post List ({posts.length} total, {pendingCount} pending)
          </h4>
        </div>

        <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-dark-2">
              <th className="min-w-[250px] px-4 py-4 font-semibold text-dark dark:text-white xl:pl-7.5">
                Post Title
              </th>
              <th className="min-w-[150px] px-4 py-4 font-semibold text-dark dark:text-white">
                User
              </th>
              <th className="min-w-[120px] px-4 py-4 font-semibold text-dark dark:text-white">
                Created Date
              </th>
              <th className="min-w-[120px] px-4 py-4 font-semibold text-dark dark:text-white">
                Status
              </th>
              <th className="px-4 py-4 text-center font-semibold text-dark dark:text-white xl:pr-7.5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, key) => (
              <tr
                key={post.id}
                className={`${
                  key === posts.length - 1
                    ? ""
                    : "border-b border-stroke dark:border-dark-3"
                } hover:bg-gray-50 dark:hover:bg-dark-3`}
              >
                <td className="px-4 py-4 xl:pl-7.5">
                  <button
                    onClick={() => handleViewDetail(post.id)}
                    className="flex items-center gap-3 text-left hover:opacity-80"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h5 className="font-semibold text-dark dark:text-white">
                        {post.title}
                      </h5>
                      <p className="text-body-sm text-gray-500">
                        {post.categoryName}
                      </p>
                    </div>
                  </button>
                </td>
                <td className="px-4 py-4">
                  <p className="text-dark dark:text-white">
                    {post.authorName}
                  </p>
                  <p className="text-body-sm text-gray-500">
                    {post.authorEmail}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-dark dark:text-white">
                    {formatDate(post.createdAt)}
                  </p>
                </td>
                <td className="px-4 py-4">{getStatusBadge(post.status)}</td>
                <td className="px-4 py-4 text-center xl:pr-7.5">
                  {post.status.trim().toUpperCase() === "PENDING" ? (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleApprove(post)}
                        disabled={loadingAction === post.id}
                        className="inline-flex items-center justify-center rounded-md bg-green-100 px-3 py-1.5 text-green-600 hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-900/25 dark:text-green-400 dark:hover:bg-green-900/50"
                        title="Approve post"
                      >
                        {loadingAction === post.id ? (
                          <svg
                            className="h-4 w-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(post)}
                        disabled={loadingAction === post.id}
                        className="inline-flex items-center justify-center rounded-md bg-red-100 px-3 py-1.5 text-red-600 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-900/25 dark:text-red-400 dark:hover:bg-red-900/50"
                        title="Reject post"
                      >
                        {loadingAction === post.id ? (
                          <svg
                            className="h-4 w-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Post Detail Modal */}
      <PostDetailModal
        postId={selectedPost?.id || ""}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApprove={handleApprove}
        onReject={handleReject}
        post={selectedPost || undefined}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={
          confirmDialog.type === "approve"
            ? "Approve Post"
            : "Reject Post"
        }
        message={
          confirmDialog.type === "approve"
            ? `Are you sure you want to approve "${confirmDialog.post?.title}"?`
            : `Are you sure you want to reject "${confirmDialog.post?.title}"?`
        }
        confirmText="OK"
        cancelText="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
      </div>
    </div>
  );
}