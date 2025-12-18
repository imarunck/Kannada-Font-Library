fetch("/includes/footer.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("global-footer").innerHTML = html;

    // auto year
    const yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  })
  .catch(err => {
    console.error("Footer failed to load", err);
  });


  document.querySelectorAll(".footer-nav a").forEach(link => {
  if (link.href === location.href) {
    link.style.textDecoration = "underline";
  }
});
