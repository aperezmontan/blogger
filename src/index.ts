import { octo } from "./github";
import preview from "./blog";

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

    const previewContent = preview({ content });
    previewElement.innerHTML = previewContent;
  } else {
    previewElement.innerHTML = `
        <div>
          WHOOPSIES
        </div>
      `
  }
}

// TODO: refactor this
// addEventListeners to the DOM elements 
document.addEventListener("DOMContentLoaded", () => {
  const generatePreviewButton = <HTMLButtonElement>document.getElementById("generate-preview");
  generatePreviewButton.addEventListener("click", generatePreview);

  const imageUpload = <HTMLInputElement>document.getElementById("image-upload");
  imageUpload.addEventListener("change", () => {
    if (imageUpload.files !== null) {
      Array.from(imageUpload.files).forEach((file, index) => {
        const fr = new FileReader();
        const title = `image-${index + 1}`;

        fr.readAsDataURL(file);

        fr.addEventListener("load", () => {
          void (async () => {
            const content = fr.result as string;
            console.log(title)
            let img = <HTMLImageElement>document.getElementById(title);

            if (index === 0) {
              img = <HTMLImageElement>document.getElementById("title-image");
            }

            if (img && content) {
              img.src = content;
              try {
                // TODO: hacky way to split the base64 heading from the actual base64
                await octo({ path: `${IMAGES_PATH}/${file.name}`, title, content: content.split(',')[1] });
              } catch (error) {
                console.error(error)
              }
            } else {
              console.error("There's something wrong with either the image upload element or the content for the upload")
            }
          })()
        });
      });
    } else {
      console.error("Image upload files is null");
    }
  });
})
