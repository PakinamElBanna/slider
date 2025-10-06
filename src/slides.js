const slides = [
  "/images/image0.jpg",
  "/images/image1.jpg",
  "/images/image2.jpg",
  "/images/image3.jpg",
];

const collator = Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

export const slideUrls = slides.sort((a, b) => collator.compare(a, b));
