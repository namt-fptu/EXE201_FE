"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import AddressModal from "./AddressModal";
import useUserStore from "@/redux/userStore";
import { toast } from "sonner";
import api from "@/services/axios";
import { AxiosError } from "axios";

import packageService from "@/services/packageService";
import {
  handleApiResponse,
  handleApiError,
  showLoadingToast,
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  MultiStepToastHandler,
} from "@/utils/toast-helper";

interface Post {
  id: string;
  title: string;
  description?: string;
  price?: number;
  condition?: string;
  categoryName?: string;
  status: string;
  createdAt: string;
  images?: Array<{ url: string } | string>;
}

interface Address {
  id: number;
  name?: string;
  email?: string;
  street?: string;
  ward?: string;
  district: string;
  province: string;
  houseNumber?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  phoneNumber?: string;
  length?: number;
  // Legacy fields for compatibility
  userId?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  isDefault?: boolean;
  addressType?: "shipping" | "billing";
  createdAt?: string;
  updatedAt?: string;
}

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [addressModal, setAddressModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userPackages, setUserPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  // Address editing states
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [editForm, setEditForm] = useState({
    province: "",
    district: "",
    ward: "",
    street: "",
    houseNumber: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  const { user, isAuthenticated, logout } = useUserStore();
  const router = useRouter();
  // ---- Edit Post states (đặt ở TOP của component) ----
  type PostEditForm = {
    title: string;
    description: string;
    price: number | string;
    condition: string;
    categoryId: string;
    postImages: string[];
  };

  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState<PostEditForm>({
    title: "",
    description: "",
    price: "",
    condition: "",
    categoryId: "",
    postImages: [""],
  });
  const [postSaving, setPostSaving] = useState(false);

  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticeText, setNoticeText] = useState("*Please contact Email to edit");
  const CONDITION_OPTIONS = ["New", "Like New", "Good", "Fair", "Poor"] as const;

  type Category = { id: number; categoryName: string };

  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  // Logout handler
  const handleLogout = () => {
    logout();
    router.push("/signin");
  };

  const loadUserProfile = useCallback(async () => {
    if (!user?.id) {
      console.log("No user ID available:", user);
      showInfoToast("Profile loading skipped", {
        description: "No user ID available - please sign in again",
      });
      return;
    }

    console.log("Loading user profile for user ID:", user.id);

    // Show loading toast for profile fetch
    const loadingToast = showLoadingToast("Loading your profile...");

    try {
      const response = await api.get(`/users/${user.id}`);
      console.log("User profile response:", response.data);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Handle the API response comprehensively
      handleApiResponse(response, {
        successMessage: "Profile loaded successfully",
        context: "load user profile",
        showDataInfo: false,
      });

      if (response.data && response.data.data) {
        setUserProfile(response.data.data);
        console.log("User profile loaded successfully:", response.data.data);
      } else {
        console.error("Failed to load user profile - no data received");
        showErrorToast("No user data received from server", {
          description: "The server response was empty or invalid",
        });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Use comprehensive error handling
      handleApiError(error, {
        context: "load user profile",
        customMessage: "Failed to load user profile",
        showDetails: true,
      });
    }
  }, [user]);

  const loadUserPackages = useCallback(async () => {
    if (!user?.id) {
      console.log("No user ID available for packages:", user);
      return;
    }

    setPackagesLoading(true);
    try {
      // First get the user's active packages
      const response = await api.get(`/user_packages/package/active/${user.id}`);
      console.log("User packages response:", response.data);
      console.log(
        "User packages response structure:",
        JSON.stringify(response.data, null, 2)
      );

      // Handle different possible response structures
      if (response.data) {
        // Check if data is nested in a data property or is the direct array
        const packageData = response.data.data || response.data;

        if (Array.isArray(packageData) && packageData.length > 0) {
          // For each package, fetch detailed information
          const detailedPackages = await Promise.all(
            packageData.map(async (userPkg) => {
              try {
                console.log("Processing user package:", userPkg);

                // Check if we already have all the needed information
                const hasBasicInfo =
                  userPkg.packageName &&
                  userPkg.price !== undefined &&
                  userPkg.postLimit !== undefined;
                const hasPackageInfo =
                  userPkg.package && userPkg.package.packageName;

                if (hasBasicInfo || hasPackageInfo) {
                  console.log("Using existing package data, skipping API call");
                  // Use existing data without making additional API call
                  return {
                    ...userPkg,
                    packageName:
                      userPkg.packageName ||
                      userPkg.package?.packageName ||
                      "Unknown Package",
                    price: userPkg.price || userPkg.package?.price || 0,
                    postLimit:
                      userPkg.postLimit || userPkg.package?.postLimit || 0,
                    durationInDays:
                      userPkg.durationInDays ||
                      userPkg.package?.durationInDays ||
                      0,
                    usedPosts:
                      (userPkg.postLimit || userPkg.package?.postLimit || 0) -
                      (userPkg.remainingPosts || 0),
                  };
                }

                // Determine the correct package ID to use for API call
                const packageId =
                  userPkg.packageId || userPkg.package?.id || userPkg.id;
                console.log(
                  "Using package ID:",
                  packageId,
                  "for user package:",
                  userPkg.id
                );

                if (!packageId) {
                  console.warn(
                    "No valid package ID found for user package:",
                    userPkg
                  );
                  return {
                    ...userPkg,
                    packageName: "Unknown Package",
                    price: 0,
                    postLimit: 0,
                    durationInDays: 0,
                    usedPosts: 0,
                  };
                }

                // Get detailed package info from packages/{id} endpoint
                const detailResponse = await api.get(`/packages/${packageId}`);
                const packageDetails =
                  detailResponse.data?.data || detailResponse.data;

                // Combine user package data with detailed package info
                return {
                  ...userPkg,
                  packageName:
                    packageDetails?.packageName ||
                    userPkg.packageName ||
                    userPkg.package?.packageName ||
                    "Unknown Package",
                  price:
                    packageDetails?.price ||
                    userPkg.price ||
                    userPkg.package?.price ||
                    0,
                  postLimit:
                    packageDetails?.postLimit ||
                    userPkg.postLimit ||
                    userPkg.package?.postLimit ||
                    0,
                  durationInDays:
                    packageDetails?.durationInDays ||
                    userPkg.durationInDays ||
                    userPkg.package?.durationInDays ||
                    0,
                  // Calculate used posts from remaining posts
                  usedPosts:
                    packageDetails?.postLimit ||
                      userPkg.postLimit ||
                      userPkg.package?.postLimit ||
                      0
                      ? (packageDetails?.postLimit ||
                        userPkg.postLimit ||
                        userPkg.package?.postLimit ||
                        0) - (userPkg.remainingPosts || 0)
                      : 0,
                };
              } catch (detailError) {
                const packageId =
                  userPkg.packageId || userPkg.package?.id || userPkg.id;
                console.error(
                  `Error fetching details for package ID ${packageId} (user package ${userPkg.id}):`,
                  detailError
                );

                if (detailError instanceof AxiosError) {
                  if (detailError.response?.status === 400) {
                    console.error(
                      "400 Bad Request - Invalid package ID or API endpoint"
                    );
                    console.error("Package data structure:", userPkg);
                    console.error("Response data:", detailError.response?.data);
                  } else if (detailError.response?.status === 404) {
                    console.error("404 Not Found - Package details not found");
                  } else if (detailError.response?.status === 500) {
                    console.error("500 Server Error - Backend issue");
                  }
                }

                // Return enhanced original data if details fetch fails
                return {
                  ...userPkg,
                  packageName:
                    userPkg.packageName ||
                    userPkg.package?.packageName ||
                    "Unknown Package",
                  price: userPkg.price || userPkg.package?.price || 0,
                  postLimit:
                    userPkg.postLimit || userPkg.package?.postLimit || 0,
                  durationInDays:
                    userPkg.durationInDays ||
                    userPkg.package?.durationInDays ||
                    0,
                  usedPosts:
                    (userPkg.postLimit || userPkg.package?.postLimit || 0) -
                    (userPkg.remainingPosts || 0),
                };
              }
            })
          );

          setUserPackages(detailedPackages);
          console.log(
            "User packages with details loaded successfully:",
            detailedPackages
          );
        } else {
          setUserPackages([]);
          console.log("No packages found - data is not an array or empty");
        }
      } else {
        setUserPackages([]);
        console.log("No packages found for user");
      }
    } catch (error) {
      console.error("Error loading user packages:", error);
      setUserPackages([]);
      // Don't show error toast for packages as it's not critical
    } finally {
      setPackagesLoading(false);
    }
  }, [user]);

  const loadUserPosts = useCallback(async () => {
    if (!user?.id) {
      console.log("No user ID available for posts:", user);
      return;
    }

    setPostsLoading(true);
    try {
      const response = await api.get(`/posts/user/${user.id}`);
      console.log("User posts response:", response.data);

      // Handle different possible response structures
      if (response.data) {
        // Check if data is nested in a data property or is the direct array
        const postsData = response.data.data || response.data;

        if (Array.isArray(postsData)) {
          setUserPosts(postsData);
          console.log("User posts loaded successfully:", postsData);
        } else {
          setUserPosts([]);
          console.log("No posts found - data is not an array");
        }
      } else {
        setUserPosts([]);
        console.log("No posts found for user");
      }
    } catch (error) {
      console.error("Error loading user posts:", error);
      setUserPosts([]);
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          console.log("No posts found (404) - user has no posts yet");
        } else if (error.response?.status === 500) {
          toast.error("Server error while loading posts");
        } else {
          toast.error("Failed to load posts");
        }
      }
    } finally {
      setPostsLoading(false);
    }
  }, [user]);

  const loadUserAddresses = useCallback(async () => {
    if (!user?.id) {
      console.log("No user ID available for addresses:", user);
      return;
    }

    setAddressesLoading(true);
    try {
      const response = await api.get(`/addresses/users/${user.id}`);
      console.log("User addresses response:", response.data);

      // Handle different possible response structures
      if (response.data) {
        // Check if data is nested in a data property or is the direct array
        const addressesData = response.data.data || response.data;

        if (Array.isArray(addressesData)) {
          setUserAddresses(addressesData);
          console.log("User addresses loaded successfully:", addressesData);
        } else {
          setUserAddresses([]);
          console.log("No addresses found - data is not an array");
        }
      } else {
        setUserAddresses([]);
        console.log("No addresses found for user");
      }
    } catch (error) {
      console.error("Error loading user addresses:", error);
      setUserAddresses([]);
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          console.log("No addresses found (404) - user has no addresses yet");
        } else if (error.response?.status === 500) {
          toast.error("Server error while loading addresses");
        } else {
          toast.error("Failed to load addresses");
        }
      }
    } finally {
      setAddressesLoading(false);
    }
  }, [user]);

  const loadPaymentHistory = useCallback(async () => {
    if (!user?.id) {
      console.log("No user ID available for payment history:", user);
      return;
    }

    setHistoryLoading(true);
    try {
      const response = await api.get(`/payments/users/${user.id}`);
      console.log("Payment history response:", response.data);

      // Handle different possible response structures
      if (response.data) {
        // Check if data is nested in a data property or is the direct array
        const historyData = response.data.data || response.data;

        if (
          historyData &&
          historyData.items &&
          Array.isArray(historyData.items)
        ) {
          setPaymentHistory(historyData.items);
          console.log(
            "Payment history loaded successfully:",
            historyData.items
          );
        } else if (Array.isArray(historyData)) {
          setPaymentHistory(historyData);
          console.log("Payment history loaded successfully:", historyData);
        } else {
          setPaymentHistory([]);
          console.log("No payment history found - data is not an array");
        }
      } else {
        setPaymentHistory([]);
        console.log("No payment history found for user");
      }
    } catch (error) {
      console.error("Error loading payment history:", error);
      setPaymentHistory([]);
      // Don't show error toast for payment history as it's not critical
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Wait a bit for AuthProvider to finish loading user data
    const timer = setTimeout(() => {
      const isAuth = isAuthenticated();

      if (!isAuth) {
        showErrorToast("Authentication required", {
          description: "Please sign in to access your account",
        });
        router.replace("/signin");
        return;
      }

      setIsLoading(false);
      loadUserProfile(); // Load user profile data
      loadUserPackages(); // Load user packages data
      loadPaymentHistory(); // Load payment history data
      loadUserPosts(); // Load user posts data
      loadUserAddresses(); // Load user addresses data
    }, 500); // Increased delay to let AuthProvider finish

    return () => clearTimeout(timer);
  }, [
    isAuthenticated,
    router,
    loadUserProfile,
    loadUserPackages,
    loadPaymentHistory,
    loadUserPosts,
    loadUserAddresses,
  ]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue"></div>
      </div>
    );
  }

  // If still no user after loading, redirect
  if (!user) {
    router.replace("/signin");
    return null;
  }

  const openAddressModal = () => {
    setAddressModal(true);
  };

  const closeAddressModal = () => {
    setAddressModal(false);
    setEditingAddress(null);
    setEditForm({
      province: "",
      district: "",
      ward: "",
      street: "",
      houseNumber: "",
    });
  };

  // Edit address functions
  const openEditAddress = (address: Address) => {
    setEditingAddress(address);
    setEditForm({
      province: address.province || "",
      district: address.district || "",
      ward: address.ward || "",
      street: address.street || "",
      houseNumber: address.houseNumber || "",
    });
    setAddressModal(true);
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateAddress = async () => {
    if (!editingAddress?.id) return;

    try {
      setEditLoading(true);
      const response = await api.put(`/address/${editingAddress.id}`, editForm);

      if (response.data.success) {
        showInfoToast("Address updated successfully!");
        // Refresh addresses list
        loadUserAddresses();
        // Close modal and reset form
        setAddressModal(false);
        setEditingAddress(null);
        setEditForm({
          province: "",
          district: "",
          ward: "",
          street: "",
          houseNumber: "",
        });
      } else {
        throw new Error(response.data.message || "Failed to update address");
      }
    } catch (error) {
      console.error("Error updating address:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      showErrorToast(`Failed to update address: ${errorMessage}`);
    } finally {
      setEditLoading(false);
    }
  };

  // load chi tiết 1 post để prefill form
  const fetchPostDetail = async (id: string) => {
    try {
      const res = await api.get(`/posts/${id}`);
      const data = res.data?.data || res.data || {};
      setPostForm({
        title: data.title ?? "",
        description: data.description ?? "",
        price: data.price ?? "",
        condition: data.condition ?? "",
        categoryId: data.categoryId != null ? String(data.categoryId) : "",
        postImages: Array.isArray(data.postImages) && data.postImages.length ? data.postImages : [""],
      });
    } catch {
      setPostForm({
        title: "",
        description: "",
        price: "",
        condition: "",
        categoryId: "",
        postImages: [""],
      });
    }
  };

  const openEditPost = async (post: Post) => {
    const s = (post.status || "").toLowerCase();
    if (s === "approved" || s === "reject" || s === "rejected") {
      setNoticeText("*Please contact Email to edit");
      setNoticeOpen(true);
      return;
    }
    setEditingPostId(post.id);
    // lấy song song: chi tiết post + categories
    await Promise.all([fetchPostDetail(post.id), fetchCategories()]);
    setPostModalOpen(true);
  };

  const updatePost = async () => {
    if (!editingPostId) return;
    try {
      setPostSaving(true);
      const payload = {
        title: postForm.title,
        description: postForm.description,
        price: Number(postForm.price) || 0,
        condition: postForm.condition,
        categoryId: Number(postForm.categoryId) || 0,
        postImages: postForm.postImages.filter(Boolean),
      };

      const id = Number(editingPostId);
      console.log("[UpdatePost] baseURL =", api.defaults.baseURL, "id =", id);

      await api.put(`/posts/${id}`, payload);

      setPostModalOpen(false);
      setEditingPostId(null);
      // gọi lại load danh sách bài post của user
      await loadUserPosts();
    } finally {
      setPostSaving(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCatLoading(true);
      const res = await api.get("/categories");
      const items: Category[] = res?.data?.data ?? [];
      setCategories(items);
      return items; // ⬅️ trả về để dùng tiếp
    } catch {
      showWarningToast("Could not load categories");
      setCategories([]);
      return [] as Category[];
    } finally {
      setCatLoading(false);
    }
  };


  const formatVND = (v: number | string | undefined) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Number(v) || 0);

  const statusBadge = (s?: string) => {
    const k = (s || "").toLowerCase();
    if (k === "approved") return "bg-green-50 text-green-700 ring-1 ring-green-200";
    if (k === "pending") return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    if (k === "reject" || k === "rejected") return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    return "bg-slate-50 text-slate-600 ring-1 ring-slate-200";
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "-";


  return (
    <>
      <Breadcrumb title={"My Account"} pages={["my account"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* <!--== user dashboard menu start ==--> */}
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="flex xl:flex-col">
                <div className="hidden lg:flex flex-wrap items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-r xl:border-r-0 xl:border-b border-gray-3">
                  <div className="max-w-[64px] w-full h-16 rounded-full overflow-hidden border border-gray-3">
                    {user?.avataImage ? (
                      <Image
                        src={user.avataImage}
                        alt="user"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue flex items-center justify-center">
                        <span className="text-white font-semibold text-xl">
                          {(userProfile?.userName || user?.userName || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-dark mb-0.5">
                      {userProfile?.userName || user?.userName || "User"}
                    </p>
                    <p className="text-custom-xs">
                      {userProfile?.createdAt
                        ? `Member Since ${new Date(userProfile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                        : "Member Since Recently"}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-7.5 xl:p-9">
                  <div className="flex flex-wrap xl:flex-nowrap xl:flex-col gap-4">
                    <button
                      onClick={() => setActiveTab("posts")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${activeTab === "posts"
                        ? "text-white bg-blue"
                        : "text-dark-2 bg-gray-1"
                        }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.0203 11.9167C8.0203 11.537 7.71249 11.2292 7.3328 11.2292C6.9531 11.2292 6.6453 11.537 6.6453 11.9167V15.5833C6.6453 15.963 6.9531 16.2708 7.3328 16.2708C7.71249 16.2708 8.0203 15.963 8.0203 15.5833V11.9167Z"
                          fill=""
                        />
                        <path
                          d="M14.6661 11.2292C15.0458 11.2292 15.3536 11.537 15.3536 11.9167V15.5833C15.3536 15.963 15.0458 16.2708 14.6661 16.2708C14.2864 16.2708 13.9786 15.963 13.9786 15.5833V11.9167C13.9786 11.537 14.2864 11.2292 14.6661 11.2292Z"
                          fill=""
                        />
                        <path
                          d="M11.687 11.9167C11.687 11.537 11.3792 11.2292 10.9995 11.2292C10.6198 11.2292 10.312 11.537 10.312 11.9167V15.5833C10.312 15.963 10.6198 16.2708 10.9995 16.2708C11.3792 16.2708 11.687 15.963 11.687 15.5833V11.9167Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M15.8338 3.18356C15.3979 3.01319 14.9095 2.98443 14.2829 2.97987C14.0256 2.43753 13.473 2.0625 12.8328 2.0625H9.16613C8.52593 2.0625 7.97332 2.43753 7.716 2.97987C7.08942 2.98443 6.60107 3.01319 6.16515 3.18356C5.64432 3.38713 5.19129 3.73317 4.85788 4.18211C4.52153 4.63502 4.36363 5.21554 4.14631 6.01456L3.57076 8.12557C3.21555 8.30747 2.90473 8.55242 2.64544 8.88452C2.07527 9.61477 1.9743 10.4845 2.07573 11.4822C2.17415 12.4504 2.47894 13.6695 2.86047 15.1955L2.88467 15.2923C3.12592 16.2573 3.32179 17.0409 3.55475 17.6524C3.79764 18.2899 4.10601 18.8125 4.61441 19.2095C5.12282 19.6064 5.70456 19.7788 6.38199 19.8598C7.03174 19.9375 7.8394 19.9375 8.83415 19.9375H13.1647C14.1594 19.9375 14.9671 19.9375 15.6169 19.8598C16.2943 19.7788 16.876 19.6064 17.3844 19.2095C17.8928 18.8125 18.2012 18.2899 18.4441 17.6524C18.6771 17.0409 18.8729 16.2573 19.1142 15.2923L19.1384 15.1956C19.5199 13.6695 19.8247 12.4504 19.9231 11.4822C20.0245 10.4845 19.9236 9.61477 19.3534 8.88452C19.0941 8.55245 18.7833 8.30751 18.4282 8.12562L17.8526 6.01455C17.6353 5.21554 17.4774 4.63502 17.141 4.18211C16.8076 3.73317 16.3546 3.38713 15.8338 3.18356ZM6.66568 4.46423C6.86717 4.38548 7.11061 4.36231 7.71729 4.35618C7.97516 4.89706 8.527 5.27083 9.16613 5.27083H12.8328C13.4719 5.27083 14.0238 4.89706 14.2816 4.35618C14.8883 4.36231 15.1318 4.38548 15.3332 4.46423C15.6137 4.57384 15.8576 4.76017 16.0372 5.00191C16.1986 5.21928 16.2933 5.52299 16.56 6.50095L16.8841 7.68964C15.9328 7.56246 14.7046 7.56248 13.1787 7.5625H8.82014C7.29428 7.56248 6.06614 7.56246 5.11483 7.68963L5.43894 6.50095C5.7056 5.52299 5.80033 5.21928 5.96176 5.00191C6.14129 4.76017 6.38523 4.57384 6.66568 4.46423ZM9.16613 3.4375C9.03956 3.4375 8.93696 3.5401 8.93696 3.66667C8.93696 3.79323 9.03956 3.89583 9.16613 3.89583H12.8328C12.9594 3.89583 13.062 3.79323 13.062 3.66667C13.062 3.5401 12.9594 3.4375 12.8328 3.4375H9.16613ZM3.72922 9.73071C3.98482 9.40334 4.38904 9.18345 5.22428 9.06262C6.07737 8.93921 7.23405 8.9375 8.87703 8.9375H13.1218C14.7648 8.9375 15.9215 8.93921 16.7746 9.06262C17.6098 9.18345 18.014 9.40334 18.2696 9.73071C18.5252 10.0581 18.6405 10.5036 18.5552 11.3432C18.468 12.2007 18.1891 13.3233 17.7906 14.9172C17.5365 15.9338 17.3595 16.6372 17.1592 17.1629C16.9655 17.6713 16.7758 17.9402 16.5382 18.1257C16.3007 18.3112 15.9938 18.43 15.4536 18.4946C14.895 18.5614 14.1697 18.5625 13.1218 18.5625H8.87703C7.8291 18.5625 7.10386 18.5614 6.54525 18.4946C6.005 18.43 5.69817 18.3112 5.4606 18.1257C5.22304 17.9402 5.03337 17.6713 4.83967 17.1629C4.63938 16.6372 4.46237 15.9338 4.20822 14.9172C3.80973 13.3233 3.53086 12.2007 3.44368 11.3432C3.35832 10.5036 3.47362 10.0581 3.72922 9.73071Z"
                          fill=""
                        />
                      </svg>
                      Posts
                    </button>

                    <button
                      onClick={() => setActiveTab("packages")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${activeTab === "packages"
                        ? "text-white bg-blue"
                        : "text-dark-2 bg-gray-1"
                        }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M11.0007 1.83331C11.3516 1.83331 11.6678 2.03544 11.8041 2.35281L13.9708 6.68614H18.3341C18.5767 6.68614 18.8031 6.81031 18.9349 7.01831C19.0666 7.22631 19.0858 7.48781 18.9866 7.71448L16.8200 11.9141C16.7425 12.0895 16.5941 12.2245 16.4116 12.2828C16.2291 12.3411 16.0308 12.3166 15.8666 12.2166L11.0007 9.16664L6.1349 12.2166C5.97073 12.3166 5.77239 12.3411 5.58989 12.2828C5.40739 12.2245 5.25906 12.0895 5.18156 11.9141L3.01489 7.71448C2.91572 7.48781 2.93489 7.22631 3.06656 7.01831C3.19823 6.81031 3.42489 6.68614 3.66739 6.68614H8.03073L10.1974 2.35281C10.3337 2.03544 10.6499 1.83331 11.0007 1.83331ZM11.0007 4.51664L9.46406 7.51664C9.32773 7.83398 9.01156 8.03614 8.66739 8.03614H5.53406L6.91823 10.8641L10.4582 8.76414C10.6341 8.65581 10.8674 8.65581 11.0432 8.76414L14.5832 10.8641L15.9674 8.03614H12.8341C12.4899 8.03614 12.1737 7.83398 12.0374 7.51664L10.5007 4.51664Z"
                          fill=""
                        />
                        <path
                          d="M11.0007 13.7499C10.6224 13.7499 10.3132 14.0591 10.3132 14.4374V19.2499C10.3132 19.6282 10.6224 19.9374 11.0007 19.9374C11.379 19.9374 11.6882 19.6282 11.6882 19.2499V14.4374C11.6882 14.0591 11.379 13.7499 11.0007 13.7499Z"
                          fill=""
                        />
                        <path
                          d="M7.5632 15.8124C7.18491 15.8124 6.87574 16.1216 6.87574 16.4999C6.87574 16.8782 7.18491 17.1874 7.5632 17.1874H14.4382C14.8165 17.1874 15.1257 16.8782 15.1257 16.4999C15.1257 16.1216 14.8165 15.8124 14.4382 15.8124H7.5632Z"
                          fill=""
                        />
                      </svg>
                      Packages
                    </button>

                    <button
                      onClick={() => setActiveTab("addresses")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${activeTab === "addresses"
                        ? "text-white bg-blue"
                        : "text-dark-2 bg-gray-1"
                        }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.25065 15.8125C7.87096 15.8125 7.56315 16.1203 7.56315 16.5C7.56315 16.8797 7.87096 17.1875 8.25065 17.1875H13.7507C14.1303 17.1875 14.4382 16.8797 14.4382 16.5C14.4382 16.1203 14.1303 15.8125 13.7507 15.8125H8.25065Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M11.0007 1.14581C10.3515 1.14581 9.7618 1.33173 9.12199 1.64287C8.50351 1.94363 7.78904 2.38706 6.8966 2.94094L5.00225 4.11664C4.15781 4.6407 3.48164 5.06035 2.96048 5.45947C2.42079 5.87278 2.00627 6.29371 1.70685 6.84072C1.40806 7.38659 1.2735 7.96741 1.20899 8.65396C1.14647 9.31931 1.14648 10.1329 1.14648 11.1533V12.6315C1.14647 14.3767 1.14646 15.7543 1.28646 16.8315C1.43008 17.9364 1.73183 18.8284 2.41365 19.5336C3.0986 20.2421 3.97024 20.5587 5.04929 20.7087C6.0951 20.8542 7.43075 20.8542 9.11401 20.8541H12.8872C14.5705 20.8542 15.9062 20.8542 16.952 20.7087C18.0311 20.5587 18.9027 20.2421 19.5877 19.5336C20.2695 18.8284 20.5712 17.9364 20.7148 16.8315C20.8548 15.7543 20.8548 14.3768 20.8548 12.6315V11.1533C20.8548 10.1329 20.8548 9.31929 20.7923 8.65396C20.7278 7.96741 20.5932 7.38659 20.2944 6.84072C19.995 6.29371 19.5805 5.87278 19.0408 5.45947C18.5197 5.06035 17.8435 4.64071 16.9991 4.11665L15.1047 2.94093C14.2123 2.38706 13.4978 1.94363 12.8793 1.64287C12.2395 1.33173 11.6498 1.14581 11.0007 1.14581ZM7.59022 4.12875C8.52133 3.55088 9.17602 3.14555 9.72332 2.87941C10.2565 2.62011 10.6342 2.52081 11.0007 2.52081C11.3672 2.52081 11.7448 2.62011 12.278 2.87941C12.8253 3.14555 13.48 3.55088 14.4111 4.12875L16.2444 5.26657C17.1252 5.8132 17.7436 6.19788 18.2048 6.55112C18.6536 6.89482 18.9118 7.17845 19.0883 7.50093C19.2655 7.82455 19.3689 8.20291 19.4233 8.7826C19.4791 9.37619 19.4798 10.1253 19.4798 11.1869V12.5812C19.4798 14.3879 19.4785 15.676 19.3513 16.6542C19.2264 17.6149 18.9912 18.1723 18.5991 18.5779C18.2101 18.9803 17.6805 19.2192 16.7626 19.3468C15.8225 19.4776 14.5826 19.4791 12.834 19.4791H9.16732C7.41875 19.4791 6.17883 19.4776 5.23869 19.3468C4.32077 19.2192 3.79119 18.9803 3.40221 18.5779C3.01008 18.1723 2.77486 17.6149 2.64999 16.6542C2.52285 15.676 2.52148 14.3879 2.52148 12.5812V11.1869C2.52148 10.1253 2.52218 9.37619 2.57796 8.7826C2.63243 8.20291 2.73584 7.82455 2.91299 7.50093C3.0895 7.17845 3.3477 6.89482 3.79649 6.55112C4.25774 6.19788 4.87612 5.8132 5.75689 5.26657L7.59022 4.12875Z"
                          fill=""
                        />
                      </svg>
                      Addresses
                    </button>

                    <button
                      onClick={() => setActiveTab("account-details")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${activeTab === "account-details"
                        ? "text-white bg-blue"
                        : "text-dark-2 bg-gray-1"
                        }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.9995 1.14581C8.59473 1.14581 6.64531 3.09524 6.64531 5.49998C6.64531 7.90472 8.59473 9.85415 10.9995 9.85415C13.4042 9.85415 15.3536 7.90472 15.3536 5.49998C15.3536 3.09524 13.4042 1.14581 10.9995 1.14581ZM8.02031 5.49998C8.02031 3.85463 9.35412 2.52081 10.9995 2.52081C12.6448 2.52081 13.9786 3.85463 13.9786 5.49998C13.9786 7.14533 12.6448 8.47915 10.9995 8.47915C9.35412 8.47915 8.02031 7.14533 8.02031 5.49998Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.9995 11.2291C8.87872 11.2291 6.92482 11.7112 5.47697 12.5256C4.05066 13.3279 2.97864 14.5439 2.97864 16.0416L2.97858 16.1351C2.97754 17.2001 2.97624 18.5368 4.14868 19.4916C4.7257 19.9614 5.53291 20.2956 6.6235 20.5163C7.71713 20.7377 9.14251 20.8541 10.9995 20.8541C12.8564 20.8541 14.2818 20.7377 15.3754 20.5163C16.466 20.2956 17.2732 19.9614 17.8503 19.4916C19.0227 18.5368 19.0214 17.2001 19.0204 16.1351L19.0203 16.0416C19.0203 14.5439 17.9483 13.3279 16.522 12.5256C15.0741 11.7112 13.1202 11.2291 10.9995 11.2291ZM4.35364 16.0416C4.35364 15.2612 4.92324 14.4147 6.15108 13.724C7.35737 13.0455 9.07014 12.6041 10.9995 12.6041C12.9288 12.6041 14.6416 13.0455 15.8479 13.724C17.0757 14.4147 17.6453 15.2612 17.6453 16.0416C17.6453 17.2405 17.6084 17.9153 16.982 18.4254C16.6424 18.702 16.0746 18.9719 15.1027 19.1686C14.1338 19.3648 12.8092 19.4791 10.9995 19.4791C9.18977 19.4791 7.86515 19.3648 6.89628 19.1686C5.92437 18.9719 5.35658 18.702 5.01693 18.4254C4.39059 17.9153 4.35364 17.2405 4.35364 16.0416Z"
                          fill=""
                        />
                      </svg>
                      Account Details
                    </button>

                    <button
                      onClick={() => setActiveTab("history")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${activeTab === "history"
                        ? "text-white bg-blue"
                        : "text-dark-2 bg-gray-1"
                        }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.8333 1.83331C12.8333 1.45361 12.5258 1.14581 12.1458 1.14581C11.7661 1.14581 11.4583 1.45361 11.4583 1.83331V10.9999L11.4583 11.0416H11.5L16.1733 15.715C16.4416 15.9833 16.8784 15.9833 17.1467 15.715C17.415 15.4467 17.415 15.0099 17.1467 14.7416L12.8333 10.4282V1.83331Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M11 2.74998C6.17805 2.74998 2.28125 6.64678 2.28125 11.4687C2.28125 16.2907 6.17805 20.1875 11 20.1875C15.822 20.1875 19.7187 16.2907 19.7187 11.4687C19.7187 10.0161 19.3734 8.64586 18.7552 7.43748C18.5869 7.09373 18.1767 6.97436 17.833 7.14269C17.4892 7.31103 17.3699 7.72123 17.5382 8.06498C18.0689 9.08873 18.3437 10.2499 18.3437 11.4687C18.3437 15.5315 15.0628 18.8125 11 18.8125C6.93723 18.8125 3.65625 15.5315 3.65625 11.4687C3.65625 7.40598 6.93723 4.12498 11 4.12498C12.2188 4.12498 13.3799 4.39978 14.4037 4.93048C14.7474 5.09881 15.1576 4.97944 15.326 4.63569C15.4943 4.29194 15.3749 3.88173 15.0312 3.7134C13.8228 3.09519 12.4525 2.74998 11 2.74998Z"
                          fill=""
                        />
                      </svg>
                      History
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-red-500 hover:text-white text-red-600 bg-red-50 border border-red-200"
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.7005 1.14581C12.4469 1.14579 11.4365 1.14578 10.6417 1.25263C9.81664 1.36356 9.12193 1.60088 8.57017 2.15263C8.08898 2.63382 7.84585 3.22514 7.71822 3.91997C7.59419 4.59515 7.57047 5.42142 7.56495 6.41282C7.56284 6.79251 7.86892 7.10202 8.24861 7.10414C8.6283 7.10625 8.93782 6.80016 8.93993 6.42047C8.94551 5.4181 8.97154 4.70761 9.07059 4.16838C9.16603 3.64881 9.31927 3.34807 9.54244 3.12491C9.79614 2.87121 10.1523 2.7058 10.825 2.61537C11.5174 2.52227 12.435 2.52081 13.7508 2.52081H14.6675C15.9833 2.52081 16.901 2.52227 17.5934 2.61537C18.266 2.7058 18.6222 2.87121 18.8759 3.12491C19.1296 3.37861 19.295 3.7348 19.3855 4.40742C19.4786 5.09983 19.48 6.01752 19.48 7.33331V14.6666C19.48 15.9824 19.4786 16.9001 19.3855 17.5925C19.295 18.2652 19.1296 18.6214 18.8759 18.8751C18.6222 19.1288 18.266 19.2942 17.5934 19.3846C16.901 19.4777 15.9833 19.4791 14.6675 19.4791H13.7508C12.435 19.4791 11.5174 19.4777 10.825 19.3846C10.1523 19.2942 9.79614 19.1288 9.54244 18.8751C9.31927 18.6519 9.16603 18.3512 9.07059 17.8316C8.97154 17.2924 8.94551 16.5819 8.93993 15.5795C8.93782 15.1998 8.6283 14.8937 8.24861 14.8958C7.86892 14.8979 7.56284 15.2075 7.56495 15.5871C7.57047 16.5785 7.59419 17.4048 7.71822 18.08C7.84585 18.7748 8.08898 19.3661 8.57017 19.8473C9.12193 20.3991 9.81664 20.6364 10.6417 20.7473C11.4365 20.8542 12.4469 20.8542 13.7006 20.8541H14.7178C15.9714 20.8542 16.9819 20.8542 17.7766 20.7473C18.6017 20.6364 19.2964 20.3991 19.8482 19.8473C20.4 19.2956 20.6373 18.6009 20.7482 17.7758C20.855 16.981 20.855 15.9706 20.855 14.7169V7.28302C20.855 6.02939 20.855 5.01893 20.7482 4.22421C20.6373 3.39911 20.4 2.70439 19.8482 2.15263C19.2964 1.60088 18.6017 1.36356 17.7766 1.25263C16.9819 1.14578 15.9714 1.14579 14.7178 1.14581H13.7005Z"
                          fill=""
                        />
                        <path
                          d="M13.7507 10.3125C14.1303 10.3125 14.4382 10.6203 14.4382 11C14.4382 11.3797 14.1303 11.6875 13.7507 11.6875H3.69247L5.48974 13.228C5.77802 13.4751 5.81141 13.9091 5.56431 14.1974C5.3172 14.4857 4.88318 14.5191 4.5949 14.272L1.38657 11.522C1.23418 11.3914 1.14648 11.2007 1.14648 11C1.14648 10.7993 1.23418 10.6086 1.38657 10.478L4.5949 7.72799C4.88318 7.48089 5.3172 7.51428 5.56431 7.80256C5.81141 8.09085 5.77802 8.52487 5.48974 8.77197L3.69247 10.3125H13.7507Z"
                          fill=""
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* <!--== user dashboard menu end ==-->

            
          <!--== user dashboard content start ==--> */}
            {/* <!-- posts tab content start --> */}
            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 ${activeTab === "posts" ? "block" : "hidden"
                }`}
            >
              <div className="p-4 sm:p-7.5 xl:p-9">
                <h3 className="text-xl font-semibold mb-6">My Posts</h3>

                {postsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
                  </div>
                ) : userPosts.length > 0 ? (
                  <div className="space-y-4">
                    {userPosts.map((post: Post) => (
                      <div
                        key={post.id}
                        className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-5 md:p-6"
                      >
                        {/* Top row: Title + Status + Edit */}
                        <div className="flex items-start justify-between gap-4">
                          {/* Left: title + description */}
                          <div className="min-w-0">
                            <h4 className="text-slate-900 font-semibold text-base md:text-lg truncate">
                              {post.title}
                            </h4>

                            {post.description && (
                              <p className="mt-1 text-slate-600 text-sm line-clamp-2">
                                {post.description}
                              </p>
                            )}
                          </div>

                          {/* Right: status + edit */}
                          <div className="flex flex-col items-end shrink-0">
                            <span
                              className={
                                "px-2.5 py-1 rounded-full text-xs font-medium " +
                                statusBadge(post.status)
                              }
                            >
                              {post.status}
                            </span>

                            <button
                              onClick={() => openEditPost(post)}
                              className="mt-2 text-sm text-blue-500 hover:text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="mt-4 h-px bg-slate-100" />

                        {/* Meta grid: Price | Condition | Category | Created */}
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">Price:</span>
                            <span className="font-medium text-slate-900">
                              {formatVND(post.price)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">Condition:</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium capitalize">
                              {post.condition || "-"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">Category:</span>
                            <span className="text-slate-800">{post.categoryName || "Uncategorized"}</span>
                          </div>

                          <div className="flex items-center md:justify-end gap-1.5">
                            <span className="text-slate-500">Created:</span>
                            <span className="text-slate-800">{formatDate(post.createdAt)}</span>
                          </div>
                          {post.images && post.images.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {post.images
                                .slice(0, 3)
                                .map(
                                  (
                                    image: { url: string } | string,
                                    index: number
                                  ) => (
                                    <div
                                      key={index}
                                      className="w-16 h-16 relative"
                                    >
                                      <Image
                                        src={
                                          typeof image === "string"
                                            ? image
                                            : image.url
                                        }
                                        alt={`Post image ${index + 1}`}
                                        fill
                                        className="rounded object-cover"
                                      />
                                    </div>
                                  )
                                )}
                              {post.images.length > 3 && (
                                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-600">
                                  +{post.images.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="w-16 h-16 mx-auto"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No posts yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      You haven&apos;t created any posts yet.
                    </p>
                    <button
                      onClick={() => (window.location.href = "/create-post")}
                      className="px-4 py-2 bg-blue text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Create Your First Post
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* <!-- posts tab content end -->

          <!-- packages tab content start --> */}
            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 ${activeTab === "packages" ? "block" : "hidden"
                }`}
            >
              <div className="p-4 sm:p-8.5">
                <div className="flex items-center justify-between mb-7">
                  <h2 className="font-medium text-xl text-dark">My Packages</h2>
                  <button
                    onClick={() => {
                      console.log("Manual reload packages");
                      loadUserPackages();
                    }}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Debug Reload
                  </button>
                </div>

                {/* Package List */}
                <div className="space-y-4">
                  {packagesLoading ? (
                    // Loading State
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
                    </div>
                  ) : userPackages.length > 0 ? (
                    // Packages List
                    userPackages.map((pkg, index) => {
                      // Use the status from API response
                      const isActive = pkg.status?.toLowerCase() === "active";

                      return (
                        <div
                          key={pkg.id || index}
                          className="border border-gray-3 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-dark text-lg mb-1">
                                {pkg.packageName || "Package"}
                              </h3>
                              <p className="text-gray-500 text-sm mb-2">
                                Remaining posts: {pkg.remainingPosts || 0}/
                                {pkg.postLimit || 0}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                                  }`}
                              >
                                {pkg.status || "Unknown"}
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar for Posts */}
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Posts Used</span>
                              <span>
                                {pkg.usedPosts || 0} of {pkg.postLimit || 0}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue h-2 rounded-full transition-all duration-300"
                                style={{
                                  width:
                                    pkg.postLimit > 0
                                      ? `${((pkg.usedPosts || 0) / pkg.postLimit) * 100}%`
                                      : "0%",
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Price:</span>
                              <p className="font-medium text-blue">
                                $
                                {pkg.price
                                  ? (pkg.price / 100).toFixed(2)
                                  : "0.00"}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Duration:</span>
                              <p className="font-medium">
                                {pkg.durationInDays || 0} days
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Package ID:</span>
                              <p className="font-medium">#{pkg.id || "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // No Packages State
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No packages purchased yet
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Browse our packages to get started with premium
                        features.
                      </p>
                      <button className="inline-flex items-center px-4 py-2 bg-blue text-white rounded-md hover:bg-blue-dark transition-colors">
                        Browse Packages
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* <!-- packages tab content end -->

          <!-- history tab content start --> */}
            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 ${activeTab === "history" ? "block" : "hidden"
                }`}
            >
              <div className="p-4 sm:p-8.5">
                <div className="flex items-center justify-between mb-7">
                  <h2 className="font-medium text-xl text-dark">
                    Payment History
                  </h2>
                </div>

                {/* Payment History List */}
                <div className="space-y-4">
                  {historyLoading ? (
                    // Loading State
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
                    </div>
                  ) : paymentHistory.length > 0 ? (
                    // Payment History List
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-3">
                            <th className="text-left py-3 px-4 font-medium text-dark">
                              Date
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-dark">
                              Package
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-dark">
                              Amount
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-dark">
                              Payment ID
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentHistory.map((payment, index) => (
                            <tr
                              key={payment.id || index}
                              className="border-b border-gray-2 hover:bg-gray-1 transition-colors"
                            >
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-medium text-dark text-sm">
                                    {payment.paidAt
                                      ? new Date(
                                        payment.paidAt
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })
                                      : "N/A"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {payment.paidAt
                                      ? new Date(
                                        payment.paidAt
                                      ).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                      : ""}
                                  </p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-medium text-dark text-sm">
                                    {payment.packageName || "Unknown Package"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Package ID: #{payment.packageId || "N/A"}
                                  </p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <p className="font-medium text-blue text-sm">
                                  $
                                  {payment.amount
                                    ? (payment.amount / 100).toFixed(2)
                                    : "0.00"}
                                </p>
                              </td>
                              <td className="py-4 px-4">
                                <p className="font-mono text-xs text-gray-600">
                                  #{payment.id || "N/A"}
                                </p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    // No Payment History State
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No payment history found
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Your payment transactions will appear here once you make
                        your first purchase.
                      </p>
                      <button className="inline-flex items-center px-4 py-2 bg-blue text-white rounded-md hover:bg-blue-dark transition-colors">
                        Browse Packages
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* <!-- history tab content end -->

          <!-- addresses tab content start --> */}
            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 ${activeTab === "addresses" ? "block" : "hidden"
                }`}
            >
              <div className="p-4 sm:p-7.5 xl:p-9">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">My Addresses</h3>
                  <button
                    onClick={openAddressModal}
                    className="px-4 py-2 bg-blue text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Add New Address
                  </button>
                </div>

                {addressesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
                  </div>
                ) : userAddresses.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-dark border-b border-gray-3 pb-2">
                      My Addresses
                    </h4>
                    {userAddresses.map((address, index) => (
                      <div
                        key={address.id || index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs px-2 py-1 rounded bg-blue text-white">
                            Address #{index + 1}
                          </span>
                          <button
                            onClick={() => openEditAddress(address)}
                            className="text-blue hover:text-blue-600 text-sm"
                          >
                            Edit
                          </button>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          {/* Display name from user profile */}
                          {(user?.fullName || user?.userName) && (
                            <p className="flex items-center gap-2 font-medium text-gray-800">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              {user?.fullName || user?.userName}
                            </p>
                          )}

                          {/* Display email from user profile */}
                          {user?.email && (
                            <p className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              {user.email}
                            </p>
                          )}

                          {/* Display phone from user profile */}
                          {user?.phoneNumber && (
                            <p className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              {user.phoneNumber}
                            </p>
                          )}

                          <p className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {/* Display house number and street address */}
                            {address.houseNumber && `${address.houseNumber}, `}
                            {address.street ||
                              address.addressLine1 ||
                              "Street address not provided"}
                          </p>
                          <p className="ml-6">
                            {/* Display ward, district, province using API structure */}
                            {address.ward && `${address.ward}, `}
                            {address.district || address.city}
                            {address.province || address.state
                              ? `, ${address.province || address.state}`
                              : ""}
                          </p>
                          {address.zipCode && (
                            <p className="ml-6">Zip: {address.zipCode}</p>
                          )}
                          {address.country && (
                            <p className="ml-6">Country: {address.country}</p>
                          )}
                          {address.length !== undefined && (
                            <p className="ml-6 text-xs text-gray-500">
                              Length: {address.length}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No addresses found</p>
                    <button
                      onClick={openAddressModal}
                      className="mt-2 text-blue hover:text-blue-600 text-sm"
                    >
                      Add your first address
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* <!-- addresses tab content end -->

          <!-- details tab content start --> */}
            <div
              className={`xl:max-w-[770px] w-full ${activeTab === "account-details" ? "block" : "hidden"
                }`}
            >
              <form>
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  {!userProfile && (
                    <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue"></div>
                        <p className="text-blue-700 text-sm">
                          Loading user profile...
                        </p>
                      </div>
                      <p className="text-blue-600 text-xs mt-1">
                        If this persists, please ensure the backend server is
                        running on https://localhost:5000
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                    <div className="w-full">
                      <label htmlFor="userName" className="block mb-2.5">
                        Username <span className="text-red">*</span>
                      </label>

                      <input
                        type="text"
                        name="userName"
                        id="userName"
                        placeholder="Username"
                        defaultValue={
                          userProfile?.userName || user?.userName || ""
                        }
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>

                    <div className="w-full">
                      <label htmlFor="location" className="block mb-2.5">
                        Location
                      </label>

                      <input
                        type="text"
                        name="location"
                        id="location"
                        placeholder="Your location"
                        defaultValue={userProfile?.location || ""}
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label htmlFor="email" className="block mb-2.5">
                      Email <span className="text-red">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="Email address"
                      defaultValue={userProfile?.email || ""}
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div className="mb-5">
                    <label htmlFor="phoneNumber" className="block mb-2.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      id="phoneNumber"
                      placeholder="Phone number"
                      defaultValue={userProfile?.phoneNumber || ""}
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div className="mb-5">
                    <label htmlFor="role" className="block mb-2.5">
                      Role
                    </label>

                    <input
                      type="text"
                      name="role"
                      id="role"
                      defaultValue={userProfile?.role || ""}
                      disabled
                      className="rounded-md border border-gray-3 bg-gray-200 text-gray-600 w-full py-2.5 px-5 outline-none cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                  >
                    Save Changes
                  </button>
                </div>

                <p className="text-custom-sm mt-5 mb-9">
                  This will be how your name will be displayed in the account
                  section and in reviews
                </p>

                <p className="font-medium text-xl sm:text-2xl text-dark mb-7">
                  Password Change
                </p>

                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <div className="mb-5">
                    <label htmlFor="oldPassword" className="block mb-2.5">
                      Old Password
                    </label>

                    <input
                      type="password"
                      name="oldPassword"
                      id="oldPassword"
                      autoComplete="on"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div className="mb-5">
                    <label htmlFor="newPassword" className="block mb-2.5">
                      New Password
                    </label>

                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      autoComplete="on"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div className="mb-5">
                    <label
                      htmlFor="confirmNewPassword"
                      className="block mb-2.5"
                    >
                      Confirm New Password
                    </label>

                    <input
                      type="password"
                      name="confirmNewPassword"
                      id="confirmNewPassword"
                      autoComplete="on"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
            {/* <!-- details tab content end -->
          <!--== user dashboard content end ==--> */}
          </div>
        </div>
      </section>
      {/* ====== Edit Post Modal ====== */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Post</h3>
              <button onClick={() => setPostModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="block text-sm mb-1">Title</label>
                <input
                  value={postForm.title}
                  onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />

                <label className="block text-sm mb-1 mt-3">Description</label>
                <textarea
                  value={postForm.description}
                  onChange={e => setPostForm({ ...postForm, description: e.target.value })}
                  className="w-full h-[140px] px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />

                <label className="block text-sm mb-1 mt-3">Condition</label>
                <select
                  value={postForm.condition || ""}
                  onChange={(e) => setPostForm({ ...postForm, condition: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Select condition…</option>
                  {CONDITION_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm mb-1">Price</label>
                <div className="relative">
                  <input
                    type="number"
                    value={postForm.price}
                    onChange={(e) => setPostForm({ ...postForm, price: e.target.value })}
                    className="w-full px-3 py-2 pr-14 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                    VND
                  </span>
                </div>

                <label className="block text-sm mb-1">Category</label>
                <select
                  value={postForm.categoryId}
                  onChange={(e) => setPostForm({ ...postForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    {catLoading ? "Loading..." : "Select category…"}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>         {/* ⬅️ ép về string */}
                      {c.categoryName}
                    </option>
                  ))}
                </select>

                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm">Post Images (URLs)</label>
                    <button
                      type="button"
                      onClick={() => setPostForm({ ...postForm, postImages: [...postForm.postImages, ""] })}
                      className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {postForm.postImages.map((url, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          value={url}
                          onChange={e => {
                            const next = [...postForm.postImages];
                            next[idx] = e.target.value;
                            setPostForm({ ...postForm, postImages: next });
                          }}
                          className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="https://..."
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = postForm.postImages.filter((_, i) => i !== idx);
                            setPostForm({ ...postForm, postImages: next.length ? next : [""] });
                          }}
                          className="px-2 text-sm text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setPostModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={postSaving}
              >
                Cancel
              </button>
              <button
                onClick={updatePost}
                className="flex-1 px-4 py-2 bg-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                disabled={postSaving}
              >
                {postSaving ? "Updating..." : "Update Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Notice Modal for Approved/Reject ====== */}
      {noticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-3">Notice</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">{noticeText}</p>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setNoticeOpen(false)}
                className="px-4 py-2 bg-blue text-white rounded-md hover:bg-blue-600"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Edit Address Modal */}
      {addressModal && editingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Address</h3>
              <button
                onClick={closeAddressModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
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
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province
                </label>
                <input
                  type="text"
                  value={editForm.province}
                  onChange={(e) =>
                    handleEditFormChange("province", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter province"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={editForm.district}
                  onChange={(e) =>
                    handleEditFormChange("district", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter district"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ward
                </label>
                <input
                  type="text"
                  value={editForm.ward}
                  onChange={(e) => handleEditFormChange("ward", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter ward"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street
                </label>
                <input
                  type="text"
                  value={editForm.street}
                  onChange={(e) =>
                    handleEditFormChange("street", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  House Number
                </label>
                <input
                  type="text"
                  value={editForm.houseNumber}
                  onChange={(e) =>
                    handleEditFormChange("houseNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter house number"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeAddressModal}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                onClick={updateAddress}
                disabled={editLoading}
                className="flex-1 px-4 py-2 bg-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {editLoading ? "Updating..." : "Update Address"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Address Modal - fallback to existing modal */}
      {addressModal && !editingAddress && (
        <AddressModal isOpen={addressModal} closeModal={closeAddressModal} />
      )}
    </>
  );

};

export default MyAccount;
