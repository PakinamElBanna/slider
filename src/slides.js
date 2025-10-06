const slides = [
  "/images/image2.jpg",
  "/images/image2.jpg",
  "/images/image3.jpg",
  "/images/image4.jpg",
];

const collator = Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

export const slideUrls = slides.sort((a, b) => collator.compare(a, b));
