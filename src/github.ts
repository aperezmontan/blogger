import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.API_KEY
})

const dataElement = <HTMLPreElement>document.getElementById("data");

export async function getSHA(branch = "master"): Promise<string | void> {
  const ref = `refs/heads/${branch}`;

  try {
    // NOTE: Disabling linting errors on third party libraries (octokit)
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    const response = await octokit.request(`GET /repos/${OWNER}/${REPO}/git/${ref}`, {
      owner: 'OWNER',
      repo: 'REPO',
      ref: 'REF',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    /* eslint-enable */

    // TODO: make response a response type with a key of status and value of number
    // and key of data with value array
    if (response && response.status === 200 && dataElement) {
      dataElement.innerHTML = JSON.stringify(response.data);
      return response.data.object.sha;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function createBranch({ name, sha }: { name: string, sha: string }): Promise<string | void> {
  const ref = `refs/heads/${name}`;

  try {
    // NOTE: Disabling linting errors on third party libraries (octokit)
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    const response = await octokit.request(`POST /repos/${OWNER}/${REPO}/git/refs`, {
      owner: 'OWNER',
      repo: 'REPO',
      ref,
      sha,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    /* eslint-enable */

    // TODO: make response a response type with a key of status and value of number
    // and key of data with value array
    if (response && response.status === 201 && dataElement) {
      dataElement.innerHTML = JSON.stringify(response.data);
      return response.data.object.sha;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function createBlob(): Promise<string | void> {
  try {
    // NOTE: Disabling linting errors on third party libraries (octokit)
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    const response = await octokit.request(`POST /repos/${OWNER}/${REPO}/git/blobs`, {
      owner: 'OWNER',
      repo: 'REPO',
      content: 'Content of the blob',
      encoding: 'utf-8',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    /* eslint-enable */

    // TODO: make response a response type with a key of status and value of number
    // and key of data with value array
    if (response && dataElement) {
      dataElement.innerHTML = JSON.stringify(response.data);
      // NOTE!!: Here the sha is NOT nested in the object (BRUTAL)
      return response.data.sha;
    }
  } catch (error) {
    console.error(error);
  }
}

// export async function getBranchSha({ branch }: { branch: string }): Promise<string | void> {
//   try {
//     // NOTE: Disabling linting errors on third party libraries (octokit)
//     /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
//     const response = await octokit.request(`GET /repos/${OWNER}/${REPO}/git/trees/${branch}`, {
//       owner: 'OWNER',
//       repo: 'REPO',
//       tree_sha: 'TREE_SHA',
//       headers: {
//         'X-GitHub-Api-Version': '2022-11-28'
//       }
//     })
//     /* eslint-enable */

//     // TODO: make response a response type with a key of status and value of number
//     // and key of data with value array
//     if (response && response.status === 200 && dataElement) {
//       debugger
//       dataElement.innerHTML = JSON.stringify(response.data);
//       return response.data.object.sha;
//     }
//   } catch (error) {
//     console.error(error);
//   }
// }

export async function createTree({ sha, base_tree }: { sha: string, base_tree: string }): Promise<string | void> {
  try {
    // NOTE: Disabling linting errors on third party libraries (octokit)
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    const response = await octokit.request(`POST /repos/${OWNER}/${REPO}/git/trees`, {
      owner: 'OWNER',
      repo: 'REPO',
      base_tree,
      tree: [
        {
          path: 'test/file.rb',
          mode: '100644',
          type: 'blob',
          sha
        },
        {
          path: 'test/file2.rb',
          mode: '100644',
          type: 'blob',
          sha
        }
      ],
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    /* eslint-enable */

    // TODO: make response a response type with a key of status and value of number
    // and key of data with value array
    if (response && response.status === 201 && dataElement) {
      dataElement.innerHTML = JSON.stringify(response.data);
      return response.data.sha;
    }
  } catch (error) {
    console.error(error);
  }
}



export async function createCommit({ tree, message, parents }: { tree: string, message: string, parents: string[] }): Promise<string | void> {
  try {
    // NOTE: Disabling linting errors on third party libraries (octokit)
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    const response = await octokit.request(`POST /repos/${OWNER}/${REPO}/git/commits`, {
      owner: 'OWNER',
      repo: 'REPO',
      message,
      parents,
      tree,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    /* eslint-enable */

    // TODO: make response a response type with a key of status and value of number
    // and key of data with value array
    if (response && response.status === 201 && dataElement) {
      dataElement.innerHTML = JSON.stringify(response.data);
      return response.data.sha;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function updateCommitRef({ sha, branch = "master" }: { sha: string, branch: string }): Promise<string | void> {
  const ref = `refs/heads/${branch}`;

  try {
    // NOTE: Disabling linting errors on third party libraries (octokit)
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    const response = await octokit.request(`PATCH /repos/${OWNER}/${REPO}/git/${ref}`, {
      owner: 'OWNER',
      repo: 'REPO',
      ref: 'REF',
      sha,
      force: true,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    /* eslint-enable */

    // TODO: make response a response type with a key of status and value of number
    // and key of data with value array
    debugger
    if (response && response.status === 200 && dataElement) {
      dataElement.innerHTML = JSON.stringify(response.data);
      return response.data.object.sha;
    }
  } catch (error) {
    console.error(error);
  }
}

// Octokit

// 1. Need to update the blog/index.html file with the new blog post link; TODO: Let's wait on this for version 2 as it might be somewhat involved;
// 2. Need to update the blog folder with a new folder containing the blog post content; 
// 3. Need to update the images folder with any new images that are referenced in the new blog post;

const OWNER = "aperezmontan";
const REPO = "aperezmontan.github.io";
const BLOG_PATH = "blog";
const BLOG_INDEX_PATH = `${BLOG_PATH}/index.html`;

export async function octo({ path, title, content }: { path: string, title: string, content: string }) {
  const requestPath = `GET /repos/${OWNER}/${REPO}`;

  // NOTE: Disabling linting errors on third party libraries (octokit)
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  try {
    // NOTE: Disabling linting errors on third party libraries (octokit)
    // const response = await octokit.request(`PUT /repos/${OWNER}/${REPO}/pages/${path}`, {
    //   owner: OWNER,
    //   repo: REPO,
    //   path,
    //   message: `${title}`,
    //   content,
    //   headers: {
    //     'Accept': 'application/vnd.github+json',
    //     'X-GitHub-Api-Version': '2022-11-28'
    //   }
    // })

    const response = await octokit.request(requestPath, {
      owner: 'OWNER',
      repo: 'REPO',
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    /* eslint-enable */
    debugger  // eslint-disable-line no-debugger

    if (response.ok) {
      debugger  // eslint-disable-line no-debugger

    } else {
      console.log("BAR")
    }

  } catch (error) {
    debugger // eslint-disable-line no-debugger
  }
}
