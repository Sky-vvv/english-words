# 小学英语背单词（人教 PEP 版）

一个给孩子用的背单词网页：单词按音节拆成彩色小块，点一下就读；下面有音标、词性和中文意思，每个字母下面标着它的发音，还有例句。适合在 iPad、手机或电脑的浏览器里用。

- 不用安装，不用注册，没有后台，打开网页就能用，用的时候也不需要联网。
- 每个孩子的进度、收藏和默认年级分开保存，**只存在这台设备的浏览器里**，换一台设备或者清除浏览器数据，进度就没了。
- 拼读时每个音标用**真人录的音素短音频**（`audio/phonemes/` 文件夹，共 46 个，合计约 110 KB）；整个单词和例句用浏览器自带的英语语音（美式发音）。

## 功能

| 模式 | 做什么 |
|---|---|
| 学习 | 单词按**自然拼读**拆成彩色小块（辅音深蓝、元音红、元音组合和 r 控制元音绿、magic e 紫、不发音的灰）。点一块就按音标播放这一块的音素（比如 fr 播 /f/ 再播 /r/，不发音的字母不出声），下面的规则框会显示它的读音和中文拼读规则，例外的拼写会标“⚠ 例外”。点「🔤 拼读」会一块一块按音标读（读到哪块哪块高亮），停一下，再读整个单词。🔊 读整个词，例句旁的 🔊 读例句。底部有 上一个 / 收藏 / 已掌握 / 下一个。 |
| 拼写 | 听单词、看中文，点打乱的字母把单词拼出来，也可以用键盘直接打字。拼不出来可以点“提示”。 |
| 听选 | 听单词，从 4 个中文意思里选出正确的。 |
| 复习 | 只练还没掌握的词，到了复习时间的词排在前面（间隔 1、2、4、7、15 天），拼写题和听选题交替出。 |

**“已掌握”的规则**：一个单词在**不同的天**或**不同的练习模式**里答对满 3 次，就自动算“已掌握”。也可以在学习卡片上手动点“已掌握”，再点一次就改回未掌握。

**切换孩子**：点右上角的 👤 名字，可以切换和改名。默认三个孩子是：景菲（三年级）、明毅（四年级）、明泽（六年级）。在首页选年级和上下册，会自动记住，下次打开还是这本书。

**慢速朗读**：点右上角的 🐢 慢速。

## 教材内容和核对情况

| 文件 | 教材 | 核对情况 |
|---|---|---|
| `data/grade3-up.json` | 三年级上册，人教PEP 2024新版 | 单元名和单词对照了教材附录 Words in each unit 的网上整理版，每单元选了 10 个左右的核心词 |
| `data/grade3-down.json` | 三年级下册，人教PEP 2024新版（2025春） | 对照了教材电子版的附录 Appendix 2 |
| `data/grade4-up.json` | 四年级上册，人教PEP 2025秋新版 | 对照了网上的分单元单词表；Unit 6 的网上单词表只拿到一部分，这个单元只放了核对过的词 |
| `data/grade4-down.json` | 四年级下册，人教PEP 2026春新版 | 对照了网上的分单元单词表（带页码） |
| `data/grade6-up.json` | 六年级上册，人教PEP 2014版（旧版） | 单元名核对过，单词是按旧版教材整理的，**没逐个对照原书** |
| `data/grade6-down.json` | 六年级下册，人教PEP 2014版（旧版） | 同上，没逐个对照原书 |

说明：
- 新版 PEP 是从 2024 年秋季开始逐年换的，三、四年级现在用新版；按这个换版节奏，六年级 2026 年还在用旧版。如果孩子学校的书跟这里不一样，按下面的方法改数据文件就行。
- 每个单元只选了核心单词（名词、形容词、动词为主），像 and、me、some 这种虚词和人名没放进来。
- 音节拆分是按自然拼读的读法拆的，方便孩子读，跟词典的断字规则不一定一样。

## 一、在 Mac 上打开（本机试用）

网页要用一个“本机小服务器”打开。直接双击 `index.html` 打不开单词数据，这是浏览器的安全限制。

1. 把 `english-app.zip` 解压，比如解压到“文稿”（Documents）里，得到一个 `english-app` 文件夹。
2. 打开“终端”：按 `⌘ 空格`，输入“终端”或 Terminal，回车。
3. 在终端里输入下面这一行，然后回车（如果文件夹放在别处，把路径改掉）：
   ```
   cd ~/Documents/english-app
   ```
4. 再输入下面这一行，回车：
   ```
   python3 -m http.server 8000
   ```
   如果看到 `Serving HTTP on ... port 8000`，就说明成功了。如果弹窗提示要安装“命令行开发者工具”，点“安装”，装完再输入一次。
5. 打开 Safari 或 Chrome，在地址栏输入 **http://localhost:8000** 回车。
6. 用完了，回到终端按 `control + C` 就关掉了。下次再用，重复第 3～5 步。

想让 iPad 也打开 Mac 上的这个网页：iPad 和 Mac 要连同一个 Wi-Fi，然后在 iPad 的 Safari 里输入 `http://Mac的局域网IP:8000`（在 Mac 的“系统设置 → Wi-Fi → 详细信息”里能看到 IP，比如 `192.168.1.5`）。更方便的办法是部署到 GitHub Pages（见第三部分），这样 iPad 随时都能打开。

## 二、自己加单词或改单词

单词都在 `data` 文件夹里，一册书一个文件。用“文本编辑”或 VS Code 打开就能改（用“文本编辑”的话，要先在菜单“格式”里选“制作纯文本”）。

一个单词长这样：

```json
{
  "word": "potato",
  "syllables": ["po", "ta", "to"],
  "say": ["puh", "tay", "toe"],
  "ipa": "/pəˈteɪtəʊ/",
  "pos": "n.",
  "cn": "土豆",
  "letters": [["p", "/p/"], ["o", "/ə/"], ["t", "/t/"], ["a", "/eɪ/"], ["t", "/t/"], ["o", "/əʊ/"] ],
  "example": "He likes to eat potatoes.",
  "exampleCn": "他喜欢吃土豆。"
}
```

| 字段 | 意思 | 必须要有吗 |
|---|---|---|
| `word` | 单词 | 必须 |
| `cn` | 中文意思 | 必须（听选题要用） |
| `syllables` | 拆成的彩色音节块，拼起来要等于单词 | 可以不写，不写就整词显示成一块 |
| `say` | 点每个音节块时实际读出来的英文拼写（让语音读得像这个音节） | 可以不写，不写就直接读音节块 |
| `ipa` | 音标 | 可以不写 |
| `pos` | 词性，比如 n. v. adj. | 可以不写 |
| `letters` | 字母块和它下面的发音，`["e", ""]` 表示这个字母不发音 | 可以不写，不写就只显示字母 |
| `example` / `exampleCn` | 例句和翻译 | 可以不写 |
| `phonics` | 自然拼读拆分，每一块是 `{"t": 字母, "ipa": 读音, "type": 类型, "note": 中文规则, "tag": 小标签, "say": 备用——只有这块的音素音频缺失时才用浏览器语音读它, "ex": true 表示例外, "link": true 表示 magic e 的两头}` | 可以不写，不写就按 `letters` 显示（没有规则说明）；所有块拼起来必须正好等于单词，不然网页会忽略它 |

`type` 可以填：`cons` 辅音、`blend` 辅音组合、`digraph` 字母组合（sh/ch/th/ck…）、`vowel` 元音、`team` 元音组合（ee/ea/ai…）、`r` r 控制元音（ar/er/ir…）、`magic` magic e 前面的元音、`silent` 不发音、`suffix` 词尾（-le/-ing/-tion/-ed…）。不同类型显示不同颜色。

现在的 333 个词，拼读拆分和规则说明都是用 `tools/phonics.py` 按规则自动生成的，生成时会检查两件事：所有块拼起来等于单词，所有块的读音连起来等于音标。

**加一个词**：复制一个现有单词的 `{ ... }`，粘贴到同一个单元的 `"words": [ ... ]` 里，改掉内容。注意两个单词的 `}` 和 `{` 之间要有英文逗号 `,`，最后一个单词后面不要有逗号。

**加一个单元**：仿照现有的 `{ "unit": "Unit 7", "title": "...", "words": [ ... ] }` 加一段。

**加一本书**（比如五年级）：复制一个文件改名，比如 `data/grade5-up.json`，改掉里面的 `id`、`grade`、`term`；再到 `data/books.json` 里加一行：
```json
{"id": "grade5-up", "grade": "五年级", "term": "上册", "edition": "人教PEP", "file": "data/grade5-up.json"}
```
首页的年级按钮会自动多出来。

改完刷新网页就能看到。如果网页提示“数据读取失败”，多半是 JSON 少了或多了逗号、引号，可以把文件内容粘贴到 jsonlint.com 这类网站检查一下。

（`tools` 文件夹里是我用来批量生成这些 JSON 的源文件和脚本，平时不用管。）

## 三、部署到 GitHub Pages（以后想放到网上时）

部署好以后，会得到一个网址，比如 `https://你的用户名.github.io/english-app/`，iPad、手机随时都能打开，还可以在 Safari 里“添加到主屏幕”，用起来像个 App。

1. 登录 https://github.com ，点右上角 **+** → **New repository**。
2. Repository name 填 `english-app`，选 **Public**（免费账号的 Pages 要求公开仓库），点 **Create repository**。
3. 在新仓库页面点 **uploading an existing file** 这个链接。
4. 打开 Mac 上解压出来的 `english-app` 文件夹，**全选里面的所有东西**（`index.html`、`css`、`js`、`data` 等），拖到网页上，等上传完，点 **Commit changes**。注意要拖文件夹里面的东西，不要拖 `english-app` 这个文件夹本身。
5. 在仓库里点 **Settings** → 左边点 **Pages**。
6. 在 “Build and deployment” 下，Source 选 **Deploy from a branch**，Branch 选 **main**，文件夹选 **/(root)**，点 **Save**。
7. 等 1～3 分钟刷新这个页面，上面会出现网址 `https://你的用户名.github.io/english-app/`，打开就能用。

以后改了单词：在仓库里进到 `data` 文件夹，点要改的文件，点右上角的铅笔图标在线编辑，再点 **Commit changes**；或者重新上传覆盖这个文件。等一两分钟刷新网页就更新了。

注意：网站是公开的，任何人知道网址都能打开，不过里面只有单词，孩子的学习进度只存在各自设备的浏览器里，不会上传。


## 音标音频的来源和许可

`audio/phonemes/` 里的音频都来自 Wikimedia Commons，下载原始录音后用 ffmpeg 做了这些处理：截取出单个音素（原录音多数是 [pa apa] 这种带元音的形式）、去掉首尾静音、统一音量、加很短的淡入淡出，转成 22 kHz 单声道 48 kbps 的 mp3（iPad/iPhone 的 Safari 能直接播）。音标和文件的对应关系在 `audio/phonemes/phonemes.json`，可以改。

按 CC BY-SA 3.0 的要求：这些裁剪过的音频是原作品的修改版，**同样以 CC BY-SA 3.0 发布**；CC0 / 公有领域的那几个没有限制。网页代码和单词数据不受这个影响。

| 音标 | 原文件（Wikimedia Commons） | 作者 | 许可 |
|---|---|---|---|
| /p/ | [Voiceless bilabial plosive.ogg](https://commons.wikimedia.org/wiki/File:Voiceless_bilabial_plosive.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /b/ | [Voiced bilabial plosive.ogg](https://commons.wikimedia.org/wiki/File:Voiced_bilabial_plosive.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /t/ | [Voiceless alveolar plosive.ogg](https://commons.wikimedia.org/wiki/File:Voiceless_alveolar_plosive.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /d/ | [Voiced alveolar plosive.ogg](https://commons.wikimedia.org/wiki/File:Voiced_alveolar_plosive.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /k/ | [Voiceless velar plosive.ogg](https://commons.wikimedia.org/wiki/File:Voiceless_velar_plosive.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /ɡ/ | [Voiced velar plosive.ogg](https://commons.wikimedia.org/wiki/File:Voiced_velar_plosive.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /f/ | [Voiceless labiodental fricative.ogg](https://commons.wikimedia.org/wiki/File:Voiceless_labiodental_fricative.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /v/ | [Voiced labiodental fricative.ogg](https://commons.wikimedia.org/wiki/File:Voiced_labiodental_fricative.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /θ/ | [Voiceless dental fricative.ogg](https://commons.wikimedia.org/wiki/File:Voiceless_dental_fricative.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /ð/ | [Voiced dental fricative.ogg](https://commons.wikimedia.org/wiki/File:Voiced_dental_fricative.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /s/ | [Voiceless alveolar sibilant.ogg](https://commons.wikimedia.org/wiki/File:Voiceless_alveolar_sibilant.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /z/ | [Voiced alveolar sibilant.ogg](https://commons.wikimedia.org/wiki/File:Voiced_alveolar_sibilant.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /ʃ/ | [Voiceless palato-alveolar sibilant.ogg](https://commons.wikimedia.org/wiki/File:Voiceless_palato-alveolar_sibilant.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /ʒ/ | [Voiced palato-alveolar sibilant.ogg](https://commons.wikimedia.org/wiki/File:Voiced_palato-alveolar_sibilant.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /h/ | [Voiceless glottal fricative.ogg](https://commons.wikimedia.org/wiki/File:Voiceless_glottal_fricative.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /tʃ/ | [Voiceless palato-alveolar affricate.ogg](https://commons.wikimedia.org/wiki/File:Voiceless_palato-alveolar_affricate.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /dʒ/ | [Voiced palato-alveolar affricate.ogg](https://commons.wikimedia.org/wiki/File:Voiced_palato-alveolar_affricate.ogg) | Octane (English Wikipedia) | Public domain |
| /m/ | [Bilabial nasal.ogg](https://commons.wikimedia.org/wiki/File:Bilabial_nasal.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /n/ | [Alveolar nasal.ogg](https://commons.wikimedia.org/wiki/File:Alveolar_nasal.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /ŋ/ | [Velar nasal.ogg](https://commons.wikimedia.org/wiki/File:Velar_nasal.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /l/ | [Alveolar lateral approximant.ogg](https://commons.wikimedia.org/wiki/File:Alveolar_lateral_approximant.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /r/ | [Alveolar approximant.ogg](https://commons.wikimedia.org/wiki/File:Alveolar_approximant.ogg) | Erutuon | CC BY-SA 3.0 |
| /w/ | [Voiced labio-velar approximant.ogg](https://commons.wikimedia.org/wiki/File:Voiced_labio-velar_approximant.ogg) | Peter Isotalo | CC BY-SA 3.0 |
| /j/ | [Palatal approximant.ogg](https://commons.wikimedia.org/wiki/File:Palatal_approximant.ogg) | Peter Isotalo (User:Karmosin) | CC BY-SA 3.0 |
| /ɪ/ | [Near-close near-front unrounded vowel.ogg](https://commons.wikimedia.org/wiki/File:Near-close_near-front_unrounded_vowel.ogg) | Denelson83 | CC BY-SA 3.0 |
| /e/ | [Open-mid front unrounded vowel.ogg](https://commons.wikimedia.org/wiki/File:Open-mid_front_unrounded_vowel.ogg) | Terfili | CC BY-SA 3.0 |
| /æ/ | [Near-open front unrounded vowel.ogg](https://commons.wikimedia.org/wiki/File:Near-open_front_unrounded_vowel.ogg) | Denelson83 | CC BY-SA 3.0 |
| /ʌ/ | [Near-open central vowel.ogg](https://commons.wikimedia.org/wiki/File:Near-open_central_vowel.ogg) | Denelson83（Commons 页面注明：无机读作者信息，推定为 Denelson83） | CC BY-SA 3.0 |
| /ɒ/ | [Open back rounded vowel.ogg](https://commons.wikimedia.org/wiki/File:Open_back_rounded_vowel.ogg) | Denelson83 | CC BY-SA 3.0 |
| /ʊ/ | [Near-close near-back rounded vowel.ogg](https://commons.wikimedia.org/wiki/File:Near-close_near-back_rounded_vowel.ogg) | Denelson83 | CC BY-SA 3.0 |
| /ə/ | [Mid-central vowel.ogg](https://commons.wikimedia.org/wiki/File:Mid-central_vowel.ogg) | Denelson83 | CC BY-SA 3.0 |
| /i/ /iː/ | [Close front unrounded vowel.ogg](https://commons.wikimedia.org/wiki/File:Close_front_unrounded_vowel.ogg) | Denelson83 | CC BY-SA 3.0 |
| /u/ /uː/ | [Close back rounded vowel.ogg](https://commons.wikimedia.org/wiki/File:Close_back_rounded_vowel.ogg) | Denelson83 | CC BY-SA 3.0 |
| /ɑː/ | [Open back unrounded vowel.ogg](https://commons.wikimedia.org/wiki/File:Open_back_unrounded_vowel.ogg) | Denelson83 | CC BY-SA 3.0 |
| /ɔː/ | [Open-mid back rounded vowel.ogg](https://commons.wikimedia.org/wiki/File:Open-mid_back_rounded_vowel.ogg) | Denelson83 | CC BY-SA 3.0 |
| /ɜː/ | [Open-mid central unrounded vowel.ogg](https://commons.wikimedia.org/wiki/File:Open-mid_central_unrounded_vowel.ogg) | Denelson83 | CC BY-SA 3.0 |
| /aʊ/ | [LL-Q1860 (eng)-Pvanp7-aʊ (diphthong).wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Pvanp7-a%CA%8A_%28diphthong%29.wav) | Pvanp7 (Lingua Libre) | CC0 |
| /eə/ | [LL-Q1860 (eng)-Pvanp7-ɛə (diphthong).wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Pvanp7-%C9%9B%C9%99_%28diphthong%29.wav) | Pvanp7 (Lingua Libre) | CC0 |
| /ʊə/ | [LL-Q1860 (eng)-Pvanp7-ʊə (diphthong).wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Pvanp7-%CA%8A%C9%99_%28diphthong%29.wav) | Pvanp7 (Lingua Libre) | CC0 |
| /eɪ/ | [LL-Q1860 (eng)-Pvanp7-bay.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Pvanp7-bay.wav) | Pvanp7 (Lingua Libre) | CC0 |
| /aɪ/ | [LL-Q1860 (eng)-Pvanp7-by.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Pvanp7-by.wav) | Pvanp7 (Lingua Libre) | CC0 |
| /ɔɪ/ | [LL-Q1860 (eng)-Pvanp7-boy.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Pvanp7-boy.wav) | Pvanp7 (Lingua Libre) | CC0 |
| /əʊ/ | [LL-Q1860 (eng)-Pvanp7-beau.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Pvanp7-beau.wav) | Pvanp7 (Lingua Libre) | CC0 |
| /ɪə/ | [LL-Q1860 (eng)-Pvanp7-beer.wav](https://commons.wikimedia.org/wiki/File:LL-Q1860_%28eng%29-Pvanp7-beer.wav) | Pvanp7 (Lingua Libre) | CC0 |

说明：
- 元音和辅音是语音学家录的“标准音”（IPA 示范录音，录音人不是英国人），音色和英国人说话时的元音不完全一样，例如 /e/ 用的是 [ɛ]、/ʌ/ 用的是 [ɐ]、/ɜː/ /ɔː/ 等长元音用的是对应的标准元音。长元音的音频比短元音长一些。
- 8 个双元音来自同一位英语母语者（Lingua Libre 用户 Pvanp7，CC0）的录音：/aʊ/ /eə/ /ʊə/ 是他单独录的双元音；/eɪ/ /aɪ/ /ɔɪ/ /əʊ/ /ɪə/ 是从 bay、by、boy、beau、beer 这几个词里去掉开头的 b 截出来的。录音人口音没有注明（从资料看可能是澳大利亚英语），不是严格的英式 RP。
- /i/（happy 词尾）和 /u/ 用的是 /iː/ /uː/ 的缩短版。
- 爆破音 /p/ /b/ /t/ /d/ /k/ /ɡ/ 单独发很难听清，音频里带了极短的一点气流/元音尾巴。

## 已知限制

- 朗读的声音取决于设备：iPad、iPhone 的 Safari 和 Mac 上的效果最好；有的安卓浏览器或电脑浏览器没有英语语音，网页顶部会出现提示。
- 点拼读块时播放的是录好的音素音频；点音节（「音节：」那一行）时还是用浏览器语音读近似音。
- 如果某个音素的音频缺失或加载失败，那一块会自动改用浏览器语音读近似音。
- iPhone / iPad 开着静音键时：iOS 16.4 以上会尽量照常出声；更老的系统需要关掉静音键才能听到音素音频。第一次进入后先点一下屏幕任意位置，声音才会被“解锁”。
- 进度不能在设备之间同步。
