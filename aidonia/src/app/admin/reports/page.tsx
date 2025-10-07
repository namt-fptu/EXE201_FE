"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function ReportsPage() {
  const { isChecking, canAccess } = useAuthGuard("/signin", {
    requireAuth: true,
    requiredRoles: ["admin"],
    message: "You do not have permission to access the reports page.",
  });

  const router = useRouter();
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Aidonia Reports</h1>
          <p className="text-slate-700 mt-1 font-semibold">Generate and view detailed reports</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="border border-primary-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
          >
            <option value="overview">Overview Report</option>
            <option value="users">User Report</option>
            <option value="packages">Package Report</option>
            <option value="revenue">Revenue Report</option>
          </select>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-primary-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 font-semibold transform hover:scale-105">
            Generate Report
          </button>
        </div>
      </div>

      {/* Report Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6 hover:shadow-xl hover:border-primary-300 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-100 rounded-lg">
                <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report Summary
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 bg-white rounded-lg border border-primary-200 shadow-md hover:shadow-lg transition-all duration-300">
                <div>
                  <p className="text-sm font-semibold text-primary-600">Total Records</p>
                  <p className="text-3xl font-bold text-slate-900">24,847</p>
                  <p className="text-sm font-semibold text-accent-600">+5.2% from last period</p>
                </div>
                <div className="p-4 bg-primary-100 rounded-lg">
                  <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white rounded-lg border border-accent-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <p className="text-sm font-semibold text-accent-600">Growth Rate</p>
                  <p className="text-2xl font-bold text-slate-900">+15.3%</p>
                  <p className="text-xs font-medium text-slate-600 mt-1">vs last month</p>
                </div>
                <div className="p-5 bg-white rounded-lg border border-warning-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <p className="text-sm font-semibold text-warning-600">Average Value</p>
                  <p className="text-2xl font-bold text-slate-900">$127.50</p>
                  <p className="text-xs font-medium text-slate-600 mt-1">per transaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-accent-200 p-6 hover:shadow-xl hover:border-accent-300 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent-100 rounded-lg">
              <svg className="w-5 h-5 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full p-3 text-left hover:bg-primary-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-primary-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Export CSV</p>
                  <p className="text-sm font-medium text-primary-600">Download full report</p>
                </div>
              </div>
            </button>

            <button className="w-full p-3 text-left hover:bg-accent-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-accent-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <svg className="w-4 h-4 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Schedule Report</p>
                  <p className="text-sm font-medium text-accent-600">Auto-generate reports</p>
                </div>
              </div>
            </button>

            <button className="w-full p-3 text-left hover:bg-secondary-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-secondary-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <svg className="w-4 h-4 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Custom Report</p>
                  <p className="text-sm font-medium text-secondary-600">Build custom report</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-xl shadow-lg border border-primary-200 hover:shadow-xl hover:border-primary-300 transition-all duration-300">
        <div className="p-6 border-b border-primary-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Detailed Report Data</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-primary-50 to-primary-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Value</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-primary-50/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    #{item.toString().padStart(4, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    Sample Item {item}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                    Type {item}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold">
                    ${(item * 127.5).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                    2024-12-{(item + 10).toString().padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item % 2 === 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item % 2 === 0 ? 'Active' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-primary-50 border-t border-primary-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Showing <span className="font-bold text-primary-600">1</span> to <span className="font-bold text-primary-600">5</span> of{' '}
              <span className="font-bold text-primary-600">24,847</span> results
            </p>
            <div className="flex space-x-2">
              <button className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary-600 hover:bg-white rounded-lg transition-all duration-200">
                Previous
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary-600 hover:bg-white rounded-lg transition-all duration-200">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}