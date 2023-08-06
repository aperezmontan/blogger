type ParamsType = {
  title: string;
  titleImageFilename: string;
  subtitle: string;
  tldr: string;
  folderName: string;
  year: number;
  blogContent: string;
  dateString: string;
  isoTime: string;
}

type BlogObject = {
  content: string;
  branchName: string;
  images?: ImageType[]
}

export type ImageType = {
  filename: string;
  content?: string;
}

const IMAGE_PLACEHOLDER = "_image_"
const STATIC_PLACEHOLDER = "_static_";

function readUploadedImage({ imageFile }: { imageFile: File }) {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onerror = () => {
      reader.abort();
      reject(new DOMException("Problem parsing input file."));
    };

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.readAsDataURL(imageFile);
  });
}

function readImages({ imageFiles, folderName }: { imageFiles: FileList, folderName: string }): Promise<ImageType[]> {
  return Promise.all(Array.from(imageFiles).map(async (imageFile, index) => {
    const fileNameExtension = imageFile.name.split('.').pop();
    let filename = `${folderName}-${index + 1}.${fileNameExtension}`;

    if (index == 0) {
      filename = `${folderName}-title-image.${fileNameExtension}`;
    }

    try {
      const base64Result = await readUploadedImage({ imageFile }) as string;

      return {
        filename,
        content: base64Result.split(',')[1]
      }
    } catch (error) {
      console.error(error);

      return {
        filename,
      } as ImageType
    }
  }))
}

export async function generateBlogObject({ content, imageFiles, preview = true }: { content: string[], imageFiles?: FileList, preview?: boolean }): Promise<BlogObject> {
  const params = generateParams({ content, imageFiles, preview });
  const generatedContent = blogTemplate(params);
  let images = [] as ImageType[];

  if (imageFiles) {
    images = await readImages({ imageFiles, folderName: params.folderName });
  }

  return {
    content: generatedContent,
    branchName: params.folderName,
    images
  } as BlogObject;
}

export function generatePreviewBlogObject({ content, preview = true }: { content: string[], imageFiles?: FileList, preview?: boolean }): BlogObject {
  const params = generateParams({ content, preview });
  const generatedContent = blogTemplate(params);

  return {
    content: generatedContent,
    branchName: params.folderName
  } as BlogObject;
}

export function placeImagesOnDom({ imageUpload }: { imageUpload: HTMLInputElement }): void {
  let uploadedImagesTableHTML = "";

  if (imageUpload.files !== null) {
    Array.from(imageUpload.files).forEach((file, index) => {
      const fr = new FileReader();
      const filename = file.name;
      const title = `${IMAGE_PLACEHOLDER}${index + 1}`;

      if (index === 0) {
        uploadedImagesTableHTML = `${uploadedImagesTableHTML}<div>${filename} ➡️ TITLE IMAGE</div>`
      } else {
        uploadedImagesTableHTML = `${uploadedImagesTableHTML}<div>${filename} ➡️ ${title}</div>`
      }

      fr.readAsDataURL(file);
      fr.addEventListener("load", () => {
        const content = fr.result as string;
        let img = <HTMLImageElement>document.getElementById(title);

        if (index === 0) {
          img = <HTMLImageElement>document.getElementById("title-image");
        }

        if (img && content) {
          img.src = content;
          // Use this to get the filename for the upload
          img.dataset.filename = filename;
        } else {
          console.error("There's something wrong with either the image upload or there is no place for it in the textarea")
        }
      });
    });

    // Add table to the DOM
    const uploadedImagesTable = <HTMLDivElement>document.getElementById("uploaded-images-table")
    uploadedImagesTable.innerHTML = uploadedImagesTableHTML;
  } else {
    console.error("Image upload files is null");
  }
}

export function handleImageUpload(event: Event): void {
  const imageUpload = event.target as HTMLInputElement;
  placeImagesOnDom({ imageUpload })
}

function generateParams({ content, imageFiles, preview, date = new Date() }: { content: string[], imageFiles?: FileList, preview: boolean, date?: Date }): ParamsType {
  const titleImageFileExtension = imageFiles && imageFiles.length > 0 ? imageFiles[0].name.split('.').pop() : "";
  const title = content[0];
  const subtitle = content[1];
  const tldr = content[2];
  const folderName = title.replace(/[^a-z0-9\s]/gi, '').split(" ").join("_").toLowerCase();
  const titleImageFilename = `${folderName}-title-image.${titleImageFileExtension}`;
  const year = date.getFullYear();
  const blogContent = generateBlogContent({ content, imageFiles, folderName, preview })
  const dateString = date.toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" });
  const isoTime = date.toISOString();

  return {
    title,
    titleImageFilename,
    subtitle,
    tldr,
    folderName,
    year,
    blogContent,
    dateString,
    isoTime,
  } as ParamsType
}

function generateBlogContent({ content, imageFiles, folderName, preview }: { content: string[], imageFiles?: FileList, folderName: string, preview: boolean }): string {
  return content.slice(3).map((line) => {
    if (line.includes(IMAGE_PLACEHOLDER)) {
      const imageNumber = line.split("_").pop()?.trim();
      const imgId = preview ? `${IMAGE_PLACEHOLDER}${imageNumber}` : `image-${folderName}-${imageNumber}`;
      const fileNameExtension = imageFiles && imageNumber ? imageFiles[parseInt(imageNumber) - 1].name.split('.').pop() : "";

      return (
        `      
          <div>
            <img
              id="${imgId}"
              class="blog-content-image"
              src="/images/${folderName}-${imageNumber}.${fileNameExtension}"
              alt="image-${folderName}-${imageNumber}"
            />
          </div>
        `
      )
    } else if (line.includes(STATIC_PLACEHOLDER)) {
      return line.replaceAll(STATIC_PLACEHOLDER, "").trim();
    } else {
      return (
        `      
          <p>
            ${line}
          </p>
        `
      )
    }
  }).join("")
}

function blogTemplate({
  title,
  titleImageFilename,
  subtitle,
  tldr,
  folderName,
  year,
  blogContent,
  dateString,
  isoTime
}: ParamsType): string {
  return (
    `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <title>${title}</title>

          <meta name="description" content="" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="HandheldFriendly" content="True" />

          <meta property="og:image" content="/images/${titleImageFilename}" />
          <meta property="og:logo" content="/images/favicon.ico" />
          <meta name="referrer" content="no-referrer-when-downgrade" />
          <meta property="og:site_name" content="aperezmontan.github.io (aalazy)" />
          <meta property="og:type" content="article" />
          <meta property="og:title" content="${title}" />
          <meta
            property="og:description"
            content="${tldr}"
          />
          <meta property="og:url" content="/blog/${folderName}/" />

          <meta
            property="article:published_time"
            content="${isoTime}"
          />
          <meta property="article:modified_time" content="${isoTime}" />
          
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@aris_s_pieces" />
          <meta name="twitter:creator" content="@aris_s_pieces" />
          <meta name="twitter:title" content="${title}" />
          <meta name="twitter:description" content="${tldr}" />
          <meta
            name="twitter:image"
            content="https://aperezmontan.github.io/images/${titleImageFilename}"
          />
          <meta name="twitter:image:alt" content="${subtitle}" />
          <meta
            name="twitter:url"
            content="aperezmontan.github.io/blog/${folderName}/"
          />

          <link rel="icon" type="image/x-icon" href="/images/favicon.ico" />
          <link rel="stylesheet" type="text/css" href="/main.css" />
          <link rel="canonical" href="/blog/${folderName}/" />
        </head>
        <body>
          <header>
            <div class="blog-header-container">
              <a href="/blog" class="home-page-link">⬅️ blog</a>
              <div class="blog-title">
                <h1 class="title-name">${title}</h1>
                <div>
                  <img
                    id="title-image"
                    class="blog-content-image"
                    src="/images/${titleImageFilename}"
                    alt="${title} TITLE IMAGE"
                  />
                </div>
                <h3 class="subtitle">${subtitle}</h3>
                <h5 class="title-date">${dateString}</h5>
              </div>
            </div>
          </header>
          <main>
            <div class="blog main-container">
              <div class="blog-tldr">
                ${tldr}
              </div>
              <div class="blog-content">
                ${blogContent}
              </div>
            </div>
          </main>

          <footer>
            <p>ikn, The Bronx, ${year}</p>
            <p>#stayhumble</p>
          </footer>
        </body>
      </html>
    `
  )
}
