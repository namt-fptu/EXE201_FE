"use client";

import React, { useState } from "react";
import { 
  handleApiResponse, 
  handleApiError, 
  showLoadingToast, 
  showSuccessToast, 
  showErrorToast, 
  showInfoToast, 
  showWarningToast,
  MultiStepToastHandler 
} from "@/utils/toast-helper";
import api from "@/services/axios";
import { toast } from "sonner";

const ToastDemo = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Demo function to show different toast types
  const showToastTypes = () => {
    showSuccessToast("Success message!", {
      description: "This is a success toast with green styling"
    });

    setTimeout(() => {
      showErrorToast("Error message!", {
        description: "This is an error toast with red styling"
      });
    }, 1000);

    setTimeout(() => {
      showWarningToast("Warning message!", {
        description: "This is a warning toast with yellow styling"
      });
    }, 2000);

    setTimeout(() => {
      showInfoToast("Info message!", {
        description: "This is an info toast with blue styling"
      });
    }, 3000);
  };

  // Demo multi-step process
  const demoMultiStep = async () => {
    const handler = new MultiStepToastHandler([
      "Initializing process...",
      "Processing data...",
      "Validating results...",
      "Finalizing..."
    ]);

    // Step 1
    handler.startStep(0);
    await new Promise(resolve => setTimeout(resolve, 1000));
    handler.completeStep(0, "Initialization complete");

    // Step 2
    handler.startStep(1);
    await new Promise(resolve => setTimeout(resolve, 1500));
    handler.completeStep(1, "Data processed successfully");

    // Step 3
    handler.startStep(2);
    await new Promise(resolve => setTimeout(resolve, 1000));
    handler.completeStep(2, "Validation passed");

    // Step 4
    handler.startStep(3);
    await new Promise(resolve => setTimeout(resolve, 800));
    handler.complete("Multi-step process completed successfully!");
  };

  // Demo API call with comprehensive error handling
  const testApiCall = async (endpoint: string, shouldFail: boolean = false) => {
    setIsLoading(true);
    const loadingToast = showLoadingToast("Testing API call...");

    try {
      let response;
      
      if (shouldFail) {
        // Simulate API failure
        response = await api.get("/nonexistent-endpoint-that-will-fail");
      } else {
        // Test with a real endpoint (categories)
        response = await api.get(endpoint);
      }

      toast.dismiss(loadingToast);
      
      // Handle response with comprehensive handler
      handleApiResponse(response.data || response, {
        successMessage: "API call successful!",
        context: "test api",
        showDataInfo: true
      });

    } catch (error) {
      toast.dismiss(loadingToast);
      
      // Handle error with comprehensive handler
      handleApiError(error, {
        context: 'test api',
        showDetails: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Demo failed multi-step process
  const demoFailedMultiStep = async () => {
    const handler = new MultiStepToastHandler([
      "Starting process...",
      "Processing data...",
      "This will fail...",
      "Won't reach here"
    ]);

    try {
      // Step 1
      handler.startStep(0);
      await new Promise(resolve => setTimeout(resolve, 1000));
      handler.completeStep(0, "Process started");

      // Step 2
      handler.startStep(1);
      await new Promise(resolve => setTimeout(resolve, 1000));
      handler.completeStep(1, "Data processed");

      // Step 3 - simulate failure
      handler.startStep(2);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate error
      throw new Error("Simulated process failure");
      
    } catch (error) {
      handler.failStep(2, "Process failed at validation step");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            🎉 Comprehensive Toast Notification System Demo
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Toast Types */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Basic Toast Types
              </h2>
              
              <button
                onClick={showToastTypes}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Show All Toast Types
              </button>

              <button
                onClick={() => showSuccessToast("Individual Success!", { description: "This is a single success toast" })}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Success Toast
              </button>

              <button
                onClick={() => showErrorToast("Individual Error!", { description: "This is a single error toast" })}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Error Toast
              </button>

              <button
                onClick={() => showWarningToast("Individual Warning!", { description: "This is a single warning toast" })}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Warning Toast
              </button>

              <button
                onClick={() => showInfoToast("Individual Info!", { description: "This is a single info toast" })}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Info Toast
              </button>
            </div>

            {/* Multi-Step Processes */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Multi-Step Processes
              </h2>

              <button
                onClick={demoMultiStep}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Successful Multi-Step Process
              </button>

              <button
                onClick={demoFailedMultiStep}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Failed Multi-Step Process
              </button>
            </div>

            {/* API Testing */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                API Call Testing
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => testApiCall("categories", false)}
                  disabled={isLoading}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? "Testing..." : "Test Successful API Call"}
                </button>

                <button
                  onClick={() => testApiCall("nonexistent", true)}
                  disabled={isLoading}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? "Testing..." : "Test Failed API Call"}
                </button>

                <button
                  onClick={() => testApiCall("users", false)}
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? "Testing..." : "Test Users API"}
                </button>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              ✨ Implemented Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium mb-2">Toast Types:</h4>
                <ul className="space-y-1">
                  <li>🟢 Success - Green styling for successful operations</li>
                  <li>🔴 Error - Red styling for failures</li>
                  <li>🟡 Warning - Yellow styling for warnings</li>
                  <li>🔵 Info - Blue styling for information</li>
                  <li>⏳ Loading - For ongoing operations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Smart Features:</h4>
                <ul className="space-y-1">
                  <li>🤖 Automatic API response analysis</li>
                  <li>📝 Contextual default messages</li>
                  <li>🔄 Multi-step process handling</li>
                  <li>💡 Smart error categorization</li>
                  <li>🎨 Consistent styling & duration</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              📖 Usage in Your Components
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Simple:</strong> <code>showSuccessToast("Message!")</code></p>
              <p><strong>With description:</strong> <code>showErrorToast("Error!", {`{description: "Details..."}`})</code></p>
              <p><strong>Auto API handling:</strong> <code>handleApiResponse(response, {`{context: "login"}`})</code></p>
              <p><strong>Auto error handling:</strong> <code>handleApiError(error, {`{context: "register"}`})</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastDemo;