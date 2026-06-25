#!/usr/bin/env python3
"""
/**
 * @author ColdByDefault
 * @copyright 2025 ColdByDefault. All Rights Reserved.
 */
GitHub MCP Server for Portfolio Integration
Fetches GitHub profile data, repositories, and statistics
"""

import json
import requests
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables from .env.local (for Next.js compatibility)
load_dotenv('.env.local')
load_dotenv()  # Fallback to .env

class GitHubMCPServer:
    def __init__(self, username: str = None, token: Optional[str] = None):
        self.username = username or os.getenv('GITHUB_USERNAME', 'yazanaboayash')
        self.token = token or os.getenv('GITHUB_TOKEN')
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Portfolio-MCP-Server"
        }
        if self.token:
            self.headers["Authorization"] = f"Bearer {self.token}"
        
        # Debug info (sanitized)
        print(f"GitHub username: {self.username}")
        print(f"GitHub token present: {bool(self.token)}")
        if not self.token:
            print("No GitHub token found. API requests will be rate-limited.")
    
    async def get_user_profile(self) -> Dict[str, Any]:
        """Get GitHub user profile information"""
        try:
            response = requests.get(f"{self.base_url}/users/{self.username}", headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": f"Failed to fetch profile: {str(e)}"}
    
    async def get_repositories(self, limit: int = 6, sort: str = "updated") -> List[Dict[str, Any]]:
        """Get user repositories"""
        try:
            params = {
                "sort": sort,
                "direction": "desc",
                "per_page": limit,
                "type": "owner"
            }
            response = requests.get(f"{self.base_url}/users/{self.username}/repos", 
                                  headers=self.headers, params=params)
            response.raise_for_status()
            repos = response.json()
            
            # Filter out forks and add additional info
            filtered_repos = []
            for repo in repos:
                if not repo.get('fork', False) and repo.get('stargazers_count', 0) >= 0:
                    repo_data = {
                        "name": repo["name"],
                        "description": repo.get("description", ""),
                        "html_url": repo["html_url"],
                        "language": repo.get("language", ""),
                        "stargazers_count": repo.get("stargazers_count", 0),
                        "forks_count": repo.get("forks_count", 0),
                        "updated_at": repo.get("updated_at", ""),
                        "topics": repo.get("topics", []),
                        "homepage": repo.get("homepage", "")
                    }
                    filtered_repos.append(repo_data)
            
            return filtered_repos[:limit]
        except requests.RequestException as e:
            return [{"error": f"Failed to fetch repositories: {str(e)}"}]
    
    async def get_user_stats(self) -> Dict[str, Any]:
        """Get user statistics"""
        try:
            # Get user info
            profile = await self.get_user_profile()
            if "error" in profile:
                return profile
            
            # Get repositories for stats
            repos_response = requests.get(f"{self.base_url}/users/{self.username}/repos", 
                                        headers=self.headers, params={"per_page": 100})
            repos_response.raise_for_status()
            repos = repos_response.json()
            
            # Calculate stats
            total_stars = sum(repo.get("stargazers_count", 0) for repo in repos)
            total_forks = sum(repo.get("forks_count", 0) for repo in repos)
            languages = {}
            
            for repo in repos:
                if repo.get("language"):
                    languages[repo["language"]] = languages.get(repo["language"], 0) + 1
            
            # Get most used language
            most_used_language = max(languages.items(), key=lambda x: x[1])[0] if languages else "Unknown"
            
            return {
                "public_repos": profile.get("public_repos", 0),
                "followers": profile.get("followers", 0),
                "following": profile.get("following", 0),
                "total_stars": total_stars,
                "total_forks": total_forks,
                "most_used_language": most_used_language,
                "languages": languages,
                "avatar_url": profile.get("avatar_url", ""),
                "bio": profile.get("bio", ""),
                "location": profile.get("location", ""),
                "blog": profile.get("blog", ""),
                "created_at": profile.get("created_at", "")
            }
        except requests.RequestException as e:
            return {"error": f"Failed to fetch stats: {str(e)}"}
    
    async def get_recent_activity(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get recent GitHub activity"""
        try:
            response = requests.get(f"{self.base_url}/users/{self.username}/events/public", 
                                  headers=self.headers, params={"per_page": limit})
            response.raise_for_status()
            events = response.json()
            
            filtered_events = []
            for event in events[:limit]:
                event_data = {
                    "type": event.get("type", ""),
                    "repo": event.get("repo", {}).get("name", ""),
                    "created_at": event.get("created_at", ""),
                    "action": self._format_event_action(event)
                }
                filtered_events.append(event_data)
            
            return filtered_events
        except requests.RequestException as e:
            return [{"error": f"Failed to fetch activity: {str(e)}"}]
    
    def _format_event_action(self, event: Dict[str, Any]) -> str:
        """Format event action for display"""
        event_type = event.get("type", "")
        repo_name = event.get("repo", {}).get("name", "").split("/")[-1]
        
        if event_type == "PushEvent":
            commits = len(event.get("payload", {}).get("commits", []))
            return f"Pushed {commits} commit{'s' if commits != 1 else ''} to {repo_name}"
        elif event_type == "CreateEvent":
            ref_type = event.get("payload", {}).get("ref_type", "")
            return f"Created {ref_type} in {repo_name}"
        elif event_type == "ForkEvent":
            return f"Forked {repo_name}"
        elif event_type == "WatchEvent":
            return f"Starred {repo_name}"
        elif event_type == "IssuesEvent":
            action = event.get("payload", {}).get("action", "")
            return f"{action.capitalize()} issue in {repo_name}"
        elif event_type == "PullRequestEvent":
            action = event.get("payload", {}).get("action", "")
            return f"{action.capitalize()} pull request in {repo_name}"
        else:
            return f"{event_type.replace('Event', '')} in {repo_name}"

async def main():
    """Main function to test the GitHub MCP server"""
    server = GitHubMCPServer()
    
    print("Fetching GitHub data...")
    
    # Get profile
    profile = await server.get_user_profile()
    print(f"Profile: {profile.get('name', 'N/A')} (@{profile.get('login', 'N/A')})")
    
    # Get repositories
    repos = await server.get_repositories(limit=6)
    print(f"Repositories found: {len(repos)}")
    
    # Get stats
    stats = await server.get_user_stats()
    print(f"Stats: {stats.get('public_repos', 0)} repos, {stats.get('total_stars', 0)} stars")
    
    # Get recent activity
    activity = await server.get_recent_activity(limit=5)
    print(f"Recent activity: {len(activity)} events")
    
    # Save data to JSON file
    data = {
        "profile": profile,
        "repositories": repos,
        "stats": stats,
        "activity": activity,
        "last_updated": datetime.now().isoformat()
    }
    
    with open("github_data.json", "w") as f:
        json.dump(data, f, indent=2)
    
    print("Data saved to github_data.json")

if __name__ == "__main__":
    asyncio.run(main())
