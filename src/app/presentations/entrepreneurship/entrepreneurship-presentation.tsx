"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronDown, Coins, Expand, Heart, Languages, Scale, ShieldCheck, Users } from "lucide-react";
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
  <EntrepreneurshipTitleSlide key="title" language="id" />,
  <OpeningQuestionSlide key="opening-question" language="id" />,
  <EvidenceSlide key="wealth-burden" language="id" side="burden" />,
  <AbdurrahmanSlide key="abdurrahman" language="id" />,
  <EvidenceSlide key="wealth-good" language="id" side="good" />,
  <ConfusionSlide key="confusion" language="id" />,
  <PhilosophySlide key="philosophy" language="id" />,
  <PurposeBridgeSlide key="purpose-bridge" language="id" />,
  <QuranExplorerSlide key="musa-quran-reader" language="id" />,
  <IndonesiaRealitySlide key="indonesia-reality" language="id" />,
  <StatisticsSlide key="statistics" content={indonesianContent.statistics} />,
  <ExpandableCardsSlide key="route-comparison" language="id" variant="routes" />,
  <TopicSlide key="missing-system" content={indonesianContent.missingSystem} />,
  <JodohmuSolutionSlide key="jodohmu-solution" language="id" />,
  <ExpandableCardsSlide key="how-it-works" language="id" variant="process" />,
  <PrinciplesSlide key="principles" content={indonesianContent.principles} />,
  <BusinessModelIntroSlide key="business-model-intro" language="id" />,
  <SalesMethodSlide key="sales-method" language="id" />,
  <InteractivePackagesSlide key="packages" language="id" />,
  <ColdStartSlide key="cold-start" language="id" />,
  <BusinessRulesSlide key="business-rules" language="id" />,
  <EntrepreneurshipCloseSlide key="close" language="id" />,
  <ContactSlide key="contact" language="id" />,
];

const englishSlides = [
  <EntrepreneurshipTitleSlide key="title" language="en" />,
  <OpeningQuestionSlide key="opening-question" language="en" />,
  <EvidenceSlide key="wealth-burden" language="en" side="burden" />,
  <AbdurrahmanSlide key="abdurrahman" language="en" />,
  <EvidenceSlide key="wealth-good" language="en" side="good" />,
  <ConfusionSlide key="confusion" language="en" />,
  <PhilosophySlide key="philosophy" language="en" />,
  <PurposeBridgeSlide key="purpose-bridge" language="en" />,
  <QuranExplorerSlide key="musa-quran-reader" language="en" />,
  <IndonesiaRealitySlide key="indonesia-reality" language="en" />,
  <StatisticsSlide key="statistics" content={englishContent.statistics} />,
  <ExpandableCardsSlide key="route-comparison" language="en" variant="routes" />,
  <TopicSlide key="missing-system" content={englishContent.missingSystem} />,
  <JodohmuSolutionSlide key="jodohmu-solution" language="en" />,
  <ExpandableCardsSlide key="how-it-works" language="en" variant="process" />,
  <PrinciplesSlide key="principles" content={englishContent.principles} />,
  <BusinessModelIntroSlide key="business-model-intro" language="en" />,
  <SalesMethodSlide key="sales-method" language="en" />,
  <InteractivePackagesSlide key="packages" language="en" />,
  <ColdStartSlide key="cold-start" language="en" />,
  <BusinessRulesSlide key="business-rules" language="en" />,
  <EntrepreneurshipCloseSlide key="close" language="en" />,
  <ContactSlide key="contact" language="en" />,
];

export function EntrepreneurshipPresentation() {
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
        <p className="hidden text-xs font-bold uppercase tracking-[.24em] text-white/55 sm:block">{language === "id" ? "Uang, tujuan, dan membangun usaha yang jujur" : "Money, purpose, and building honestly"}</p>
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
  return <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl shadow-black/30"><Image src="/presentations-islamic-school-hero.png" alt={isIndonesian ? "Dua pelajar Muslim di halaman masjid" : "Two Muslim students in a mosque courtyard"} fill className="object-cover object-[62%_center]" sizes="(max-width: 1024px) 95vw, 1152px" priority /><div className="relative flex min-h-[500px] items-center bg-[linear-gradient(90deg,rgba(16,29,59,.96)_0%,rgba(16,29,59,.84)_45%,rgba(16,29,59,.22)_100%)] p-8 sm:min-h-[540px] sm:p-12"><div className="max-w-2xl text-left"><p className="text-xs font-bold uppercase tracking-[.28em] text-[#e6bd69]">{isIndonesian ? "Mari kita lihat dengan jujur" : "Let us look honestly"}</p><h2 className="mt-6 font-serif text-5xl font-bold leading-tight sm:text-7xl">{isIndonesian ? <>Realita <span className="italic text-[#ef91b1]">Indonesia.</span></> : <>Indonesia’s <span className="italic text-[#ef91b1]">reality.</span></>}</h2><p className="mt-7 max-w-xl text-lg leading-8 text-white/80">{isIndonesian ? "Setelah melihat proses yang ditunjukkan Al-Qur’an, mari jujur melihat ruang tempat kita mencari pasangan hari ini." : "After seeing the process shown in the Qur’an, let us honestly look at the space in which people seek a partner today."}</p><div className="mt-8 h-1.5 w-24 rounded-full bg-[#e6bd69]" /></div></div></div>;
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
  return <div className="mx-auto grid w-full max-w-6xl gap-9 lg:grid-cols-[1.12fr_.88fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.28em] text-[#e6bd69]">{isIndonesian ? "Jawaban yang kami tawarkan" : "The answer we offer"}</p><h2 className="mt-6 font-serif text-5xl font-bold leading-tight sm:text-7xl">{isIndonesian ? <>Solusinya adalah <span className="italic text-[#ef91b1]">Jodohmu.</span></> : <>The solution is <span className="italic text-[#ef91b1]">Jodohmu.</span></>}</h2><p className="mt-7 max-w-2xl text-lg leading-8 text-white/75">{isIndonesian ? "Bukan untuk menentukan jodoh Anda. Untuk membuat jalan menuju pernikahan lebih jelas, privat, dan sesuai dengan cara Anda ingin menjalaninya." : "Not to decide your match for you. To make the path towards marriage clearer, private, and aligned with how you want to walk it."}</p><div className="mt-9 flex max-w-2xl flex-wrap gap-3">{(isIndonesian ? ["Niat jelas sejak awal", "Tidak ada tekanan", "Pilihan tetap di tangan Anda", "Keluarga hadir saat tepat"] : ["Clear intention from the start", "No pressure", "Your choice remains yours", "Family joins at the right time"]).map((item) => <span key={item} className="rounded-full border border-[#e6bd69]/35 bg-[#e6bd69]/10 px-4 py-2 text-sm font-bold text-[#f5dfaa]">{item}</span>)}</div></div><div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl shadow-black/30"><Image src="/presentations-sekolah-islam-study-space-v2.png" alt={isIndonesian ? "Ruang tenang untuk menata masa depan" : "A quiet space for planning the future"} fill className="object-cover" sizes="(max-width: 1024px) 74vw, 420px" /><div className="absolute inset-0 bg-gradient-to-t from-[#101d3b]/85 via-transparent to-transparent" /><p className="absolute bottom-7 left-7 right-7 text-sm font-bold uppercase tracking-[.18em] text-[#e6bd69]">{isIndonesian ? "Jelas · Privat · Terarah" : "Clear · Private · Purposeful"}</p></div></div>;
}

function InteractivePackagesSlide({ language }: { language: "id" | "en" }) {
  const isIndonesian = language === "id";
  const packages = isIndonesian ? [
    { name: "Pearl", cardTitle: "Memulai dengan jelas", cardDetail: "Langkah pertama yang jelas dan didampingi.", customEquivalent: "Rp 3.000.000", price: "Rp 2.500.000", saving: "Hemat Rp 500.000 · 17% lebih hemat", heading: "Mulai dengan struktur yang jelas", detail: "3 bulan · intake bersama Dokcin, profil dan verifikasi dasar, update mingguan, serta 1 Pearl Joble.", points: ["KTP dan media sosial diverifikasi", "1 pendamping tepercaya & 1 fasilitator pilihan", "Respons setelah pertemuan diberikan secara privat"] },
    { name: "Ruby", cardTitle: "Solusi lengkap", cardDetail: "Pendampingan lebih dalam dari awal hingga akhir.", customEquivalent: "Rp 18.750.000", price: "Rp 15.000.000", saving: "Hemat Rp 3.750.000 · 20% lebih hemat", heading: "Dukungan lebih dalam untuk proses serius", detail: "6 bulan · sourcing kandidat aktif, verifikasi lebih dalam, 2 Ruby Joble, dan fasilitasi pertemuan keluarga.", points: ["Verifikasi identitas, kerja, dan slip gaji", "Background check & 1 asesmen psikologi klinis", "Maksimal 2 pendamping dan 1 fasilitator pilihan"] },
    { name: "Diamond", cardTitle: "Dukungan privat menyeluruh", cardDetail: "Perjalanan paling personal, dipimpin langsung oleh matchmaker senior (Dokcin).", customEquivalent: "Rp 50.000.000", price: "Rp 40.000.000", saving: "Hemat Rp 10.000.000 · 20% lebih hemat", heading: "Concierge privat untuk kebutuhan paling personal", detail: "12 bulan · strategi langsung bersama matchmaker senior (Dokcin), pencarian privat, dan 3 Diamond Joble di hotel bintang 4 atau 5.", points: ["Sourcing proaktif di dalam dan luar jaringan", "Laporan pencarian rahasia setiap minggu", "Debrief privat & fasilitasi keluarga saat tepat"] },
    { name: "Custom", cardTitle: "Solusi yang sesuai untuk Anda", cardDetail: "Perjalanan yang dibentuk di sekitar kebutuhan Anda.", customEquivalent: "", price: "", saving: "", heading: "Dukungan yang dirancang untuk situasi Anda", detail: "", points: [] },
  ] : [
    { name: "Pearl", cardTitle: "Getting started", cardDetail: "A clear, supported first step.", customEquivalent: "Rp 3,000,000", price: "Rp 2,500,000", saving: "Save Rp 500,000 · 17% more affordable", heading: "Begin with clear structure", detail: "3 months · Dokcin intake, profile and foundational verification, weekly updates, and 1 Pearl Joble.", points: ["ID and social media verification", "1 trusted guest and 1 chosen facilitator", "Private response after the meeting"] },
    { name: "Ruby", cardTitle: "Complete solution", cardDetail: "Deeper guidance from start to finish.", customEquivalent: "Rp 18,750,000", price: "Rp 15,000,000", saving: "Save Rp 3,750,000 · 20% more affordable", heading: "Deeper support for a serious process", detail: "6 months · active sourcing, deeper verification, 2 Ruby Joble meetings, and facilitated family meeting.", points: ["Identity, workplace, and payslip verification", "Background check and 1 clinical psychology assessment", "Up to 2 trusted guests and 1 chosen facilitator"] },
    { name: "Diamond", cardTitle: "Private, complete support", cardDetail: "The most personal journey, led directly by a senior matchmaker (Dokcin).", customEquivalent: "Rp 50,000,000", price: "Rp 40,000,000", saving: "Save Rp 10,000,000 · 20% more affordable", heading: "Private concierge for highly personal needs", detail: "12 months · direct strategy with a senior matchmaker (Dokcin), private search, and 3 Diamond Joble meetings at a 4- or 5-star hotel.", points: ["Proactive sourcing within and beyond our network", "Confidential weekly search updates", "Private debriefs and family facilitation at the right time"] },
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
  const routeImage = content.eyebrow.includes("01") ? "/presentations-sekolah-islam-route-dating-apps.png" : content.eyebrow.includes("02") ? "/presentations-sekolah-islam-route-family-reference.png" : content.eyebrow.includes("03") ? "/presentations-sekolah-islam-route-community-guide.png" : "/presentations-sekolah-islam-route-natural-meeting.png";
  return <div className="mx-auto grid w-full max-w-6xl gap-7 lg:grid-cols-[.82fr_1.18fr] lg:items-stretch">
    <div className="overflow-hidden rounded-[2rem] border border-[#e6bd69]/35 bg-white/[.07] shadow-xl shadow-black/20">
      <div className="relative h-36 overflow-hidden sm:h-40">
        <Image src={routeImage} alt={content.title} fill className="object-cover object-right" sizes="(max-width: 1024px) 86vw, 460px" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,29,59,.28),rgba(16,29,59,.04))]" />
      </div>
      <div className="flex min-h-[330px] flex-col p-7 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.24em] text-[#e6bd69]">{content.eyebrow}</p>
        <h2 className="mt-4 font-serif text-3xl font-bold leading-tight sm:text-4xl">{content.title}</h2>
        <p className="mt-4 text-base leading-7 text-white/80">{content.lead}</p>
        <div className="mt-auto border-l-2 border-[#ef91b1] pl-4"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#f3c5d4]">{labels.offer}</p><p className="mt-2 text-sm leading-6 text-white/85">{content.promise}</p></div>
      </div>
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

type Bilingual = { id: string; en: string };
type Evidence = { ref: string; grade: Bilingual; narration: Bilingual; points?: { id: string[]; en: string[] }; takeaway: Bilingual };

const wealthGoodEvidence: Evidence[] = [
  {
    ref: "Jāmiʿ al-Tirmidhī 3701 · Musnad Aḥmad 20630",
    grade: { id: "Ḥasan gharīb (al-Tirmidhī)", en: "Ḥasan gharīb (al-Tirmidhī)" },
    narration: {
      id: "ʿAbd al-Raḥmān bin Samurah رضي الله عنه berkata: “ʿUthmān رضي الله عنه datang kepada Nabi ﷺ membawa 1.000 dinar.” Riwayat menyebut bahwa ia membawanya di dalam lipatan bajunya ketika Jaysh al-ʿUsrah—Pasukan Masa Sulit—sedang dipersiapkan, lalu ia menuangkannya ke pangkuan Nabi ﷺ. ʿAbd al-Raḥmān melanjutkan: “Aku melihat Nabi ﷺ membalik-balikkan dinar itu di pangkuannya sambil bersabda: **‘Tidak ada lagi yang membahayakan ʿUthmān setelah hari ini.’**” Beliau ﷺ mengucapkannya dua kali.",
      en: "ʿAbd al-Raḥmān ibn Samurah رضي الله عنه said: “ʿUthmān رضي الله عنه came to the Prophet ﷺ with 1,000 dinars.” The report adds that he carried them in his garment while the Jaysh al-ʿUsrah—the Army of Distress—was being prepared, and poured them into the Prophet's ﷺ lap. ʿAbd al-Raḥmān continued: “I saw the Prophet ﷺ turning them over in his lap and saying: **‘Nothing ʿUthmān does after today will harm him.’**” He ﷺ said it twice.",
    },
    points: {
      id: [
        "**Perawi:** ʿAbd al-Raḥmān bin Samurah—saksi mata. Ia tidak berkata “dikabarkan kepadaku”, tetapi “aku melihat”.",
        "**Konteks:** persiapan Tabūk, saat perbekalan dan dana pasukan benar-benar kurang.",
        "**Jumlah:** 1.000 dinar, dibawa di lipatan baju dan dituangkan ke pangkuan Nabi ﷺ.",
        "**Riwayat Aḥmad 20630** menambahkan detailnya: beliau ﷺ membalik-balikkannya **dengan tangannya**, dan berulang kali bersabda: “Tidak ada yang membahayakan Ibn ʿAffān setelah hari ini.”",
        "**Derajat:** al-Tirmidhī menilainya **ḥasan gharīb** dari jalur ini—kuat untuk disampaikan, dan kami sebutkan apa adanya.",
      ],
      en: [
        "**Narrator:** ʿAbd al-Raḥmān ibn Samurah—an eyewitness. He does not say “it reached me”, he says “I saw”.",
        "**Context:** the preparation for Tabūk, when the army's provisions and funds were genuinely short.",
        "**Amount:** 1,000 dinars, carried in his garment and poured into the Prophet's ﷺ lap.",
        "**Musnad Aḥmad 20630** supplies the detail: he ﷺ turned them over **with his hand**, repeating: “Nothing will harm Ibn ʿAffān after today.”",
        "**Grading:** al-Tirmidhī graded it **ḥasan gharīb** from this route—strong enough to present, and we say so plainly.",
      ],
    },
    takeaway: {
      id: "Perhatikan apa yang sebenarnya kurang hari itu. Iman pasukan sudah ada, niat sudah ada, keberanian sudah ada. Yang tidak ada hanyalah uang. Harta ʿUthmān membeli satu hal yang tidak bisa dibeli oleh salat dan puasa siapa pun pagi itu—kemampuan untuk berangkat.",
      en: "Notice what was actually missing that day. The army's faith was there, the intention was there, the courage was there. Only the money was not. ʿUthmān's wealth bought the one thing nobody's prayer or fasting could buy that morning—the ability to actually depart.",
    },
  },
  {
    ref: "Ṣaḥīḥ al-Bukhārī 5354 · Ṣaḥīḥ Muslim 1628",
    grade: { id: "Muttafaq ʿalayh", en: "Agreed upon" },
    narration: {
      id: "Saʿd bin Abī Waqqāṣ رضي الله عنه jatuh sakit keras di Makkah pada tahun Haji Wadaʿ, dan ia mengira dirinya akan meninggal. Ia bertanya kepada Rasulullah ﷺ: “Bolehkah aku menyedekahkan dua pertiga hartaku?” Beliau menjawab: **“Tidak.”** “Setengahnya?” Beliau menjawab: **“Tidak.”** “Sepertiga?” Beliau bersabda: **“Sepertiga—dan sepertiga itu sudah banyak.”** Lalu beliau ﷺ menjelaskan alasannya: **“Sesungguhnya engkau meninggalkan ahli warismu dalam keadaan berkecukupan itu lebih baik daripada engkau meninggalkan mereka miskin, meminta-minta kepada manusia.”**",
      en: "Saʿd ibn Abī Waqqāṣ رضي الله عنه fell gravely ill in Makkah during the year of the Farewell Pilgrimage, and thought he was dying. He asked the Messenger of Allah ﷺ: “May I give two-thirds of my wealth in charity?” He said: **“No.”** “Half?” He said: **“No.”** “A third?” He said: **“A third—and a third is a lot.”** Then he ﷺ gave the reason: **“It is better that you leave your heirs wealthy than that you leave them poor, begging from people.”**",
    },
    points: {
      id: [
        "**Konteks:** Haji Wadaʿ di Makkah. Saʿd sedang sakit parah dan menyangka ajalnya dekat—ini keputusan warisan, bukan wacana.",
        "**Tawar-menawarnya:** dua pertiga ditolak, setengah ditolak, sepertiga diizinkan—**dan itu pun disebut “banyak”**.",
        "**Alasannya bukan zuhud:** Rasulullah ﷺ justru menahan sedekahnya demi melindungi keluarga yang ditinggalkan.",
        "**“Meminta-minta kepada manusia”**—inilah yang beliau ﷺ cegah: keluarga yang menjadi beban orang lain.",
        "**Dari sinilah** para ulama menetapkan batas wasiat maksimal sepertiga harta.",
      ],
      en: [
        "**Context:** the Farewell Pilgrimage in Makkah. Saʿd was gravely ill and believed he was dying—this was an estate decision, not a theory.",
        "**The negotiation:** two-thirds refused, half refused, one-third permitted—**and even that was called “a lot”**.",
        "**The reason was not asceticism:** the Prophet ﷺ restrained his charity in order to protect the family he would leave behind.",
        "**“Begging from people”**—that is the outcome he ﷺ was preventing: a family that becomes a burden on others.",
        "**From this hadith** the scholars derive the one-third ceiling on bequests.",
      ],
    },
    takeaway: {
      id: "Perhatikan siapa yang menahan siapa. Seorang sahabat ingin memberikan hampir seluruh hartanya, dan Rasulullah ﷺ melarangnya—dua kali. Di sini harta yang **ditahan** justru lebih bernilai daripada harta yang diberikan. Meninggalkan keluarga yang tidak bergantung pada belas kasihan orang lain adalah kebaikan itu sendiri.",
      en: "Notice who restrained whom. A Companion wanted to give away nearly everything, and the Prophet ﷺ stopped him—twice. Here the wealth **kept** was worth more than the wealth given. Leaving behind a family that depends on nobody's mercy is itself the good deed.",
    },
  },
];

const wealthBurdenEvidence: Evidence[] = [
  {
    ref: "Ṣaḥīḥ al-Bukhārī 1275",
    grade: { id: "Ṣaḥīḥ", en: "Ṣaḥīḥ" },
    narration: {
      id: "ʿAbd al-Raḥmān bin ʿAwf رضي الله عنه sedang berpuasa. Ketika hidangan datang, ia menyebut dua orang yang ia nilai lebih baik darinya: Muṣʿab bin ʿUmayr dan Ḥamzah رضي الله عنهما—keduanya syahid, dan kain kafan mereka begitu pendek sehingga bila kepala ditutup kaki terbuka, bila kaki ditutup kepala terbuka. Kemudian dunia dibentangkan bagi orang-orang yang tersisa. Maka ia berkata: **“Kami khawatir kebaikan-kebaikan kami telah disegerakan untuk kami di dunia ini.”** Lalu ia menangis dan meninggalkan makanannya.",
      en: "ʿAbd al-Raḥmān ibn ʿAwf رضي الله عنه was fasting. When food was brought, he named two men he considered better than himself: Muṣʿab ibn ʿUmayr and Ḥamzah رضي الله عنهما—both martyred, and shrouded in cloth so short that covering the head exposed the feet, and covering the feet exposed the head. Then the world was opened up for those who remained. So he said: **“We fear that our good deeds have been hastened for us in this world.”** Then he wept, and left his food untouched.",
    },
    points: {
      id: [
        "**Perawi & keadaan:** ʿAbd al-Raḥmān bin ʿAwf sendiri, dalam keadaan berpuasa, saat makanan dihidangkan.",
        "**Pembandingnya:** Muṣʿab bin ʿUmayr dan Ḥamzah—dua orang yang ia sebut lebih baik daripada dirinya, dan keduanya wafat tanpa harta.",
        "**Kalimat kuncinya adalah kekhawatiran, bukan kepastian:** “kami khawatir kebaikan kami telah **disegerakan**.” Beliau tidak memvonis dirinya sendiri.",
        "**Reaksinya:** menangis, lalu meninggalkan makanan yang sudah terhidang.",
        "**Derajat:** Ṣaḥīḥ al-Bukhārī 1275—jauh lebih kuat daripada riwayat “masuk surga dengan merangkak” yang sering dikutip.",
      ],
      en: [
        "**Narrator & setting:** ʿAbd al-Raḥmān ibn ʿAwf himself, while fasting, as food was placed before him.",
        "**His comparison:** Muṣʿab ibn ʿUmayr and Ḥamzah—two men he called better than himself, both of whom died owning nothing.",
        "**The key phrase is a fear, not a verdict:** “we fear our good deeds have been **hastened** for us.” He does not pronounce judgement on himself.",
        "**His reaction:** he wept, and left food that was already served.",
        "**Grading:** Ṣaḥīḥ al-Bukhārī 1275—far stronger than the widely-quoted “entering Paradise crawling” report.",
      ],
    },
    takeaway: {
      id: "Perhatikan kata-katanya yang persis: **“kami khawatir”**—bukan “kami tahu”. Inilah yang membuatnya berat. Seorang sahabat sekelas beliau dapat memandang hartanya sendiri lalu bertanya-tanya apakah itu ganjaran yang datang terlalu cepat. Bukan sebuah kesimpulan, melainkan sebuah kegelisahan yang tidak pernah hilang.",
      en: "Notice his exact words: **“we fear”**—not “we know”. That is what makes it heavy. A Companion of his rank could look at his own wealth and wonder whether it was his reward arriving early. Not a conclusion—an unease he never resolved.",
    },
  },
  {
    ref: "Jāmiʿ al-Tirmidhī 2354",
    grade: { id: "Ḥasan ṣaḥīḥ (al-Tirmidhī)", en: "Ḥasan ṣaḥīḥ (al-Tirmidhī)" },
    narration: {
      id: "Dari Abū Hurayrah رضي الله عنه, Rasulullah ﷺ bersabda: **“Orang-orang miskin dari kaum muslimin masuk surga mendahului orang-orang kaya di antara mereka setengah hari—dan itu adalah lima ratus tahun.”** Perhatikan bahwa ukurannya disebutkan langsung di dalam hadis itu sendiri: setengah hari di sisi Allah, lalu diterjemahkan menjadi lima ratus tahun menurut hitungan kita.",
      en: "From Abū Hurayrah رضي الله عنه, the Messenger of Allah ﷺ said: **“The poor Muslims will enter Paradise before the rich among them by half a day—and that is five hundred years.”** Note that the measure is stated inside the hadith itself: half a day with Allah, then converted into five hundred years by our reckoning.",
    },
    points: {
      id: [
        "**Keduanya masuk surga.** Hadis ini tidak mengeluarkan orang kaya—ia hanya menempatkan mereka di antrean yang lebih belakang.",
        "**Ukurannya eksplisit:** “setengah hari” langsung ditafsirkan di dalam hadis sebagai lima ratus tahun.",
        "**Riwayat sejajar** menyebut empat puluh musim gugur bagi kaum fakir Muhājirīn (Ṣaḥīḥ Muslim 2979); para ulama menjelaskannya sebagai kelompok dan tingkatan yang berbeda.",
        "**Penjelasan ulama:** jeda itu adalah waktu perhitungan—semakin banyak yang dimiliki, semakin panjang yang harus dipertanggungjawabkan.",
        "**Derajat:** al-Tirmidhī menilainya **ḥasan ṣaḥīḥ**; diriwayatkan pula oleh Ibn Mājah.",
      ],
      en: [
        "**Both groups enter.** This hadith does not exclude the wealthy—it places them further back in the queue.",
        "**The measure is explicit:** “half a day” is interpreted inside the hadith itself as five hundred years.",
        "**A parallel report** gives forty autumns for the poor Muhājirūn (Ṣaḥīḥ Muslim 2979); scholars explain these as different groups and degrees.",
        "**The scholars' explanation:** the delay is the accounting—the more you owned, the longer the account you must answer for.",
        "**Grading:** al-Tirmidhī graded it **ḥasan ṣaḥīḥ**; also narrated by Ibn Mājah.",
      ],
    },
    takeaway: {
      id: "Tidak ada seorang pun yang dicela di sini. Orang kaya tetap masuk surga. Tetapi mereka menunggu—dan lamanya menunggu itu diukur dari apa yang mereka miliki. Harta tidak merampas surga dari kalian; harta menagih waktu kalian di depan pintunya.",
      en: "Nobody is condemned here. The wealthy still enter. But they wait—and the length of that wait is measured against what they owned. Wealth does not cost you Paradise; it charges you time at the gate.",
    },
  },
];

function EntrepreneurshipTitleSlide({ language }: { language: "id" | "en" }) {
  const isId = language === "id";
  return <div className="mx-auto grid w-full max-w-6xl gap-9 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
    <div className="text-left">
      <p className="text-xs font-bold uppercase tracking-[.28em] text-[#e6bd69]">{isId ? "Kelas Kewirausahaan · IPAI" : "Entrepreneurship Class · IPAI"}</p>
      <h1 className="mt-7 font-serif text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">{isId ? <>Uang, Tujuan,<br />dan Cara<br /><span className="mt-3 block text-3xl italic text-[#ef91b1] sm:text-5xl">Sebuah Startup Lahir</span></> : <>Money, Purpose,<br />and How a<br /><span className="mt-3 block text-3xl italic text-[#ef91b1] sm:text-5xl">Startup Was Born</span></>}</h1>
      <p className="mt-8 max-w-lg text-lg leading-8 text-white/70">{isId ? "Sebelum kita bicara tentang bisnis, kita harus jujur dulu tentang satu hal yang paling sering disalahpahami: harta." : "Before we talk about business, we have to be honest about the one thing most often misunderstood: wealth."}</p>
      <div className="mt-9 flex items-center gap-3 text-sm font-semibold text-[#e6bd69]"><Coins className="h-5 w-5" /> {isId ? "Mulai dari pertanyaan, bukan dari jawaban." : "We start with a question, not an answer."}</div>
      <ChevronDown className="mt-9 h-6 w-6 animate-bounce text-[#e6bd69]" />
    </div>
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl shadow-black/30">
      <Image src="/presentations-sekolah-islam-study-space-v2.png" alt={isId ? "Ruang tenang untuk berpikir tentang harta dan tujuan" : "A quiet space for thinking about wealth and purpose"} fill className="object-cover" priority sizes="(max-width: 1024px) 86vw, 460px" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#101d3b]/70 to-transparent" />
    </div>
  </div>;
}

function OpeningQuestionSlide({ language }: { language: "id" | "en" }) {
  const isId = language === "id";
  return <div className="mx-auto w-full max-w-5xl text-center">
    <p className="text-xs font-bold uppercase tracking-[.28em] text-[#e6bd69]">{isId ? "Pertanyaan pembuka" : "Opening question"}</p>
    <h2 className="mt-7 font-serif text-5xl font-bold leading-[1.08] sm:text-7xl">{isId ? <>Menurut kalian,<br /><span className="italic text-[#ef91b1]">uang itu baik atau buruk?</span></> : <>In your view,<br /><span className="italic text-[#ef91b1]">is money good or bad?</span></>}</h2>
    <p className="mx-auto mt-9 max-w-2xl text-xl leading-9 text-white/70">{isId ? "Jangan jawab dulu. Saya akan bacakan empat riwayat—dua yang membuat kita takut memiliki harta, dua yang memuji harta. Semuanya kuat." : "Do not answer yet. I will read four narrations—two that make us afraid to own wealth, two that praise it. All of them strong."}</p>
    <div className="mx-auto mt-11 flex max-w-3xl items-center gap-5">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#e6bd69]/60" />
      <span className="font-serif text-6xl text-[#e6bd69]">?</span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#e6bd69]/60" />
    </div>
  </div>;
}

function richText(value: string) {
  return value.split("**").map((part, index) => index % 2 === 1 ? <strong key={index} className="font-bold text-white">{part}</strong> : <span key={index}>{part}</span>);
}

function EvidenceSlide({ language, side }: { language: "id" | "en"; side: "good" | "burden" }) {
  const isId = language === "id";
  const isGood = side === "good";
  const items = isGood ? wealthGoodEvidence : wealthBurdenEvidence;
  const Icon = isGood ? Coins : Scale;
  return <div className="mx-auto w-full max-w-6xl">
    <div className="flex items-center justify-center gap-3">
      <span className={`grid h-8 w-8 place-items-center rounded-full ${isGood ? "bg-[#e6bd69]/15 text-[#e6bd69]" : "bg-[#ef91b1]/15 text-[#f3c5d4]"}`}><Icon className="h-4 w-4" /></span>
      <p className="text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isGood ? (isId ? "Sisi 02 · Harta sebagai sarana kebaikan" : "Side 02 · Wealth as a means of good") : (isId ? "Sisi 01 · Harta sebagai beban" : "Side 01 · Wealth as a burden")}</p>
    </div>
    <h2 className="mx-auto mt-3 max-w-4xl text-center font-serif text-2xl font-bold leading-tight sm:text-4xl">
      {isGood ? (isId ? <>Harta membuat kebaikan <span className="italic text-[#ef91b1]">bisa bergerak.</span></> : <>Wealth is what lets good <span className="italic text-[#ef91b1]">actually move.</span></>)
              : (isId ? <>Harta juga <span className="italic text-[#ef91b1]">punya harga di akhirat.</span></> : <>Wealth also <span className="italic text-[#ef91b1]">carries a price in the ākhirah.</span></>)}
    </h2>
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      {items.map((item, index) => <div key={item.ref} className="flex flex-col rounded-3xl border border-white/15 bg-white/[.07] p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3 border-b border-white/12 pb-3">
          <span className="font-serif text-2xl text-[#e6bd69]">0{index + 1}</span>
          <div className="text-right">
            <p className="text-sm font-bold tracking-[.03em] text-[#f3c5d4] sm:text-base">{item.ref}</p>
            <p className="mt-1 text-[.65rem] font-bold uppercase tracking-[.2em] text-white/50">{isId ? item.grade.id : item.grade.en}</p>
          </div>
        </div>
        <p className="mt-3 text-[.85rem] leading-[1.4rem] text-white/75">{richText(isId ? item.narration.id : item.narration.en)}</p>
        {item.points && <ul className="mt-3 space-y-1.5 border-t border-white/12 pt-3">
          {(isId ? item.points.id : item.points.en).map((point) => <li key={point} className="flex gap-2.5 text-[.78rem] leading-[1.45rem] text-white/70">
            <span className="mt-[.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#e6bd69]" />
            <span>{richText(point)}</span>
          </li>)}
        </ul>}
        <p className="mt-3 border-l-2 border-[#e6bd69] pl-4 text-[.8rem] font-bold leading-[1.4rem] text-[#f3c5d4] sm:mt-auto sm:pt-3">{richText(isId ? item.takeaway.id : item.takeaway.en)}</p>
      </div>)}
    </div>
    <p className="mt-5 text-center text-xs leading-5 text-white/50">
      {isGood
        ? (isId ? "Kesimpulan sementara: tanpa harta, sebagian pintu amal memang tertutup rapat." : "Provisional conclusion: without wealth, some doors of good simply stay shut.")
        : (isId ? "Keduanya kuat: Bukhārī 1275 ṣaḥīḥ, dan Tirmidhī 2354 dinilai ḥasan ṣaḥīḥ. Dua riwayat populer lain di tema ini—ʿAbd al-Raḥmān masuk surga dengan merangkak (al-Ṭabarānī) dan doa agar hidup sebagai miskīn (Tirmidhī 2352)—lemah atau diperselisihkan, jadi tidak kami pakai." : "Both are strong: Bukhārī 1275 is ṣaḥīḥ, and Tirmidhī 2354 was graded ḥasan ṣaḥīḥ. Two other popular reports on this theme—ʿAbd al-Raḥmān entering Paradise crawling (al-Ṭabarānī) and the duʿāʾ to live as a miskīn (Tirmidhī 2352)—are weak or disputed, so we do not use them.")}
    </p>
  </div>;
}

function AbdurrahmanSlide({ language }: { language: "id" | "en" }) {
  const isId = language === "id";
  const credentials = isId
    ? [["ʿAsharah Mubasharah", "Termasuk sepuluh orang yang dijamin surga ketika masih hidup dan masih bisa salah."], ["Imam di depan Nabi ﷺ", "Di Tabūk ia mengimami salat Subuh—dan Rasulullah ﷺ salat di belakangnya. (Ṣaḥīḥ Muslim)"], ["Salah satu terkaya", "Datang ke Madinah tanpa apa-apa, menolak pemberian, hanya minta ditunjukkan pasar."]]
    : [["ʿAsharah Mubasharah", "One of ten promised Paradise while still alive and still able to err."], ["Imām before the Prophet ﷺ", "At Tabūk he led the Fajr prayer—and the Messenger of Allah ﷺ prayed behind him. (Ṣaḥīḥ Muslim)"], ["Among the wealthiest", "Arrived in Madinah with nothing, refused charity, and asked only to be shown the marketplace."]];
  const chain = isId
    ? [["Harta warisan", "± 2,56 juta dinar emas"], ["Berat emas", "1 dinar ≈ 4,25 gram → ± 10,9 ton"], ["Nilai hari ini", "≈ USD 980 juta · ± Rp 15,7 triliun"]]
    : [["Estate at death", "± 2.56 million gold dinars"], ["Weight in gold", "1 dinar ≈ 4.25 g → ± 10.9 tonnes"], ["Value today", "≈ USD 980 million · ± IDR 15.7 trillion"]];
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isId ? "Studi kasus · berhenti di satu orang" : "Case study · pause on one man"}</p>
    <h2 className="mx-auto mt-3 max-w-5xl text-center font-serif text-3xl font-bold leading-tight sm:text-5xl">{isId ? <>ʿAbd al-Raḥmān bin ʿAwf <span className="italic text-[#ef91b1]">takut pada hartanya sendiri.</span></> : <>ʿAbd al-Raḥmān ibn ʿAwf <span className="italic text-[#ef91b1]">feared his own wealth.</span></>}</h2>
    <div className="mt-7 grid gap-3 md:grid-cols-3">
      {credentials.map(([title, detail], index) => <div key={title} className="rounded-2xl border border-white/15 bg-white/[.07] p-5">
        <p className="font-serif text-2xl text-[#e6bd69]">0{index + 1}</p>
        <h3 className="mt-3 text-lg font-bold">{title}</h3>
        <p className="mt-2 text-[.82rem] leading-6 text-white/65">{detail}</p>
      </div>)}
    </div>
    <div className="mt-5 rounded-2xl border border-[#e6bd69]/35 bg-[#e6bd69]/[.08] p-5">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#e6bd69]">{isId ? "Seberapa kaya, dalam ukuran hari ini?" : "How wealthy, in today's terms?"}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {chain.map(([label, value], index) => <div key={label} className="flex items-baseline gap-3">
          <span className="font-serif text-xl text-[#e6bd69]/60">{index + 1}</span>
          <div><p className="text-[.68rem] font-bold uppercase tracking-[.16em] text-white/50">{label}</p><p className="mt-1 font-serif text-lg font-bold text-[#f3c5d4]">{value}</p></div>
        </div>)}
      </div>
      <p className="mt-4 text-[.68rem] leading-5 text-white/45">{isId ? "Perkiraan, bukan neraca. Dihitung dari riwayat bahwa tiap istri menerima 80.000 sebagai bagian dari seperdelapan warisan, dengan asumsi emas ≈ USD 90/gram dan kurs Rp 16.000. Riwayat tentang angka ini berbeda-beda, jadi perlakukan ini sebagai gambaran skala—bukan angka pasti." : "An estimate, not a ledger. Derived from the report that each wife received 80,000 as her portion of the one-eighth share, assuming gold ≈ USD 90/gram and IDR 16,000 to the dollar. Reports on these figures differ, so treat this as an order of magnitude—not a precise number."}</p>
    </div>
    <div className="mt-5 rounded-2xl border border-white/15 bg-white/[.05] p-5 text-center">
      <p className="mx-auto max-w-4xl text-base leading-7 text-white/85">{isId ? "Orang ini dijamin surga. Rasulullah ﷺ pernah salat di belakangnya. Kekayaannya setara hampir satu miliar dolar hari ini—dan justru itulah yang membuatnya menangis dan meninggalkan makanannya." : "This man was guaranteed Paradise. The Messenger of Allah ﷺ once prayed behind him. His wealth was worth close to a billion dollars today—and that is precisely what made him weep and leave his food."}</p>
      <p className="mt-4 font-serif text-2xl font-bold text-[#e6bd69] sm:text-3xl">{isId ? "Kalau beliau saja begitu—bagaimana dengan kita?" : "If that was him—then where does that leave us?"}</p>
    </div>
  </div>;
}

function ConfusionSlide({ language }: { language: "id" | "en" }) {
  const isId = language === "id";
  const left = isId ? ["ʿUthmān membiayai pasukan—dan dijamin aman selamanya.", "Nabi ﷺ melarang Saʿd menyedekahkan lebih dari sepertiga hartanya."] : ["ʿUthmān funded an army—and was guaranteed safety forever.", "The Prophet ﷺ forbade Saʿd from giving away more than a third."];
  const right = isId ? ["ʿAbd al-Raḥmān khawatir kebaikannya telah disegerakan di dunia.", "Kaum miskin masuk surga lima ratus tahun mendahului orang kaya."] : ["ʿAbd al-Raḥmān feared his good deeds had been hastened into this world.", "The poor enter Paradise five hundred years before the rich."];
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isId ? "Jadi—yang mana?" : "So—which is it?"}</p>
    <h2 className="mx-auto mt-4 max-w-4xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">{isId ? <>Semua riwayat ini benar. <span className="italic text-[#ef91b1]">Dan semuanya bertabrakan.</span></> : <>All of these are authentic. <span className="italic text-[#ef91b1]">And they collide.</span></>}</h2>
    <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
      <div className="rounded-3xl border border-[#e6bd69]/35 bg-[#e6bd69]/[.08] p-7">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-[#e6bd69]">{isId ? "Kejarlah harta" : "Chase wealth"}</p>
        <ul className="mt-6 space-y-4">{left.map((item) => <li key={item} className="flex gap-3 text-base leading-7 text-white/80"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e6bd69]" />{item}</li>)}</ul>
      </div>
      <div className="grid place-items-center px-2"><span className="font-serif text-7xl text-white/30">?</span></div>
      <div className="rounded-3xl border border-[#ef91b1]/35 bg-[#ef91b1]/[.08] p-7">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-[#f3c5d4]">{isId ? "Jauhilah harta" : "Avoid wealth"}</p>
        <ul className="mt-6 space-y-4">{right.map((item) => <li key={item} className="flex gap-3 text-base leading-7 text-white/80"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef91b1]" />{item}</li>)}</ul>
      </div>
    </div>
    <p className="mt-9 text-center text-xl font-bold leading-9 text-[#f3c5d4]">{isId ? "Kalau dalilnya sama-sama kuat, berarti pertanyaannya yang salah." : "If both sides are equally strong, then the question itself is wrong."}</p>
  </div>;
}

function PhilosophySlide({ language }: { language: "id" | "en" }) {
  const isId = language === "id";
  const rows = isId
    ? [["Uang sebagai tujuan", "Angkanya tidak pernah cukup. Kalian mencapai target, lalu targetnya bergeser. Ia menuntut waktu, perhatian, dan akhirnya hisab—tanpa pernah memberi tahu untuk apa semua itu."], ["Uang sebagai sesuatu yang dihindari", "Niat baik yang berhenti di kepala. Kalian bisa melihat apa yang rusak di masyarakat, tetapi tidak punya kemampuan untuk menyentuhnya."], ["Uang sebagai alat", "Alat dinilai dari apa yang dibangunnya. ʿUthmān tidak dipuji karena memiliki 1.000 dinar—beliau dipuji karena 1.000 dinar itu memberangkatkan pasukan."]]
    : [["Money as the goal", "The number is never enough. You hit the target and the target moves. It demands your time, your attention, and finally your reckoning—without ever telling you what it was all for."], ["Money as something to avoid", "A good intention that stops inside your head. You can see what is broken in society, but you have no capacity to touch it."], ["Money as a tool", "A tool is judged by what it builds. ʿUthmān was not praised for owning 1,000 dinars—he was praised because those 1,000 dinars moved an army."]];
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isId ? "Cara saya melihatnya" : "How I see it"}</p>
    <h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">{isId ? <>Uang itu alat. <span className="italic text-[#ef91b1]">Bukan tujuan hidup.</span></> : <>Money is a tool. <span className="italic text-[#ef91b1]">Not a life goal.</span></>}</h2>
    <p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-white/65">{isId ? "Tidak ada orang yang menggantung palu di dinding lalu memujanya. Palu hanya bernilai ketika ada sesuatu yang sedang dibangun. Uang bekerja dengan cara yang sama." : "Nobody hangs a hammer on the wall and admires it. A hammer only means anything when something is being built. Money works the same way."}</p>
    <div className="mt-9 divide-y divide-white/15 border-y border-white/15">
      {rows.map(([title, detail]) => <div key={title} className="grid gap-3 py-6 sm:grid-cols-[16rem_1fr]">
        <h3 className="font-serif text-2xl font-bold text-[#e6bd69]">{title}</h3>
        <p className="text-base leading-7 text-white/70">{detail}</p>
      </div>)}
    </div>
    <p className="mt-8 text-center text-xl font-bold text-[#f3c5d4]">{isId ? "Maka pertanyaannya bukan “berapa banyak yang saya inginkan?” tetapi “alat ini saya pegang untuk apa?”" : "So the question is not “how much do I want?” but “what am I holding this tool for?”"}</p>
  </div>;
}

function PurposeBridgeSlide({ language }: { language: "id" | "en" }) {
  const isId = language === "id";
  return <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
    <div>
      <p className="text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isId ? "Dari filosofi ke keputusan" : "From philosophy to a decision"}</p>
      <h2 className="mt-5 font-serif text-4xl font-bold leading-tight sm:text-6xl">{isId ? <>Lalu saya bertanya:<br /><span className="italic text-[#ef91b1]">apa yang harus saya kerjakan—yang juga membutuhkan uang?</span></> : <>So I asked myself:<br /><span className="italic text-[#ef91b1]">what should I do that also needs money?</span></>}</h2>
      <p className="mt-7 max-w-xl text-lg leading-8 text-white/70">{isId ? "Bukan “apa yang paling menguntungkan”, dan bukan pula “apa yang paling mulia”. Saya mencari pertemuan keduanya: pekerjaan yang memang layak dikerjakan—dan yang tidak bisa diselesaikan tanpa uang." : "Not “what is most profitable”, and not “what is most noble” either. I was looking for where the two meet: work that genuinely deserves doing—and that cannot be done without money."}</p>
      <p className="mt-8 border-l-2 border-[#e6bd69] pl-5 text-base font-bold leading-7 text-[#f3c5d4]">{isId ? "Salah satu kerusakan terbesar di masyarakat Muslim hari ini terjadi di tempat yang paling awal: cara orang bertemu dan menikah." : "One of the deepest fractures in Muslim society today happens at the very first step: how people meet and marry."}</p>
    </div>
    <div className="rounded-[2rem] border border-white/15 bg-white/[.07] p-8">
      <p className="text-sm font-bold uppercase tracking-[.18em] text-[#e6bd69]">{isId ? "Tiga ujian untuk sebuah ide" : "Three tests for an idea"}</p>
      <div className="mt-7 space-y-6">
        {(isId
          ? [["Apakah ini benar-benar rusak?", "Bukan ketidaknyamanan kecil—kerusakan yang bisa diukur dan dirasakan orang."], ["Apakah nilai saya bertahan di dalamnya?", "Kalau solusinya menuntut saya melanggar prinsip, itu bukan pintu saya."], ["Apakah memperbaikinya benar-benar butuh uang?", "Sebagian masalah cukup dengan nasihat dan waktu. Sebagian butuh tim, verifikasi, operasional, dan modal—dan itulah yang menjadi usaha."]]
          : [["Is it genuinely broken?", "Not a small inconvenience—damage you can measure and people can feel."], ["Do my values survive inside it?", "If the fix requires me to break a principle, it is not my door."], ["Does fixing it actually require money?", "Some problems need advice and time. Some need a team, verification, operations, and capital—and those are the ones that become a business."]]
        ).map(([q, a], index) => <div key={q}>
          <p className="font-serif text-2xl font-bold text-[#e6bd69]">0{index + 1} · {q}</p>
          <p className="mt-2 text-sm leading-6 text-white/65">{a}</p>
        </div>)}
      </div>
    </div>
  </div>;
}

function RouteComparisonSlide({ language }: { language: "id" | "en" }) {
  const isId = language === "id";
  const routes = isId
    ? [["Aplikasi kencan", "Cepat, luas, mudah dimulai.", "Niat tidak jelas, verifikasi lemah, kedekatan tumbuh sebelum komitmen."], ["Referensi keluarga", "Kepercayaan dan niat baik sejak awal.", "Kandidat sangat sedikit; menolak terasa canggung, menerima terasa dipaksa."], ["Ustaz & tokoh komunitas", "Nilai sejalan dan dipercaya.", "Waktu terbatas, tidak ada pool terverifikasi, tidak ada sistem tindak lanjut."], ["Bertemu alami", "Terasa spontan dan tidak dibuat-buat.", "Bergantung pada kebetulan; latar belakang dan kesiapan tidak pernah diuji."]]
    : [["Dating apps", "Fast, wide, easy to start.", "Unclear intent, weak verification, attachment grows before commitment."], ["Family referrals", "Trust and good intention from day one.", "Tiny candidate pool; saying no is awkward, saying yes feels forced."], ["Ustaz & community leaders", "Aligned values and real trust.", "Limited time, no verified pool, no system for follow-up."], ["Meeting naturally", "Feels spontaneous and unforced.", "Depends on chance; background and readiness are never tested."]];
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isId ? "Lanskap kompetitif" : "The competitive landscape"}</p>
    <h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">{isId ? <>Empat cara yang sudah ada—<span className="italic text-[#ef91b1]">dan celah di keempatnya.</span></> : <>Four existing routes—<span className="italic text-[#ef91b1]">and the gap in all four.</span></>}</h2>
    <div className="mt-9 overflow-hidden rounded-3xl border border-white/15">
      <div className="hidden bg-white/[.09] px-6 py-4 text-xs font-bold uppercase tracking-[.18em] text-[#e6bd69] sm:grid sm:grid-cols-[13rem_1fr_1.25fr] sm:gap-5">
        <span>{isId ? "Jalur" : "Route"}</span><span>{isId ? "Yang dijanjikan" : "What it promises"}</span><span>{isId ? "Yang hilang" : "What is missing"}</span>
      </div>
      <div className="divide-y divide-white/12">
        {routes.map(([name, promise, gap]) => <div key={name} className="grid gap-2 bg-white/[.04] px-6 py-5 sm:grid-cols-[13rem_1fr_1.25fr] sm:gap-5">
          <h3 className="font-bold text-[#f3c5d4]">{name}</h3>
          <p className="text-sm leading-6 text-white/55">{promise}</p>
          <p className="text-sm leading-6 text-white/80">{gap}</p>
        </div>)}
      </div>
    </div>
    <p className="mt-8 text-center text-lg font-bold text-[#f3c5d4]">{isId ? "Tidak ada satu pun yang menggabungkan akses, verifikasi, adab, dan keluarga dalam satu proses. Di situlah ruang usahanya." : "Not one of them combines access, verification, adab, and family in a single process. That gap is the business."}</p>
  </div>;
}

function BusinessModelSlide({ language }: { language: "id" | "en" }) {
  const isId = language === "id";
  const lines = isId
    ? [["Onboarding & profil", "Rp 1.250.000", "Wawancara mendalam, penyusunan profil, penentuan kriteria."], ["Asesmen psikologi", "Rp 1.250.000", "Kesiapan menikah diuji, bukan diklaim sendiri."], ["Background check", "Rp 2.750.000", "Biaya terbesar per klien—dan alasan utama orang percaya."], ["Paket pendampingan", "Rp 1,5jt – 6jt", "Pearl, Ruby, Diamond: kedalaman pendampingan dan sourcing aktif."], ["Pertemuan & keluarga", "Rp 300rb – 4,5jt", "Pertemuan online sampai pertemuan keluarga yang difasilitasi."]]
    : [["Onboarding & profile", "Rp 1,250,000", "Deep interview, profile construction, criteria definition."], ["Psychological assessment", "Rp 1,250,000", "Marriage readiness is tested, not self-declared."], ["Background check", "Rp 2,750,000", "Our largest cost per client—and the main reason people trust us."], ["Guidance packages", "Rp 1.5m – 6m", "Pearl, Ruby, Diamond: depth of guidance and active sourcing."], ["Meetings & family", "Rp 300k – 4.5m", "From online introductions to facilitated family gatherings."]];
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isId ? "Model bisnis" : "The business model"}</p>
    <h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-5xl">{isId ? <>Kami tidak menjual jodoh. <span className="italic text-[#ef91b1]">Kami menjual proses yang mahal untuk dijalankan.</span></> : <>We do not sell a match. <span className="italic text-[#ef91b1]">We sell a process that is expensive to run.</span></>}</h2>
    <div className="mt-8 divide-y divide-white/15 border-y border-white/15">
      {lines.map(([name, price, why]) => <div key={name} className="grid gap-2 py-4 sm:grid-cols-[14rem_9rem_1fr] sm:items-baseline sm:gap-5">
        <h3 className="font-bold text-[#f3c5d4]">{name}</h3>
        <p className="font-serif text-xl text-[#e6bd69]">{price}</p>
        <p className="text-sm leading-6 text-white/65">{why}</p>
      </div>)}
    </div>
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {(isId
        ? [["Kenapa berlapis?", "Klien membayar sesuai kedalaman dukungan yang benar-benar mereka butuhkan—bukan satu harga untuk semua."], ["Kenapa mahal?", "Biayanya manusia: waktu wawancara, verifikasi, fasilitasi. Ini bukan software dengan biaya marginal nol."], ["Kenapa tidak iklan?", "Kanal kami adalah rujukan ustaz dan KUA. Kepercayaan tidak bisa dibeli dengan iklan Facebook."]]
        : [["Why tiered?", "Clients pay for the depth of support they actually need—not one price for everyone."], ["Why expensive?", "The cost is human: interview hours, verification, facilitation. This is not software with zero marginal cost."], ["Why no ads?", "Our channel is ustaz and KUA referrals. Trust cannot be bought with Facebook ads."]]
      ).map(([title, detail]) => <div key={title} className="rounded-3xl border border-white/15 bg-white/[.07] p-6">
        <h3 className="font-serif text-xl font-bold text-[#e6bd69]">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-white/65">{detail}</p>
      </div>)}
    </div>
  </div>;
}

function ColdStartSlide({ language }: { language: "id" | "en" }) {
  const isId = language === "id";
  return <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
    <div>
      <p className="text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isId ? "Masalah tersulit" : "The hardest problem"}</p>
      <h2 className="mt-5 font-serif text-4xl font-bold leading-tight sm:text-6xl">{isId ? <>Klien pertama membayar untuk <span className="italic text-[#ef91b1]">pool yang belum ada.</span></> : <>The first client pays for <span className="italic text-[#ef91b1]">a pool that does not exist yet.</span></>}</h2>
      <p className="mt-7 max-w-xl text-lg leading-8 text-white/70">{isId ? "Di Jodohmu, klien yang membayar itulah yang membentuk pool. Artinya nilai layanan kami naik seiring jumlah klien—tetapi klien pertama menerima nilai paling kecil." : "At Jodohmu, the paying clients are the pool. That means our value rises with every client we add—but the earliest clients receive the least of it."}</p>
      <p className="mt-7 border-l-2 border-[#e6bd69] pl-5 text-base font-bold leading-7 text-[#f3c5d4]">{isId ? "Ini masalah klasik marketplace: sisi penawaran dan permintaan adalah orang yang sama." : "This is the classic marketplace problem: supply and demand are the same person."}</p>
    </div>
    <div className="rounded-[2rem] border border-white/15 bg-white/[.07] p-8">
      <p className="text-sm font-bold uppercase tracking-[.18em] text-[#e6bd69]">{isId ? "Cara kami menanganinya" : "How we handle it"}</p>
      <div className="mt-7 space-y-6">
        {(isId
          ? [["Jangan pernah melebih-lebihkan pool", "Tidak menjanjikan jumlah profil yang tidak bisa kami penuhi. Sekali berbohong soal ini, kepercayaan habis."], ["Jendela layanan dimulai saat profil dikirim", "Bukan saat pembayaran. Klien tidak kehilangan waktu karena pool kami masih tumbuh."], ["Masuk lewat perantara tepercaya", "Ustaz dan KUA membawa kepercayaan yang tidak bisa kami bangun sendiri dari nol."]]
          : [["Never overstate the pool", "We do not promise profile volume we cannot deliver. Lie about this once and the trust is gone."], ["The service window starts when profiles are sent", "Not at payment. A client does not lose time because our pool is still growing."], ["Enter through trusted intermediaries", "Ustaz and KUA carry a trust we could never manufacture from zero."]]
        ).map(([title, detail], index) => <div key={title}>
          <p className="font-serif text-xl font-bold text-[#e6bd69]">0{index + 1} · {title}</p>
          <p className="mt-2 text-sm leading-6 text-white/65">{detail}</p>
        </div>)}
      </div>
    </div>
  </div>;
}

function TractionSlide({ language }: { language: "id" | "en" }) {
  const isId = language === "id";
  const built = isId
    ? [["Produk & operasional", "Paket, alur onboarding, standar verifikasi, dan pipeline lead sudah berjalan."], ["Kanal distribusi", "Jalur rujukan ustaz/KUA dan kehadiran masjid, bukan iklan berbayar."], ["Kebijakan yang tidak ditawar", "Ruby minimum untuk klien internasional; background check sebelum ta'aruf; tanpa pembayaran, tanpa profil."]]
    : [["Product & operations", "Packages, onboarding flow, verification standards, and lead pipeline are running."], ["Distribution channel", "Ustaz/KUA referral routes and mosque presence—not paid advertising."], ["Non-negotiable policies", "Ruby minimum for international clients; background check before any ta'aruf; no payment, no profiles."]];
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isId ? "Di mana kami sekarang" : "Where we are now"}</p>
    <h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">{isId ? <>Kami masih pra-pendapatan. <span className="italic text-[#ef91b1]">Dan saya akan jujur soal itu.</span></> : <>We are still pre-revenue. <span className="italic text-[#ef91b1]">And I will be honest about that.</span></>}</h2>
    <p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-white/65">{isId ? "Belum ada perjodohan yang selesai. Pool masih dibangun. Kalau saya berdiri di sini dan menyebut angka besar, saya sedang melakukan persis hal yang membuat industri ini tidak dipercaya." : "There are no completed matches yet. The pool is still being built. If I stood here and quoted big numbers, I would be doing exactly what makes this industry untrustworthy."}</p>
    <div className="mt-9 grid gap-4 md:grid-cols-3">
      {built.map(([title, detail], index) => <div key={title} className="rounded-3xl border border-white/15 bg-white/[.07] p-6">
        <p className="font-serif text-3xl text-[#e6bd69]">0{index + 1}</p>
        <h3 className="mt-4 text-lg font-bold">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-white/65">{detail}</p>
      </div>)}
    </div>
    <p className="mt-8 text-center text-lg font-bold text-[#f3c5d4]">{isId ? "Yang sudah terbukti bukan pendapatannya—melainkan bahwa masalahnya nyata dan orang bersedia membayar untuk proses yang benar." : "What is proven is not the revenue—it is that the problem is real and people are willing to pay for a process done properly."}</p>
  </div>;
}

function LessonsSlide({ language }: { language: "id" | "en" }) {
  const isId = language === "id";
  const lessons = isId
    ? [["Kepercayaan adalah produknya", "Bukan algoritma pencocokan. Orang membayar karena percaya pada verifikasi dan adab kami—teknologi hanya pendukung."], ["Pendapatan tidak linier", "Bisnis rujukan datang bergelombang. Merencanakan biaya seolah pendapatan stabil adalah cara tercepat untuk mati."], ["Tunda pengeluaran besar", "Tidak ada sewa kantor sampai klien yang membayar memintanya. Tidak ada perekrutan sebelum pendapatan membenarkannya."], ["Menolak klien adalah strategi", "Kami menolak paket Pearl untuk klien internasional walaupun mereka mendesak. Kasus yang salah merusak reputasi lebih mahal dari nilai transaksinya."]]
    : [["Trust is the product", "Not a matching algorithm. People pay because they believe our verification and our adab—technology is only support."], ["Revenue is not linear", "Referral businesses arrive in waves. Planning your costs as if income were steady is the fastest way to die."], ["Delay the big spending", "No office lease until paying clients ask for one. No hiring before revenue justifies it."], ["Refusing clients is a strategy", "We deny Pearl to international clients even when they push. A wrong-fit case costs more in reputation than it earns in revenue."]];
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isId ? "Yang saya pelajari" : "What I have learned"}</p>
    <h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-4xl font-bold leading-tight sm:text-6xl">{isId ? <>Empat pelajaran yang <span className="italic text-[#ef91b1]">tidak diajarkan di buku.</span></> : <>Four lessons that <span className="italic text-[#ef91b1]">the textbooks do not teach.</span></>}</h2>
    <div className="mt-9 grid gap-4 sm:grid-cols-2">
      {lessons.map(([title, detail], index) => <div key={title} className="flex gap-5 rounded-3xl border border-white/15 bg-white/[.07] p-6">
        <span className="font-serif text-3xl text-[#e6bd69]">0{index + 1}</span>
        <div><h3 className="text-xl font-bold">{title}</h3><p className="mt-2 leading-7 text-white/65">{detail}</p></div>
      </div>)}
    </div>
  </div>;
}

function EntrepreneurshipCloseSlide({ language }: { language: "id" | "en" }) {
  const isId = language === "id";
  return <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/15 text-center shadow-2xl shadow-black/30">
    <Image src="/presentations-sekolah-islam-mosque-courtyard-v2.png" alt={isId ? "Halaman masjid yang tenang di pagi hari" : "A quiet mosque courtyard in the morning"} fill className="object-cover" sizes="(max-width: 1024px) 95vw, 1152px" />
    <div className="relative flex min-h-[500px] items-center bg-[linear-gradient(90deg,rgba(16,29,59,.96)_0%,rgba(16,29,59,.82)_46%,rgba(16,29,59,.20)_100%)] p-8 sm:min-h-[540px] sm:p-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[.28em] text-[#e6bd69]">{isId ? "Penutup" : "Closing"}</p>
        <h2 className="mt-7 font-serif text-5xl font-bold leading-tight sm:text-7xl">{isId ? <>Jangan tanya berapa yang akan kalian hasilkan. <span className="italic text-[#ef91b1]">Tanyakan apa yang akan dikalikan.</span></> : <>Do not ask how much you will earn. <span className="italic text-[#ef91b1]">Ask what it will multiply.</span></>}</h2>
        <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-white/85">{isId ? "ʿUthmān punya harta dan punya tujuan, lalu keduanya bertemu di Tabūk. Yang membedakan bukan jumlahnya—melainkan untuk apa." : "ʿUthmān had wealth and he had purpose, and the two met at Tabūk. The difference was never the amount—it was what it was for."}</p>
        <div className="mx-auto mt-10 h-1.5 w-24 rounded-full bg-[#e6bd69]" />
        <p className="mt-9 text-2xl font-bold text-[#e6bd69] sm:text-3xl">{isId ? "Cari masalah yang layak dikalikan. Lalu bangun dengan jujur." : "Find a problem worth multiplying. Then build it honestly."}</p>
        <Link href="/presentations" className="mt-12 inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-bold text-white/90 transition hover:bg-white/10"><ArrowLeft className="h-4 w-4" /> {isId ? "Lihat semua presentasi" : "View all presentations"}</Link>
      </div>
    </div>
  </div>;
}

function SalesMethodSlide({ language }: { language: "id" | "en" }) {
  const isId = language === "id";
  const funnel = isId
    ? [["Rujukan tepercaya", "Ustaz, KUA, dan klien lama. Perkenalan datang bersama kepercayaan yang sudah jadi—bukan dari orang asing."], ["Percakapan, bukan penawaran", "WhatsApp dibalas manusia. Kami bertanya tentang keadaan mereka sebelum menyebut satu pun harga."], ["Diagnosis dulu", "Kesiapan, kriteria, dan situasi keluarga digali. Baru setelah itu paket yang cocok muncul dengan sendirinya."], ["Harga sesuai kebutuhan", "Klien memilih kedalaman dukungan. Kami tidak menaikkan paket yang tidak mereka butuhkan."], ["Berani menolak", "Kalau tidak cocok, kami katakan tidak cocok. Satu klien yang salah lebih mahal daripada kehilangan satu penjualan."]]
    : [["Trusted referral", "Ustaz, KUA, and past clients. The introduction arrives with trust already attached—not from a stranger."], ["A conversation, not a pitch", "A human answers the WhatsApp. We ask about their situation before naming a single price."], ["Diagnose first", "Readiness, criteria, and family situation are explored. Only then does the right package become obvious."], ["Price the need", "The client chooses the depth of support. We do not upsell a tier they do not need."], ["Willing to refuse", "If it is not a fit, we say so. One wrong client costs more than one lost sale."]];
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isId ? "Cara kami menjual" : "How we sell"}</p>
    <h2 className="mx-auto mt-4 max-w-5xl text-center font-serif text-3xl font-bold leading-tight sm:text-5xl">{isId ? <>Kami tidak mengejar pelanggan. <span className="italic text-[#ef91b1]">Kami dibawa kepada mereka.</span></> : <>We do not chase customers. <span className="italic text-[#ef91b1]">We are carried to them.</span></>}</h2>
    <p className="mx-auto mt-4 max-w-3xl text-center text-base leading-7 text-white/65">{isId ? "Di produk yang menyentuh kehormatan keluarga, iklan tidak bekerja. Yang bekerja adalah kepercayaan yang dipinjamkan oleh orang yang sudah dipercaya." : "In a product that touches family honour, advertising does not work. What works is trust lent to you by someone already trusted."}</p>
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {funnel.map(([title, detail], index) => <div key={title} className="rounded-2xl border border-white/15 bg-white/[.07] p-5">
        <p className="font-serif text-2xl text-[#e6bd69]">0{index + 1}</p>
        <h3 className="mt-3 text-base font-bold leading-6">{title}</h3>
        <p className="mt-2 text-[.8rem] leading-6 text-white/65">{detail}</p>
      </div>)}
    </div>
    <div className="mt-7 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-[#ef91b1]/35 bg-[#ef91b1]/[.08] p-6">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-[#f3c5d4]">{isId ? "Yang kami hindari" : "What we avoid"}</p>
        <p className="mt-3 text-sm leading-6 text-white/75">{isId ? "Iklan Facebook, outreach dingin, penemuan lewat aplikasi, dan janji jumlah profil yang tidak bisa kami penuhi. Semua itu murah di awal dan mahal di akhir." : "Facebook ads, cold outreach, app-based discovery, and promising profile volume we cannot deliver. All of it is cheap at the start and expensive at the end."}</p>
      </div>
      <div className="rounded-2xl border border-[#e6bd69]/35 bg-[#e6bd69]/[.08] p-6">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-[#e6bd69]">{isId ? "Pelajaran untuk kalian" : "The lesson for you"}</p>
        <p className="mt-3 text-sm leading-6 text-white/75">{isId ? "Semakin sensitif produkmu, semakin pendek jalur kepercayaan yang dibutuhkan. Cari siapa yang sudah dipercaya oleh pasarmu—lalu layani mereka, jangan beli mereka." : "The more sensitive your product, the shorter the trust path it needs. Find who your market already trusts—then serve them, do not buy them."}</p>
      </div>
    </div>
  </div>;
}

type ExpandableItem = { label: Bilingual; teaser: Bilingual; heading: Bilingual; body: Bilingual; bullets: { id: string[]; en: string[] } };

const routeItems: ExpandableItem[] = [
  {
    label: { id: "Aplikasi kencan", en: "Dating apps" },
    teaser: { id: "Cepat, luas, mudah dimulai.", en: "Fast, wide, easy to start." },
    heading: { id: "Banyak match, sedikit arah menuju nikah.", en: "Many matches, little direction towards marriage." },
    body: {
      id: "Aplikasi kencan menyelesaikan masalah akses—dan hanya itu. Model bisnisnya menuntut kalian tetap berada di dalam aplikasi, bukan keluar dari aplikasi karena sudah menikah. Insentifnya berlawanan dengan tujuan penggunanya.",
      en: "Dating apps solve the access problem—and only that. Their business model requires you to stay inside the app, not to leave it because you got married. The incentives run against the user's own goal.",
    },
    bullets: {
      id: ["Niat tidak pernah diverifikasi: orang yang ingin menikah dan orang yang hanya ingin diperhatikan berada di kolam yang sama.", "Verifikasi identitas dangkal; latar belakang, penghasilan, dan status pernikahan tidak pernah diperiksa.", "Swipe tanpa henti membuat manusia terasa seperti pilihan yang bisa dibuang.", "Kedekatan emosional tumbuh lewat chat berminggu-minggu sebelum ada komitmen apa pun.", "Keluarga baru muncul di akhir—ketika masalah sudah terjadi."],
      en: ["Intent is never verified: someone seeking marriage and someone seeking attention sit in the same pool.", "Identity checks are shallow; background, income, and marital status are never examined.", "Endless swiping makes human beings feel like disposable options.", "Emotional closeness grows over weeks of chat before any commitment exists.", "Family appears only at the end—once a problem has already happened."],
    },
  },
  {
    label: { id: "Referensi keluarga", en: "Family referrals" },
    teaser: { id: "Kepercayaan dan niat baik sejak hari pertama.", en: "Trust and good intention from day one." },
    heading: { id: "Aman dan tepercaya—tetapi sangat terbatas.", en: "Safe and trusted—but severely limited." },
    body: {
      id: "Jalur ini punya kualitas yang tidak dimiliki aplikasi mana pun: orang yang memperkenalkan menanggung reputasinya sendiri. Masalahnya bukan kepercayaan—masalahnya adalah skala dan kejujuran saat menolak.",
      en: "This route has a quality no app can buy: the person introducing you is staking their own reputation. The problem is not trust—it is scale, and the honesty of saying no.",
    },
    bullets: {
      id: ["Jumlah kandidat biasanya bisa dihitung dengan jari.", "Kecocokan nilai, komunikasi, dan kesiapan hampir tidak pernah dinilai secara terstruktur.", "Menolak terasa seperti menghina keluarga yang memperkenalkan.", "Menerima bisa terjadi karena tekanan sosial, bukan karena keyakinan.", "Kalau gagal, hubungan antar keluarga ikut menanggung akibatnya."],
      en: ["The candidate pool can usually be counted on one hand.", "Values, communication, and readiness are almost never assessed in a structured way.", "Saying no feels like insulting the family who made the introduction.", "Saying yes can happen from social pressure rather than conviction.", "If it fails, the relationship between the two families carries the damage."],
    },
  },
  {
    label: { id: "Ustaz & tokoh komunitas", en: "Ustaz & community leaders" },
    teaser: { id: "Nilai yang sejalan dan kepercayaan nyata.", en: "Aligned values and real trust." },
    heading: { id: "Dipercaya—tetapi bukan sebuah sistem.", en: "Trusted—but not a system." },
    body: {
      id: "Ini adalah jalur dengan kepercayaan tertinggi di masyarakat kita, dan justru karena itu ia menjadi kanal distribusi kami. Tetapi kepercayaan bukan kapasitas. Seorang ustaz punya jamaah ribuan orang dan waktu dua puluh empat jam sehari.",
      en: "This is the highest-trust route in our society, which is exactly why it became our distribution channel. But trust is not capacity. An ustaz has thousands of congregants and twenty-four hours in a day.",
    },
    bullets: {
      id: ["Matchmaking bukan pekerjaan utama mereka dan tidak dibayar sebagai pekerjaan.", "Tidak ada pool kandidat yang terverifikasi—hanya orang-orang yang kebetulan mereka kenal.", "Tidak ada standar untuk menilai kesiapan atau kecocokan.", "Tidak ada sistem tindak lanjut: setelah diperkenalkan, prosesnya berhenti.", "Beban koordinasi jatuh pada satu orang yang sudah kelebihan beban."],
      en: ["Matchmaking is not their main job and is not paid as one.", "There is no verified candidate pool—only the people they happen to know.", "There is no standard for assessing readiness or compatibility.", "There is no follow-up system: after the introduction, the process stops.", "The coordination burden falls on one already-overloaded person."],
    },
  },
  {
    label: { id: "Bertemu alami", en: "Meeting naturally" },
    teaser: { id: "Terasa spontan dan tidak dibuat-buat.", en: "Feels spontaneous and unforced." },
    heading: { id: "Harapan tanpa proses.", en: "Hope without a process." },
    body: {
      id: "Ini bukan sebuah strategi—ini adalah ketiadaan strategi yang diberi nama indah. Kampus, kantor, atau perjalanan memang bisa mempertemukan orang, tetapi tidak ada satu pun mekanisme yang memastikan orang itu layak dinikahi.",
      en: "This is not a strategy—it is the absence of one, given a beautiful name. Campus, work, or travel genuinely can bring people together, but nothing in it verifies that the person is worth marrying.",
    },
    bullets: {
      id: ["Sepenuhnya bergantung pada kebetulan dan lingkaran sosial yang sempit.", "Niat hampir tidak pernah dinyatakan di awal—keduanya menebak.", "Perasaan tumbuh lebih dulu, nilai dan kesiapan dibicarakan belakangan.", "Latar belakang dan karakter tidak pernah diuji oleh siapa pun.", "Karena tidak ada bingkai yang jelas, prosesnya mudah berubah menjadi rahasia."],
      en: ["It depends entirely on chance and a narrow social circle.", "Intent is almost never stated up front—both sides are guessing.", "Feelings grow first; values and readiness are discussed later.", "Background and character are never tested by anyone.", "With no clear frame, the process easily turns into something secret."],
    },
  },
];

const processItems: ExpandableItem[] = [
  {
    label: { id: "01 · Dengarkan cerita", en: "01 · Listen to your story" },
    teaser: { id: "Wawancara mendalam, bukan formulir.", en: "A deep interview, not a form." },
    heading: { id: "Kami mulai dari orangnya, bukan dari kriterianya.", en: "We start with the person, not the checklist." },
    body: { id: "Sebelum ada satu profil pun, kami duduk bersama klien secara privat. Tujuan menikah, nilai, batasan, kondisi keluarga, dan gambaran hidup lima tahun ke depan dibicarakan. Dari sini profil dibangun—bukan dari daftar keinginan yang ditulis sendiri.", en: "Before a single profile exists, we sit privately with the client. Marriage goals, values, boundaries, family situation, and their picture of life five years from now are all discussed. The profile is built from this—not from a self-written wish list." },
    bullets: { id: ["Menyelesaikan: proses yang dimulai dari tebakan atau profil dangkal.", "Biaya nyata: waktu manusia, bukan formulir otomatis."], en: ["Solves: a process that begins with guessing or a shallow profile.", "Real cost: human hours, not an automated form."] },
  },
  {
    label: { id: "02 · Uji kesiapan", en: "02 · Test readiness" },
    teaser: { id: "Asesmen psikologi, bukan klaim sendiri.", en: "Psychological assessment, not self-declaration." },
    heading: { id: "Siap menikah adalah sesuatu yang diuji, bukan dinyatakan.", en: "Readiness is something tested, not announced." },
    body: { id: "Hampir semua orang mengatakan dirinya siap menikah. Asesmen psikologi memberi gambaran yang lebih jujur tentang kematangan, cara mengelola konflik, dan harapan yang realistis—dan hasilnya dibicarakan kembali dengan klien.", en: "Nearly everyone says they are ready for marriage. A psychological assessment gives a more honest picture of maturity, conflict handling, and realistic expectations—and the result is discussed back with the client." },
    bullets: { id: ["Menyelesaikan: pernikahan yang gagal karena kesiapan tidak pernah diperiksa.", "Ini juga melindungi pihak lain di dalam pool kami."], en: ["Solves: marriages that fail because readiness was never examined.", "It also protects the other side inside our pool."] },
  },
  {
    label: { id: "03 · Verifikasi", en: "03 · Verify" },
    teaser: { id: "Background check sebelum bertemu siapa pun.", en: "Background check before meeting anyone." },
    heading: { id: "Standar kami: verifikasi selesai sebelum ada pertemuan.", en: "Our standard: verification completes before any meeting." },
    body: { id: "Identitas, status pernikahan, pekerjaan, dan informasi penting lain ditinjau sesuai paket. Ini adalah biaya terbesar kami per klien—dan aturan yang tidak pernah kami tawar: tidak ada ta'aruf sebelum verifikasi selesai.", en: "Identity, marital status, employment, and other critical information are reviewed according to the package. This is our largest cost per client—and the rule we never bend: no ta'aruf before verification is complete." },
    bullets: { id: ["Menyelesaikan: risiko profil palsu, status yang disembunyikan, dan janji yang tidak bisa dipercaya.", "Alasan utama keluarga bersedia mempercayai kami."], en: ["Solves: fake profiles, hidden marital status, and promises that cannot be trusted.", "The main reason families are willing to trust us."] },
  },
  {
    label: { id: "04 · Bagikan profil", en: "04 · Share profiles" },
    teaser: { id: "Privat, dan hanya setelah pembayaran.", en: "Private, and only after payment." },
    heading: { id: "Di sinilah jam layanan klien mulai berjalan.", en: "This is where the client's service window begins." },
    body: { id: "Profil yang cocok dibagikan secara privat kepada kedua pihak. Jendela layanan klien dimulai saat profil pertama dikirim—bukan saat mereka membayar—sehingga tidak ada yang kehilangan waktu karena pool kami masih bertumbuh.", en: "Matching profiles are shared privately with both sides. The client's service window starts when the first profiles are sent—not when they pay—so nobody loses time because our pool is still growing." },
    bullets: { id: ["Menyelesaikan: klien yang membayar lalu menunggu tanpa kejelasan.", "Aturan tetap: tanpa pembayaran, tidak ada profil yang dibagikan."], en: ["Solves: clients who pay and then wait with no clarity.", "Standing rule: no payment, no profiles shared."] },
  },
  {
    label: { id: "05 · Persetujuan dua pihak", en: "05 · Both sides consent" },
    teaser: { id: "Tidak ada kontak yang dipaksakan.", en: "No contact is ever forced." },
    heading: { id: "Menolak harus semudah menerima.", en: "Saying no must be as easy as saying yes." },
    body: { id: "Kedua pihak menilai secara privat dan menjawab kepada kami, bukan kepada satu sama lain. Penolakan disampaikan tanpa konfrontasi dan tanpa rasa malu. Tidak ada nomor telepon yang berpindah tangan sebelum keduanya setuju.", en: "Each side considers privately and answers to us, not to each other. A refusal is delivered without confrontation and without embarrassment. No phone number changes hands before both agree." },
    bullets: { id: ["Menyelesaikan: rasa canggung yang membuat orang menerima sesuatu yang tidak mereka inginkan.", "Ini persis kelemahan terbesar jalur referensi keluarga."], en: ["Solves: the awkwardness that makes people accept what they do not want.", "This is precisely the biggest weakness of the family-referral route."] },
  },
  {
    label: { id: "06 · Pertemuan online", en: "06 · Meet online first" },
    teaser: { id: "Langkah kecil sebelum langkah besar.", en: "A small step before the big one." },
    heading: { id: "Pertemuan berbiaya rendah sebelum berkomitmen lebih jauh.", en: "A low-cost meeting before committing further." },
    body: { id: "Sebuah pertemuan online singkat yang terjadwal dan terarah. Tujuannya bukan mengobrol berminggu-minggu, melainkan memastikan bahwa pertemuan tatap muka memang layak diadakan untuk kedua belah pihak.", en: "A short, scheduled, purposeful online meeting. The goal is not weeks of chatting—it is to confirm that an in-person meeting is genuinely worth holding for both people." },
    bullets: { id: ["Menyelesaikan: biaya dan tekanan pertemuan besar yang ternyata tidak cocok sejak menit pertama.", "Opsional, dan ditagih terpisah dengan harga rendah."], en: ["Solves: the cost and pressure of a large meeting that was mismatched from the first minute.", "Optional, and billed separately at a low price."] },
  },
  {
    label: { id: "07 · Joble — Jodohmu Table", en: "07 · Joble — the Jodohmu Table" },
    teaser: { id: "Pertemuan nyata yang dirancang, bukan kencan.", en: "A designed real-world meeting, not a date." },
    heading: { id: "Joble adalah inti dari layanan kami.", en: "The Joble is the heart of what we sell." },
    body: { id: "Joble berarti Jodohmu Table: pertemuan tatap muka yang direncanakan penuh—tempat privat, waktu, hidangan, format percakapan, tamu tepercaya, dan fasilitator bila diinginkan. Semua detail disepakati kedua pihak sebelum siapa pun bertemu. Kalian datang sudah tahu tujuannya, formatnya, siapa yang hadir, dan apa yang terjadi setelahnya.", en: "Joble means Jodohmu Table: a fully planned in-person meeting—private venue, timing, food, conversation format, trusted guests, and a facilitator if wanted. Every detail is agreed by both sides before anyone meets. You arrive already knowing the purpose, the format, who will be present, and what happens afterwards." },
    bullets: { id: ["Pearl Joble: satu pertemuan dengan hidangan yang disiapkan; satu tamu tepercaya dan satu fasilitator pilihan.", "Ruby Joble: dua pertemuan dengan buffet; hingga dua tamu tepercaya dan satu fasilitator pilihan.", "Diamond Joble: tiga pertemuan privat di hotel bintang 4–5 dengan buffet; hingga dua tamu dan fasilitator sudah termasuk.", "Fasilitator adalah satu orang—imam, pemuka agama, tim Jodohmu, atau tidak sama sekali. Pilihan kalian, dengan persetujuan pihak lain."], en: ["Pearl Joble: one meeting with a prepared meal; one trusted guest and one chosen facilitator.", "Ruby Joble: two meetings with buffet dining; up to two trusted guests and one chosen facilitator.", "Diamond Joble: three private meetings at a 4- or 5-star hotel with buffet dining; up to two guests and a facilitator included.", "A facilitator is one person—an imam, a faith leader, the Jodohmu team, or none at all. Your choice, subject to the other side's agreement."] },
  },
  {
    label: { id: "08 · Ruang untuk memilih", en: "08 · Space to decide" },
    teaser: { id: "Merenung sendiri, menjawab secara privat.", en: "Reflect alone, answer privately." },
    heading: { id: "Keputusan diambil tanpa ada orang yang menunggu di depan wajah kalian.", en: "The decision is made with nobody waiting in your face." },
    body: { id: "Setelah Joble, masing-masing pulang dan merenung sendiri. Jawaban disampaikan kepada kami secara privat, lalu kami sampaikan dengan cara yang menjaga kehormatan kedua pihak. Tidak ada yang dipaksa melanjutkan.", en: "After the Joble, each person goes home and reflects alone. The answer is given to us privately, and we deliver it in a way that protects the dignity of both sides. Nobody is pushed to continue." },
    bullets: { id: ["Menyelesaikan: tekanan dari keluarga, fasilitator, atau dari proses itu sendiri.", "Umpan balik penolakan disampaikan jujur—dan sering menjadi alasan klien naik ke paket yang lebih dalam."], en: ["Solves: pressure from family, facilitators, or the process itself.", "Rejection feedback is given honestly—and often becomes the reason a client moves to a deeper package."] },
  },
  {
    label: { id: "09 · Pertemuan keluarga", en: "09 · The family gathering" },
    teaser: { id: "Keluarga hadir saat waktunya tepat.", en: "Family joins at the right time." },
    heading: { id: "Keluarga masuk untuk mendukung—bukan untuk mengambil alih.", en: "Family enters to support—not to take over." },
    body: { id: "Ketika kedua orang siap melangkah lebih serius, kami memfasilitasi pertemuan keluarga. Waktunya sengaja diletakkan di sini: cukup awal agar keluarga tidak merasa dilangkahi, cukup lambat agar pilihan tetap milik dua orang yang akan menikah.", en: "When both people are ready to move to a more serious stage, we facilitate the family gathering. Its timing is deliberate: early enough that families do not feel bypassed, late enough that the choice still belongs to the two people who will marry." },
    bullets: { id: ["Menyelesaikan: keluarga yang datang terlambat, atau yang datang terlalu awal lalu mengambil alih.", "Ini juga langkah dengan nilai transaksi tertinggi dalam layanan kami."], en: ["Solves: families arriving too late, or arriving too early and taking over.", "It is also the highest-value single step in our service."] },
  },
];

function ExpandableCardsSlide({ language, variant }: { language: "id" | "en"; variant: "routes" | "process" }) {
  const isId = language === "id";
  const isRoutes = variant === "routes";
  const items = isRoutes ? routeItems : processItems;
  const [open, setOpen] = useState(0);
  const active = items[open];
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isRoutes ? (isId ? "Lanskap kompetitif" : "The competitive landscape") : (isId ? "Proses Jodohmu" : "The Jodohmu process")}</p>
    <h2 className={`mx-auto mt-3 max-w-5xl text-center font-serif font-bold leading-tight ${isRoutes ? "text-3xl sm:text-5xl" : "text-2xl sm:text-4xl"}`}>
      {isRoutes ? (isId ? <>Empat cara yang sudah ada—<span className="italic text-[#ef91b1]">dan celah di keempatnya.</span></> : <>Four existing routes—<span className="italic text-[#ef91b1]">and the gap in all four.</span></>)
                : (isId ? <>Sembilan langkah, <span className="italic text-[#ef91b1]">dari cerita sampai keluarga.</span></> : <>Nine steps, <span className="italic text-[#ef91b1]">from story to family.</span></>)}
    </h2>
    <p className="mt-2 text-center text-[.65rem] font-semibold uppercase tracking-[.18em] text-white/40">{isId ? "Klik kartu untuk membuka detail" : "Click a card to open the detail"}</p>
    <div className={`grid gap-2.5 ${isRoutes ? "mt-6 sm:grid-cols-2 lg:grid-cols-4" : "mt-4 sm:grid-cols-3 lg:grid-cols-5"}`}>
      {items.map((item, index) => {
        const isOpen = index === open;
        return <button key={item.label.en} onClick={() => setOpen(index)} className={`rounded-2xl border p-4 text-left transition ${isOpen ? "border-[#e6bd69] bg-[#e6bd69]/[.14]" : "border-white/15 bg-white/[.06] hover:border-white/35 hover:bg-white/[.1]"}`}>
          <h3 className={`text-sm font-bold leading-5 ${isOpen ? "text-[#e6bd69]" : "text-white"}`}>{isId ? item.label.id : item.label.en}</h3>
          <p className="mt-1.5 text-[.72rem] leading-5 text-white/55">{isId ? item.teaser.id : item.teaser.en}</p>
        </button>;
      })}
    </div>
    <div className={`rounded-3xl border border-[#e6bd69]/30 bg-white/[.06] p-6 sm:p-7 ${isRoutes ? "mt-5 min-h-[15rem]" : "mt-4 min-h-[11rem]"}`}>
      <h3 className="font-serif text-2xl font-bold text-[#e6bd69] sm:text-3xl">{isId ? active.heading.id : active.heading.en}</h3>
      <p className="mt-3 max-w-4xl text-[.92rem] leading-7 text-white/80">{isId ? active.body.id : active.body.en}</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {(isId ? active.bullets.id : active.bullets.en).map((point) => <li key={point} className="flex gap-3 text-[.82rem] leading-6 text-white/65">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef91b1]" />{point}
        </li>)}
      </ul>
    </div>
    {isRoutes && <p className="mt-4 text-center text-sm font-bold text-[#f3c5d4]">{isId ? "Tidak ada satu pun yang menggabungkan akses, verifikasi, adab, dan keluarga dalam satu proses. Celah itulah usahanya." : "Not one of them combines access, verification, adab, and family in a single process. That gap is the business."}</p>}
  </div>;
}

function BusinessModelIntroSlide({ language }: { language: "id" | "en" }) {
  const isId = language === "id";
  return <div className="mx-auto w-full max-w-4xl text-center">
    <p className="text-xs font-bold uppercase tracking-[.28em] text-[#e6bd69]">{isId ? "Bagian dua" : "Part two"}</p>
    <h2 className="mt-7 font-serif text-5xl font-bold leading-[1.08] sm:text-7xl">{isId ? <>Sekarang,<br /><span className="italic text-[#ef91b1]">mari lihat model bisnisnya.</span></> : <>Now,<br /><span className="italic text-[#ef91b1]">let&rsquo;s look at the business model.</span></>}</h2>
    <p className="mx-auto mt-9 max-w-2xl text-xl leading-9 text-white/70">{isId ? "Kalian sudah melihat masalahnya dan melihat prosesnya. Pertanyaan berikutnya adalah pertanyaan kelas kewirausahaan: bagaimana semua ini menghasilkan uang—dan berapa biayanya untuk dijalankan?" : "You have seen the problem and you have seen the process. The next question is the entrepreneurship question: how does any of this make money—and what does it cost to run?"}</p>
    <div className="mx-auto mt-11 flex max-w-2xl items-center gap-5">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#e6bd69]/60" />
      <Coins className="h-8 w-8 text-[#e6bd69]" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#e6bd69]/60" />
    </div>
  </div>;
}

function BusinessRulesSlide({ language }: { language: "id" | "en" }) {
  const isId = language === "id";
  const rules = isId
    ? [
        ["Kecepatan", "Bergeraklah cepat; jangan biarkan penundaan yang tidak perlu mematikan momentum."],
        ["Uang Masuk", "Sebuah usaha ada untuk memasukkan uang. Itu ukuran pertamanya."],
        ["Mulai Murah", "Mulailah dengan uang sesedikit mungkin."],
        ["Keluarga & Teman", "Mereka bisa menjadi tenaga kerja awal yang sangat berguna."],
        ["Bangun Wibawa", "Tegakkan otoritas dan standar sejak awal."],
        ["Jual Lagi ke Pelanggan Lama", "Menjual kembali kepada orang yang sudah pernah membeli jauh lebih murah."],
        ["Jangan Urus Legal Sebelum Kaya", "Jangan merumitkan diri dengan urusan formal sebelum usahanya terbukti."],
        ["Pakai yang Sudah Ada", "Manfaatkan sumber daya yang kalian miliki—jangan menunggu yang sempurna."],
        ["Beri Target yang Jelas", "Staf membutuhkan sasaran dan hasil yang spesifik, bukan instruksi kabur."],
        ["Kelola Orang", "Kelola tim kalian, dan keluarkan produktivitas yang lebih besar dari mereka."],
      ]
    : [
        ["Speed", "Move fast; do not let unnecessary delays kill momentum."],
        ["Money In", "A business exists to bring money in. That is the first measure."],
        ["Start Cheap", "Start the business with as little money as possible."],
        ["Family & Friends", "They can be genuinely useful as early staff."],
        ["Command Respect", "Establish authority and standards from the beginning."],
        ["Resell to Existing Customers", "Selling again to someone who already bought is far cheaper."],
        ["Don't Get Legal Before You Get Rich", "Do not overcomplicate with setup before the business is proven."],
        ["Use What You've Got", "Leverage the resources you already have—do not wait for perfect ones."],
        ["Staff Need a Clear Objective", "People need a specific target and result, not vague instructions."],
        ["Manage Your Staff", "Manage your people, and get more productivity out of them."],
      ];
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-[#e6bd69]">{isId ? "Bekal untuk kalian" : "What to take with you"}</p>
    <h2 className="mx-auto mt-3 max-w-5xl text-center font-serif text-3xl font-bold leading-tight sm:text-5xl">{isId ? <>Sepuluh aturan <span className="italic text-[#ef91b1]">yang benar-benar dipakai.</span></> : <>Ten rules <span className="italic text-[#ef91b1]">that actually get used.</span></>}</h2>
    <div className="mt-7 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
      {rules.map(([title, detail], index) => <div key={title} className="rounded-2xl border border-white/15 bg-white/[.07] p-4">
        <p className="font-serif text-xl text-[#e6bd69]">{String(index + 1).padStart(2, "0")}</p>
        <h3 className="mt-2.5 text-[.9rem] font-bold leading-5">{title}</h3>
        <p className="mt-2 text-[.75rem] leading-5 text-white/65">{detail}</p>
      </div>)}
    </div>
    <p className="mt-7 text-center text-base font-bold text-[#f3c5d4]">{isId ? "Aturan-aturan ini tidak akan menyelamatkan usaha yang tidak punya tujuan. Ia hanya mempercepat usaha yang sudah punya." : "None of these will save a business with no purpose behind it. They only speed up one that already has it."}</p>
  </div>;
}

function ContactSlide({ language }: { language: "id" | "en" }) {
  const isId = language === "id";
  const cards = [
    { src: "/qr-instagram-jodohmu.svg", label: "Instagram", handle: "@jodohmu_official", hint: isId ? "Cerita, edukasi, dan kabar terbaru." : "Stories, education, and updates." },
    { src: "/qr-website-jodohmu.svg", label: "Website", handle: "www.jodohmu.com", hint: isId ? "Paket, proses, dan cara memulai." : "Packages, process, and how to begin." },
    { src: "/qr-whatsapp-jodohmu.svg", label: "WhatsApp", handle: "0811 2221 0303", hint: isId ? "Bicara langsung dengan tim kami." : "Talk to our team directly." },
  ];
  return <div className="mx-auto w-full max-w-6xl">
    <p className="text-center text-xs font-bold uppercase tracking-[.28em] text-[#e6bd69]">{isId ? "Terima kasih" : "Thank you"}</p>
    <h2 className="mx-auto mt-3 max-w-4xl text-center font-serif text-3xl font-bold leading-tight sm:text-5xl">{isId ? <>Mari tetap <span className="italic text-[#ef91b1]">terhubung.</span></> : <>Let&rsquo;s stay <span className="italic text-[#ef91b1]">connected.</span></>}</h2>
    <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-7 text-white/65">{isId ? "Pindai salah satu kode di bawah ini—untuk bertanya, untuk belajar, atau kalau nanti kalian membangun sesuatu dan ingin berdiskusi." : "Scan any of these—to ask a question, to keep learning, or when you build something of your own and want to talk it through."}</p>
    <div className="mt-8 grid gap-5 sm:grid-cols-3">
      {cards.map((card) => <div key={card.label} className="flex flex-col items-center rounded-3xl border border-white/15 bg-white/[.07] p-6">
        <div className="rounded-2xl bg-white p-3">
          <Image src={card.src} alt={`${card.label} QR — ${card.handle}`} width={168} height={168} className="h-[10.5rem] w-[10.5rem]" unoptimized />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[.22em] text-[#e6bd69]">{card.label}</p>
        <p className="mt-2 text-lg font-bold text-white">{card.handle}</p>
        <p className="mt-2 text-center text-[.8rem] leading-5 text-white/60">{card.hint}</p>
      </div>)}
    </div>
    <p className="mt-8 text-center text-lg font-bold text-[#f3c5d4]">{isId ? "Cari masalah yang layak dikerjakan. Lalu bangun dengan jujur." : "Find a problem worth doing. Then build it honestly."}</p>
  </div>;
}
