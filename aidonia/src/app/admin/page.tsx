"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/redux/userStore";
import Link from "next/link";
import { dashboardService } from "@/services/dashboard";
import { statisticsService, CompletedPayment } from "@/services/statisticsService";

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
  const [totalPayments, setTotalPayments] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [completedPayments, setCompletedPayments] = useState<CompletedPayment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

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
          const [usersResponse, postsResponse, paymentsResponse, revenueResponse] = await Promise.all([
            dashboardService.getTotalUsers(),
            dashboardService.getTotalPosts(),
            dashboardService.getTotalPayments(),
            dashboardService.getTotalRevenue()
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

          if (paymentsResponse?.isSuccess) {
            setTotalPayments(paymentsResponse.data);
          } else {
            console.error('Failed to load total payments:', paymentsResponse?.message);
            setTotalPayments(0);
          }

          if (revenueResponse?.isSuccess) {
            setTotalRevenue(revenueResponse.data);
          } else {
            console.error('Failed to load total revenue:', revenueResponse?.message);
            setTotalRevenue(0);
          }
        } catch (error) {
          console.error('Error loading dashboard stats:', error);
          setTotalUsers(0);
          setTotalPosts(0);
          setTotalPayments(0);
          setTotalRevenue(0);
        } finally {
          setIsLoadingStats(false);
        }
      }
    };

    loadStats();
  }, [canAccess, isChecking]);

  // Load completed payments
  useEffect(() => {
    const loadCompletedPayments = async () => {
      if (canAccess && !isChecking) {
        try {
          setIsLoadingPayments(true);
          const response = await statisticsService.getCompletedPayments();
          
          if (response?.isSuccess) {
            setCompletedPayments(response.data);
          } else {
            console.error('Failed to load completed payments:', response?.message);
            setCompletedPayments([]);
          }
        } catch (error) {
          console.error('Error loading completed payments:', error);
          setCompletedPayments([]);
        } finally {
          setIsLoadingPayments(false);
        }
      }
    };

    loadCompletedPayments();
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
          <div className="px-4 py-2 bg-white rounded-xl shadow-md border border-primary-100">
            <p className="text-xs text-slate-500 font-medium">Today</p>
            <p className="text-sm font-bold text-primary-700">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
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

        {/* Total Posts Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-warning-200 hover:shadow-xl hover:border-warning-300 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-warning-600">Total Posts</p>
              {isLoadingStats ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-warning-600"></div>
                  <p className="text-xl font-bold text-slate-900">Loading...</p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-slate-900">{totalPosts.toLocaleString()}</p>
              )}
            </div>
            <div className="p-3 bg-warning-100 rounded-lg">
              <svg className="w-6 h-6 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Total Payments Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200 hover:shadow-xl hover:border-green-300 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-600">Total Payments</p>
              {isLoadingStats ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                  <p className="text-xl font-bold text-slate-900">Loading...</p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-slate-900">{totalPayments.toLocaleString()}</p>
              )}
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">Total Revenue</p>
              {isLoadingStats ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-xl font-bold text-slate-900">Loading...</p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-slate-900">{totalRevenue.toLocaleString()} VNĐ</p>
              )}
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.562-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>


      {/* Completed Payments Table */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
      }}>
        <div className="flex items-center gap-3 mb-6">
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '10px',
            borderRadius: '12px'
          }}>
            <svg className="w-6 h-6" style={{ color: '#fff' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
            </svg>
          </div>
          <h3 style={{ 
            color: '#fff', 
            fontSize: '24px', 
            fontWeight: '700',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>Completed Payments</h3>
          {isLoadingPayments && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>Loading...</span>
            </div>
          )}
        </div>

        {!isLoadingPayments && completedPayments.length === 0 ? (
          <div className="text-center py-12" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px' }}>
            <svg className="w-20 h-20 mx-auto mb-4" style={{ color: '#cbd5e1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p style={{ color: '#64748b', fontWeight: '700', fontSize: '18px' }}>No completed payments found</p>
          </div>
        ) : (
          <div style={{ 
            overflowX: 'auto',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <table className="w-full">
              <thead style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)' }}>
                <tr>
                  <th style={{ 
                    padding: '16px 24px', 
                    textAlign: 'left', 
                    color: '#fff', 
                    fontWeight: '700',
                    fontSize: '12px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>ID</th>
                  <th style={{ 
                    padding: '16px 24px', 
                    textAlign: 'left', 
                    color: '#fff', 
                    fontWeight: '700',
                    fontSize: '12px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>User</th>
                  <th style={{ 
                    padding: '16px 24px', 
                    textAlign: 'left', 
                    color: '#fff', 
                    fontWeight: '700',
                    fontSize: '12px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>Email</th>
                  <th style={{ 
                    padding: '16px 24px', 
                    textAlign: 'left', 
                    color: '#fff', 
                    fontWeight: '700',
                    fontSize: '12px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>Package</th>
                  <th style={{ 
                    padding: '16px 24px', 
                    textAlign: 'left', 
                    color: '#fff', 
                    fontWeight: '700',
                    fontSize: '12px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>Amount</th>
                  <th style={{ 
                    padding: '16px 24px', 
                    textAlign: 'left', 
                    color: '#fff', 
                    fontWeight: '700',
                    fontSize: '12px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>Paid At</th>
                  <th style={{ 
                    padding: '16px 24px', 
                    textAlign: 'left', 
                    color: '#fff', 
                    fontWeight: '700',
                    fontSize: '12px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedPayments.map((payment, index) => (
                  <tr 
                    key={payment.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? '#fff' : '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f8fafc';
                    }}
                  >
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        fontSize: '14px',
                        fontWeight: '700'
                      }}>
                        #{payment.id}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <div style={{ color: '#0f172a', fontSize: '14px', fontWeight: '700' }}>
                        {payment.username}
                      </div>
                      <div style={{ color: '#3b82f6', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                        ID: {payment.userId}
                      </div>
                    </td>
                    <td style={{ 
                      padding: '16px 24px', 
                      whiteSpace: 'nowrap',
                      color: '#334155',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {payment.userEmail}
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <div style={{ color: '#6366f1', fontSize: '14px', fontWeight: '700' }}>
                        {payment.packageName}
                      </div>
                      <div style={{ color: '#818cf8', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                        ID: {payment.packageId}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <span style={{ 
                        color: '#059669', 
                        fontSize: '18px', 
                        fontWeight: '700' 
                      }}>
                        {payment.amount.toLocaleString()}
                      </span>
                      <span style={{ 
                        color: '#059669', 
                        fontSize: '14px', 
                        fontWeight: '600',
                        marginLeft: '4px'
                      }}>
                        VNĐ
                      </span>
                    </td>
                    <td style={{ 
                      padding: '16px 24px', 
                      whiteSpace: 'nowrap',
                      color: '#334155',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {new Date(payment.paidAt).toLocaleString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: '700',
                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                      }}>
                        <svg style={{ width: '16px', height: '16px', marginRight: '4px' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ FIX: Xử lý Promise searchParams đúng cách
export default function Home({ searchParams }: PropsType) {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<string | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Await Promise searchParams
    const resolveParams = async () => {
      const params = await searchParams;
      setSelectedTimeFrame(params.selected_time_frame);
      setIsReady(true);
    };
    
    resolveParams();
  }, [searchParams]);

  // Chờ params resolve trước khi render
  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <AdminPageContent selectedTimeFrame={selectedTimeFrame} />;
}