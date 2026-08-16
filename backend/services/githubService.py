import httpx

from config import GITHUB_USERNAME


async def fetch_github_repositories():
    """Return the user's most recently updated public GitHub repositories."""

    if not GITHUB_USERNAME:
        return {
            "available": False,
            "error": "GitHub username is missing",
            "repositories": [],
        }

    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
        "User-Agent": "Personal-Pi-Dashboard",
    }

    params = {
        "type": "owner",
        "sort": "pushed",
        "per_page": 100,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"https://api.github.com/users/{GITHUB_USERNAME}/repos",
                headers=headers,
                params=params,
            )

        response.raise_for_status()
        github_repositories = response.json()

        repositories = []

        for repository in github_repositories:
            if repository["fork"] or repository["archived"]:
                continue

            repositories.append(
                {
                    "name": repository["name"],
                    "description": repository["description"],
                    "language": repository["language"],
                    "stars": repository["stargazers_count"],
                    "forks": repository["forks_count"],
                    "updated_at": repository["updated_at"],
                    "pushed_at": repository["pushed_at"],
                    "url": repository["html_url"],
                }
            )

        return {
            "available": True,
            "username": GITHUB_USERNAME,
            "repository_count": len(repositories),
            "repositories": repositories[:6],
        }

    except httpx.HTTPError as error:
        return {
            "available": False,
            "username": GITHUB_USERNAME,
            "error": str(error),
            "repositories": [],
        }