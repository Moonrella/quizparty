import { type Question } from '../types';

export const presetQuestions: Question[] = [
  // 科技
  { id:'p1', theme:'tech', difficulty:1, type:'choice', question:'CPU是什么的缩写？', options:['中央处理器','中央编程器','核心处理模块','计算机程序单元'], correctIndex:0 },
  { id:'p2', theme:'tech', difficulty:2, type:'choice', question:'HTML是什么的缩写？', options:['超文本标记语言','高级文本语言','混合传输语言','超链接管理语言'], correctIndex:0 },
  { id:'p3', theme:'tech', difficulty:3, type:'choice', question:'HTTP状态码404代表什么？', options:['服务器错误','页面未找到','权限不足','请求超时'], correctIndex:1 },
  { id:'p4', theme:'tech', difficulty:4, type:'choice', question:'Git版本控制系统最初由谁创建？', options:['Bill Gates','Linus Torvalds','Tim Berners-Lee','Dennis Ritchie'], correctIndex:1 },
  { id:'p5', theme:'tech', difficulty:5, type:'choice', question:'量子计算中的基本单位叫什么？', options:['比特','量子比特','字节','量子字节'], correctIndex:1 },
  { id:'p6', theme:'tech', difficulty:6, type:'choice', question:'RSA算法的安全性基于什么数学难题？', options:['离散对数','大数分解','椭圆曲线','哈希碰撞'], correctIndex:1 },
  // 文学
  { id:'p7', theme:'literature', difficulty:1, type:'choice', question:'"床前明月光"的作者是谁？', options:['杜甫','白居易','李白','王维'], correctIndex:2 },
  { id:'p8', theme:'literature', difficulty:2, type:'choice', question:'《红楼梦》的作者是谁？', options:['施耐庵','曹雪芹','吴承恩','罗贯中'], correctIndex:1 },
  { id:'p9', theme:'literature', difficulty:3, type:'choice', question:'《百年孤独》的作者来自哪个国家？', options:['西班牙','墨西哥','哥伦比亚','阿根廷'], correctIndex:2 },
  { id:'p10', theme:'literature', difficulty:4, type:'choice', question:'诺贝尔文学奖第一位亚洲获奖者是谁？', options:['川端康成','泰戈尔','莫言','大江健三郎'], correctIndex:1 },
  { id:'p11', theme:'literature', difficulty:5, type:'choice', question:'但丁《神曲》分为几个部分？', options:['2','3','4','5'], correctIndex:1 },
  { id:'p12', theme:'literature', difficulty:6, type:'choice', question:'《尤利西斯》的故事发生在哪座城市？', options:['伦敦','巴黎','都柏林','柏林'], correctIndex:2 },
  // 艺术
  { id:'p13', theme:'art', difficulty:1, type:'choice', question:'《蒙娜丽莎》是谁的作品？', options:['米开朗基罗','达芬奇','拉斐尔','梵高'], correctIndex:1 },
  { id:'p14', theme:'art', difficulty:2, type:'choice', question:'印象派绘画的代表人物是谁？', options:['毕加索','莫奈','达利','塞尚'], correctIndex:1 },
  { id:'p15', theme:'art', difficulty:3, type:'choice', question:'安迪·沃霍尔是哪种艺术运动的代表？', options:['抽象表现主义','波普艺术','极简主义','立体主义'], correctIndex:1 },
  { id:'p16', theme:'art', difficulty:4, type:'choice', question:'日本浮世绘对哪个西方艺术流派影响最大？', options:['浪漫主义','印象派','超现实主义','古典主义'], correctIndex:1 },
  { id:'p17', theme:'art', difficulty:5, type:'choice', question:'杜尚的《泉》(1917)实际上是什么物品？', options:['一个花瓶','一个小便池','一面镜子','一把椅子'], correctIndex:1 },
  { id:'p18', theme:'art', difficulty:6, type:'choice', question:'包豪斯学校的创始人是谁？', options:['密斯·凡·德·罗','格罗皮乌斯','柯布西耶','赖特'], correctIndex:1 },
  // 娱乐
  { id:'p19', theme:'entertainment', difficulty:1, type:'choice', question:'漫威宇宙中钢铁侠的真名是？', options:['托尼·斯塔克','布鲁斯·韦恩','史蒂夫·罗杰斯','彼得·帕克'], correctIndex:0 },
  { id:'p20', theme:'entertainment', difficulty:2, type:'choice', question:'《老友记》一共有多少季？', options:['8','9','10','12'], correctIndex:2 },
  { id:'p21', theme:'entertainment', difficulty:3, type:'choice', question:'游戏《塞尔达传说》的主角叫什么？', options:['塞尔达','林克','马力欧','皮卡丘'], correctIndex:1 },
  { id:'p22', theme:'entertainment', difficulty:4, type:'choice', question:'披头士乐队来自哪个城市？', options:['伦敦','利物浦','曼彻斯特','伯明翰'], correctIndex:1 },
  { id:'p23', theme:'entertainment', difficulty:5, type:'choice', question:'电影《2001太空漫游》中AI的名字是？', options:['Siri','HAL 9000','Skynet','Cortana'], correctIndex:1 },
  { id:'p24', theme:'entertainment', difficulty:6, type:'choice', question:'Pink Floyd的《The Wall》发行于哪一年？', options:['1975','1977','1979','1981'], correctIndex:2 },
  // 美食
  { id:'p25', theme:'food', difficulty:1, type:'choice', question:'寿司起源于哪个国家？', options:['中国','日本','韩国','泰国'], correctIndex:1 },
  { id:'p26', theme:'food', difficulty:2, type:'choice', question:'四川菜中"麻"的味道来自什么调料？', options:['辣椒','花椒','姜','胡椒'], correctIndex:1 },
  { id:'p27', theme:'food', difficulty:3, type:'choice', question:'鱼子酱传统上来自哪种鱼？', options:['三文鱼','鲟鱼','金枪鱼','鳕鱼'], correctIndex:1 },
  { id:'p28', theme:'food', difficulty:4, type:'choice', question:'米其林三星中"值得专程前往"是几星？', options:['一星','二星','三星','四星'], correctIndex:2 },
  { id:'p29', theme:'food', difficulty:5, type:'choice', question:'日本和牛的最高等级是？', options:['A3','A4','A5','A6'], correctIndex:2 },
  { id:'p30', theme:'food', difficulty:6, type:'choice', question:'世界最早的食谱书被认为是哪本？', options:['De Re Coquinaria','Le Viandier','The Forme of Cury','Taillevent'], correctIndex:0 },
  // 体育
  { id:'p31', theme:'sports', difficulty:1, type:'choice', question:'足球比赛中每队上场多少人？', options:['9','10','11','12'], correctIndex:2 },
  { id:'p32', theme:'sports', difficulty:2, type:'choice', question:'网球中"Love"代表多少分？', options:['0','15','30','40'], correctIndex:0 },
  { id:'p33', theme:'sports', difficulty:3, type:'choice', question:'马拉松全程大约多少公里？', options:['32','38','42','50'], correctIndex:2 },
  { id:'p34', theme:'sports', difficulty:4, type:'choice', question:'NBA历史上获得总冠军最多的球队是？', options:['湖人','凯尔特人','公牛','马刺'], correctIndex:1 },
  { id:'p35', theme:'sports', difficulty:5, type:'choice', question:'围棋棋盘上共有多少个交叉点？', options:['289','324','361','400'], correctIndex:2 },
  { id:'p36', theme:'sports', difficulty:6, type:'choice', question:'古代奥运会最早可追溯到公元前哪一年？', options:['公元前576年','公元前776年','公元前976年','公元前1176年'], correctIndex:1 },
  // 地理
  { id:'p37', theme:'geography', difficulty:1, type:'choice', question:'地球上哪个大洲面积最大？', options:['非洲','北美洲','亚洲','欧洲'], correctIndex:2 },
  { id:'p38', theme:'geography', difficulty:2, type:'choice', question:'世界上最长的河流是？', options:['亚马逊河','尼罗河','长江','密西西比河'], correctIndex:1 },
  { id:'p39', theme:'geography', difficulty:3, type:'choice', question:'哪个国家拥有最多的时区？', options:['俄罗斯','美国','中国','法国'], correctIndex:3 },
  { id:'p40', theme:'geography', difficulty:4, type:'choice', question:'世界面积最小的国家是？', options:['摩纳哥','梵蒂冈','瑙鲁','圣马力诺'], correctIndex:1 },
  { id:'p41', theme:'geography', difficulty:5, type:'choice', question:'南极洲属于哪个国家？', options:['俄罗斯','美国','不属于任何国家','联合国'], correctIndex:2 },
  { id:'p42', theme:'geography', difficulty:6, type:'choice', question:'世界上最长的山脉是？', options:['喜马拉雅山脉','安第斯山脉','落基山脉','阿尔卑斯山脉'], correctIndex:1 },
  // 自然
  { id:'p43', theme:'nature', difficulty:1, type:'choice', question:'世界上最大的哺乳动物是？', options:['非洲象','蓝鲸','长颈鹿','北极熊'], correctIndex:1 },
  { id:'p44', theme:'nature', difficulty:2, type:'choice', question:'恐龙灭绝大约在多少年前？', options:['650万年','6500万年','6.5亿年','65亿年'], correctIndex:1 },
  { id:'p45', theme:'nature', difficulty:3, type:'choice', question:'章鱼有几颗心脏？', options:['1','2','3','4'], correctIndex:2 },
  { id:'p46', theme:'nature', difficulty:4, type:'choice', question:'地球大气层中含量最多的气体是？', options:['氧气','氮气','二氧化碳','氩气'], correctIndex:1 },
  { id:'p47', theme:'nature', difficulty:5, type:'choice', question:'DNA双螺旋结构在哪一年被发现？', options:['1943','1953','1963','1973'], correctIndex:1 },
  { id:'p48', theme:'nature', difficulty:6, type:'choice', question:'深海热液喷口的温度可以达到多少？', options:['约100°C','约200°C','约400°C','约600°C'], correctIndex:2 },
  // 历史
  { id:'p49', theme:'history', difficulty:1, type:'choice', question:'中国第一个皇帝是谁？', options:['汉武帝','秦始皇','唐太宗','朱元璋'], correctIndex:1 },
  { id:'p50', theme:'history', difficulty:2, type:'choice', question:'法国大革命发生在哪一年？', options:['1689','1776','1789','1804'], correctIndex:2 },
  { id:'p51', theme:'history', difficulty:3, type:'choice', question:'丝绸之路最早开通于哪个朝代？', options:['秦朝','汉朝','唐朝','宋朝'], correctIndex:1 },
  { id:'p52', theme:'history', difficulty:4, type:'choice', question:'明治维新开始于哪一年？', options:['1848','1858','1868','1878'], correctIndex:2 },
  { id:'p53', theme:'history', difficulty:5, type:'choice', question:'柏林墙是在哪一年倒塌的？', options:['1987','1988','1989','1990'], correctIndex:2 },
  { id:'p54', theme:'history', difficulty:6, type:'choice', question:'第一次世界大战的直接导火索是什么事件？', options:['珍珠港事件','萨拉热窝事件','卢西塔尼亚号沉没','齐默尔曼电报'], correctIndex:1 },
];
