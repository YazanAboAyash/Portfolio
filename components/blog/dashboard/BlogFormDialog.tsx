/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Blog } from "@/types/hubs/blogs";
import type { BlogFormData } from "@/types/main/admin";

interface BlogFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: BlogFormData;
  formErrors: string[];
  editingBlog: Blog | null;
  categories: Array<{ id: string; name: string }>;
  loading: boolean;
  onFormChange: (field: keyof BlogFormData, value: string | boolean) => void;
  onCreditsChange: (
    field: keyof NonNullable<BlogFormData["credits"]>,
    value: string
  ) => void;
  onSubmit: (action: "create" | "update") => void;
}

export function BlogFormDialog({
  isOpen,
  onClose,
  formData,
  formErrors,
  editingBlog,
  categories,
  loading,
  onFormChange,
  onCreditsChange,
  onSubmit,
}: BlogFormDialogProps) {
  const handleSubmit = () => {
    onSubmit(editingBlog ? "update" : "create");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingBlog ? "Edit Blog" : "Create New Blog"}
          </DialogTitle>
          <DialogDescription>
            {editingBlog
              ? "Update the blog post details below. All fields marked with * are required."
              : "Fill in the details below to create a new blog post. All fields marked with * are required."}
          </DialogDescription>
        </DialogHeader>

        {/* Form Validation Errors */}
        {formErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-red-800 mb-2">
              Please fix the following errors:
            </h4>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              {formErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => onFormChange("title", e.target.value)}
                placeholder="Blog title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Slug *</label>
              <Input
                value={formData.slug}
                onChange={(e) => onFormChange("slug", e.target.value)}
                placeholder="url-friendly-slug"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Excerpt</label>
            <Input
              value={formData.excerpt}
              onChange={(e) => onFormChange("excerpt", e.target.value)}
              placeholder="Brief description"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Content *</label>
            <textarea
              className="w-full h-40 p-3 border rounded-md"
              value={formData.content}
              onChange={(e) => onFormChange("content", e.target.value)}
              placeholder="Blog content (Markdown supported)"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Featured Image</label>
            <Input
              value={formData.featuredImage}
              onChange={(e) => onFormChange("featuredImage", e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Language</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.language}
                onChange={(e) => onFormChange("language", e.target.value)}
              >
                <option value="en">English</option>
                <option value="de">German</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="sv">Swedish</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.categoryId}
                onChange={(e) => onFormChange("categoryId", e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Meta Title</label>
              <Input
                value={formData.metaTitle}
                onChange={(e) => onFormChange("metaTitle", e.target.value)}
                placeholder="SEO title (max 60 chars)"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Meta Description</label>
              <Input
                value={formData.metaDescription}
                onChange={(e) =>
                  onFormChange("metaDescription", e.target.value)
                }
                placeholder="SEO description (max 160 chars)"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => onFormChange("isPublished", e.target.checked)}
              />
              <span className="text-sm font-medium">Published</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => onFormChange("isFeatured", e.target.checked)}
              />
              <span className="text-sm font-medium">Featured</span>
            </label>
          </div>

          {/* Credits/License Section */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold">
              Credits & License (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Original Author</label>
                <Input
                  value={formData.credits?.originalAuthor || ""}
                  onChange={(e) =>
                    onCreditsChange("originalAuthor", e.target.value)
                  }
                  placeholder="Author name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Original Source</label>
                <Input
                  value={formData.credits?.originalSource || ""}
                  onChange={(e) =>
                    onCreditsChange("originalSource", e.target.value)
                  }
                  placeholder="Publication or website name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Source URL</label>
                <Input
                  value={formData.credits?.sourceUrl || ""}
                  onChange={(e) => onCreditsChange("sourceUrl", e.target.value)}
                  placeholder="https://example.com/original-post"
                />
              </div>
              <div>
                <label className="text-sm font-medium">License Type</label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.credits?.licenseType || ""}
                  onChange={(e) =>
                    onCreditsChange("licenseType", e.target.value)
                  }
                >
                  <option value="">Select License</option>
                  <option value="CC BY">CC BY</option>
                  <option value="CC BY-SA">CC BY-SA</option>
                  <option value="CC BY-NC">CC BY-NC</option>
                  <option value="CC BY-NC-SA">CC BY-NC-SA</option>
                  <option value="CC BY-ND">CC BY-ND</option>
                  <option value="CC BY-NC-ND">CC BY-NC-ND</option>
                  <option value="MIT">MIT</option>
                  <option value="Apache 2.0">Apache 2.0</option>
                  <option value="GPL">GPL</option>
                  <option value="Fair Use">Fair Use</option>
                  <option value="All Rights Reserved">
                    All Rights Reserved
                  </option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Credit Text</label>
              <Input
                value={formData.credits?.creditText || ""}
                onChange={(e) => onCreditsChange("creditText", e.target.value)}
                placeholder="Custom credit text if needed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Translated From</label>
                <Input
                  value={formData.credits?.translatedFrom || ""}
                  onChange={(e) =>
                    onCreditsChange("translatedFrom", e.target.value)
                  }
                  placeholder="Original language"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Adapted From</label>
                <Input
                  value={formData.credits?.adaptedFrom || ""}
                  onChange={(e) =>
                    onCreditsChange("adaptedFrom", e.target.value)
                  }
                  placeholder="If adapted from another work"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading
                ? editingBlog
                  ? "Updating..."
                  : "Creating..."
                : editingBlog
                ? "Update Blog"
                : "Create Blog"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
