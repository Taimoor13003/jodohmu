"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, ChevronDown, Expand, Heart, Languages, MessageCircle, Settings2, ShieldCheck, SlidersHorizontal, UserRound, Users, Utensils, X } from "lucide-react";

type Lang = "id" | "en";
type Package = { name: string; label: string; window: string; price: string; description: string; features?: string[]; stages?: { stage: number; items: string[] }[]; includes?: string; accent: string; savings?: string };

const PRICES = { pearl: "Rp 2,5 juta", ruby: "Rp 15 juta", diamond: "Rp 40 juta" };
const ACCENTS = { pearl: "#2f7dd1", ruby: "#d92f63", diamond: "#8b6fe0", tailored: "#a88ae6" };

const PACKAGES: Record<Lang, { pearl: Package; ruby: Package; diamond: Package; tailored: Package }> = {
  id: {
    pearl: { name: "Pearl", label: "Langkah Awal", window: "3 bulan · registrasi termasuk", price: PRICES.pearl, accent: ACCENTS.pearl, description: "Langkah pertama menuju pernikahan yang berkomitmen, dengan pendampingan yang jelas dari awal.", stages: [{ stage: 1, items: ["Panggilan intake 60 menit bersama matchmaker (Dokcin) Anda"] }, { stage: 2, items: ["Profil Anda dibangun dan ditinjau oleh tim kami", "Verifikasi KTP & media sosial serta pendampingan tim"] }, { stage: 3, items: ["Update progres matchmaking setiap minggu"] }, { stage: 4, items: ["1 Pearl Joble dengan hidangan terpilih", "Bawa maksimal 1 pendamping tepercaya", "Pilih 1 fasilitator untuk Joble Anda"] }] },
    ruby: { name: "Ruby", label: "Paling Direkomendasikan", window: "6 bulan · registrasi termasuk", price: PRICES.ruby, accent: ACCENTS.ruby, description: "Berkomitmen, terstruktur, dan ditangani dengan penuh perhatian di setiap tahap.", stages: [{ stage: 1, items: ["Sesi wawancara mendalam 60 menit"] }, { stage: 2, items: ["Profil Anda dibangun, diverifikasi & dikelola oleh tim kami", "Verifikasi KTP, tempat kerja & slip gaji"] }, { stage: 3, items: ["Update progres mingguan dan sourcing kandidat aktif", "Penyesuaian berkelanjutan berdasarkan masukan Anda", "Koordinasi proses oleh tim Jodohmu"] }, { stage: 4, items: ["2 Joble Private dengan makan buffet", "Bawa maksimal 2 pendamping tepercaya dan pilih 1 fasilitator"] }, { stage: 5, items: ["1 tes psikologi klinis", "Background check menyeluruh", "1 fasilitasi pertemuan keluarga"] }] },
    diamond: { name: "Diamond", label: "Paling Menyeluruh", window: "12 bulan · sepenuhnya privat", price: PRICES.diamond, accent: ACCENTS.diamond, description: "Pendampingan paling menyeluruh dan privat, dipimpin langsung oleh matchmaker senior (Dokcin).", includes: "Semua layanan dalam Ruby, ditambah:", stages: [{ stage: 1, items: ["Strategi pencarian privat langsung bersama matchmaker senior (Dokcin) — menjangkau hingga ke luar pool Jodohmu", "Matchmaking concierge pribadi sebagai satu titik kontak", "Kapasitas klien terbatas untuk layanan yang fokus dan rahasia"] }, { stage: 2, items: ["Berbagi profil terkendali dan kerahasiaan ketat"] }, { stage: 3, items: ["Pendekatan diskret kepada kandidat yang belum terdaftar di Jodohmu", "Laporan pencarian rahasia setiap minggu", "Wawancara prioritas dan verifikasi mendalam kandidat terpilih"] }, { stage: 4, items: ["3 Joble Signature di hotel bintang 4 atau 5", "Makan buffet, maksimal 2 pendamping, dan 1 fasilitator di setiap Joble", "Fotografer dan videografer privat yang kami sediakan untuk momen istimewa Anda", "Debrief privat setelah setiap perkenalan"] }, { stage: 5, items: ["Hingga 3 sesi persiapan atau kompatibilitas bersama psikolog", "Fasilitasi pertemuan keluarga saat tepat"] }] },
    tailored: { name: "Sesuai kebutuhan Anda", label: "SESUAI KEBUTUHAN ANDA", window: "Dirancang sesuai keadaan Anda", price: "Investasi dibicarakan secara privat", description: "Solusi fleksibel yang dirancang sesuai tingkat pendampingan, waktu, dan dukungan yang Anda butuhkan.", features: ["Paket yang dirancang sesuai prioritas Anda", "Dukungan jelas di setiap tahap", "Percakapan privat untuk menyepakati cakupan yang tepat"], accent: ACCENTS.tailored },
  },
  en: {
    pearl: { name: "Pearl", label: "First Step", window: "3 months · registration included", price: PRICES.pearl, accent: ACCENTS.pearl, description: "A first step toward a committed marriage, with clear guidance from the very beginning.", stages: [{ stage: 1, items: ["60-minute intake call with your matchmaker (Dokcin)"] }, { stage: 2, items: ["Your profile built and reviewed by our team", "ID card & social media verification, with team support"] }, { stage: 3, items: ["Weekly matchmaking progress updates"] }, { stage: 4, items: ["1 Pearl Joble with a curated menu", "Bring up to 1 trusted chaperone", "Choose 1 facilitator for your Joble"] }] },
    ruby: { name: "Ruby", label: "Most Recommended", window: "6 months · registration included", price: PRICES.ruby, accent: ACCENTS.ruby, description: "Committed, structured, and handled with care at every stage.", stages: [{ stage: 1, items: ["60-minute in-depth interview session"] }, { stage: 2, items: ["Your profile built, verified & managed by our team", "ID card, workplace & payslip verification"] }, { stage: 3, items: ["Weekly progress updates and active candidate sourcing", "Ongoing adjustments based on your feedback", "Process coordination by the Jodohmu team"] }, { stage: 4, items: ["2 Private Jobles with buffet dining", "Bring up to 2 trusted chaperones and choose 1 facilitator"] }, { stage: 5, items: ["1 clinical psychology assessment", "Comprehensive background check", "1 facilitated family meeting"] }] },
    diamond: { name: "Diamond", label: "Most Comprehensive", window: "12 months · fully private", price: PRICES.diamond, accent: ACCENTS.diamond, description: "The most comprehensive and private guidance, led directly by a senior matchmaker (Dokcin).", includes: "Everything in Ruby, plus:", stages: [{ stage: 1, items: ["Private search strategy directly with your senior matchmaker (Dokcin) — reaching beyond the Jodohmu pool", "A personal matchmaking concierge as your single point of contact", "Limited client capacity for focused, confidential service"] }, { stage: 2, items: ["Controlled profile sharing and strict confidentiality"] }, { stage: 3, items: ["Discreet approaches to candidates not yet registered with Jodohmu", "Confidential search reports every week", "Priority interviews and in-depth verification of shortlisted candidates"] }, { stage: 4, items: ["3 Signature Jobles at 4- or 5-star hotels", "Buffet dining, up to 2 chaperones, and 1 facilitator at every Joble", "A private photographer and videographer arranged for your special moments", "A private debrief after every introduction"] }, { stage: 5, items: ["Up to 3 preparation or compatibility sessions with a psychologist", "Family meeting facilitation when the time is right"] }] },
    tailored: { name: "Tailored to you", label: "TAILORED TO YOU", window: "Shaped around your circumstances", price: "Investment discussed privately", description: "A flexible solution shaped around the level of guidance, time, and support you need.", features: ["A package shaped around your priorities", "Clear support at every stage", "A private conversation to agree the right scope"], accent: ACCENTS.tailored },
  },
};

type QasasVerse = { number: string; arabic: string; id: string; en: string };

const QASAS_VERSES: QasasVerse[] = [
  { number: "23", arabic: "وَلَمَّا وَرَدَ مَآءَ مَدْيَنَ وَجَدَ عَلَيْهِ أُمَّةٗ مِّنَ ٱلنَّاسِ يَسْقُونَ وَوَجَدَ مِن دُونِهِمُ ٱمْرَأَتَيْنِ تَذُودَانِۖ قَالَ مَا خَطْبُكُمَاۖ قَالَتَا لَا نَسْقِي حَتَّىٰ يُصْدِرَ ٱلرِّعَآءُ وَأَبُونَا شَيْخٞ كَبِيرٞ", id: "Saat tiba di sumber air Madyan, Musa melihat banyak orang memberi minum ternak. Terpisah dari mereka, ia melihat dua perempuan menahan ternak mereka. Musa bertanya, “Apa keadaan kalian?” Mereka menjawab bahwa mereka menunggu para penggembala selesai, karena ayah mereka sudah tua.", en: "At the well of Madyan, Musa found many people watering their flocks. Apart from them, he saw two women holding their flock back. He asked, “What is your situation?” They replied that they waited until the shepherds had left because their father was elderly." },
  { number: "24", arabic: "فَسَقَىٰ لَهُمَا ثُمَّ تَوَلَّىٰ إِلَى ٱلظِّلِّ فَقَالَ رَبِّ إِنِّي لِمَآ أَنزَلْتَ إِلَيَّ مِنْ خَيْرٖ فَقِيرٞ", id: "Lalu Musa memberi minum ternak mereka; kemudian ia menepi ke tempat teduh dan berdoa: “Wahai Tuhanku, sungguh aku sangat memerlukan kebaikan apa pun yang Engkau turunkan kepadaku.”", en: "So Musa watered their flock for them; then he withdrew to the shade and prayed: “My Lord, I am truly in need of whatever good You send down to me.”" },
  { number: "25", arabic: "فَجَآءَتْهُ إِحْدَىٰهُمَا تَمْشِي عَلَى ٱسْتِحْيَآءٖ قَالَتْ إِنَّ أَبِي يَدْعُوكَ لِيَجْزِيَكَ أَجْرَ مَا سَقَيْتَ لَنَاۚ فَلَمَّا جَآءَهُۥ وَقَصَّ عَلَيْهِ ٱلْقَصَصَ قَالَ لَا تَخَفْۖ نَجَوْتَ مِنَ ٱلْقَوْمِ ٱلظَّالِمِينَ", id: "Kemudian salah seorang dari dua perempuan itu datang kepadanya, berjalan dengan haya. Ia berkata, “Ayahku mengundangmu untuk membalas jasa karena engkau telah memberi minum ternak kami.” Ketika Musa datang dan menceritakan kisahnya, sang ayah berkata, “Jangan takut; engkau telah selamat dari kaum yang zalim.”", en: "Then one of the two women came to him, walking with haya. She said, “My father invites you to reward you for watering our flock.” When Musa came and told him his story, the father said, “Do not fear; you have escaped the wrongdoing people.”" },
  { number: "26", arabic: "قَالَتْ إِحْدَىٰهُمَا يَٰٓأَبَتِ ٱسْتَـْٔجِرْهُۖ إِنَّ خَيْرَ مَنِ ٱسْتَـْٔجَرْتَ ٱلْقَوِيُّ ٱلْأَمِينُ", id: "Salah seorang dari mereka berkata, “Wahai ayahku, pekerjakanlah dia. Sesungguhnya orang terbaik yang engkau pekerjakan ialah yang kuat dan amanah.”", en: "One of them said, “My dear father, hire him. Surely the best person you can hire is strong and trustworthy.”" },
  { number: "27", arabic: "قَالَ إِنِّي أُرِيدُ أَنْ أُنكِحَكَ إِحْدَى ٱبْنَتَيَّ هَاتَيْنِ عَلَىٰ أَنْ تَأْجُرَنِي ثَمَانِيَ حِجَجٖ فَإِنْ أَتْمَمْتَ عَشْرٗا فَمِنْ عِندِكَ وَمَا أُرِيدُ أَنْ أَشُقَّ عَلَيْكَۚ سَتَجِدُنِيٓ إِن شَآءَ ٱللَّهُ مِنَ ٱلصَّالِحِينَ", id: "Sang ayah berkata, “Aku ingin menikahkanmu dengan salah satu dari kedua putriku ini, dengan syarat engkau bekerja kepadaku selama delapan tahun. Jika engkau sempurnakan menjadi sepuluh, itu dari kerelaanmu. Aku tidak ingin menyulitkanmu; insya Allah engkau akan mendapatiku termasuk orang yang baik.”", en: "The father said, “I intend to marry one of these two daughters of mine to you, on condition that you serve me for eight years. If you complete ten, that is from your own generosity. I do not wish to make it difficult for you; Allah willing, you will find me among the righteous.”" },
  { number: "28", arabic: "قَالَ ذَٰلِكَ بَيْنِي وَبَيْنَكَۖ أَيَّمَا ٱلْأَجَلَيْنِ قَضَيْتُ فَلَا عُدْوَانَ عَلَيَّۖ وَٱللَّهُ عَلَىٰ مَا نَقُولُ وَكِيلٞ", id: "Musa berkata, “Itu adalah kesepakatan antara aku dan engkau. Mana pun dari dua masa itu yang aku penuhi, tidak ada tuntutan tambahan atas diriku. Dan Allah adalah Wakil atas apa yang kita ucapkan.”", en: "Musa said, “That is settled between you and me. Whichever of the two terms I fulfill, there is no further claim against me. And Allah is Trustee over what we say.”" },
];

type Tradition = { id: string; name: string; scripture: string; reference: string; color: string; headline: string; verses?: boolean; quote?: { text: string; by: string }; meaning: string; principles: string[]; note?: string };
type Route = { id: string; image: string; badge: string; title: string; lead: string; promise: string; gaps: string[]; impact: string };
type Stat = { value: string; label: string; detail: string };

const TRADITIONS: Record<Lang, Tradition[]> = {
  id: [
    {
      id: "islam", name: "Islam", scripture: "Al-Qur’an", reference: "QS. Al-Qasas 28:23–28", color: "#d72d62",
      headline: "Karakter dinilai lebih dahulu, lalu niat dinyatakan dengan terang.",
      verses: true,
      meaning: "Salah seorang dari kedua perempuan itu berkata kepada ayahnya, “Wahai ayahku, pekerjakanlah dia. Sungguh, orang terbaik yang engkau pekerjakan adalah yang kuat dan amanah.” Sang ayah lalu berkata kepada Musa, “Aku ingin menikahkanmu dengan salah seorang dari kedua putriku ini, dengan syarat engkau bekerja padaku delapan tahun.”",
      principles: ["Penilaian dimulai dari karakter — kuat (al-qawiyy) dan amanah (al-amīn) — bukan dari ketertarikan.", "Yang membuka pembicaraan adalah wali, bukan pendekatan diam-diam.", "Niat menikah dinyatakan eksplisit sejak awal, bukan isyarat samar.", "Syarat dan komitmen disepakati di depan, dengan ukuran yang jelas."],
      note: "Teks ayat didahulukan. Catatan tafsir klasik tidak diperlakukan sebagai lafaz Al-Qur’an.",
    },
    {
      id: "kristen", name: "Kristen & Katolik", scripture: "Alkitab", reference: "Kejadian 24", color: "#7ed6c1",
      headline: "Utusan yang dipercaya, kriteria yang ditetapkan lebih dulu, dan persetujuan yang ditanyakan.",
      meaning: "Abraham tidak membiarkan pernikahan anaknya terjadi secara kebetulan. Ia mengutus hambanya yang paling dipercaya, menetapkan kriteria yang jelas sebelum perjalanan dimulai, dan melibatkan keluarga Ribka di rumah mereka sendiri. Sebelum apa pun diputuskan, Ribka sendiri ditanya apakah ia bersedia ikut.",
      principles: ["Ada perantara yang ditunjuk dan dipercaya — bukan pencarian sendirian.", "Kriteria disepakati sebelum pertemuan, bukan setelah perasaan tumbuh.", "Kedua keluarga hadir di dalam prosesnya.", "Persetujuan pribadi tetap menjadi keputusan akhir."],
      note: "Ringkasan makna dari Kejadian 24; bandingkan pula Amos 3:3 tentang dua orang yang berjalan bersama karena sepakat.",
    },
    {
      id: "hindu", name: "Hindu", scripture: "Manawa Dharmasastra", reference: "Manawa Dharmasastra III · Vivaha Samskara", color: "#ef91b1",
      headline: "Pernikahan adalah dharma yang disaksikan, bukan urusan pribadi dua orang.",
      meaning: "Dalam Manawa Dharmasastra, bentuk pernikahan yang tertinggi (Brahma Wiwaha) terjadi ketika seorang ayah menyerahkan putrinya kepada laki-laki berkarakter baik dan berilmu, yang ia undang sendiri. Dalam tradisi Hindu Bali, vivaha adalah samskara — upacara suci yang disaksikan keluarga dan masyarakat.",
      principles: ["Keluarga yang memulai dan mengundang, bukan kebetulan.", "Kriterianya adalah karakter (sila) dan ilmu, bukan tampilan.", "Ikatannya disaksikan secara sah oleh keluarga dan masyarakat.", "Kesiapan dinilai sebelum ikatan dimulai."],
    },
    {
      id: "buddha", name: "Buddha", scripture: "Sutta Pitaka", reference: "Samajivi Sutta · Anguttara Nikaya 4.55", color: "#c9b6ff",
      headline: "Kecocokan didefinisikan dengan jelas — dan karena itu bisa dinilai.",
      meaning: "Ketika Nakulapita dan Nakulamata memohon agar dapat bersama tidak hanya di kehidupan ini, Sang Buddha memberi jawaban yang sangat praktis: pasangan yang ingin hidup selaras hendaknya setara dalam empat hal — keyakinan (saddha), moralitas (sila), kemurahan hati (caga), dan kebijaksanaan (panna).",
      principles: ["Kecocokan bukan sekadar perasaan; ia punya empat dimensi yang dapat diperiksa.", "Keselarasan nilai yang membuat pernikahan bertahan, bukan ketertarikan awal.", "Sigalovada Sutta (DN 31) menetapkan tanggung jawab timbal balik suami dan istri.", "Persiapan dilakukan sebelum menikah, bukan setelah masalah muncul."],
    },
    {
      id: "sekuler", name: "Humanis & Sekuler", scripture: "Akal sehat & bukti", reference: "Warren Buffett · bukti sosial modern", color: "#f2a65a",
      headline: "Tanpa dasar agama pun, kesimpulannya sama.",
      quote: { text: "Keputusan terpenting yang Anda buat adalah dengan siapa Anda menikah.", by: "Warren Buffett" },
      meaning: "Ini adalah argumen yang tidak memerlukan keyakinan apa pun. Menikah adalah keputusan finansial, emosional, dan hidup terbesar yang akan diambil kebanyakan orang — namun justru yang paling sedikit dipersiapkan. Setiap keputusan besar lain dalam hidup kita lakukan dengan riset, nasihat, dan proses. Hanya untuk yang satu ini kita mengandalkan kebetulan.",
      principles: ["Keputusan terbesar dalam hidup, tetapi paling sedikit dipersiapkan.", "Riset relasi modern menunjukkan keselarasan nilai dan cara berkomunikasi lebih menentukan daripada ketertarikan awal.", "Semakin banyak pilihan tanpa penyaringan, semakin sulit orang memutuskan dan semakin rendah kepuasannya.", "Karena itu prosesnya harus dibuat sederhana dan jelas — bukan diserahkan pada kebetulan."],
      note: "Kartu ini tidak memakai dasar agama sama sekali. Kesimpulannya tetap sama dengan lima tradisi lainnya.",
    },
    {
      id: "konghucu", name: "Konghucu", scripture: "Kitab Mengzi & Liji", reference: "Mengzi 3B · Enam tahapan pernikahan (Liu Li)", color: "#9fc4ff",
      headline: "Perantara yang tepercaya bukan hal baru — ia bagian dari tata caranya.",
      meaning: "Dalam ajaran Konghucu, pernikahan yang benar mengikuti tahapan yang tertata dan dimulai melalui seorang perantara. Mengzi menegaskan bahwa menunggu perkataan perantara dan izin orang tua adalah jalan yang pantas — bukan hambatan, melainkan penjaga kehormatan kedua keluarga.",
      principles: ["Perantara adalah bagian resmi dari prosesnya.", "Orang tua dilibatkan sejak tahap pertama.", "Setiap tahap punya urutan dan tujuan yang jelas.", "Kehormatan kedua keluarga dijaga sepanjang proses."],
    },
  ],
  en: [
    {
      id: "islam", name: "Islam", scripture: "The Qur’an", reference: "Qur’an 28:23–28 (Al-Qasas)", color: "#d72d62",
      headline: "Character is assessed first, then the intention is stated plainly.",
      verses: true,
      meaning: "One of the two women said to her father, “Father, hire him. The best you can hire is one who is strong and trustworthy.” The father then said to Musa, “I wish to marry you to one of these two daughters of mine, on the condition that you work for me for eight years.”",
      principles: ["Assessment begins with character — strong (al-qawiyy) and trustworthy (al-amīn) — not attraction.", "The guardian opens the conversation; there is no private approach.", "The intention to marry is stated explicitly, not hinted at.", "Terms and commitment are agreed up front, in clear measures."],
      note: "The Qur’anic text comes first. Classical tafsir notes are not treated as Qur’anic wording.",
    },
    {
      id: "kristen", name: "Christian & Catholic", scripture: "The Bible", reference: "Genesis 24", color: "#7ed6c1",
      headline: "A trusted envoy, criteria set beforehand, and consent that is asked for.",
      meaning: "Abraham did not leave his son’s marriage to chance. He sent his most trusted servant, set clear criteria before the journey began, and involved Rebekah’s family in their own home. Before anything was settled, Rebekah herself was asked whether she was willing to go.",
      principles: ["There is an appointed, trusted intermediary — not a solitary search.", "Criteria are agreed before the meeting, not after feelings grow.", "Both families are present within the process.", "Personal consent remains the final decision."],
      note: "A summary of Genesis 24; compare also Amos 3:3 on two walking together because they have agreed.",
    },
    {
      id: "hindu", name: "Hindu", scripture: "Manava Dharmasastra", reference: "Manava Dharmasastra III · Vivaha Samskara", color: "#ef91b1",
      headline: "Marriage is a witnessed dharma, not the private affair of two people.",
      meaning: "In the Manava Dharmasastra, the highest form of marriage (Brahma Vivaha) is when a father gives his daughter to a man of good character and learning whom he has himself invited. In Balinese Hindu tradition, vivaha is a samskara — a sacred rite witnessed by family and community.",
      principles: ["The family initiates and invites; nothing is left to chance.", "The criteria are character (sila) and learning, not appearance.", "The bond is lawfully witnessed by family and community.", "Readiness is assessed before the bond begins."],
    },
    {
      id: "buddha", name: "Buddhist", scripture: "Sutta Pitaka", reference: "Samajivi Sutta · Anguttara Nikaya 4.55", color: "#c9b6ff",
      headline: "Compatibility is defined precisely — which is why it can be assessed.",
      meaning: "When Nakulapita and Nakulamata asked to remain together beyond this life, the Buddha gave a strikingly practical answer: a couple who wish to live in tune should be matched in four things — conviction (saddha), virtue (sila), generosity (caga), and wisdom (panna).",
      principles: ["Compatibility is not a feeling; it has four dimensions that can be examined.", "Aligned values are what make a marriage last, not initial attraction.", "The Sigalovada Sutta (DN 31) sets out the mutual duties of husband and wife.", "Preparation happens before marriage, not after problems appear."],
    },
    {
      id: "sekuler", name: "Secular & humanist", scripture: "Reason & evidence", reference: "Warren Buffett · modern social evidence", color: "#f2a65a",
      headline: "Take away every scripture and the conclusion holds.",
      quote: { text: "The most important decision you make is who you marry.", by: "Warren Buffett" },
      meaning: "This is the argument that requires no belief at all. Marriage is the largest financial, emotional, and life decision most people will ever make — and the one they prepare for least. Every other major decision in our lives gets research, advice, and a process. Only this one is left to chance.",
      principles: ["The biggest decision of a life, and the least prepared for.", "Modern relationship research finds aligned values and communication predict outcomes far better than initial attraction.", "More unfiltered choice makes people slower to decide and less satisfied with what they choose.", "So the process should be made simple and clear — not left to chance."],
      note: "This card rests on no religious premise at all. It reaches the same conclusion as the other five.",
    },
    {
      id: "konghucu", name: "Confucian", scripture: "Mengzi & Liji", reference: "Mengzi 3B · The six rites of marriage (Liu Li)", color: "#9fc4ff",
      headline: "A trusted intermediary is not a new idea — it is part of the rite itself.",
      meaning: "In Confucian teaching, a proper marriage follows an ordered sequence of rites and begins through an intermediary. Mengzi holds that waiting for the intermediary’s word and the parents’ consent is the honourable path — not an obstacle, but a guard on the dignity of both families.",
      principles: ["The intermediary is a formal part of the process.", "Parents are involved from the very first stage.", "Every stage has a clear order and purpose.", "The honour of both families is protected throughout."],
    },
  ],
};

const ROUTES: Record<Lang, Route[]> = {
  id: [
    { id: "apps", image: "/presentations-sekolah-islam-route-dating-apps.png", badge: "Cara 01", title: "Aplikasi kencan", lead: "Banyak match, sedikit arah menuju nikah.", promise: "Cepat, luas, dan mudah dimulai.", gaps: ["Niat sering tidak jelas atau berubah-ubah.", "Verifikasi identitas, karakter, dan latar belakang terbatas.", "Swipe dan perbandingan terus-menerus membuat orang terasa seperti pilihan sekali pakai.", "Kedekatan emosional dapat tumbuh sebelum ada komitmen yang sungguh-sungguh."], impact: "Lelah, bingung, sulit percaya, dan terikat pada proses yang tidak punya arah." },
    { id: "natural", image: "/presentations-sekolah-islam-route-natural-meeting.png", badge: "Cara 02", title: "Bertemu secara alami", lead: "Harapan tanpa proses yang jelas.", promise: "Pertemuan terasa spontan dan alami.", gaps: ["Niat belum tentu jelas sejak awal.", "Kedekatan emosi dapat tumbuh sebelum nilai dan kesiapan dibicarakan.", "Keluarga serta batasan sering baru hadir ketika masalah sudah terjadi.", "Latar belakang, karakter, dan tujuan hidup belum teruji."], impact: "Proses dapat berubah menjadi rahasia, membingungkan, atau berakhir tanpa arah yang baik." },
    { id: "community", image: "/presentations-sekolah-islam-route-community-guide.png", badge: "Cara 03", title: "Ustaz & komunitas", lead: "Dipercaya, tetapi bukan sebuah sistem lengkap.", promise: "Nilai yang sejalan, kepercayaan, dan nasihat yang baik.", gaps: ["Waktu dan kapasitas mereka sangat terbatas.", "Mereka tidak selalu memiliki pool kandidat yang luas dan terverifikasi.", "Sering tidak ada sistem baku untuk kesiapan, kecocokan, atau tindak lanjut.", "Beban koordinasi dapat menjadi terlalu besar bagi satu orang."], impact: "Niat baik belum tentu berubah menjadi proses yang konsisten dan aman untuk semua pihak." },
    { id: "family", image: "/presentations-sekolah-islam-route-family-reference.png", badge: "Cara 04", title: "Referensi keluarga", lead: "Aman dan tepercaya — tetapi sering sangat terbatas.", promise: "Kepercayaan, niat baik, dan keterlibatan keluarga sejak awal.", gaps: ["Pilihan kandidat biasanya sangat sedikit.", "Kecocokan nilai, komunikasi, dan kesiapan jarang dinilai secara terstruktur.", "Ada tekanan untuk melanjutkan karena keluarga sudah saling mengenal.", "Saat tidak cocok, situasinya dapat terasa canggung bagi semua pihak."], impact: "Orang bisa menolak kesempatan baik karena takut canggung, atau menerima terlalu cepat karena tekanan." },
  ],
  en: [
    { id: "apps", image: "/presentations-sekolah-islam-route-dating-apps.png", badge: "Route 01", title: "Dating apps", lead: "Many matches, little direction towards marriage.", promise: "Speed, reach, and an easy beginning.", gaps: ["Intentions are often unclear or changeable.", "Identity, character, and background checks are limited.", "Constant swiping and comparison can make people feel disposable.", "Emotional attachment can grow before real commitment exists."], impact: "Exhaustion, confusion, mistrust, and attachment to a process with no direction." },
    { id: "natural", image: "/presentations-sekolah-islam-route-natural-meeting.png", badge: "Route 02", title: "Meeting naturally", lead: "Hope without a clear process.", promise: "A meeting that feels spontaneous and natural.", gaps: ["Intention may not be clear from the beginning.", "Emotional closeness can grow before values and readiness are discussed.", "Family and boundaries often enter only after problems arise.", "Background, character, and life direction are still unknown."], impact: "The process can become secretive, confusing, or end without a good direction." },
    { id: "community", image: "/presentations-sekolah-islam-route-community-guide.png", badge: "Route 03", title: "Ustaz & community", lead: "Trusted guidance — but not a complete system.", promise: "Aligned values, trust, and good advice.", gaps: ["Their time and capacity are very limited.", "They may not have a large, verified candidate pool.", "There is often no standard process for readiness, compatibility, or follow-up.", "One person can carry too much coordination burden."], impact: "Good intention does not always become a consistent, safe process for everyone." },
    { id: "family", image: "/presentations-sekolah-islam-route-family-reference.png", badge: "Route 04", title: "Family references", lead: "Trusted and safe — yet often very limited.", promise: "Trust, good intention, and family involvement from the beginning.", gaps: ["The candidate pool is usually very small.", "Values, communication, and readiness are rarely assessed in a structured way.", "There may be pressure to continue because the families know one another.", "If it is not a fit, the situation can feel awkward for everyone."], impact: "People may reject good possibilities to avoid awkwardness — or accept too quickly because of pressure." },
  ],
};

const STATS: Record<Lang, Stat[]> = {
  id: [
    { value: "12,3 juta", label: "usia 25–34 belum pernah menikah", detail: "Data status perkawinan BPS 2022 mencatat 12.258.261 orang usia 25–34 berstatus belum kawin." },
    { value: "13,3%", label: "lebih sedikit pencatatan nikah", detail: "Dalam dua tahun, pencatatan nikah turun dari 1.705.348 pada 2022 menjadi 1.478.302 pada 2024." },
    { value: "2,12", label: "rata-rata anak per perempuan", detail: "Total Fertility Rate Indonesia pada 2024 tercatat 2,12, melanjutkan tren fertilitas yang terus menurun." },
    { value: "5,3%", label: "remaja mengalami depresi", detail: "I-NAMHS 2022 menemukan depresi pada 5,3% remaja usia 10–17 dalam 12 bulan terakhir." },
  ],
  en: [
    { value: "12.3m", label: "people aged 25–34 had never married", detail: "BPS marriage-status data for 2022 records 12,258,261 people aged 25–34 as never married." },
    { value: "13.3%", label: "fewer marriage registrations", detail: "In two years, registered marriages fell from 1,705,348 in 2022 to 1,478,302 in 2024." },
    { value: "2.12", label: "average children per woman", detail: "Indonesia’s 2024 Total Fertility Rate was 2.12, continuing a steady decline in fertility." },
    { value: "5.3%", label: "of adolescents experienced depression", detail: "I-NAMHS 2022 found depression among 5.3% of adolescents aged 10–17 in the previous 12 months." },
  ],
};

const COPY = {
  id: {
    whatsapp: "Halo Jodohmu, saya ingin membahas perjalanan menuju pernikahan bersama Jodohmu.",
    tagline: "Jodohmu · Solusi untuk pernikahan",
    presenterTools: "Alat presenter",
    langLabel: "Pilih bahasa",
    fullscreen: "Layar penuh",
    exitFullscreen: "Keluar layar penuh",
    navHint: "Gunakan tombol ← → atau geser untuk berpindah",
    prevSlide: "Slide sebelumnya",
    nextSlide: "Slide berikutnya",
    goToSlide: (n: number) => `Ke slide ${n}`,
    greeting: (client: string) => `Dipersiapkan khusus untuk ${client}`,
    greetingDefault: "Sebuah perkenalan yang personal",
    title: { headA: "Jalan yang sederhana menuju pernikahan yang ", headB: "jelas.", sub: "Untuk Anda yang berkomitmen menikah — didampingi dengan pemahaman budaya, penilaian manusiawi, dan niat yang tulus." },
    philosophy: {
      eyebrow: "Filosofi Jodohmu",
      head: "Enam sudut pandang. Satu kesimpulan yang sama.",
      sub: "Lima tradisi besar di Indonesia — dan satu argumen tanpa agama sama sekali. Pilih satu untuk membaca sumbernya.",
      hint: "Klik salah satu untuk membuka teks sumbernya",
      open: "Buka sumbernya →",
      close: "Tutup",
      labels: { verse: "Teks sumber", chooseVerse: "Pilih ayat", meaning: "Terjemah makna ringkas", principles: "Prinsip yang sama", note: "Catatan" },
      conclusionHead: "Lima kitab dan satu argumen sekuler. Semuanya sepakat.",
      conclusionBody: "Niat dinyatakan lebih dulu. Karakter diperiksa sebelum perasaan. Keluarga hadir sejak awal. Dan ada pihak tepercaya yang menjembatani. Baik Anda beragama maupun tidak, tidak satu pun dari sudut pandang ini menyerahkan pernikahan kepada kebetulan — dan itulah persis pekerjaan Jodohmu.",
    },
    stats: {
      eyebrow: "Realita Indonesia",
      head: "Ini bukan perasaan. Ini yang sedang terjadi.",
      sub: "Setiap angka mengukur hal yang berbeda dan tidak membuktikan satu penyebab tunggal. Bersama-sama, semuanya menunjukkan satu hal: menemukan pasangan menjadi semakin sulit.",
      note: "Sumber: BPS Long Form SP2020 (status perkawinan 2022) dan Indikator Kesejahteraan Rakyat 2024; Kemenag/SIMKAH; Kemenkes/I-NAMHS 2022. Angka adalah sinyal sosial, bukan penilaian atas individu.",
    },
    routes: {
      eyebrow: "Empat cara yang biasa ditempuh",
      head: "Semua orang mencoba salah satu dari empat jalan ini.",
      sub: "Masing-masing menawarkan sesuatu yang nyata — dan masing-masing punya titik lemah yang sama nyatanya. Pilih satu untuk melihat detailnya.",
      open: "Lihat kelemahannya →",
      close: "Tutup",
      labels: { promise: "Yang ditawarkan", gaps: "Di mana proses ini kurang memadai", impact: "Akibatnya" },
      conclusion: "Masalahnya bukan orangnya. Yang hilang adalah sistemnya.",
    },
    works: {
      eyebrow: "Cara kerja Jodohmu",
      head: "Sistem itu, dari awal hingga lamaran.",
      sub: "Lima tahap yang dirancang agar keputusan besar terasa aman. Pilih satu tahap untuk melihat detailnya.",
      close: "Tutup",
      detailLabel: "Hasil di tahap ini",
      planner: {
        title: "Rancang Joble Anda",
        sub: "Inilah yang Anda tentukan sendiri. Pilih preferensi Anda.",
        questions: ["Gaya percakapan seperti apa yang terasa nyaman?", "Bawa orang tua, teman, atau keluarga", "Pilih satu fasilitator"],
        styles: ["Santai & alami", "Terarah", "Hangat & kekeluargaan", "Fleksibel"],
        guests: ["Tanpa pendamping", "1 orang", "2 orang"],
        facilitators: ["Imam", "Pendeta", "Tim Jodohmu", "Tanpa fasilitator"],
        guestNote: "Jumlah pendamping mengikuti paket: Pearl maksimal 1 orang; Ruby dan Diamond maksimal 2 orang.",
        foodNote: "Makanan sesuai paket: Pearl hidangan terpilih, Ruby buffet, Diamond buffet hotel bintang 4 atau 5.",
        summaryLabel: "Joble Anda",
        summaryEmpty: "Pilih preferensi Anda di atas.",
      },
    },
    why: {
      eyebrow: "Perbedaan Jodohmu",
      head: "Menemukan pasangan hidup adalah keputusan besar.",
      sub: "Karena yang Anda pilih bukan sekadar pasangan — tetapi masa depan keluarga.",
      alt: "Keluarga Muslim Indonesia menikmati waktu bersama di rumah",
      overlayEyebrow: "Untuk masa depan yang lebih terarah",
      overlayA: "Bukan sekadar cocok. ",
      overlayB: "Tetapi siap membangun keluarga.",
      items: [["Terverifikasi & aman", "Setiap perkenalan dimulai dengan verifikasi yang cermat dan komitmen yang sungguh-sungguh."], ["Dipandu manusia, bukan algoritma", "Pendamping Jodohmu memahami nilai Anda — bukan sekadar memberi rekomendasi tanpa arah."], ["Bermartabat di setiap langkah", "Keluarga, budaya, dan batasan dihormati di sepanjang proses."]],
    },
    outcome: { eyebrow: "Yang berubah", headA: "Lebih sedikit menebak.", headB: "Lebih banyak keyakinan.", para: "Bertemu orang yang tepat tidak seharusnya bergantung pada keberuntungan, sinyal yang membingungkan, atau profil yang hanya menarik selama lima detik. Jodohmu menciptakan kejelasan agar Anda dapat mengambil keputusan besar dengan tenang dan yakin.", items: ["Niat Anda dipahami sebelum sebuah perkenalan dilakukan.", "Anda bertemu orang-orang yang sudah dinilai komitmen dan kesiapannya.", "Setiap tahap memiliki langkah berikutnya yang jelas — didampingi seseorang di sisi Anda."] },
    experience: { eyebrow: "Bagaimana rasanya", head: "Proses yang tenang untuk keputusan yang mengubah hidup.", alt: "Pertemuan yang difasilitasi antara dua calon pasangan di Indonesia", para: "Cukup rasa aman, pengertian, dan waktu bagi dua orang — beserta keluarga mereka — untuk mengeksplorasi seperti apa masa depan bersama yang sesungguhnya.", tag: "Privat · Difasilitasi · Terhormat" },
    process: {
      eyebrow: "Perjalanan Jodohmu",
      head: "Setiap tahap dirancang agar keputusan besar terasa lebih aman.",
      sub: "Perjalanan yang penuh perhatian dan membangun keyakinan sebelum dua orang melangkah lebih jauh.",
      hint: "Pilih satu tahap untuk menjelajahi perjalanannya",
      stageLabel: (n: number) => `Tahap ${n}`,
      stages: [
        { title: "Panggilan intake", short: "Percakapan yang personal dan jelas.", points: ["Sesi wawancara mendalam (60–90 menit, tergantung paket) bersama matchmaker (Dokcin) Anda", "Kami memahami nilai, harapan, batasan, dan kesiapan Anda menikah"], outcome: "Pencarian dimulai dari pemahaman yang tepat, bukan tebakan.", planner: false },
        { title: "Profil & verifikasi", short: "Ditulis dan diperiksa tim kami.", points: ["Profil Anda ditulis dan ditinjau oleh tim kami", "KTP dan media sosial selalu diverifikasi", "Tempat kerja dan slip gaji juga diperiksa, tergantung paket"], outcome: "Anda hanya bertemu kandidat yang berkomitmen dan telah disaring.", planner: false },
        { title: "Pencarian & update mingguan", short: "Aktif, bukan menunggu.", points: ["Tim kami aktif mencari kandidat yang sesuai", "Update progres pencarian setiap minggu", "Pencarian disesuaikan berdasarkan masukan Anda"], outcome: "Anda selalu tahu sejauh mana pencarian Anda.", planner: false },
        { title: "Bertemu lewat Joble", short: "Pertemuan yang dirancang bersama.", points: ["Pertemuan terencana dengan tujuan pernikahan", "Anda menentukan gaya percakapan, siapa yang mendampingi, dan siapa yang memfasilitasi"], outcome: "Perkenalan terasa aman, terhormat, dan bertujuan jelas.", planner: true },
        { title: "Pemeriksaan & keluarga", short: "Menuju langkah yang lebih berkomitmen.", points: ["Asesmen psikologi klinis (Ruby dan Diamond)", "Background check menyeluruh (Ruby dan Diamond)", "Tim kami menyiapkan dan memandu pertemuan kedua keluarga"], outcome: "Keputusan besar didasari fakta yang sudah diperiksa, dengan keluarga dilibatkan pada waktu yang tepat.", planner: false },
      ],
    },
    packages: {
      eyebrow: "Pilihan Anda",
      head: "Pilih pendampingan yang terasa tepat.",
      sub: "Mulai dengan jenis dukungan yang Anda butuhkan. Pilih satu untuk melihat detailnya.",
      cards: { pearl: ["Untuk memulai", "Langkah pertama yang jelas dan terdampingi."], ruby: ["Rekomendasi Jodohmu", "Pendampingan lebih mendalam dari awal hingga akhir."], diamond: ["Solusi paling menyeluruh", "Ditangani langsung oleh matchmaker senior, sepenuhnya privat."], tailored: ["Solusi yang sesuai untuk Anda", "Perjalanan yang dirancang sesuai kebutuhan Anda."] },
      close: "Tutup detail",
      view: "Lihat detail →",
      journey: "Yang termasuk, tahap demi tahap",
    },
    builder: {
      eyebrow: "Rancang perjalanan pernikahan Anda",
      head: "Pilih yang Anda butuhkan.",
      sub: "Geser kartu untuk menyusun perjalanan ideal Anda.",
      selectedCount: (n: number) => `${n} area dipilih`,
      howMany: "Berapa kali?",
      decrease: (label: string) => `Kurangi ${label}`,
      increase: (label: string) => `Tambah ${label}`,
      totalLabel: "Perjalanan sesuai kebutuhan Anda",
      empty: "Pilih dukungan yang ingin Anda sertakan.",
      perSession: " / sesi",
      options: { onboarding: "Onboarding & profil", psychology: "Asesmen psikologi", background: "Background check", online: "Pertemuan online", family: "Pertemuan keluarga", joble: "Joble (pertemuan terfasilitasi)" },
      onlineSummary: (n: number) => `${n} pertemuan online`,
      psychologySummary: (n: number) => `${n} sesi psikologi`,
    },
    faq: {
      eyebrow: "Sebelum Anda memutuskan",
      head: "Pertanyaan penting, terjawab.",
      sub: "Pilih satu kartu untuk melihat jawabannya.",
      yourQuestion: "Pertanyaan Anda",
      items: [["Berapa biaya untuk memulai?", "Registrasi Jodohmu mulai dari Rp500 ribu, dibayar sekali untuk masuk ke pool perkenalan privat. Biaya ini diperhitungkan sepenuhnya sebagai potongan untuk paket yang Anda pilih dan tidak dapat dikembalikan."], ["Apakah saya bisa mencicil?", "Bisa, tergantung kasus dan cakupan layanan. Metode pembayaran — penuh atau dicicil — kami sepakati bersama sebelum pencarian dimulai."], ["Apa beda Jodohmu dengan aplikasi dating?", "Kami fokus pada perkenalan terarah yang menjaga adab dan batasan, pendampingan di setiap pertemuan, serta penyaringan ramah keluarga bagi kandidat yang siap menikah."], ["Apakah bisa melibatkan keluarga atau imam?", "Bisa. Kami menyambut orang tua atau pembimbing agama dan dapat menyiapkan pertemuan yang santun serta terawasi."], ["Apakah ada diskon khusus?", "Ya. Kami menawarkan diskon 10% untuk pelajar atau mahasiswa aktif dan member re-marriage; keduanya berlaku untuk paket Pearl."], ["Bisakah saya mengganti paket?", "Kami dapat meninjau kembali paket dan cara kerja kami bersama seiring kebutuhan dan prioritas Anda menjadi lebih jelas — hubungi tim kami untuk membahasnya."], ["Apa itu Bonus Keberhasilan?", "Bonus opsional Rp500 ribu–2 juta yang diberikan secara sukarela saat Anda melanjutkan ke tahap lamaran — bukan kewajiban, murni dari hati."], ["Apakah data dan identitas saya dijaga kerahasiaannya?", "Ya. Profil Anda hanya dibagikan kepada kandidat yang relevan setelah kami meminta izin, dan detail pribadi seperti kontak Anda tidak pernah dibagikan tanpa persetujuan Anda."]],
    },
    close: { eyebrow: "Sebuah awal yang penuh perhatian", headA: "Masa depan yang layak dibangun ", headB: "dengan penuh perhatian.", para: "Percakapan pertama Anda hanyalah kesempatan untuk memahami perjalanannya. Kami akan mendengarkan, menjawab pertanyaan Anda, dan membantu Anda memutuskan apakah Jodohmu adalah pilihan yang tepat.", cta: "Mulai percakapan pribadi", alt: "Pengantin Muslim Indonesia merayakan akad nikah bersama keluarga" },
    presenter: {
      eyebrow: "Mode presenter", head: "Sesuaikan presentasi ini", close: "Tutup alat presenter",
      intro: "Pilih paket, ubah harganya, atau susun satu paket khusus secara langsung saat percakapan.",
      pricesTitle: "Paket dan harga", showPrices: "Tampilkan harga", show: "Tampilkan",
      pricePlaceholder: "Harga bebas, mis. Rp 5 juta",
      customTitle: "Paket khusus", remove: "Hapus",
      namePlaceholder: "Nama paket", freePricePlaceholder: "Harga bebas", durationPlaceholder: "Durasi",
      descPlaceholder: "Pernyataan nilai singkat", featuresPlaceholder: "Fitur — satu per baris",
      update: "Perbarui paket khusus", add: "Tambahkan paket khusus",
      defaultPrice: "Investasi dibicarakan secara privat", defaultWindow: "Perjalanan yang disesuaikan", defaultDescription: "Tingkat pendampingan yang disesuaikan dengan keadaan Anda.",
    },
  },
  en: {
    whatsapp: "Hello Jodohmu, I would like to discuss my journey toward marriage with Jodohmu.",
    tagline: "Jodohmu · Solution for marriage",
    presenterTools: "Presenter tools",
    langLabel: "Select language",
    fullscreen: "Full screen",
    exitFullscreen: "Exit full screen",
    navHint: "Use ← → keys or swipe to navigate",
    prevSlide: "Previous slide",
    nextSlide: "Next slide",
    goToSlide: (n: number) => `Go to slide ${n}`,
    greeting: (client: string) => `Prepared for ${client}`,
    greetingDefault: "A private introduction",
    title: { headA: "A simple path to a marriage with ", headB: "clarity.", sub: "For those who are committed to marriage — guided with cultural understanding, human judgment, and sincere intention." },
    philosophy: {
      eyebrow: "The Jodohmu philosophy",
      head: "Six perspectives. One shared conclusion.",
      sub: "Indonesia’s five great traditions — and one argument that needs no religion at all. Choose one to read its source.",
      hint: "Select one to open its source text",
      open: "Open the source →",
      close: "Close",
      labels: { verse: "Source text", chooseVerse: "Choose a verse", meaning: "Concise meaning", principles: "The shared principle", note: "Note" },
      conclusionHead: "Five scriptures and one secular argument. All agree.",
      conclusionBody: "Intention is stated first. Character is examined before feelings. Family is present from the beginning. And a trusted party bridges the two sides. Whether or not you hold a faith, not one of these perspectives leaves marriage to chance — and that is precisely the work Jodohmu does.",
    },
    stats: {
      eyebrow: "Indonesia’s reality",
      head: "This is not a feeling. This is what is happening.",
      sub: "Each figure measures something different and does not prove one single cause. Together they point to one thing: finding the right partner is getting harder.",
      note: "Sources: BPS Long Form SP2020 (2022 marriage status) and Welfare Indicators 2024; Ministry of Religious Affairs/SIMKAH; Ministry of Health/I-NAMHS 2022. These are social signals, not a judgement on individuals.",
    },
    routes: {
      eyebrow: "The four usual routes",
      head: "Everyone tries one of these four paths.",
      sub: "Each offers something real — and each has a weakness that is just as real. Select one to see the detail.",
      open: "See where it falls short →",
      close: "Close",
      labels: { promise: "What it offers", gaps: "Where it falls short", impact: "The result" },
      conclusion: "The problem is not the people. What is missing is the system.",
    },
    works: {
      eyebrow: "How Jodohmu works",
      head: "That system, from the first message to proposal.",
      sub: "Five stages designed to make a major decision feel safe. Select a stage to see the detail.",
      close: "Close",
      detailLabel: "What this stage gives you",
      planner: {
        title: "Design your Joble",
        sub: "This is what you decide yourself. Choose your preferences.",
        questions: ["What conversation style feels right?", "Bring parents, friends, or family", "Choose one facilitator"],
        styles: ["Relaxed & natural", "Structured", "Warm & family-oriented", "Flexible"],
        guests: ["No guests", "1 guest", "2 guests"],
        facilitators: ["Imam", "Priest", "Jodohmu team", "No facilitator"],
        guestNote: "Guest allowance follows your package: Pearl allows 1; Ruby and Diamond allow up to 2.",
        foodNote: "Food follows your package: Pearl has a prepared meal, Ruby a buffet, and Diamond a 4- or 5-star hotel buffet.",
        summaryLabel: "Your Joble",
        summaryEmpty: "Choose your preferences above.",
      },
    },
    why: {
      eyebrow: "The Jodohmu difference",
      head: "Choosing a life partner is a major decision.",
      sub: "Because what you choose is not just a partner — it is the future of a family.",
      alt: "An Indonesian Muslim family enjoying time together at home",
      overlayEyebrow: "For a more purposeful future",
      overlayA: "Not just compatible. ",
      overlayB: "But ready to build a family.",
      items: [["Verified & safe", "Every introduction begins with careful verification and committed intention."], ["Guided by people, not algorithms", "Your Jodohmu companion understands your values — not just endless suggestions with no direction."], ["Dignified at every step", "Family, culture, and boundaries are respected throughout the process."]],
    },
    outcome: { eyebrow: "What changes", headA: "Less guessing.", headB: "More certainty.", para: "Meeting the right person should not depend on luck, confusing signals, or profiles that only hold your attention for five seconds. Jodohmu creates the clarity you need to make a major decision calmly and with confidence.", items: ["Your intentions are understood before any introduction is made.", "You meet people whose commitment and readiness have already been assessed.", "Every stage has a clear next step — with someone by your side."] },
    experience: { eyebrow: "How it feels", head: "A calm process for a life-changing decision.", alt: "A facilitated meeting between two prospective partners in Indonesia", para: "Just safety, understanding, and time for two people — and their families — to explore what a shared future would really look like.", tag: "Private · Facilitated · Dignified" },
    process: {
      eyebrow: "The Jodohmu journey",
      head: "Every stage is designed to make a major decision feel safer.",
      sub: "A careful journey that builds confidence before two people take the next step.",
      hint: "Select a stage to explore the journey",
      stageLabel: (n: number) => `Stage ${n}`,
      stages: [
        { title: "Intake call", short: "A personal, clear conversation.", points: ["An in-depth interview (60–90 minutes, depending on the package) with your matchmaker (Dokcin)", "We understand your values, expectations, boundaries and readiness for marriage"], outcome: "The search begins from real understanding, not guesswork.", planner: false },
        { title: "Profile & verification", short: "Written and checked by our team.", points: ["Your profile written and reviewed by our team", "ID card and social media always verified", "Workplace and payslip checked too, depending on the package"], outcome: "You only meet candidates who are committed and already screened.", planner: false },
        { title: "Matching & weekly updates", short: "Active, not passive.", points: ["Our team actively sources suitable candidates", "Weekly progress updates on your search", "The search adjusted based on your feedback"], outcome: "You always know where your search stands.", planner: false },
        { title: "Meet through Joble", short: "A meeting designed together.", points: ["A planned meeting with marriage as its purpose", "You decide the conversation style, who accompanies you, and who facilitates it"], outcome: "Introductions feel safe, respectful, and clearly purposeful.", planner: true },
        { title: "Deeper checks & family", short: "Toward a committed step.", points: ["A clinical psychology assessment (Ruby and Diamond)", "A thorough background check (Ruby and Diamond)", "Our team prepares and guides the meeting between both families"], outcome: "A major decision grounded in verified facts, with families involved at the right time.", planner: false },
      ],
    },
    packages: {
      eyebrow: "Your options",
      head: "Choose the support that feels right.",
      sub: "Start with the kind of support you need. Select one to see the details.",
      cards: { pearl: ["Getting started", "A clear, supported first step."], ruby: ["The Jodohmu recommendation", "Deeper guidance from start to finish."], diamond: ["The most comprehensive solution", "Handled directly by a senior matchmaker, fully private."], tailored: ["A solution that suits you", "A journey shaped around your needs."] },
      close: "Close details",
      view: "View details →",
      journey: "What is included, stage by stage",
    },
    builder: {
      eyebrow: "Design your marriage journey",
      head: "Choose what you need.",
      sub: "Drag the cards to arrange your ideal journey.",
      selectedCount: (n: number) => `${n} areas selected`,
      howMany: "How many?",
      decrease: (label: string) => `Decrease ${label}`,
      increase: (label: string) => `Add ${label}`,
      totalLabel: "Your tailored journey",
      empty: "Select the support you would like to include.",
      perSession: " / session",
      options: { onboarding: "Onboarding & profile", psychology: "Psychology assessment", background: "Background check", online: "Online meeting", family: "Family meeting", joble: "Joble (facilitated meeting)" },
      onlineSummary: (n: number) => `${n} online meetings`,
      psychologySummary: (n: number) => `${n} psychology sessions`,
    },
    faq: {
      eyebrow: "Before you decide",
      head: "The important questions, answered.",
      sub: "Select a card to see the answer.",
      yourQuestion: "Your question",
      items: [["How much does it cost to start?", "Jodohmu registration starts from Rp500 thousand, paid once to enter the private introduction pool. This fee is credited in full toward the package you choose and is non-refundable."], ["Can I pay in instalments?", "Yes, depending on the case and the scope of service. The payment method — in full or in instalments — is agreed together before the search begins."], ["How is Jodohmu different from a dating app?", "We focus on guided introductions that protect etiquette and boundaries, guidance at every meeting, and family-friendly screening for candidates who are ready for marriage."], ["Can my family or imam be involved?", "Yes. We welcome parents or religious mentors and can arrange respectful, supervised meetings."], ["Are there any special discounts?", "Yes. We offer a 10% discount for active students and for re-marriage members; both apply to the Pearl package."], ["Can I change my package?", "We can revisit your package and how we work together as your needs and priorities become clearer — contact our team to discuss it."], ["What is the Success Bonus?", "An optional Rp500 thousand–2 million bonus given voluntarily when you proceed to a proposal — not an obligation, purely from the heart."], ["Is my information kept confidential?", "Yes. Your profile is only shared with relevant candidates after we ask your permission, and personal details such as your contact information are never shared without your consent."]],
    },
    close: { eyebrow: "A thoughtful beginning", headA: "A future worth building ", headB: "with real care.", para: "Your first conversation is simply a chance to understand the journey. We will listen, answer your questions, and help you decide whether Jodohmu is the right fit.", cta: "Start a private conversation", alt: "An Indonesian Muslim couple celebrating their akad nikah with family" },
    presenter: {
      eyebrow: "Presenter mode", head: "Customise this presentation", close: "Close presenter tools",
      intro: "Select packages, change their prices, or build a custom package live during the conversation.",
      pricesTitle: "Packages and prices", showPrices: "Show prices", show: "Show",
      pricePlaceholder: "Any price, e.g. Rp 5 juta",
      customTitle: "Custom package", remove: "Remove",
      namePlaceholder: "Package name", freePricePlaceholder: "Any price", durationPlaceholder: "Duration",
      descPlaceholder: "Short value statement", featuresPlaceholder: "Features — one per line",
      update: "Update custom package", add: "Add custom package",
      defaultPrice: "Investment discussed privately", defaultWindow: "A tailored journey", defaultDescription: "A level of guidance tailored to your circumstances.",
    },
  },
};

type Copy = (typeof COPY)["id"];

export function IndonesiaPresentation({ client, pricesVisible, showPearl, showRuby, showDiamond, presenter }: { client?: string; pricesVisible: boolean; showPearl: boolean; showRuby: boolean; showDiamond: boolean; presenter: boolean }) {
  const [lang, setLang] = useState<Lang>("id"); const t = COPY[lang]; const packs = PACKAGES[lang];
  const [slide, setSlide] = useState(0); const [isFullscreen, setIsFullscreen] = useState(false); const [settingsOpen, setSettingsOpen] = useState(false); const [selected, setSelected] = useState({ pearl: showPearl, ruby: showRuby, diamond: showDiamond }); const [showPrices, setShowPrices] = useState(pricesVisible); const [packagePrices, setPackagePrices] = useState({ pearl: PRICES.pearl, ruby: PRICES.ruby, diamond: PRICES.diamond }); const [custom, setCustom] = useState<Package | null>(null); const deckRef = useRef<HTMLDivElement>(null); const touchStart = useRef<number | null>(null);
  const greeting = client ? t.greeting(client) : t.greetingDefault;
  const availablePackages = useMemo(() => {
    const tailoredPackage: Package = custom ?? packs.tailored;
    return [...(selected.pearl ? [{ ...packs.pearl, price: packagePrices.pearl }] : []), ...(selected.ruby ? [{ ...packs.ruby, price: packagePrices.ruby }] : []), ...(selected.diamond ? [{ ...packs.diamond, price: packagePrices.diamond }] : []), tailoredPackage];
  }, [custom, packagePrices, packs, selected]);
  const slides = useMemo(() => [<TitleSlide key="welcome" greeting={greeting} t={t} />, <PhilosophySlide key="philosophy" t={t} lang={lang} />, <StatsSlide key="stats" t={t} lang={lang} />, <RoutesSlide key="routes" t={t} lang={lang} />, <HowItWorksSlide key="works" t={t} />, ...(availablePackages.length ? [<PackageSelectorSlide key="packages" items={availablePackages} pricesVisible={showPrices} t={t} lang={lang} />] : []), <ReassuranceSlide key="reassurance" t={t} />, <CloseSlide key="close" t={t} />], [availablePackages, greeting, lang, showPrices, t]);
  const go = useCallback((next: number) => setSlide(Math.min(Math.max(next, 0), slides.length - 1)), [slides.length]);
  const toggleFullscreen = useCallback(async () => { if (!document.fullscreenElement) await deckRef.current?.requestFullscreen(); else await document.exitFullscreen(); }, []);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (["ArrowRight", "ArrowDown", " ", "Enter"].includes(event.key)) { event.preventDefault(); go(slide + 1); } if (["ArrowLeft", "ArrowUp"].includes(event.key)) { event.preventDefault(); go(slide - 1); } if (event.key === "f" || event.key === "F") void toggleFullscreen(); if (event.key === "Escape" && document.fullscreenElement) void document.exitFullscreen(); }; const onFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement)); window.addEventListener("keydown", onKey); document.addEventListener("fullscreenchange", onFullscreen); return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("fullscreenchange", onFullscreen); }; }, [go, slide, toggleFullscreen]);
  useEffect(() => setSlide((current) => Math.min(current, slides.length - 1)), [slides.length]);
  return <div ref={deckRef} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[#fff6f9] font-sans text-[#102457]" onTouchStart={(e) => { touchStart.current = e.changedTouches[0].clientX; }} onTouchEnd={(e) => { if (touchStart.current === null) return; const distance = e.changedTouches[0].clientX - touchStart.current; if (Math.abs(distance) > 50) go(slide + (distance < 0 ? 1 : -1)); touchStart.current = null; }}><div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(216,91,135,.26),transparent_25%),radial-gradient(circle_at_85%_82%,rgba(93,140,255,.16),transparent_26%)]" /><div className="relative flex h-full flex-col"><header className="z-20 flex items-center justify-between px-6 py-5 sm:px-10"><Image src="/jodohmu-logo.png" alt="Jodohmu" width={45} height={45} className="h-10 w-10 object-contain " priority /><p className="hidden text-xs font-bold uppercase tracking-[.24em] text-[#102457]/65 sm:block">{t.tagline}</p><div className="flex gap-2">{presenter && <button onClick={() => setSettingsOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-[#d72d62] px-3 py-2 text-xs font-bold text-white"><Settings2 className="h-4 w-4" /><span className="hidden sm:inline">{t.presenterTools}</span></button>}<div role="group" aria-label={t.langLabel} className="inline-flex items-center gap-1 rounded-full border border-[#f0cfdc] py-1 pl-2.5 pr-1 text-xs font-semibold"><Languages className="mr-1 h-4 w-4 text-[#102457]/65" />{(["id", "en"] as const).map((code) => <button key={code} type="button" onClick={() => setLang(code)} aria-pressed={lang === code} className={`rounded-full px-2.5 py-1 transition ${lang === code ? "bg-[#102457] text-white" : "text-[#102457]/75 hover:bg-[#fde8ef] hover:text-[#102457]"}`}>{code.toUpperCase()}</button>)}</div><button onClick={() => void toggleFullscreen()} className="inline-flex items-center gap-2 rounded-full border border-[#f0cfdc] px-3 py-2 text-xs font-semibold text-[#102457]/85 transition hover:bg-[#fde8ef] hover:text-[#102457]" aria-label="Toggle full screen"><Expand className="h-4 w-4" /><span className="hidden sm:inline">{isFullscreen ? t.exitFullscreen : t.fullscreen}</span></button></div></header><div className="relative flex flex-1 items-center overflow-hidden"><div className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]" style={{ transform: `translateX(-${slide * 100}%)` }}>{slides.map((content, index) => <section key={index} aria-hidden={slide !== index} className="flex h-full w-full shrink-0 items-center justify-center px-7 pb-20 pt-2 sm:px-16 lg:px-24">{content}</section>)}</div></div><footer className="z-20 flex items-center justify-between px-6 pb-6 sm:px-10 sm:pb-8"><div className="flex gap-2">{slides.map((_, index) => <button aria-label={t.goToSlide(index + 1)} onClick={() => go(index)} key={index} className={`h-1.5 rounded-full transition-all ${index === slide ? "w-8 bg-[#d72d62]" : "w-1.5 bg-[#f6c3d4] hover:bg-[#e79ab5]"}`} />)}</div><p className="hidden text-xs text-[#102457]/55 sm:block">{t.navHint}</p><div className="flex gap-2"><button onClick={() => go(slide - 1)} disabled={slide === 0} className="grid h-10 w-10 place-items-center rounded-full border border-[#f0cfdc] text-[#102457] transition hover:bg-[#fde8ef] disabled:cursor-not-allowed disabled:opacity-30" aria-label={t.prevSlide}><ArrowLeft className="h-4 w-4" /></button><button onClick={() => go(slide + 1)} disabled={slide === slides.length - 1} className="grid h-10 w-10 place-items-center rounded-full bg-[#d85b87] text-[#102457] transition hover:bg-[#c44874] disabled:cursor-not-allowed disabled:opacity-40 !text-white" aria-label={t.nextSlide}><ArrowRight className="h-4 w-4" /></button></div></footer></div>{settingsOpen && <PresenterTools selected={selected} setSelected={setSelected} showPrices={showPrices} setShowPrices={setShowPrices} packagePrices={packagePrices} setPackagePrices={setPackagePrices} custom={custom} setCustom={setCustom} onClose={() => setSettingsOpen(false)} t={t} />}</div>;
}

function TitleSlide({ greeting, t }: { greeting: string; t: Copy }) { return <div className="mx-auto max-w-5xl text-center"><p className="text-xs font-bold uppercase tracking-[.28em] text-[#d72d62]">{greeting}</p><h1 className="mx-auto mt-8 max-w-4xl font-serif text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">{t.title.headA}<span className="italic text-[#d72d62]">{t.title.headB}</span></h1><p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#102457]/80 sm:text-xl">{t.title.sub}</p><div className="mt-12 flex justify-center"><ChevronDown className="h-6 w-6 animate-bounce text-[#d72d62]" /></div></div>; }
function Modal({ label, onClose, closeLabel, children }: { label: string; onClose: () => void; closeLabel: string; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { event.stopPropagation(); onClose(); } }; document.addEventListener("keydown", onKey); const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = previous; }; }, [onClose]);
  if (!mounted) return null;
  return createPortal(<div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#3a1d2e]/45 p-4 backdrop-blur-sm sm:items-center sm:p-8" onClick={onClose}>
    <div role="dialog" aria-modal="true" aria-label={label} onClick={(event) => event.stopPropagation()} className="relative my-auto flex max-h-[92svh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#f0cfdc] bg-white text-left font-sans text-[#102457] shadow-2xl shadow-[#c0486f]/15">
      <button type="button" onClick={onClose} aria-label={closeLabel} className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-[#f0cfdc] bg-[#fde8ef] text-[#102457]/85 transition hover:bg-[#fbd5e2] hover:text-[#102457]"><X className="h-4 w-4" /></button>
      <div className="overflow-y-auto px-6 py-7 sm:px-8">{children}</div>
    </div>
  </div>, document.body);
}

function QasasReader({ t, lang, color }: { t: Copy; lang: Lang; color: string }) {
  const [active, setActive] = useState(QASAS_VERSES[0].number);
  const verse = QASAS_VERSES.find((item) => item.number === active) ?? QASAS_VERSES[0];
  return <div className="mt-5">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#102457]/55">{t.philosophy.labels.chooseVerse}</p>
      <div className="flex flex-wrap gap-1.5">{QASAS_VERSES.map((item) => { const open = item.number === active; return <button key={item.number} type="button" onClick={() => setActive(item.number)} aria-pressed={open} style={open ? { backgroundColor: color, borderColor: color, color: "#101d3b" } : undefined} className={`rounded-full border px-3.5 py-1 text-xs font-bold transition ${open ? "" : "border-[#f0cfdc] text-[#102457]/70 hover:border-[#e79ab5] hover:text-[#102457]"}`}>{item.number}</button>; })}</div>
    </div>
    <div className="mt-3 rounded-2xl border border-[#f0cfdc] bg-[#102457]/10 px-5 py-5">
      <p dir="rtl" className="text-center font-serif text-xl leading-[2.15] text-[#102457] sm:text-2xl">{verse.arabic}</p>
    </div>
    <div className="mt-4"><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#102457]/55">{t.philosophy.labels.meaning}</p><p className="mt-2 leading-7 text-[#102457]/85">{lang === "id" ? verse.id : verse.en}</p></div>
  </div>;
}

function PhilosophySlide({ t, lang }: { t: Copy; lang: Lang }) {
  const traditions = TRADITIONS[lang];
  const [active, setActive] = useState<string | null>(null);
  const current = traditions.find((item) => item.id === active);
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#d72d62]">{t.philosophy.eyebrow}</p>
    <h2 className="mx-auto mt-2 max-w-4xl text-center font-serif text-2xl font-bold leading-[1.12] sm:text-[2rem]">{t.philosophy.head}</h2>
    <p className="mx-auto mt-1.5 max-w-2xl text-center text-xs leading-5 text-[#102457]/70 sm:text-sm">{t.philosophy.sub}</p>
    <div className="mt-4 grid gap-2.5 sm:grid-cols-3 lg:grid-cols-6">{traditions.map((tradition) => <button key={tradition.id} onClick={() => setActive(tradition.id)} style={{ borderColor: `${tradition.color}55` }} className="group relative min-h-[132px] overflow-hidden rounded-2xl border bg-white/80 p-3.5 text-left transition duration-300 hover:-translate-y-1 hover:bg-white">
      <span className="absolute -right-6 -top-8 h-24 w-24 rounded-full opacity-20 blur-xl" style={{ backgroundColor: tradition.color }} />
      <div className="relative flex h-full flex-col">
        <span className="grid h-7 w-7 place-items-center rounded-full text-xs font-black text-[#102457]" style={{ backgroundColor: tradition.color }}>{tradition.name.charAt(0)}</span>
        <h3 className="mt-3 text-sm font-bold leading-4">{tradition.name}</h3>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#102457]/55">{tradition.scripture}</p>
        <p className="mt-2.5 text-[11px] leading-4 text-[#102457]/75">{tradition.headline}</p>
        <p className="mt-auto pt-2.5 text-[11px] font-bold uppercase tracking-[.12em] transition group-hover:translate-x-1" style={{ color: tradition.color }}>{t.philosophy.open}</p>
      </div>
    </button>)}</div>
    <div className="mt-3.5 rounded-2xl border border-[#d72d62]/30 bg-[#d72d62]/10 px-6 py-3 text-center">
      <p className="font-serif text-base font-bold text-[#b7791f] sm:text-lg">{t.philosophy.conclusionHead}</p>
      <p className="mx-auto mt-1.5 max-w-4xl text-xs leading-5 text-[#102457]/85">{t.philosophy.conclusionBody}</p>
    </div>
    <p className="mt-2 text-center text-[11px] text-[#102457]/55">{t.philosophy.hint}</p>
    {current && <Modal label={current.name} onClose={() => setActive(null)} closeLabel={t.philosophy.close}>
      <p className="text-xs font-bold uppercase tracking-[.18em]" style={{ color: current.color }}>{current.reference}</p>
      <h3 className="mt-2 pr-10 font-serif text-2xl font-bold leading-tight sm:text-3xl">{current.name}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#102457]/75">{current.headline}</p>
      {current.quote && <blockquote className="mt-5 rounded-2xl border-l-2 bg-white/80 py-4 pl-5 pr-5" style={{ borderColor: current.color }}><p className="font-serif text-xl font-bold leading-8 text-[#102457] sm:text-2xl">&ldquo;{current.quote.text}&rdquo;</p><footer className="mt-2.5 text-xs font-bold uppercase tracking-[.16em]" style={{ color: current.color }}>{current.quote.by}</footer></blockquote>}
      {current.verses ? <QasasReader t={t} lang={lang} color={current.color} /> : <div className="mt-5"><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#102457]/55">{t.philosophy.labels.meaning}</p><p className="mt-2 leading-7 text-[#102457]/85">{current.meaning}</p></div>}
      <div className="mt-5 border-t border-[#f0cfdc] pt-5"><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#102457]/55">{t.philosophy.labels.principles}</p>
        <ul className="mt-3 space-y-2.5">{current.principles.map((principle, index) => <li key={principle} className="flex items-start gap-3 text-sm leading-6 text-[#102457]/90"><span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: current.color }}>{index + 1}</span>{principle}</li>)}</ul>
      </div>
      {current.note && <p className="mt-5 rounded-xl bg-white/80 px-4 py-3 text-xs leading-5 text-[#102457]/55"><span className="font-bold uppercase tracking-[.14em]">{t.philosophy.labels.note}: </span>{current.note}</p>}
    </Modal>}
  </div>;
}

function StatsSlide({ t, lang }: { t: Copy; lang: Lang }) {
  const stats = STATS[lang];
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#d72d62]">{t.stats.eyebrow}</p>
    <h2 className="mx-auto mt-3 max-w-4xl text-center font-serif text-4xl font-bold leading-[1.08] sm:text-6xl">{t.stats.head}</h2>
    <p className="mx-auto mt-4 max-w-3xl text-center text-base leading-7 text-[#102457]/80">{t.stats.sub}</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="relative overflow-hidden rounded-3xl border border-[#f0cfdc] bg-white/80 p-6">
      <span className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-[#d72d62]/10 blur-2xl" />
      <p className="relative font-serif text-4xl font-bold text-[#d72d62]">{stat.value}</p>
      <h3 className="relative mt-3 text-sm font-bold leading-5">{stat.label}</h3>
      <p className="relative mt-3 text-xs leading-5 text-[#102457]/70">{stat.detail}</p>
    </div>)}</div>
    <p className="mx-auto mt-6 max-w-4xl text-center text-[11px] leading-5 text-[#102457]/55">{t.stats.note}</p>
  </div>;
}

function RoutesSlide({ t, lang }: { t: Copy; lang: Lang }) {
  const routes = ROUTES[lang];
  const [active, setActive] = useState<string | null>(null);
  const current = routes.find((item) => item.id === active);
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#d72d62]">{t.routes.eyebrow}</p>
    <h2 className="mx-auto mt-3 max-w-4xl text-center font-serif text-4xl font-bold leading-[1.08] sm:text-5xl">{t.routes.head}</h2>
    <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-6 text-[#102457]/70">{t.routes.sub}</p>
    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{routes.map((route) => <button key={route.id} onClick={() => setActive(route.id)} className="group overflow-hidden rounded-2xl border border-[#f0cfdc] bg-white/80 text-left transition duration-300 hover:-translate-y-1 hover:border-[#e79ab5] hover:bg-white">
      <div className="relative h-28 overflow-hidden sm:h-32">
        <Image src={route.image} alt={route.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 1024px) 90vw, 280px" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,244,248,.25),rgba(255,244,248,.85))]" />
        <p className="absolute left-4 top-4 rounded-full bg-[#fde8ef] px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-[#d72d62]">{route.badge}</p>
      </div>
      <div className="p-4">
        <h3 className="text-base font-bold leading-5">{route.title}</h3>
        <p className="mt-2 text-xs leading-5 text-[#102457]/75">{route.lead}</p>
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[.12em] text-[#d72d62] transition group-hover:translate-x-1">{t.routes.open}</p>
      </div>
    </button>)}</div>
    <p className="mx-auto mt-5 max-w-3xl rounded-2xl border border-[#ef91b1]/35 bg-[#ef91b1]/10 px-5 py-3.5 text-center font-serif text-lg font-bold text-[#c62d5c]">{t.routes.conclusion}</p>
    {current && <Modal label={current.title} onClose={() => setActive(null)} closeLabel={t.routes.close}>
      <div className="relative -mx-6 -mt-7 mb-6 h-40 overflow-hidden sm:-mx-8">
        <Image src={current.image} alt={current.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,244,248,.15),rgba(255,244,248,.92))]" />
        <div className="absolute inset-x-6 bottom-5 sm:inset-x-8"><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#d72d62]">{current.badge}</p><h3 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">{current.title}</h3></div>
      </div>
      <div className="rounded-2xl border-l-2 border-[#7ed6c1] bg-white/80 py-3 pl-4 pr-4"><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#1f8f78]">{t.routes.labels.promise}</p><p className="mt-1.5 text-sm leading-6 text-[#102457]/90">{current.promise}</p></div>
      <div className="mt-5"><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#102457]/55">{t.routes.labels.gaps}</p>
        <div className="mt-3 space-y-2.5">{current.gaps.map((gap, index) => <div key={gap} className="flex items-start gap-3 rounded-xl border border-[#f0cfdc] bg-[#102457]/10 p-3.5"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#ef91b1]/20 text-[11px] font-bold text-[#c62d5c]">{index + 1}</span><p className="text-sm leading-6 text-[#102457]/85">{gap}</p></div>)}</div>
      </div>
      <p className="mt-5 rounded-xl bg-[#fde8ef] p-4 text-sm font-bold leading-6 text-[#b7791f]"><span className="uppercase tracking-[.14em] text-[#102457]/55">{t.routes.labels.impact}: </span>{current.impact}</p>
    </Modal>}
  </div>;
}

function JoblePlanner({ t }: { t: Copy }) {
  const p = t.works.planner;
  const [style, setStyle] = useState("");
  const [guests, setGuests] = useState("");
  const [facilitator, setFacilitator] = useState("");
  const groups = [
    { icon: SlidersHorizontal, title: p.questions[0], options: p.styles, value: style, setValue: setStyle },
    { icon: Users, title: p.questions[1], options: p.guests, value: guests, setValue: setGuests },
    { icon: UserRound, title: p.questions[2], options: p.facilitators, value: facilitator, setValue: setFacilitator },
  ];
  const chosen = [style, guests, facilitator].filter(Boolean);
  return <div className="mt-5 rounded-2xl border border-[#ef91b1]/40 bg-[#ef91b1]/[.08] p-5">
    <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#c62d5c]">{p.title}</p>
    <p className="mt-1 text-xs leading-5 text-[#102457]/65">{p.sub}</p>
    {groups.map(({ icon: Icon, title, options, value, setValue }, index) => <div key={title} className="mt-4 border-t border-[#f0cfdc] pt-4">
      <p className="flex items-center gap-2 text-xs font-bold text-[#102457]/90">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#fde8ef] text-[#c62d5c]"><Icon className="h-3.5 w-3.5" /></span>
        {index + 1}. {title}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">{options.map((option) => <button key={option} type="button" aria-pressed={value === option} onClick={() => setValue(value === option ? "" : option)} className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${value === option ? "border-[#ef91b1] bg-[#ef91b1] text-[#102457]" : "border-[#f0cfdc] text-[#102457]/80 hover:border-[#e79ab5] hover:bg-[#fde8ef] hover:text-[#102457]"}`}>{option}</button>)}</div>
    </div>)}
    <p className="mt-4 text-[11px] leading-4 text-[#102457]/55">{p.guestNote}</p>
    <p className="mt-2.5 flex items-start gap-2.5 rounded-xl bg-[#fde8ef] px-3.5 py-2.5 text-[11px] leading-4 text-[#102457]/80"><Utensils className="mt-px h-3.5 w-3.5 shrink-0 text-[#d72d62]" />{p.foodNote}</p>
    <div className="mt-3 rounded-xl bg-[#fde8ef] px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#102457]/55">{p.summaryLabel}</p>
      <p className="mt-1 text-sm font-bold leading-5 text-[#102457]/90">{chosen.length ? chosen.join(" · ") : <span className="font-normal text-[#102457]/55">{p.summaryEmpty}</span>}</p>
    </div>
  </div>;
}

function HowItWorksSlide({ t }: { t: Copy }) {
  const steps = t.process.stages;
  const [active, setActive] = useState<number | null>(null);
  const current = active === null ? null : steps[active];
  const icons = [ShieldCheck, Users, Heart];
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#d72d62]">{t.works.eyebrow}</p>
    <h2 className="mx-auto mt-2 max-w-3xl text-center font-serif text-3xl font-bold leading-[1.1] sm:text-5xl">{t.works.head}</h2>
    <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-6 text-[#102457]/70">{t.works.sub}</p>
    <div className="mt-6 grid gap-4 lg:grid-cols-[.85fr_1.15fr] lg:items-stretch">
      <div className="relative min-h-[300px] overflow-hidden rounded-3xl border border-[#f0cfdc] shadow-xl shadow-[#c0486f]/15">
        <Image src="/presentations-indonesia-taaruf.png" alt={t.experience.alt} fill className="object-cover" sizes="(max-width: 1024px) 92vw, 460px" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,244,248,.15)_0%,rgba(255,244,248,.92)_72%)]" />
        <div className="absolute inset-x-6 bottom-6">
          <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#d72d62]">{t.experience.tag}</p>
          <p className="mt-3 text-sm leading-6 text-[#102457]/90">{t.experience.para}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{steps.map((step, index) => <button key={step.title} onClick={() => setActive(index)} className="group relative min-h-[120px] overflow-hidden rounded-2xl border border-[#f0cfdc] bg-white/80 p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-[#d72d62]/60 hover:bg-white">
        <span className="inline-flex rounded-full bg-[#fde8ef] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#102457]/80 transition group-hover:bg-[#d72d62] group-hover:text-white">{t.process.stageLabel(index + 1)}</span>
        <p className="mt-3 pr-3 text-sm font-bold leading-5">{step.title}</p>
        <p className="mt-1.5 text-[11px] leading-4 text-[#102457]/60">{step.short}</p>
        <ArrowRight className="absolute bottom-3 right-3 h-4 w-4 text-[#102457]/35 transition group-hover:translate-x-1 group-hover:text-[#d72d62]" />
      </button>)}</div>
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-3">{t.why.items.map(([title, text], index) => {
      const ItemIcon = icons[index];
      return <div key={title} className="flex items-start gap-3 rounded-2xl border border-[#f0cfdc] bg-white/80 px-4 py-3.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ef91b1]/15 text-[#c62d5c]"><ItemIcon className="h-4 w-4" /></span>
        <div><p className="text-xs font-bold leading-4">{title}</p><p className="mt-1 text-[11px] leading-4 text-[#102457]/65">{text}</p></div>
      </div>;
    })}</div>
    {current && <Modal label={current.title} onClose={() => setActive(null)} closeLabel={t.works.close}>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#d72d62]">{current.short}</p>
      <h3 className="mt-2 pr-10 font-serif text-2xl font-bold leading-tight sm:text-3xl"><span className="mr-3 text-[#102457]/40">{t.process.stageLabel((active ?? 0) + 1)}</span>{current.title}</h3>
      <ul className="mt-5 space-y-2.5">{current.points.map((point) => <li key={point} className="flex items-start gap-3 leading-6 text-[#102457]/85"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef91b1]" />{point}</li>)}</ul>
      {current.planner && <JoblePlanner t={t} />}
      <div className="mt-5 border-t border-[#f0cfdc] pt-5"><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#102457]/55">{t.works.detailLabel}</p><p className="mt-2 border-l-2 border-[#ef91b1] pl-4 font-bold leading-7 text-[#c62d5c]">{current.outcome}</p></div>
    </Modal>}
  </div>;
}
function PackageSelectorSlide({ items, pricesVisible, t, lang }: { items: Package[]; pricesVisible: boolean; t: Copy; lang: Lang }) { const [active, setActive] = useState<string | null>(null); const [mounted, setMounted] = useState(false); useEffect(() => { setMounted(true); }, []); useEffect(() => { if (!active) return; const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setActive(null); }; document.addEventListener("keydown", onKey); const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = previous; }; }, [active]); const selectedPackage = items.find((item) => item.name === active); const isTailored = selectedPackage && selectedPackage.name !== "Pearl" && selectedPackage.name !== "Ruby" && selectedPackage.name !== "Diamond"; const cardCopyFor = (item: Package) => item.name === "Pearl" ? t.packages.cards.pearl : item.name === "Ruby" ? t.packages.cards.ruby : item.name === "Diamond" ? t.packages.cards.diamond : t.packages.cards.tailored; const gemFor = (item: Package) => item.name === "Pearl" ? "/pearl.png" : item.name === "Ruby" ? "/ruby.png" : item.name === "Diamond" ? "/diamond.png" : null; const cardTitle = (item: Package) => cardCopyFor(item)[0]; const cardCopy = (item: Package) => cardCopyFor(item)[1]; return <div className="mx-auto w-full max-w-6xl"><p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#d72d62]">{t.packages.eyebrow}</p><h2 className="mt-2 text-center font-serif text-4xl font-bold sm:text-5xl">{t.packages.head}</h2><p className="mx-auto mt-2 max-w-2xl text-center leading-6 text-[#102457]/75">{t.packages.sub}</p><div className={`mx-auto mt-6 grid max-w-4xl gap-3 ${items.length === 1 ? "max-w-sm" : items.length === 2 ? "sm:grid-cols-2" : items.length === 4 ? "max-w-3xl sm:grid-cols-2" : "sm:grid-cols-3"}`}>{items.map((item) => <button key={item.name} onClick={() => setActive((current) => current === item.name ? null : item.name)} className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition duration-300 ${active === item.name ? "border-[#d72d62] bg-white shadow-xl shadow-[#c0486f]/15" : "border-[#f0cfdc] bg-white/80 hover:-translate-y-1 hover:border-[#e79ab5] hover:bg-white"}`}><span className="absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-25 blur-2xl" style={{ backgroundColor: item.accent }} />{gemFor(item) ? <span className="relative block h-16 w-16 overflow-hidden rounded-2xl bg-[#1d2552]"><Image src={gemFor(item)!} alt={item.name} fill className="object-contain mix-blend-screen drop-shadow-[0_6px_18px_rgba(0,0,0,.45)] transition duration-500 group-hover:scale-110" sizes="64px" /></span> : <span className="relative grid h-16 w-16 place-items-center rounded-full border border-dashed" style={{ borderColor: item.accent, color: item.accent }}><Settings2 className="h-6 w-6" /></span>}<span className="relative mt-4 block h-1.5 w-10 rounded-full" style={{ backgroundColor: item.accent }} /><h3 className="relative mt-3 text-lg font-bold leading-tight">{cardTitle(item)}</h3><p className="relative mt-1 text-xs leading-5 text-[#102457]/70">{cardCopy(item)}</p><p className="relative mt-4 text-xs font-bold uppercase tracking-[.14em] text-[#102457]/55">{active === item.name ? t.packages.close : t.packages.view}</p></button>)}</div>{selectedPackage && mounted && createPortal(<div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#3a1d2e]/45 p-4 backdrop-blur-sm sm:items-center sm:p-8" onClick={() => setActive(null)}><div role="dialog" aria-modal="true" aria-label={selectedPackage.name} onClick={(event) => event.stopPropagation()} className="relative my-auto flex max-h-[92svh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#f0cfdc] bg-white text-left font-sans text-[#102457] shadow-2xl shadow-[#c0486f]/15"><button type="button" onClick={() => setActive(null)} aria-label={t.packages.close} className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-[#f0cfdc] bg-[#fde8ef] text-[#102457]/85 transition hover:bg-[#fbd5e2] hover:text-[#102457]"><X className="h-4 w-4" /></button><div className="overflow-y-auto px-6 py-7 sm:px-8">{isTailored ? <TailoredPlanBuilder t={t} lang={lang} /> : <><div className="flex flex-col gap-4 pr-10 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em]" style={{ color: selectedPackage.accent }}>{selectedPackage.label}</p><div className="mt-2 flex items-center gap-3">{gemFor(selectedPackage) && <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#1d2552]"><Image src={gemFor(selectedPackage)!} alt={selectedPackage.name} fill className="object-contain mix-blend-screen" sizes="48px" /></span>}<h3 className="font-serif text-3xl font-bold">{selectedPackage.name}</h3></div><p className="mt-2 max-w-2xl leading-6 text-[#102457]/80">{selectedPackage.description}</p><p className="mt-3 text-xs font-bold uppercase tracking-[.14em] text-[#102457]/55">{selectedPackage.window}</p></div>{pricesVisible && <div className="shrink-0 sm:text-right"><p className="text-3xl font-bold" style={{ color: selectedPackage.accent }}>{selectedPackage.price}</p>{selectedPackage.savings && <p className="mt-0.5 text-xs font-bold text-[#102457]/60 sm:max-w-[12rem]">{selectedPackage.savings}</p>}</div>}</div><div className="mt-6 border-t border-[#f0cfdc] pt-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#102457]/55">{t.packages.journey}</p><StagedFeatures pkg={selectedPackage} t={t} /></div></>}</div></div></div>, document.body)}</div>; }

function StagedFeatures({ pkg, t }: { pkg: Package; t: Copy }) { if (!pkg.stages) return <ol className="mt-3 space-y-2.5">{(pkg.features ?? []).map((feature, i) => <li key={feature} className="flex items-start gap-3 text-sm leading-5 text-[#102457]/90"><span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: pkg.accent }}>{i + 1}</span>{feature}</li>)}</ol>; return <div className="mt-3">{pkg.includes && <p className="mb-3 text-sm font-bold text-[#102457]/90">{pkg.includes}</p>}<div className="space-y-3">{pkg.stages.map(({ stage, items }) => <div key={stage} className="grid gap-2 rounded-2xl border border-[#f0cfdc] bg-white/80 p-4 sm:grid-cols-[11rem_1fr] sm:gap-4"><div><span className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[.14em] text-white" style={{ backgroundColor: pkg.accent }}>{t.process.stageLabel(stage)}</span><p className="mt-1.5 text-xs font-bold leading-4 text-[#102457]/70">{t.process.stages[stage - 1].title}</p></div><ul className="space-y-1.5">{items.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm leading-5 text-[#102457]/90"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: pkg.accent }} />{item}</li>)}</ul></div>)}</div></div>; }

function TailoredPlanBuilder({ t, lang }: { t: Copy; lang: Lang }) { const options = [{ id: "onboarding", title: t.builder.options.onboarding, price: 1_250_000 }, { id: "psychology", title: t.builder.options.psychology, price: 1_250_000 }, { id: "background", title: t.builder.options.background, price: 2_750_000 }, { id: "online", title: t.builder.options.online, price: 300_000 }, { id: "family", title: t.builder.options.family, price: 4_500_000 }, { id: "joble", title: t.builder.options.joble, price: 500_000 }]; const [chosen, setChosen] = useState<string[]>(["onboarding", "online"]); const [order, setOrder] = useState(options.map((option) => option.id)); const [dragging, setDragging] = useState<string | null>(null); const [onlineSessions, setOnlineSessions] = useState(3); const [psychologySessions, setPsychologySessions] = useState(1); const orderedOptions = order.map((id) => options.find((option) => option.id === id)!).filter(Boolean); const toggle = (id: string) => setChosen((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); const changeCount = (setter: React.Dispatch<React.SetStateAction<number>>, amount: number) => setter((count) => Math.max(1, Math.min(12, count + amount))); const moveTo = (target: string) => { if (!dragging || dragging === target) return; setOrder((current) => { const next = current.filter((id) => id !== dragging); next.splice(next.indexOf(target), 0, dragging); return next; }); setDragging(null); }; const lineTotal = (option: { id: string; price: number }) => option.id === "online" ? option.price * onlineSessions : option.id === "psychology" ? option.price * psychologySessions : option.price; const total = orderedOptions.filter((option) => chosen.includes(option.id)).reduce((sum, option) => sum + lineTotal(option), 0); const formatRupiah = (amount: number) => `Rp ${amount.toLocaleString(lang === "id" ? "id-ID" : "en-US")}`; const summary = orderedOptions.filter((option) => chosen.includes(option.id)).map((option) => option.id === "online" ? t.builder.onlineSummary(onlineSessions) : option.id === "psychology" ? t.builder.psychologySummary(psychologySessions) : option.title); return <div className="mx-auto mt-5 max-w-5xl rounded-3xl border border-[#a88ae6]/50 bg-[#a88ae6]/[.09] p-5 text-left sm:p-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d4fc9]">{t.builder.eyebrow}</p><h3 className="mt-1 font-serif text-2xl font-bold">{t.builder.head}</h3></div><p className="text-xs font-bold text-[#6d4fc9]">{t.builder.selectedCount(chosen.length)}</p></div><p className="mt-1 text-xs text-[#102457]/55">{t.builder.sub}</p><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{orderedOptions.map((option) => { const selected = chosen.includes(option.id); const hasCounter = selected && (option.id === "online" || option.id === "psychology"); const value = option.id === "online" ? onlineSessions : psychologySessions; const setter = option.id === "online" ? setOnlineSessions : setPsychologySessions; return <div key={option.id} draggable onDragStart={() => setDragging(option.id)} onDragEnd={() => setDragging(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => moveTo(option.id)} className={`relative rounded-xl border transition ${dragging === option.id ? "scale-95 opacity-50" : ""} ${selected ? "border-[#c9b6ff] bg-[#a88ae6]/25" : "border-[#f0cfdc] bg-white/80 hover:border-[#e79ab5]"}`}><span className="absolute right-2 top-2 cursor-grab text-xs tracking-[-.18em] text-[#102457]/45" aria-hidden>⋮⋮</span><button onClick={() => toggle(option.id)} className="flex min-h-[54px] w-full items-center gap-3 px-3 py-2 pr-8 text-left"><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold ${selected ? "bg-[#c9b6ff] text-[#211a3b]" : "bg-[#fde8ef] text-[#102457]/55"}`}>{selected ? "✓" : "+"}</span><span><p className="text-xs font-bold leading-4">{option.title}</p><p className="mt-0.5 text-[11px] font-bold text-[#6d4fc9]">{formatRupiah(option.price)}{option.id === "online" || option.id === "psychology" ? t.builder.perSession : ""}</p></span></button>{hasCounter && <div className="flex items-center justify-between border-t border-[#c9b6ff]/25 px-3 py-2"><span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#6d4fc9]">{t.builder.howMany}</span><div className="flex items-center gap-2"><button onClick={() => changeCount(setter, -1)} className="grid h-6 w-6 place-items-center rounded-full bg-[#fde8ef] text-sm font-bold hover:bg-[#fbd5e2]" aria-label={t.builder.decrease(option.title)}>−</button><span className="w-4 text-center text-sm font-bold text-[#6d4fc9]">{value}</span><button onClick={() => changeCount(setter, 1)} className="grid h-6 w-6 place-items-center rounded-full bg-[#c9b6ff] text-sm font-bold text-[#211a3b]" aria-label={t.builder.increase(option.title)}>+</button></div></div>}</div>; })}</div><div className="mt-3 rounded-xl bg-[#fde8ef] px-4 py-3"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#102457]/55">{t.builder.totalLabel}</p>{chosen.length > 0 && <p className="text-sm font-bold text-[#6d4fc9]">{formatRupiah(total)}</p>}</div><p className="mt-1 text-sm leading-5 text-[#102457]/85">{summary.length ? summary.join(" → ") : t.builder.empty}</p></div></div>; }
function ReassuranceSlide({ t }: { t: Copy }) { const answers = t.faq.items; const [active, setActive] = useState(0); const current = answers[active]; const colors = ["#d72d62","#ef91b1","#7ed6c1","#c9b6ff","#ef91b1","#7ed6c1","#d72d62","#c9b6ff"]; return <div className="mx-auto w-full max-w-6xl"><p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#d72d62]">{t.faq.eyebrow}</p><h2 className="mt-3 text-center font-serif text-4xl font-bold sm:text-6xl">{t.faq.head}</h2><p className="mx-auto mt-3 max-w-xl text-center text-sm leading-6 text-[#102457]/70">{t.faq.sub}</p><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{answers.map(([question], index) => { const color = colors[index]; const open = active === index; return <button key={question} onClick={() => setActive(index)} style={{ borderColor: open ? color : undefined, background: open ? `linear-gradient(135deg,${color}33,rgba(255,255,255,.92))` : undefined }} className={`group relative min-h-[116px] overflow-hidden rounded-2xl border p-4 text-left transition duration-300 ${open ? "-translate-y-1 shadow-xl shadow-[#c0486f]/15" : "border-[#f0cfdc] bg-white/80 hover:-translate-y-1 hover:border-[#e79ab5] hover:bg-white"}`}><span className="absolute -right-5 -top-7 h-20 w-20 rounded-full opacity-20 blur-sm" style={{ backgroundColor: color }} /><div className="relative flex items-start justify-between"><span className="grid h-8 w-8 place-items-center rounded-full text-xs font-black text-[#102457]" style={{ backgroundColor: color }}>0{index + 1}</span><span className={`grid h-7 w-7 place-items-center rounded-full border text-base font-light transition ${open ? "border-[#d72d62]/60 text-[#102457]" : "border-[#f0cfdc] text-[#102457]/65 group-hover:bg-[#fde8ef]"}`}>{open ? "−" : "+"}</span></div><h3 className="relative mt-4 pr-4 text-sm font-bold leading-5">{question}</h3></button>; })}</div><div className="mt-4 overflow-hidden rounded-3xl border border-[#f0cfdc] bg-white/80 sm:grid sm:grid-cols-[.85fr_1.15fr]"><div className="p-6 sm:p-8" style={{ background: `linear-gradient(135deg,${colors[active]}30,transparent)` }}><p className="text-xs font-bold uppercase tracking-[.2em]" style={{ color: colors[active] }}>{t.faq.yourQuestion}</p><h3 className="mt-3 font-serif text-2xl font-bold leading-tight sm:text-3xl">{current[0]}</h3></div><div className="flex items-center p-6 sm:p-8"><p className="leading-7 text-[#102457]/85">{current[1]}</p></div></div></div>; }
function CloseSlide({ t }: { t: Copy }) { return <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#f0cfdc] shadow-2xl shadow-[#c0486f]/15"><Image src="/presentations-indonesia-wedding-celebration.png" alt={t.close.alt} fill className="object-cover" sizes="(max-width: 1024px) 95vw, 1152px" priority /><div className="relative min-h-[500px] bg-[linear-gradient(90deg,rgba(255,244,248,.94)_0%,rgba(255,244,248,.78)_42%,rgba(255,244,248,.12)_100%)] p-8 sm:min-h-[540px] sm:p-12"><div className="flex h-full max-w-xl flex-col justify-center text-left"><p className="text-xs font-bold uppercase tracking-[.25em] text-[#d72d62]">{t.close.eyebrow}</p><h2 className="mt-6 font-serif text-4xl font-bold leading-tight sm:text-6xl">{t.close.headA}<span className="italic text-[#d72d62]">{t.close.headB}</span></h2><p className="mt-6 max-w-lg text-base leading-7 text-[#102457]/85 sm:text-lg sm:leading-8">{t.close.para}</p><a href={"https://wa.me/628138858595?text=" + encodeURIComponent(t.whatsapp)} target="_blank" rel="noopener noreferrer" className="mt-9 inline-flex w-fit items-center gap-2 rounded-full bg-[#d85b87] px-7 py-4 font-bold transition hover:bg-[#c44874] !text-white"><MessageCircle className="h-5 w-5" />{t.close.cta}</a></div></div></div>; }

function PresenterTools({ selected, setSelected, showPrices, setShowPrices, packagePrices, setPackagePrices, custom, setCustom, onClose, t }: { selected: { pearl: boolean; ruby: boolean; diamond: boolean }; setSelected: React.Dispatch<React.SetStateAction<{ pearl: boolean; ruby: boolean; diamond: boolean }>>; showPrices: boolean; setShowPrices: React.Dispatch<React.SetStateAction<boolean>>; packagePrices: { pearl: string; ruby: string; diamond: string }; setPackagePrices: React.Dispatch<React.SetStateAction<{ pearl: string; ruby: string; diamond: string }>>; custom: Package | null; setCustom: React.Dispatch<React.SetStateAction<Package | null>>; onClose: () => void; t: Copy }) { const [name, setName] = useState(custom?.name ?? ""); const [price, setPrice] = useState(custom?.price ?? ""); const [window, setWindow] = useState(custom?.window ?? ""); const [description, setDescription] = useState(custom?.description ?? ""); const [features, setFeatures] = useState(custom?.features.join("\n") ?? ""); const save = () => { if (!name.trim()) return; setCustom({ name: name.trim(), label: t.presenter.customTitle.toUpperCase(), price: price.trim() || t.presenter.defaultPrice, window: window.trim() || t.presenter.defaultWindow, description: description.trim() || t.presenter.defaultDescription, features: features.split("\n").map((item) => item.trim()).filter(Boolean), accent: "#a88ae6" }); }; return <aside className="absolute inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-[#f0cfdc] bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#d72d62]">{t.presenter.eyebrow}</p><h2 className="mt-2 font-serif text-3xl font-bold">{t.presenter.head}</h2></div><button onClick={onClose} className="rounded-full p-2 hover:bg-[#fde8ef]" aria-label={t.presenter.close}><X className="h-5 w-5" /></button></div><p className="mt-4 text-sm leading-6 text-[#102457]/75">{t.presenter.intro}</p><div className="mt-8 space-y-3"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#102457]/55">{t.presenter.pricesTitle}</p><label className="flex items-center gap-2 text-xs font-bold text-[#d72d62]">{t.presenter.showPrices} <input type="checkbox" checked={showPrices} onChange={(e) => setShowPrices(e.target.checked)} className="h-4 w-4 accent-[#d85b87]" /></label></div>{([['pearl', 'Pearl'], ['ruby', 'Ruby'], ['diamond', 'Diamond']] as const).map(([key, label]) => <div key={key} className="rounded-xl border border-[#f0cfdc] p-4"><div className="flex items-center justify-between"><span className="font-bold">{label}</span><label className="flex items-center gap-2 text-xs text-[#102457]/75">{t.presenter.show} <input type="checkbox" checked={selected[key]} onChange={(e) => setSelected((current) => ({ ...current, [key]: e.target.checked }))} className="h-4 w-4 accent-[#d85b87]" /></label></div><input value={packagePrices[key]} onChange={(e) => setPackagePrices((current) => ({ ...current, [key]: e.target.value }))} placeholder={t.presenter.pricePlaceholder} className="mt-3 w-full rounded-lg border border-[#f0cfdc] bg-white/80 px-3 py-2.5 text-sm outline-none placeholder:text-[#102457]/45 focus:border-[#d72d62]" /></div>)}</div><div className="mt-8 border-t border-[#f0cfdc] pt-7"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#102457]/55">{t.presenter.customTitle}</p>{custom && <button onClick={() => setCustom(null)} className="text-xs font-bold text-[#d72d62]">{t.presenter.remove}</button>}</div><div className="mt-4 space-y-3"><input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.presenter.namePlaceholder} className="w-full rounded-xl border border-[#f0cfdc] bg-white/80 px-4 py-3 text-sm outline-none placeholder:text-[#102457]/45 focus:border-[#d72d62]" /><div className="grid grid-cols-2 gap-3"><input value={price} onChange={(e) => setPrice(e.target.value)} placeholder={t.presenter.freePricePlaceholder} className="w-full rounded-xl border border-[#f0cfdc] bg-white/80 px-4 py-3 text-sm outline-none placeholder:text-[#102457]/45 focus:border-[#d72d62]" /><input value={window} onChange={(e) => setWindow(e.target.value)} placeholder={t.presenter.durationPlaceholder} className="w-full rounded-xl border border-[#f0cfdc] bg-white/80 px-4 py-3 text-sm outline-none placeholder:text-[#102457]/45 focus:border-[#d72d62]" /></div><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.presenter.descPlaceholder} rows={3} className="w-full rounded-xl border border-[#f0cfdc] bg-white/80 px-4 py-3 text-sm outline-none placeholder:text-[#102457]/45 focus:border-[#d72d62]" /><textarea value={features} onChange={(e) => setFeatures(e.target.value)} placeholder={t.presenter.featuresPlaceholder} rows={5} className="w-full rounded-xl border border-[#f0cfdc] bg-white/80 px-4 py-3 text-sm outline-none placeholder:text-[#102457]/45 focus:border-[#d72d62]" /><button onClick={save} className="w-full rounded-xl bg-[#a88ae6] px-4 py-3 text-sm font-bold text-[#171129]">{custom ? t.presenter.update : t.presenter.add}</button></div></div></aside>; }
