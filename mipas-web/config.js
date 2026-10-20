// =====================================================
//  PENGATURAN WEBSITE MIPAS — cukup edit file ini
// =====================================================
window.MIPAS_CONFIG = {
  siteName: 'MIPAS',
  hashtag: '#TemanBelajarMIPAS',

  // Nama maskot (bisa diganti)
  mascotName: 'Mipa',

  // Nama pengajar (opsional). Kosongkan '' kalau tidak ingin ditampilkan.
  teacherName: '',
  about:
    'MIPAS adalah ruang belajar online untuk siswa SD, SMP, dan SMA. Materi Matematika, IPA, IPS, Pendidikan Pancasila, bahasa, hingga seni dijelaskan pelan-pelan lewat video, lengkap dengan konsep, kuis, dan pembahasan soal, supaya kamu benar-benar paham, bukan sekadar hafal.',

  channelId: 'UCvk1zpVnPPLIk5G5-vTjoRg',
  channelUrl: 'https://www.youtube.com/@mipaschannel',

  // Nomor WhatsApp untuk tombol kontak, format 62xxxxxxxxxx. Kosongkan '' untuk menyembunyikan.
  whatsapp: '',

  // Mata pelajaran. "match" = kata kunci di judul video untuk pengelompokan otomatis.
  // "topics" = tombol topik di kartu mapel; "q" = kata yang dicari saat tombol diklik.
  subjects: [
    {
      id: 'mtk', label: 'Matematika', short: 'MAT', color: 'orange',
      desc: 'Bilangan, pecahan & rasio, bangun ruang, sampai nilai mutlak.',
      match: /matematika|\bmtk\b|nilai mutlak|spltv|bangun ruang|pecahan|rasio|bilangan|pembagian/i,
      topics: [{ label: 'Bilangan Cacah', q: 'bilangan cacah' }, { label: 'Pecahan & Rasio', q: 'rasio' }, { label: 'Bangun Ruang', q: 'bangun ruang' }, { label: 'Nilai Mutlak', q: 'mutlak' }, { label: 'SPLTV', q: 'spltv' }],
    },
    {
      id: 'ipa', label: 'IPA & IPAS', short: 'IPA', color: 'teal',
      desc: 'Makhluk hidup, tubuh manusia, energi, gerak, sampai tata surya.',
      match: /\bipas?\b|gerak|\bglbb?\b|kecepatan|kelajuan|tumbuhan|hewan|makhluk hidup|cuaca|wujud benda|energi|tata surya|matahari|benda langit|antariksa|saraf|rangka|molekul|pupuk|pubertas|penyelidikan/i,
      topics: [{ label: 'Gerak & GLB/GLBB', q: 'gerak' }, { label: 'Tata Surya', q: 'tata surya, matahari, benda langit, antariksa' }, { label: 'Energi', q: 'energi' }, { label: 'Tumbuhan', q: 'tumbuhan' }, { label: 'Rangka & Otot', q: 'rangka' }, { label: 'Sistem Saraf', q: 'saraf' }],
    },
    {
      id: 'ips', label: 'IPS', short: 'IPS', color: 'blue',
      desc: 'ASEAN, mobilitas sosial, dan kegiatan ekonomi Indonesia.',
      match: /\bips\b|asean|ekonomi|mobilitas|agrikultur|maritim|negara indonesia/i,
      topics: [{ label: 'Negara ASEAN', q: 'asean' }, { label: 'Mobilitas Sosial', q: 'mobilitas' }, { label: 'Ekonomi', q: 'ekonomi, agrikultur' }],
    },
    {
      id: 'pkn', label: 'Pendidikan Pancasila', short: 'PKN', color: 'red',
      desc: 'Nilai Pancasila, UUD 1945, keberagaman, norma, hak & kewajiban.',
      match: /ppkn|\bpkn\b|pancasila|\buud\b|bpupki|dasar negara|kedaulatan|keberagaman|bhinneka|sumpah pemuda|orde lama|kemerdekaan|perundang|\bnorma\b|toleransi|disiplin/i,
      topics: [{ label: 'Nilai Pancasila', q: 'pancasila' }, { label: 'UUD 1945', q: 'uud' }, { label: 'Keberagaman', q: 'keberagaman, bhinneka' }, { label: 'Hak & Kewajiban', q: 'kewajiban' }],
    },
    {
      id: 'bind', label: 'Bahasa Indonesia', short: 'BIN', color: 'purple',
      desc: 'Membaca, memahami teks, dan latihan soal.',
      match: /bahasa indonesia|b\.\s?indonesia/i,
      topics: [{ label: 'Kumpulan Soal', q: 'soal' }],
    },
    {
      id: 'bing', label: 'Bahasa Inggris', short: 'ENG', color: 'blue',
      desc: 'Tenses dan persiapan ujian.',
      match: /bahasa inggris|\btense\b/i,
      topics: [{ label: 'Simple Future Tense', q: 'future' }],
    },
    {
      id: 'bsun', label: 'Bahasa Sunda', short: 'SUN', color: 'green',
      desc: 'Basa Sunda untuk SD, lengkap dengan kumpulan soal.',
      match: /sunda/i,
      topics: [{ label: 'Kumpulan Soal', q: 'soal' }],
    },
    {
      id: 'seni', label: 'Seni & Budaya', short: 'SBD', color: 'pink',
      desc: 'Seni rupa, ragam hias, dan tari kreasi Nusantara.',
      match: /seni rupa|\bsbdp\b|\btari|menggambar|ragam hias/i,
      topics: [{ label: 'Seni Rupa', q: 'seni rupa, menggambar' }, { label: 'Tari Kreasi', q: 'tari' }],
    },
  ],
};
