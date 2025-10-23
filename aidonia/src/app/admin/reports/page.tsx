"use client";

import { useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { excelService } from "@/services/excelService"; // <-- Import service của bạn

/**
 * Hàm helper để xử lý việc tải file từ Blob
 */
const downloadBlob = (blob: Blob, filename: string) => {
  // 1. Tạo một URL tạm thời cho đối tượng Blob
  const url = window.URL.createObjectURL(blob);

  // 2. Tạo một thẻ <a> ẩn
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename; // Đặt tên file sẽ được tải về

  // 3. Thêm thẻ <a> vào DOM và kích hoạt click
  document.body.appendChild(a);
  a.click();

  // 4. Dọn dẹp: Xóa thẻ <a> và thu hồi URL
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export default function ReportsPage() {
  const { isChecking, canAccess } = useAuthGuard("/signin", {
    requireAuth: true,
    requiredRoles: ["admin"],
    message: "You do not have permission to access the reports page.",
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear()); // Dùng cho báo cáo theo năm

  /**
   * Hàm xử lý chung cho việc gọi API và tải file
   */
  const handleDownload = async (
    apiCall: () => Promise<Blob | null>,
    defaultFileName: string
  ) => {
    if (isDownloading) return; // Ngăn chặn việc nhấp nhiều lần
    setIsDownloading(true);

    try {
      const blob = await apiCall();
      if (blob) {
        downloadBlob(blob, defaultFileName);
      } else {
        alert("Failed to download report. Please try again.");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("An error occurred while downloading the report.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Hiển thị loading trong khi kiểm tra quyền
  if (isChecking) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  // Chặn truy cập nếu không có quyền
  if (!canAccess) {
    // useAuthGuard đã xử lý việc điều hướng,
    // nhưng ta vẫn nên trả về null để tránh render
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Aidonia Reports</h1>
          <p className="text-slate-700 mt-1 font-semibold">
            Download Excel reports and data exports
          </p>
        </div>
      </div>

      {/* Report Downloads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Statistics Reports */}
        <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6 hover:shadow-xl hover:border-primary-300 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              {/* Icon */}
              <svg
                className="w-5 h-5 text-primary-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Statistics Reports
            </h3>
          </div>
          <div className="space-y-3">
            <DownloadButton
              label="Overall Statistics"
              description="General overview statistics"
              disabled={isDownloading}
              onClick={() =>
                handleDownload(
                  excelService.getOverallStatisticsReport,
                  "overall_statistics.xlsx"
                )
              }
            />
            <DownloadButton
              label="User Statistics"
              description="Report on user activity"
              disabled={isDownloading}
              onClick={() =>
                handleDownload(
                  excelService.getUserStatisticsReport,
                  "user_statistics.xlsx"
                )
              }
            />
            <DownloadButton
              label="Post Statistics"
              description="Report on post performance"
              disabled={isDownloading}
              onClick={() =>
                handleDownload(
                  excelService.getPostStatisticsReport,
                  "post_statistics.xlsx"
                )
              }
            />
            <DownloadButton
              label="Payment Statistics"
              description="Report on transactions"
              disabled={isDownloading}
              onClick={() =>
                handleDownload(
                  excelService.getPaymentStatisticsReport,
                  "payment_statistics.xlsx"
                )
              }
            />
          </div>
        </div>

        {/* Data Exports */}
        <div className="bg-white rounded-xl shadow-lg border border-accent-200 p-6 hover:shadow-xl hover:border-accent-300 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent-100 rounded-lg">
              {/* Icon */}
              <svg
                className="w-5 h-5 text-accent-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Data Exports</h3>
          </div>
          <div className="space-y-3">
            <DownloadButton
              label="Export All Users"
              description="Full raw data of users"
              disabled={isDownloading}
              onClick={() =>
                handleDownload(excelService.exportUsers, "all_users_export.xlsx")
              }
            />
            <DownloadButton
              label="Export All Posts"
              description="Full raw data of posts"
              disabled={isDownloading}
              onClick={() =>
                handleDownload(excelService.exportPosts, "all_posts_export.xlsx")
              }
            />
            <DownloadButton
              label="Export All Payments"
              description="Full raw data of payments"
              disabled={isDownloading}
              onClick={() =>
                handleDownload(
                  excelService.exportPayments,
                  "all_payments_export.xlsx"
                )
              }
            />
          </div>
        </div>

        {/* Specific Reports */}
        <div className="bg-white rounded-xl shadow-lg border border-secondary-200 p-6 hover:shadow-xl hover:border-secondary-300 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-secondary-100 rounded-lg">
              {/* Icon */}
              <svg
                className="w-5 h-5 text-secondary-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5.5 13a3.5 3.5 0 01-3.5-3.5V5a1 1 0 011-1h10a1 1 0 011 1v4.5a3.5 3.5 0 01-3.5 3.5h-5zM4 5v4.5A1.5 1.5 0 005.5 11h5A1.5 1.5 0 0012 9.5V5H4z" />
                <path d="M11 14v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1a1 1 0 011-1h4a1 1 0 011 1z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Specific Reports
            </h3>
          </div>
          <div className="space-y-3">
            <DownloadButton
              label="Comprehensive Report"
              description="Full combined data report"
              disabled={isDownloading}
              onClick={() =>
                handleDownload(
                  excelService.getComprehensiveReport,
                  "comprehensive_report.xlsx"
                )
              }
            />
            {/* Report theo năm */}
            <div className="p-3 bg-white rounded-lg border border-secondary-200">
              <p className="font-semibold text-slate-900">
                Monthly Revenue Report
              </p>
              <p className="text-sm font-medium text-secondary-600 mb-2">
                Download revenue by year
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  placeholder="Enter year"
                  className="w-full border border-primary-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                />
                <button
                  onClick={() =>
                    handleDownload(
                      () => excelService.getMonthlyRevenueReport(year),
                      `monthly_revenue_${year}.xlsx`
                    )
                  }
                  disabled={isDownloading}
                  className="bg-secondary-500 text-white px-4 py-2 rounded-lg hover:bg-secondary-600 transition-all font-semibold disabled:opacity-50"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Component Nút Bấm Tải Về (để tái sử dụng)
 */
const DownloadButton = ({
  label,
  description,
  onClick,
  disabled,
}: {
  label: string;
  description: string;
  onClick: () => void;
  disabled: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full p-3 text-left hover:bg-primary-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-100 rounded-lg">
          <svg
            className="w-4 h-4 text-primary-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-slate-900">{label}</p>
          <p className="text-sm font-medium text-primary-600">{description}</p>
        </div>
      </div>
      {disabled && (
        <span className="text-sm font-semibold text-slate-500">
          Loading...
        </span>
      )}
    </div>
  </button>
);