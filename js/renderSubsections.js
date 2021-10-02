// Get the current page the user is on
const pathname = window.location.pathname;
let classname;

if (pathname.includes('cn')) {
  classname = pathname.replace('/cn/', '.').replaceAll('/', '-');
} else {
  classname = pathname.replace('/', '.').replaceAll('/', '-');
}

if (classname !== '.') {
  const section = document.querySelector(classname);

  // Get the div to append the subsection cards to
  const wrapper = document.querySelector('.subsection-wrapper');

  // Append the cards
  const appendCards = (section) => {
    const href = section.href;
    const title = section.innerText;
    let image = href.split('/').slice(3, -1).join('/').toLowerCase();
    let imagePath = `/images/index-pages/${image}.png`;

    // Modify the image paths so that it uses the absolute path
    if (pathname.includes('cn')) {
      image = image.replace('cn/', '');
      imagePath = imagePath.replace('cn/', '');
    }

    wrapper.innerHTML += `
    <div class="card">
      <a href=${href}>
        <h2 class="title">${title}</h2>
        <img class="icon" src="${imagePath}" onerror="this.src='/images/index-pages/blank.png'; this.onerror = null">
      </a>
    </div>
    `;
  };

  if (section && section.children) {
    for (subsection of section.children) {
      // If it's a directory and is nested, we'll need to dig deeper to get the information for each nav item
      if (subsection.classList.contains('md-nav__item--nested')) {
        appendCards(subsection.children[1].children[1]);
      } else {
        appendCards(subsection.children[0]);
      }
    }
  }
}