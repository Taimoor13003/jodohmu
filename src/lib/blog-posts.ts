export type BlogPost = {
  slug: string;
  articleKey: string;
  datePublished: string;
  dateModified: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "/blog/cari-jodoh-serius",
    articleKey: "blogArticle.cariJodohSerius",
    datePublished: "2025-05-20",
    dateModified: "2025-05-20",
  },
  {
    slug: "/blog/perjodohan-halal-vs-dating-app",
    articleKey: "blogArticle.perjodohanHalalVsDatingApp",
    datePublished: "2025-05-20",
    dateModified: "2025-05-20",
  },
  {
    slug: "/blog/tips-taaruf-pertama",
    articleKey: "blogArticle.tipsTaarufPertama",
    datePublished: "2025-05-20",
    dateModified: "2025-05-20",
  },
  {
    slug: "/blog/step-by-step-process",
    articleKey: "blogArticle.stepByStepProcess",
    datePublished: "2024-11-20",
    dateModified: "2025-01-20",
  },
  {
    slug: "/blog/why-dating-apps-fail",
    articleKey: "blogArticle.whyDatingAppsFail",
    datePublished: "2024-12-01",
    dateModified: "2025-01-20",
  },
  {
    slug: "/blog/family-involvement",
    articleKey: "blogArticle.familyInvolvement",
    datePublished: "2024-11-25",
    dateModified: "2025-01-20",
  },
  {
    slug: "/blog/how-meetings-are-supervised",
    articleKey: "blogArticle.howMeetingsAreSupervised",
    datePublished: "2024-11-28",
    dateModified: "2025-01-20",
  },
  {
    slug: "/blog/syariah-safeguards",
    articleKey: "blogArticle.syariahSafeguards",
    datePublished: "2024-11-22",
    dateModified: "2025-01-20",
  },
];

export const getRelatedPosts = (currentSlug: string, count = 3): BlogPost[] => {
  const others = blogPosts.filter((post) => post.slug !== currentSlug);
  const startIndex = blogPosts.findIndex((post) => post.slug === currentSlug);
  const rotated = [
    ...others.slice(startIndex % others.length),
    ...others.slice(0, startIndex % others.length),
  ];
  return rotated.slice(0, count);
};
