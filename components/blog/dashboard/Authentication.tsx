/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface AuthenticationProps {
  token: string;
  setToken: (token: string) => void;
  onAuthenticate: () => void;
  onKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  loading: boolean;
  message: string;
}

export function Authentication({
  token,
  setToken,
  onAuthenticate,
  onKeyPress,
  loading,
  message,
}: AuthenticationProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Blog Admin Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div>
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="admin-token"
            >
              Admin Token
            </label>
            <Input
              id="admin-token"
              type="password"
              placeholder="Enter admin token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyPress={onKeyPress}
              disabled={loading}
            />
          </div>

          <Button
            onClick={onAuthenticate}
            disabled={loading || !token.trim()}
            className="w-full"
          >
            {loading ? "Authenticating..." : "Access Admin Panel"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
