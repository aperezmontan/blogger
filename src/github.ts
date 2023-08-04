import { Octokit, App } from "octokit";
import { createAppAuth } from "@octokit/auth-app";

// Octokit

// 1. Need to update the blog/index.html file with the new blog post link; TODO: Let's wait on this for version 2 as it might be somewhat involved;
// 2. Need to update the blog folder with a new folder containing the blog post content; 
// 3. Need to update the images folder with any new images that are referenced in the new blog post;

const OWNER = "aperezmontan";
const REPO = "aperezmontan.github.io";
const BLOG_PATH = "blog";
const BLOG_INDEX_PATH = `${BLOG_PATH}/index.html`;

export async function octo({ path, title, content }: { path: string, title: string, content: string }) {
  const octokit = new Octokit({
    auth: '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'
  })

  debugger  // eslint-disable-line no-debugger

  try {
    const response = await octokit.request(`PUT /repos/${OWNER}/${REPO}/contents/${path}`, {
      owner: OWNER,
      repo: REPO,
      path,
      message: `${title}`,
      content,
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    if (response.ok) {
      debugger  // eslint-disable-line no-debugger

    } else {

    }

  } catch (error) {
    debugger
  }
}
