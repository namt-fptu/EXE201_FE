"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import api from "@/services/axios";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useAuthGuard from "@/hooks/useAuthGuard";

const Signup = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    retypePassword: "",
    phoneNumber: "",
    dateOfBirth: "",
    sex: "Male", // Default value set to "Male"
    residentId: "", // Added residentId field, backend will auto-generate
  });

  const [passwordError, setPasswordError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isRetypePasswordVisible, setIsRetypePasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Protect route - redirect authenticated users away from signup page
  const { isChecking, canAccess } = useAuthGuard("/", {
    requireAuth: false,
    message: "You are already signed in!",
  });

  // Show loading while checking authentication
  if (isChecking || !canAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue"></div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "retypePassword" || name === "password") {
      if (formData.password !== value && name === "retypePassword") {
        setPasswordError("Passwords do not match");
      } else if (name === "password" && formData.retypePassword !== value) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Basic form validation
    if (!formData.userName.trim()) {
      toast.error("Please enter your full name", {
        duration: 3000,
      });
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email address", {
        duration: 3000,
      });
      return;
    }

    if (!formData.password) {
      toast.error("Please enter a password", {
        duration: 3000,
      });
      return;
    }

    if (formData.password !== formData.retypePassword) {
      console.error("Passwords do not match");
      setPasswordError("Passwords do not match");
      return;
    }

    // Validate ResidentId if provided (must be exactly 12 digits)
    if (formData.residentId && !/^\d{12}$/.test(formData.residentId)) {
      toast.error("Resident ID must be exactly 12 digits", {
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const requestPayload = {
        UserName: formData.userName,
        Email: formData.email,
        Password: formData.password,
        PhoneNumber: formData.phoneNumber || null,
        DateOfBirth: formData.dateOfBirth || null,
        Sex: formData.sex || null,
        ResidentId: formData.residentId || null,
      };

      console.log("Request payload (frontend format):", {
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        sex: formData.sex,
        residentId: formData.residentId,
      });

      console.log("Request payload (backend format):", requestPayload);

      const response = await api.post("users/register", requestPayload);

      console.log("Registration successful", response.data);
      toast.success(
        "Registration successful! Please check your email for verification and then sign in.",
        {
          duration: 4000,
        }
      );

      // Redirect to signin immediately since backend will handle email verification
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (error) {
      console.error("Error during registration", error);
      if (error.response) {
        console.error("Server response status:", error.response.status);
        console.error("Server response data:", error.response.data);
        console.error("Server response headers:", error.response.headers);

        // Handle different types of error responses
        let errorMessage = "Registration failed. Please try again.";

        if (error.response.data) {
          if (typeof error.response.data === "string") {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
            // If it's "User registration failed", it's likely a duplicate field issue
            if (error.response.data.message === "User registration failed") {
              errorMessage =
                "Registration failed. This username, email, or phone number might already be taken. Please try different credentials.";
            }
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data.errors) {
            // Handle validation errors array
            const errors = error.response.data.errors;
            if (Array.isArray(errors)) {
              errorMessage = errors.join(", ");
            } else if (typeof errors === "object") {
              errorMessage = Object.values(errors).flat().join(", ");
            }
          }
        }

        toast.error(errorMessage, {
          duration: 4000,
        });
      } else {
        toast.error(
          "Network error. Please check your connection and try again.",
          {
            duration: 4000,
          }
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Signup"} pages={["Signup"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Create an Account
              </h2>
              <p>Enter your detail below</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="userName" className="block mb-2.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="userName"
                  id="userName"
                  placeholder="Enter your full name"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="password" className="block mb-2.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                  <button
                    className="absolute inset-y-0 end-0 flex items-center z-20 px-2.5 cursor-pointer text-gray-400 rounded-e-md focus:outline-none focus-visible:text-indigo-500 hover:text-indigo-500 transition-colors"
                    type="button"
                    onClick={() => setIsPasswordVisible((prev) => !prev)}
                    aria-label={
                      isPasswordVisible ? "Hide password" : "Show password"
                    }
                    aria-pressed={isPasswordVisible}
                    aria-controls="password"
                  >
                    {isPasswordVisible ? (
                      <EyeOff size={20} aria-hidden="true" />
                    ) : (
                      <Eye size={20} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <label htmlFor="retypePassword" className="block mb-2.5">
                  Re-type Password
                </label>
                <div className="relative">
                  <input
                    id="retypePassword"
                    type={isRetypePasswordVisible ? "text" : "password"}
                    name="retypePassword"
                    placeholder="Re-type your password"
                    value={formData.retypePassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                  <button
                    className="absolute inset-y-0 end-0 flex items-center z-20 px-2.5 cursor-pointer text-gray-400 rounded-e-md focus:outline-none focus-visible:text-indigo-500 hover:text-indigo-500 transition-colors"
                    type="button"
                    onClick={() => setIsRetypePasswordVisible((prev) => !prev)}
                    aria-label={
                      isRetypePasswordVisible
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={isRetypePasswordVisible}
                    aria-controls="retypePassword"
                  >
                    {isRetypePasswordVisible ? (
                      <EyeOff size={20} aria-hidden="true" />
                    ) : (
                      <Eye size={20} aria-hidden="true" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </div>

              <div className="mb-5">
                <label htmlFor="phoneNumber" className="block mb-2.5">
                  Phone Number <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="dateOfBirth" className="block mb-2.5">
                  Date of Birth{" "}
                  <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="sex" className="block mb-2.5">
                  Sex
                </label>
                <select
                  name="sex"
                  id="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>

              <p className="text-center mt-6">
                Already have an account?
                <Link
                  href="/signin"
                  className="text-dark ease-out duration-200 hover:text-blue pl-2"
                >
                  Sign in Now
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
