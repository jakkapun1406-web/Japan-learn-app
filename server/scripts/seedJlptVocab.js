// ============================================================
// IMPORTS
// ============================================================
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// ============================================================
// SUPABASE CLIENT (service_role — bypass RLS)
// ============================================================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================================
// N5 VOCAB DATA (~150 คำ)
// ============================================================
const N5_VOCAB = [
  // --- NOUNS ---
  { word: '人',     reading: 'ひと',       meaning: 'คน',                      part_of_speech: 'noun' },
  { word: '水',     reading: 'みず',       meaning: 'น้ำ',                      part_of_speech: 'noun' },
  { word: '日',     reading: 'ひ',         meaning: 'วัน, ดวงอาทิตย์',          part_of_speech: 'noun' },
  { word: '時間',   reading: 'じかん',     meaning: 'เวลา',                     part_of_speech: 'noun' },
  { word: '今日',   reading: 'きょう',     meaning: 'วันนี้',                   part_of_speech: 'noun' },
  { word: '明日',   reading: 'あした',     meaning: 'พรุ่งนี้',                 part_of_speech: 'noun' },
  { word: '昨日',   reading: 'きのう',     meaning: 'เมื่อวาน',                 part_of_speech: 'noun' },
  { word: '学校',   reading: 'がっこう',   meaning: 'โรงเรียน',                 part_of_speech: 'noun' },
  { word: '先生',   reading: 'せんせい',   meaning: 'ครู, อาจารย์',             part_of_speech: 'noun' },
  { word: '友達',   reading: 'ともだち',   meaning: 'เพื่อน',                   part_of_speech: 'noun' },
  { word: '家',     reading: 'いえ',       meaning: 'บ้าน',                     part_of_speech: 'noun' },
  { word: '車',     reading: 'くるま',     meaning: 'รถยนต์',                   part_of_speech: 'noun' },
  { word: '電車',   reading: 'でんしゃ',   meaning: 'รถไฟ',                     part_of_speech: 'noun' },
  { word: '駅',     reading: 'えき',       meaning: 'สถานีรถไฟ',               part_of_speech: 'noun' },
  { word: '本',     reading: 'ほん',       meaning: 'หนังสือ',                  part_of_speech: 'noun' },
  { word: '名前',   reading: 'なまえ',     meaning: 'ชื่อ',                     part_of_speech: 'noun' },
  { word: 'お金',   reading: 'おかね',     meaning: 'เงิน',                     part_of_speech: 'noun' },
  { word: '食べ物', reading: 'たべもの',   meaning: 'อาหาร',                    part_of_speech: 'noun' },
  { word: '飲み物', reading: 'のみもの',   meaning: 'เครื่องดื่ม',              part_of_speech: 'noun' },
  { word: '仕事',   reading: 'しごと',     meaning: 'งาน',                      part_of_speech: 'noun' },
  { word: '会社',   reading: 'かいしゃ',   meaning: 'บริษัท',                   part_of_speech: 'noun' },
  { word: '国',     reading: 'くに',       meaning: 'ประเทศ',                   part_of_speech: 'noun' },
  { word: '日本語', reading: 'にほんご',   meaning: 'ภาษาญี่ปุ่น',             part_of_speech: 'noun' },
  { word: '英語',   reading: 'えいご',     meaning: 'ภาษาอังกฤษ',             part_of_speech: 'noun' },
  { word: '月',     reading: 'つき',       meaning: 'เดือน, พระจันทร์',        part_of_speech: 'noun' },
  { word: '年',     reading: 'ねん',       meaning: 'ปี',                       part_of_speech: 'noun' },
  { word: '朝',     reading: 'あさ',       meaning: 'เช้า',                     part_of_speech: 'noun' },
  { word: '昼',     reading: 'ひる',       meaning: 'กลางวัน',                  part_of_speech: 'noun' },
  { word: '夜',     reading: 'よる',       meaning: 'กลางคืน',                  part_of_speech: 'noun' },
  { word: '男',     reading: 'おとこ',     meaning: 'ผู้ชาย',                   part_of_speech: 'noun' },
  { word: '女',     reading: 'おんな',     meaning: 'ผู้หญิง',                  part_of_speech: 'noun' },
  { word: '子供',   reading: 'こども',     meaning: 'เด็ก',                     part_of_speech: 'noun' },
  { word: '父',     reading: 'ちち',       meaning: 'พ่อ (ของตัวเอง)',          part_of_speech: 'noun' },
  { word: '母',     reading: 'はは',       meaning: 'แม่ (ของตัวเอง)',          part_of_speech: 'noun' },
  { word: '兄',     reading: 'あに',       meaning: 'พี่ชาย (ของตัวเอง)',      part_of_speech: 'noun' },
  { word: '姉',     reading: 'あね',       meaning: 'พี่สาว (ของตัวเอง)',      part_of_speech: 'noun' },
  { word: '弟',     reading: 'おとうと',   meaning: 'น้องชาย',                  part_of_speech: 'noun' },
  { word: '妹',     reading: 'いもうと',   meaning: 'น้องสาว',                  part_of_speech: 'noun' },
  { word: '犬',     reading: 'いぬ',       meaning: 'สุนัข',                    part_of_speech: 'noun' },
  { word: '猫',     reading: 'ねこ',       meaning: 'แมว',                      part_of_speech: 'noun' },
  { word: '魚',     reading: 'さかな',     meaning: 'ปลา',                      part_of_speech: 'noun' },
  { word: '花',     reading: 'はな',       meaning: 'ดอกไม้',                   part_of_speech: 'noun' },
  { word: '木',     reading: 'き',         meaning: 'ต้นไม้',                   part_of_speech: 'noun' },
  { word: '山',     reading: 'やま',       meaning: 'ภูเขา',                    part_of_speech: 'noun' },
  { word: '川',     reading: 'かわ',       meaning: 'แม่น้ำ',                   part_of_speech: 'noun' },
  { word: '海',     reading: 'うみ',       meaning: 'ทะเล',                     part_of_speech: 'noun' },
  { word: '空',     reading: 'そら',       meaning: 'ท้องฟ้า',                  part_of_speech: 'noun' },
  { word: '雨',     reading: 'あめ',       meaning: 'ฝน',                       part_of_speech: 'noun' },
  { word: '雪',     reading: 'ゆき',       meaning: 'หิมะ',                     part_of_speech: 'noun' },

  // --- VERBS ---
  { word: '食べる', reading: 'たべる',   meaning: 'กิน',                        part_of_speech: 'verb' },
  { word: '飲む',   reading: 'のむ',     meaning: 'ดื่ม',                       part_of_speech: 'verb' },
  { word: '行く',   reading: 'いく',     meaning: 'ไป',                         part_of_speech: 'verb' },
  { word: '来る',   reading: 'くる',     meaning: 'มา',                         part_of_speech: 'verb' },
  { word: '見る',   reading: 'みる',     meaning: 'ดู, มอง',                    part_of_speech: 'verb' },
  { word: '聞く',   reading: 'きく',     meaning: 'ฟัง, ถาม',                   part_of_speech: 'verb' },
  { word: '話す',   reading: 'はなす',   meaning: 'พูด',                        part_of_speech: 'verb' },
  { word: '読む',   reading: 'よむ',     meaning: 'อ่าน',                       part_of_speech: 'verb' },
  { word: '書く',   reading: 'かく',     meaning: 'เขียน',                      part_of_speech: 'verb' },
  { word: '買う',   reading: 'かう',     meaning: 'ซื้อ',                       part_of_speech: 'verb' },
  { word: '使う',   reading: 'つかう',   meaning: 'ใช้',                        part_of_speech: 'verb' },
  { word: '知る',   reading: 'しる',     meaning: 'รู้, รู้จัก',                part_of_speech: 'verb' },
  { word: '分かる', reading: 'わかる',   meaning: 'เข้าใจ',                     part_of_speech: 'verb' },
  { word: '思う',   reading: 'おもう',   meaning: 'คิด',                        part_of_speech: 'verb' },
  { word: '言う',   reading: 'いう',     meaning: 'พูด, บอก',                   part_of_speech: 'verb' },
  { word: 'ある',   reading: 'ある',     meaning: 'มี (สิ่งไม่มีชีวิต)',        part_of_speech: 'verb' },
  { word: 'いる',   reading: 'いる',     meaning: 'มี, อยู่ (สิ่งมีชีวิต)',    part_of_speech: 'verb' },
  { word: 'する',   reading: 'する',     meaning: 'ทำ',                         part_of_speech: 'verb' },
  { word: 'できる', reading: 'できる',   meaning: 'ทำได้',                      part_of_speech: 'verb' },
  { word: '起きる', reading: 'おきる',   meaning: 'ตื่นนอน',                    part_of_speech: 'verb' },
  { word: '寝る',   reading: 'ねる',     meaning: 'นอน',                        part_of_speech: 'verb' },
  { word: '帰る',   reading: 'かえる',   meaning: 'กลับบ้าน',                   part_of_speech: 'verb' },
  { word: '出る',   reading: 'でる',     meaning: 'ออก',                        part_of_speech: 'verb' },
  { word: '入る',   reading: 'はいる',   meaning: 'เข้า',                       part_of_speech: 'verb' },
  { word: '開ける', reading: 'あける',   meaning: 'เปิด',                       part_of_speech: 'verb' },
  { word: '閉める', reading: 'しめる',   meaning: 'ปิด',                        part_of_speech: 'verb' },
  { word: '立つ',   reading: 'たつ',     meaning: 'ยืน',                        part_of_speech: 'verb' },
  { word: '座る',   reading: 'すわる',   meaning: 'นั่ง',                       part_of_speech: 'verb' },
  { word: '待つ',   reading: 'まつ',     meaning: 'รอ',                         part_of_speech: 'verb' },
  { word: '会う',   reading: 'あう',     meaning: 'พบ',                         part_of_speech: 'verb' },
  { word: '持つ',   reading: 'もつ',     meaning: 'ถือ, มี',                    part_of_speech: 'verb' },
  { word: '乗る',   reading: 'のる',     meaning: 'ขึ้น (ยานพาหนะ)',           part_of_speech: 'verb' },
  { word: '泳ぐ',   reading: 'およぐ',   meaning: 'ว่ายน้ำ',                    part_of_speech: 'verb' },
  { word: '走る',   reading: 'はしる',   meaning: 'วิ่ง',                       part_of_speech: 'verb' },
  { word: '歩く',   reading: 'あるく',   meaning: 'เดิน',                       part_of_speech: 'verb' },
  { word: '働く',   reading: 'はたらく', meaning: 'ทำงาน',                      part_of_speech: 'verb' },
  { word: '勉強する', reading: 'べんきょうする', meaning: 'เรียนหนังสือ',      part_of_speech: 'verb' },
  { word: '電話する', reading: 'でんわする',    meaning: 'โทรศัพท์',           part_of_speech: 'verb' },
  { word: '休む',   reading: 'やすむ',   meaning: 'พัก',                        part_of_speech: 'verb' },
  { word: '飲む',   reading: 'のむ',     meaning: 'ดื่ม, กิน (ยา)',            part_of_speech: 'verb' },

  // --- い-ADJECTIVES ---
  { word: '大きい',   reading: 'おおきい',   meaning: 'ใหญ่',          part_of_speech: 'i-adj' },
  { word: '小さい',   reading: 'ちいさい',   meaning: 'เล็ก',          part_of_speech: 'i-adj' },
  { word: '高い',     reading: 'たかい',     meaning: 'สูง, แพง',      part_of_speech: 'i-adj' },
  { word: '低い',     reading: 'ひくい',     meaning: 'ต่ำ',           part_of_speech: 'i-adj' },
  { word: '安い',     reading: 'やすい',     meaning: 'ถูก (ราคา)',    part_of_speech: 'i-adj' },
  { word: '新しい',   reading: 'あたらしい', meaning: 'ใหม่',          part_of_speech: 'i-adj' },
  { word: '古い',     reading: 'ふるい',     meaning: 'เก่า',          part_of_speech: 'i-adj' },
  { word: '良い',     reading: 'よい',       meaning: 'ดี',            part_of_speech: 'i-adj' },
  { word: '悪い',     reading: 'わるい',     meaning: 'แย่, ไม่ดี',    part_of_speech: 'i-adj' },
  { word: '暑い',     reading: 'あつい',     meaning: 'ร้อน (อากาศ)', part_of_speech: 'i-adj' },
  { word: '寒い',     reading: 'さむい',     meaning: 'หนาว',          part_of_speech: 'i-adj' },
  { word: '熱い',     reading: 'あつい',     meaning: 'ร้อน (สิ่งของ)', part_of_speech: 'i-adj' },
  { word: '冷たい',   reading: 'つめたい',   meaning: 'เย็น (สิ่งของ)', part_of_speech: 'i-adj' },
  { word: '多い',     reading: 'おおい',     meaning: 'มาก',           part_of_speech: 'i-adj' },
  { word: '少ない',   reading: 'すくない',   meaning: 'น้อย',          part_of_speech: 'i-adj' },
  { word: '長い',     reading: 'ながい',     meaning: 'ยาว',           part_of_speech: 'i-adj' },
  { word: '短い',     reading: 'みじかい',   meaning: 'สั้น',          part_of_speech: 'i-adj' },
  { word: '広い',     reading: 'ひろい',     meaning: 'กว้าง',         part_of_speech: 'i-adj' },
  { word: '狭い',     reading: 'せまい',     meaning: 'แคบ',           part_of_speech: 'i-adj' },
  { word: '重い',     reading: 'おもい',     meaning: 'หนัก',          part_of_speech: 'i-adj' },
  { word: '軽い',     reading: 'かるい',     meaning: 'เบา',           part_of_speech: 'i-adj' },
  { word: '難しい',   reading: 'むずかしい', meaning: 'ยาก',           part_of_speech: 'i-adj' },
  { word: '易しい',   reading: 'やさしい',   meaning: 'ง่าย',          part_of_speech: 'i-adj' },
  { word: '楽しい',   reading: 'たのしい',   meaning: 'สนุก',          part_of_speech: 'i-adj' },
  { word: '怖い',     reading: 'こわい',     meaning: 'น่ากลัว',       part_of_speech: 'i-adj' },
  { word: 'かわいい', reading: 'かわいい',   meaning: 'น่ารัก',        part_of_speech: 'i-adj' },
  { word: 'おいしい', reading: 'おいしい',   meaning: 'อร่อย',         part_of_speech: 'i-adj' },
  { word: 'まずい',   reading: 'まずい',     meaning: 'ไม่อร่อย',      part_of_speech: 'i-adj' },
  { word: '白い',     reading: 'しろい',     meaning: 'สีขาว',         part_of_speech: 'i-adj' },
  { word: '黒い',     reading: 'くろい',     meaning: 'สีดำ',          part_of_speech: 'i-adj' },
  { word: '赤い',     reading: 'あかい',     meaning: 'สีแดง',         part_of_speech: 'i-adj' },
  { word: '青い',     reading: 'あおい',     meaning: 'สีน้ำเงิน',     part_of_speech: 'i-adj' },

  // --- な-ADJECTIVES ---
  { word: '好き',   reading: 'すき',     meaning: 'ชอบ',                       part_of_speech: 'na-adj' },
  { word: '嫌い',   reading: 'きらい',   meaning: 'ไม่ชอบ, เกลียด',            part_of_speech: 'na-adj' },
  { word: '上手',   reading: 'じょうず', meaning: 'เก่ง, ทำได้ดี',             part_of_speech: 'na-adj' },
  { word: '下手',   reading: 'へた',     meaning: 'ไม่เก่ง',                   part_of_speech: 'na-adj' },
  { word: '静か',   reading: 'しずか',   meaning: 'เงียบ',                     part_of_speech: 'na-adj' },
  { word: 'きれい', reading: 'きれい',   meaning: 'สวย, สะอาด',                part_of_speech: 'na-adj' },
  { word: '有名',   reading: 'ゆうめい', meaning: 'มีชื่อเสียง',               part_of_speech: 'na-adj' },
  { word: '元気',   reading: 'げんき',   meaning: 'แข็งแรง, สดชื่น',           part_of_speech: 'na-adj' },
  { word: '大丈夫', reading: 'だいじょうぶ', meaning: 'ไม่เป็นไร, โอเค',       part_of_speech: 'na-adj' },
  { word: '大切',   reading: 'たいせつ', meaning: 'สำคัญ',                     part_of_speech: 'na-adj' },
  { word: '暇',     reading: 'ひま',     meaning: 'ว่าง',                      part_of_speech: 'na-adj' },
  { word: '親切',   reading: 'しんせつ', meaning: 'ใจดี',                      part_of_speech: 'na-adj' },

  // --- ADVERBS ---
  { word: 'いつも',   reading: 'いつも',   meaning: 'เสมอ',            part_of_speech: 'adverb' },
  { word: 'もう',     reading: 'もう',     meaning: 'แล้ว',            part_of_speech: 'adverb' },
  { word: 'まだ',     reading: 'まだ',     meaning: 'ยังไม่',          part_of_speech: 'adverb' },
  { word: 'また',     reading: 'また',     meaning: 'อีกครั้ง',        part_of_speech: 'adverb' },
  { word: 'もっと',   reading: 'もっと',   meaning: 'มากกว่านี้',      part_of_speech: 'adverb' },
  { word: 'とても',   reading: 'とても',   meaning: 'มาก, มากๆ',       part_of_speech: 'adverb' },
  { word: 'あまり',   reading: 'あまり',   meaning: 'ไม่ค่อย (+ neg)', part_of_speech: 'adverb' },
  { word: 'ちょっと', reading: 'ちょっと', meaning: 'นิดหน่อย',        part_of_speech: 'adverb' },
  { word: 'たくさん', reading: 'たくさん', meaning: 'มาก',             part_of_speech: 'adverb' },
  { word: 'だから',   reading: 'だから',   meaning: 'ดังนั้น',         part_of_speech: 'adverb' },
  { word: '毎日',     reading: 'まいにち', meaning: 'ทุกวัน',          part_of_speech: 'adverb' },
  { word: '毎週',     reading: 'まいしゅう', meaning: 'ทุกสัปดาห์',   part_of_speech: 'adverb' },
  { word: '今',       reading: 'いま',     meaning: 'ตอนนี้',          part_of_speech: 'adverb' },
  { word: '一緒に',   reading: 'いっしょに', meaning: 'ด้วยกัน',       part_of_speech: 'adverb' },
];

// ============================================================
// N4 VOCAB DATA (~150 คำ)
// ============================================================
const N4_VOCAB = [
  // --- NOUNS ---
  { word: '意味',   reading: 'いみ',       meaning: 'ความหมาย',               part_of_speech: 'noun' },
  { word: '様子',   reading: 'ようす',     meaning: 'ท่าทาง, สภาพ',           part_of_speech: 'noun' },
  { word: '場合',   reading: 'ばあい',     meaning: 'กรณี',                   part_of_speech: 'noun' },
  { word: '予定',   reading: 'よてい',     meaning: 'แผน, กำหนดการ',          part_of_speech: 'noun' },
  { word: '予約',   reading: 'よやく',     meaning: 'การจอง',                 part_of_speech: 'noun' },
  { word: '準備',   reading: 'じゅんび',   meaning: 'การเตรียม',              part_of_speech: 'noun' },
  { word: '練習',   reading: 'れんしゅう', meaning: 'การฝึกซ้อม',             part_of_speech: 'noun' },
  { word: '説明',   reading: 'せつめい',   meaning: 'คำอธิบาย',               part_of_speech: 'noun' },
  { word: '質問',   reading: 'しつもん',   meaning: 'คำถาม',                  part_of_speech: 'noun' },
  { word: '答え',   reading: 'こたえ',     meaning: 'คำตอบ',                  part_of_speech: 'noun' },
  { word: '問題',   reading: 'もんだい',   meaning: 'ปัญหา, โจทย์',           part_of_speech: 'noun' },
  { word: '経験',   reading: 'けいけん',   meaning: 'ประสบการณ์',             part_of_speech: 'noun' },
  { word: '機会',   reading: 'きかい',     meaning: 'โอกาส',                  part_of_speech: 'noun' },
  { word: '理由',   reading: 'りゆう',     meaning: 'เหตุผล',                 part_of_speech: 'noun' },
  { word: '気持ち', reading: 'きもち',     meaning: 'ความรู้สึก',             part_of_speech: 'noun' },
  { word: '方法',   reading: 'ほうほう',   meaning: 'วิธีการ',                part_of_speech: 'noun' },
  { word: '趣味',   reading: 'しゅみ',     meaning: 'งานอดิเรก',              part_of_speech: 'noun' },
  { word: '旅行',   reading: 'りょこう',   meaning: 'การเดินทาง',             part_of_speech: 'noun' },
  { word: '映画',   reading: 'えいが',     meaning: 'ภาพยนตร์',               part_of_speech: 'noun' },
  { word: '音楽',   reading: 'おんがく',   meaning: 'ดนตรี',                  part_of_speech: 'noun' },
  { word: '料理',   reading: 'りょうり',   meaning: 'อาหาร, การทำอาหาร',     part_of_speech: 'noun' },
  { word: '運動',   reading: 'うんどう',   meaning: 'การออกกำลังกาย',        part_of_speech: 'noun' },
  { word: '病院',   reading: 'びょういん', meaning: 'โรงพยาบาล',              part_of_speech: 'noun' },
  { word: '薬',     reading: 'くすり',     meaning: 'ยา',                     part_of_speech: 'noun' },
  { word: '医者',   reading: 'いしゃ',     meaning: 'หมอ',                    part_of_speech: 'noun' },
  { word: '電話',   reading: 'でんわ',     meaning: 'โทรศัพท์',               part_of_speech: 'noun' },
  { word: '電気',   reading: 'でんき',     meaning: 'ไฟฟ้า',                  part_of_speech: 'noun' },
  { word: '新聞',   reading: 'しんぶん',   meaning: 'หนังสือพิมพ์',           part_of_speech: 'noun' },
  { word: '地図',   reading: 'ちず',       meaning: 'แผนที่',                 part_of_speech: 'noun' },
  { word: '時計',   reading: 'とけい',     meaning: 'นาฬิกา',                 part_of_speech: 'noun' },
  { word: '鍵',     reading: 'かぎ',       meaning: 'กุญแจ',                  part_of_speech: 'noun' },
  { word: '建物',   reading: 'たてもの',   meaning: 'อาคาร',                  part_of_speech: 'noun' },
  { word: '部屋',   reading: 'へや',       meaning: 'ห้อง',                   part_of_speech: 'noun' },
  { word: '台所',   reading: 'だいどころ', meaning: 'ห้องครัว',               part_of_speech: 'noun' },
  { word: '窓',     reading: 'まど',       meaning: 'หน้าต่าง',               part_of_speech: 'noun' },
  { word: '町',     reading: 'まち',       meaning: 'เมือง, ย่าน',            part_of_speech: 'noun' },
  { word: '道',     reading: 'みち',       meaning: 'ถนน, ทาง',               part_of_speech: 'noun' },
  { word: '橋',     reading: 'はし',       meaning: 'สะพาน',                  part_of_speech: 'noun' },
  { word: '公園',   reading: 'こうえん',   meaning: 'สวนสาธารณะ',             part_of_speech: 'noun' },
  { word: '図書館', reading: 'としょかん', meaning: 'ห้องสมุด',               part_of_speech: 'noun' },
  { word: '郵便局', reading: 'ゆうびんきょく', meaning: 'ที่ทำการไปรษณีย์',  part_of_speech: 'noun' },
  { word: '銀行',   reading: 'ぎんこう',   meaning: 'ธนาคาร',                 part_of_speech: 'noun' },
  { word: '空港',   reading: 'くうこう',   meaning: 'สนามบิน',                part_of_speech: 'noun' },
  { word: '店',     reading: 'みせ',       meaning: 'ร้าน',                   part_of_speech: 'noun' },
  { word: '声',     reading: 'こえ',       meaning: 'เสียง (ของคน)',          part_of_speech: 'noun' },
  { word: '顔',     reading: 'かお',       meaning: 'ใบหน้า',                 part_of_speech: 'noun' },
  { word: '頭',     reading: 'あたま',     meaning: 'หัว, สมอง',              part_of_speech: 'noun' },
  { word: '手',     reading: 'て',         meaning: 'มือ',                    part_of_speech: 'noun' },
  { word: '目',     reading: 'め',         meaning: 'ตา',                     part_of_speech: 'noun' },
  { word: '口',     reading: 'くち',       meaning: 'ปาก',                    part_of_speech: 'noun' },

  // --- VERBS ---
  { word: '覚える', reading: 'おぼえる',     meaning: 'จำ, เรียนรู้',          part_of_speech: 'verb' },
  { word: '忘れる', reading: 'わすれる',     meaning: 'ลืม',                   part_of_speech: 'verb' },
  { word: '続ける', reading: 'つづける',     meaning: 'ดำเนินต่อ',             part_of_speech: 'verb' },
  { word: '止める', reading: 'やめる',       meaning: 'หยุด, เลิก',            part_of_speech: 'verb' },
  { word: '始める', reading: 'はじめる',     meaning: 'เริ่ม',                 part_of_speech: 'verb' },
  { word: '終わる', reading: 'おわる',       meaning: 'จบ',                    part_of_speech: 'verb' },
  { word: '変える', reading: 'かえる',       meaning: 'เปลี่ยน',               part_of_speech: 'verb' },
  { word: '決める', reading: 'きめる',       meaning: 'ตัดสินใจ',              part_of_speech: 'verb' },
  { word: '考える', reading: 'かんがえる',   meaning: 'คิด',                   part_of_speech: 'verb' },
  { word: '調べる', reading: 'しらべる',     meaning: 'ค้นหา, ตรวจสอบ',       part_of_speech: 'verb' },
  { word: '教える', reading: 'おしえる',     meaning: 'สอน, บอก',              part_of_speech: 'verb' },
  { word: '習う',   reading: 'ならう',       meaning: 'เรียน (จากครู)',        part_of_speech: 'verb' },
  { word: '手伝う', reading: 'てつだう',     meaning: 'ช่วย',                  part_of_speech: 'verb' },
  { word: '送る',   reading: 'おくる',       meaning: 'ส่ง',                   part_of_speech: 'verb' },
  { word: '受ける', reading: 'うける',       meaning: 'รับ, สอบ',              part_of_speech: 'verb' },
  { word: '集める', reading: 'あつめる',     meaning: 'สะสม',                  part_of_speech: 'verb' },
  { word: '貸す',   reading: 'かす',         meaning: 'ให้ยืม',                part_of_speech: 'verb' },
  { word: '借りる', reading: 'かりる',       meaning: 'ยืม',                   part_of_speech: 'verb' },
  { word: '払う',   reading: 'はらう',       meaning: 'จ่าย',                  part_of_speech: 'verb' },
  { word: '選ぶ',   reading: 'えらぶ',       meaning: 'เลือก',                 part_of_speech: 'verb' },
  { word: '運ぶ',   reading: 'はこぶ',       meaning: 'ขน, นำ',                part_of_speech: 'verb' },
  { word: '壊す',   reading: 'こわす',       meaning: 'ทำให้พัง',              part_of_speech: 'verb' },
  { word: '直す',   reading: 'なおす',       meaning: 'ซ่อม, แก้ไข',          part_of_speech: 'verb' },
  { word: '洗う',   reading: 'あらう',       meaning: 'ล้าง',                  part_of_speech: 'verb' },
  { word: '掃除する', reading: 'そうじする', meaning: 'ทำความสะอาด',          part_of_speech: 'verb' },
  { word: '料理する', reading: 'りょうりする', meaning: 'ทำอาหาร',            part_of_speech: 'verb' },
  { word: '運転する', reading: 'うんてんする', meaning: 'ขับรถ',               part_of_speech: 'verb' },
  { word: '旅行する', reading: 'りょこうする', meaning: 'เดินทาง',             part_of_speech: 'verb' },
  { word: '結婚する', reading: 'けっこんする', meaning: 'แต่งงาน',             part_of_speech: 'verb' },
  { word: '急ぐ',   reading: 'いそぐ',       meaning: 'รีบ',                   part_of_speech: 'verb' },
  { word: '困る',   reading: 'こまる',       meaning: 'ลำบาก, ลำบากใจ',      part_of_speech: 'verb' },
  { word: '笑う',   reading: 'わらう',       meaning: 'หัวเราะ',               part_of_speech: 'verb' },
  { word: '泣く',   reading: 'なく',         meaning: 'ร้องไห้',               part_of_speech: 'verb' },
  { word: '怒る',   reading: 'おこる',       meaning: 'โกรธ',                  part_of_speech: 'verb' },
  { word: '喜ぶ',   reading: 'よろこぶ',     meaning: 'ดีใจ',                  part_of_speech: 'verb' },

  // --- ADJECTIVES ---
  { word: '便利',   reading: 'べんり',     meaning: 'สะดวก',                   part_of_speech: 'na-adj' },
  { word: '不便',   reading: 'ふべん',     meaning: 'ไม่สะดวก',               part_of_speech: 'na-adj' },
  { word: '丁寧',   reading: 'ていねい',   meaning: 'สุภาพ, รอบคอบ',          part_of_speech: 'na-adj' },
  { word: '簡単',   reading: 'かんたん',   meaning: 'ง่าย, เรียบง่าย',        part_of_speech: 'na-adj' },
  { word: '複雑',   reading: 'ふくざつ',   meaning: 'ซับซ้อน',                part_of_speech: 'na-adj' },
  { word: '正直',   reading: 'しょうじき', meaning: 'ซื่อสัตย์',              part_of_speech: 'na-adj' },
  { word: '安全',   reading: 'あんぜん',   meaning: 'ปลอดภัย',                part_of_speech: 'na-adj' },
  { word: '特別',   reading: 'とくべつ',   meaning: 'พิเศษ',                  part_of_speech: 'na-adj' },
  { word: '普通',   reading: 'ふつう',     meaning: 'ธรรมดา, ปกติ',           part_of_speech: 'na-adj' },
  { word: '自由',   reading: 'じゆう',     meaning: 'อิสระ',                  part_of_speech: 'na-adj' },
  { word: '必要',   reading: 'ひつよう',   meaning: 'จำเป็น',                 part_of_speech: 'na-adj' },
  { word: '無理',   reading: 'むり',       meaning: 'เป็นไปไม่ได้, ฝืน',    part_of_speech: 'na-adj' },
  { word: '大事',   reading: 'だいじ',     meaning: 'สำคัญ',                  part_of_speech: 'na-adj' },
  { word: '正しい', reading: 'ただしい',   meaning: 'ถูกต้อง',                part_of_speech: 'i-adj' },
  { word: '危ない', reading: 'あぶない',   meaning: 'อันตราย',                part_of_speech: 'i-adj' },
  { word: '珍しい', reading: 'めずらしい', meaning: 'หายาก, แปลก',           part_of_speech: 'i-adj' },
  { word: '細かい', reading: 'こまかい',   meaning: 'ละเอียด, ย่อย',         part_of_speech: 'i-adj' },
  { word: '辛い',   reading: 'からい',     meaning: 'เผ็ด',                   part_of_speech: 'i-adj' },
  { word: '甘い',   reading: 'あまい',     meaning: 'หวาน',                   part_of_speech: 'i-adj' },
  { word: '酸っぱい', reading: 'すっぱい', meaning: 'เปรี้ยว',                part_of_speech: 'i-adj' },

  // --- ADVERBS ---
  { word: 'やっと',   reading: 'やっと',   meaning: 'ในที่สุด',         part_of_speech: 'adverb' },
  { word: 'やはり',   reading: 'やはり',   meaning: 'ก็อย่างที่คิด',    part_of_speech: 'adverb' },
  { word: 'ずっと',   reading: 'ずっと',   meaning: 'ตลอดเวลา',         part_of_speech: 'adverb' },
  { word: 'すぐ',     reading: 'すぐ',     meaning: 'ทันที',             part_of_speech: 'adverb' },
  { word: 'もし',     reading: 'もし',     meaning: 'ถ้าหาก',           part_of_speech: 'adverb' },
  { word: 'ぜひ',     reading: 'ぜひ',     meaning: 'อยากอย่างยิ่ง',    part_of_speech: 'adverb' },
  { word: 'なかなか', reading: 'なかなか', meaning: 'ไม่ค่อย (+ neg)',   part_of_speech: 'adverb' },
  { word: 'はじめて', reading: 'はじめて', meaning: 'ครั้งแรก',         part_of_speech: 'adverb' },
  { word: 'きっと',   reading: 'きっと',   meaning: 'แน่นอน',           part_of_speech: 'adverb' },
  { word: 'たぶん',   reading: 'たぶん',   meaning: 'คงจะ, น่าจะ',      part_of_speech: 'adverb' },
  { word: 'もちろん', reading: 'もちろん', meaning: 'แน่นอน',           part_of_speech: 'adverb' },
  { word: 'ほんとうに', reading: 'ほんとうに', meaning: 'จริงๆ',        part_of_speech: 'adverb' },
  { word: 'だいたい', reading: 'だいたい', meaning: 'ส่วนใหญ่, ประมาณ', part_of_speech: 'adverb' },
  { word: 'ちゃんと', reading: 'ちゃんと', meaning: 'ให้ดี, เรียบร้อย', part_of_speech: 'adverb' },
  { word: 'なぜ',     reading: 'なぜ',     meaning: 'ทำไม',             part_of_speech: 'adverb' },
];

// ============================================================
// SEED FUNCTION — upsert แบบ idempotent
// ============================================================
async function seed() {
  const allVocab = [
    ...N5_VOCAB.map((v) => ({ ...v, jlpt_level: 'N5' })),
    ...N4_VOCAB.map((v) => ({ ...v, jlpt_level: 'N4' })),
  ];

  console.log(`\nSeeding ${allVocab.length} vocab entries...`);

  // upsert เป็น batch ครั้งละ 50 เพื่อไม่ให้ request ใหญ่เกินไป
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < allVocab.length; i += BATCH_SIZE) {
    const batch = allVocab.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from('jlpt_vocab')
      .upsert(batch, { onConflict: 'word,jlpt_level', ignoreDuplicates: false });

    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message);
      process.exit(1);
    }

    inserted += batch.length;
    console.log(`  [${inserted}/${allVocab.length}] done`);
  }

  console.log(`\nSeed complete — ${allVocab.length} entries upserted.\n`);
}

// ============================================================
// ENTRYPOINT
// ============================================================
seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
