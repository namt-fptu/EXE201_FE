"use client";

import { useState, useEffect } from "react";
import useUserStore from "@/redux/userStore";

const DebugPanel = () => {
  const { user, isAuthenticated } = useUserStore();
  const [isVisible, setIsVisible] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    // Check API status
    const checkApiStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}categories`
        );
        if (response.ok) {
          setApiStatus("online");
        } else {
          setApiStatus("error");
        }
      } catch {
        setApiStatus("offline");
      }
    };

    checkApiStatus();
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
          title="Show debug info"
        >
          Debug
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Debug Info</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <strong>API Status:</strong>
          <span
            className={`ml-2 px-2 py-1 rounded text-xs ${
              apiStatus === "online"
                ? "bg-green-100 text-green-800"
                : apiStatus === "offline"
                  ? "bg-red-100 text-red-800"
                  : apiStatus === "error"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {apiStatus}
          </span>
        </div>

        <div>
          <strong>API URL:</strong>{" "}
          {process.env.NEXT_PUBLIC_API_BASE_URL || "Not set"}
        </div>

        <div>
          <strong>Auth Status:</strong>
          <span
            className={`ml-2 px-2 py-1 rounded text-xs ${
              isAuthenticated()
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isAuthenticated() ? "Authenticated" : "Not authenticated"}
          </span>
        </div>

        <div>
          <strong>User ID:</strong> {user?.id || "None"}
        </div>

        <div>
          <strong>Token:</strong>
          <span
            className={`ml-2 px-2 py-1 rounded text-xs ${
              localStorage.getItem("token")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {localStorage.getItem("token") ? "Present" : "Missing"}
          </span>
        </div>

        <div>
          <strong>Mock Mode:</strong>{" "}
          {process.env.NEXT_PUBLIC_USE_MOCK || "false"}
        </div>

        {localStorage.getItem("mockPosts") && (
          <div>
            <strong>Mock Posts:</strong>{" "}
            {JSON.parse(localStorage.getItem("mockPosts") || "[]").length}
          </div>
        )}

        {localStorage.getItem("draftPost") && (
          <div className="text-yellow-600">
            <strong>Draft Available:</strong> Yes
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200">
        <button
          onClick={() => {
            localStorage.setItem("NEXT_PUBLIC_USE_MOCK", "true");
            window.location.reload();
          }}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 mr-2"
        >
          Enable Mock Mode
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("mockPosts");
            localStorage.removeItem("draftPost");
            alert("Local data cleared");
          }}
          className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
        >
          Clear Local Data
        </button>
      </div>
    </div>
  );
};

export default DebugPanel;
