"use client";

import { useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { CampaignVisitors } from "@/components/admin/Charts/campaign-visitors";
import { UsedDevices } from "@/components/admin/Charts/used-devices";

export default function ChartTestPage() {
  // ALL HOOKS FIRST - before any conditional returns
  const [testMode, setTestMode] = useState('basic');
  
  // Protect route - require authentication and admin role
  const { isChecking, canAccess } = useAuthGuard('/unauthorized', {
    requireAuth: true,
    requiredRoles: ['admin'],
    message: 'You need admin privileges to test charts.'
  });

  // Show loading while checking authorization
  if (isChecking || !canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-sm text-gray-600">
          {isChecking ? "Checking permissions..." : "Access denied"}
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">📊 Chart Testing</h1>
          <p className="text-slate-700 mt-1 font-semibold">Test all admin chart components</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={testMode} 
            onChange={(e) => setTestMode(e.target.value)}
            className="border border-primary-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
          >
            <option value="basic">Basic Charts</option>
            <option value="advanced">Advanced Charts</option>
            <option value="all">All Charts</option>
          </select>
        </div>
      </div>

      {/* Chart Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-600">ApexCharts Status</p>
              <p className="text-2xl font-bold text-slate-900">✅ Ready</p>
              <p className="text-sm font-semibold text-slate-600">Dynamic import enabled</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">Components Fixed</p>
              <p className="text-2xl font-bold text-slate-900">2/2</p>
              <p className="text-sm font-semibold text-slate-600">Client components ready</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-600">Mock Data</p>
              <p className="text-2xl font-bold text-slate-900">✅ Active</p>
              <p className="text-sm font-semibold text-slate-600">Sample data loaded</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Test Charts */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">📊 Chart Components Test</h2>
          
          {(testMode === 'basic' || testMode === 'all') && (
            <>
              <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5 mb-8">
                <div className="col-span-12 lg:col-span-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">📈 Campaign Visitors Chart</h3>
                    <p className="text-sm text-blue-600">Bar chart showing visitor trends over time</p>
                  </div>
                  <CampaignVisitors />
                </div>
                
                <div className="col-span-12 lg:col-span-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">🍩 Device Usage Chart</h3>
                    <p className="text-sm text-green-600">Donut chart showing device distribution</p>
                  </div>
                  <UsedDevices 
                    timeFrame="6months"
                    className="h-full"
                  />
                </div>
              </div>
            </>
          )}

          {(testMode === 'advanced' || testMode === 'all') && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800">Advanced Charts Coming Soon</h3>
                <p className="text-sm text-slate-600 mt-2 font-medium">Line charts, area charts, and real-time data visualization</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-indigo-800 mb-4">🛠️ Testing Instructions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-indigo-700 mb-2">✅ What Should Work:</h4>
            <ul className="text-sm text-indigo-600 space-y-1 list-disc list-inside">
              <li>Charts should load with loading spinners</li>
              <li>Bar chart should display visitor data</li>
              <li>Donut chart should show device percentages</li>
              <li>Responsive design on mobile</li>
              <li>No console errors</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-red-700 mb-2">🔍 Check For Issues:</h4>
            <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
              <li>Infinite loading without chart render</li>
              <li>ApexCharts import errors</li>
              <li>React hooks order errors</li>
              <li>TypeScript type mismatches</li>
              <li>Async/await issues in components</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}