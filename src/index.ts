function pageTemplate({ content, date = new Date() }: { content: string[], date?: Date }) {
  const title = content[0];
  const subtitle = content[1];
  const tldr = content[2];
  const filename = title.replace(/(\r\n|\n|\r)/gm, "").split(" ").join("_")
  const year = date.getFullYear();
  const blogContent = content.slice(3).map((line) => {
    return (
      `      
        <p>
          ${line}
        </p>
      `
    )
  }).join("")
  const dateString = date.toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" });
  const isoTime = date.toISOString();

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

          <meta property="og:image" content="/images/${filename}.jpg" />
          <meta property="og:logo" content="/images/favicon.ico" />
          <meta name="referrer" content="no-referrer-when-downgrade" />
          <meta property="og:site_name" content="aperezmontan.github.io (aalazy)" />
          <meta property="og:type" content="article" />
          <meta property="og:title" content="${title}" />
          <meta
            property="og:description"
            content="${tldr}"
          />
          <meta property="og:url" content="/blog/${filename}/" />

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
            content="https://aperezmontan.github.io/images/${filename}.jpg"
          />
          <meta name="twitter:image:alt" content="${subtitle}" />
          <meta
            name="twitter:url"
            content="aperezmontan.github.io/blog/${filename}/"
          />

          <link rel="icon" type="image/x-icon" href="/images/favicon.ico" />
          <link rel="stylesheet" type="text/css" href="/main.css" />
          <link rel="canonical" href="/blog/${filename}/" />
        </head>
        <body>
          <header>
            <div class="blog-header-container">
              <a href="/blog" class="home-page-link">⬅️ blog</a>
              <div class="blog-title">
                <h1 class="title-name">${title}</h1>
                <div>
                  <img
                    class="blog-content-image"
                    src="/images/${filename}.jpg"
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

function generatePreview(event: Event): void {
  const previewElement = document.getElementById("preview");
  let content: string[] = [];
  const textAreaTarget = event.target as HTMLTextAreaElement;
  const stringContent = textAreaTarget.value;

  if (!previewElement) {
    console.error("Preview element was not found");
    return
  }

  if (stringContent) {
    stringContent.split("\n").forEach((line) => {
      if (line.length > 0) content.push(line);
    })

    const previewContent = pageTemplate({ content });
    previewElement.innerHTML = previewContent;
  } else {
    previewElement.innerHTML = `
        <div>
          WHOOPSIES
        </div>
      `
  }

}

// addEventListeners to the DOM elements 
document.addEventListener("DOMContentLoaded", () => {
  const contentTextArea = <HTMLTextAreaElement>document.getElementById("content");
  contentTextArea.addEventListener("change", generatePreview);
})
