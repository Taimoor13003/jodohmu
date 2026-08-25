"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronDown, Expand, Heart, Languages, ShieldCheck, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type TopicContent = { eyebrow: string; title: string; lead: string; points: string[]; closing?: string };
type StatisticsContent = { eyebrow: string; title: string; lead: string; items: { value?: string; label: string; detail: string }[]; note: string };
type RouteContent = { eyebrow: string; title: string; lead: string; promise: string; gaps: string[]; impact: string };
type StepsContent = { eyebrow: string; title: string; lead: string; steps: { title: string; detail: string; solves?: string }[] };
type PrinciplesContent = { eyebrow: string; title: string; lead: string; principles: { title: string; detail: string }[]; note: string };
type PackagesContent = { eyebrow: string; title: string; lead: string; packages: { name: string; detail: string; fit: string }[]; note: string };
type BenefitsContent = { eyebrow: string; title: string; lead: string; benefits: { title: string; detail: string }[]; closing: string };
type DeckContent = {
  problem: TopicContent; statistics: StatisticsContent; apps: RouteContent; family: RouteContent; community: RouteContent; natural: RouteContent;
  missingSystem: TopicContent; consequences: TopicContent; taarufGap: TopicContent; need: TopicContent; howItWorks: StepsContent;
  solutions: TopicContent; principles: PrinciplesContent; packages: PackagesContent; benefits: BenefitsContent;
};

const indonesianContent: DeckContent = {
  problem: {
    eyebrow: "Masalah yang nyata", title: "Mengapa mencari orang yang tepat terasa semakin sulit?",
    lead: "Kemudahan untuk bertemu banyak orang belum tentu memberi ketenangan untuk memilih satu orang dengan benar.",
    points: ["Pilihan terasa tidak ada habisnya, tetapi niat orang sulit dibaca.", "Perhatian cepat terasa seperti kedekatan, padahal belum tentu ada arah.", "Keputusan besar sering dimulai dari proses yang kecil, samar, dan tidak terarah."],
    closing: "Mencari jodoh bukan hanya soal menemukan seseorang—tetapi menemukan proses yang benar.",
  },
  statistics: {
    eyebrow: "Realita Indonesia", title: "Lima tanda yang tidak bisa kita abaikan.",
    lead: "Setiap angka mengukur hal yang berbeda dan tidak membuktikan satu penyebab tunggal. Bersama-sama, mereka menunjukkan tekanan nyata pada generasi yang sedang membangun masa depan.",
    items: [
      { value: "7,1%", label: "pelajar usia 13–17 pernah berhubungan seksual", detail: "GSHS 2023 mencatat pengalaman hubungan seksual pada pelajar. Ini adalah ukuran perilaku yang dilaporkan—bukan ukuran semua zina atau penilaian atas individu." },
      { value: "12,3 juta", label: "usia 25–34 belum pernah menikah", detail: "Data status perkawinan BPS 2022 mencatat 12.258.261 orang usia 25–34 berstatus belum kawin." },
      { value: "5,3%", label: "remaja mengalami depresi", detail: "I-NAMHS 2022 menemukan depresi pada 5,3% remaja usia 10–17 dalam 12 bulan terakhir." },
      { value: "13,3%", label: "lebih sedikit pencatatan nikah", detail: "Dalam dua tahun, pencatatan nikah turun dari 1.705.348 pada 2022 menjadi 1.478.302 pada 2024." },
      { value: "2,12", label: "rata-rata anak per perempuan", detail: "Total Fertility Rate Indonesia pada 2024 tercatat 2,12; BPS juga mencatat kelahiran 2023 sebesar 4,595 juta dan tren fertilitas yang terus menurun." },
    ],
    note: "Sumber: WHO GSHS 2023; BPS Long Form SP2020 (status perkawinan 2022) dan Indikator Kesejahteraan Rakyat 2024; Kemenkes/I-NAMHS 2022; Kemenag/SIMKAH. Angka adalah sinyal sosial, bukan alasan untuk menghakimi individu atau mengklaim sebab-akibat yang tidak terbukti.",
  },
  apps: {
    eyebrow: "Cara 01 · Aplikasi kencan", title: "Dating apps: banyak match, sedikit arah menuju nikah.",
    lead: "Dating apps membuat pertemuan terasa mudah. Namun desainnya sering mendorong swipe, perhatian, dan percakapan tanpa batas—bukan kesiapan untuk keputusan hidup.",
    promise: "Yang dijanjikan: cepat, luas, dan mudah dimulai.",
    gaps: ["Niat sering tidak jelas atau berubah-ubah.", "Verifikasi identitas, karakter, dan latar belakang terbatas.", "Swipe dan perbandingan terus-menerus membuat orang terasa seperti pilihan sekali pakai.", "Kedekatan emosional dapat tumbuh sebelum ada komitmen yang serius."],
    impact: "Akibatnya: lelah, bingung, sulit percaya, dan mudah terikat pada proses yang tidak punya arah.",
  },
  family: {
    eyebrow: "Cara 02 · Referensi keluarga", title: "Aman dan tepercaya—tetapi sering sangat terbatas.",
    lead: "Keluarga dapat membuka pintu yang baik, tetapi jaringan informal tidak selalu cukup untuk menemukan kecocokan yang tepat.",
    promise: "Yang ditawarkan: kepercayaan, niat baik, dan keterlibatan keluarga sejak awal.",
    gaps: ["Pilihan kandidat biasanya sangat sedikit.", "Kecocokan nilai, komunikasi, dan kesiapan jarang dinilai secara terstruktur.", "Ada tekanan untuk melanjutkan karena keluarga sudah saling mengenal.", "Saat tidak cocok, situasinya dapat terasa canggung bagi semua pihak."],
    impact: "Akibatnya: orang bisa menolak kesempatan baik karena takut canggung, atau menerima terlalu cepat karena tekanan.",
  },
  community: {
    eyebrow: "Cara 03 · Ustaz atau pemimpin komunitas", title: "Dipercaya, tetapi bukan sebuah sistem lengkap.",
    lead: "Ustaz dan pemimpin komunitas memberi arahan yang berharga; namun matchmaking biasanya bukan tugas utama atau keahlian operasional mereka.",
    promise: "Yang ditawarkan: nilai yang sejalan, kepercayaan, dan nasihat yang baik.",
    gaps: ["Waktu dan kapasitas mereka sangat terbatas.", "Mereka tidak selalu memiliki pool kandidat yang luas dan terverifikasi.", "Sering tidak ada sistem baku untuk kesiapan, kecocokan, atau tindak lanjut.", "Beban koordinasi dapat menjadi terlalu besar bagi satu orang."],
    impact: "Akibatnya: niat baik belum tentu berubah menjadi proses yang konsisten dan aman untuk semua pihak.",
  },
  natural: {
    eyebrow: "Cara 04 · Bertemu secara alami", title: "Harapan tanpa proses yang jelas.",
    lead: "Bertemu di sekolah, kerja, perjalanan, atau kegiatan sehari-hari memang bisa terjadi—tetapi terlalu banyak bergantung pada kebetulan.",
    promise: "Yang ditawarkan: pertemuan terasa spontan dan alami.",
    gaps: ["Niat belum tentu jelas sejak awal.", "Kedekatan emosi dapat tumbuh sebelum nilai dan kesiapan dibicarakan.", "Keluarga serta batasan sering baru hadir ketika masalah sudah terjadi.", "Latar belakang, karakter, dan tujuan hidup belum teruji."],
    impact: "Akibatnya: proses dapat berubah menjadi rahasia, membingungkan, atau berakhir tanpa arah yang baik.",
  },
  missingSystem: {
    eyebrow: "Inti persoalan", title: "Masalahnya bukan orangnya—sistemnya yang hilang.",
    lead: "Setiap jalur bisa berangkat dari niat baik. Yang sering tidak ada adalah proses yang menyatukan akses, kejelasan, verifikasi, adab, dan dukungan keluarga.",
    points: ["Akses tanpa verifikasi menciptakan risiko.", "Niat tanpa struktur menciptakan kebingungan.", "Keluarga tanpa proses menciptakan tekanan.", "Nasihat tanpa kapasitas operasional sulit menjangkau banyak orang."],
    closing: "Muslim hari ini membutuhkan jalan yang modern, tetapi tetap menjaga prinsip.",
  },
  consequences: {
    eyebrow: "Biaya yang sering tidak terlihat", title: "Ketika prosesnya salah, hati dan masa depan ikut menanggung akibatnya.",
    lead: "Masalahnya bukan sekadar putus hubungan. Proses yang tidak jelas memengaruhi cara seseorang percaya, memilih, dan membangun rumah tangga nanti.",
    points: ["Kelelahan emosi dan rasa takut untuk percaya lagi.", "Perbandingan, kecemasan, dan rasa diri tidak cukup.", "Ikatan yang tumbuh sebelum ada kesiapan atau komitmen.", "Waktu, perhatian, dan batasan yang terpakai tanpa arah pernikahan."],
    closing: "Hati membutuhkan arah. Nilai memberi perlindungan.",
  },
  taarufGap: {
    eyebrow: "Realita ta’aruf hari ini", title: "Ta’aruf adalah prinsip yang baik. Akses dan dukungannya masih perlu diperkuat.",
    lead: "Banyak orang menginginkan proses yang beradab, tetapi tidak tahu harus mulai dari mana atau siapa yang dapat dipercaya.",
    points: ["Jaringan kandidat sering sangat terbatas.", "Verifikasi dan kesiapan belum selalu jelas.", "Komunikasi dapat terlalu cepat, terlalu kaku, atau tidak punya fasilitator.", "Keluarga membutuhkan ruang untuk terlibat tanpa mengambil alih pilihan dua orang."],
    closing: "Yang dibutuhkan bukan mengganti ta’aruf—melainkan membuatnya lebih mudah diakses, aman, dan terstruktur.",
  },
  need: {
    eyebrow: "Mengapa ini dibutuhkan", title: "Masalah modern membutuhkan sistem yang lebih bertanggung jawab.",
    lead: "Muslim tidak harus memilih antara kemudahan zaman modern dan nilai Islam. Keduanya dapat berjalan bersama bila prosesnya dirancang dengan benar.",
    points: ["Teknologi dapat membuka akses, tetapi manusia tetap perlu menilai dengan bijak.", "Verifikasi melindungi niat baik dari risiko yang tidak perlu.", "Pendampingan membantu orang berbicara dengan jujur dan tetap beradab.", "Keluarga dapat hadir pada waktu yang tepat, dengan peran yang sehat."],
  },
  howItWorks: {
    eyebrow: "Proses Jodohmu", title: "Bagaimana Jodohmu bekerja",
    lead: "Sebuah perjalanan terarah untuk orang dewasa yang serius menuju pernikahan.",
    steps: [
      { title: "1. Dengarkan cerita", detail: "Tujuan menikah, nilai, batasan, dan gambaran masa depan dibahas secara pribadi.", solves: "Menyelesaikan: proses yang dimulai dari tebakan atau profil dangkal." },
      { title: "2. Jelas sebelum diperkenalkan", detail: "Sejak awal, kedua pihak tahu pertemuan ini memiliki niat menuju pernikahan—bukan chat tanpa arah.", solves: "Menyelesaikan: keterikatan emosional sebelum niat dibicarakan." },
      { title: "3. Verifikasi dengan hati-hati", detail: "Identitas dan informasi penting ditinjau sesuai paket untuk membangun rasa aman.", solves: "Menyelesaikan: risiko profil dan janji yang tidak dapat dipercaya." },
      { title: "4. Pilih format yang nyaman", detail: "Anda memilih bagaimana perkenalan terjadi: waktu, gaya percakapan, pendamping, dan fasilitator bila diinginkan.", solves: "Menyelesaikan: rasa takut bahwa ta’aruf harus kaku atau memaksa." },
      { title: "5. Ruang untuk memilih", detail: "Tidak ada kontak atau pertemuan yang dipaksakan; respons setelah perkenalan diberikan secara privat.", solves: "Menyelesaikan: tekanan dari keluarga, fasilitator, atau proses itu sendiri." },
      { title: "6. Libatkan keluarga saat tepat", detail: "Keluarga hadir ketika kedua pihak siap membawa proses ke tahap yang lebih serius.", solves: "Menyelesaikan: keluarga yang hadir terlambat atau mengambil alih pilihan dua orang." },
    ],
  },
  solutions: {
    eyebrow: "Jawaban yang lebih jelas", title: "Jodohmu menyelesaikan masalah proses—bukan menjual janji jodoh instan.",
    lead: "Peran kami adalah membuat jalan menuju pernikahan lebih aman, jelas, dan manusiawi.",
    points: ["Dari niat yang samar menjadi percakapan yang serius.", "Dari profil yang tidak pasti menjadi verifikasi yang lebih bertanggung jawab.", "Dari proses sendirian menjadi pendampingan manusia.", "Dari hubungan rahasia menjadi jalan yang menghormati batasan dan keluarga."],
  },
  principles: {
    eyebrow: "Mendukung prinsip Islam", title: "Nilai Islam bukan tambahan di akhir proses—ia menjadi cara proses itu dijalankan.",
    lead: "Jodohmu dirancang untuk mendukung adab dan tanggung jawab; bukan pengganti wali, keluarga, atau bimbingan ulama.",
    principles: [
      { title: "Niat yang jelas", detail: "Fokus pada kesiapan menuju pernikahan, bukan sekadar perhatian." },
      { title: "Batasan yang dihormati", detail: "Proses dan komunikasi diarahkan agar tetap sopan dan bermartabat." },
      { title: "Persetujuan dua pihak", detail: "Tidak ada kontak atau pertemuan yang dipaksakan." },
      { title: "Keluarga dan wali", detail: "Dapat dilibatkan pada saat yang tepat sesuai kebutuhan dan keyakinan." },
    ],
    note: "Untuk pertanyaan fiqih atau keputusan khusus, tetap rujuk kepada wali, ustaz, atau pembimbing agama yang tepercaya.",
  },
  packages: {
    eyebrow: "Pilihan pendampingan", title: "Paket yang mengikuti tingkat dukungan yang dibutuhkan.",
    lead: "Setiap perjalanan berbeda. Paket menjelaskan seberapa dalam dukungan, verifikasi, dan pendampingan yang diperlukan.",
    packages: [
      { name: "Pearl", detail: "Langkah awal yang jelas untuk memulai proses dengan serius.", fit: "Untuk orang yang membutuhkan struktur awal dan arahan." },
      { name: "Ruby", detail: "Pendampingan yang lebih mendalam, dengan verifikasi dan sourcing aktif.", fit: "Untuk orang yang siap menjalani proses serius dengan dukungan intensif." },
      { name: "Diamond", detail: "Pendampingan paling privat dan menyeluruh bersama tim inti.", fit: "Untuk kebutuhan yang sangat personal, rahasia, dan kompleks." },
    ],
    note: "Detail investasi dan kesesuaian paket dibahas secara pribadi bersama orang dewasa dan, bila sesuai, keluarga mereka.",
  },
  benefits: {
    eyebrow: "Manfaat yang lebih besar", title: "Ketika prosesnya lebih baik, keluarga dan masyarakat ikut menerima manfaat.",
    lead: "Pernikahan yang kuat bukan hanya tentang dua orang—tetapi tentang rumah, keluarga, dan generasi berikutnya.",
    benefits: [
      { title: "Lebih sedikit kerahasiaan", detail: "Proses yang terarah memberi ruang bagi komunikasi yang lebih jujur." },
      { title: "Lebih banyak perlindungan", detail: "Verifikasi dan pendampingan mengurangi risiko yang tidak perlu." },
      { title: "Keluarga yang lebih siap", detail: "Keluarga dapat hadir dengan peran yang sehat dan tepat waktu." },
      { title: "Rumah tangga yang lebih sadar", detail: "Pasangan masuk ke pernikahan dengan lebih banyak kejelasan dan tanggung jawab." },
    ],
    closing: "Menjaga nilai dalam proses mencari jodoh adalah investasi untuk masa depan umat.",
  },
};

const englishContent: DeckContent = {
  problem: {
    eyebrow: "The real problem", title: "Why has finding the right person become so difficult?",
    lead: "Meeting more people does not necessarily give us the peace to choose one person well.",
    points: ["There are many options, but people’s intentions are hard to read.", "Quick attention can feel like closeness, even when there is no shared direction.", "A life-changing decision often begins through a small, vague, unstructured process."],
    closing: "Finding a spouse is not only about finding someone—it is about finding the right process.",
  },
  statistics: {
    eyebrow: "Indonesia’s reality", title: "Five signs we cannot ignore.",
    lead: "Each figure measures something different and does not prove one single cause. Together, they show real pressures on a generation trying to build its future.",
    items: [
      { value: "7.1%", label: "students aged 13–17 reported sexual intercourse", detail: "The 2023 GSHS records reported sexual experience among students. It is not a measure of every instance of zina or a judgement on individuals." },
      { value: "12.3m", label: "people aged 25–34 had never married", detail: "BPS marriage-status data for 2022 records 12,258,261 people aged 25–34 as never married." },
      { value: "5.3%", label: "of adolescents experienced depression", detail: "I-NAMHS 2022 found depression among 5.3% of Indonesian adolescents aged 10–17 in the previous 12 months." },
      { value: "13.3%", label: "fewer marriage registrations", detail: "In two years, registered marriages fell from 1,705,348 in 2022 to 1,478,302 in 2024." },
      { value: "2.12", label: "average children per woman", detail: "Indonesia’s 2024 Total Fertility Rate was 2.12; BPS also recorded 4.595m births in 2023 and a continuing decline in fertility." },
    ],
    note: "Sources: WHO GSHS 2023; BPS Long Form SP2020 (2022 marriage status) and Welfare Indicators 2024; Ministry of Health/I-NAMHS 2022; Ministry of Religious Affairs/SIMKAH. These are social signals—not a basis for judging individuals or claiming unproven causation.",
  },
  apps: {
    eyebrow: "Route 01 · Dating apps", title: "Dating apps: many matches, little direction towards marriage.",
    lead: "Dating apps make meeting feel easy. But their design often rewards swiping, attention, and open-ended conversation—not readiness for a life decision.",
    promise: "What it promises: speed, reach, and an easy beginning.",
    gaps: ["Intentions are often unclear or changeable.", "Identity, character, and background checks are limited.", "Constant swiping and comparison can make people feel disposable.", "Emotional attachment can grow before serious commitment exists."],
    impact: "The result: exhaustion, confusion, mistrust, and attachment to a process with no direction.",
  },
  family: {
    eyebrow: "Route 02 · Family references", title: "Trusted and safe—yet often very limited.",
    lead: "Family can open a good door, but an informal network is not always enough to find the right compatibility.",
    promise: "What it offers: trust, good intention, and family involvement from the beginning.",
    gaps: ["The candidate pool is usually very small.", "Values, communication, and readiness are rarely assessed in a structured way.", "There may be pressure to continue because the families know one another.", "If it is not a fit, the situation can feel awkward for everyone."],
    impact: "The result: people may reject good possibilities to avoid awkwardness—or accept too quickly because of pressure.",
  },
  community: {
    eyebrow: "Route 03 · Ustaz or community leaders", title: "Trusted guidance—but not a complete system.",
    lead: "Ustaz and community leaders provide valuable guidance; however, matchmaking is usually not their main operational role or expertise.",
    promise: "What it offers: aligned values, trust, and good advice.",
    gaps: ["Their time and capacity are very limited.", "They may not have a large, verified candidate pool.", "There is often no standard process for readiness, compatibility, or follow-up.", "One person can carry too much coordination burden."],
    impact: "The result: good intention does not always become a consistent, safe process for everyone.",
  },
  natural: {
    eyebrow: "Route 04 · Finding someone naturally", title: "Hope without a clear process.",
    lead: "Meeting through school, work, travel, or daily life can happen—but it depends heavily on chance.",
    promise: "What it offers: a meeting that feels spontaneous and natural.",
    gaps: ["Intention may not be clear from the beginning.", "Emotional closeness can grow before values and readiness are discussed.", "Family and boundaries often enter only after problems arise.", "Background, character, and life direction are still unknown."],
    impact: "The result: the process can become secretive, confusing, or end without a good direction.",
  },
  missingSystem: {
    eyebrow: "The core issue", title: "The problem is not the people—the system is missing.",
    lead: "Every route can begin with good intentions. What is often missing is a process that combines access, clarity, verification, adab, and family support.",
    points: ["Access without verification creates risk.", "Intention without structure creates confusion.", "Family without a process can create pressure.", "Advice without operational capacity cannot consistently serve many people."],
    closing: "Muslims today need a modern path that still protects their principles.",
  },
  consequences: {
    eyebrow: "The cost we do not always see", title: "When the process is wrong, the heart and future carry the cost.",
    lead: "This is not only about a relationship ending. An unclear process affects how someone trusts, chooses, and later builds a home.",
    points: ["Emotional exhaustion and fear of trusting again.", "Comparison, anxiety, and the feeling of not being enough.", "Attachment that grows before readiness or commitment.", "Time, attention, and boundaries spent without a path towards marriage."],
    closing: "Our hearts need direction. Values give them protection.",
  },
  taarufGap: {
    eyebrow: "Ta’aruf today", title: "Ta’aruf is a good principle. Access and support still need to be strengthened.",
    lead: "Many people want a dignified process, but do not know where to begin or whom to trust.",
    points: ["Candidate networks are often very limited.", "Verification and readiness are not always clear.", "Communication can be too fast, too rigid, or lack a facilitator.", "Families need room to participate without taking away two people’s choices."],
    closing: "The answer is not to replace ta’aruf—it is to make it more accessible, safe, and structured.",
  },
  need: {
    eyebrow: "Why this is needed", title: "Modern problems need a more responsible system.",
    lead: "Muslims do not have to choose between modern convenience and Islamic values. Both can work together when the process is designed well.",
    points: ["Technology can open access, but people still need human judgement.", "Verification protects good intentions from unnecessary risk.", "Guidance helps people speak honestly while remaining dignified.", "Families can be involved at the right time, with a healthy role."],
  },
  howItWorks: {
    eyebrow: "The Jodohmu process", title: "How Jodohmu works",
    lead: "A guided journey for adults who are serious about marriage.",
    steps: [
      { title: "1. Listen to your story", detail: "Marriage goals, values, boundaries, and hopes for the future are discussed privately.", solves: "Solves: a process that begins with guessing or a shallow profile." },
      { title: "2. Be clear before an introduction", detail: "From the beginning, both people know the meeting has marriage in mind—not directionless chat.", solves: "Solves: emotional attachment before intention is discussed." },
      { title: "3. Verify carefully", detail: "Identity and important information are reviewed, according to the package, to build safety.", solves: "Solves: the risk of profiles and promises that cannot be trusted." },
      { title: "4. Choose a comfortable format", detail: "You choose how an introduction happens: timing, conversation style, trusted guests, and a facilitator if wanted.", solves: "Solves: the fear that ta’aruf must feel rigid or coercive." },
      { title: "5. Space to choose", detail: "No contact or meeting is forced; responses after an introduction are given privately.", solves: "Solves: pressure from family, facilitators, or the process itself." },
      { title: "6. Involve family at the right time", detail: "Family joins when both people are ready to move into a more serious stage.", solves: "Solves: family arriving too late or taking over two people’s choice." },
    ],
  },
  solutions: {
    eyebrow: "A clearer answer", title: "Jodohmu solves the process—not by selling instant destiny.",
    lead: "Our role is to make the path towards marriage safer, clearer, and more human.",
    points: ["From vague intention to serious conversation.", "From uncertain profiles to more responsible verification.", "From going alone to human guidance.", "From secret relationships to a path that respects boundaries and family."],
  },
  principles: {
    eyebrow: "Supporting Islamic principles", title: "Islamic values are not added at the end—they shape how the process is run.",
    lead: "Jodohmu is designed to support adab and responsibility; it does not replace a wali, family, or scholarly guidance.",
    principles: [
      { title: "Clear intention", detail: "The focus is readiness for marriage—not attention for its own sake." },
      { title: "Respected boundaries", detail: "The process and communication are guided to remain courteous and dignified." },
      { title: "Consent from both people", detail: "No contact or meeting is forced." },
      { title: "Family and wali", detail: "They can be involved at the appropriate time, according to need and conviction." },
    ],
    note: "For fiqh questions or individual decisions, continue to consult a trusted wali, ustaz, or religious adviser.",
  },
  packages: {
    eyebrow: "Levels of support", title: "Packages that follow the support each journey needs.",
    lead: "Every journey is different. Packages define the depth of guidance, verification, and support required.",
    packages: [
      { name: "Pearl", detail: "A clear first step for beginning the process seriously.", fit: "For people who need initial structure and direction." },
      { name: "Ruby", detail: "Deeper guidance, with verification and active sourcing.", fit: "For people ready for a serious process with closer support." },
      { name: "Diamond", detail: "The most private and comprehensive guidance with the core team.", fit: "For highly personal, confidential, or complex needs." },
    ],
    note: "Investment and package fit are discussed privately with adults and, where appropriate, their families.",
  },
  benefits: {
    eyebrow: "A wider benefit", title: "When the process improves, families and society benefit too.",
    lead: "A strong marriage is not only about two people—it shapes homes, families, and the next generation.",
    benefits: [
      { title: "Less secrecy", detail: "A guided process creates space for more honest communication." },
      { title: "More protection", detail: "Verification and guidance reduce unnecessary risk." },
      { title: "Readier families", detail: "Families can be involved with a healthy role and good timing." },
      { title: "More conscious homes", detail: "Couples enter marriage with greater clarity and responsibility." },
    ],
    closing: "Protecting values while finding a spouse is an investment in the future of the ummah.",
  },
};

type QuranInsight = { title: string; idText: string; enText: string; scholarlyNote?: { id: string; en: string } };
type QuranVerse = {
  number: string;
  arabicParts: { text: string; insight?: string }[];
  idTranslation: string;
  enTranslation: string;
  insights: Record<string, QuranInsight>;
};

const quranStoryVerses: QuranVerse[] = [
  {
    number: "23",
    arabicParts: [
      { text: "وَلَمَّا وَرَدَ مَآءَ مَدْيَنَ وَجَدَ عَلَيْهِ أُمَّةٗ مِّنَ ٱلنَّاسِ يَسْقُونَ " },
      { text: "وَوَجَدَ مِن دُونِهِمُ ٱمْرَأَتَيْنِ تَذُودَانِ", insight: "holding-back" },
      { text: "ۖ قَالَ " },
      { text: "مَا خَطْبُكُمَا", insight: "necessary-question" },
      { text: "ۖ قَالَتَا لَا نَسْقِي حَتَّىٰ يُصْدِرَ ٱلرِّعَآءُ وَأَبُونَا شَيْخٞ كَبِيرٞ" },
    ],
    idTranslation: "Saat tiba di sumber air Madyan, Musa melihat banyak orang memberi minum ternak. Terpisah dari mereka, ia melihat dua perempuan menahan ternak mereka. Musa bertanya, “Apa keadaan kalian?” Mereka menjawab bahwa mereka menunggu para penggembala selesai, karena ayah mereka sudah tua.",
    enTranslation: "At the well of Madyan, Musa found many people watering their flocks. Apart from them, he saw two women holding their flock back. He asked, “What is your situation?” They replied that they waited until the shepherds had left because their father was elderly.",
    insights: {
      "holding-back": { title: "مِن دُونِهِمُ … تَذُودَانِ", idText: "Al-Qur’an lebih dahulu menggambarkan posisi mereka: terpisah dari kerumunan, sambil menahan ternak. تَذُودَانِ bermakna menahan atau mencegah. Tafsir al-Tabari menjelaskan: mereka menahan ternak sampai para penggembala selesai.", enText: "The Qur’an first describes their position: apart from the crowd, holding their flock back. تَذُودَانِ carries the sense of holding back or preventing. Al-Tabari explains it as holding their flock back until the shepherds had finished.", scholarlyNote: { id: "Catatan tafsir: ini menjelaskan makna kata yang paling mungkin; jangan diperluas menjadi rincian yang tidak disebut ayat.", en: "Tafsir note: this explains the word’s likely sense; it should not be stretched into details the verse does not state." } },
      "necessary-question": { title: "مَا خَطْبُكُمَا", idText: "Secara ringkas: ‘Apa urusan/keadaan kalian berdua?’ Musa bertanya sesuai dengan apa yang ia lihat. Pertanyaannya tidak berputar, tidak pribadi, dan tidak keluar dari kebutuhan saat itu.", enText: "In brief: ‘What is your situation, you two?’ Musa asks about what he has observed. His question is not indirect, personal, or beyond what the situation calls for." },
    },
  },
  {
    number: "24",
    arabicParts: [
      { text: "فَسَقَىٰ لَهُمَا", insight: "immediate-service" },
      { text: " " },
      { text: "ثُمَّ تَوَلَّىٰ إِلَى ٱلظِّلِّ", insight: "then-withdraws" },
      { text: " فَقَالَ رَبِّ إِنِّي لِمَآ أَنزَلْتَ إِلَيَّ مِنْ خَيْرٖ فَقِيرٞ" },
    ],
    idTranslation: "Lalu Musa memberi minum ternak mereka; kemudian ia menepi ke tempat teduh dan berdoa: “Wahai Tuhanku, sungguh aku sangat memerlukan kebaikan apa pun yang Engkau turunkan kepadaku.”",
    enTranslation: "So Musa watered their flock for them; then he withdrew to the shade and prayed: “My Lord, I am truly in need of whatever good You send down to me.”",
    insights: {
      "immediate-service": { title: "فَسَقَىٰ لَهُمَا", idText: "Huruf فَ menghubungkan apa yang Musa lihat dengan responsnya: ia menolong. Tidak ada percakapan yang diperpanjang sebelum bantuan diberikan.", enText: "The particle فَ joins what Musa saw to his response: he helped. The conversation is not prolonged before the service is given." },
      "then-withdraws": { title: "ثُمَّ تَوَلَّىٰ إِلَى ٱلظِّلِّ", idText: "Setelahnya, ayat memakai ثُمَّ dan menuturkan bahwa Musa menepi ke teduh. Urutan ini menjaga kita dari membaca ‘pertolongan’ sebagai jalan untuk mencari kedekatan. Ia menolong, lalu kembali kepada Allah dalam doa.", enText: "After that, the verse uses ثُمَّ and tells us Musa withdrew to the shade. This sequence keeps us from reading service as a route to seek closeness. He helps, then turns to Allah in prayer." },
    },
  },
  {
    number: "25",
    arabicParts: [
      { text: "فَجَآءَتْهُ إِحْدَىٰهُمَا " },
      { text: "تَمْشِي عَلَى ٱسْتِحْيَآءٖ", insight: "haya" },
      { text: " قَالَتْ " },
      { text: "إِنَّ أَبِي يَدْعُوكَ لِيَجْزِيَكَ أَجْرَ مَا سَقَيْتَ لَنَا", insight: "precise-message" },
      { text: "ۚ فَلَمَّا جَآءَهُۥ وَقَصَّ عَلَيْهِ ٱلْقَصَصَ قَالَ لَا تَخَفْۖ نَجَوْتَ مِنَ ٱلْقَوْمِ ٱلظَّالِمِينَ" },
    ],
    idTranslation: "Kemudian salah seorang dari dua perempuan itu datang kepadanya, berjalan dengan haya. Ia berkata, “Ayahku mengundangmu untuk membalas jasa karena engkau telah memberi minum ternak kami.” Ketika Musa datang dan menceritakan kisahnya, sang ayah berkata, “Jangan takut; engkau telah selamat dari kaum yang zalim.”",
    enTranslation: "Then one of the two women came to him, walking with haya. She said, “My father invites you to reward you for watering our flock.” When Musa came and told him his story, the father said, “Do not fear; you have escaped the wrongdoing people.”",
    insights: {
      haya: { title: "تَمْشِي عَلَى ٱسْتِحْيَآءٖ", idText: "Secara harfiah, ‘berjalan di atas/dengan haya.’ Al-Qur’an menyebut keadaan dan adabnya, tetapi tidak merinci pakaian atau gerak tertentu. Ibn Kathir mengutip riwayat dari ‘Umar r.a. tentang berjalan dengan penutup dan rasa malu; itu tafsir riwayat, bukan tambahan lafaz ayat.", enText: "Literally, ‘walking upon/with haya.’ The Qur’an names her manner and adab, but does not specify one garment or physical movement. Ibn Kathir cites reports from ‘Umar about covered, restrained walking; that is reported tafsir, not additional Qur’anic wording.", scholarlyNote: { id: "Haya pada bagian ini bukan berarti membisu: pada ayat yang sama ia menyampaikan pesan yang jelas dan bertujuan.", en: "Haya in this passage is not silence: in the same verse she speaks a clear, purposeful message." } },
      "precise-message": { title: "إِنَّ أَبِي يَدْعُوكَ لِيَجْزِيَكَ", idText: "Pesannya sangat terukur: ia menyebut siapa yang mengundang (ayahnya), mengapa (untuk memberi balasan), dan atas jasa apa. Ibn Kathir menyebut bentuk ini sebagai adab dalam berbicara kerana tidak membuka ruang prasangka.", enText: "Her message is carefully bounded: it names who invites (her father), why (to reward), and for what service. Ibn Kathir identifies this wording as adab in speech because it avoids opening room for suspicion." },
    },
  },
];

const quranAgreementVerses: QuranVerse[] = [
  {
    number: "26",
    arabicParts: [
      { text: "قَالَتْ إِحْدَىٰهُمَا يَٰٓأَبَتِ ٱسْتَـْٔجِرْهُۖ " },
      { text: "إِنَّ خَيْرَ مَنِ ٱسْتَـْٔجَرْتَ ٱلْقَوِيُّ ٱلْأَمِينُ", insight: "strong-trustworthy" },
    ],
    idTranslation: "Salah seorang dari mereka berkata, “Wahai ayahku, pekerjakanlah dia. Sesungguhnya orang terbaik yang engkau pekerjakan ialah yang kuat dan amanah.”",
    enTranslation: "One of them said, “My dear father, hire him. Surely the best person you can hire is strong and trustworthy.”",
    insights: {
      "strong-trustworthy": { title: "ٱلْقَوِيُّ ٱلْأَمِينُ", idText: "Dua sifat disebut bersama: kemampuan (القوي) dan amanah (الأمين). Dalam ayat, penilaiannya berkaitan dengan pekerjaan; kita boleh mengambil prinsipnya untuk memilih pasangan, tetapi jangan mengubahnya menjadi satu-satunya formula nikah yang ditetapkan ayat.", enText: "Two qualities are paired: capability (القوي) and trustworthiness (الأمين). In the verse, the assessment concerns employment; we may draw a principle for choosing a spouse, but should not turn it into the verse’s only prescribed marriage formula." },
    },
  },
  {
    number: "27",
    arabicParts: [
      { text: "قَالَ " },
      { text: "إِنِّي أُرِيدُ أَنْ أُنكِحَكَ إِحْدَى ٱبْنَتَيَّ هَاتَيْنِ", insight: "explicit-proposal" },
      { text: " " },
      { text: "عَلَىٰ أَنْ تَأْجُرَنِي ثَمَانِيَ حِجَجٖ", insight: "stated-condition" },
      { text: " " },
      { text: "فَإِنْ أَتْمَمْتَ عَشْرٗا فَمِنْ عِندِكَ", insight: "voluntary-extra" },
      { text: " وَمَا أُرِيدُ أَنْ أَشُقَّ عَلَيْكَۚ سَتَجِدُنِيٓ إِن شَآءَ ٱللَّهُ مِنَ ٱلصَّالِحِينَ" },
    ],
    idTranslation: "Sang ayah berkata, “Aku ingin menikahkanmu dengan salah satu dari kedua putriku ini, dengan syarat engkau bekerja kepadaku selama delapan tahun. Jika engkau sempurnakan menjadi sepuluh, itu dari kerelaanmu. Aku tidak ingin menyulitkanmu; insya Allah engkau akan mendapatiku termasuk orang yang baik.”",
    enTranslation: "The father said, “I intend to marry one of these two daughters of mine to you, on condition that you serve me for eight years. If you complete ten, that is from your own generosity. I do not wish to make it difficult for you; Allah willing, you will find me among the righteous.”",
    insights: {
      "explicit-proposal": { title: "أُنكِحَكَ … إِحْدَى ٱبْنَتَيَّ", idText: "Bahasa ayatnya eksplisit: ‘aku ingin menikahkanmu.’ Ia menyatakan arah nikah, bukan memberi isyarat samar. Namun Al-Qur’an tidak menamai putrinya atau menyatakan perempuan pada ayat 25 pasti yang dinikahi Musa.", enText: "The verse’s language is explicit: ‘I intend to marry [a daughter] to you.’ It states a direction to nikah rather than leaving a vague signal. Yet the Qur’an does not name the daughter or state that the woman in verse 25 was certainly the one Musa married." },
      "stated-condition": { title: "عَلَىٰ أَنْ تَأْجُرَنِي ثَمَانِيَ حِجَجٖ", idText: "Syarat pelayanan disebut dengan angka yang pasti: delapan tahun. Ayat menyebut istilah kerja/pelayanan; slide ini sengaja tidak otomatis menyebutnya mahar, kerana rincian hukum akad memerlukan pembahasan fiqih.", enText: "The service condition is stated with a definite number: eight years. The verse uses the language of service; this slide deliberately does not automatically label it mahr, because the legal details of a contract require fiqh discussion." },
      "voluntary-extra": { title: "فَإِنْ أَتْمَمْتَ عَشْرٗا فَمِنْ عِندِكَ", idText: "Dua tahun tambahan diletakkan sebagai pilihan Musa, bukan tuntutan. Ada perbedaan yang jelas antara kewajiban dan ihsan—kebaikan yang diberikan secara sukarela.", enText: "The extra two years are placed as Musa’s choice, not a demand. The verse clearly distinguishes obligation from ihsan—voluntary excellence." },
    },
  },
  {
    number: "28",
    arabicParts: [
      { text: "قَالَ " },
      { text: "ذَٰلِكَ بَيْنِي وَبَيْنَكَ", insight: "clear-acceptance" },
      { text: "ۖ " },
      { text: "أَيَّمَا ٱلْأَجَلَيْنِ قَضَيْتُ فَلَا عُدْوَانَ عَلَيَّ", insight: "bounded-obligation" },
      { text: "ۖ " },
      { text: "وَٱللَّهُ عَلَىٰ مَا نَقُولُ وَكِيلٞ", insight: "allah-witness" },
    ],
    idTranslation: "Musa berkata, “Itu adalah kesepakatan antara aku dan engkau. Mana pun dari dua masa itu yang aku penuhi, tidak ada tuntutan tambahan atas diriku. Dan Allah adalah Wakil atas apa yang kita ucapkan.”",
    enTranslation: "Musa said, “That is settled between you and me. Whichever of the two terms I fulfill, there is no further claim against me. And Allah is Trustee over what we say.”",
    insights: {
      "clear-acceptance": { title: "ذَٰلِكَ بَيْنِي وَبَيْنَكَ", idText: "Jawaban Musa bukan sekadar rasa setuju; ia menegaskan adanya kesepakatan dua pihak. Al-Qur’an memberi ruang pada persetujuan yang jelas, bukan desakan atau asumsi.", enText: "Musa’s answer is more than a feeling of approval; it affirms an agreement between two parties. The Qur’an gives space to clear assent, not pressure or assumption." },
      "bounded-obligation": { title: "أَيَّمَا ٱلْأَجَلَيْنِ … فَلَا عُدْوَانَ عَلَيَّ", idText: "Musa meminta batas kewajiban dipahami secara adil: jika ia memenuhi salah satu masa yang disepakati, tidak ada tuntutan tambahan. Kejelasan akad juga melindungi dari perselisihan di kemudian hari.", enText: "Musa asks for the limits of obligation to be understood fairly: if he fulfills either agreed term, there is no further claim. Contractual clarity also protects against later dispute." },
      "allah-witness": { title: "وَٱللَّهُ … وَكِيلٞ", idText: "Kesepakatan ditutup dengan menyebut Allah sebagai Wakil atas ucapan mereka. Ia mengingatkan bahawa kontrak tidak hanya sah secara kata-kata, tetapi juga amanah di hadapan Allah.", enText: "The agreement closes by naming Allah as Trustee over what they say. It reminds us that a contract is not only verbal form; it is also an amanah before Allah." },
    },
  },
];


const indonesianSlides = [
  <TitleSlide key="title" />,
  <QuranExplorerSlide key="musa-quran-reader" language="id" />,
  <IndonesiaRealitySlide key="indonesia-reality" language="id" />,
  <StatisticsSlide key="statistics" content={indonesianContent.statistics} />,
  <WaysPeopleSearchSlide key="ways-people-search" language="id" />,
  <RouteSlide key="apps" content={indonesianContent.apps} />,
  <RouteSlide key="family" content={indonesianContent.family} />,
  <RouteSlide key="community" content={indonesianContent.community} />,
  <RouteSlide key="natural" content={indonesianContent.natural} />,
  <TopicSlide key="missing-system" content={indonesianContent.missingSystem} />,
  <IslamQuoteSlide key="islam" language="id" />,
  <TopicSlide key="consequences" content={indonesianContent.consequences} />,
  <TaarufQuestionSlide key="taaruf-question" language="id" />,
  <TaarufSlide key="taaruf" />,
  <TopicSlide key="need" content={indonesianContent.need} />,
  <JodohmuSolutionSlide key="jodohmu-solution" language="id" />,
  <JodohmuSlide key="jodohmu" />,
  <HowItWorksSlide key="how-it-works" content={indonesianContent.howItWorks} />,
  <TopicSlide key="solutions" content={indonesianContent.solutions} />,
  <PrinciplesSlide key="principles" content={indonesianContent.principles} />,
  <InteractivePackagesSlide key="packages" language="id" />,
  <BenefitsSlide key="benefits" content={indonesianContent.benefits} />,
  <CloseSlide key="close" />,
];

const englishSlides = [
  <EnglishTitleSlide key="title" />,
  <QuranExplorerSlide key="musa-quran-reader" language="en" />,
  <IndonesiaRealitySlide key="indonesia-reality" language="en" />,
  <StatisticsSlide key="statistics" content={englishContent.statistics} />,
  <WaysPeopleSearchSlide key="ways-people-search" language="en" />,
  <RouteSlide key="apps" content={englishContent.apps} />,
  <RouteSlide key="family" content={englishContent.family} />,
  <RouteSlide key="community" content={englishContent.community} />,
  <RouteSlide key="natural" content={englishContent.natural} />,
  <TopicSlide key="missing-system" content={englishContent.missingSystem} />,
  <IslamQuoteSlide key="islam" language="en" />,
  <TopicSlide key="consequences" content={englishContent.consequences} />,
  <TaarufQuestionSlide key="taaruf-question" language="en" />,
  <EnglishTaarufSlide key="taaruf" />,
  <TopicSlide key="need" content={englishContent.need} />,
  <JodohmuSolutionSlide key="jodohmu-solution" language="en" />,
  <EnglishJodohmuSlide key="jodohmu" />,
  <HowItWorksSlide key="how-it-works" content={englishContent.howItWorks} />,
  <TopicSlide key="solutions" content={englishContent.solutions} />,
  <PrinciplesSlide key="principles" content={englishContent.principles} />,
  <InteractivePackagesSlide key="packages" language="en" />,
  <BenefitsSlide key="benefits" content={englishContent.benefits} />,
  <EnglishCloseSlide key="close" />,
];

export function IslamicSchoolPresentation() {
  const [slide, setSlide] = useState(0);
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);
  const slides = language === "id" ? indonesianSlides : englishSlides;
  const go = useCallback((next: number) => setSlide(Math.min(Math.max(next, 0), slides.length - 1)), [slides.length]);
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) await deckRef.current?.requestFullscreen();
    else await document.exitFullscreen();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", " ", "Enter"].includes(event.key)) { event.preventDefault(); go(slide + 1); }
      if (["ArrowLeft", "ArrowUp"].includes(event.key)) { event.preventDefault(); go(slide - 1); }
      if (event.key.toLowerCase() === "f") void toggleFullscreen();
      if (event.key === "Escape" && document.fullscreenElement) void document.exitFullscreen();
    };
    const onFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("fullscreenchange", onFullscreen); };
  }, [go, slide, toggleFullscreen]);

  return <div ref={deckRef} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[#101d3b] font-sans text-white" onTouchStart={(event) => { touchStart.current = event.changedTouches[0].clientX; }} onTouchEnd={(event) => { if (touchStart.current === null) return; const distance = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(distance) > 50) go(slide + (distance < 0 ? 1 : -1)); touchStart.current = null; }}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_11%_10%,rgba(216,91,135,.28),transparent_27%),radial-gradient(circle_at_88%_80%,rgba(230,189,105,.18),transparent_28%)]" />
    <div className="relative flex h-full flex-col">
      <header className="z-20 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/presentations" aria-label={language === "id" ? "Kembali ke semua presentasi" : "Back to all presentations"}><Image src="/jodohmu-logo.png" alt="Jodohmu" width={45} height={45} className="h-10 w-10 object-contain brightness-0 invert" priority /></Link>
        <p className="hidden text-xs font-bold uppercase tracking-[.24em] text-white/55 sm:block">{language === "id" ? "Jodohmu · Jalan menuju pernikahan yang menjaga nilai" : "Jodohmu · A values-led path to marriage"}</p>
        <div className="flex gap-2"><button onClick={() => { setLanguage(language === "id" ? "en" : "id"); setSlide(0); }} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/10 hover:text-white" aria-label={language === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}><Languages className="h-4 w-4" /><span className="hidden sm:inline">{language === "id" ? "English" : "Indonesia"}</span></button><button onClick={() => void toggleFullscreen()} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/10 hover:text-white" aria-label={language === "id" ? "Layar penuh" : "Full screen"}><Expand className="h-4 w-4" /><span className="hidden sm:inline">{isFullscreen ? (language === "id" ? "Keluar layar penuh" : "Exit full screen") : (language === "id" ? "Layar penuh" : "Full screen")}</span></button></div>
      </header>
      <div className="relative flex flex-1 items-center overflow-hidden"><div className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]" style={{ transform: `translateX(-${slide * 100}%)` }}>{slides.map((content, index) => <section key={index} aria-hidden={slide !== index} className="flex h-full w-full shrink-0 items-center justify-center px-7 pb-20 pt-2 sm:px-16 lg:px-24">{content}</section>)}</div></div>
      <footer className="z-20 flex items-center justify-between px-6 pb-6 sm:px-10 sm:pb-8"><div className="flex gap-2">{slides.map((_, index) => <button aria-label={language === "id" ? `Ke slide ${index + 1}` : `Go to slide ${index + 1}`} onClick={() => go(index)} key={index} className={`h-1.5 rounded-full transition-all ${index === slide ? "w-8 bg-[#e6bd69]" : "w-1.5 bg-white/30 hover:bg-white/60"}`} />)}</div><p className="hidden text-xs text-white/45 sm:block">{language === "id" ? "Gunakan tombol ← → atau geser untuk berpindah" : "Use ← → keys or swipe to navigate"}</p><div className="flex gap-2"><button onClick={() => go(slide - 1)} disabled={slide === 0} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30" aria-label={language === "id" ? "Slide sebelumnya" : "Previous slide"}><ArrowLeft className="h-4 w-4" /></button><button onClick={() => go(slide + 1)} disabled={slide === slides.length - 1} className="grid h-10 w-10 place-items-center rounded-full bg-[#d85b87] text-white transition hover:bg-[#c44874] disabled:cursor-not-allowed disabled:opacity-40" aria-label={language === "id" ? "Slide berikutnya" : "Next slide"}><ArrowRight className="h-4 w-4" /></button></div></footer>
    </div>
  </div>;
}
function TopicSlide({ content }: { content: TopicContent }) {
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{content.eyebrow}</p>
    <h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">{content.title}</h2>
    <p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-white/70">{content.lead}</p>
    <div className="mt-9 grid gap-4 md:grid-cols-2">{content.points.map((point, index) => <div key={point} className="flex gap-4 rounded-3xl border border-white/15 bg-white/[.07] p-6"><span className="font-serif text-2xl text-[#e6bd69]">0{index + 1}</span><p className="pt-1 leading-7 text-white/80">{point}</p></div>)}</div>
    {content.closing && <p className="mx-auto mt-8 max-w-3xl text-center text-lg font-bold leading-7 text-[#f3c5d4]">{content.closing}</p>}
  </div>;
}

function QuranExplorerSlide({ language }: { language: "id" | "en" }) {
  const isIndonesian = language === "id";
  const verses = [...quranStoryVerses, ...quranAgreementVerses];
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(verses[0].number);
  const selectedVerse = verses.find((verse) => verse.number === selectedVerseNumber) ?? verses[0];
  const defaultInsight = selectedVerse.arabicParts.find((part) => part.insight)?.insight ?? "";
  const [selectedInsightKey, setSelectedInsightKey] = useState(defaultInsight);
  const selectedInsight = selectedInsightKey ? selectedVerse.insights[selectedInsightKey] : undefined;
  const rangeLabel = isIndonesian ? "Kisah Musa menuju pernikahan · QS. Al-Qasas 28:23–28" : "Musa’s path towards marriage · Qur’an 28:23–28";
  const title = isIndonesian ? <>Baca ayat 23–28 <span className="italic text-[#ef91b1]">sebagaimana Al-Qur’an menatanya.</span></> : <>Read verses 23–28 <span className="italic text-[#ef91b1]">as the Qur’an arranges them.</span></>;

  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{rangeLabel}</p>
    <h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">{title}</h2>
    <div className="mt-6 flex flex-wrap justify-center gap-2">{verses.map((verse) => <button key={verse.number} onClick={() => { setSelectedVerseNumber(verse.number); setSelectedInsightKey(verse.arabicParts.find((part) => part.insight)?.insight ?? ""); }} className={`rounded-full border px-4 py-2 text-sm font-bold transition ${selectedVerse.number === verse.number ? "border-[#e6bd69] bg-[#e6bd69] text-[#101d3b]" : "border-white/20 bg-white/[.05] text-white/65 hover:border-white/45 hover:text-white"}`}>{isIndonesian ? "Ayat" : "Ayah"} {verse.number}</button>)}</div>
    <div className="mt-5 rounded-[2rem] border border-[#e6bd69]/30 bg-[linear-gradient(145deg,rgba(230,189,105,.13),rgba(255,255,255,.05))] p-5 sm:p-7">
      <p className="text-center text-xs font-bold uppercase tracking-[.2em] text-[#e6bd69]">{isIndonesian ? "Klik frasa Arab yang disorot · klik lagi untuk menutup" : "Click a highlighted Arabic phrase · click again to close"}</p>
      <p dir="rtl" className="mt-4 text-center font-serif text-2xl leading-[2.15] text-white sm:text-3xl">{selectedVerse.arabicParts.map((part, index) => part.insight ? <button key={`${part.insight}-${index}`} onClick={() => setSelectedInsightKey(selectedInsightKey === part.insight ? "" : part.insight ?? "")} className={`mx-1 rounded-lg px-1.5 py-0.5 transition ${selectedInsightKey === part.insight ? "bg-[#ef91b1] text-[#101d3b]" : "bg-[#e6bd69]/25 text-[#f5dfaa] hover:bg-[#e6bd69]/45"}`}>{part.text}</button> : <span key={index}>{part.text}</span>)}</p>
      <div className="mx-auto mt-5 max-w-5xl border-t border-white/15 pt-4 text-center"><p className="text-xs font-bold uppercase tracking-[.16em] text-white/45">{isIndonesian ? "Terjemah makna ringkas" : "Concise meaning"}</p><p className="mt-2 text-base leading-7 text-white/75 sm:text-lg">{isIndonesian ? selectedVerse.idTranslation : selectedVerse.enTranslation}</p></div>
    </div>
    {selectedInsight && <div className="mt-5 grid gap-4 rounded-[2rem] border border-white/15 bg-white/[.07] p-5 sm:grid-cols-[.82fr_1.18fr] sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e6bd69]">{isIndonesian ? "Makna yang dipilih" : "Selected meaning"}</p><h3 dir="rtl" className="mt-3 font-serif text-3xl leading-relaxed text-[#f3c5d4]">{selectedInsight.title}</h3><p className="mt-2 text-xs leading-5 text-white/45">{isIndonesian ? "Pilih frasa lain untuk membaca lapisan berikutnya." : "Choose another phrase to read the next layer."}</p></div><div><p className="text-sm leading-7 text-white/80">{isIndonesian ? selectedInsight.idText : selectedInsight.enText}</p>{selectedInsight.scholarlyNote && <p className="mt-3 border-l-2 border-[#e6bd69] pl-3 text-xs leading-5 text-[#f5dfaa]">{isIndonesian ? selectedInsight.scholarlyNote.id : selectedInsight.scholarlyNote.en}</p>}</div></div>}
    <p className="mx-auto mt-4 max-w-5xl text-center text-xs leading-5 text-white/45">{isIndonesian ? "Catatan: teks ayat didahulukan. Catatan tafsir klasik diberi penanda dan tidak diperlakukan sebagai lafaz Al-Qur’an." : "Note: the Qur’anic text comes first. Classical tafsir notes are marked and are not treated as the Qur’an’s own wording."}</p>
  </div>;
}

function IndonesiaRealitySlide({ language }: { language: "id" | "en" }) {
  const isIndonesian = language === "id";
  return <div className="mx-auto w-full max-w-6xl text-center"><h2 className="font-serif text-6xl font-bold leading-tight sm:text-8xl">{isIndonesian ? <>Realita <span className="italic text-[#ef91b1]">Indonesia.</span></> : <>Indonesia’s <span className="italic text-[#ef91b1]">reality.</span></>}</h2><p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-white/70">{isIndonesian ? "Setelah melihat proses yang ditunjukkan Al-Qur’an, mari jujur melihat ruang tempat kita mencari pasangan hari ini." : "After seeing the process shown in the Qur’an, let us honestly look at the space in which people seek a partner today."}</p><div className="mx-auto mt-10 h-1.5 w-24 rounded-full bg-[#e6bd69]" /></div>;
}

function WaysPeopleSearchSlide({ language }: { language: "id" | "en" }) {
  const isIndonesian = language === "id";
  const routes = isIndonesian ? [["01", "Dating apps", "Cepat, luas, dan penuh pilihan."], ["02", "Referensi keluarga", "Tepercaya, tetapi jaringan sering terbatas."], ["03", "Ustaz & komunitas", "Ada arahan, tetapi kapasitas tidak selalu cukup."], ["04", "Bertemu alami", "Terasa organik, tetapi bergantung pada kebetulan."]] : [["01", "Dating apps", "Fast, broad, and full of options."], ["02", "Family references", "Trusted, but the network is often limited."], ["03", "Ustaz & community", "Guidance exists, but capacity is not always enough."], ["04", "Meeting naturally", "Feels organic, but depends on chance."]];
  return <div className="mx-auto w-full max-w-6xl"><p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isIndonesian ? "Empat jalan yang paling umum" : "Four common routes"}</p><h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">{isIndonesian ? <>Bagaimana orang Indonesia <span className="italic text-[#ef91b1]">mencari pasangan hari ini?</span></> : <>How do Indonesians <span className="italic text-[#ef91b1]">look for a partner today?</span></>}</h2><p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-white/70">{isIndonesian ? "Setiap jalan dapat dimulai dengan niat baik. Namun masing-masing menyisakan persoalan yang perlu kita hadapi dengan jujur." : "Every route can begin with good intentions. Yet each leaves problems that we need to face honestly."}</p><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{routes.map(([number, title, detail]) => <div key={number} className="rounded-3xl border border-white/15 bg-white/[.07] p-6"><p className="font-serif text-3xl text-[#e6bd69]">{number}</p><h3 className="mt-5 text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/65">{detail}</p></div>)}</div></div>;
}

function IslamQuoteSlide({ language }: { language: "id" | "en" }) {
  const isIndonesian = language === "id";
  const [mode, setMode] = useState<"arabic" | "translation">("arabic");
  const arabic = "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ";
  const translation = isIndonesian ? "“Dan di antara tanda-tanda-Nya, Dia menciptakan pasangan untukmu dari jenismu sendiri agar kamu merasa tenteram kepadanya. Dia menjadikan di antaramu kasih dan sayang. Sungguh, pada yang demikian itu terdapat tanda-tanda bagi kaum yang berpikir.”" : "“And one of His signs is that He created for you spouses from among yourselves so that you may find tranquillity in them. And He has placed between you affection and mercy. Surely in this are signs for people who reflect.”";
  return <div className="mx-auto w-full max-w-6xl"><p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isIndonesian ? "Perspektif Islam · QS. Ar-Rum 30:21" : "An Islamic perspective · Qur’an 30:21"}</p><h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">{isIndonesian ? <>Pernikahan bukan sekadar menemukan seseorang—<span className="italic text-[#ef91b1]">tetapi membangun sakinah.</span></> : <>Marriage is not simply finding someone—<span className="italic text-[#ef91b1]">it is building sakinah.</span></>}</h2><div className="mx-auto mt-8 max-w-5xl rounded-[2rem] border border-[#e6bd69]/35 bg-[linear-gradient(145deg,rgba(230,189,105,.16),rgba(255,255,255,.06))] p-7 text-center sm:p-10"><div className="mb-6 flex justify-center gap-2"><button onClick={() => setMode("arabic")} className={`rounded-full px-4 py-2 text-sm font-bold transition ${mode === "arabic" ? "bg-[#e6bd69] text-[#101d3b]" : "border border-white/20 text-white/65 hover:text-white"}`}>العربية</button><button onClick={() => setMode("translation")} className={`rounded-full px-4 py-2 text-sm font-bold transition ${mode === "translation" ? "bg-[#e6bd69] text-[#101d3b]" : "border border-white/20 text-white/65 hover:text-white"}`}>{isIndonesian ? "Indonesia" : "English"}</button></div>{mode === "arabic" ? <p dir="rtl" className="font-serif text-3xl leading-[2] text-[#f5dfaa] sm:text-4xl">{arabic}</p> : <blockquote className="mx-auto max-w-4xl font-serif text-2xl italic leading-10 text-white/90 sm:text-3xl">{translation}</blockquote>}<p className="mt-6 text-sm font-bold uppercase tracking-[.18em] text-[#e6bd69]">QS. Ar-Rum 30:21</p></div><div className="mx-auto mt-7 grid max-w-4xl gap-4 sm:grid-cols-3">{[["Sakinah", isIndonesian ? "ketenangan yang meneduhkan" : "a peace that settles the heart"], ["Mawaddah", isIndonesian ? "kasih yang dirawat" : "affection that is cared for"], ["Rahmah", isIndonesian ? "sayang yang bertanggung jawab" : "mercy with responsibility"]].map(([name, meaning]) => <div key={name} className="rounded-2xl border border-white/15 bg-white/[.07] p-5 text-center"><h3 className="font-serif text-3xl font-bold text-[#e6bd69]">{name}</h3><p className="mt-1 text-sm text-white/70">{meaning}</p></div>)}</div></div>;
}

function TaarufQuestionSlide({ language }: { language: "id" | "en" }) {
  const isIndonesian = language === "id";
  const concerns = isIndonesian ? ["‘Terlalu kaku—aku tidak akan nyaman menjadi diri sendiri.’", "‘Aku takut percakapannya dihakimi atau difasilitasi dengan keras.’", "‘Aku ingin proses yang Islami, tetapi formatnya harus tetap terasa manusiawi bagiku.’"] : ["“It feels too strict—I will not be comfortable being myself.”", "“I am afraid the conversation will be judged or facilitated harshly.”", "“I want an Islamic process, but it still needs to feel human to me.”"];
  return <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isIndonesian ? "Pertanyaan penting" : "An important question"}</p><h2 className="mt-5 font-serif text-5xl font-bold leading-tight sm:text-7xl">{isIndonesian ? <>Apakah ta’aruf <span className="italic text-[#ef91b1]">benar-benar jalan yang tepat?</span></> : <>Is ta’aruf <span className="italic text-[#ef91b1]">really the right path?</span></>}</h2><p className="mt-6 text-lg leading-8 text-white/70">{isIndonesian ? "Prinsipnya kuat. Tetapi bagi banyak Muslim—terutama yang moderat—kata ini kadang terasa menakutkan sebelum prosesnya bahkan dimulai." : "Its principle is strong. Yet for many Muslims—especially those who are moderate—the word can feel intimidating before the process even begins."}</p></div><div className="space-y-3">{concerns.map((concern, index) => <div key={concern} className="flex gap-4 rounded-3xl border border-white/15 bg-white/[.07] p-5"><span className="font-serif text-2xl text-[#e6bd69]">0{index + 1}</span><p className="pt-1 leading-7 text-white/80">{concern}</p></div>)}<p className="rounded-2xl border border-[#e6bd69]/30 bg-[#e6bd69]/10 p-5 text-sm font-bold leading-6 text-[#f5dfaa]">{isIndonesian ? "Masalahnya bukan pada adab atau keterlibatan orang tepercaya. Masalahnya muncul ketika proses tidak memberi kenyamanan, pilihan, dan ruang bernapas bagi dua orang." : "The problem is not adab or trusted support. It appears when the process offers neither comfort, choice, nor breathing room to the two people involved."}</p></div></div>;
}

function JodohmuSolutionSlide({ language }: { language: "id" | "en" }) {
  const isIndonesian = language === "id";
  return <div className="mx-auto w-full max-w-6xl text-center"><p className="text-xs font-bold uppercase tracking-[.28em] text-[#e6bd69]">{isIndonesian ? "Jawaban yang kami tawarkan" : "The answer we offer"}</p><h2 className="mx-auto mt-7 max-w-5xl font-serif text-6xl font-bold leading-tight sm:text-8xl">{isIndonesian ? <>Solusinya adalah <span className="italic text-[#ef91b1]">Jodohmu.</span></> : <>The solution is <span className="italic text-[#ef91b1]">Jodohmu.</span></>}</h2><p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-white/75">{isIndonesian ? "Bukan untuk menentukan jodoh Anda. Untuk membuat jalan menuju pernikahan lebih jelas, privat, dan sesuai dengan cara Anda ingin menjalaninya." : "Not to decide your match for you. To make the path towards marriage clearer, private, and aligned with how you want to walk it."}</p><div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3">{(isIndonesian ? ["Niat jelas sejak awal", "Tidak ada tekanan", "Pilihan tetap di tangan Anda", "Keluarga hadir saat tepat"] : ["Clear intention from the start", "No pressure", "Your choice remains yours", "Family joins at the right time"]).map((item) => <span key={item} className="rounded-full border border-[#e6bd69]/35 bg-[#e6bd69]/10 px-4 py-2 text-sm font-bold text-[#f5dfaa]">{item}</span>)}</div></div>;
}

function InteractivePackagesSlide({ language }: { language: "id" | "en" }) {
  const isIndonesian = language === "id";
  const packages = isIndonesian ? [
    { name: "Pearl", cardTitle: "Memulai dengan jelas", cardDetail: "Langkah pertama yang jelas dan didampingi.", customEquivalent: "Rp 3.000.000", price: "Rp 2.500.000", saving: "Hemat Rp 500.000 · 17% lebih hemat", heading: "Mulai dengan struktur yang jelas", detail: "3 bulan · intake bersama founder, profil dan verifikasi dasar, update mingguan, serta 1 Pearl Joble.", points: ["KTP dan media sosial diverifikasi", "1 pendamping tepercaya & 1 fasilitator pilihan", "Respons setelah pertemuan diberikan secara privat"] },
    { name: "Ruby", cardTitle: "Solusi lengkap", cardDetail: "Pendampingan lebih dalam dari awal hingga akhir.", customEquivalent: "Rp 18.750.000", price: "Rp 15.000.000", saving: "Hemat Rp 3.750.000 · 20% lebih hemat", heading: "Dukungan lebih dalam untuk proses serius", detail: "6 bulan · sourcing kandidat aktif, verifikasi lebih dalam, 2 Ruby Joble, dan fasilitasi pertemuan keluarga.", points: ["Verifikasi identitas, kerja, dan slip gaji", "Background check & 1 asesmen psikologi klinis", "Maksimal 2 pendamping dan 1 fasilitator pilihan"] },
    { name: "Diamond", cardTitle: "Dukungan privat menyeluruh", cardDetail: "Perjalanan paling personal, dipimpin langsung oleh founder.", customEquivalent: "Rp 50.000.000", price: "Rp 40.000.000", saving: "Hemat Rp 10.000.000 · 20% lebih hemat", heading: "Concierge privat untuk kebutuhan paling personal", detail: "12 bulan · strategi langsung bersama founder, pencarian privat, dan 3 Diamond Joble di hotel bintang 4 atau 5.", points: ["Sourcing proaktif di dalam dan luar jaringan", "Laporan pencarian rahasia setiap minggu", "Debrief privat & fasilitasi keluarga saat tepat"] },
    { name: "Custom", cardTitle: "Solusi yang sesuai untuk Anda", cardDetail: "Perjalanan yang dibentuk di sekitar kebutuhan Anda.", customEquivalent: "", price: "", saving: "", heading: "Dukungan yang dirancang untuk situasi Anda", detail: "", points: [] },
  ] : [
    { name: "Pearl", cardTitle: "Getting started", cardDetail: "A clear, supported first step.", customEquivalent: "Rp 3,000,000", price: "Rp 2,500,000", saving: "Save Rp 500,000 · 17% more affordable", heading: "Begin with clear structure", detail: "3 months · founder intake, profile and foundational verification, weekly updates, and 1 Pearl Joble.", points: ["ID and social media verification", "1 trusted guest and 1 chosen facilitator", "Private response after the meeting"] },
    { name: "Ruby", cardTitle: "Complete solution", cardDetail: "Deeper guidance from start to finish.", customEquivalent: "Rp 18,750,000", price: "Rp 15,000,000", saving: "Save Rp 3,750,000 · 20% more affordable", heading: "Deeper support for a serious process", detail: "6 months · active sourcing, deeper verification, 2 Ruby Joble meetings, and facilitated family meeting.", points: ["Identity, workplace, and payslip verification", "Background check and 1 clinical psychology assessment", "Up to 2 trusted guests and 1 chosen facilitator"] },
    { name: "Diamond", cardTitle: "Private, complete support", cardDetail: "The most personal journey, led directly by the founder.", customEquivalent: "Rp 50,000,000", price: "Rp 40,000,000", saving: "Save Rp 10,000,000 · 20% more affordable", heading: "Private concierge for highly personal needs", detail: "12 months · direct founder strategy, private search, and 3 Diamond Joble meetings at a 4- or 5-star hotel.", points: ["Proactive sourcing within and beyond our network", "Confidential weekly search updates", "Private debriefs and family facilitation at the right time"] },
    { name: "Custom", cardTitle: "A solution that suits you", cardDetail: "A journey shaped around your needs.", customEquivalent: "", price: "", saving: "", heading: "Support built around your situation", detail: "", points: [] },
  ];
  const [active, setActive] = useState<string | null>(null);
  const chosen = packages.find((item) => item.name === active);
  const isCustom = chosen?.name === "Custom";
  return <div className="mx-auto w-full max-w-6xl"><p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isIndonesian ? "Dukungan yang dapat dipilih" : "Support you can choose"}</p><h2 className="mx-auto mt-3 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-5xl">{isIndonesian ? <>Kami melakukan yang Anda butuhkan—<span className="italic text-[#ef91b1]">dengan tingkat pendampingan yang tepat.</span></> : <>We do what you need—<span className="italic text-[#ef91b1]">with the right level of support.</span></>}</h2><p className="mx-auto mt-3 max-w-3xl text-center text-base leading-7 text-white/70">{isIndonesian ? "Pilih cara pendampingan yang terasa tepat. Nama paket, harga, dan detailnya muncul setelah dipilih." : "Choose the support that feels right. The package name, price, and details appear after you select it."}</p><div className="mx-auto mt-5 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">{packages.map((item) => <button key={item.name} onClick={() => setActive(active === item.name ? null : item.name)} className={`flex min-h-56 flex-col rounded-3xl border p-5 text-left transition ${active === item.name ? "border-[#e6bd69] bg-[#e6bd69]/15 shadow-xl shadow-black/20" : "border-white/15 bg-white/[.07] hover:-translate-y-1 hover:border-white/40"}`}><p className="font-serif text-3xl font-bold leading-tight">{item.cardTitle}</p><p className="mt-3 text-sm leading-6 text-white/65">{item.cardDetail}</p><p className="mt-auto pt-5 text-sm font-bold text-[#f3c5d4]">{active === item.name ? (isIndonesian ? "Tutup detail" : "Close details") : (isIndonesian ? "Jelajahi pilihan →" : "Explore option →")}</p></button>)}</div>{isCustom ? <CustomPlanBuilder language={language} /> : chosen && <div className="mx-auto mt-4 max-w-6xl rounded-3xl border border-[#e6bd69]/35 bg-[linear-gradient(145deg,rgba(230,189,105,.16),rgba(255,255,255,.07))] p-6 sm:p-8"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#e6bd69]">{chosen.heading}</p><h3 className="mt-2 font-serif text-4xl font-bold">{chosen.name}</h3><p className="mt-3 max-w-2xl leading-7 text-white/75">{chosen.detail}</p></div><div className="shrink-0 rounded-2xl bg-black/15 px-5 py-4 sm:text-right"><p className="text-xs font-bold uppercase tracking-[.14em] text-white/45">{isIndonesian ? "Jika dirangkai satu per satu" : "If built item by item"}</p><p className="mt-1 text-sm text-white/50 line-through">{chosen.customEquivalent}</p><p className="mt-1 font-serif text-3xl font-bold text-[#f3c5d4]">{chosen.price}</p><p className="mt-1 text-xs font-bold text-[#f5dfaa]">{chosen.saving}</p></div></div><ul className="mt-6 grid gap-3 border-t border-white/15 pt-6 sm:grid-cols-3">{chosen.points.map((point) => <li key={point} className="rounded-2xl bg-black/10 p-4 text-sm leading-6 text-white/80">{point}</li>)}</ul></div>}</div>;
}

function CustomPlanBuilder({ language }: { language: "id" | "en" }) {
  const isIndonesian = language === "id";
  const options = isIndonesian ? [
    { id: "onboarding", title: "Onboarding & profil", price: 1_250_000 },
    { id: "psychology", title: "Asesmen psikologi", price: 1_250_000 },
    { id: "background", title: "Background check", price: 2_750_000 },
    { id: "online", title: "Pertemuan online", price: 300_000 },
    { id: "family", title: "Pertemuan keluarga", price: 4_500_000 },
    { id: "pearlJoble", title: "Pearl Joble", price: 1_500_000 },
    { id: "rubyJoble", title: "Ruby Joble", price: 4_000_000 },
    { id: "diamondJoble", title: "Diamond Joble", price: 6_000_000 },
  ] : [
    { id: "onboarding", title: "Onboarding & profile", price: 1_250_000 },
    { id: "psychology", title: "Psychological assessment", price: 1_250_000 },
    { id: "background", title: "Background check", price: 2_750_000 },
    { id: "online", title: "Online meetings", price: 300_000 },
    { id: "family", title: "Family gathering", price: 4_500_000 },
    { id: "pearlJoble", title: "Pearl Joble", price: 1_500_000 },
    { id: "rubyJoble", title: "Ruby Joble", price: 4_000_000 },
    { id: "diamondJoble", title: "Diamond Joble", price: 6_000_000 },
  ];
  const [chosen, setChosen] = useState<string[]>(["onboarding", "online"]);
  const [counts, setCounts] = useState({ online: 3, psychology: 1, pearlJoble: 1, rubyJoble: 1, diamondJoble: 1 });
  const toggle = (id: string) => setChosen((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const countedIds = ["online", "psychology", "pearlJoble", "rubyJoble", "diamondJoble"] as const;
  const isCounted = (id: string): id is typeof countedIds[number] => countedIds.includes(id as typeof countedIds[number]);
  const quantity = (id: string) => isCounted(id) ? counts[id] : 1;
  const changeCount = (id: typeof countedIds[number], amount: number) => setCounts((current) => ({ ...current, [id]: Math.max(1, Math.min(12, current[id] + amount)) }));
  const lineTotal = (option: { id: string; price: number }) => option.price * quantity(option.id);
  const total = options.filter((option) => chosen.includes(option.id)).reduce((sum, option) => sum + lineTotal(option), 0);
  const formatRupiah = (amount: number) => `Rp ${amount.toLocaleString("id-ID")}`;
  const summary = options.filter((option) => chosen.includes(option.id)).map((option) => isCounted(option.id) ? `${quantity(option.id)} × ${option.title}` : option.title);
  return <div className="mx-auto mt-4 max-w-6xl rounded-3xl border border-[#a88ae6]/50 bg-[#a88ae6]/[.09] p-4 text-left sm:p-5"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#c9b6ff]">{isIndonesian ? "Rancang perjalanan Anda" : "Build your journey"}</p><h3 className="mt-1 font-serif text-2xl font-bold">{isIndonesian ? "Pilih yang Anda butuhkan." : "Choose what you need."}</h3><p className="mt-1 text-sm text-white/60">{isIndonesian ? "Pilih layanan, atur jumlah sesi atau Joble, lalu lihat harga yang dihitung langsung." : "Select support, set the number of sessions or Joble meetings, and see the price calculated live."}</p></div><p className="text-sm font-bold text-[#c9b6ff]">{chosen.length} {isIndonesian ? "area dipilih" : "areas selected"}</p></div><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{options.map((option) => { const selected = chosen.includes(option.id); const counterId = isCounted(option.id) ? option.id : null; const hasCounter = selected && counterId; return <div key={option.id} className={`rounded-xl border transition ${selected ? "border-[#c9b6ff] bg-[#a88ae6]/25" : "border-white/10 bg-white/[.04] hover:border-white/35"}`}><button onClick={() => toggle(option.id)} className="flex min-h-[52px] w-full items-center gap-3 px-3 py-2 text-left"><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold ${selected ? "bg-[#c9b6ff] text-[#211a3b]" : "bg-white/10 text-white/45"}`}>{selected ? "✓" : "+"}</span><span><p className="text-xs font-bold leading-4">{option.title}</p><p className="mt-0.5 text-[11px] font-bold text-[#c9b6ff]">{formatRupiah(option.price)}{counterId ? (isIndonesian ? " / sesi" : " each") : ""}</p></span></button>{hasCounter && <div className="flex items-center justify-between border-t border-[#c9b6ff]/25 px-3 py-2"><span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#c9b6ff]">{isIndonesian ? "Berapa kali?" : "How many?"}</span><div className="flex items-center gap-2"><button onClick={() => changeCount(counterId, -1)} className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-sm font-bold hover:bg-white/20" aria-label={isIndonesian ? `Kurangi ${option.title}` : `Reduce ${option.title}`}>−</button><span className="w-4 text-center text-sm font-bold text-[#c9b6ff]">{quantity(option.id)}</span><button onClick={() => changeCount(counterId, 1)} className="grid h-6 w-6 place-items-center rounded-full bg-[#c9b6ff] text-sm font-bold text-[#211a3b]" aria-label={isIndonesian ? `Tambah ${option.title}` : `Increase ${option.title}`}>+</button></div></div>}</div>; })}</div><div className="mt-3 rounded-2xl bg-[#101d3b]/70 px-4 py-3"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-white/45">{isIndonesian ? "Perjalanan sesuai kebutuhan Anda" : "Your tailored journey"}</p><p className="mt-1 text-sm leading-5 text-white/80">{summary.length ? summary.join(" → ") : (isIndonesian ? "Pilih dukungan yang ingin Anda sertakan." : "Choose the support you would like to include.")}</p></div>{chosen.length > 0 && <div className="sm:text-right"><p className="text-xs font-bold uppercase tracking-[.14em] text-white/45">{isIndonesian ? "Harga sesuai pilihan" : "Price for your selection"}</p><p className="font-serif text-2xl font-bold text-[#c9b6ff]">{formatRupiah(total)}</p></div>}</div></div></div>;
}

function MusaMarriageSlide({ language }: { language: "id" | "en" }) {
  const isIndonesian = language === "id";
  const details = isIndonesian
    ? [
        ["28:26", "ٱلْقَوِيُّ ٱلْأَمِينُ", "Dua ukuran yang dipilih Al-Qur’an: kuat/berkemampuan dan amanah. Kecocokan tidak dibangun hanya dari rasa tertarik."],
        ["28:27", "إِنِّي أُرِيدُ أَنْ أُنكِحَكَ", "Sang ayah menyatakan maksud nikah dengan bahasa yang terang. Arah hubungan tidak dibiarkan menjadi tebakan."],
        ["28:27", "عَلَىٰ أَنْ تَأْجُرَنِي ثَمَانِيَ حِجَجٍ", "Ada syarat yang disebut jelas: delapan tahun pelayanan. Ayat ini menyebut syarat kerja; jangan menamakannya mahar tanpa penjelasan fiqih lebih lanjut."],
        ["28:27", "فَإِنْ أَتْمَمْتَ عَشْرًا فَمِنْ عِندِكَ", "Tambahan dua tahun bukan kewajiban—ia pilihan Musa. Al-Qur’an membedakan komitmen yang wajib dari kebaikan sukarela."],
        ["28:27", "وَمَا أُرِيدُ أَنْ أَشُقَّ عَلَيْكَ", "Pihak keluarga juga menyatakan tidak ingin mempersulit. Kejelasan tidak boleh berubah menjadi tekanan atau beban yang zalim."],
        ["28:28", "ذَٰلِكَ بَيْنِي وَبَيْنَكَ", "Musa memberi persetujuan yang eksplisit. Lalu: ‘Allah atas apa yang kami ucapkan adalah Wakil’—komitmen diberi bobot amanah di hadapan Allah."],
      ]
    : [
        ["28:26", "ٱلْقَوِيُّ ٱلْأَمِينُ", "The Qur’an chooses two measures: capable/strong and trustworthy. Suitability is not built on attraction alone."],
        ["28:27", "إِنِّي أُرِيدُ أَنْ أُنكِحَكَ", "The father states the intention of marriage plainly. The direction of the relationship is not left for people to guess."],
        ["28:27", "عَلَىٰ أَنْ تَأْجُرَنِي ثَمَانِيَ حِجَجٍ", "A condition is stated plainly: eight years of service. The verse calls this a service term; do not simply call it mahr without further fiqh discussion."],
        ["28:27", "فَإِنْ أَتْمَمْتَ عَشْرًا فَمِنْ عِندِكَ", "The extra two years are not obligatory—they are Musa’s choice. The Qur’an distinguishes a binding commitment from voluntary excellence."],
        ["28:27", "وَمَا أُرِيدُ أَنْ أَشُقَّ عَلَيْكَ", "The family side also says it does not wish to make matters difficult. Clarity must not become pressure or unjust burden."],
        ["28:28", "ذَٰلِكَ بَيْنِي وَبَيْنَكَ", "Musa gives explicit agreement. Then: Allah is Trustee over what they say—commitment carries the weight of an amanah before Allah."],
      ];

  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isIndonesian ? "Membaca akad kata demi kata · QS. Al-Qasas 28:26–28" : "Reading the agreement word by word · Qur’an 28:26–28"}</p>
    <h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">{isIndonesian ? <>Al-Qur’an tidak hanya menceritakan nikah Musa—<span className="italic text-[#ef91b1]">ia memperlihatkan bahasanya.</span></> : <>The Qur’an does not only tell us that Musa married—<span className="italic text-[#ef91b1]">it lets us hear the language.</span></>}</h2>
    <div className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{details.map(([reference, title, detail]) => <div key={`${reference}-${title}`} className="rounded-3xl border border-white/15 bg-white/[.07] p-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#e6bd69]">{reference}</p><h3 dir="rtl" className="mt-2 font-serif text-2xl leading-relaxed text-[#f3c5d4]">{title}</h3><p className="mt-3 text-sm leading-6 text-white/65">{detail}</p></div>)}</div>
    <p className="mx-auto mt-6 max-w-5xl rounded-2xl border border-[#e6bd69]/30 bg-[#e6bd69]/10 px-5 py-3 text-center text-sm font-semibold leading-6 text-[#f5dfaa]">{isIndonesian ? "Ini kisah seorang nabi dalam syariat sebelum kita; ia memberi adab dan prinsip, bukan pengganti rujukan fiqih untuk akad masa kini." : "This is a prophet’s story in a law before ours; it offers adab and principles, not a replacement for fiqh guidance on a nikah today."}</p>
  </div>;
}

function MusaStorySlide({ language }: { language: "id" | "en" }) {
  const isIndonesian = language === "id";
  const verses = isIndonesian
    ? [
        ["QS. Al-Qasas 28:23", "مِن دُونِهِمُ ٱمْرَأَتَيْنِ تَذُودَانِ", "‘Di luar/terpisah dari mereka, dua perempuan menahan ternak.’ تَذُودَانِ bukan sekadar berdiri: para mufassir menjelaskannya sebagai menahan ternak agar tidak bercampur di kerumunan."],
        ["QS. Al-Qasas 28:23", "مَا خَطْبُكُمَا", "‘Apa keadaan kalian berdua?’ Pertanyaan Musa singkat, relevan dengan situasi, dan tidak melampaui kebutuhan."],
        ["QS. Al-Qasas 28:24", "فَسَقَىٰ لَهُمَا ثُمَّ تَوَلَّىٰ إِلَى ٱلظِّلِّ", "Susunan ayatnya penting: فَ—Musa segera menolong; lalu ثُمَّ—ia menepi ke teduh. Pertolongan tidak diubah menjadi alasan untuk berlama-lama."],
        ["QS. Al-Qasas 28:25", "تَمْشِى عَلَى ٱسْتِحْيَآءٍ", "Secara harfiah: ‘berjalan di atas/dengan haya.’ Al-Qur’an menyebut keadaan dan adabnya, bukan memberi rincian gerak atau pakaian."],
        ["QS. Al-Qasas 28:25", "إِنَّ أَبِى يَدْعُوكَ لِيَجْزِيَكَ", "Pesannya terukur: ‘Ayahku mengundangmu untuk membalas jasamu.’ Ia menyebut pengundang, tujuan, dan alasan—tanpa kata yang membuka keraguan."],
      ]
    : [
        ["Qur’an 28:23", "مِن دُونِهِمُ ٱمْرَأَتَيْنِ تَذُودَانِ", "‘Apart from them, two women were holding back their flock.’ تَذُودَانِ is more than standing aside: the exegetes explain it as keeping their flock back from the crowd."],
        ["Qur’an 28:23", "مَا خَطْبُكُمَا", "‘What is your situation?’ Musa’s question is brief, relevant to what he sees, and does not move beyond what the moment requires."],
        ["Qur’an 28:24", "فَسَقَىٰ لَهُمَا ثُمَّ تَوَلَّىٰ إِلَى ٱلظِّلِّ", "The sequence matters: فَ—Musa immediately helps; then ثُمَّ—he withdraws to the shade. Service is not turned into an excuse to linger."],
        ["Qur’an 28:25", "تَمْشِى عَلَى ٱسْتِحْيَآءٍ", "Literally: ‘walking upon/with haya.’ The Qur’an names her manner and adab; it does not specify a particular garment or physical movement."],
        ["Qur’an 28:25", "إِنَّ أَبِى يَدْعُوكَ لِيَجْزِيَكَ", "Her message is measured: ‘My father invites you to reward you.’ It identifies the inviter, purpose, and reason—without wording that opens doubt."],
      ];
  const notes = isIndonesian
    ? [
        ["Apa yang dikatakan tafsir klasik", "Ibn Kathir mengutip riwayat dari ‘Umar r.a. yang menggambarkan perempuan itu berjalan tertutup dan penuh malu. Ini adalah tafsir riwayat—bukan lafaz Al-Qur’an itu sendiri."],
        ["Haya bukan bisu atau pasif", "Pada ayat yang sama, perempuan itu berbicara, membawa pesan, lalu ayat berikutnya mencatat ia menilai Musa sebagai ٱلْقَوِيُّ ٱلْأَمِينُ. Haya mengatur cara, bukan menghapus akal dan suara."],
        ["Batas ketelitian", "Al-Qur’an tidak menyebut nama dua perempuan itu atau memastikan perempuan pada ayat 25 adalah yang kemudian dinikahi Musa. Kita tidak menambahkan rincian seolah-olah ia teks Al-Qur’an."],
      ]
    : [
        ["What classical tafsir adds", "Ibn Kathir cites reports from ‘Umar that describe her as walking covered and with restraint. That is reported tafsir—not the Qur’an’s exact wording itself."],
        ["Haya is not silence or passivity", "In the same verse she speaks, carries a message, and the next verse records a woman evaluating Musa as ٱلْقَوِيُّ ٱلْأَمِينُ. Haya governs the manner; it does not erase intellect or voice."],
        ["The boundary of accuracy", "The Qur’an does not name the women or confirm that the woman in verse 25 was the one Musa later married. We should not add details as though they were Qur’anic text."],
      ];

  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isIndonesian ? "Membaca urutan kisah · QS. Al-Qasas 28:23–25" : "Reading the narrative sequence · Qur’an 28:23–25"}</p>
    <h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">{isIndonesian ? <>Perhatikan <span className="italic text-[#ef91b1]">kata yang dipilih Al-Qur’an</span>—dan urutannya.</> : <>Notice <span className="italic text-[#ef91b1]">the Qur’an’s chosen words</span>—and their sequence.</>}</h2>
    <div className="mt-7 grid gap-5 lg:grid-cols-[1.04fr_.96fr]">
      <div className="space-y-3">{verses.map(([reference, arabic, meaning]) => <article key={reference} className="rounded-3xl border border-[#e6bd69]/30 bg-[linear-gradient(145deg,rgba(230,189,105,.15),rgba(255,255,255,.05))] p-5"><div className="flex items-start justify-between gap-4"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e6bd69]">{reference}</p><p dir="rtl" className="font-serif text-xl leading-relaxed text-[#f5dfaa] sm:text-2xl">{arabic}</p></div><p className="mt-3 text-sm leading-6 text-white/75">{meaning}</p></article>)}</div>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">{notes.map(([title, detail]) => <article key={title} className="rounded-3xl border border-white/15 bg-white/[.07] p-5"><h3 className="font-serif text-xl font-bold text-[#f3c5d4]">{title}</h3><p className="mt-2 text-sm leading-6 text-white/65">{detail}</p></article>)}</div>
    </div>
    <p className="mx-auto mt-5 max-w-5xl text-center text-sm font-semibold leading-6 text-[#f5dfaa]">{isIndonesian ? "Bacalah terlebih dahulu apa yang Allah firmankan; kemudian bedakan antara tafsir yang dapat dipercaya dan detail yang tidak pernah disebut Al-Qur’an." : "Read first what Allah says; then distinguish sound tafsir from details the Qur’an itself never states."}</p>
  </div>;
}

function StatisticsSlide({ content }: { content: StatisticsContent }) {
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{content.eyebrow}</p>
    <h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">{content.title}</h2>
    <p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-white/70">{content.lead}</p>
    <div className="mt-9 grid gap-4 sm:grid-cols-3">{content.items.map((item, index) => <div key={item.label} className="rounded-3xl border border-white/15 bg-white/[.07] p-6"><p className="font-serif text-4xl font-bold text-[#e6bd69]">{item.value ?? `0${index + 1}`}</p><h3 className="mt-3 text-lg font-bold leading-6">{item.label}</h3><p className="mt-3 text-sm leading-6 text-white/65">{item.detail}</p></div>)}</div>
    <p className="mx-auto mt-7 max-w-4xl rounded-2xl border border-[#e6bd69]/30 bg-[#e6bd69]/10 px-5 py-4 text-center text-sm leading-6 text-[#f5dfaa]">{content.note}</p>
  </div>;
}

function RouteSlide({ content }: { content: RouteContent }) {
  const labels = content.eyebrow.startsWith("Cara") ? { offer: "Yang ditawarkan", gaps: "Di mana proses ini dapat kurang memadai" } : { offer: "What it offers", gaps: "Where it can fall short" };
  return <div className="mx-auto grid w-full max-w-6xl gap-7 lg:grid-cols-[.82fr_1.18fr] lg:items-stretch">
    <div className="rounded-[2rem] border border-[#e6bd69]/35 bg-[linear-gradient(145deg,rgba(230,189,105,.18),rgba(255,255,255,.06))] p-7 sm:p-9">
      <p className="text-xs font-bold uppercase tracking-[.24em] text-[#e6bd69]">{content.eyebrow}</p>
      <h2 className="mt-5 font-serif text-4xl font-bold leading-tight sm:text-5xl">{content.title}</h2>
      <p className="mt-6 text-lg leading-8 text-white/75">{content.lead}</p>
      <div className="mt-8 border-l-2 border-[#ef91b1] pl-4"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#f3c5d4]">{labels.offer}</p><p className="mt-2 text-sm leading-6 text-white/80">{content.promise}</p></div>
    </div>
    <div className="rounded-[2rem] border border-white/15 bg-white/[.07] p-7 sm:p-9">
      <p className="text-xs font-bold uppercase tracking-[.22em] text-white/45">{labels.gaps}</p>
      <div className="mt-5 space-y-3">{content.gaps.map((gap, index) => <div key={gap} className="flex gap-4 rounded-2xl border border-white/10 bg-black/10 p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#ef91b1]/20 text-xs font-bold text-[#f3c5d4]">0{index + 1}</span><p className="text-sm leading-6 text-white/75">{gap}</p></div>)}</div>
      <p className="mt-6 rounded-2xl bg-[#101d3b]/70 p-4 text-sm font-bold leading-6 text-[#f5dfaa]">{content.impact}</p>
    </div>
  </div>;
}

function HowItWorksSlide({ content }: { content: StepsContent }) {
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{content.eyebrow}</p>
    <h2 className="mt-4 text-center font-serif text-4xl font-bold sm:text-6xl">{content.title}</h2>
    <p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-white/70">{content.lead}</p>
    <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{content.steps.map((step) => <div key={step.title} className="rounded-3xl border border-white/15 bg-white/[.07] p-6"><p className="font-serif text-2xl font-bold text-[#e6bd69]">{step.title}</p><p className="mt-4 text-sm leading-6 text-white/70">{step.detail}</p>{step.solves && <p className="mt-4 border-l-2 border-[#ef91b1] pl-3 text-xs font-bold leading-5 text-[#f3c5d4]">{step.solves}</p>}</div>)}</div>
  </div>;
}

function PrinciplesSlide({ content }: { content: PrinciplesContent }) {
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{content.eyebrow}</p>
    <h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">{content.title}</h2>
    <p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-white/70">{content.lead}</p>
    <div className="mt-9 grid gap-4 md:grid-cols-2">{content.principles.map((principle, index) => <div key={principle.title} className="flex gap-5 rounded-3xl border border-white/15 bg-white/[.07] p-6"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e6bd69] font-serif text-lg font-bold text-[#101d3b]">0{index + 1}</span><div><h3 className="text-xl font-bold text-[#f3c5d4]">{principle.title}</h3><p className="mt-2 leading-7 text-white/70">{principle.detail}</p></div></div>)}</div>
    <p className="mx-auto mt-7 max-w-4xl text-center text-sm leading-6 text-white/55">{content.note}</p>
  </div>;
}

function PackagesSlide({ content }: { content: PackagesContent }) {
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{content.eyebrow}</p>
    <h2 className="mt-4 text-center font-serif text-4xl font-bold sm:text-6xl">{content.title}</h2>
    <p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-white/70">{content.lead}</p>
    <div className="mt-9 grid gap-4 md:grid-cols-3">{content.packages.map((item, index) => <div key={item.name} className="rounded-[2rem] border border-white/15 bg-white/[.07] p-7"><p className="font-serif text-4xl font-bold" style={{ color: ["#7ed6c1", "#ef91b1", "#c9b6ff"][index] }}>{item.name}</p><p className="mt-5 text-base leading-7 text-white/80">{item.detail}</p><p className="mt-6 border-t border-white/15 pt-5 text-sm font-bold leading-6 text-[#f3c5d4]">{item.fit}</p></div>)}</div>
    <p className="mx-auto mt-7 max-w-4xl text-center text-sm leading-6 text-white/55">{content.note}</p>
  </div>;
}

function BenefitsSlide({ content }: { content: BenefitsContent }) {
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{content.eyebrow}</p>
    <h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">{content.title}</h2>
    <p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-white/70">{content.lead}</p>
    <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{content.benefits.map((benefit, index) => <div key={benefit.title} className="rounded-3xl border border-white/15 bg-white/[.07] p-6"><p className="font-serif text-3xl text-[#e6bd69]">0{index + 1}</p><h3 className="mt-5 text-xl font-bold">{benefit.title}</h3><p className="mt-3 text-sm leading-6 text-white/65">{benefit.detail}</p></div>)}</div>
    <p className="mx-auto mt-8 max-w-4xl text-center text-lg font-bold leading-7 text-[#f3c5d4]">{content.closing}</p>
  </div>;
}


function TitleSlide() { return <div className="mx-auto grid w-full max-w-6xl gap-9 lg:grid-cols-[1.03fr_.97fr] lg:items-center"><div className="text-left"><p className="text-xs font-bold uppercase tracking-[.28em] text-[#e6bd69]">Menemukan pasangan tanpa mengorbankan nilai</p><h1 className="mt-7 font-serif text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">Bisakah Kita Menemukan<br />Pasangan yang Tepat—<br /><span className="mt-3 block text-3xl italic text-[#ef91b1] sm:text-5xl">Tanpa Mengorbankan<br />Kehormatan & Nilai?</span></h1><div className="mt-10 flex items-center gap-3 text-sm font-semibold text-[#e6bd69]"><Heart className="h-5 w-5" /> Ya—dengan proses yang jelas, aman, dan beradab.</div><ChevronDown className="mt-10 h-6 w-6 animate-bounce text-[#e6bd69]" /></div><div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl shadow-black/30"><Image src="/presentations-sekolah-islam-wedding-hero-v3.png" alt="Pasangan Muslim Indonesia merayakan pernikahan dengan hangat dan bermartabat" fill className="object-cover" priority sizes="(max-width: 1024px) 86vw, 460px" /><div className="absolute inset-0 bg-gradient-to-t from-[#101d3b]/50 to-transparent" /></div></div>; }

function GenerationSlide() { const points = [["FOMO", "Takut tertinggal ketika semua orang tampak punya cerita."], ["Perbandingan", "Mengukur diri melalui sorotan hidup orang lain."], ["Kesepian", "Membuat perhatian sesaat terasa seperti jawaban."]]; return <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[.94fr_1.06fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">Realita generasi kita</p><h2 className="mt-5 font-serif text-5xl font-bold leading-tight sm:text-7xl">Kita selalu terhubung—<span className="italic text-[#ef91b1]">tetapi tidak selalu tenang.</span></h2><p className="mt-7 max-w-xl text-lg leading-8 text-white/70">Di tengah chat, konten, dan perbandingan tanpa henti, hati mudah lelah sebelum kita memahami apa yang benar-benar kita butuhkan.</p><p className="mt-8 border-l-2 border-[#e6bd69] pl-4 text-sm font-bold leading-6 text-[#f3c5d4]">Perhatian bukan selalu penghargaan. Kedekatan bukan selalu arah.</p></div><div className="space-y-4">{points.map(([title, text], index) => <div key={title} className="flex gap-5 rounded-3xl border border-white/15 bg-white/[.07] p-6"><span className="font-serif text-3xl text-[#e6bd69]">0{index + 1}</span><div><h3 className="text-2xl font-bold">{title}</h3><p className="mt-2 max-w-sm leading-7 text-white/65">{text}</p></div></div>)}</div></div>; }

function IslamSlide() { return <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.12fr_.88fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">Perspektif Islam</p><h2 className="mt-5 font-serif text-5xl font-bold leading-tight sm:text-7xl">Islam tidak menolak cinta. <span className="italic text-[#ef91b1]">Islam memberi cinta arah.</span></h2><blockquote className="mt-8 max-w-2xl border-l-2 border-[#e6bd69] pl-5 text-xl italic leading-8 text-white/80">“Agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.”</blockquote><p className="mt-4 text-sm font-bold uppercase tracking-[.18em] text-[#e6bd69]">QS. Ar-Rum 30:21</p></div><div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/[.07] p-7"><span className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#ef91b1]/15 blur-3xl" /><div className="relative space-y-7">{[["Sakinah", "ketenangan yang meneduhkan"], ["Mawaddah", "kasih yang dirawat"], ["Rahmah", "sayang yang bertanggung jawab"]].map(([name, meaning]) => <div key={name}><h3 className="font-serif text-4xl font-bold text-[#e6bd69]">{name}</h3><p className="mt-1 text-lg text-white/75">{meaning}</p></div>)}</div></div></div>; }

function ReadinessSlide() { const items = [[ShieldCheck, "Iman", "Apa yang menuntun pilihan kita ketika perasaan sedang kuat?"], [Heart, "Akhlak", "Bagaimana kita berbicara, menahan diri, dan menghormati orang lain?"], [Users, "Arah hidup", "Kehidupan seperti apa yang ingin kita bangun bersama kelak?"]]; return <div className="mx-auto w-full max-w-6xl"><p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">Kesiapan dimulai dari diri</p><h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">Sebelum mencari siapa, <span className="italic text-[#ef91b1]">perbaiki diri kita.</span></h2><p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-white/65">Kesiapan bukan berarti sudah sempurna. Kesiapan berarti cukup jujur untuk belajar, bertumbuh, dan bertanggung jawab.</p><div className="mt-10 grid gap-4 md:grid-cols-3">{items.map(([Icon, title, text], index) => { const ItemIcon = Icon as typeof Heart; return <div key={String(title)} className="rounded-3xl border border-white/15 bg-white/[.07] p-7"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#ef91b1]/15 text-[#f3c5d4]"><ItemIcon className="h-5 w-5" /></span><p className="mt-7 font-serif text-3xl font-bold text-[#e6bd69]">0{index + 1}</p><h3 className="mt-2 text-2xl font-bold">{title as string}</h3><p className="mt-3 leading-7 text-white/65">{text as string}</p></div>; })}</div><p className="mt-8 text-center text-lg font-bold text-[#f3c5d4]">Pertanyaan terbaik bukan “siapa yang akan memilihku?” tetapi “orang seperti apa aku sedang menjadi?”</p></div>; }

function TaarufSlide() { const values = [["Apa itu ta’aruf?", "Mengenal seseorang dengan niat mempertimbangkan pernikahan—bukan hubungan tanpa arah."], ["Adab dijaga", "Cara berbicara, bertanya, dan mengambil keputusan tetap menghormati dua pihak."], ["Formatnya dapat dipilih", "Tidak ada satu suasana yang wajib untuk semua orang: pendamping, fasilitator, dan bentuk percakapan perlu mengikuti kenyamanan serta persetujuan dua pihak."], ["Keluarga hadir dengan sehat", "Keluarga atau wali dapat dilibatkan saat membantu—bukan untuk mengambil alih pilihan dua orang."]]; return <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[.95fr_1.05fr] lg:items-center"><div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl shadow-black/30"><Image src="/presentations-sekolah-islam-taaruf-family-v2.png" alt="Ta’aruf yang dibicarakan secara terbuka bersama keluarga" fill className="object-cover" sizes="(max-width: 1024px) 86vw, 600px" /><div className="absolute inset-0 bg-gradient-to-t from-[#101d3b]/75 via-transparent to-transparent" /><p className="absolute bottom-7 left-7 right-7 text-sm font-bold uppercase tracking-[.18em] text-[#e6bd69]">Jelas · Hangat · Beradab</p></div><div><p className="text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">Mengenal dengan niat</p><h2 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-6xl">Ta’aruf adalah jalan yang baik—<span className="italic text-[#ef91b1]">bila caranya juga baik.</span></h2><p className="mt-4 text-sm leading-6 text-white/70">Ta’aruf tidak harus terasa seperti wawancara dingin atau ruang yang membuat orang takut salah. Prinsipnya kuat; pengalaman manusiawinya perlu dirancang dengan baik.</p><div className="mt-5 divide-y divide-white/15 border-y border-white/15">{values.map(([title, text]) => <div key={title} className="grid gap-2 py-3 sm:grid-cols-[10rem_1fr]"><h3 className="font-bold text-[#f3c5d4]">{title}</h3><p className="text-sm leading-6 text-white/65">{text}</p></div>)}</div></div></div>; }

function JodohmuSlide() { const steps = [["Dengarkan cerita", "Tujuan, nilai, batas, dan gambaran masa depan dibicarakan secara personal."], ["Pertimbangkan perkenalan", "Kemungkinan dibagikan secara privat, dengan waktu untuk menilai dan mengatakan tidak."], ["Persetujuan dua pihak", "Kontak atau pertemuan tidak didorong tanpa kesediaan dua orang yang terlibat."], ["Temui dengan tujuan", "Format pertemuan dapat dibuat lebih jelas, termasuk pendamping tepercaya bila diinginkan."]]; return <div className="mx-auto w-full max-w-6xl"><p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">Ketika Anda memilih untuk serius</p><h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">Apa itu Jodohmu? <span className="italic text-[#ef91b1]">Proses yang menata pilihan Anda.</span></h2><p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-white/65">Jodohmu adalah layanan perkenalan personal bagi orang dewasa yang ingin bergerak menuju pernikahan. Anda tidak harus sempurna untuk memulai—tetapi Anda perlu memilih untuk menjalani proses dengan jujur dan bertanggung jawab.</p><div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([title, text], index) => <div key={title} className="rounded-3xl border border-white/15 bg-white/[.07] p-5"><p className="font-serif text-3xl text-[#e6bd69]">0{index + 1}</p><h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/65">{text}</p></div>)}</div><p className="mt-8 text-center text-sm font-bold text-[#f3c5d4]">Struktur yang baik memberi ruang untuk berpikir—bukan tekanan untuk segera memilih.</p></div>; }

function CloseSlide() { return <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/15 text-center shadow-2xl shadow-black/30"><Image src="/presentations-sekolah-islam-mosque-courtyard-v2.png" alt="Halaman masjid yang tenang di pagi hari" fill className="object-cover" sizes="(max-width: 1024px) 95vw, 1152px" /><div className="relative flex min-h-[500px] items-center bg-[linear-gradient(90deg,rgba(16,29,59,.96)_0%,rgba(16,29,59,.82)_46%,rgba(16,29,59,.20)_100%)] p-8 sm:min-h-[540px] sm:p-12"><div className="mx-auto max-w-4xl"><p className="text-xs font-bold uppercase tracking-[.28em] text-[#e6bd69]">Penutup</p><h2 className="mt-7 font-serif text-5xl font-bold leading-tight sm:text-7xl">Pernikahan perlu <span className="italic text-[#ef91b1]">kesungguhan, bukan penundaan tanpa akhir.</span></h2><p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-white/85">Jangan habiskan bertahun-tahun di percakapan yang tidak bergerak. Jika niatnya baik dan kecocokannya ada, bergeraklah dari perkenalan menuju kejelasan—dengan adab dan tanggung jawab.</p><div className="mx-auto mt-10 h-1.5 w-24 rounded-full bg-[#e6bd69]" /><p className="mt-9 text-2xl font-bold text-[#e6bd69] sm:text-3xl">Jaga hati. Bergerak dengan tujuan. Bangun masa depan yang lebih besar.</p><Link href="/presentations" className="mt-12 inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-bold text-white/90 transition hover:bg-white/10"><ArrowLeft className="h-4 w-4" /> Lihat semua presentasi</Link></div></div></div>; }

function EnglishTitleSlide() {
  return <div className="mx-auto grid w-full max-w-6xl gap-9 lg:grid-cols-[1.03fr_.97fr] lg:items-center"><div className="text-left"><p className="text-xs font-bold uppercase tracking-[.28em] text-[#e6bd69]">Finding a partner without compromising values</p><h1 className="mt-7 font-serif text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">Can We Find the<br />Right Partner—<br /><span className="mt-3 block text-3xl italic text-[#ef91b1] sm:text-5xl">Without Compromising<br />Modesty & Values?</span></h1><div className="mt-10 flex items-center gap-3 text-sm font-semibold text-[#e6bd69]"><Heart className="h-5 w-5" /> Yes—with a process that is clear, safe, and dignified.</div><ChevronDown className="mt-10 h-6 w-6 animate-bounce text-[#e6bd69]" /></div><div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl shadow-black/30"><Image src="/presentations-sekolah-islam-wedding-hero-v3.png" alt="An Indonesian Muslim couple celebrating their marriage warmly and with dignity" fill className="object-cover" priority sizes="(max-width: 1024px) 86vw, 460px" /><div className="absolute inset-0 bg-gradient-to-t from-[#101d3b]/50 to-transparent" /></div></div>;
}

function EnglishGenerationSlide() {
  const points = [["FOMO", "Feeling left behind when everyone else seems to have a story."], ["Comparison", "Measuring yourself through the highlights of other people’s lives."], ["Loneliness", "Making brief attention feel like the answer."]];
  return <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[.94fr_1.06fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">Our generation’s reality</p><h2 className="mt-5 font-serif text-5xl font-bold leading-tight sm:text-7xl">We are always connected—<span className="italic text-[#ef91b1]">yet not always at peace.</span></h2><p className="mt-7 max-w-xl text-lg leading-8 text-white/70">Among chats, content, and constant comparison, the heart can grow tired before we understand what we truly need.</p><p className="mt-8 border-l-2 border-[#e6bd69] pl-4 text-sm font-bold leading-6 text-[#f3c5d4]">Attention is not always appreciation. Closeness is not always direction.</p></div><div className="space-y-4">{points.map(([title, text], index) => <div key={title} className="flex gap-5 rounded-3xl border border-white/15 bg-white/[.07] p-6"><span className="font-serif text-3xl text-[#e6bd69]">0{index + 1}</span><div><h3 className="text-2xl font-bold">{title}</h3><p className="mt-2 max-w-sm leading-7 text-white/65">{text}</p></div></div>)}</div></div>;
}

function EnglishIslamSlide() {
  return <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.12fr_.88fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">An Islamic perspective</p><h2 className="mt-5 font-serif text-5xl font-bold leading-tight sm:text-7xl">Islam does not reject love. <span className="italic text-[#ef91b1]">It gives love direction.</span></h2><blockquote className="mt-8 max-w-2xl border-l-2 border-[#e6bd69] pl-5 text-xl italic leading-8 text-white/80">“So that you may find tranquillity in one another, and He has placed between you affection and mercy.”</blockquote><p className="mt-4 text-sm font-bold uppercase tracking-[.18em] text-[#e6bd69]">Qur’an 30:21</p></div><div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/[.07] p-7"><span className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#ef91b1]/15 blur-3xl" /><div className="relative space-y-7">{[["Sakinah", "a peace that settles the heart"], ["Mawaddah", "affection that is cared for"], ["Rahmah", "mercy with responsibility"]].map(([name, meaning]) => <div key={name}><h3 className="font-serif text-4xl font-bold text-[#e6bd69]">{name}</h3><p className="mt-1 text-lg text-white/75">{meaning}</p></div>)}</div></div></div>;
}

function EnglishReadinessSlide() {
  const items = [[ShieldCheck, "Faith", "What guides our choices when feelings are strong?"], [Heart, "Character", "How do we speak, hold ourselves back, and respect others?"], [Users, "Life direction", "What kind of life do we hope to build together one day?"]];
  return <div className="mx-auto w-full max-w-6xl"><p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">Readiness begins within</p><h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">Before asking who, <span className="italic text-[#ef91b1]">work on who we are.</span></h2><p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-white/65">Readiness does not mean being perfect. It means being honest enough to learn, grow, and take responsibility.</p><div className="mt-10 grid gap-4 md:grid-cols-3">{items.map(([Icon, title, text], index) => { const ItemIcon = Icon as typeof Heart; return <div key={String(title)} className="rounded-3xl border border-white/15 bg-white/[.07] p-7"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#ef91b1]/15 text-[#f3c5d4]"><ItemIcon className="h-5 w-5" /></span><p className="mt-7 font-serif text-3xl font-bold text-[#e6bd69]">0{index + 1}</p><h3 className="mt-2 text-2xl font-bold">{title as string}</h3><p className="mt-3 leading-7 text-white/65">{text as string}</p></div>; })}</div><p className="mt-8 text-center text-lg font-bold text-[#f3c5d4]">The better question is not “who will choose me?” but “what kind of person am I becoming?”</p></div>;
}

function EnglishTaarufSlide() { const values = [["What is ta’aruf?", "Getting to know someone with the intention of considering marriage—not a relationship with no direction."], ["Good manners are protected", "The way we speak, ask, and decide continues to honour both people."], ["The format can be chosen", "There is no one atmosphere required for everyone: guests, facilitator, and conversation format should follow both people’s comfort and consent."], ["Family joins healthily", "Family or a wali can join when helpful—not to take the choice away from the two people."]]; return <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[.95fr_1.05fr] lg:items-center"><div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl shadow-black/30"><Image src="/presentations-sekolah-islam-taaruf-family-v2.png" alt="A ta’aruf conversation held openly with family present" fill className="object-cover" sizes="(max-width: 1024px) 86vw, 600px" /><div className="absolute inset-0 bg-gradient-to-t from-[#101d3b]/75 via-transparent to-transparent" /><p className="absolute bottom-7 left-7 right-7 text-sm font-bold uppercase tracking-[.18em] text-[#e6bd69]">Clear · Warm · Respectful</p></div><div><p className="text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">Getting to know someone with intention</p><h2 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-6xl">Ta’aruf is a good path—<span className="italic text-[#ef91b1]">when the way it is held is good too.</span></h2><p className="mt-4 text-sm leading-6 text-white/70">Ta’aruf does not need to feel like a cold interview or a room where people fear getting something wrong. Its principle is strong; its human experience needs to be designed well.</p><div className="mt-5 divide-y divide-white/15 border-y border-white/15">{values.map(([title, text]) => <div key={title} className="grid gap-2 py-3 sm:grid-cols-[10rem_1fr]"><h3 className="font-bold text-[#f3c5d4]">{title}</h3><p className="text-sm leading-6 text-white/65">{text}</p></div>)}</div></div></div>; }

function EnglishJodohmuSlide() { const steps = [["Listen to your story", "Your goals, values, boundaries, and hopes for the future are discussed personally."], ["Consider an introduction", "A possibility is shared privately, with time to consider it and say no."], ["Consent from both people", "Contact or a meeting is not pushed without the willingness of both people involved."], ["Meet with purpose", "A meeting can be structured more clearly, including trusted support if desired."]]; return <div className="mx-auto w-full max-w-6xl"><p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">When you choose to be serious</p><h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">What is Jodohmu? <span className="italic text-[#ef91b1]">A process that structures your choices.</span></h2><p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-white/65">Jodohmu is a personal introduction service for adults who want to move towards marriage. You do not need to be perfect to begin—but you do need to choose a process with honesty and responsibility.</p><div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([title, text], index) => <div key={title} className="rounded-3xl border border-white/15 bg-white/[.07] p-5"><p className="font-serif text-3xl text-[#e6bd69]">0{index + 1}</p><h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/65">{text}</p></div>)}</div><p className="mt-8 text-center text-sm font-bold text-[#f3c5d4]">Good structure creates room to think—not pressure to choose quickly.</p></div>; }

function EnglishCloseSlide() { return <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/15 text-center shadow-2xl shadow-black/30"><Image src="/presentations-sekolah-islam-mosque-courtyard-v2.png" alt="A quiet mosque courtyard in the morning" fill className="object-cover" sizes="(max-width: 1024px) 95vw, 1152px" /><div className="relative flex min-h-[500px] items-center bg-[linear-gradient(90deg,rgba(16,29,59,.96)_0%,rgba(16,29,59,.82)_46%,rgba(16,29,59,.20)_100%)] p-8 sm:min-h-[540px] sm:p-12"><div className="mx-auto max-w-4xl"><p className="text-xs font-bold uppercase tracking-[.28em] text-[#e6bd69]">Closing reflection</p><h2 className="mt-7 font-serif text-5xl font-bold leading-tight sm:text-7xl">Marriage needs <span className="italic text-[#ef91b1]">seriousness—not endless delay.</span></h2><p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-white/85">Do not spend years in conversations that never move. When intention is good and compatibility is present, move from introduction towards clarity—with adab and responsibility.</p><div className="mx-auto mt-10 h-1.5 w-24 rounded-full bg-[#e6bd69]" /><p className="mt-9 text-2xl font-bold text-[#e6bd69] sm:text-3xl">Guard your heart. Move with purpose. Build a bigger future.</p><Link href="/presentations" className="mt-12 inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-bold text-white/90 transition hover:bg-white/10"><ArrowLeft className="h-4 w-4" /> View all presentations</Link></div></div></div>; }
