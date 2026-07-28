/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  BlogAdminStats,
  BlogAdminResponse,
  ApiErrorResponse,
} from "@/types/main/admin";
import type { Blog, BlogListResponse } from "@/types/hubs/blogs";
import type { BlogFormData } from "@/components/blog/dashboard";

const initialFormData: BlogFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featuredImage: "",
  language: "en",
  categoryId: "",
  metaTitle: "",
  metaDescription: "",
  isPublished: false,
  isFeatured: false,
  tags: [],
};

export function useBlogAdmin() {
  // Authentication state
  const [token, setToken] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Data state
  const [stats, setStats] = useState<BlogAdminStats | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [pagination, setPagination] = useState<
    BlogListResponse["pagination"] | null
  >(null);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // UI state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [filterPublished, setFilterPublished] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Form state
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<BlogFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Error handling utilities
  const handleError = useCallback((error: unknown, context: string): void => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    setMessage(`${context}: ${errorMessage}`);
    console.error("%s:", context, error);
  }, []);

  const isValidErrorResponse = (data: unknown): data is ApiErrorResponse => {
    return (
      typeof data === "object" &&
      data !== null &&
      ("message" in data || "error" in data || "details" in data)
    );
  };

  const getFormErrorMessage = useCallback((data: unknown): string[] => {
    if (isValidErrorResponse(data)) {
      // Handle detailed validation errors
      if ("details" in data) {
        if (Array.isArray(data.details)) {
          return data.details;
        } else if (typeof data.details === "string") {
          return [data.details];
        }
      }
      const message = String(data.message || data.error || "Unknown error");
      return [message];
    }
    return ["Unknown error occurred"];
  }, []);

  const getErrorMessage = useCallback(
    (data: unknown, defaultMessage: string): string => {
      if (isValidErrorResponse(data)) {
        // Handle detailed validation errors
        if ("details" in data) {
          if (Array.isArray(data.details)) {
            return `Validation Error: ${data.details.join(", ")}`;
          } else if (typeof data.details === "string") {
            return `Validation Error: ${data.details}`;
          }
        }
        return String(data.message || data.error || defaultMessage);
      }
      return defaultMessage;
    },
    [],
  );

  // API functions
  const loadStats = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await fetch("/api/admin/blog?action=stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = (await response.json()) as BlogAdminResponse;
        if (data.success && data.data) {
          setStats(data.data as BlogAdminStats);
        }
      }
    } catch (error) {
      handleError(error, "Error loading stats");
    }
  }, [token, isAuthenticated, handleError]);

  const loadBlogs = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: "list",
        page: currentPage.toString(),
        limit: "20",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (selectedLanguage) params.append("language", selectedLanguage);
      if (filterPublished) params.append("published", filterPublished);

      const response = await fetch(`/api/admin/blog?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const apiResponse = (await response.json()) as BlogAdminResponse;
        if (apiResponse.success && apiResponse.data) {
          const data = apiResponse.data as BlogListResponse;
          setBlogs(data.blogs || []);
          setPagination(data.pagination || null);
          setMessage("");
        }
      } else {
        const errorData = (await response
          .json()
          .catch(() => ({}))) as ApiErrorResponse;
        setMessage(getErrorMessage(errorData, "Failed to load blogs"));
      }
    } catch (error) {
      handleError(error, "Error loading blogs");
    } finally {
      setLoading(false);
    }
  }, [
    token,
    isAuthenticated,
    currentPage,
    searchQuery,
    selectedLanguage,
    filterPublished,
    handleError,
    getErrorMessage,
  ]);

  const loadCategories = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await fetch("/api/admin/blog?action=categories", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = (await response.json()) as {
          success: boolean;
          data: Array<{ id: string; name: string }>;
        };
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }, [token, isAuthenticated]);

  const loadData = useCallback(async (): Promise<void> => {
    await Promise.all([loadStats(), loadBlogs(), loadCategories()]);
    setLastRefresh(new Date());
  }, [loadStats, loadBlogs, loadCategories]);

  // Authentication
  const authenticate = useCallback(async (): Promise<void> => {
    if (!token.trim()) {
      setMessage("Please enter a valid token");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/blog?action=stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = (await response.json()) as BlogAdminResponse;
        if (data.success) {
          setIsAuthenticated(true);
          setMessage("Authenticated successfully!");
          setLastRefresh(new Date());
          // Data loading is handled by useEffects that react to isAuthenticated
        }
      } else {
        const errorData = (await response
          .json()
          .catch(() => ({}))) as ApiErrorResponse;
        setMessage(getErrorMessage(errorData, "Authentication failed"));
      }
    } catch (error) {
      handleError(error, "Authentication failed");
    } finally {
      setLoading(false);
    }
  }, [token, handleError, getErrorMessage]);

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === "Enter" && !loading) {
        void authenticate();
      }
    },
    [authenticate, loading],
  );

  // Form utilities
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleFormChange = (
    field: keyof BlogFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Auto-generate slug when title changes
      if (field === "title" && typeof value === "string") {
        newData.slug = generateSlug(value);
      }

      return newData;
    });
  };

  const handleCreditsChange = (
    field: keyof NonNullable<BlogFormData["credits"]>,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      credits: {
        originalAuthor: "",
        originalSource: "",
        sourceUrl: "",
        licenseType: "",
        creditText: "",
        translatedFrom: "",
        adaptedFrom: "",
        ...prev.credits,
        [field]: value,
      },
    }));
  };

  const validateForm = useCallback((): string[] => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push("Title is required");
    } else if (formData.title.length < 3) {
      errors.push("Title must be at least 3 characters long");
    } else if (formData.title.length > 200) {
      errors.push("Title must be less than 200 characters");
    }

    if (!formData.content.trim()) {
      errors.push("Content is required");
    } else if (formData.content.length < 10) {
      errors.push("Content must be at least 10 characters long");
    } else if (formData.content.length > 50000) {
      errors.push("Content must be less than 50,000 characters");
    }

    if (formData.excerpt && formData.excerpt.length > 500) {
      errors.push("Excerpt must be less than 500 characters");
    }

    if (formData.metaTitle && formData.metaTitle.length > 60) {
      errors.push("Meta title must be less than 60 characters");
    }

    if (formData.metaDescription && formData.metaDescription.length > 160) {
      errors.push("Meta description must be less than 160 characters");
    }

    if (formData.credits?.sourceUrl && formData.credits.sourceUrl.trim()) {
      try {
        new URL(formData.credits.sourceUrl);
      } catch {
        errors.push("Source URL must be a valid URL");
      }
    }

    return errors;
  }, [formData]);

  // Blog operations
  const submitBlog = useCallback(
    async (action: "create" | "update"): Promise<void> => {
      if (!isAuthenticated || !token) return;

      // Client-side validation first
      const clientErrors = validateForm();
      if (clientErrors.length > 0) {
        setFormErrors(clientErrors);
        return;
      }

      setLoading(true);
      setFormErrors([]); // Clear previous form errors
      try {
        const response = await fetch("/api/admin/blog", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action,
            ...(action === "update" && { blogId: editingBlog?.id }),
            data: formData,
          }),
        });

        if (response.ok) {
          setMessage(
            `Blog ${action === "create" ? "created" : "updated"} successfully!`,
          );
          setIsCreateDialogOpen(false);
          setFormData(initialFormData);
          await loadData();
        } else {
          const errorData = (await response
            .json()
            .catch(() => ({}))) as ApiErrorResponse;
          const errors = getFormErrorMessage(errorData);
          setFormErrors(errors);
        }
      } catch (error) {
        handleError(
          error,
          `Error ${action === "create" ? "creating" : "updating"} blog`,
        );
      } finally {
        setLoading(false);
      }
    },
    [
      isAuthenticated,
      token,
      formData,
      editingBlog,
      handleError,
      loadData,
      getFormErrorMessage,
      validateForm,
    ],
  );

  const deleteBlog = useCallback(
    async (blogId: string): Promise<void> => {
      if (!isAuthenticated || !token) return;
      if (!confirm("Are you sure you want to delete this blog?")) return;

      setLoading(true);
      try {
        const response = await fetch("/api/admin/blog", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "delete",
            blogId,
          }),
        });

        if (response.ok) {
          setMessage("Blog deleted successfully!");
          await loadData();
        } else {
          const errorData = (await response
            .json()
            .catch(() => ({}))) as ApiErrorResponse;
          setMessage(getErrorMessage(errorData, "Failed to delete blog"));
        }
      } catch (error) {
        handleError(error, "Error deleting blog");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, token, handleError, loadData, getErrorMessage],
  );

  const toggleBlogStatus = useCallback(
    async (
      blogId: string,
      action: "publish" | "unpublish" | "feature" | "unfeature",
    ): Promise<void> => {
      if (!isAuthenticated || !token) return;

      setLoading(true);
      try {
        const response = await fetch("/api/admin/blog", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action,
            blogId,
          }),
        });

        if (response.ok) {
          setMessage(`Blog ${action}ed successfully!`);
          await loadData();
        } else {
          const errorData = (await response
            .json()
            .catch(() => ({}))) as ApiErrorResponse;
          setMessage(getErrorMessage(errorData, `Failed to ${action} blog`));
        }
      } catch (error) {
        handleError(error, `Error ${action}ing blog`);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, token, handleError, loadData, getErrorMessage],
  );

  // Dialog handlers
  const openEditDialog = (blog: Blog) => {
    setEditingBlog(blog);
    setFormErrors([]); // Clear form errors
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || "",
      content: blog.content,
      featuredImage: blog.featuredImage || "",
      language: blog.language,
      categoryId: blog.categoryId || "",
      metaTitle: blog.metaTitle || "",
      metaDescription: blog.metaDescription || "",
      isPublished: blog.isPublished,
      isFeatured: blog.isFeatured,
      tags: blog.tags?.map((tag) => tag.tagId) || [],
      credits: blog.credits
        ? {
            originalAuthor: blog.credits.originalAuthor || "",
            originalSource: blog.credits.originalSource || "",
            sourceUrl: blog.credits.sourceUrl || "",
            licenseType: blog.credits.licenseType || "",
            creditText: blog.credits.creditText || "",
            translatedFrom: blog.credits.translatedFrom || "",
            adaptedFrom: blog.credits.adaptedFrom || "",
          }
        : undefined,
    });
    setIsCreateDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingBlog(null);
    setFormErrors([]); // Clear form errors
    setFormData(initialFormData);
    setIsCreateDialogOpen(true);
  };

  const closeDialog = () => {
    setIsCreateDialogOpen(false);
    setFormData(initialFormData);
    setFormErrors([]);
    setEditingBlog(null);
  };

  // Effects
  useEffect(() => {
    if (isAuthenticated && token) {
      // Both loaders only setState after awaiting their fetch; the rule flags
      // any call that can reach a setState, without distinguishing awaits.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadStats();
      void loadCategories();
    }
  }, [isAuthenticated, token, loadStats, loadCategories]);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Refetch when paging/filters change. Same false positive as above, plus
      // loadBlogs' leading setLoading(true), which is the intended entry into
      // the loading state for this fetch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadBlogs();
    }
  }, [
    currentPage,
    searchQuery,
    selectedLanguage,
    filterPublished,
    isAuthenticated,
    token,
    loadBlogs,
  ]);

  return {
    // Authentication state
    token,
    setToken,
    isAuthenticated,
    authenticate,
    handleKeyPress,

    // Data state
    stats,
    blogs,
    pagination,
    categories,

    // UI state
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    selectedLanguage,
    setSelectedLanguage,
    filterPublished,
    setFilterPublished,
    message,
    lastRefresh,
    loading,

    // Form state
    editingBlog,
    isCreateDialogOpen,
    formData,
    formErrors,

    // Actions
    loadData,
    submitBlog,
    deleteBlog,
    toggleBlogStatus,
    openEditDialog,
    openCreateDialog,
    closeDialog,
    handleFormChange,
    handleCreditsChange,
  };
}
