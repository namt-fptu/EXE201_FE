"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Post, postsService } from "@/services/postsServiceWithAxios";

export default function PostApprovalPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const response = await postsService.getAll(1, 100, statusFilter, searchTerm);

      if (response.isSuccess) {
        setPosts(response.data);
      } else {
        toast.error(response.message || "Không thể tải danh sách bài đăng");
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Không thể tải danh sách bài đăng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (post: Post) => {
    try {
      const response = await postsService.approve(post.id);
      
      if (response.isSuccess) {
        toast.success(`Đã duyệt bài "${post.title}"`);
        await loadPosts();
      } else {
        toast.error(response.message || "Không thể duyệt bài đăng");
      }
    } catch (error) {
      console.error("Error approving post:", error);
      toast.error("Không thể duyệt bài đăng");
    }
  };

  const handleReject = async (post: Post) => {
    try {
      const response = await postsService.reject(post.id);
      
      if (response.isSuccess) {
        toast.success(`Đã từ chối bài "${post.title}"`);
        await loadPosts();
      } else {
        toast.error(response.message || "Không thể từ chối bài đăng");
      }
    } catch (error) {
      console.error("Error rejecting post:", error);
      toast.error("Không thể từ chối bài đăng");
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim() === '' || value.length > 2) {
      loadPosts();
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    loadPosts();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getConditionLabel = (condition: string) => {
    const labels = {
      'NEW': 'Mới',
      'LIKE_NEW': 'Như mới', 
      'GOOD': 'Tốt',
      'FAIR': 'Khá',
      'POOR': 'Kém'
    };
    return labels[condition as keyof typeof labels] || condition;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'PENDING': 'Chờ duyệt',
      'APPROVED': 'Đã duyệt',
      'REJECTED': 'Từ chối'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const pendingPosts = posts.filter(p => p.status === 'PENDING');
  const approvedPosts = posts.filter(p => p.status === 'APPROVED');
  const rejectedPosts = posts.filter(p => p.status === 'REJECTED');

  if (isLoading) {
    return (
      <div className="mx-auto max-w-full">
        {/* Loading Header */}
        <div className="mb-6 animate-pulse">
          <div className="h-8 bg-slate-200 rounded-lg w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded-lg w-1/2"></div>
        </div>
        
        {/* Loading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
                <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Loading Content */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-16 h-16 bg-slate-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-16 h-8 bg-slate-200 rounded-lg"></div>
                  <div className="w-16 h-8 bg-slate-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý duyệt bài đăng</h1>
          <p className="text-slate-700 mt-1 font-semibold">Duyệt và quản lý các bài đăng từ sinh viên</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="border border-primary-300 rounded-lg px-3 py-2 bg-white text-slate-900 font-semibold focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-warning-200 hover:shadow-xl hover:border-warning-300 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-warning-600">Chờ duyệt</p>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-warning-600"></div>
                  <p className="text-xl font-bold text-slate-900">Loading...</p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-slate-900">{pendingPosts.length}</p>
              )}
              <p className="text-sm font-semibold text-warning-600">Cần được xem xét</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-lg">
              <svg className="w-6 h-6 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-primary-200 hover:shadow-xl hover:border-primary-300 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-primary-600">Đã duyệt</p>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                  <p className="text-xl font-bold text-slate-900">Loading...</p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-slate-900">{approvedPosts.length}</p>
              )}
              <p className="text-sm font-semibold text-primary-600">Đã được phê duyệt</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200 hover:shadow-xl hover:border-red-300 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-600">Từ chối</p>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                  <p className="text-xl font-bold text-slate-900">Loading...</p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-slate-900">{rejectedPosts.length}</p>
              )}
              <p className="text-sm font-semibold text-red-600">Đã bị từ chối</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="mb-6 bg-white rounded-xl shadow-lg border border-accent-200 hover:shadow-xl hover:border-accent-300 transition-all duration-300 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border border-accent-300 rounded-lg px-4 py-3 bg-white text-slate-900 font-semibold focus:border-accent-500 focus:ring-2 focus:ring-accent-200 outline-none transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-lg border border-secondary-200 hover:shadow-xl hover:border-secondary-300 transition-all duration-300 p-6">
        <h3 className="text-lg font-bold text-secondary-700 mb-4">Danh sách bài đăng</h3>
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Không có bài đăng nào</h3>
            <p className="text-slate-600 mb-4">Chưa có bài đăng nào cần duyệt.</p>
          </div>        
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors duration-200 border border-slate-200 hover:border-slate-300">
                <div className="flex-shrink-0 h-16 w-16">
                  {post.postImages && post.postImages.length > 0 ? (
                    <img
                      src={post.postImages[0].url}
                      alt={post.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-slate-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{post.title}</h4>
                      <p className="text-xs font-semibold text-slate-600 mt-1">{post.categoryName}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm font-bold text-slate-900">{formatPrice(post.price)}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs font-medium text-slate-600">{getConditionLabel(post.condition)}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-500">Bởi: {post.authorName}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(post.status)}`}>
                        {getStatusLabel(post.status)}
                      </span>
                      
                      {post.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(post)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleReject(post)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                            </svg>
                            Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs font-medium text-slate-500">
                    Ngày tạo: {formatDate(post.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}