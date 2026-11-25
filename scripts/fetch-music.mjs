/**
 * 构建前抓取网易云歌曲信息，生成 public/music.json
 *
 * 用法：node scripts/fetch-music.mjs
 * 歌曲 ID 来自 siteConfig.ts 的 cloudMusicIds 字段。
 *
 * 说明：
 * - 网易云的 /api/song/detail 接口对普通请求限流（405 操作频繁），
 *   所以歌曲信息改为解析歌曲页面 HTML 里的 og:title / og:image / description
 * - 歌词单独走 /api/song/lyric 接口（不受限流影响，纯音乐返回空歌词）
 * - 播放地址用固定外链 music.163.com/song/media/outer/url，不会过期
 * - 生成结果提交到仓库，静态站点直接读取 /music.json，不依赖服务端
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CONFIG_FILE = path.join(ROOT, 'siteConfig.ts');
const OUTPUT_FILE = path.join(ROOT, 'public', 'music.json');

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  Referer: 'https://music.163.com/',
  'Accept-Language': 'zh-CN,zh;q=0.9',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function readIds() {
  const content = await readFile(CONFIG_FILE, 'utf8');
  const match = content.match(/cloudMusicIds:\s*\[([\s\S]*?)\]/);
  if (!match) return [];
  return [...match[1].matchAll(/["']([^"']+)["']/g)].map((m) => m[1].trim()).filter(Boolean);
}

function pick(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim() : '';
}

async function fetchText(url, timeout = 12000) {
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function fetchSong(id) {
  const html = await fetchText(`https://music.163.com/song?id=${id}`);

  const name = pick(html, /<meta[^>]+property="og:title"[^>]+content="([^"]*)"/);
  const coverRaw = pick(html, /<meta[^>]+property="og:image"[^>]+content="([^"]*)"/);
  const description = pick(html, /"description":\s*"([^"]*)"/);

  if (!name) return null;

  // 描述形如「歌曲名《X》，别名《Y》，由 歌手 演唱，收录于《Z》专辑中」
  // 注意歌名里可能含「由」字（如《自由の時間》），所以取最后一处匹配
  const artistMatches = [...description.matchAll(/由\s*([^，。；\n]{1,40}?)\s*演唱/g)];
  const artist = artistMatches.length > 0 ? artistMatches[artistMatches.length - 1][1].trim() : '未知歌手';
  const cover = coverRaw.replace(/^http:\/\//, 'https://');

  // 歌词：纯音乐或接口异常时留空，不影响播放
  let lrc = '';
  try {
    const lrcRaw = await fetchText(
      `https://music.163.com/api/song/lyric?id=${id}&lv=-1&kv=-1&tv=-1`,
      8000,
    );
    const parsed = JSON.parse(lrcRaw);
    lrc = parsed?.lrc?.lyric || '';
  } catch {
    /* 歌词可选 */
  }

  return {
    id,
    name,
    artist,
    cover,
    url: `https://music.163.com/song/media/outer/url?id=${id}.mp3`,
    lrc,
  };
}

async function main() {
  const ids = await readIds();
  console.log(`读取到 ${ids.length} 首歌曲`);

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

  if (ids.length === 0) {
    await writeFile(OUTPUT_FILE, '[]\n', 'utf8');
    console.log('没有配置歌曲，已写入空列表');
    return;
  }

  const results = [];
  const failed = [];

  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i];
    try {
      const song = await fetchSong(id);
      if (song) {
        results.push(song);
        process.stdout.write(`\r[${i + 1}/${ids.length}] ${song.name} - ${song.artist}`.padEnd(60).slice(0, 60));
      } else {
        failed.push(id);
      }
    } catch {
      failed.push(id);
    }
    await sleep(180);
  }
  process.stdout.write('\n');

  await writeFile(OUTPUT_FILE, JSON.stringify(results, null, 2) + '\n', 'utf8');

  console.log(`✅ 成功 ${results.length} 首，写入 ${path.relative(ROOT, OUTPUT_FILE)}`);
  if (failed.length > 0) {
    console.log(`⚠️ 失败 ${failed.length} 首（可能已下架或版权受限）：${failed.join(', ')}`);
  }
}

main().catch((error) => {
  console.error('抓取音乐失败:', error);
  process.exit(1);
});
