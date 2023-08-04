import { Octokit } from "octokit";

// Octokit

// 1. Need to update the blog/index.html file with the new blog post link; TODO: Let's wait on this for version 2 as it might be somewhat involved;
// 2. Need to update the blog folder with a new folder containing the blog post content; 
// 3. Need to update the images folder with any new images that are referenced in the new blog post;

const OWNER = "aperezmontan";
const REPO = "aperezmontan.github.io";
const BLOG_PATH = "blog";
const BLOG_INDEX_PATH = `${BLOG_PATH}/index.html`;

export async function octo({ path, title, content }: { path: string, title: string, content: string }) {
  // NOTE: Disabling linting errors on third party libraries (octokit)
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  const octokit = new Octokit({
    auth: process.env.API_KEY
  })

  debugger  // eslint-disable-line no-debugger

  try {
    // NOTE: Disabling linting errors on third party libraries (octokit)
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
    /* eslint-enable */

    if (response.ok) {
      debugger  // eslint-disable-line no-debugger

    } else {
      console.log("BAR")
    }

  } catch (error) {
    debugger // eslint-disable-line no-debugger
  }
}
