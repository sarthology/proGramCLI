const generator = (profile, feed) => {
	return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>proGram</title>
      <link rel="stylesheet" href="css/instagram.min.css" />
      <link rel="stylesheet" href="css/style.css" />
    </head>
    <body>
      <header>
        <div class="title">
          <h1>proGram</h1>
        </div>
      </header>
      <div class="profile">
        <div class="picture">
          <img src="${profile.profilePic}" alt="" />
        </div>
        <div class="details">
          <h1>${profile.name}</h1>
          <h4>${profile.username}</h4>
          <div class="bio">
            <p>${profile.bio}</p>
          </div>
        </div>
      </div>
      <div class="divider"></div>

      <div class="proto-graph">
        ${feed.map(
					post => `<div class="program">
        <figure class="${post.filter}">
          <img src="${post.imagePath}" alt="" />
        </figure>
      </div>`
				)}
      </div>
    </body>
  </html>
  `;
};

module.exports = generator;
