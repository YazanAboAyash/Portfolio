/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  StatsOverview,
  BlogFilters,
  BlogsList,
  BlogFormDialog,
} from "@/components/blog/dashboard";
import { useBlogAdmin } from "@/hooks/use-blog-admin";

export default function AdminBlogPage() {
  const {
    // Data
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
  } = useBlogAdmin();

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Blog
            </h1>
            <p className="mt-2 text-muted-foreground">
              Write articles, manage drafts, and control what gets published.
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New article
          </Button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.includes("success") || message.includes("Authenticated")
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* Stats Overview */}
        {stats && <StatsOverview stats={stats} lastRefresh={lastRefresh} />}

        {/* Filters */}
        <BlogFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          filterPublished={filterPublished}
          setFilterPublished={setFilterPublished}
          onRefresh={() => void loadData()}
          loading={loading}
        />

        {/* Blogs List */}
        <BlogsList
          blogs={blogs}
          pagination={pagination}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onEdit={openEditDialog}
          onDelete={(blogId: string) => void deleteBlog(blogId)}
          onToggleStatus={(
            blogId: string,
            action: "publish" | "unpublish" | "feature" | "unfeature",
          ) => void toggleBlogStatus(blogId, action)}
          loading={loading}
        />

        {/* Create/Edit Dialog */}
        <BlogFormDialog
          isOpen={isCreateDialogOpen}
          onClose={closeDialog}
          formData={formData}
          formErrors={formErrors}
          editingBlog={editingBlog}
          categories={categories}
          loading={loading}
          onFormChange={handleFormChange}
          onCreditsChange={handleCreditsChange}
          onSubmit={(action: "create" | "update") => void submitBlog(action)}
        />
      </div>
    </div>
  );
}
