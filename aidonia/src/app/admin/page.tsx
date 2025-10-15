"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/redux/userStore";
import Link from "next/link";
import { dashboardService } from "@/services/dashboard";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

function AdminPageContent({
  selectedTimeFrame,
}: {
  selectedTimeFrame?: string;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useUserStore();
  const [isChecking, setIsChecking] = useState(true);
  const [canAccess, setCanAccess] = useState(false);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    // Single check on mount
    const timer = setTimeout(() => {
      const ok = isAuthenticated() && user?.role?.toLowerCase() === 'admin';
      setCanAccess(!!ok);
      setIsChecking(false);
      if (!ok) {
        router.replace("/signin");
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [router, isAuthenticated, user]);

  // Load dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      if (canAccess && !isChecking) {
        try {
          setIsLoadingStats(true);
              const [usersResponse, postsResponse] = await Promise.all([
                dashboardService.getTotalUsers(),
                dashboardService.getTotalPosts()
              ]);

              if (usersResponse?.isSuccess) {
                setTotalUsers(usersResponse.data);
              } else {
                console.error('Failed to load total users:', usersResponse?.message);
                setTotalUsers(0);
              }

              if (postsResponse?.isSuccess) {
                setTotalPosts(postsResponse.data);
              } else {
                console.error('Failed to load total posts:', postsResponse?.message);
                setTotalPosts(0);
              }
        } catch (error) {
          console.error('Error loading dashboard stats:', error);
          setTotalUsers(0);
        } finally {
          setIsLoadingStats(false);
        }
      }
    };

    loadStats();
  }, [canAccess, isChecking]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Aidonia Dashboard</h1>
          <p className="text-slate-700 mt-1 font-semibold">Welcome to Aidonia admin dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="border border-primary-300 rounded-lg px-3 py-2 bg-white text-slate-900 font-semibold focus:border-primary-500 focus:ring-2 focus:ring-primary-200">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-primary-200 hover:shadow-xl hover:border-primary-300 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-primary-600">Total Users</p>
              {isLoadingStats ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                  <p className="text-xl font-bold text-slate-900">Loading...</p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-slate-900">{totalUsers.toLocaleString()}</p>
              )}
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-warning-200 hover:shadow-xl hover:border-warning-300 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-warning-600">Total Post</p>
              {isLoadingStats ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-warning-600"></div>
                  <p className="text-xl font-bold text-slate-900">Loading...</p>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-slate-900">{totalPosts.toLocaleString()}</p>
                
                </>
              )}
            </div>
            <div className="p-3 bg-warning-100 rounded-lg">
              <svg className="w-6 h-6 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.562-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-primary-200 hover:shadow-xl hover:border-primary-300 transition-all duration-300 p-6">
          <h3 className="text-lg font-bold text-primary-700 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              {
                action: "New user registered",
                time: "2 minutes ago",
                type: "user",
              },
              {
                action: "Package purchased",
                time: "15 minutes ago",
                type: "package",
              },
              {
                action: "System backup completed",
                time: "1 hour ago",
                type: "system",
              },
              {
                action: "New support ticket",
                time: "2 hours ago",
                type: "support",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors duration-200">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'user' ? 'bg-primary-100' :
                  activity.type === 'package' ? 'bg-accent-100' :
                  activity.type === 'system' ? 'bg-warning-100' :
                  'bg-secondary-100'
                }`}>
                  <div className={`w-4 h-4 ${
                    activity.type === 'user' ? 'text-primary-600' :
                    activity.type === 'package' ? 'text-accent-600' :
                    activity.type === 'system' ? 'text-warning-600' :
                    'text-secondary-600'
                  }`}>
                    <div className="w-full h-full rounded-full bg-current"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{activity.action}</p>
                  <p className="text-xs font-medium text-slate-600">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-accent-200 hover:shadow-xl hover:border-accent-300 transition-all duration-300 p-6">
          <h3 className="text-lg font-bold text-accent-700 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/admin/packages"
              className="block w-full p-3 text-left hover:bg-primary-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-primary-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Manage Packages</p>
                  <p className="text-sm font-medium text-primary-600">Create and edit packages</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/post-approval"
              className="block w-full p-3 text-left hover:bg-yellow-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-yellow-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Duyệt bài đăng</p>
                  <p className="text-sm font-medium text-yellow-600">Quản lý và duyệt bài đăng</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/categories"
              className="block w-full p-3 text-left hover:bg-purple-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-purple-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Quản lý danh mục</p>
                  <p className="text-sm font-medium text-purple-600">Tạo và quản lý danh mục</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/analytics"
              className="block w-full p-3 text-left hover:bg-accent-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-accent-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <svg className="w-4 h-4 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">View Analytics</p>
                  <p className="text-sm font-medium text-accent-600">Check platform metrics</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/pages/settings"
              className="block w-full p-3 text-left hover:bg-secondary-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-secondary-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <svg className="w-4 h-4 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">System Settings</p>
                  <p className="text-sm font-medium text-secondary-600">Configure platform</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home({ searchParams }: PropsType) {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    searchParams.then((params) => {
      setSelectedTimeFrame(params.selected_time_frame);
    });
  }, [searchParams]);

  return <AdminPageContent selectedTimeFrame={selectedTimeFrame} />;
}
