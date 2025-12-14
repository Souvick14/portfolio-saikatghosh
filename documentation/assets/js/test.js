let a = document.getElementById('scrollindi');
const sectionIds = [
  "home",
  "instagram-reels",
  "clients-work",
  "achievements",
  "youtube",
  "blogs",
  "skills",
  "about",
  "ratings",
  "contact"
];

a.addEventListener('click', function() {
  const currentSectionId = getCurrentSectionId();
  const currentIndex = sectionIds.indexOf(currentSectionId);
  const nextIndex = (currentIndex + 1) % sectionIds.length;
  const nextSectionId = sectionIds[nextIndex];
  document.getElementById(nextSectionId).scrollIntoView({ behavior: 'smooth' });
});

function getCurrentSectionId() {
  const scrollPosition = window.scrollY + window.innerHeight / 2;
  for (let i = 0; i < sectionIds.length; i++) {
    const section = document.getElementById(sectionIds[i]);
    if (section.offsetTop <= scrollPosition && (section.offsetTop + section.offsetHeight) > scrollPosition) {
      return sectionIds[i];
    }
  }
  return sectionIds[0];
}