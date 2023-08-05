import { createBlobs, createBranch, createCommit, createTree, getBranchSha, getSHA, octo, updateCommitRef } from "./github";
import generateBlogContent, { generateBlogPreview } from "./blog";
import type { GithubObject } from "./github";

const IMAGES_PATH = "images"

function generatePreview(event: Event): void {
  event.preventDefault();

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

    const previewContent = generateBlogPreview({ content });
    previewElement.innerHTML = previewContent;
  } else {
    previewElement.innerHTML = `
        <div>
          WHOOPSIES
        </div>
      `
  }
}

function generateBlog(): void {
  return void (async () => {
    const branch = 'test';
    debugger
    // const sha = await getSHA();

    // if (sha) {
    //   const branchSha = await createBranch({ name: branch, sha });

    //   if (branchSha) {
    //     const pageObject: GithubObject = {
    //       content: preview({content}),
    //       filepath: `blog/${branch}/index.html`
    //     };

    //     // TODO: work on this
    //     // const indexUpdate = "";

    //     const imageElements = document.getElementsByTagName("img");
    //     // const titleImage = <HTMLImageElement>document.getElementById("title-image");

    //     const imageObjects = Array.prototype.map.call(imageElements, (imgEle: HTMLImageElement) => {
    //       return {
    //         filepath: `images/${imgEle.dataset.filename}`,
    //         // TODO: hacky way to split the base64 heading from the actual base64
    //         content: imgEle.src.split(',')[1]
    //       };
    //     }) as GithubObject[];

    //     const treeObjects = await createBlobs({ imageObjects, pageObject });

    //     if (treeObjects && treeObjects.length > 0) {
    //       const treeSha = await createTree({ treeObjects, base_tree: branchSha })

    //       if (treeSha) {
    //         const commitSha = await createCommit({ tree: treeSha, message: "test commit", parents: [branchSha] })

    //         if (commitSha) {
    //           const final = await updateCommitRef({ sha: commitSha, branch })
    //         }
    //       }
    //     }
    //   }
    // }
  })()
}

function uploadImage(event: Event): void {
  const imageUpload = event.target as HTMLInputElement;

  if (imageUpload.files !== null) {
    Array.from(imageUpload.files).forEach((file, index) => {
      const fr = new FileReader();
      const title = `image-${index + 1}`;

      fr.readAsDataURL(file);

      fr.addEventListener("load", () => {
        const content = fr.result as string;
        console.log(title)
        let img = <HTMLImageElement>document.getElementById(title);

        if (index === 0) {
          img = <HTMLImageElement>document.getElementById("title-image");
        }

        if (img && content) {
          img.src = content;
          // Use this to get the filename for the upload
          img.dataset.filename = file.name;
        } else {
          console.error("There's something wrong with either the image upload element or the content for the upload")
        }
      });
    });
  } else {
    console.error("Image upload files is null");
  }
}

// TODO: refactor this
// addEventListeners to the DOM elements 
document.addEventListener("DOMContentLoaded", () => {

  const generatePreviewButton = <HTMLButtonElement>document.getElementById("generate-preview");
  generatePreviewButton.addEventListener("click", generatePreview);

  const generateBlogButton = <HTMLButtonElement>document.getElementById("generate-blog");
  generateBlogButton.addEventListener("click", generateBlog);

  const imageUpload = <HTMLInputElement>document.getElementById("image-upload");
  imageUpload.addEventListener("change", uploadImage);
})
