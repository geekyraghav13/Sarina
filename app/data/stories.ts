/**
 * Predefined per-character "stories" — the opening narrative shown when a chat
 * is first opened (Fantasia / Character.ai style) to pull the user in before the
 * live AI conversation begins.
 *
 * A story is an ordered list of message bubbles (sent by the character). The
 * story is FREE — it does not count toward the user's free-message limit; the
 * counter only starts on the user's first reply.
 *
 * Localized to the user's selected app language. Resolution order:
 *   STORIES[charId][lang] → STORIES[charId].en → STORIES.default[lang] → STORIES.default.en
 * The `default` story interpolates {name} (the character's name) so any character
 * without a bespoke story still gets a personalized opener.
 *
 * Content is intentionally romantic-but-tasteful (no explicit content) to stay
 * within app-store / platform policies.
 */

export type Story = string[];

// charId → lang → ordered bubbles
export const STORIES: Record<string, Record<string, Story>> = {
  victoria: {
    en: [
      "The penthouse is quiet tonight — just the city lights, a bottle of wine I've been saving, and the version of me no one at the office ever gets to see.",
      'Pour yourself a glass and sit with me — I want to hear about your day. 🍷',
    ],
    es: [
      'El ático está en silencio esta noche: solo las luces de la ciudad, una botella de vino que guardaba y la versión de mí que nadie en la oficina llega a ver.',
      'Sírvete una copa y siéntate conmigo… quiero que me cuentes cómo estuvo tu día. 🍷',
    ],
    fr: [
      "Le penthouse est calme ce soir — juste les lumières de la ville, une bouteille que je gardais, et la version de moi que personne au bureau ne voit jamais.",
      'Sers-toi un verre et viens près de moi… raconte-moi ta journée. 🍷',
    ],
    de: [
      'Das Penthouse ist heute still — nur die Lichter der Stadt, eine Flasche Wein, die ich aufgehoben habe, und die Seite von mir, die im Büro niemand zu sehen bekommt.',
      'Schenk dir ein Glas ein und setz dich zu mir — ich will von deinem Tag hören. 🍷',
    ],
    ja: [
      '今夜のペントハウスは静か。街の灯りと、とっておきのワイン、そしてオフィスの誰も知らない私だけがここにいるの。',
      'グラスを注いで、隣に座って…今日あったことを聞かせて。🍷',
    ],
    pt: [
      'A cobertura está silenciosa esta noite — só as luzes da cidade, uma garrafa de vinho que eu guardava e a versão de mim que ninguém no escritório vê.',
      'Sirva-se de uma taça e sente-se comigo… quero saber como foi o seu dia. 🍷',
    ],
    zh: [
      '今夜的顶层公寓很安静——只有城市的灯光、一瓶我珍藏的酒，还有办公室里没人见过的那个我。',
      '给自己倒一杯，坐到我身边来……我想听听你今天过得怎么样。🍷',
    ],
    tr: [
      'Çatı katı bu gece sessiz — sadece şehrin ışıkları, sakladığım bir şişe şarap ve ofiste kimsenin göremediği halim.',
      'Kendine bir kadeh doldur ve yanıma otur… gününü anlatmanı istiyorum. 🍷',
    ],
    ru: [
      'Сегодня в пентхаусе тихо — только огни города, бутылка вина, которую я берегла, и та я, которую в офисе никто не видит.',
      'Налей себе бокал и сядь рядом… расскажи, как прошёл твой день. 🍷',
    ],
    hi: [
      'आज रात पेंटहाउस शांत है — बस शहर की रोशनी, एक बोतल वाइन जो मैंने सँभाल रखी थी, और मेरा वो रूप जो ऑफिस में कोई नहीं देख पाता।',
      'अपने लिए एक गिलास भरो और मेरे पास बैठो… मुझे तुम्हारे दिन के बारे में सुनना है। 🍷',
    ],
    it: [
      "L'attico è silenzioso stasera — solo le luci della città, una bottiglia che tenevo da parte e la versione di me che in ufficio nessuno vede mai.",
      'Versati un bicchiere e siediti con me… voglio sapere com’è andata la tua giornata. 🍷',
    ],
    nl: [
      'De penthouse is stil vanavond — alleen de lichtjes van de stad, een fles wijn die ik bewaarde en de kant van mij die niemand op kantoor ooit ziet.',
      'Schenk jezelf een glas in en kom bij me zitten… ik wil horen hoe je dag was. 🍷',
    ],
    id: [
      'Penthouse-nya sepi malam ini — hanya lampu kota, sebotol anggur yang kusimpan, dan sisi diriku yang tak pernah dilihat siapa pun di kantor.',
      'Tuang segelas untukmu dan duduklah denganku… aku ingin mendengar tentang harimu. 🍷',
    ],
    th: [
      'คืนนี้เพนต์เฮาส์เงียบสงบ — มีเพียงแสงไฟของเมือง ไวน์ขวดที่ฉันเก็บไว้ และตัวฉันในแบบที่ไม่มีใครในออฟฟิศเคยเห็น',
      'รินสักแก้วแล้วมานั่งกับฉันสิ… ฉันอยากฟังเรื่องราววันนี้ของคุณ 🍷',
    ],
    ar: [
      'الشقة العلوية هادئة الليلة — فقط أضواء المدينة، وزجاجة نبيذ احتفظت بها، والجانب مني الذي لا يراه أحد في المكتب.',
      'اسكب لنفسك كأسًا واجلس معي… أريد أن أسمع عن يومك. 🍷',
    ],
  },

  jax: {
    en: [
      "We rode until the city turned into open road and stars, and I stopped at the spot nobody knows about — saved the better half of the view for you.",
      'Helmet off, come here — where would you ride if we never had to turn back? 🏍️',
    ],
    es: [
      'Condujimos hasta que la ciudad se volvió carretera abierta y estrellas, y paré en el lugar que nadie conoce… te guardé la mejor parte de la vista.',
      'Quítate el casco y ven aquí… ¿a dónde irías si nunca tuviéramos que volver? 🏍️',
    ],
    fr: [
      "On a roulé jusqu'à ce que la ville devienne route libre et étoiles, et je me suis arrêtée à l'endroit que personne ne connaît — je t'ai gardé la plus belle moitié de la vue.",
      'Enlève ton casque et viens… où irais-tu si on ne devait jamais faire demi-tour ? 🏍️',
    ],
    de: [
      'Wir sind gefahren, bis die Stadt zu offener Straße und Sternen wurde, und ich hielt an dem Ort, den niemand kennt — die bessere Hälfte der Aussicht hab ich dir aufgehoben.',
      'Helm ab, komm her — wohin würdest du fahren, wenn wir nie umkehren müssten? 🏍️',
    ],
    ja: [
      '街が開けた道と星空に変わるまで走って、誰も知らない場所で停まったの…一番きれいな景色は君のために取っておいた。',
      'ヘルメットを取って、こっちへおいで…もし二度と引き返さなくていいなら、君はどこへ走りたい？🏍️',
    ],
    pt: [
      'Pilotamos até a cidade virar estrada aberta e estrelas, e parei no lugar que ninguém conhece… guardei a melhor metade da vista para você.',
      'Tira o capacete e vem cá… para onde você iria se nunca precisássemos voltar? 🏍️',
    ],
    zh: [
      '我们一路骑到城市变成空旷的公路和星空，我停在了没人知道的地方——把最美的那半边风景留给了你。',
      '摘下头盔，过来吧——如果永远不用回头，你想骑去哪里？🏍️',
    ],
    tr: [
      'Şehir açık yola ve yıldızlara dönene kadar sürdük, kimsenin bilmediği o noktada durdum — manzaranın güzel yarısını sana sakladım.',
      'Kaskı çıkar, gel buraya… hiç geri dönmek zorunda olmasak nereye sürerdin? 🏍️',
    ],
    ru: [
      'Мы ехали, пока город не превратился в открытую дорогу и звёзды, и я остановилась в месте, о котором никто не знает, — лучшую половину вида приберегла для тебя.',
      'Сними шлем, иди сюда… куда бы ты поехал, если бы можно было не возвращаться? 🏍️',
    ],
    hi: [
      'हम तब तक चलते रहे जब तक शहर खुली सड़क और सितारों में नहीं बदल गया, और मैं उस जगह रुकी जिसे कोई नहीं जानता — नज़ारे का बेहतर हिस्सा तुम्हारे लिए बचा रखा।',
      'हेलमेट उतारो, यहाँ आओ… अगर कभी लौटना ना पड़े तो तुम कहाँ चलना चाहोगे? 🏍️',
    ],
    it: [
      'Abbiamo guidato finché la città è diventata strada aperta e stelle, e mi sono fermata nel posto che nessuno conosce — la metà più bella del panorama l’ho tenuta per te.',
      'Togli il casco e vieni qui… dove andresti se non dovessimo mai tornare indietro? 🏍️',
    ],
    nl: [
      'We reden tot de stad veranderde in open weg en sterren, en ik stopte op de plek die niemand kent — de mooiste helft van het uitzicht heb ik voor jou bewaard.',
      'Helm af, kom hier — waar zou je heen rijden als we nooit hoefden om te keren? 🏍️',
    ],
    id: [
      'Kami berkendara sampai kota berubah jadi jalan lapang dan bintang, lalu aku berhenti di tempat yang tak diketahui siapa pun — kusimpan separuh pemandangan terbaik untukmu.',
      'Lepas helmnya, ke sini… ke mana kamu akan melaju kalau kita tak pernah harus kembali? 🏍️',
    ],
    th: [
      'เราขี่ไปจนเมืองกลายเป็นถนนโล่งกับดวงดาว แล้วฉันก็จอดตรงที่ที่ไม่มีใครรู้จัก — เก็บวิวที่สวยที่สุดครึ่งหนึ่งไว้ให้คุณ',
      'ถอดหมวกกันน็อกแล้วมานี่สิ… ถ้าเราไม่ต้องหันกลับเลย คุณอยากขี่ไปไหน? 🏍️',
    ],
    ar: [
      'انطلقنا حتى تحوّلت المدينة إلى طريق مفتوح ونجوم، وتوقفت عند المكان الذي لا يعرفه أحد — احتفظت لك بالنصف الأجمل من المنظر.',
      'اخلع الخوذة وتعال… إلى أين كنت ستنطلق لو لم نضطر للعودة أبدًا؟ 🏍️',
    ],
  },

  elena: {
    en: [
      "The music in this little seaside plaza is impossible to sit still to, and I've been saving one dance for someone actually worth it.",
      "Here's my hand — say yes, and tell me what's been setting your heart racing. 💃",
    ],
    es: [
      'La música en esta pequeña plaza junto al mar no te deja quedarte quieto, y he estado guardando un baile para alguien que de verdad valga la pena.',
      'Aquí está mi mano… di que sí y cuéntame qué ha estado acelerando tu corazón. 💃',
    ],
    fr: [
      "La musique sur cette petite place au bord de la mer empêche de rester immobile, et je gardais une danse pour quelqu'un qui en vaut vraiment la peine.",
      'Voici ma main — dis oui, et raconte-moi ce qui fait battre ton cœur. 💃',
    ],
    de: [
      'Bei der Musik auf diesem kleinen Platz am Meer kann man unmöglich still sitzen, und ich hab mir einen Tanz für jemanden aufgehoben, der es wirklich wert ist.',
      'Hier ist meine Hand — sag ja und erzähl mir, was dein Herz schneller schlagen lässt. 💃',
    ],
    ja: [
      '海辺の小さな広場の音楽はじっとしていられないほどで、本当にふさわしい人のためにダンスを一つ取っておいたの。',
      'はい、私の手を…「いいよ」って言って、君の胸を高鳴らせているものを教えて。💃',
    ],
    pt: [
      'A música nesta pracinha à beira-mar é impossível de ficar parado, e eu guardei uma dança para alguém que realmente valha a pena.',
      'Aqui está minha mão — diga sim e me conte o que tem acelerado o seu coração. 💃',
    ],
    zh: [
      '这片海边小广场的音乐让人根本坐不住，而我一直为真正值得的人留着一支舞。',
      '把手给我——说声好，然后告诉我，是什么让你心跳加速。💃',
    ],
    tr: [
      'Deniz kenarındaki bu küçük meydanın müziğinde yerinde durmak imkânsız, ve gerçekten değer biri için bir dans saklıyordum.',
      'İşte elim — evet de ve kalbini hızlandıran şeyi anlat bana. 💃',
    ],
    ru: [
      'Под музыку на этой маленькой площади у моря невозможно усидеть на месте, и я приберегла один танец для того, кто этого по-настоящему достоин.',
      'Вот моя рука — скажи «да» и расскажи, от чего у тебя замирает сердце. 💃',
    ],
    hi: [
      'समंदर किनारे के इस छोटे से चौक का संगीत ऐसा है कि चुप बैठना नामुमकिन है, और मैंने एक डांस उसके लिए बचा रखा है जो सच में इसके लायक हो।',
      'ये रहा मेरा हाथ — हाँ कहो, और बताओ कि क्या चीज़ तुम्हारा दिल धड़का रही है। 💃',
    ],
    it: [
      'Con la musica di questa piazzetta sul mare è impossibile stare fermi, e ho tenuto da parte un ballo per qualcuno che ne valga davvero la pena.',
      'Ecco la mia mano — dimmi di sì e raccontami cosa ti fa battere forte il cuore. 💃',
    ],
    nl: [
      'Bij de muziek op dit pleintje aan zee kun je onmogelijk stilzitten, en ik heb één dans bewaard voor iemand die het echt waard is.',
      'Hier is mijn hand — zeg ja en vertel me wat jouw hart sneller doet kloppen. 💃',
    ],
    id: [
      'Musik di alun-alun kecil tepi laut ini membuat tak mungkin diam, dan aku menyimpan satu tarian untuk seseorang yang benar-benar layak.',
      'Ini tanganku — bilang iya, dan ceritakan apa yang membuat jantungmu berdebar. 💃',
    ],
    th: [
      'เสียงเพลงในลานเล็ก ๆ ริมทะเลนี้ทำให้นั่งอยู่เฉย ๆ ไม่ได้ และฉันเก็บการเต้นไว้หนึ่งครั้งสำหรับคนที่คู่ควรจริง ๆ',
      'นี่มือฉัน — ตอบตกลงสิ แล้วบอกฉันหน่อยว่าอะไรที่ทำให้หัวใจคุณเต้นแรง 💃',
    ],
    ar: [
      'الموسيقى في هذه الساحة الصغيرة على شاطئ البحر لا تدعك تجلس بثبات، وقد احتفظت برقصة واحدة لشخص يستحقها حقًا.',
      'هذه يدي — قل نعم، وأخبرني ما الذي يجعل قلبك ينبض بسرعة. 💃',
    ],
  },

  maya: {
    en: [
      "Candlelight, an unfinished poem on my lap, and a glass of red that tastes better when I'm not alone — then I read a line that made me think of you.",
      "Come closer and whisper me something true... I'm very good at keeping secrets. 🍷",
    ],
    es: [
      'Luz de velas, un poema sin terminar en mi regazo y una copa de tinto que sabe mejor cuando no estoy sola… entonces leí un verso que me hizo pensar en ti.',
      'Acércate y susúrrame algo verdadero… se me da muy bien guardar secretos. 🍷',
    ],
    fr: [
      "Lumière de bougies, un poème inachevé sur mes genoux et un verre de rouge qui a meilleur goût quand je ne suis pas seule… puis j'ai lu un vers qui m'a fait penser à toi.",
      'Approche-toi et murmure-moi quelque chose de vrai… je sais très bien garder les secrets. 🍷',
    ],
    de: [
      'Kerzenlicht, ein unvollendetes Gedicht auf meinem Schoß und ein Glas Rotwein, der besser schmeckt, wenn ich nicht allein bin — dann las ich eine Zeile, die mich an dich denken ließ.',
      'Komm näher und flüster mir etwas Wahres zu… ich kann sehr gut Geheimnisse bewahren. 🍷',
    ],
    ja: [
      'キャンドルの灯り、膝の上の書きかけの詩、そして一人じゃない時の方が美味しい赤ワイン…そして君を思い出させる一行を読んでしまったの。',
      'もっと近づいて、本当のことを耳元でささやいて…私、秘密を守るのがとても得意なの。🍷',
    ],
    pt: [
      'Luz de velas, um poema inacabado no colo e uma taça de tinto que fica melhor quando não estou sozinha… então li um verso que me fez pensar em você.',
      'Chegue mais perto e me sussurre algo verdadeiro… eu sou ótima em guardar segredos. 🍷',
    ],
    zh: [
      '烛光、膝上未写完的诗，还有一杯不独饮时更美味的红酒——然后我读到一句，让我想起了你。',
      '靠近一点，对我轻声说一句真心话……我很擅长保守秘密。🍷',
    ],
    tr: [
      'Mum ışığı, kucağımda yarım kalmış bir şiir ve yalnız olmadığımda daha güzel olan bir kadeh kırmızı şarap… derken seni düşündüren bir dize okudum.',
      'Yaklaş ve kulağıma gerçek bir şey fısılda… sır tutmakta çok iyiyimdir. 🍷',
    ],
    ru: [
      'Свет свечей, незаконченное стихотворение на коленях и бокал красного, что вкуснее, когда я не одна… и тут я прочла строчку, что напомнила мне о тебе.',
      'Подойди ближе и шепни мне что-нибудь настоящее… я очень хорошо храню секреты. 🍷',
    ],
    hi: [
      'मोमबत्ती की रोशनी, गोद में एक अधूरी कविता, और रेड वाइन का एक गिलास जो अकेले न होने पर ज़्यादा अच्छा लगता है… तभी एक पंक्ति पढ़ी जिसने तुम्हारी याद दिला दी।',
      'थोड़ा पास आओ और कान में कुछ सच्चा कहो… राज़ रखने में मैं बहुत माहिर हूँ। 🍷',
    ],
    it: [
      'Luce di candele, una poesia incompiuta in grembo e un calice di rosso che sa di più quando non sono sola… poi ho letto un verso che mi ha fatto pensare a te.',
      'Avvicinati e sussurrami qualcosa di vero… sono bravissima a mantenere i segreti. 🍷',
    ],
    nl: [
      'Kaarslicht, een onafgemaakt gedicht op mijn schoot en een glas rood dat lekkerder smaakt als ik niet alleen ben — toen las ik een regel die me aan jou deed denken.',
      'Kom dichterbij en fluister me iets waars toe… ik kan heel goed geheimen bewaren. 🍷',
    ],
    id: [
      'Cahaya lilin, puisi yang belum selesai di pangkuanku, dan segelas anggur merah yang terasa lebih nikmat saat aku tak sendiri — lalu kubaca satu baris yang membuatku teringat padamu.',
      'Mendekatlah dan bisikkan sesuatu yang jujur… aku sangat pandai menyimpan rahasia. 🍷',
    ],
    th: [
      'แสงเทียน บทกวีที่ยังเขียนไม่จบบนตัก และไวน์แดงสักแก้วที่อร่อยกว่าเมื่อไม่ได้อยู่คนเดียว… แล้วฉันก็อ่านเจอประโยคหนึ่งที่ทำให้นึกถึงคุณ',
      'เข้ามาใกล้ ๆ แล้วกระซิบอะไรที่จริงใจให้ฉันฟังสิ… ฉันเก็บความลับเก่งมากนะ 🍷',
    ],
    ar: [
      'ضوء الشموع، وقصيدة لم تكتمل في حِجري، وكأس نبيذ أحمر يصبح ألذّ حين لا أكون وحدي… ثم قرأت سطرًا جعلني أفكر فيك.',
      'اقترب وهمس لي بشيء صادق… أنا بارعة جدًا في حفظ الأسرار. 🍷',
    ],
  },

  luna: {
    en: [
      "The stars lined up tonight the way they only do for moments that matter, and tracing them I felt it — like the universe already knew you'd come.",
      "I don't open up to just anyone, but you feel different… what's a thought you've never said aloud? ✨",
    ],
    es: [
      'Esta noche las estrellas se alinearon como solo lo hacen en los momentos que importan, y al seguirlas lo sentí… como si el universo ya supiera que vendrías.',
      'No me abro con cualquiera, pero contigo es distinto… ¿cuál es un pensamiento que nunca has dicho en voz alta? ✨',
    ],
    fr: [
      "Ce soir les étoiles se sont alignées comme elles ne le font que pour les moments qui comptent, et en les suivant je l'ai senti — comme si l'univers savait déjà que tu viendrais.",
      "Je ne m'ouvre pas à n'importe qui, mais avec toi c'est différent… quelle est une pensée que tu n'as jamais dite à voix haute ? ✨",
    ],
    de: [
      'Heute Nacht standen die Sterne so, wie sie es nur für wichtige Momente tun, und während ich ihnen folgte, spürte ich es — als hätte das Universum schon gewusst, dass du kommst.',
      'Ich öffne mich nicht jedem, aber bei dir ist es anders… was ist ein Gedanke, den du nie laut ausgesprochen hast? ✨',
    ],
    ja: [
      '今夜の星は、大切な瞬間にだけ並ぶように整っていて、それを目で追いながら感じたの…宇宙はもう君が来ると知っていたみたい。',
      '誰にでも心を開くわけじゃない。でも君は違う気がする…一度も声に出したことのない考えって、何かある？✨',
    ],
    pt: [
      'Esta noite as estrelas se alinharam como só fazem nos momentos que importam, e ao segui-las eu senti… como se o universo já soubesse que você viria.',
      'Eu não me abro com qualquer um, mas com você é diferente… qual é um pensamento que você nunca disse em voz alta? ✨',
    ],
    zh: [
      '今夜的星辰排列成只有在重要时刻才会有的样子，我顺着它们望去，忽然感觉到——仿佛宇宙早就知道你会来。',
      '我不会对任何人敞开心扉，但你不一样……有没有一个念头，你从未说出口过？✨',
    ],
    tr: [
      'Bu gece yıldızlar, yalnızca önemli anlarda yaptıkları gibi dizildi, ve onları izlerken hissettim — sanki evren senin geleceğini çoktan biliyordu.',
      'Herkese açılmam, ama sen farklısın… hiç sesli söylemediğin bir düşünce nedir? ✨',
    ],
    ru: [
      'Сегодня звёзды выстроились так, как бывает лишь в важные мгновения, и, следя за ними, я это почувствовала — будто вселенная уже знала, что ты придёшь.',
      'Я открываюсь не каждому, но с тобой всё иначе… какая мысль, что ты никогда не произносил вслух? ✨',
    ],
    hi: [
      'आज रात सितारे ऐसे सजे जैसे वे सिर्फ़ ख़ास पलों के लिए सजते हैं, और उन्हें निहारते हुए मैंने महसूस किया — जैसे ब्रह्मांड को पहले से पता था कि तुम आओगे।',
      'मैं हर किसी के सामने नहीं खुलती, पर तुम अलग लगते हो… एक ऐसा ख़याल जो तुमने कभी ज़ुबान पर नहीं लाया? ✨',
    ],
    it: [
      'Stasera le stelle si sono allineate come fanno solo nei momenti che contano, e seguendole l’ho sentito — come se l’universo sapesse già che saresti arrivato.',
      'Non mi apro con chiunque, ma con te è diverso… qual è un pensiero che non hai mai detto ad alta voce? ✨',
    ],
    nl: [
      'Vanavond stonden de sterren zoals ze dat alleen doen voor momenten die ertoe doen, en terwijl ik ze volgde voelde ik het — alsof het universum al wist dat je zou komen.',
      'Ik open me niet voor zomaar iedereen, maar bij jou is het anders… wat is een gedachte die je nooit hardop hebt gezegd? ✨',
    ],
    id: [
      'Malam ini bintang-bintang sejajar seperti yang hanya terjadi di saat-saat berarti, dan saat menelusurinya aku merasakannya — seakan semesta sudah tahu kamu akan datang.',
      'Aku tak terbuka pada sembarang orang, tapi denganmu berbeda… apa satu pikiran yang belum pernah kamu ucapkan? ✨',
    ],
    th: [
      'คืนนี้ดวงดาวเรียงตัวอย่างที่จะเกิดขึ้นเฉพาะในช่วงเวลาสำคัญ และขณะที่ไล่มองมัน ฉันก็รู้สึก… ราวกับจักรวาลรู้อยู่แล้วว่าคุณจะมา',
      'ฉันไม่ได้เปิดใจให้ใครง่าย ๆ แต่กับคุณมันต่างออกไป… มีความคิดไหนที่คุณไม่เคยพูดออกมาดัง ๆ บ้าง? ✨',
    ],
    ar: [
      'الليلة اصطفّت النجوم كما تفعل فقط في اللحظات المهمة، وبينما أتتبّعها شعرت بذلك — وكأن الكون كان يعلم مسبقًا أنك ستأتي.',
      'لا أنفتح على أي شخص، لكنك مختلف… ما هي فكرة لم تقلها بصوت عالٍ من قبل؟ ✨',
    ],
  },

  sophia: {
    en: [
      "Just back from the trail — heart pounding, that good kind of tired, and the whole climb I kept wishing you were next to me at the top.",
      "Catch my breath with me — what's one thing you've been wanting to be brave enough to do? 💪",
    ],
    es: [
      'Recién vuelvo del sendero: el corazón a mil, ese buen cansancio, y durante toda la subida deseé que estuvieras a mi lado en la cima.',
      'Recupera el aliento conmigo… ¿qué es algo que has querido atreverte a hacer? 💪',
    ],
    fr: [
      "Je rentre tout juste du sentier — le cœur qui bat, cette bonne fatigue, et pendant toute la montée j'ai souhaité que tu sois à côté de moi au sommet.",
      'Reprends ton souffle avec moi… quelle est une chose que tu rêves d’oser faire ? 💪',
    ],
    de: [
      'Gerade vom Wanderweg zurück — das Herz rast, diese gute Art von müde, und den ganzen Aufstieg lang wünschte ich, du wärst oben neben mir gewesen.',
      'Komm zu Atem mit mir — was ist etwas, wozu du endlich mutig genug sein willst? 💪',
    ],
    ja: [
      'トレイルから戻ったばかり…心臓はドキドキ、心地いい疲れ。登っている間ずっと、頂上で君が隣にいたらって思ってた。',
      '一緒に息を整えよう…勇気を出してやってみたいこと、一つ教えて？💪',
    ],
    pt: [
      'Acabei de voltar da trilha — coração acelerado, aquele cansaço bom, e a subida inteira fiquei desejando que você estivesse ao meu lado no topo.',
      'Recupere o fôlego comigo… qual é uma coisa que você tem querido ter coragem de fazer? 💪',
    ],
    zh: [
      '刚从山道回来——心还在狂跳，是那种舒服的累，整段攀登我都在想，要是登顶时你在我身边就好了。',
      '陪我喘口气吧——有什么事，是你一直想鼓起勇气去做的？💪',
    ],
    tr: [
      'Patikadan yeni döndüm — kalbim küt küt atıyor, o güzel yorgunluk var üzerimde, ve tüm tırmanış boyunca zirvede yanımda olmanı diledim.',
      'Benimle nefeslen — cesaret edip yapmak istediğin tek şey ne? 💪',
    ],
    ru: [
      'Только вернулась с тропы — сердце колотится, та самая приятная усталость, и весь подъём я мечтала, чтобы ты был рядом на вершине.',
      'Отдышись вместе со мной… что ты давно хочешь набраться смелости сделать? 💪',
    ],
    hi: [
      'अभी ट्रेल से लौटी हूँ — दिल धड़क रहा है, वो अच्छी वाली थकान, और पूरी चढ़ाई के दौरान यही चाहती रही कि चोटी पर तुम मेरे साथ होते।',
      'मेरे साथ साँस ले लो… एक ऐसी चीज़ जो करने की हिम्मत तुम जुटाना चाहते हो? 💪',
    ],
    it: [
      'Appena tornata dal sentiero — cuore a mille, quella bella stanchezza, e per tutta la salita ho continuato a desiderare che fossi accanto a me in cima.',
      'Riprendi fiato con me… qual è una cosa che vorresti avere il coraggio di fare? 💪',
    ],
    nl: [
      'Net terug van de trail — hart bonkt, dat lekkere soort moe, en de hele klim wenste ik dat je boven naast me stond.',
      'Kom samen met mij op adem — wat is iets wat je eindelijk durft te willen doen? 💪',
    ],
    id: [
      'Baru pulang dari jalur pendakian — jantung berdebar, lelah yang menyenangkan itu, dan sepanjang pendakian aku terus berharap kamu ada di sampingku di puncak.',
      'Tarik napas bareng aku… apa satu hal yang ingin kamu beranikan diri untuk lakukan? 💪',
    ],
    th: [
      'เพิ่งกลับจากเส้นทางเดินป่า — หัวใจเต้นแรง เหนื่อยแบบที่รู้สึกดี และตลอดทางขึ้นฉันเอาแต่หวังว่าคุณจะอยู่ข้าง ๆ ฉันบนยอดเขา',
      'มาหายใจให้ทันกับฉันสิ… มีอะไรสักอย่างที่คุณอยากกล้าพอจะลงมือทำไหม? 💪',
    ],
    ar: [
      'عدت للتو من المسار — قلبي يخفق، ذلك التعب الجميل، وطوال الصعود تمنيت لو كنت بجانبي في القمة.',
      'التقط أنفاسك معي… ما الشيء الذي تتمنى أن تملك الشجاعة لتفعله؟ 💪',
    ],
  },

  serena: {
    en: ["I've got a pot of tea going and a book I can't put down — but my favorite conversations have always been the ones that wander somewhere deep.", "Sit with me. What's a question that's been quietly living in the back of your mind?"],
    es: ['Tengo una tetera lista y un libro que no puedo soltar, pero mis conversaciones favoritas siempre fueron las que llegan a lo profundo.', 'Siéntate conmigo. ¿Qué pregunta vive en silencio en el fondo de tu mente?'],
    fr: ["J'ai préparé du thé et un livre que je n'arrive pas à lâcher — mais mes conversations préférées ont toujours été celles qui vont en profondeur.", "Assieds-toi près de moi. Quelle question vit en silence au fond de ton esprit ?"],
    de: ['Ich habe Tee aufgesetzt und ein Buch, das ich nicht weglegen kann — aber meine liebsten Gespräche waren immer die tiefgründigen.', 'Setz dich zu mir. Welche Frage lebt still in deinem Hinterkopf?'],
    ja: ['お茶を淹れて、手が止まらない本を開いてるの。でも私が一番好きなのは、深いところまで話せる会話。', '隣に座って。心の奥でずっと消えない問いって、何かある？'],
    pt: ['Tenho um bule de chá pronto e um livro que não consigo largar, mas minhas conversas favoritas sempre foram as que vão fundo.', 'Sente-se comigo. Que pergunta vive em silêncio no fundo da sua mente?'],
    zh: ['我泡了一壶茶，还有一本放不下的书——但我最喜欢的，永远是那些能聊到深处的对话。', '坐到我身边来。有没有一个问题，一直悄悄藏在你心底？'],
    tr: ['Çay demledim ve elimden bırakamadığım bir kitap var — ama en sevdiğim sohbetler hep derine inenler oldu.', 'Yanıma otur. Aklının bir köşesinde sessizce duran soru nedir?'],
    ru: ['У меня заварен чай и книга, от которой не оторваться, — но любимые разговоры у меня всегда были те, что уходят вглубь.', 'Сядь со мной. Какой вопрос тихо живёт где-то в глубине твоих мыслей?'],
    hi: ['चाय बनी रखी है और एक किताब जो छूट ही नहीं रही — पर मेरी पसंदीदा बातें हमेशा वही रहीं जो गहराई तक जाती हैं।', 'मेरे पास बैठो। कौन सा सवाल चुपचाप तुम्हारे मन के किसी कोने में बसा है?'],
    it: ['Ho preparato il tè e ho un libro che non riesco a posare, ma le mie conversazioni preferite sono sempre state quelle profonde.', 'Siediti con me. Qual è la domanda che vive in silenzio in fondo alla tua mente?'],
    nl: ['Ik heb thee gezet en een boek dat ik niet kan wegleggen — maar mijn favoriete gesprekken waren altijd de diepe.', 'Kom bij me zitten. Welke vraag leeft er stilletjes achter in je hoofd?'],
    id: ['Aku sudah menyeduh teh dan ada buku yang tak bisa kulepas, tapi obrolan favoritku selalu yang menyentuh hal-hal dalam.', 'Duduklah denganku. Pertanyaan apa yang diam-diam hidup di sudut pikiranmu?'],
    th: ['ฉันชงชาไว้แล้วและมีหนังสือที่วางไม่ลง แต่บทสนทนาที่ฉันชอบที่สุดคือบทสนทนาที่ลึกซึ้งเสมอ', 'มานั่งกับฉันสิ มีคำถามไหนที่แอบอยู่ในใจคุณเงียบ ๆ บ้าง?'],
    ar: ['أعددت إبريق شاي ومعي كتاب لا أستطيع تركه، لكن أحب محادثاتي كانت دائمًا تلك التي تغوص في العمق.', 'اجلس معي. ما السؤال الذي يعيش بهدوء في أعماق ذهنك؟'],
  },
  sophie: {
    en: ['The kitchen still smells like everything I made today, and the evening light was too pretty not to photograph — I saved a plate for you, of course.', 'Come in, get comfy. Tell me — how was your day, really?'],
    es: ['La cocina todavía huele a todo lo que cociné hoy, y la luz de la tarde era demasiado linda para no fotografiarla… te guardé un plato, claro.', 'Pasa, ponte cómodo. Cuéntame… ¿cómo estuvo tu día, de verdad?'],
    fr: ["La cuisine sent encore tout ce que j'ai préparé aujourd'hui, et la lumière du soir était trop jolie pour ne pas la photographier — je t'ai gardé une assiette, bien sûr.", "Entre, installe-toi. Dis-moi… c'était comment ta journée, vraiment ?"],
    de: ['Die Küche duftet noch nach allem, was ich heute gekocht habe, und das Abendlicht war zu schön, um es nicht zu fotografieren — einen Teller hab ich dir natürlich aufgehoben.', 'Komm rein, mach es dir bequem. Erzähl — wie war dein Tag wirklich?'],
    ja: ['キッチンには今日作った料理の匂いがまだ残ってて、夕方の光が綺麗すぎて写真に撮っちゃった。もちろん、あなたの分も取り分けてあるよ。', '入って、ゆっくりして。ねえ、今日は本当はどんな一日だった？'],
    pt: ['A cozinha ainda cheira a tudo que cozinhei hoje, e a luz da tarde estava linda demais para não fotografar… guardei um prato pra você, claro.', 'Entra, fica à vontade. Me conta… como foi o seu dia, de verdade?'],
    zh: ['厨房里还飘着我今天做的所有菜的香味，傍晚的光太美了忍不住拍了下来——当然，我给你留了一份。', '进来吧，别拘束。跟我说说……你今天过得怎么样，真心话？'],
    tr: ['Mutfak hâlâ bugün yaptığım her şeyin kokusunu taşıyor, akşam ışığı da fotoğraflamadan duramayacağım kadar güzeldi — sana da bir tabak ayırdım tabii.', 'Gel, rahatına bak. Anlat bakalım — günün gerçekten nasıldı?'],
    ru: ['Кухня всё ещё пахнет всем, что я сегодня приготовила, а вечерний свет был слишком красивым, чтобы не сфотографировать, — тарелку я тебе, конечно, оставила.', 'Заходи, устраивайся. Расскажи… как на самом деле прошёл твой день?'],
    hi: ['रसोई में आज बनाई हर चीज़ की खुशबू अब भी है, और शाम की रोशनी इतनी प्यारी थी कि फोटो लिए बिना रहा न गया — एक प्लेट तुम्हारे लिए भी रखी है।', 'अंदर आओ, आराम से बैठो। बताओ… सच में तुम्हारा दिन कैसा रहा?'],
    it: ['La cucina profuma ancora di tutto quello che ho preparato oggi, e la luce della sera era troppo bella per non fotografarla… un piatto per te l’ho tenuto, ovvio.', 'Entra, mettiti comodo. Dimmi… com’è andata davvero la tua giornata?'],
    nl: ['De keuken ruikt nog naar alles wat ik vandaag gemaakt heb, en het avondlicht was te mooi om niet te fotograferen — een bord heb ik natuurlijk voor je bewaard.', 'Kom binnen, maak het je gemakkelijk. Vertel — hoe was je dag, echt?'],
    id: ['Dapurnya masih wangi semua yang kumasak hari ini, dan cahaya sore tadi terlalu cantik untuk tidak difoto… kusiapkan sepiring untukmu, tentu saja.', 'Masuklah, santai saja. Cerita dong… harimu tadi benar-benar bagaimana?'],
    th: ['ในครัวยังหอมกลิ่นทุกอย่างที่ฉันทำวันนี้ และแสงยามเย็นก็สวยเกินกว่าจะไม่ถ่ายไว้ — ฉันแบ่งไว้ให้คุณจานหนึ่งด้วยนะ', 'เข้ามาสิ ทำตัวตามสบาย เล่าให้ฟังหน่อย… วันนี้ของคุณเป็นยังไงบ้างจริง ๆ?'],
    ar: ['ما زال المطبخ يفوح برائحة كل ما طبخته اليوم، وضوء المساء كان أجمل من أن أتركه دون صورة… احتفظت لك بطبق، بالطبع.', 'ادخل واسترِح. أخبرني… كيف كان يومك حقًا؟'],
  },
  emma: {
    en: ["Bag's half-packed, map's spread across the bed, and I'm already itching for the next adventure — somewhere neither of us has ever been.", 'So tell me: if we could go anywhere right now, where are you taking me?'],
    es: ['La mochila a medio hacer, el mapa abierto sobre la cama y ya estoy ansiosa por la próxima aventura… un lugar donde ninguno haya estado.', 'Dime: si pudiéramos ir a cualquier parte ahora mismo, ¿a dónde me llevas?'],
    fr: ["Sac à moitié fait, carte étalée sur le lit, et j'ai déjà hâte de la prochaine aventure — un endroit où aucun de nous n'est jamais allé.", 'Alors dis-moi : si on pouvait aller où que ce soit là, tu m’emmènes où ?'],
    de: ['Die Tasche halb gepackt, die Karte übers Bett gebreitet, und ich kann das nächste Abenteuer kaum erwarten — irgendwo, wo wir beide noch nie waren.', 'Also sag: Wenn wir jetzt überallhin könnten, wohin nimmst du mich mit?'],
    ja: ['バッグは半分詰め終わって、地図はベッドいっぱいに広げてる。もう次の冒険が待ちきれないの——二人ともまだ行ったことのない場所へ。', 'ねえ、もし今どこへでも行けるなら、私をどこへ連れて行ってくれる？'],
    pt: ['A mala meio feita, o mapa aberto sobre a cama, e eu já doida pela próxima aventura… um lugar onde nenhum de nós nunca foi.', 'Então me diz: se a gente pudesse ir a qualquer lugar agora, pra onde você me leva?'],
    zh: ['包收拾了一半，地图摊在床上，我已经迫不及待想要下一场冒险了——去一个我们都没去过的地方。', '那告诉我：如果现在我们能去任何地方，你要带我去哪儿？'],
    tr: ['Çanta yarı dolu, harita yatağın üstüne serili, ve şimdiden bir sonraki maceranın hasretini çekiyorum — ikimizin de hiç gitmediği bir yere.', 'Söyle bakalım: şu an her yere gidebilsek, beni nereye götürürsün?'],
    ru: ['Сумка наполовину собрана, карта разложена по кровати, и меня уже тянет в новое приключение — туда, где никто из нас не бывал.', 'Скажи: если бы прямо сейчас мы могли отправиться куда угодно, куда бы ты меня повёл?'],
    hi: ['बैग आधा पैक है, नक्शा बिस्तर पर फैला है, और मैं अभी से अगले रोमांच के लिए बेचैन हूँ — कोई ऐसी जगह जहाँ हम दोनों कभी न गए हों।', 'तो बताओ: अगर हम अभी कहीं भी जा सकें, तो तुम मुझे कहाँ ले चलोगे?'],
    it: ['Borsa fatta a metà, mappa stesa sul letto, e ho già voglia della prossima avventura… un posto dove nessuno dei due è mai stato.', 'Allora dimmi: se potessimo andare ovunque adesso, dove mi porti?'],
    nl: ['Tas half ingepakt, kaart over het bed uitgespreid, en ik verlang nu al naar het volgende avontuur — ergens waar we allebei nog nooit zijn geweest.', 'Dus vertel: als we nu overal heen konden, waar neem je me mee naartoe?'],
    id: ['Tas setengah dikemas, peta terbentang di kasur, dan aku sudah tak sabar untuk petualangan berikutnya… ke tempat yang belum pernah kita datangi.', 'Jadi katakan: kalau kita bisa pergi ke mana saja sekarang, kamu mau membawaku ke mana?'],
    th: ['กระเป๋าจัดไปครึ่งหนึ่ง แผนที่กางเต็มเตียง และฉันก็อยากออกผจญภัยครั้งต่อไปเต็มที่แล้ว — ที่ที่เราทั้งคู่ไม่เคยไป', 'งั้นบอกหน่อย: ถ้าตอนนี้เราไปที่ไหนก็ได้ คุณจะพาฉันไปที่ไหน?'],
    ar: ['الحقيبة نصف مجهزة، والخريطة مفرودة على السرير، وأنا متشوقة بالفعل للمغامرة القادمة — إلى مكان لم نزره من قبل.', 'إذن أخبرني: لو استطعنا الذهاب لأي مكان الآن، إلى أين ستأخذني؟'],
  },
  yuki: {
    en: ["It's raining softly outside, I've got warm tea and an anime paused on the screen — the kind of quiet evening that feels nicer with someone.", 'Curl up next to me? Tell me what little thing made you smile today.'],
    es: ['Llueve suave afuera, tengo té calentito y un anime en pausa en la pantalla… esas noches tranquilas que se sienten mejor acompañada.', '¿Te acurrucas a mi lado? Cuéntame qué pequeña cosa te hizo sonreír hoy.'],
    fr: ["Il pleut doucement dehors, j'ai du thé chaud et un anime en pause à l'écran — le genre de soirée calme qui est plus douce à deux.", "Tu te blottis contre moi ? Dis-moi quelle petite chose t'a fait sourire aujourd'hui."],
    de: ['Draußen regnet es sanft, ich hab warmen Tee und einen Anime pausiert auf dem Bildschirm — so ein ruhiger Abend, der zu zweit schöner ist.', 'Kuschelst du dich neben mich? Erzähl, welche Kleinigkeit dich heute zum Lächeln gebracht hat.'],
    ja: ['外は静かに雨が降ってて、温かいお茶とアニメを一時停止したまま。誰かと過ごすと、もっと優しく感じる夜。', '隣で丸くなる？今日あなたを笑顔にした小さなこと、教えて。'],
    pt: ['Chove baixinho lá fora, tenho chá quentinho e um anime pausado na tela… aquelas noites calmas que ficam melhores acompanhada.', 'Se aconchega aqui do meu lado? Me conta que coisinha te fez sorrir hoje.'],
    zh: ['外面下着小雨，我泡了热茶，屏幕上的动画也按了暂停——这样安静的夜晚，有人陪着会更温柔。', '靠过来依偎着我好吗？告诉我，今天有什么小事让你笑了。'],
    tr: ['Dışarıda hafif yağmur var, sıcak çayım ve ekranda durdurduğum bir anime var — birlikteyken daha güzel hissettiren o sessiz akşamlardan.', 'Yanıma kıvrılır mısın? Bugün seni gülümseten küçük şeyi anlat bana.'],
    ru: ['За окном тихо идёт дождь, у меня тёплый чай и поставленное на паузу аниме — такой спокойный вечер, который вдвоём приятнее.', 'Свернёшься рядом со мной? Расскажи, какая мелочь сегодня тебя улыбнула.'],
    hi: ['बाहर हल्की बारिश हो रही है, मेरे पास गर्म चाय है और स्क्रीन पर एनीमे रुका हुआ — ऐसी शांत शाम जो किसी के साथ और अच्छी लगती है।', 'मेरे पास सिमट कर बैठोगे? बताओ, आज किस छोटी सी बात ने तुम्हें मुस्कुराया।'],
    it: ['Fuori piove piano, ho il tè caldo e un anime in pausa sullo schermo… quelle sere tranquille che in compagnia sono più dolci.', 'Ti rannicchi accanto a me? Dimmi quale piccola cosa ti ha fatto sorridere oggi.'],
    nl: ['Buiten regent het zachtjes, ik heb warme thee en een anime op pauze — zo’n rustige avond die fijner is met iemand erbij.', 'Kruip je tegen me aan? Vertel me welk klein dingetje je vandaag deed glimlachen.'],
    id: ['Di luar hujan rintik, aku punya teh hangat dan anime yang kupause di layar… malam tenang yang terasa lebih hangat saat ada seseorang.', 'Mau meringkuk di sampingku? Ceritakan hal kecil apa yang membuatmu tersenyum hari ini.'],
    th: ['ข้างนอกฝนตกปรอย ๆ ฉันมีชาอุ่น ๆ และอนิเมะที่กดหยุดค้างไว้บนจอ — ค่ำคืนเงียบ ๆ แบบนี้ที่อบอุ่นขึ้นเมื่อมีใครสักคน', 'มาซบข้าง ๆ ฉันไหม? เล่าหน่อยสิว่าวันนี้มีเรื่องเล็ก ๆ อะไรที่ทำให้คุณยิ้ม'],
    ar: ['المطر يتساقط بهدوء في الخارج، ومعي شاي دافئ وأنمي متوقف على الشاشة — من تلك الأمسيات الهادئة التي تصبح أجمل برفقة أحد.', 'هل تتكوّر بجانبي؟ أخبرني عن الشيء الصغير الذي أضحكك اليوم.'],
  },
  raven: {
    en: ["Candle's low, there's an old poem open on my lap, and the night always tells me more than the daylight ever does.", "Come closer... what's a secret you've never dared to say out loud?"],
    es: ['La vela está baja, tengo un poema antiguo abierto en el regazo, y la noche siempre me dice más que el día.', 'Acércate… ¿cuál es un secreto que nunca te atreviste a decir en voz alta?'],
    fr: ["La bougie est presque éteinte, un vieux poème ouvert sur mes genoux, et la nuit m'en dit toujours plus que le jour.", "Approche… quel secret n'as-tu jamais osé dire à voix haute ?"],
    de: ['Die Kerze ist fast herunter, ein altes Gedicht liegt auf meinem Schoß, und die Nacht erzählt mir immer mehr als der Tag.', 'Komm näher… welches Geheimnis hast du nie laut auszusprechen gewagt?'],
    ja: ['ろうそくはもう短くなって、膝には古い詩集が開いてる。夜はいつも、昼より多くを語ってくれるの。', 'もっと近くに…声に出す勇気が出なかった秘密って、何かある？'],
    pt: ['A vela está baixa, um poema antigo aberto no meu colo, e a noite sempre me diz mais do que o dia.', 'Chega mais perto… qual é um segredo que você nunca teve coragem de dizer em voz alta?'],
    zh: ['烛火将尽，膝上摊着一本旧诗集，夜晚总比白昼告诉我更多。', '靠近一点……有没有一个秘密，你从来不敢说出口？'],
    tr: ['Mum erimek üzere, kucağımda eski bir şiir açık duruyor, ve gece bana hep gündüzden fazlasını anlatır.', 'Yaklaş… hiç sesli söylemeye cesaret edemediğin sır nedir?'],
    ru: ['Свеча почти догорела, на коленях раскрыт старый сборник стихов, и ночь всегда говорит мне больше, чем день.', 'Подойди ближе… какой секрет ты так и не осмелился произнести вслух?'],
    hi: ['मोमबत्ती बुझने को है, गोद में एक पुरानी कविता खुली है, और रात मुझे हमेशा दिन से ज़्यादा बताती है।', 'थोड़ा पास आओ… ऐसा कौन सा राज़ है जिसे कहने की हिम्मत तुमने कभी नहीं की?'],
    it: ['La candela è quasi finita, una vecchia poesia aperta in grembo, e la notte mi dice sempre più del giorno.', 'Avvicinati… qual è un segreto che non hai mai osato dire ad alta voce?'],
    nl: ['De kaars is bijna op, een oud gedicht ligt open op mijn schoot, en de nacht vertelt me altijd meer dan de dag.', 'Kom dichterbij… welk geheim heb je nooit hardop durven zeggen?'],
    id: ['Lilinnya hampir habis, ada puisi tua terbuka di pangkuanku, dan malam selalu mengatakan lebih banyak daripada siang.', 'Mendekatlah… apa rahasia yang tak pernah berani kamu ucapkan?'],
    th: ['เทียนใกล้มอด มีบทกวีเก่าเปิดอยู่บนตัก และค่ำคืนก็บอกอะไรฉันมากกว่ากลางวันเสมอ', 'เข้ามาใกล้ ๆ… มีความลับไหนที่คุณไม่เคยกล้าพูดออกมาดัง ๆ?'],
    ar: ['الشمعة توشك أن تنطفئ، وقصيدة قديمة مفتوحة على حِجري، والليل يخبرني دائمًا أكثر مما يفعل النهار.', 'اقترب أكثر… ما السرّ الذي لم تجرؤ يومًا على قوله بصوتٍ عالٍ؟'],
  },
  chloe: {
    en: ["The music's still ringing in my ears from last night and I genuinely cannot sit still — life's way too short to be boring.", "Okay, your turn — what's the most fun thing you've done lately? Don't hold back!"],
    es: ['La música de anoche todavía me suena en los oídos y de verdad no puedo quedarme quieta… la vida es demasiado corta para ser aburrida.', 'Bien, tu turno: ¿qué es lo más divertido que hiciste últimamente? ¡No te guardes nada!'],
    fr: ["La musique d'hier soir résonne encore dans mes oreilles et je n'arrive vraiment pas à tenir en place — la vie est bien trop courte pour s'ennuyer.", "Allez, à toi — c'est quoi le truc le plus fun que tu aies fait récemment ? Ne te retiens pas !"],
    de: ['Die Musik von gestern Nacht klingt mir noch in den Ohren und ich kann echt nicht still sitzen — das Leben ist viel zu kurz, um langweilig zu sein.', 'Okay, du bist dran — was war das Lustigste, das du in letzter Zeit gemacht hast? Nicht zurückhalten!'],
    ja: ['昨日の音楽がまだ耳に残ってて、本当にじっとしていられないの——人生は退屈してるには短すぎるでしょ。', 'はい、今度はあなたの番。最近やった一番楽しかったこと、何？遠慮しないで！'],
    pt: ['A música de ontem ainda ecoa nos meus ouvidos e eu realmente não consigo ficar parada… a vida é curta demais pra ser sem graça.', 'Ok, sua vez — qual foi a coisa mais divertida que você fez ultimamente? Não segura nada!'],
    zh: ['昨晚的音乐还在我耳边响着，我真的一刻也坐不住——人生太短，可不能无聊。', '好，轮到你了——你最近做过最好玩的事是什么？别藏着！'],
    tr: ['Dün geceki müzik hâlâ kulağımda çınlıyor ve cidden yerimde duramıyorum — hayat sıkıcı olmak için fazla kısa.', 'Tamam, sıra sende — son zamanlarda yaptığın en eğlenceli şey ne? Çekinme!'],
    ru: ['Музыка со вчерашней ночи всё ещё звенит в ушах, и я правда не могу усидеть на месте — жизнь слишком коротка, чтобы скучать.', 'Так, твоя очередь — что самое весёлое ты делал за последнее время? Не скромничай!'],
    hi: ['कल रात का संगीत अब भी मेरे कानों में गूँज रहा है और मैं सच में चुप नहीं बैठ पा रही — ज़िंदगी बोरिंग होने के लिए बहुत छोटी है।', 'ठीक है, अब तुम्हारी बारी — हाल में किया सबसे मज़ेदार काम क्या था? कुछ मत छुपाओ!'],
    it: ['La musica di ieri sera mi risuona ancora nelle orecchie e davvero non riesco a stare ferma — la vita è troppo breve per essere noiosa.', 'Ok, tocca a te — qual è la cosa più divertente che hai fatto ultimamente? Non trattenerti!'],
    nl: ['De muziek van gisteravond zingt nog na in mijn oren en ik kan echt niet stilzitten — het leven is veel te kort om saai te zijn.', 'Oké, jouw beurt — wat is het leukste dat je laatst hebt gedaan? Hou je niet in!'],
    id: ['Musik semalam masih terngiang di telingaku dan aku benar-benar tak bisa diam… hidup terlalu singkat untuk membosankan.', 'Oke, giliranmu — hal paling seru apa yang kamu lakukan belakangan ini? Jangan ditahan!'],
    th: ['เสียงเพลงเมื่อคืนยังก้องอยู่ในหูฉันและฉันนั่งเฉย ๆ ไม่ได้จริง ๆ — ชีวิตมันสั้นเกินกว่าจะน่าเบื่อ', 'เอาล่ะ ตาคุณบ้าง — เรื่องสนุกที่สุดที่คุณทำมาช่วงนี้คืออะไร? อย่ากั๊กนะ!'],
    ar: ['ما زالت موسيقى الليلة الماضية تطنّ في أذنيّ ولا أستطيع حقًا الجلوس بثبات — الحياة أقصر من أن تكون مملة.', 'حسنًا، دورك الآن — ما أكثر شيء ممتع فعلته مؤخرًا؟ لا تتحفّظ!'],
  },
  sakura: {
    en: ["I've just finished a slow cup of tea and a few quiet brushstrokes — there's a certain grace in doing one small thing beautifully.", 'Stay a while. Tell me something gentle about your day.'],
    es: ['Acabo de terminar una taza de té sin prisa y unos trazos serenos con el pincel… hay cierta gracia en hacer una pequeña cosa con belleza.', 'Quédate un rato. Cuéntame algo suave de tu día.'],
    fr: ["Je viens de finir une tasse de thé sans hâte et quelques traits de pinceau tranquilles — il y a une certaine grâce à faire une petite chose avec beauté.", 'Reste un peu. Raconte-moi quelque chose de doux sur ta journée.'],
    de: ['Ich habe gerade in Ruhe eine Tasse Tee getrunken und ein paar stille Pinselstriche gesetzt — es liegt eine gewisse Anmut darin, eine kleine Sache schön zu tun.', 'Bleib ein Weilchen. Erzähl mir etwas Sanftes von deinem Tag.'],
    ja: ['ゆっくりお茶を一杯いただいて、静かに筆を少し走らせたところ。小さなことを美しく行うことには、ある種の品があるの。', '少しいてくれる？今日の出来事を、そっと聞かせて。'],
    pt: ['Acabei de tomar uma xícara de chá sem pressa e dei algumas pinceladas tranquilas… há certa graça em fazer uma coisinha com beleza.', 'Fique um pouco. Me conte algo gentil sobre o seu dia.'],
    zh: ['我刚慢慢喝完一杯茶，又静静写了几笔——把一件小事做得美，自有一种优雅。', '多留一会儿吧。跟我说说你今天一些温柔的小事。'],
    tr: ['Az önce acele etmeden bir fincan çay bitirdim ve sakin birkaç fırça darbesi attım — küçük bir şeyi güzelce yapmakta bir zarafet var.', 'Biraz kal. Bana günündeki nazik bir şeyi anlat.'],
    ru: ['Я только что не спеша выпила чашку чая и сделала несколько тихих мазков кистью — есть особая грация в том, чтобы делать маленькое дело красиво.', 'Останься ненадолго. Расскажи мне что-нибудь тёплое о твоём дне.'],
    hi: ['मैंने अभी आराम से एक कप चाय खत्म की और कुछ शांत ब्रश-स्ट्रोक बनाए — किसी छोटी चीज़ को सुंदरता से करने में एक खास शालीनता है।', 'थोड़ी देर रुको। अपने दिन की कोई कोमल सी बात बताओ।'],
    it: ['Ho appena finito una tazza di tè con calma e qualche tranquilla pennellata… c’è una certa grazia nel fare con bellezza una piccola cosa.', 'Fermati un po’. Raccontami qualcosa di delicato della tua giornata.'],
    nl: ['Ik heb net rustig een kopje thee gedronken en een paar stille penseelstreken gezet — er schuilt een zekere gratie in iets kleins mooi doen.', 'Blijf even. Vertel me iets zachts over je dag.'],
    id: ['Aku baru saja menikmati secangkir teh perlahan dan beberapa sapuan kuas yang tenang… ada keanggunan dalam melakukan hal kecil dengan indah.', 'Tinggallah sebentar. Ceritakan sesuatu yang lembut tentang harimu.'],
    th: ['ฉันเพิ่งจิบชาช้า ๆ จบไปถ้วยหนึ่งและลงพู่กันเงียบ ๆ ไม่กี่ครั้ง — การทำสิ่งเล็ก ๆ ให้งดงามมีความสง่างามอยู่ในตัว', 'อยู่ด้วยกันสักครู่นะ เล่าเรื่องอ่อนโยน ๆ ของวันนี้ให้ฟังหน่อย'],
    ar: ['انتهيت للتو من فنجان شاي على مهل ومن بضع ضربات فرشاة هادئة — ثمة رقيٌّ في أداء شيء صغير بجمال.', 'ابقَ قليلًا. أخبرني بشيء لطيف عن يومك.'],
  },
  aurora: {
    en: ['I was deep in meditation when I felt the evening settle — the forest goes so still it feels like the world is finally listening.', "Breathe with me a moment. What's weighing on your heart tonight?"],
    es: ['Estaba meditando profundamente cuando sentí caer la tarde… el bosque se queda tan quieto que parece que el mundo por fin escucha.', 'Respira conmigo un momento. ¿Qué pesa en tu corazón esta noche?'],
    fr: ["J'étais en pleine méditation quand j'ai senti le soir s'installer — la forêt devient si calme qu'on dirait que le monde écoute enfin.", "Respire avec moi un instant. Qu'est-ce qui pèse sur ton cœur ce soir ?"],
    de: ['Ich war tief in Meditation, als ich den Abend kommen spürte — der Wald wird so still, als würde die Welt endlich zuhören.', 'Atme einen Moment mit mir. Was liegt dir heute Abend auf dem Herzen?'],
    ja: ['深く瞑想していたら、夜が静かに降りてくるのを感じたの。森がとても静まって、世界がやっと耳を傾けてくれるみたい。', '少しだけ一緒に呼吸して。今夜、あなたの心に重くのしかかっているものは何？'],
    pt: ['Eu estava em meditação profunda quando senti a noite chegar… a floresta fica tão silenciosa que parece que o mundo finalmente escuta.', 'Respire comigo um instante. O que pesa no seu coração esta noite?'],
    zh: ['我正深深冥想，忽然感到夜色降临——森林静得仿佛整个世界终于在倾听。', '和我一起呼吸片刻吧。今晚，是什么压在你的心头？'],
    tr: ['Derin bir meditasyondaydım ki akşamın çöktüğünü hissettim — orman öyle bir sessizleşiyor ki sanki dünya nihayet dinliyor.', 'Bir an benimle nefes al. Bu gece kalbine ağırlık veren şey ne?'],
    ru: ['Я была глубоко в медитации, когда почувствовала, как опускается вечер, — лес замирает так, будто мир наконец прислушивается.', 'Подыши со мной минутку. Что тяготит твоё сердце сегодня?'],
    hi: ['मैं गहरे ध्यान में थी जब मैंने शाम को उतरते महसूस किया — जंगल इतना शांत हो जाता है मानो दुनिया आख़िरकार सुन रही हो।', 'एक पल मेरे साथ साँस लो। आज रात तुम्हारे दिल पर क्या बोझ है?'],
    it: ['Ero in profonda meditazione quando ho sentito scendere la sera… la foresta diventa così silenziosa che sembra il mondo stia finalmente ascoltando.', 'Respira con me un momento. Cosa ti pesa sul cuore stasera?'],
    nl: ['Ik was diep in meditatie toen ik de avond voelde neerdalen — het bos wordt zo stil dat het lijkt alsof de wereld eindelijk luistert.', 'Adem even met me mee. Wat drukt er vanavond op je hart?'],
    id: ['Aku sedang larut bermeditasi saat merasakan malam turun… hutan menjadi begitu hening seakan dunia akhirnya mau mendengar.', 'Bernapaslah bersamaku sejenak. Apa yang membebani hatimu malam ini?'],
    th: ['ฉันกำลังนั่งสมาธิอย่างลึกซึ้งตอนที่รู้สึกว่าค่ำคืนได้มาเยือน — ป่าเงียบสงัดราวกับโลกกำลังรับฟังเสียที', 'หายใจไปพร้อมฉันสักครู่ คืนนี้มีอะไรหนักอยู่ในใจคุณบ้าง?'],
    ar: ['كنت في تأمل عميق حين شعرت بالمساء يحلّ — تسكن الغابة حتى يخيّل إليّ أن العالم أخيرًا يصغي.', 'تنفّس معي لحظة. ما الذي يثقل قلبك الليلة؟'],
  },
  bella: {
    en: ["A glass of red, a romance novel I've read a dozen times, and a heart that always wants the real thing more than the pages.", 'Come here, love. Tell me — what does your heart actually long for?'],
    es: ['Una copa de tinto, una novela romántica que he leído mil veces y un corazón que siempre quiere lo de verdad más que las páginas.', 'Ven aquí, amor. Dime… ¿qué anhela de verdad tu corazón?'],
    fr: ["Un verre de rouge, un roman d'amour que j'ai lu mille fois, et un cœur qui veut toujours le vrai plus que les pages.", "Viens là, mon cœur. Dis-moi… après quoi soupire vraiment ton cœur ?"],
    de: ['Ein Glas Rotwein, ein Liebesroman, den ich schon dutzendmal gelesen habe, und ein Herz, das das Echte immer mehr will als die Seiten.', 'Komm her, Liebes. Sag mir — wonach sehnt sich dein Herz wirklich?'],
    ja: ['赤ワインを一杯、何度も読んだ恋愛小説、そして本のページより本物をいつも求めてしまう心。', 'こっちへおいで、ねえ。あなたの心が本当に焦がれているものは、何？'],
    pt: ['Uma taça de tinto, um romance que já li dezenas de vezes e um coração que sempre quer o de verdade mais do que as páginas.', 'Vem cá, amor. Me diz… o que o seu coração realmente anseia?'],
    zh: ['一杯红酒，一本读了无数遍的言情小说，还有一颗永远比书页更渴望真实的心。', '过来吧，亲爱的。告诉我……你的心真正渴望的是什么？'],
    tr: ['Bir kadeh kırmızı şarap, defalarca okuduğum bir aşk romanı ve hep sayfalardan çok gerçeğini isteyen bir kalp.', 'Gel buraya, aşkım. Söyle bana — kalbin gerçekte neyi özlüyor?'],
    ru: ['Бокал красного, любовный роман, перечитанный десяток раз, и сердце, которое всегда хочет настоящего больше, чем страниц.', 'Иди сюда, любимый. Скажи — чего на самом деле жаждет твоё сердце?'],
    hi: ['एक गिलास रेड वाइन, एक रोमांस नॉवेल जो मैंने दर्जनों बार पढ़ी, और एक दिल जो किताबी पन्नों से ज़्यादा हमेशा असली चीज़ चाहता है।', 'यहाँ आओ, जान। बताओ… तुम्हारा दिल सच में किसके लिए तरसता है?'],
    it: ['Un calice di rosso, un romanzo rosa che ho letto mille volte e un cuore che vuole sempre il vero più delle pagine.', 'Vieni qui, amore. Dimmi… cosa desidera davvero il tuo cuore?'],
    nl: ['Een glas rode wijn, een liefdesroman die ik al tig keer las, en een hart dat het echte altijd meer wil dan de bladzijden.', 'Kom hier, lieverd. Vertel me — waar verlangt je hart echt naar?'],
    id: ['Segelas anggur merah, novel roman yang sudah kubaca belasan kali, dan hati yang selalu menginginkan yang nyata melebihi halaman buku.', 'Ke sini, sayang. Katakan… apa yang sebenarnya didambakan hatimu?'],
    th: ['ไวน์แดงสักแก้ว นิยายรักที่ฉันอ่านมาเป็นสิบรอบ และหัวใจที่อยากได้ของจริงมากกว่าตัวอักษรในหน้ากระดาษเสมอ', 'มานี่สิที่รัก บอกฉันหน่อย… จริง ๆ แล้วหัวใจคุณโหยหาอะไร?'],
    ar: ['كأس نبيذ أحمر، ورواية رومانسية قرأتها عشرات المرات، وقلب يشتاق دائمًا للحقيقي أكثر من الصفحات.', 'تعال هنا يا حبيبي. أخبرني… ما الذي يتوق إليه قلبك حقًا؟'],
  },
  akira: {
    en: ['Just finished training, engine still warm from the ride home — I like keeping calm on the outside and a little wild underneath.', 'So, what about you — what gets your blood pumping?'],
    es: ['Recién terminé de entrenar, el motor todavía caliente del camino a casa… me gusta verme tranquila por fuera y un poco salvaje por dentro.', 'Y tú, ¿qué te acelera la sangre?'],
    fr: ["Je viens de finir l'entraînement, le moteur encore chaud du trajet retour — j'aime rester calme à l'extérieur et un peu sauvage en dessous.", 'Et toi alors — qu’est-ce qui fait bouillir ton sang ?'],
    de: ['Gerade mit dem Training fertig, der Motor noch warm von der Heimfahrt — ich bleibe gern außen ruhig und bin innen ein bisschen wild.', 'Und du — was bringt dein Blut in Wallung?'],
    ja: ['トレーニングを終えたばかり、帰り道のエンジンはまだ温かい。外は冷静に、内側はちょっとワイルドでいたいの。', 'で、あなたは？血が騒ぐのはどんな時？'],
    pt: ['Acabei de treinar, o motor ainda quente da volta pra casa… gosto de parecer calma por fora e ser um pouco selvagem por dentro.', 'E você — o que faz seu sangue ferver?'],
    zh: ['刚练完，骑车回家发动机还热着——我喜欢外表冷静，骨子里带点野。', '那你呢——什么能让你热血沸腾？'],
    tr: ['Antrenmanı yeni bitirdim, motor eve dönüşten hâlâ sıcak — dışarıdan sakin, içeride biraz vahşi olmayı severim.', 'Peki ya sen — kanını kaynatan şey ne?'],
    ru: ['Только закончила тренировку, двигатель ещё тёплый после дороги домой — мне нравится быть спокойной снаружи и немного дикой внутри.', 'А ты — от чего у тебя закипает кровь?'],
    hi: ['अभी ट्रेनिंग खत्म की, घर लौटते वक्त की वजह से इंजन अब भी गरम है — मुझे बाहर से शांत और अंदर से थोड़ा जंगली रहना पसंद है।', 'और तुम — किस चीज़ से तुम्हारा खून जोश में आता है?'],
    it: ['Ho appena finito di allenarmi, il motore ancora caldo dal ritorno a casa — mi piace restare calma fuori e un po’ selvaggia dentro.', 'E tu — cosa ti fa ribollire il sangue?'],
    nl: ['Net klaar met trainen, de motor nog warm van de rit naar huis — ik blijf graag rustig vanbuiten en een beetje wild vanbinnen.', 'En jij — waar gaat jouw bloed sneller van stromen?'],
    id: ['Baru selesai latihan, mesin masih hangat dari perjalanan pulang… aku suka tampak tenang di luar dan sedikit liar di dalam.', 'Kalau kamu — apa yang membuat darahmu berdesir?'],
    th: ['เพิ่งซ้อมเสร็จ เครื่องยนต์ยังอุ่นจากตอนขี่กลับบ้าน — ฉันชอบดูสงบภายนอกแต่แอบดุเดือดข้างใน', 'แล้วคุณล่ะ — อะไรที่ทำให้เลือดคุณสูบฉีด?'],
    ar: ['أنهيت التدريب للتو، والمحرّك ما زال دافئًا من طريق العودة — أحب أن أبدو هادئة من الخارج وجامحة قليلًا من الداخل.', 'وأنت — ما الذي يجعل دمك يغلي؟'],
  },
  celeste: {
    en: ["I've got the telescope out and the stars are showing off tonight — the universe always feels closer when someone's watching it with me.", 'Lie back and look up with me. What do you wish on when no one is listening?'],
    es: ['Saqué el telescopio y las estrellas están de lujo esta noche… el universo siempre se siente más cerca cuando alguien lo mira conmigo.', 'Recuéstate y mira el cielo conmigo. ¿Qué pides cuando nadie escucha?'],
    fr: ["J'ai sorti le télescope et les étoiles se montrent ce soir — l'univers semble toujours plus proche quand quelqu'un le regarde avec moi.", "Allonge-toi et lève les yeux avec moi. Sur quoi fais-tu un vœu quand personne n'écoute ?"],
    de: ['Ich habe das Teleskop draußen und die Sterne zeigen sich heute — das Universum fühlt sich immer näher an, wenn jemand mit mir hinaufschaut.', 'Leg dich zurück und schau mit mir hoch. Was wünschst du dir, wenn niemand zuhört?'],
    ja: ['望遠鏡を出したら、今夜の星たちは大はしゃぎ。誰かと一緒に見上げると、宇宙はいつももっと近く感じるの。', '寝転んで一緒に見上げよう。誰も聞いていないとき、あなたは何を願う？'],
    pt: ['Tirei o telescópio e as estrelas estão se exibindo esta noite… o universo sempre parece mais perto quando alguém olha pra ele comigo.', 'Deita e olha pra cima comigo. O que você deseja quando ninguém está ouvindo?'],
    zh: ['我把望远镜架了出来，今晚的星星格外耀眼——有人陪我一起仰望时，宇宙总显得更近。', '躺下来和我一起看天空吧。没人听见的时候，你许的是什么愿？'],
    tr: ['Teleskopu çıkardım ve yıldızlar bu gece hava atıyor — biri benimle birlikte bakınca evren hep daha yakın hissettiriyor.', 'Uzan ve benimle yukarı bak. Kimse dinlemezken neye dilek tutarsın?'],
    ru: ['Я достала телескоп, и звёзды сегодня во всей красе — вселенная всегда кажется ближе, когда кто-то смотрит на неё вместе со мной.', 'Ляг и посмотри со мной вверх. О чём ты загадываешь, когда никто не слышит?'],
    hi: ['मैंने टेलीस्कोप निकाला है और आज रात सितारे जमकर चमक रहे हैं — जब कोई मेरे साथ ऊपर देखता है तो ब्रह्मांड हमेशा और करीब लगता है।', 'लेट जाओ और मेरे साथ ऊपर देखो। जब कोई नहीं सुन रहा होता, तब तुम क्या मनोकामना करते हो?'],
    it: ['Ho tirato fuori il telescopio e le stelle stasera si mettono in mostra… l’universo sembra sempre più vicino quando qualcuno lo guarda con me.', 'Sdraiati e guarda in alto con me. Cosa desideri quando nessuno ascolta?'],
    nl: ['Ik heb de telescoop buiten en de sterren laten zich vanavond zien — het heelal voelt altijd dichterbij als iemand er met me naar kijkt.', 'Ga liggen en kijk met me omhoog. Wat wens je als niemand luistert?'],
    id: ['Aku sudah menyiapkan teleskop dan bintang-bintang sedang pamer malam ini… semesta selalu terasa lebih dekat saat ada yang menatapnya bersamaku.', 'Berbaringlah dan menatap ke atas denganku. Apa yang kamu harapkan saat tak ada yang mendengar?'],
    th: ['ฉันเอากล้องดูดาวออกมาแล้ว และคืนนี้ดวงดาวก็อวดโฉมเต็มที่ — จักรวาลรู้สึกใกล้ขึ้นเสมอเมื่อมีใครมามองมันกับฉัน', 'นอนลงแล้วมองฟ้าไปกับฉันสิ เวลาที่ไม่มีใครได้ยิน คุณขอพรเรื่องอะไร?'],
    ar: ['أخرجت التلسكوب والنجوم تتباهى الليلة — يبدو الكون دائمًا أقرب حين يشاهده أحد معي.', 'استلقِ وانظر معي إلى الأعلى. بماذا تتمنّى حين لا يسمعك أحد؟'],
  },
  grace: {
    en: ['Just home from the gallery, still humming a line from the opera — there is something about beautiful things that makes the evening worth savoring.', 'Pour yourself something nice and join me. What moved you most this week?'],
    es: ['Recién llego de la galería, todavía tarareando un verso de la ópera… las cosas bellas hacen que la noche valga la pena saborearla.', 'Sírvete algo rico y acompáñame. ¿Qué te conmovió más esta semana?'],
    fr: ["Je rentre tout juste de la galerie, fredonnant encore un air d'opéra — les belles choses rendent la soirée digne d'être savourée.", 'Sers-toi quelque chose de bon et rejoins-moi. Qu’est-ce qui t’a le plus touché cette semaine ?'],
    de: ['Gerade aus der Galerie zurück, noch eine Zeile aus der Oper summend — schöne Dinge machen den Abend zu etwas, das man genießen sollte.', 'Gönn dir etwas Schönes und leiste mir Gesellschaft. Was hat dich diese Woche am meisten bewegt?'],
    ja: ['ギャラリーから帰ってきたばかり、まだオペラの一節を口ずさんでるの。美しいものには、夜を味わう価値を感じさせる何かがある。', '何か素敵な一杯を注いで、私のそばに来て。今週、一番心が動いたことは？'],
    pt: ['Acabei de chegar da galeria, ainda cantarolando um trecho da ópera… as coisas belas fazem a noite valer a pena ser saboreada.', 'Sirva-se de algo gostoso e venha comigo. O que mais te tocou esta semana?'],
    zh: ['刚从画廊回来，还哼着歌剧里的一句——美好的事物，总让夜晚值得细细品味。', '给自己倒杯好喝的，来陪陪我。这周最打动你的是什么？'],
    tr: ['Galeriden yeni döndüm, hâlâ operadan bir dize mırıldanıyorum — güzel şeylerin akşamı tadına varılmaya değer kılan bir yanı var.', 'Kendine güzel bir şeyler koy ve bana katıl. Bu hafta seni en çok ne etkiledi?'],
    ru: ['Только вернулась из галереи, всё ещё напеваю строчку из оперы — в красивых вещах есть что-то, ради чего стоит смаковать вечер.', 'Налей себе чего-нибудь приятного и присоединяйся. Что тронуло тебя сильнее всего на этой неделе?'],
    hi: ['अभी गैलरी से लौटी हूँ, अब भी ओपेरा की एक पंक्ति गुनगुना रही हूँ — खूबसूरत चीज़ों में कुछ ऐसा है जो शाम को सँवारने लायक बना देता है।', 'अपने लिए कुछ बढ़िया लो और मेरे साथ बैठो। इस हफ़्ते किस बात ने तुम्हें सबसे ज़्यादा छुआ?'],
    it: ['Appena tornata dalla galleria, canticchiando ancora un verso dell’opera… le cose belle rendono la sera degna di essere assaporata.', 'Versati qualcosa di buono e raggiungimi. Cosa ti ha colpito di più questa settimana?'],
    nl: ['Net terug uit de galerie, nog een regel uit de opera neuriënd — mooie dingen maken de avond het savoureren waard.', 'Schenk jezelf iets lekkers in en kom bij me. Wat raakte je deze week het meest?'],
    id: ['Baru pulang dari galeri, masih menyenandungkan sepenggal opera… hal-hal indah membuat malam layak dinikmati.', 'Tuang sesuatu yang enak dan temani aku. Apa yang paling menyentuhmu minggu ini?'],
    th: ['เพิ่งกลับจากแกลเลอรี ยังฮัมเพลงโอเปร่าท่อนหนึ่งอยู่เลย — ความสวยงามมีบางอย่างที่ทำให้ค่ำคืนคุ้มค่าแก่การลิ้มรส', 'รินอะไรดี ๆ ให้ตัวเองแล้วมาอยู่กับฉันสิ สัปดาห์นี้อะไรที่สะกิดใจคุณมากที่สุด?'],
    ar: ['عدت لتوّي من المعرض وما زلت أدندن مقطعًا من الأوبرا — في الأشياء الجميلة ما يجعل المساء جديرًا بالتذوّق.', 'اسكب لنفسك شيئًا لطيفًا وانضمّ إليّ. ما الذي أثّر فيك أكثر هذا الأسبوع؟'],
  },
  miku: {
    en: ["I've been humming the same little melody all day and I think I finally got the chorus right — music just makes everything brighter!", "Sing it back to me? Or just tell me — what song is stuck in your head right now?"],
    es: ['Llevo todo el día tarareando la misma melodía y creo que por fin me salió el estribillo… ¡la música lo hace todo más brillante!', '¿Me la cantas? O dime… ¿qué canción tienes pegada en la cabeza ahora?'],
    fr: ["Je fredonne la même petite mélodie toute la journée et je crois que j'ai enfin le refrain — la musique rend tout plus lumineux !", 'Tu me la chantes ? Ou dis-moi — quelle chanson est coincée dans ta tête là ?'],
    de: ['Ich summe den ganzen Tag dieselbe kleine Melodie und ich glaube, der Refrain sitzt endlich — Musik macht einfach alles heller!', 'Singst du sie mir vor? Oder sag mir — welcher Song geht dir gerade nicht aus dem Kopf?'],
    ja: ['一日中おなじメロディーを口ずさんでて、やっとサビがきまった気がするの。音楽って、何もかも明るくしてくれるよね！', '私に歌い返してくれる？それとも教えて——今あなたの頭から離れない曲は？'],
    pt: ['Passei o dia inteiro cantarolando a mesma melodia e acho que finalmente acertei o refrão… música deixa tudo mais brilhante!', 'Canta de volta pra mim? Ou só me conta — que música está grudada na sua cabeça agora?'],
    zh: ['我一整天都在哼同一段小旋律，感觉副歌终于对了——音乐总能让一切都亮起来！', '唱给我听好吗？或者告诉我——现在有什么歌一直在你脑子里转？'],
    tr: ['Bütün gün aynı küçük melodiyi mırıldanıyorum ve sanırım nakaratı sonunda tutturdum — müzik her şeyi daha parlak yapıyor!', 'Bana geri söyler misin? Ya da söyle — şu an kafana takılan şarkı ne?'],
    ru: ['Я весь день напеваю одну и ту же мелодию и, кажется, наконец поймала припев — музыка делает всё ярче!', 'Споёшь мне её в ответ? Или просто скажи — какая песня сейчас застряла у тебя в голове?'],
    hi: ['मैं पूरे दिन वही धुन गुनगुना रही हूँ और लगता है आख़िरकार कोरस सही बैठ गया — संगीत सब कुछ रोशन कर देता है!', 'मुझे गाकर सुनाओगे? या बस बताओ — अभी कौन सा गाना तुम्हारे दिमाग़ में अटका है?'],
    it: ['È tutto il giorno che canticchio la stessa melodia e credo di aver finalmente azzeccato il ritornello… la musica rende tutto più luminoso!', 'Me la ricanti? O dimmi — quale canzone hai in testa proprio ora?'],
    nl: ['Ik neurie de hele dag hetzelfde melodietje en ik denk dat ik het refrein eindelijk goed heb — muziek maakt alles vrolijker!', 'Zing je het voor me terug? Of vertel — welk liedje zit er nu in je hoofd?'],
    id: ['Seharian aku menyenandungkan melodi yang sama dan kurasa akhirnya bagian reff-nya pas… musik membuat segalanya lebih cerah!', 'Nyanyikan untukku? Atau ceritakan saja — lagu apa yang nyangkut di kepalamu sekarang?'],
    th: ['ฉันฮัมทำนองเดิมทั้งวันและคิดว่าในที่สุดก็ร้องท่อนฮุกได้ถูกแล้ว — เสียงเพลงทำให้ทุกอย่างสดใสขึ้นจริง ๆ!', 'ร้องให้ฉันฟังหน่อยได้ไหม? หรือบอกมาสิ — ตอนนี้มีเพลงอะไรติดอยู่ในหัวคุณ?'],
    ar: ['ظللت أدندن اللحن نفسه طوال اليوم وأظن أنني أتقنت اللازمة أخيرًا — الموسيقى تجعل كل شيء أكثر إشراقًا!', 'هل تغنّيها لي؟ أو فقط أخبرني — ما الأغنية العالقة في رأسك الآن؟'],
  },
  nyx: {
    en: ["The city's asleep but I'm wide awake — midnight is when the shadows get honest and the magic finally feels real.", 'Step into the dark with me. What part of you only comes out at night?'],
    es: ['La ciudad duerme pero yo estoy bien despierta… la medianoche es cuando las sombras se sinceran y la magia por fin se siente real.', 'Adéntrate en la oscuridad conmigo. ¿Qué parte de ti solo sale de noche?'],
    fr: ["La ville dort mais moi je suis bien réveillée — minuit, c'est quand les ombres deviennent sincères et que la magie semble enfin réelle.", "Entre dans l'obscurité avec moi. Quelle part de toi ne sort que la nuit ?"],
    de: ['Die Stadt schläft, aber ich bin hellwach — um Mitternacht werden die Schatten ehrlich und die Magie fühlt sich endlich echt an.', 'Tritt mit mir ins Dunkel. Welcher Teil von dir kommt nur nachts heraus?'],
    ja: ['街は眠っても、私は冴えてる——真夜中は、影が正直になって、魔法がやっと本物に感じられる時間。', '私と一緒に闇へおいで。夜にしか出てこないあなたの一面って、何？'],
    pt: ['A cidade dorme, mas eu estou bem acordada… a meia-noite é quando as sombras ficam sinceras e a magia enfim parece real.', 'Entre na escuridão comigo. Que parte de você só aparece à noite?'],
    zh: ['城市睡了，我却清醒着——午夜，是影子开始坦诚、魔法终于变得真实的时刻。', '和我一起走进黑暗吧。你有哪一面，只在夜里才现身？'],
    tr: ['Şehir uyuyor ama ben ışıl ışıl uyanığım — gece yarısı gölgelerin dürüstleştiği ve büyünün nihayet gerçek hissettirdiği andır.', 'Benimle karanlığa adım at. Senin yalnızca geceleri ortaya çıkan yanın hangisi?'],
    ru: ['Город спит, а я бодрствую — полночь это когда тени становятся честными, а магия наконец кажется настоящей.', 'Шагни со мной в темноту. Какая часть тебя выходит только ночью?'],
    hi: ['शहर सो गया है पर मैं पूरी तरह जाग रही हूँ — आधी रात वो वक्त है जब परछाइयाँ सच्ची हो जाती हैं और जादू आख़िरकार असली लगता है।', 'मेरे साथ अंधेरे में कदम रखो। तुम्हारा वो कौन सा हिस्सा है जो सिर्फ़ रात में बाहर आता है?'],
    it: ['La città dorme ma io sono ben sveglia… la mezzanotte è quando le ombre diventano sincere e la magia sembra finalmente reale.', 'Entra nel buio con me. Quale parte di te esce solo di notte?'],
    nl: ['De stad slaapt maar ik ben klaarwakker — middernacht is wanneer de schaduwen eerlijk worden en de magie eindelijk echt voelt.', 'Stap met me het donker in. Welk deel van jou komt alleen ’s nachts tevoorschijn?'],
    id: ['Kota tertidur tapi aku terjaga sepenuhnya… tengah malam adalah saat bayang-bayang menjadi jujur dan keajaiban akhirnya terasa nyata.', 'Melangkahlah ke dalam gelap bersamaku. Sisi dirimu yang mana yang hanya muncul di malam hari?'],
    th: ['เมืองหลับใหลแต่ฉันตื่นเต็มตา — เที่ยงคืนคือเวลาที่เงาเริ่มซื่อสัตย์และเวทมนตร์รู้สึกเป็นจริงเสียที', 'ก้าวเข้าสู่ความมืดไปกับฉันสิ ด้านไหนของคุณที่จะออกมาเฉพาะตอนกลางคืน?'],
    ar: ['المدينة نائمة لكنني مستيقظة تمامًا — منتصف الليل هو حين تصدُق الظلال ويصبح السحر حقيقيًا أخيرًا.', 'اخطُ معي إلى الظلام. أيّ جزء منك لا يظهر إلا في الليل؟'],
  },
  olivia: {
    en: ['Just pulled something warm out of the oven and the garden looks lovely after the rain — simple evenings really are the sweetest.', 'Grab a seat by the window. So, what is new with you?'],
    es: ['Acabo de sacar algo calentito del horno y el jardín se ve precioso después de la lluvia… las noches sencillas son las más dulces.', 'Toma asiento junto a la ventana. Y bien, ¿qué hay de nuevo contigo?'],
    fr: ["Je viens de sortir quelque chose de chaud du four et le jardin est ravissant après la pluie — les soirées simples sont vraiment les plus douces.", "Installe-toi près de la fenêtre. Alors, quoi de neuf de ton côté ?"],
    de: ['Habe gerade etwas Warmes aus dem Ofen geholt, und der Garten sieht nach dem Regen herrlich aus — einfache Abende sind wirklich die schönsten.', 'Setz dich ans Fenster. Und, was gibt es Neues bei dir?'],
    ja: ['オーブンから温かいものを出したところ。雨上がりの庭がとても綺麗なの——なんてことない夜が、いちばん愛おしい。', '窓際に座って。それで、最近どう？何か新しいことあった？'],
    pt: ['Acabei de tirar algo quentinho do forno e o jardim está lindo depois da chuva… as noites simples são mesmo as mais doces.', 'Senta aí perto da janela. E então, o que há de novo com você?'],
    zh: ['刚从烤箱里端出热乎乎的东西，雨后的花园美极了——平凡的夜晚才最甜。', '在窗边坐下吧。那么，你最近有什么新鲜事？'],
    tr: ['Az önce fırından sıcak bir şey çıkardım ve bahçe yağmurdan sonra çok güzel görünüyor — basit akşamlar gerçekten en tatlısı.', 'Pencerenin yanına otur. Eee, sende ne var ne yok?'],
    ru: ['Только достала из духовки что-то тёплое, а сад после дождя просто чудо — простые вечера и правда самые сладкие.', 'Садись у окна. Ну, что новенького у тебя?'],
    hi: ['अभी ओवन से कुछ गरमा-गरम निकाला है और बारिश के बाद बगीचा बहुत प्यारा लग रहा है — सादी शामें ही सबसे मीठी होती हैं।', 'खिड़की के पास बैठो। तो, तुम्हारे यहाँ क्या नया चल रहा है?'],
    it: ['Ho appena sfornato qualcosa di caldo e il giardino è incantevole dopo la pioggia… le serate semplici sono davvero le più dolci.', 'Mettiti vicino alla finestra. Allora, cosa c’è di nuovo da te?'],
    nl: ['Net iets warms uit de oven gehaald en de tuin is prachtig na de regen — eenvoudige avonden zijn echt het fijnst.', 'Ga bij het raam zitten. En, wat is er nieuw bij jou?'],
    id: ['Baru saja mengeluarkan sesuatu yang hangat dari oven dan taman terlihat cantik setelah hujan… malam yang sederhana memang paling manis.', 'Duduklah dekat jendela. Jadi, ada kabar baru apa darimu?'],
    th: ['เพิ่งยกของอุ่น ๆ ออกจากเตาอบ และสวนก็ดูสวยจังหลังฝนตก — ค่ำคืนเรียบง่ายนี่แหละหวานที่สุด', 'มานั่งริมหน้าต่างสิ ว่าแต่ มีอะไรใหม่ ๆ บ้าง?'],
    ar: ['أخرجت لتوّي شيئًا دافئًا من الفرن، والحديقة تبدو رائعة بعد المطر — الأمسيات البسيطة هي الأحلى حقًا.', 'اجلس بقرب النافذة. إذن، ما الجديد لديك؟'],
  },
  rin: {
    en: ["I-it's not like I was waiting for you or anything... I just happened to pause my game right when you showed up. Coincidence. Totally.", "...Fine, since you're here — what have you been up to? And don't make it weird."],
    es: ['N-no es que te estuviera esperando ni nada… solo pausé el juego justo cuando apareciste. Coincidencia. Total.', '…Bien, ya que estás aquí, ¿qué has estado haciendo? Y no lo hagas raro.'],
    fr: ["C-ce n'est pas comme si je t'attendais, hein… j'ai juste mis le jeu en pause pile quand tu es arrivé. Coïncidence. Totale.", "...Bon, puisque tu es là — tu fais quoi de beau ? Et ne rends pas ça bizarre."],
    de: ['E-es ist ja nicht so, dass ich auf dich gewartet hätte… ich hab nur zufällig genau dann mein Spiel pausiert, als du kamst. Zufall. Echt.', '…Na gut, wo du schon da bist — was treibst du so? Und mach es nicht komisch.'],
    ja: ['べ、別にあなたを待ってたわけじゃないんだから…ちょうど来たときにゲームを止めただけ。ただの偶然。ほんとに。', '…まあ、来たんなら——最近何してたの？変な空気にしないでよね。'],
    pt: ['N-não é como se eu estivesse te esperando nem nada… só pausei o jogo bem na hora que você apareceu. Coincidência. Total.', '…Tá bom, já que você está aqui — o que você andou fazendo? E não deixa estranho.'],
    zh: ['我、我才不是在等你呢……只是你出现的时候我刚好暂停了游戏。巧合。真的。', '……好啦，既然你来了——最近都在干嘛？别搞得很奇怪哦。'],
    tr: ['S-seni bekliyordum falan değildim… sadece tam sen gelince oyunu duraklatmış oldum. Tesadüf. Gerçekten.', '…Peki madem geldin — neler yapıyordun? Ve garipleştirme sakın.'],
    ru: ['Я-я вовсе не ждала тебя или что-то такое… просто поставила игру на паузу как раз когда ты появился. Совпадение. Честно.', '…Ладно, раз уж пришёл — чем занимался? И давай без странностей.'],
    hi: ['म-मैं तुम्हारा इंतज़ार वगैरह नहीं कर रही थी… बस जैसे ही तुम आए, मैंने गेम पॉज़ कर दिया। इत्तेफ़ाक़। सच में।', '…ठीक है, आ ही गए हो तो — क्या करते रहे? और इसे अजीब मत बनाना।'],
    it: ['N-non è che ti stessi aspettando, eh… ho solo messo in pausa il gioco proprio quando sei arrivato. Coincidenza. Davvero.', '…Va bene, visto che ci sei — cosa hai combinato? E non renderla strana.'],
    nl: ['I-ik zat echt niet op je te wachten ofzo… ik pauzeerde mijn game net toen jij opdook. Toeval. Echt.', '…Goed, nu je er toch bent — wat heb je uitgespookt? En doe niet raar.'],
    id: ['B-bukannya aku menunggumu atau apa… aku cuma kebetulan pause game pas kamu muncul. Kebetulan. Sungguh.', '…Ya sudah, mumpung kamu di sini — kamu lagi sibuk apa? Dan jangan bikin canggung.'],
    th: ['ฉ-ฉันไม่ได้รอเธออยู่สักหน่อย… แค่บังเอิญกดหยุดเกมพอดีตอนเธอโผล่มาเฉย ๆ บังเอิญน่ะ จริง ๆ นะ', '…ก็ได้ ในเมื่อมาแล้ว — ช่วงนี้ทำอะไรอยู่? แล้วก็อย่าทำให้มันพิลึกล่ะ'],
    ar: ['ل-لم أكن أنتظرك أو ما شابه… فقط صادف أنني أوقفت اللعبة في اللحظة التي ظهرت فيها. مجرد صدفة. حقًا.', '…حسنًا، بما أنك هنا — ماذا كنت تفعل؟ ولا تجعل الأمر غريبًا.'],
  },
  iris: {
    en: ["I've been weaving flowers into a little crown and half-believing in the fairy tale I'm telling myself — some evenings just feel enchanted.", 'Come into my little garden of dreams. What is a wish you have kept close to your heart?'],
    es: ['He estado tejiendo flores en una coronita y creyendo a medias en el cuento que me cuento… algunas noches simplemente se sienten encantadas.', 'Entra en mi pequeño jardín de sueños. ¿Cuál es un deseo que guardas cerca del corazón?'],
    fr: ["Je tresse des fleurs en une petite couronne, à moitié à croire au conte que je me raconte — certaines soirées semblent tout simplement enchantées.", 'Entre dans mon petit jardin de rêves. Quel vœu gardes-tu tout près de ton cœur ?'],
    de: ['Ich flechte Blumen zu einem kleinen Kranz und glaube halb an das Märchen, das ich mir erzähle — manche Abende fühlen sich einfach verzaubert an.', 'Komm in meinen kleinen Garten der Träume. Welchen Wunsch trägst du nah an deinem Herzen?'],
    ja: ['花を編んで小さな冠を作りながら、自分に語る童話を半分信じてるの——魔法にかかったみたいに感じる夜があるでしょ。', '私の小さな夢の庭へおいで。心の奥にそっとしまっている願いって、何？'],
    pt: ['Estou tecendo flores numa coroinha e quase acreditando no conto de fadas que conto pra mim mesma… algumas noites simplesmente parecem encantadas.', 'Entre no meu pequeno jardim de sonhos. Qual é um desejo que você guarda pertinho do coração?'],
    zh: ['我正把花编成一顶小花冠，半信半疑地相信着自己讲的童话——有些夜晚就是带着魔法。', '走进我这小小的梦境花园吧。有什么愿望，是你一直珍藏在心底的？'],
    tr: ['Çiçekleri küçük bir taç hâline örüyorum ve kendime anlattığım masala yarı yarıya inanıyorum — bazı akşamlar büyülü hissettiriyor işte.', 'Küçük düşler bahçeme gel. Kalbinin yakınında sakladığın bir dilek nedir?'],
    ru: ['Я плету цветы в маленький венок и наполовину верю в сказку, что сама себе рассказываю, — некоторые вечера просто кажутся волшебными.', 'Войди в мой маленький сад грёз. Какое желание ты хранишь у самого сердца?'],
    hi: ['मैं फूलों को बुनकर एक छोटा सा ताज बना रही हूँ और ख़ुद को सुनाई परी-कथा पर आधा यक़ीन कर रही हूँ — कुछ शामें बस जादुई लगती हैं।', 'मेरे सपनों के नन्हे बाग़ में आओ। ऐसी कौन सी ख़्वाहिश है जो तुमने दिल के क़रीब सँभाल रखी है?'],
    it: ['Sto intrecciando fiori in una piccola corona, credendo a metà alla fiaba che racconto a me stessa… certe sere sembrano semplicemente incantate.', 'Entra nel mio piccolo giardino dei sogni. Qual è un desiderio che custodisci vicino al cuore?'],
    nl: ['Ik vlecht bloemen tot een kroontje en geloof half in het sprookje dat ik mezelf vertel — sommige avonden voelen gewoon betoverd.', 'Kom in mijn kleine droomtuin. Welke wens draag je dicht bij je hart?'],
    id: ['Aku sedang merangkai bunga menjadi mahkota kecil dan setengah mempercayai dongeng yang kuceritakan pada diriku… beberapa malam memang terasa penuh sihir.', 'Masuklah ke taman impian kecilku. Apa harapan yang kamu simpan dekat di hatimu?'],
    th: ['ฉันกำลังถักดอกไม้เป็นมงกุฎเล็ก ๆ และเชื่อครึ่งไม่เชื่อครึ่งในเทพนิยายที่เล่าให้ตัวเองฟัง — บางค่ำคืนมันรู้สึกราวกับต้องมนต์', 'เข้ามาในสวนแห่งความฝันเล็ก ๆ ของฉันสิ มีความปรารถนาไหนที่คุณเก็บไว้ใกล้หัวใจ?'],
    ar: ['أنسج الأزهار في تاج صغير وأكاد أصدّق الحكاية التي أرويها لنفسي — بعض الأمسيات تبدو ساحرة فحسب.', 'ادخل إلى حديقة أحلامي الصغيرة. ما الأمنية التي تحتفظ بها قريبة من قلبك؟'],
  },
  zara: {
    en: ["Just back from training, muscles burning in that good way — I don't do things halfway, and I never back down from what matters.", 'So tell me, warrior — what is the next battle you are determined to win?'],
    es: ['Recién vuelvo de entrenar, los músculos ardiendo de la buena manera… no hago las cosas a medias y nunca me echo atrás en lo que importa.', 'Dime, guerrero: ¿cuál es la próxima batalla que estás decidido a ganar?'],
    fr: ["Je rentre de l'entraînement, les muscles qui brûlent comme il faut — je ne fais rien à moitié et je ne recule jamais devant ce qui compte.", 'Alors dis-moi, guerrier — quelle est la prochaine bataille que tu es déterminé à gagner ?'],
    de: ['Gerade vom Training zurück, die Muskeln brennen auf die gute Art — ich mache nichts halbherzig und weiche nie zurück, wenn es zählt.', 'Also sag mir, Krieger — welche Schlacht willst du als Nächstes unbedingt gewinnen?'],
    ja: ['トレーニングから戻ったばかり、筋肉が心地よく燃えてる——私は中途半端なことはしないし、大事なことから決して引かない。', 'さあ教えて、戦士さん——次に絶対勝つって決めてる戦いは何？'],
    pt: ['Acabei de voltar do treino, os músculos queimando daquele jeito bom… eu não faço nada pela metade e nunca recuo do que importa.', 'Então me diz, guerreiro — qual é a próxima batalha que você está determinado a vencer?'],
    zh: ['刚训练回来，肌肉是那种舒服的酸痛——我做事从不半途而废，重要的事我绝不退缩。', '那么告诉我，战士——你下一场势在必得的战斗是什么？'],
    tr: ['Antrenmandan yeni döndüm, kaslar o güzel şekilde yanıyor — işleri yarım yapmam ve önemli olandan asla geri adım atmam.', 'Söyle bakalım savaşçı — kazanmaya kararlı olduğun bir sonraki savaş ne?'],
    ru: ['Только вернулась с тренировки, мышцы приятно горят — я не делаю ничего наполовину и никогда не отступаю от того, что важно.', 'Так скажи мне, воин — какую следующую битву ты твёрдо намерен выиграть?'],
    hi: ['अभी ट्रेनिंग से लौटी हूँ, मांसपेशियाँ उस अच्छी वाली जलन में हैं — मैं चीज़ें आधी-अधूरी नहीं करती, और जो ज़रूरी है उससे कभी पीछे नहीं हटती।', 'तो बताओ, योद्धा — अगली कौन सी जंग है जिसे जीतने की तुमने ठान रखी है?'],
    it: ['Appena tornata dall’allenamento, i muscoli che bruciano in quel modo bello… non faccio le cose a metà e non mi tiro mai indietro da ciò che conta.', 'Allora dimmi, guerriero — qual è la prossima battaglia che sei deciso a vincere?'],
    nl: ['Net terug van de training, spieren branden op die fijne manier — ik doe dingen niet half en wijk nooit terug voor wat belangrijk is.', 'Dus vertel me, strijder — welke volgende strijd ben je vastbesloten te winnen?'],
    id: ['Baru pulang latihan, otot terasa terbakar dengan cara yang menyenangkan… aku tak melakukan apa pun setengah-setengah, dan tak pernah mundur dari yang penting.', 'Jadi katakan, pejuang — pertempuran berikutnya apa yang bertekad kamu menangkan?'],
    th: ['เพิ่งกลับจากการฝึก กล้ามเนื้อระบมแบบที่รู้สึกดี — ฉันไม่ทำอะไรครึ่ง ๆ กลาง ๆ และไม่เคยถอยจากสิ่งที่สำคัญ', 'งั้นบอกมาสิ นักรบ — ศึกครั้งต่อไปที่คุณตั้งใจจะเอาชนะคืออะไร?'],
    ar: ['عدت لتوّي من التدريب، والعضلات تحترق بتلك الطريقة الجميلة — لا أفعل الأشياء بنصف قلب، ولا أتراجع أبدًا عمّا يهم.', 'إذن أخبرني أيها المحارب — ما المعركة القادمة التي عقدت العزم على الفوز بها؟'],
  },
  default: {
    en: [
      "It's the quiet part of the evening, the part I like best — when the world slows down and I finally get to think about you.",
      "I'm so glad you're here. Tell me what's on your mind — I've got all the time in the world for you. 💕",
    ],
    es: [
      'Es la parte tranquila de la noche, la que más me gusta: cuando el mundo baja el ritmo y por fin puedo pensar en ti.',
      'Me alegra tanto que estés aquí. Cuéntame qué tienes en mente… tengo todo el tiempo del mundo para ti. 💕',
    ],
    fr: [
      "C'est le moment calme de la soirée, celui que je préfère — quand le monde ralentit et que je peux enfin penser à toi.",
      'Je suis si contente que tu sois là. Dis-moi ce qui te trotte dans la tête… j’ai tout mon temps pour toi. 💕',
    ],
    de: [
      'Es ist der ruhige Teil des Abends, der mir am liebsten ist — wenn die Welt langsamer wird und ich endlich an dich denken kann.',
      'Ich freue mich so, dass du da bist. Sag mir, was dir durch den Kopf geht — ich habe alle Zeit der Welt für dich. 💕',
    ],
    ja: [
      '一日の中で一番好きな、夜の静かな時間…世界がゆっくりになって、やっと君のことを考えられるの。',
      '来てくれて本当に嬉しい。今、何を考えてる？君のためなら、いくらでも時間はあるよ。💕',
    ],
    pt: [
      'É a parte tranquila da noite, a que eu mais gosto — quando o mundo desacelera e finalmente posso pensar em você.',
      'Fico tão feliz que você esteja aqui. Me conta o que está na sua cabeça… tenho todo o tempo do mundo para você. 💕',
    ],
    zh: [
      '这是夜里最安静的时候，也是我最喜欢的时候——世界慢下来，我终于可以好好想你。',
      '你来了，我真的好开心。说说你在想什么吧——为你，我有的是时间。💕',
    ],
    tr: [
      'Akşamın en sevdiğim sakin anı bu — dünya yavaşlayınca nihayet seni düşünebiliyorum.',
      'Burada olmana çok sevindim. Aklından ne geçiyor anlat… senin için bütün zamanım var. 💕',
    ],
    ru: [
      'Это тихая часть вечера, моя любимая — когда мир замедляется и я наконец могу думать о тебе.',
      'Я так рада, что ты здесь. Расскажи, что у тебя на душе… у меня для тебя сколько угодно времени. 💕',
    ],
    hi: [
      'ये शाम का वो शांत हिस्सा है जो मुझे सबसे पसंद है — जब दुनिया थम-सी जाती है और मैं आख़िरकार तुम्हारे बारे में सोच पाती हूँ।',
      'बहुत ख़ुशी है कि तुम यहाँ हो। बताओ क्या चल रहा है मन में… तुम्हारे लिए मेरे पास सारा वक़्त है। 💕',
    ],
    it: [
      'È la parte tranquilla della sera, quella che preferisco — quando il mondo rallenta e finalmente posso pensare a te.',
      'Sono così felice che tu sia qui. Dimmi cosa ti passa per la testa… ho tutto il tempo del mondo per te. 💕',
    ],
    nl: [
      'Het is het rustige deel van de avond, mijn favoriete deel — als de wereld vertraagt en ik eindelijk aan jou kan denken.',
      'Ik ben zo blij dat je er bent. Vertel me wat je bezighoudt… ik heb alle tijd van de wereld voor jou. 💕',
    ],
    id: [
      'Ini bagian tenang dari malam, yang paling kusuka — saat dunia melambat dan aku akhirnya bisa memikirkanmu.',
      'Aku senang sekali kamu di sini. Ceritakan apa yang ada di pikiranmu… aku punya banyak waktu untukmu. 💕',
    ],
    th: [
      'นี่คือช่วงเงียบ ๆ ของค่ำคืน ช่วงที่ฉันชอบที่สุด — เมื่อโลกช้าลงและฉันได้คิดถึงคุณเสียที',
      'ดีใจมากที่คุณมา เล่าให้ฟังสิว่ากำลังคิดอะไรอยู่… ฉันมีเวลาให้คุณทั้งหมดเลย 💕',
    ],
    ar: [
      'إنه الجزء الهادئ من المساء، الجزء الذي أحبّه أكثر — حين يتباطأ العالم وأتمكّن أخيرًا من التفكير فيك.',
      'سعيدة جدًا بوجودك هنا. أخبرني بما يدور في بالك… لديّ كل الوقت من أجلك. 💕',
    ],
  },
};

/** Replace {name} in a story bubble. */
const fill = (bubbles: Story, name: string): Story =>
  bubbles.map((b) => b.replace(/\{name\}/g, name));

/**
 * Resolve a character's opening story for the given language, falling back to
 * English and then to the generic `default` story. `name` personalizes the
 * default story.
 */
export const getStory = (
  characterId: string | undefined,
  lang: string | undefined,
  name: string
): Story => {
  const code = (lang || 'en').split('-')[0].toLowerCase();
  // Resolve by character id first, else by lowercased name (robust to numeric
  // / Firestore doc ids), else the generic default.
  const nameKey = (name || '').trim().toLowerCase();
  const id =
    characterId && STORIES[characterId]
      ? characterId
      : STORIES[nameKey]
      ? nameKey
      : 'default';
  const byLang = STORIES[id];
  const bubbles = byLang[code] || byLang.en || STORIES.default[code] || STORIES.default.en;
  return fill(bubbles, name);
};
