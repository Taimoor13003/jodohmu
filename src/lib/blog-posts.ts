export type BlogPost = {
  slug: string;
  articleKey: string;
  datePublished: string;
  dateModified: string;
  heroImage?: string;
  readTime: number;
};

export const blogPosts: BlogPost[] = [
  { slug: "/blog/paket-diamond-jodohmu", articleKey: "blogArticle.paketDiamondJodohmu", datePublished: "2026-08-04", dateModified: "2026-08-04", heroImage: "/images/blog/diamond-joble-hero.png", readTime: 12 },
  { slug: "/blog/paket-ruby-jodohmu", articleKey: "blogArticle.paketRubyJodohmu", datePublished: "2026-08-04", dateModified: "2026-08-04", heroImage: "/images/blog/ruby-joble-hero-v2.png", readTime: 11 },
  {
    slug: "/blog/paket-pearl-jodohmu",
    articleKey: "blogArticle.paketPearlJodohmu",
    datePublished: "2026-08-04",
    dateModified: "2026-08-04",
    heroImage: "/images/blog/pearl-joble-hero.png",
    readTime: 12,
  },
  {
    slug: "/blog/joble-jodohmu-table",
    articleKey: "blogArticle.jobleJodohmuTable",
    datePublished: "2026-08-01",
    dateModified: "2026-08-01",
    heroImage: "/images/blog/joble-hero.png",
    readTime: 8,
  },
  {
    slug: "/blog/cari-jodoh-serius",
    articleKey: "blogArticle.cariJodohSerius",
    datePublished: "2025-05-20",
    dateModified: "2025-05-20",
    heroImage: "/og/cari-jodoh-serius.png",
    readTime: 5,
  },
  {
    slug: "/blog/perjodohan-halal-vs-dating-app",
    articleKey: "blogArticle.perjodohanHalalVsDatingApp",
    datePublished: "2025-05-20",
    dateModified: "2025-05-20",
    heroImage: "/og/perjodohan-halal-vs-dating-app.png",
    readTime: 6,
  },
  {
    slug: "/blog/tips-taaruf-pertama",
    articleKey: "blogArticle.tipsTaarufPertama",
    datePublished: "2025-05-20",
    dateModified: "2025-05-20",
    heroImage: "/og/tips-taaruf-pertama.png",
    readTime: 5,
  },
  {
    slug: "/blog/step-by-step-process",
    articleKey: "blogArticle.stepByStepProcess",
    datePublished: "2024-11-20",
    dateModified: "2025-01-20",
    heroImage: "/og/step-by-step-process.png",
    readTime: 6,
  },
  {
    slug: "/blog/why-dating-apps-fail",
    articleKey: "blogArticle.whyDatingAppsFail",
    datePublished: "2024-12-01",
    dateModified: "2025-01-20",
    heroImage: "/og/why-dating-apps-fail.png",
    readTime: 5,
  },
  {
    slug: "/blog/family-involvement",
    articleKey: "blogArticle.familyInvolvement",
    datePublished: "2024-11-25",
    dateModified: "2025-01-20",
    heroImage: "/og/family-involvement.png",
    readTime: 5,
  },
  {
    slug: "/blog/how-meetings-are-supervised",
    articleKey: "blogArticle.howMeetingsAreSupervised",
    datePublished: "2024-11-28",
    dateModified: "2025-01-20",
    heroImage: "/og/how-meetings-are-supervised.png",
    readTime: 5,
  },
  {
    slug: "/blog/syariah-safeguards",
    articleKey: "blogArticle.syariahSafeguards",
    datePublished: "2024-11-22",
    dateModified: "2025-01-20",
    heroImage: "/og/syariah-safeguards.png",
    readTime: 5,
  },
  {
    slug: "/blog/does-jodohmu-guarantee-a-match",
    articleKey: "blogArticle.doesJodohmuGuaranteeMatch",
    datePublished: "2026-06-07",
    dateModified: "2026-06-07",
    heroImage: "/og/does-jodohmu-guarantee-a-match.png",
    readTime: 4,
  },
  {
    slug: "/blog/what-makes-taaruf-different-from-dating",
    articleKey: "blogArticle.whatMakesTaarufDifferent",
    datePublished: "2026-06-07",
    dateModified: "2026-06-07",
    heroImage: "/og/what-makes-taaruf-different-from-dating.png",
    readTime: 6,
  },
  {
    slug: "/blog/how-we-verify-every-candidate",
    articleKey: "blogArticle.howWeVerifyEveryCandidate",
    datePublished: "2026-06-07",
    dateModified: "2026-06-07",
    heroImage: "/og/how-we-verify-every-candidate.png",
    readTime: 5,
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
