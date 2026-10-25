export type BlogPost = {
  slug: string;
  // English URL under /en/blog; posts without one are Indonesian-only
  enSlug?: string;
  articleKey: string;
  // Card copy for the English listing when the English page uses a different article
  enArticleKey?: string;
  datePublished: string;
  dateModified: string;
  heroImage?: string;
  readTime: number;
};

export const blogPosts: BlogPost[] = [
  { slug: "/blog/dating-app-vs-biro-jodoh", enSlug: "/en/blog/dating-apps-vs-matchmaking", articleKey: "blogArticle.datingAppVsBiroJodoh", datePublished: "2026-10-25", dateModified: "2026-10-25", heroImage: "/images/blog/default-article-hero.png", readTime: 12 },
  { slug: "/blog/cara-kerja-jodohmu", enSlug: "/en/blog/how-jodohmu-works", articleKey: "blogArticle.caraKerjaJodohmu", datePublished: "2026-10-25", dateModified: "2026-10-25", heroImage: "/images/blog/apa-itu-jodohmu-hero.png", readTime: 13 },
  { slug: "/blog/perkenalan-pertama-dan-keluarga", enSlug: "/en/blog/first-introductions-and-family", articleKey: "blogArticle.perkenalanPertamaDanKeluarga", datePublished: "2026-10-25", dateModified: "2026-10-25", heroImage: "/images/blog/joble-hero.png", readTime: 12 },
  { slug: "/blog/apakah-biro-jodoh-menjamin-jodoh", enSlug: "/en/blog/does-a-matchmaker-guarantee-a-match", articleKey: "blogArticle.apakahBiroJodohMenjaminJodoh", datePublished: "2026-10-25", dateModified: "2026-10-25", heroImage: "/images/blog/apa-itu-jodohmu-hero-v2.png", readTime: 11 },
  { slug: "/blog/tren-menikah-dengan-wna", enSlug: "/en/blog/indonesian-women-marrying-foreigners", articleKey: "blogArticle.trenMenikahDenganWna", datePublished: "2026-10-23", dateModified: "2026-10-23", heroImage: "/images/blog/international-marriage-indonesia-hero.png", readTime: 12 },
  { slug: "/blog/cara-mencari-pasangan-hidup", enSlug: "/en/blog/how-to-find-a-life-partner", enArticleKey: "blogArticle.howToFindALifePartner", articleKey: "blogArticle.caraMencariPasanganHidup", datePublished: "2026-10-20", dateModified: "2026-10-20", heroImage: "/images/blog/default-article-hero.png", readTime: 12 },
  { slug: "/blog/stigma-janda-di-indonesia", enSlug: "/en/blog/widow-and-divorcee-stigma-in-indonesia", articleKey: "blogArticle.stigmaJandaDiIndonesia", datePublished: "2026-10-18", dateModified: "2026-10-18", heroImage: "/images/blog/stigma-janda-hero.png", readTime: 18 },
  { slug: "/blog/keuangan-muslim-amanah-rezeki", enSlug: "/en/blog/muslim-finances-amanah-and-rizq", articleKey: "blogArticle.keuanganMuslimAmanahRezeki", datePublished: "2026-08-27", dateModified: "2026-08-27", heroImage: "/images/blog/muslim-finance-hero-v1.png", readTime: 18 },
  { slug: "/blog/international-marriage-facilitation", enSlug: "/en/blog/international-marriage-facilitation", articleKey: "blogArticle.internationalMarriageFacilitation", datePublished: "2026-08-18", dateModified: "2026-08-18", heroImage: "/images/blog/international-marriage-indonesia-hero.png", readTime: 8 },
  { slug: "/blog/registrasi-jodohmu", enSlug: "/en/blog/jodohmu-registration", articleKey: "blogArticle.registrasiJodohmu", datePublished: "2026-08-06", dateModified: "2026-08-06", heroImage: "/images/blog/registrasi-jodohmu-hero-v5.png", readTime: 5 },
  { slug: "/blog/apa-itu-jodohmu", enSlug: "/en/blog/what-is-jodohmu", articleKey: "blogArticle.apaItuJodohmu", datePublished: "2026-08-05", dateModified: "2026-08-05", heroImage: "/images/blog/apa-itu-jodohmu-hero-v4.png", readTime: 10 },
  { slug: "/blog/paket-diamond-jodohmu", enSlug: "/en/blog/jodohmu-diamond-package", articleKey: "blogArticle.paketDiamondJodohmu", datePublished: "2026-08-04", dateModified: "2026-08-04", heroImage: "/images/blog/diamond-joble-hero.png", readTime: 12 },
  { slug: "/blog/paket-ruby-jodohmu", enSlug: "/en/blog/jodohmu-ruby-package", articleKey: "blogArticle.paketRubyJodohmu", datePublished: "2026-08-04", dateModified: "2026-08-04", heroImage: "/images/blog/ruby-joble-hero-v2.png", readTime: 11 },
  {
    slug: "/blog/paket-pearl-jodohmu",
    enSlug: "/en/blog/jodohmu-pearl-package",
    articleKey: "blogArticle.paketPearlJodohmu",
    datePublished: "2026-08-04",
    dateModified: "2026-08-04",
    heroImage: "/images/blog/pearl-joble-hero.png",
    readTime: 12,
  },
  {
    slug: "/blog/joble-jodohmu-table",
    enSlug: "/en/blog/joble-jodohmu-table",
    articleKey: "blogArticle.jobleJodohmuTable",
    datePublished: "2026-08-01",
    dateModified: "2026-08-01",
    heroImage: "/images/blog/joble-hero.png",
    readTime: 8,
  },
];

export const getRelatedPosts = (currentSlug: string, count = 3, lang: "id" | "en" = "id"): BlogPost[] => {
  const pool = lang === "en" ? blogPosts.filter((post) => post.enSlug) : blogPosts;
  const others = pool.filter((post) => post.slug !== currentSlug);
  const startIndex = pool.findIndex((post) => post.slug === currentSlug);
  const rotated = [
    ...others.slice(startIndex % others.length),
    ...others.slice(0, startIndex % others.length),
  ];
  return rotated.slice(0, count);
};
