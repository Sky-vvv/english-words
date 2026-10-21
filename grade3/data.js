// 景菲 · 三年级上册 Unit 2 家人（根据 2026-10 单元练习的错题整理）
// g = 同一类（例如 father 和 dad 是同一个人），出干扰项时不会把同类放在一起
var WORDS=[
 {w:"grandpa",e:"👴",c:"爷爷 / 外公",s:"This is my grandpa.",g:"grandpa"},
 {w:"grandma",e:"👵",c:"奶奶 / 外婆",s:"This is my grandma.",g:"grandma"},
 {w:"father",e:"👨",c:"爸爸",s:"This is my father.",g:"dad"},
 {w:"dad",e:"👨",c:"爸爸（口语）",s:"I love my dad.",g:"dad"},
 {w:"mother",e:"👩",c:"妈妈",s:"This is my mother.",g:"mum"},
 {w:"mum",e:"👩",c:"妈妈（口语）",s:"I love my mum.",g:"mum"},
 {w:"brother",e:"👦",c:"哥哥 / 弟弟",s:"Is this your brother?",g:"brother"},
 {w:"sister",e:"👧",c:"姐姐 / 妹妹",s:"This is my sister.",g:"sister"},
 {w:"uncle",e:"🧔",c:"叔叔 / 舅舅",s:"This is my uncle.",g:"uncle"},
 {w:"aunt",e:"👩‍🦰",c:"阿姨 / 姑姑",s:"She's my father's sister. She's my aunt.",g:"aunt"},
 {w:"cousin",e:"🧒",c:"堂/表兄弟姐妹",s:"No, it's my cousin.",g:"cousin"},
 {w:"baby",e:"👶",c:"婴儿，小宝宝",s:"Look at the baby.",g:"baby"},
 {w:"me",e:"🙋‍♀️",c:"我",s:"My father, my mother and me.",g:"me"},
 {w:"family",e:"👨‍👩‍👧‍👦",c:"家，家人",s:"I love my family.",g:"family"},
 {w:"grandfather",e:"👴",c:"祖父；爷爷 / 外公",s:"grandfather",g:"grandpa",np:1},{w:"grandmother",e:"👵",c:"祖母；奶奶 / 外婆",s:"grandmother",g:"grandma",np:1},
 {w:"have",e:"🤲",c:"有",s:"I have two cousins.",g:"have",np:1},{w:"big",e:"🐘",c:"大的",s:"My family is big.",g:"big",np:1},{w:"small",e:"🐜",c:"小的",s:"My family is small.",g:"small",np:1}
];
var ACTS=[
 {w:"share",e:"🍪",c:"分享",s:"We share.",g:"share"},
 {w:"help",e:"🤝",c:"帮助",s:"He helps.",g:"help"},
 {w:"smile",e:"😊",c:"微笑",s:"We smile at home.",g:"smile"},
 {w:"play",e:"⚽",c:"玩",s:"We play together.",g:"play"},
 {w:"listen",e:"👂",c:"听",s:"I listen to Grandma.",g:"listen"}
];
// 听句子选图：sentence -> 对应的词（WORDS/ACTS 里的 w）
var LSENT=[
 ["This is my grandpa.","grandpa"],["This is my grandma.","grandma"],["This is my father.","father"],
 ["This is my mother.","mother"],["Is this your brother?","brother"],["Look at my sister.","sister"],
 ["This is my uncle.","uncle"],["She's my aunt.","aunt"],["No, it's my cousin.","cousin"],
 ["Look at the baby.","baby"],["I love my family.","family"],
 ["Grandma shares the cake with me.","share"],["Father helps me.","help"],["My sister smiles at me.","smile"],
 ["We play together.","play"],["Grandpa listens to me.","listen"]
];
// 首字母：试卷上错的 h/g/f、f-i-sh、e-lephant 都在里面
var PHON=[
 {w:"good",e:"👍"},{w:"fish",e:"🐟"},{w:"girl",e:"👧"},{w:"hot",e:"🥵"},{w:"elephant",e:"🐘"},
 {w:"hat",e:"👒"},{w:"bag",e:"👜"},{w:"egg",e:"🥚"},{w:"pig",e:"🐷"},{w:"nest",e:"🪺"},
 {w:"bee",e:"🐝"},{w:"dog",e:"🐶"},{w:"cat",e:"🐱"},{w:"apple",e:"🍎"},{w:"face",e:"🙂"},
 {w:"gift",e:"🎁"},{w:"hand",e:"✋"},{w:"duck",e:"🦆"},{w:"father",e:"👨"},{w:"mother",e:"👩"},
 {w:"grandma",e:"👵"},{w:"brother",e:"👦"},{w:"sister",e:"👧"},{w:"baby",e:"👶"},{w:"uncle",e:"🧔"},{w:"aunt",e:"👩‍🦰"}
];
const CONF={h:"gf",g:"hfj",f:"htv",e:"ai",a:"eo",b:"dp",d:"bp",p:"bq",t:"fd",n:"mh",c:"ks",s:"cz",u:"an",m:"nw"};
// 补全字母：_ 是要填的字母；全部是 _ 就是听写整个单词。只能写小写。
var FILL=[
 {w:"nest",e:"🪺",c:"鸟窝",p:"n_st"},{w:"bee",e:"🐝",c:"蜜蜂",p:"b_e"},{w:"egg",e:"🥚",c:"鸡蛋",p:"e_g"},
 {w:"pig",e:"🐷",c:"猪",p:"p_g"},{w:"hat",e:"👒",c:"帽子",p:"h_t"},{w:"fish",e:"🐟",c:"鱼",p:"f_sh"},
 {w:"bag",e:"👜",c:"包",p:"b_g"},{w:"hot",e:"🥵",c:"热",p:"_ot"},{w:"girl",e:"👧",c:"女孩",p:"g_rl"},
 {w:"good",e:"👍",c:"好",p:"_ood"},
 {w:"nest",e:"🪺",c:"鸟窝",p:"____"},{w:"hat",e:"👒",c:"帽子",p:"___"},{w:"pig",e:"🐷",c:"猪",p:"___"},
 {w:"egg",e:"🥚",c:"鸡蛋",p:"___"},{w:"bee",e:"🐝",c:"蜜蜂",p:"___"},
 {w:"dad",e:"👨",c:"爸爸",p:"d_d"},{w:"mum",e:"👩",c:"妈妈",p:"m_m"},{w:"baby",e:"👶",c:"小宝宝",p:"b_by"},
 {w:"sister",e:"👧",c:"姐姐/妹妹",p:"s_ster"},{w:"brother",e:"👦",c:"哥哥/弟弟",p:"br_ther"},
 {w:"aunt",e:"👩‍🦰",c:"阿姨",p:"a_nt"},{w:"uncle",e:"🧔",c:"叔叔",p:"_ncle"},
 {w:"grandma",e:"👵",c:"奶奶",p:"gr_ndma"},{w:"grandpa",e:"👴",c:"爷爷",p:"grand__"}
];
// 读短文：q=问题, o=选项, a=正确选项下标
var READ=[
 {t:"Hello, I'm Mia. I have a big family. I have Grandpa, Grandma, Dad, Mum and 2 brothers.",
  q:[{q:"Mia 的家大还是小？",o:["🏠 大 big","🛖 小 small"],a:0},{q:"Mia 有几个 brother（哥哥/弟弟）？",o:["1 个","2 个","3 个"],a:1},{q:"grandma 是谁？",o:["👵 奶奶","👩 妈妈","👧 姐姐"],a:0}]},
 {t:"Hi, I'm Linda. My family is small. This is my dad. This is my mum. And this is my baby brother. We are a happy family.",
  q:[{q:"Linda 的家大还是小？",o:["🏠 大 big","🛖 小 small"],a:1},{q:"baby brother 是谁？",o:["👶 小弟弟","👴 爷爷","🧔 叔叔"],a:0},{q:"dad 是谁？",o:["👩 妈妈","👨 爸爸","👦 哥哥"],a:1}]},
 {t:"My name is Coco. Look at my family: my father, my mother and me. We smile at home.",
  q:[{q:"Coco 家有谁？",o:["👨👩🙋‍♀️ 爸爸、妈妈和我","👴👵 爷爷和奶奶","🧔👩‍🦰 叔叔和阿姨"],a:0},{q:"他们在家做什么？",o:["😊 微笑 smile","⚽ 玩 play","👂 听 listen"],a:0}]},
 {t:"I'm Leo. This is my family: my dad, my mum, my uncle and 2 sisters. We love each other.",
  q:[{q:"uncle 是谁？",o:["🧔 叔叔/舅舅","👵 奶奶","👶 小宝宝"],a:0},{q:"Leo 有几个 sister（姐姐/妹妹）？",o:["1 个","2 个","没有"],a:1},{q:"mum 是谁？",o:["👩 妈妈","👨 爸爸","👧 妹妹"],a:0}]},
 {t:"I'm Bob. I have a brother and a sister. They can play with me. I love my family.",
  q:[{q:"Bob 有谁？",o:["👦👧 一个哥哥/弟弟和一个姐姐/妹妹","👴👵 爷爷奶奶","🧒 表哥"],a:0},{q:"他们能和 Bob 一起做什么？",o:["⚽ 玩 play","🍪 分享 share","👂 听 listen"],a:0}]},
 {t:"Look at the photo. This is my aunt. She's my father's sister. This is my cousin. We share.",
  q:[{q:"aunt 是谁？",o:["👩‍🦰 姑姑（爸爸的姐妹）","👵 奶奶","👩 妈妈"],a:0},{q:"cousin 是谁？",o:["🧒 表/堂兄弟姐妹","👦 亲哥哥","👶 小宝宝"],a:0},{q:"他们一起做什么？",o:["🍪 分享 share","😊 微笑 smile","🤝 帮助 help"],a:0}]}
];
// 打勾表（试卷第五题的样子）：读/听短文，在表格里打勾
var TABLE=[
 {t:"This is Linda's family. Grandma shares the cake with me. Grandma listens to me. Father helps me. Father plays with me. My sister smiles at me.",
  rows:["grandma","father","sister"],ans:{grandma:["share","listen"],father:["help","play"],sister:["smile"]}},
 {t:"This is Sam's family. Grandpa smiles at me. Mother helps me. Mother listens to me. My brother shares his toys. My brother plays with me.",
  rows:["grandpa","mother","brother"],ans:{grandpa:["smile"],mother:["help","listen"],brother:["share","play"]}}
];
// 对话：情景 ctx（中文）、听到的话 hear（可没有）、正确 a、干扰 x
var DIA=[
 {ctx:"🌅 早上见到爷爷奶奶，你说：",a:"Good morning, Grandpa and Grandma.",x:["Goodbye, Grandpa.","Thanks."]},
 {ctx:"朋友指着照片里的男孩问你。照片里是你的表哥 🧒",hear:"Is this your brother?",a:"No, it's my cousin.",x:["Yes, it is.","Nice to meet you."]},
 {ctx:"朋友指着照片问你。照片里真的是你哥哥 👦",hear:"Is this your brother?",a:"Yes, it is.",x:["No, it's my cousin.","Good morning."]},
 {ctx:"同学介绍他的朋友：",hear:"This is my friend, Tim.",a:"Nice to meet you.",x:["Thanks.","Yes, it is."]},
 {ctx:"🎂 奶奶给你一块蛋糕，你说：",a:"Thanks.",x:["Good morning.","No, it's my cousin."]},
 {ctx:"你想问照片里的男孩是不是他哥哥，你问：",a:"Is this your brother?",x:["This is my brother.","Nice to meet you."]},
 {ctx:"同学指着照片问你。照片里是你妹妹 👧",hear:"Is that your sister?",a:"Yes, it is.",x:["I can help.","Good morning."]},
 {ctx:"👩 妈妈拿着很多东西，你想帮忙，你说：",a:"I can help.",x:["Thanks.","Is that your sister?"]},
 {ctx:"你给同学介绍你的妈妈，你说：",a:"This is my mum.",x:["Is this your mum?","Thanks."]},
 {ctx:"新朋友对你说：",hear:"Nice to meet you.",a:"Nice to meet you, too.",x:["Thanks.","Yes, it is."]},
 {ctx:"🌙 晚上睡觉前，你对爸爸说：",a:"Good night, Dad.",x:["Good morning, Dad.","Nice to meet you."]},
 {ctx:"你给大家看全家福，你说：",a:"I love my family.",x:["Is this your family?","Thanks."]}
];
