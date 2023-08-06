import { Octokit } from "octokit";

export type GithubObject = {
  filepath: string;
  content: string;
}

// Octokit

// 1. TODO: Need to update the blog/index.html file with the new blog post link; TODO: Let's wait on this for version 2 as it might be somewhat involved;
// 2. Need to update the blog folder with a new folder containing the blog post content; 
// 3. Need to update the images folder with any new images that are referenced in the new blog post;

const OWNER = "aperezmontan";
const REPO = "aperezmontan.github.io";
const BLOG_PATH = "blog";
const BLOG_INDEX_PATH = `${BLOG_PATH}/index.html`;

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
      dataElement.innerHTML = JSON.stringify(response.data, null, 2);
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
      dataElement.innerHTML = JSON.stringify(response.data, null, 2);
      return response.data.object.sha;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function createBlobs({ imageObjects, pageObject }: { imageObjects: GithubObject[], pageObject: GithubObject }): Promise<TreeObject[] | void> {
  const blobShas = [] as TreeObject[];

  // TODO: try to make async concurrent requests here to speed this up

  try {
    // NOTE: Disabling linting errors on third party libraries (octokit)
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    const pageResponse = await octokit.request(`POST /repos/${OWNER}/${REPO}/git/blobs`, {
      owner: 'OWNER',
      repo: 'REPO',
      content: pageObject.content,
      encoding: 'utf-8',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    if (pageResponse) {
      // TODO: make response a response type with a key of status and value of number
      // and key of data with value array
      dataElement.innerHTML = JSON.stringify(pageResponse.data, null, 2);
      // NOTE!!: Here the sha is NOT nested in the object (BRUTAL)
      blobShas.push({ sha: pageResponse.data.sha, filepath: pageObject.filepath });
    }

    for (const imgObj of imageObjects) {
      const imageResponse = await octokit.request(`POST /repos/${OWNER}/${REPO}/git/blobs`, {
        owner: 'OWNER',
        repo: 'REPO',
        content: imgObj.content,
        encoding: 'base64',
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })

      if (imageResponse) {
        // TODO: make response a response type with a key of status and value of number
        // and key of data with value array
        dataElement.innerHTML = JSON.stringify(imageResponse.data, null, 2);
        // NOTE!!: Here the sha is NOT nested in the object (BRUTAL)
        blobShas.push({ sha: imageResponse.data.sha, filepath: imgObj.filepath });
      }
    }

    /* eslint-enable */

    return blobShas;
  } catch (error) {
    console.error(error);
  }
}

export type TreeObject = {
  sha: string;
  filepath: string;
}

type TreeStructureObject = {
  mode: string;
  path: string;
  sha: string;
  type: string;
}

const FILE_MODE = '100644';
const BLOB_TYPE = 'blob';

export async function createTree({ treeObjects, base_tree }: { treeObjects: TreeObject[], base_tree: string }): Promise<string | void> {
  const tree = treeObjects.map(treeObj => {
    return {
      mode: FILE_MODE,
      path: treeObj.filepath,
      sha: treeObj.sha,
      type: BLOB_TYPE
    }
  }) as TreeStructureObject[]

  try {
    // NOTE: Disabling linting errors on third party libraries (octokit)
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    const response = await octokit.request(`POST /repos/${OWNER}/${REPO}/git/trees`, {
      owner: 'OWNER',
      repo: 'REPO',
      base_tree,
      tree,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    /* eslint-enable */

    // TODO: make response a response type with a key of status and value of number
    // and key of data with value array
    if (response && response.status === 201 && dataElement) {
      dataElement.innerHTML = JSON.stringify(response.data, null, 2);
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
      dataElement.innerHTML = JSON.stringify(response.data, null, 2);
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
    if (response && response.status === 200 && dataElement) {
      dataElement.innerHTML = JSON.stringify(response.data, null, 2);
      return response.data.object.sha;
    }
  } catch (error) {
    console.error(error);
  }
}
