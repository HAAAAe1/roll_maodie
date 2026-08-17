// rollmaodie.js - 今日耄耋 🐱
// 每天每人随机抽取专属耄耋表情 + 耄耋图鉴
// 用法：#今日耄耋 / #耄耋图鉴
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { execSync } from 'child_process'

const PLUGIN_DIR = 'D:\\Yz\\TRSS-Yunzai\\plugins\\rollmaodie'
const PYTHON = 'python'
const DEX_SCRIPT = 'C:\\Users\\H\\.openclaw\\workspace\\scripts\\rollmaodie-dex.py'
// 管理员权限从 config.json 读取（不进 git）
let ADMIN_IDS = []
try {
  ADMIN_IDS = JSON.parse(fs.readFileSync(path.join(PLUGIN_DIR, 'config.json'), 'utf8')).adminIds || []
} catch (e) { ADMIN_IDS = [] }

// 加载耄耋库
let maodieList = []
try {
  maodieList = JSON.parse(fs.readFileSync(path.join(PLUGIN_DIR, 'maodie.json'), 'utf8'))
} catch (e) {
  logger.error('[rollmaodie] 加载 maodie.json 失败:', e.message)
}

// 收藏数据持久化
const COLLECT_FILE = path.join(PLUGIN_DIR, 'collector.json')
let collector = {}
try {
  collector = JSON.parse(fs.readFileSync(COLLECT_FILE, 'utf8'))
} catch (e) {
  collector = {}
}

function saveCollector () {
  try {
    fs.writeFileSync(COLLECT_FILE, JSON.stringify(collector, null, 2), 'utf8')
  } catch (e) {
    logger.error('[rollmaodie] 保存收藏数据失败:', e.message)
  }
}

export class rollmaodie extends plugin {
  constructor () {
    super({
      name: '今日耄耋',
      dsc: '抽取今天属于你的耄耋表情 + 耄耋图鉴',
      event: 'message',
      priority: 50,
      rule: [
        { reg: '^#今日耄耋$', fnc: 'rollMaodie' },
        { reg: '^#随机耄耋$', fnc: 'randomMaodie' },
        { reg: '^#查找耄耋\s*(.+)$', fnc: 'searchMaodie' },
        { reg: '^#耄耋图鉴$', fnc: 'showCollection' },
        { reg: '^#全部耄耋$', fnc: 'listAll' }
      ]
    })
  }

  async rollMaodie (e) {
    if (!maodieList.length) {
      await e.reply('耄耋库空了...')
      return true
    }

    const today = new Date().toISOString().slice(0, 10)
    const seed = `${today}-${e.user_id}`
    const hash = crypto.createHash('md5').update(seed).digest('hex')
    const index = parseInt(hash.slice(0, 8), 16) % maodieList.length
    const maodie = maodieList[index]

    // 记录收藏
    const uid = String(e.user_id)
    if (!collector[uid]) collector[uid] = []
    const already = collector[uid].some(c => c.id === maodie.id)
    if (!already) {
      collector[uid].push({ id: maodie.id, date: today })
      saveCollector()
    }

    const collected = collector[uid].length
    const total = maodieList.length
    const nickname = e.sender?.card || e.sender?.nickname || ''
    const msg = [
      `🐱 今日耄耋 — ${maodie.name}`,
      '',
      `「${maodie.description}」`,
      '',
      maodie.analysis,
      '',
      `— ${nickname}，这是今天属于你的耄耋 🐾`,
      '',
      `📊 图鉴进度：${collected}/${total}（${Math.round(collected / total * 100)}%）`
    ].join('\n')

    // 找图片（支持 png/jpg/gif/webp）
    let imgPath = null
    for (const ext of ['png', 'jpg', 'jpeg', 'webp', 'gif']) {
      const p = path.join(PLUGIN_DIR, 'image', `${maodie.name}.${ext}`)
      if (fs.existsSync(p)) { imgPath = p; break }
    }
    if (imgPath) {
      await e.reply([msg, segment.image(imgPath)])
    } else {
      await e.reply(msg)
    }
    return true
  }

  async randomMaodie (e) {
    if (!maodieList.length) {
      await e.reply('耄耋库空了...')
      return true
    }

    const maodie = maodieList[Math.floor(Math.random() * maodieList.length)]
    const nickname = e.sender?.card || e.sender?.nickname || ''
    const msg = [
      `🎲 随机耄耋 — ${maodie.name}`,
      '',
      `「${maodie.description}」`,
      '',
      maodie.analysis,
      '',
      `— ${nickname}，你随机到了这只耄耋 🐾`
    ].join('\n')

    let imgPath = null
    for (const ext of ['png', 'jpg', 'jpeg', 'webp', 'gif']) {
      const p = path.join(PLUGIN_DIR, 'image', `${maodie.name}.${ext}`)
      if (fs.existsSync(p)) { imgPath = p; break }
    }
    if (imgPath) {
      await e.reply([msg, segment.image(imgPath)])
    } else {
      await e.reply(msg)
    }
    return true
  }

  async searchMaodie (e) {
    const keyword = e.msg.replace(/^#查找耄耋\s*/, '').trim()
    if (!keyword) {
      await e.reply('用法：#查找耄耋 名字')
      return true
    }
    const found = maodieList.filter(m => m.name === keyword || m.id === keyword)
    if (!found.length) {
      await e.reply(`没有找到包含「${keyword}」的耄耋`)
      return true
    }
    const list = found.slice(0, 5)
    const msg = list.map(m => {
      let imgMsg = ''
      for (const ext of ['png', 'jpg', 'jpeg', 'webp', 'gif']) {
        const imgPath = path.join(PLUGIN_DIR, 'image', `${m.name}.${ext}`)
        if (fs.existsSync(imgPath)) { imgMsg = segment.image(imgPath); break }
      }
      return [
        `🐱 ${m.name} — ${m.description}`,
        m.analysis,
        imgMsg
      ].filter(Boolean)
    })
    for (const m of msg) {
      await e.reply(m)
    }
    return true
  }

  async showCollection (e) {
    const uid = String(e.user_id)
    if (!collector[uid] || !collector[uid].length) {
      await e.reply('你还没有抽过耄耋呢，先发 #今日耄耋 抽一只吧 🐱')
      return true
    }

    await e.reply('正在生成耄耋图鉴... 🐱')

    try {
      const result = execSync(`${PYTHON} "${DEX_SCRIPT}" ${uid}`, {
        encoding: 'utf8',
        timeout: 30000
      }).trim()
      const imgPath = result.split('\n').pop()
      if (imgPath && fs.existsSync(imgPath)) {
        await e.reply(segment.image(imgPath))
      } else {
        await e.reply('图鉴生成失败...')
      }
    } catch (err) {
      logger.error('[rollmaodie] 生成图鉴失败:', err.message)
      await e.reply('图鉴生成出错了...')
    }
    return true
  }

  async listAll (e) {
    if (!ADMIN_IDS.includes(String(e.user_id))) {
      await e.reply('此功能仅管理员可用')
      return true
    }
    // 每10条一组，生成转发消息
    const chunks = []
    for (let i = 0; i < maodieList.length; i += 10) {
      const batch = maodieList.slice(i, i + 10)
      const lines = batch.map((m, j) => {
        let imgMsg = ''
        for (const ext of ['png', 'jpg', 'jpeg', 'webp', 'gif']) {
          const imgPath = path.join(PLUGIN_DIR, 'image', `${m.name}.${ext}`)
          if (fs.existsSync(imgPath)) { imgMsg = segment.image(imgPath); break }
        }
        return `${i + j + 1}. ${m.name} — ${m.description}\n${m.analysis}`
      }).join('\n\n')
      chunks.push(lines)
    }
    // 发送转发消息
    const msgList = chunks.map(text => ({
      message: text,
      nickname: e.bot?.nickname || '机器人',
      user_id: e.bot?.uin || e.self_id
    }))
    const sendForward = e.group?.sendForwardMsg || e.friend?.sendForwardMsg
    if (sendForward) return sendForward(msgList)
    // 降级为普通消息
    await e.reply(chunks.join('\n\n'))
    return true
  }
}
