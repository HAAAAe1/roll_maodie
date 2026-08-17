# TRSS-Yunzai 今日耄耋插件 🐊

每日为用户随机抽取专属“今日耄耋”表情，并生成耄耋图鉴收集系统。适用于 [TRSS-Yunzai](https://github.com/TimeRainStarSky/Yunzai) 机器人框架。

> 本插件由 AI（OpenClaw / MiMo）编写，包括插件代码、图鉴生成脚本及耄耋表情描述文案。

## 功能

| 指令 | 说明 |
|------|------|
| `#今日耄耋` | 抽取今天属于你的专属耄耋表情 |
| `#随机耄耋` | 随机抽取一只耄耋（每天可多次） |
| `#查找耄耋 名字` | 搜索指定耄耋 |
| `#耄耋图鉴` | 生成图片形式的耄耋收集图鉴 |

### 特性

- 每人每天只能抽取一次，同一天结果固定（基于日期+用户ID的确定性哈希）
- 随机抽取功能，每天可多次，不记录收藏
- 每次抽取自动记录收藏，支持图鉴进度追踪
- 图鉴以图片形式展示：已收集的耄耋彩色显示+绿色边框，未收集的灰色剪影
- 支持自定义耄耋库和图片（png/jpg/gif/webp）
- 可扩展为任意表情包收集系统

## 安装

### 1. 复制插件文件

将以下文件复制到 TRSS-Yunzai 的 `plugins/` 目录：

```
TRSS-Yunzai/
└── plugins/
    └── rollmaodie/
        ├── rollmaodie.js    # 插件主逻辑
        ├── maodie.json      # 耄耋数据
        ├── image/           # 耄耋图片（文件名与 id 对应）
        └── collector.json   # 收藏数据（自动生成）
```

### 2. 安装 Python 依赖

图鉴图片生成需要 Python 和 Pillow：

```bash
pip install Pillow
```

### 3. 配置脚本路径

编辑 `rollmaodie.js`，修改以下路径为你的实际路径：

```javascript
const PLUGIN_DIR = '你的插件目录路径'
const PYTHON = 'python'  // 或 python3
const DEX_SCRIPT = 'rollmaodie-dex.py 的完整路径'
```

### 4. 重启 TRSS-Yunzai

插件会自动热加载，也可手动重启。

## 自定义耄耋库

### 添加新耄耋

1. 在 `image/` 目录放入图片（支持 png/jpg/gif/webp），文件名与 id 对应
2. 在 `maodie.json` 追加条目：

```json
{
  "id": "maodie-xxx",
  "name": "耄耋XXX",
  "description": "简短描述",
  "analysis": "详细性格分析"
}
```

### maodie.json 格式

```json
[
  {
    "id": "maodie-wunai",
    "name": "耄耋无奈",
    "description": "汗流浃背的老父亲",
    "analysis": "你圆圆的脸上写满了「我累了」..."
  }
]
```

## 图鉴效果

- 已收集：彩色图片 + 绿色边框
- 未收集：灰色剪影 + 深色背景
- 顶部进度条 + 百分比
- 底部图例说明

## 致谢

本插件架构参考：

- **[astrbot_plugin_rollpig](https://github.com/MegSopern/astrbot_plugin_rollpig)** — AstrBot 版今日小猪插件（原作者：MegSopern）
- **[nonebot-plugin-rollpig](https://github.com/Bearlele/nonebot-plugin-rollpig)** — NoneBot 版今日小猪插件（原作者：Bearlele）
- 基于上述项目的图鉴收集机制改造，适配 TRSS-Yunzai 框架
- 耄耋表情素材来自网络，版权归原作者所有
- 插件代码及耄耋描述文案由 AI 生成

## 许可

MIT License
