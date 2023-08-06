import { createBlobs, createBranch, createCommit, createTree, getBranchSha, getSHA, octo, updateCommitRef } from "./github";
import { generateBlogObject, generatePreviewBlogObject, handleImageUpload, placeImagesOnDom } from "./blog";
import type { GithubObject } from "./github";
import type { ImageType } from "./blog";

const IMAGES_PATH = "images";

function handlePreviewGeneration(event: Event): void {
  event.preventDefault();

  let imageFiles: FileList | undefined;
  const imageUpload = <HTMLInputElement>document.getElementById("image-upload");

  // Get the images, if any
  if (imageUpload) {
    placeImagesOnDom({ imageUpload });
  }

  const contentTextArea = <HTMLTextAreaElement>document.getElementById("content");
  const previewElement = <HTMLTextAreaElement>document.getElementById("preview");
  const content: string[] = [];
  const stringContent = contentTextArea.value;

  if (!previewElement) {
    console.error("Preview element was not found");
    return
  }

  if (stringContent) {
    stringContent.split("\n").forEach((line) => {
      if (line.length > 0) content.push(line);
    })

    const blogObject = generatePreviewBlogObject({ content, imageFiles });

    if (blogObject) {
      previewElement.innerHTML = blogObject.content;
    } else {
      console.error("Error generating preview blog content");
    }
  } else {
    previewElement.innerHTML = `
        <div>
          WHOOPSIES
        </div>
      `
  }
}

function handleBlogGeneration(event: Event): void {
  event.preventDefault();

  let imageFiles: FileList | undefined;
  const imageUpload = <HTMLInputElement>document.getElementById("image-upload");

  // Get the images, if any
  if (imageUpload && imageUpload.files && imageUpload.files.length > 0) {
    imageFiles = imageUpload.files;
  }

  const contentTextArea = <HTMLTextAreaElement>document.getElementById("content");
  const unParsedContent: string[] = [];
  const stringContent = contentTextArea.value;

  if (stringContent) {
    stringContent.split("\n").forEach((line) => {
      if (line.length > 0) unParsedContent.push(line);
    })
  } else {
    console.error("Error getting content from textarea");
  }

  return void (async () => {
    const blogObject = await generateBlogObject({ content: unParsedContent, imageFiles, preview: false });

    if (!blogObject) {
      console.error("Error generating the blog object");
      return;
    }

    const { content, branchName, images } = blogObject;

    const dataElement = <HTMLPreElement>document.getElementById("data");

    dataElement.innerHTML = content;

    const sha = await getSHA();

    if (!sha) {
      console.error("Error generating sha");
      return;
    }

    const branchSha = await createBranch({ name: branchName, sha });

    if (!branchSha) {
      console.error("Error generating branchSha");
      return;
    }

    const pageObject: GithubObject = {
      content,
      filepath: `blog/${branchName}/index.html`
    };

    // TODO: work on this
    // const indexUpdate = "";

    // const imageElements = document.getElementsByTagName("img");

    // const imageObjects = Array.prototype.map.call(imageElements, (imgEle: HTMLImageElement) => {
    //   return {
    //     filepath: `${IMAGES_PATH}/${imgEle.dataset.filename}`,
    //     // TODO: hacky way to split the base64 heading from the actual base64
    //     content: imgEle.src.split(',')[1]
    //   };
    // }) as GithubObject[];

    let imageObjects = [] as GithubObject[];

    if (images) {
      imageObjects = images.map((image: ImageType) => {
        return {
          filepath: `${IMAGES_PATH}/${image.filename}`,
          content: image.content
        };
      }) as GithubObject[];
    }

    const treeObjects = await createBlobs({ imageObjects, pageObject });

    if (treeObjects && treeObjects.length > 0) {
      const treeSha = await createTree({ treeObjects, base_tree: branchSha })

      if (treeSha) {
        const commitSha = await createCommit({ tree: treeSha, message: "test commit", parents: [branchSha] })

        if (commitSha) {
          await updateCommitRef({ sha: commitSha, branch: branchName })
        }
      }
    }
  })()
}

// TODO: refactor this
// addEventListeners to the DOM elements 
document.addEventListener("DOMContentLoaded", () => {
  const generatePreviewButton = <HTMLButtonElement>document.getElementById("generate-preview");
  generatePreviewButton.addEventListener("click", handlePreviewGeneration);

  const generateBlogButtonObject = <HTMLButtonElement>document.getElementById("generate-blog");
  generateBlogButtonObject.addEventListener("click", handleBlogGeneration);

  const imageUpload = <HTMLInputElement>document.getElementById("image-upload");
  imageUpload.addEventListener("change", handleImageUpload);
})
