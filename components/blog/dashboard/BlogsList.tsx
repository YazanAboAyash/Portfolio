/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, EyeOff, Star, StarOff } from "lucide-react";
import { LoadingSkeleton } from "@/components/visuals";
import type { Blog, BlogListResponse } from "@/types/hubs/blogs";

interface BlogsListProps {
  blogs: Blog[];
  pagination: BlogListResponse["pagination"] | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onEdit: (blog: Blog) => void;
  onDelete: (blogId: string) => void;
  onToggleStatus: (
    blogId: string,
    action: "publish" | "unpublish" | "feature" | "unfeature"
  ) => void;
  loading: boolean;
}

export function BlogsList({
  blogs,
  pagination,
  currentPage,
  setCurrentPage,
  onEdit,
  onDelete,
  onToggleStatus,
  loading,
}: BlogsListProps) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Blogs
          {pagination && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({pagination.total} total)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSkeleton variant="list" count={5} className="py-4" />
        ) : blogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No blogs found</div>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <div key={blog.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold truncate">
                        {blog.title}
                      </h3>
                      <div className="flex gap-1">
                        <Badge
                          variant={blog.isPublished ? "default" : "secondary"}
                        >
                          {blog.isPublished ? "Published" : "Draft"}
                        </Badge>
                        {blog.isFeatured && (
                          <Badge variant="outline">Featured</Badge>
                        )}
                        <Badge variant="outline">{blog.language}</Badge>
                      </div>
                    </div>

                    {blog.excerpt && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {blog.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Slug: {blog.slug}</span>
                      <span>Updated: {formatDate(blog.updatedAt)}</span>
                      {blog.readCount > 0 && (
                        <span>Views: {blog.readCount}</span>
                      )}
                      {blog.readingTime && (
                        <span>Reading: {blog.readingTime} min</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(blog)}
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onToggleStatus(
                          blog.id,
                          blog.isPublished ? "unpublish" : "publish"
                        )
                      }
                      disabled={loading}
                    >
                      {blog.isPublished ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onToggleStatus(
                          blog.id,
                          blog.isFeatured ? "unfeature" : "feature"
                        )
                      }
                      disabled={loading}
                    >
                      {blog.isFeatured ? (
                        <StarOff className="h-4 w-4" />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(blog.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage || loading}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - currentPage) <= 2
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
