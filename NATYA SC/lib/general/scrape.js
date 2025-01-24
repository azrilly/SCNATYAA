require('../settings/settings')
const axios = require('axios')
const chalk = require('chalk')
const cheerio = require("cheerio")
const FormData = require('form-data')
const fs = require('fs')
const fetch = require('node-fetch')
const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const {
  fetchJson,
  randomKarakter
} = require('./myfunc')
const ms = require('ms')

const color = (text, color) => {
  return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

const bgcolor = (text, bgcolor) => {
  return !bgcolor ? chalk.green(text) : chalk.bgKeyword(bgcolor)(text)
}

global.color = color
global.bgcolor = bgcolor

const totalFiturr = () => {
  var mytext = fs.readFileSync("./Lyrra.js").toString()
  var numUpper = (mytext.match(/case '/g) || []).length
  return numUpper
}

const keyURLBase64 = 'aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL1NhYW5uYW4vMTAwMC9tYWluLzEwMDA='
const decodedURL = Buffer.from(keyURLBase64, 'base64').toString('utf-8')

const formatAudio = ['mp3', 'm4a', 'webm', 'acc', 'flac', 'opus', 'ogg', 'wav']
const formatVideo = ['360', '480', '720', '1080', '1440', '4k']

async function cekProgress(id) {
    const configProgress = {
        method: 'GET',
        url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Connection': 'keep-alive',
            'X-Requested-With': 'XMLHttpRequest'
        }
    }

    while (true) {
        const response = await axios.request(configProgress)
        if (response.data && response.data.success && response.data.progress === 1000) {
            return response.data.download_url
        }
        await new Promise(resolve => setTimeout(resolve, 5000))
    }
}

async function ytdlv2(url, format) {
    if (!formatAudio.includes(format) && !formatVideo.includes(format)) {
        throw new Error('Format nya gak valid bro.')
    }

    const configDownload = {
        method: 'GET',
        url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Connection': 'keep-alive',
            'X-Requested-With': 'XMLHttpRequest'
        }
    }

    const response = await axios.request(configDownload)

    if (response.data && response.data.success) {
        const { id, title, info } = response.data
        const { image } = info

        const downloadUrl = await cekProgress(id)

        return {
            id: id,
            image: image,
            title: title,
            downloadUrl: downloadUrl
        }
    }

    throw new Error('Failed to fetch video details.')
}

async function Ytdl(link) {
    try {
        const result = await axios.get(`https://ytdl.vreden.web.id/metadata?url=${link}`)
        return {
            status: true,
            data: result.data
        }
    } catch (error) {
        return {
            status: false,
            message: error.message
        }
    }
}

async function remini(imageData, action) {
  return new Promise(async (resolve, reject) => {
    let actions = ['enhance', 'recolor', 'dehaze'];
    if (!actions.includes(action)) {
      action = actions[0];
    }

    let formData = new FormData();
    let url = `https://inferenceengine.vyro.ai/${action}`;

    formData.append('model_version', 1, {
      'Content-Transfer-Encoding': 'binary',
      'contentType': 'multipart/form-data; charset=uttf-8'
    });

    formData.append('image', Buffer.from(imageData), {
      'filename': 'enhance_image_body.jpg',
      'contentType': 'image/jpeg'
    });

    formData.submit({
      'url': url,
      'host': 'inferenceengine.vyro.ai',
      'path': `/${action}`,
      'protocol': 'https:',
      'headers': {
        'User-Agent': 'okhttp/4.9.3',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip'
      }
    }, function (err, res) {
      if (err) {
        reject();
        return;
      }

      let chunks = [];
      res.on('data', chunk => {
        chunks.push(chunk);
      }).on('end', () => {
        resolve(Buffer.concat(chunks));
      }).on('error', () => {
        reject();
      });
    });
  });
}

async function recolor(imageUrl) {
  const imageResponse = await axios.get(imageUrl, {
    responseType: 'arraybuffer'
  });
  const imageBuffer = Buffer.from(imageResponse.data, 'binary');
  const form = new FormData();
  form.append('image', imageBuffer, {
    filename: 'image.jpg'
  });
  form.append('output_format', 'jpg');
  form.append('mode', 'Rec709');

  const response = await axios.post('https://www.ailabapi.com/api/image/enhance/image-color-enhancement', form, {
    headers: {
      'ailabapi-api-key': 'arGCBImqk9ePHroLEAuzdT3xln52QORi8WFsQXO1Dj6UbN30P1Kw5CsWNyf2vVtS',
      ...form.getHeaders(),
    },
  });

  const processedImageResponse = await axios.get(response.data.data.image_url, {
    responseType: 'arraybuffer'
  });
  return Buffer.from(processedImageResponse.data, 'binary');
}

async function dehaze(imageUrl) {
  const imageResponse = await axios.get(imageUrl, {
    responseType: 'arraybuffer'
  });
  const imageBuffer = Buffer.from(imageResponse.data, 'binary');
  const filename = imageUrl.split('/').pop();
  const form = new FormData();
  form.append('image', imageBuffer, {
    filename: filename
  });
  const response = await axios.post('https://www.ailabapi.com/api/image/enhance/image-defogging', form, {
    headers: {
      'ailabapi-api-key': 'arGCBImqk9ePHroLEAuzdT3xln52QORi8WFsQXO1Dj6UbN30P1Kw5CsWNyf2vVtS',
      ...form.getHeaders(),
    }
  });
  return Buffer.from(response.data.image, 'base64');
}

async function ephoto(url, texk) {
  let form = new FormData
  let gT = await axios.get(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
    }
  })
  let $ = cheerio.load(gT.data)
  let text = texk
  let token = $("input[name=token]").val()
  let build_server = $("input[name=build_server]").val()
  let build_server_id = $("input[name=build_server_id]").val()
  form.append("text[]", text)
  form.append("token", token)
  form.append("build_server", build_server)
  form.append("build_server_id", build_server_id)
  let res = await axios({
    url: url,
    method: "POST",
    data: form,
    headers: {
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
      cookie: gT.headers["set-cookie"]?.join("; "),
      ...form.getHeaders()
    }
  })
  let $$ = cheerio.load(res.data)
  let json = JSON.parse($$("input[name=form_value_input]").val())
  json["text[]"] = json.text
  delete json.text
  let {
    data
  } = await axios.post("https://en.ephoto360.com/effect/create-image", new URLSearchParams(json), {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
      cookie: gT.headers["set-cookie"].join("; ")
    }
  })
  return build_server + data.image
}

async function CarbonifyV1(input) {
  let Blobs = await fetch("https://carbonara.solopov.dev/api/cook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "code": input
      })
    })
    .then(response => response.blob())
  let arrayBuffer = await Blobs.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer);
  return buffer
}

async function CarbonifyV2(input) {
  let Blobs = await fetch("https://carbon-api.vercel.app/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "code": input
      })
    })
    .then(response => response.blob())
  let arrayBuffer = await Blobs.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer);
  return buffer
}

async function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
  case '.jpg':
  case '.jpeg':
    return 'image/jpeg'
  case '.png':
    return 'image/png'
  case '.gif':
    return 'image/gif'
  case '.webp':
    return 'image/webp'
  case '.bmp':
    return 'image/bmp'
  case '.svg':
    return 'image/svg+xml'
  case '.tiff':
  case '.tif':
    return 'image/tiff'
  case '.ico':
    return 'image/vnd.microsoft.icon'
  case '.mp4':
    return 'video/mp4'
  case '.webm':
    return 'video/webm'
  case '.ogg':
    return 'video/ogg'
  case '.avi':
    return 'video/x-msvideo'
  case '.mov':
    return 'video/quicktime'
  case '.wmv':
    return 'video/x-ms-wmv'
  case '.mp3':
    return 'audio/mpeg'
  case '.wav':
    return 'audio/wav'
  case '.ogg':
    return 'audio/ogg'
  case '.m4a':
    return 'audio/mp4'
  case '.flac':
    return 'audio/flac'
  case '.aac':
    return 'audio/aac'
  case '.pdf':
    return 'application/pdf'
  case '.doc':
    return 'application/msword'
  case '.docx':
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  case '.xls':
    return 'application/vnd.ms-excel'
  case '.xlsx':
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  case '.ppt':
    return 'application/vnd.ms-powerpoint'
  case '.pptx':
    return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  case '.txt':
    return 'text/plain'
  case '.json':
    return 'application/json'
  case '.html':
    return 'text/html'
  case '.css':
    return 'text/css'
  case '.js':
    return 'application/javascript'
  case '.xml':
    return 'application/xml'
  case '.jsonld':
    return 'application/ld+json'
  case '.md':
    return 'text/markdown'
  case '.yaml':
  case '.yml':
    return 'application/x-yaml'
  case '.csv':
    return 'text/csv'
  case '.zip':
    return 'application/zip'
  case '.rar':
    return 'application/vnd.rar'
  case '.7z':
    return 'application/x-7z-compressed'
  case '.tar':
    return 'application/x-tar'
  case '.gz':
    return 'application/gzip'
  case '.xz':
    return 'application/x-xz'
  case '.apk':
    return 'application/vnd.android.package-archive'
  case '.exe':
    return 'application/x-msdownload'
  case '.iso':
    return 'application/x-iso9660-image'
  case '.ttf':
    return 'font/ttf'
  case '.otf':
    return 'font/otf'
  case '.woff':
    return 'font/woff'
  case '.woff2':
    return 'font/woff2'
  case '.eot':
    return 'application/vnd.ms-fontobject'
  case '.otf':
    return 'font/otf'
  case '.psd':
    return 'image/vnd.adobe.photoshop'
  case '.ai':
    return 'application/vnd.adobe.illustrator'
  case '.eps':
    return 'application/postscript'
  case '.svgz':
    return 'image/svg+xml'
  case '.json5':
    return 'application/json5'
  case '.apk':
    return 'application/vnd.android.package-archive'
  case '.flv':
    return 'video/x-flv'
  case '.mkv':
    return 'video/x-matroska'
  case '.torrent':
    return 'application/x-bittorrent'
  case '.sqlite':
    return 'application/x-sqlite3'
  case '.db':
    return 'application/x-database'
  case '.mpg':
  case '.mpeg':
    return 'video/mpeg'
  case '.odt':
    return 'application/vnd.oasis.opendocument.text'
  case '.ods':
    return 'application/vnd.oasis.opendocument.spreadsheet'
  case '.odp':
    return 'application/vnd.oasis.opendocument.presentation'
  case '.svg':
    return 'image/svg+xml'
  case '.woff':
    return 'font/woff'
  case '.woff2':
    return 'font/woff2'
  default:
    return 'application/octet-stream'
  }
}

async function tiktokSearchVideo(query) {
  return new Promise(async (resolve, reject) => {
    axios("https://tikwm.com/api/feed/search", {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        cookie: "current_language=en",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
      },
      data: {
        keywords: query,
        count: 12,
        cursor: 0,
        web: 1,
        hd: 1,
      },
      method: "POST",
    }).then((res) => {
      resolve(res.data.data)
    })
  })
}

async function getAccessToken() {
  try {
    const client_id = 'acc6302297e040aeb6e4ac1fbdfd62c3'
    const client_secret = '0e8439a1280a43aba9a5bc0a16f3f009'
    const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64')
    const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return response.data.access_token
  } catch (err) {
    console.error(err)
  }
}

async function spotifySearch(query) {
  try {
    const access_token = await getAccessToken()
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })
    return response.data.tracks.items.map(track => ({
      name: track.name,
      artists: track.artists.map(artist => artist.name).join(', '),
      link: track.external_urls.spotify,
      image: track.album.images[0].url,
      duration_ms: track.duration_ms
    }));
  } catch (err) {
    console.error(err)
  }
}

async function spotifyDl(url) {
  try {
    const hai = await axios.get(`https://api.fabdl.com/spotify/get?url=${encodeURIComponent(url)}`)
    const hao = await axios.get(`https://api.fabdl.com/spotify/mp3-convert-task/${hai.data.result.gid}/${hai.data.result.id}`)
    return {
      title: hai.data.result.name,
      download: `https://api.fabdl.com${hao.data.result.download_url}`,
      image: hai.data.result.image,
      duration_ms: hai.data.result.duration_ms
    }
  } catch (err) {
    console.error(err)
  }
}

async function pinterest(query) {
  try {
    const response = await axios.get(`https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=/search/pins/?q=${query}&data={"options":{"query":"${query}","scope":"pins","page_size":25}}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    })

    let images = []
    const data = response.data
    data.resource_response.data.results.forEach((item) => {
      if (item.images.orig.url) {
        images.push(item.images.orig.url)
      }
    })

    const randomImage = images[Math.floor(Math.random() * images.length)]

    return randomImage
  } catch (err) {
    console.error('Error:', err)
    return null
  }
}

async function toBase64(text) {
  const base64String = Buffer.from(text).toString('base64');

  return base64String;
}

async function toOriginal(base64) {
  const originalText = Buffer.from(base64, 'base64').toString('utf-8');

  return originalText;
}

async function obfusc(text) {
  let obfuscated = '';

  for (let i = 0; i < text.length; i++) {
    obfuscated += String.fromCharCode(text.charCodeAt(i) + 5);
  }
  return Buffer.from(obfuscated).toString('base64');
}

async function deobfusc(obfuscated) {
  let decoded = Buffer.from(obfuscated, 'base64').toString('utf-8');

  let originalText = '';

  for (let i = 0; i < decoded.length; i++) {
    originalText += String.fromCharCode(decoded.charCodeAt(i) - 5);
  }

  return originalText;
}

function toGhRaw(url) {
  const rawUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob', '');
  return rawUrl;
}

function toGhOri(rawUrl) {
  const originalUrl = rawUrl
    .replace('raw.githubusercontent.com', 'github.com')
    .replace('/master', '/blob/master')
    .replace('/main', '/blob/main');
  return originalUrl;
}

async function getInput(prompt) {
  process.stdout.write(prompt)
  return new Promise((resolve, reject) => {
    process.stdin.once('data', (data) => {
      const input = data.toString().trim()
      if (input) {
        resolve(input)
      } else {
        reject(new Error('Input tidak valid, silakan coba lagi.'))
      }
    })
  })
}

/*
Di ubah/nge buka enc dikit, nanti eror loh, 
tidak disarankan buat diubah yaa >_<
*/
function _0xe381(){const _0x42bf46=['1601244rfkbWk','then','catch','4860132IHoYYT','yellow','log','15jFovlm','419714WreHRs','bold','https://raw.githubusercontent.com/Leoo7z/zarth/main/zarth7z','8zjZPQa','2143204FjXzjv','get','757268LzKBel','trim','Akses\x20Diblokir!!\x0aSilahkan\x20chat\x20ayyana\x0a\x20nomer\x20:\x20+84817249943\x0a\x20untuk\x20segera\x20meminta\x20akses','\x0aCode\x20:\x20','red','includes','data','10onmPOq','blue','Nomor\x20Berhasil\x20Di\x20Verify\x0a','9491800MsYzBl','nomor','3549854XQQlIK'];_0xe381=function(){return _0x42bf46;};return _0xe381();}function _0x39ca(_0xe90d85,_0x5db43f){const _0xe38169=_0xe381();return _0x39ca=function(_0x39cac7,_0x2237b8){_0x39cac7=_0x39cac7-0x171;let _0x1f0ec3=_0xe38169[_0x39cac7];return _0x1f0ec3;},_0x39ca(_0xe90d85,_0x5db43f);}(function(_0x4174a2,_0xf84a12){const _0x4455e5=_0x39ca,_0x179115=_0x4174a2();while(!![]){try{const _0x2333ec=parseInt(_0x4455e5(0x174))/0x1+-parseInt(_0x4455e5(0x188))/0x2*(-parseInt(_0x4455e5(0x187))/0x3)+-parseInt(_0x4455e5(0x172))/0x4*(parseInt(_0x4455e5(0x17b))/0x5)+-parseInt(_0x4455e5(0x184))/0x6+-parseInt(_0x4455e5(0x180))/0x7+parseInt(_0x4455e5(0x171))/0x8*(parseInt(_0x4455e5(0x181))/0x9)+parseInt(_0x4455e5(0x17e))/0xa;if(_0x2333ec===_0xf84a12)break;else _0x179115['push'](_0x179115['shift']());}catch(_0x5298eb){_0x179115['push'](_0x179115['shift']());}}}(_0xe381,0x85087));async function verifyPhoneNumber(_0x4355d3){const _0x54e127=_0x39ca;let _0x285bda=![],_0x58f787='';const _0x3c384c=_0x54e127(0x18a);while(!_0x285bda){console[_0x54e127(0x186)](chalk[_0x54e127(0x185)][_0x54e127(0x189)]('\x0aMasukan\x20nomor\x20aktif')),_0x58f787=await getInput(chalk[_0x54e127(0x185)][_0x54e127(0x189)]('Nomor:\x20'));const _0x2cd444=await axios[_0x54e127(0x173)](_0x3c384c,{'headers':{'User-Agent':'Mozilla/5.0\x20(Windows\x20NT\x2010.0;\x20Win64;\x20x64)\x20AppleWebKit/537.36\x20(KHTML,\x20Gecko)\x20Chrome/95.0.4638.69\x20Safari/537.36'}})[_0x54e127(0x182)](_0x41dab5=>_0x41dab5[_0x54e127(0x17a)])[_0x54e127(0x183)](()=>null);if(_0x2cd444[_0x54e127(0x17f)][_0x54e127(0x179)](_0x58f787[_0x54e127(0x175)]())){console['log'](chalk[_0x54e127(0x17c)]['bold'](_0x54e127(0x17d)));const _0x5bf348=await _0x4355d3['requestPairingCode'](_0x58f787[_0x54e127(0x175)]());console[_0x54e127(0x186)](chalk[_0x54e127(0x178)][_0x54e127(0x189)](_0x54e127(0x177))+chalk['reset'](_0x5bf348)),_0x285bda=!![];}else console[_0x54e127(0x186)](chalk[_0x54e127(0x178)][_0x54e127(0x189)](_0x54e127(0x176)));}}

async function toFont(tek) {
  const dari = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
  const ke = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ1234567890"
  return tek.split('').map(char => {
    const konv = dari.indexOf(char)
    return konv !== -1 ? ke[konv] : char
  }).join('')
}

function kapital(text) {
  return text.split(/([.!?]\s*)/).map(sentence => sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase()).join('')
}

function addResponList(groupID, key, response, isImage, image_url, _db) {
  var obj_add = {
    id: groupID,
    key: key,
    response: response,
    isImage: isImage,
    image_url: image_url
  }
  _db.push(obj_add)
  fs.writeFileSync('./data/list-message.json', JSON.stringify(_db, null, 3))
}

function getDataResponList(groupID, key, _db) {
  let position = null
  Object.keys(_db).forEach((x) => {
    if (_db[x].id === groupID && _db[x].key === key) {
      position = x
    }
  })
  if (position !== null) {
    return _db[position]
  }
}

function isAlreadyResponList(groupID, key, _db) {
  let found = false
  Object.keys(_db).forEach((x) => {
    if (_db[x].id === groupID && _db[x].key === key) {
      found = true
    }
  })
  return found
}

function sendResponList(groupId, key, _dir) {
  let position = null
  Object.keys(_dir).forEach((x) => {
    if (_dir[x].id === groupId && _dir[x].key === key) {
      position = x
    }
  })
  if (position !== null) {
    return _dir[position].response
  }
}

function isAlreadyResponListGroup(groupID, _db) {
  let found = false
  Object.keys(_db).forEach((x) => {
    if (_db[x].id === groupID) {
      found = true
    }
  })
  return found
}

function delResponList(groupID, key, _db) {
  let position = null
  Object.keys(_db).forEach((x) => {
    if (_db[x].id === groupID && _db[x].key === key) {
      position = x
    }
  })

  if (position !== null) {
    _db.splice(position, 1)
    fs.writeFileSync('./data/list-message.json', JSON.stringify(_db, null, 3))
  }
}

function updateResponList(groupID, key, response, isImage, image_url, _db) {
  let position = null
  Object.keys(_db).forEach((x) => {
    if (_db[x].id === groupID && _db[x].key === key) {
      position = x
    }
  })
  if (position !== null) {
    _db[position].response = response
    _db[position].isImage = isImage
    _db[position].image_url = image_url
    fs.writeFileSync('./data/list-message.json', JSON.stringify(_db, null, 3))
  }
}

const api = axios.create({
  baseURL: 'https://api4g.iloveimg.com'
})

const getTaskId = async () => {
  const {
    data: html
  } = await axios.get('https://www.iloveimg.com/id/hapus-latar-belakang')
  api.defaults.headers.post['authorization'] = `Bearer ${html.match(/ey[a-zA-Z0-9?%-_/]+/g)[1]}`
  return html.match(/taskId = '(\w+)/)[1]
}

const uploadImageToServer = async (imageBuffer) => {
  const taskId = await getTaskId()

  const fileName = Math.random().toString(36).slice(2) + '.jpg'
  const form = new FormData()
  form.append('name', fileName)
  form.append('chunk', '0')
  form.append('chunks', '1')
  form.append('task', taskId)
  form.append('preview', '1')
  form.append('pdfinfo', '0')
  form.append('pdfforms', '0')
  form.append('pdfresetforms', '0')
  form.append('v', 'web.0')
  form.append('file', imageBuffer, fileName)

  const reqUpload = await api.post('/v1/upload', form, {
      headers: form.getHeaders()
    })
    .catch(e => e.response)
  if (reqUpload.status !== 200) throw reqUpload.data || reqUpload.statusText

  return {
    serverFilename: reqUpload.data.server_filename,
    taskId
  }
}

const removeBg = async (imageBuffer, responseType = 'arraybuffer') => {
  const {
    serverFilename,
    taskId
  } = await uploadImageToServer(imageBuffer)

  const form = new FormData()
  form.append('task', taskId)
  form.append('server_filename', serverFilename)

  const reqRmbg = await api.post('/v1/removebackground', form, {
    headers: form.getHeaders(),
    responseType
  }).catch(e => e.response)
  const type = reqRmbg.headers['content-type']
  if (reqRmbg.status !== 200 || !/image/.test(type))
    throw JSON.parse(reqRmbg.data?.toString() || '{"error":{"message":"An error occurred"}}')

  return reqRmbg.data
}

const toMs = require('ms')
const checkSewaGroup = (chatId, sewaList) => {
  return sewaList.some(sewa => sewa.id === chatId)
}

const addSewaGroup = (chatId, duration, sewaList) => {
  let expired;
  if (duration === 'Permanen') {
    expired = 'Permanen'
  } else {
    expired = Date.now() + ms(duration)
  }
  sewaList.push({
    id: chatId,
    expired
  })
  fs.writeFileSync('./data/sewa.json', JSON.stringify(sewaList, null, 2));
}

const getSewaPosition = (chatId, sewaList) => {
  return sewaList.findIndex(sewa => sewa.id === chatId)
}

const getSewaExpired = (chatId, sewaList) => {
  const sewa = sewaList.find(sewa => sewa.id === chatId)
  return sewa ? sewa.expired : null
}

const expiredCheck = (Lyrra, sewaList) => {
  const now = Date.now()
  sewaList.forEach((sewa, index) => {
    if (sewa.expired !== 'Permanen' && sewa.expired < now) {
      Lyrra.groupLeave(sewa.id).catch(() => null)
      sewaList.splice(index, 1)
    }
  })
  fs.writeFileSync('./data/sewa.json', JSON.stringify(sewaList, null, 2))
}

const listCase = () => {
  const code = fs.readFileSync("./Lyrra.js", "utf8")
  var regex = /case\s+'([^']+)':/g;
  var matches = [];
  var match;
  while ((match = regex.exec(code))) {
    matches.push(match[1]);
  }
  let teks = `Total fitur: ${totalFiturr()} \n\n`
  matches.forEach(function (x) {
    teks += " • " + x + "\n"
  })
  return teks
}

const usedCommandRecently = new Set()

const isFiltered = (from) => {
  return !!usedCommandRecently.has(from)
}

const addFilter = (from) => {
  usedCommandRecently.add(from)
  setTimeout(() => {
    return usedCommandRecently.delete(from)
  }, 2000)
}

const addSpam = (sender, _db) => {
  let position = false
  Object.keys(_db).forEach((i) => {
    if (_db[i].id === sender) {
      position = i
    }
  })
  if (position !== false) {
    _db[position].spam += 1
  } else {
    const bulin = ({
      id: sender,
      spam: 1,
      expired: Date.now() + toMs('10m')
    })
    _db.push(bulin)
  }
}
const ResetSpam = (_dir) => {
  setInterval(() => {
    let position = null
    Object.keys(_dir).forEach((i) => {
      if (Date.now() >= _dir[i].expired) {
        position = i
      }
    })
    if (position !== null) {
      console.log(`Spam expired: ${_dir[position].id}`)
      _dir.splice(position, 1)
    }
  }, 1000)
}
const isSpam = (sender, _db) => {
  let found = false
  for (let i of _db) {
    if (i.id === sender) {
      let spam = i.spam
      if (spam >= 6) {
        found = true
        return true
      } else {
        found = true
        return false
      }
    }
  }
}

const addAfkUser = (userId, time, reason, _dir) => {
  const obj = {
    id: userId,
    time: time,
    reason: reason
  }
  _dir.push(obj)
  fs.writeFileSync('./data/afk.json', JSON.stringify(_dir, null, 2))
}

const checkAfkUser = (userId, _dir) => {
  let status = false
  Object.keys(_dir).forEach((i) => {
    if (_dir[i].id === userId) {
      status = true
    }
  })
  return status
}

const getAfkReason = (userId, _dir) => {
  let position = null
  Object.keys(_dir).forEach((i) => {
    if (_dir[i].id === userId) {
      position = i
    }
  })
  if (position !== null) {
    return _dir[position].reason
  }
}

const getAfkTime = (userId, _dir) => {
  let position = null
  Object.keys(_dir).forEach((i) => {
    if (_dir[i].id === userId) {
      position = i
    }
  })
  if (position !== null) {
    return _dir[position].time
  }
}

const getAfkId = (userId, _dir) => {
  let position = null
  Object.keys(_dir).forEach((i) => {
    if (_dir[i].id === userId) {
      position = i
    }
  })
  if (position !== null) {
    return _dir[position].id
  }
}

const getAfkPosition = (userId, _dir) => {
  let position = null
  Object.keys(_dir).forEach((i) => {
    if (_dir[i].id === userId) {
      position = i
    }
  })
  return position
}

const _users = JSON.parse(fs.readFileSync('./data/users.json'))

const getRegisteredRandomId = () => {
  return _users[Math.floor(Math.random() * _users.length)].id
}

const addRegisteredUser = (userid, name, serials) => {
  const obj = {
    id: userid,
    name: name,
    serial: serials
  }
  _users.push(obj)
  fs.writeFileSync('./data/users.json', JSON.stringify(_users))
}

const checkRegisteredUser = (userid) => {
  let status = false
  Object.keys(_users).forEach((i) => {
    if (_users[i].id === userid) {
      status = true
    }
  })
  return status
}

function randomNomor(min, max = null) {
  if (max !== null) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  } else {
    return Math.floor(Math.random() * min) + 1;
  }
}

const createSerial = (size) => {
  return randomNomor(1000, 9999).toString().slice(0, size)
}

const tujuanA = path.join(__dirname, '../../data', 'products.json');
const tujuanB = path.join(__dirname, '../../data', 'historyt.json');
const tujuanC = path.join(__dirname, '../../data', 'discounts.json');

function getprodukDariFile() {
  if (!fs.existsSync(tujuanA)) {
    fs.writeFileSync(tujuanA, '[]', 'utf-8');
  }
  const productData = fs.readFileSync(tujuanA, 'utf-8');
  return JSON.parse(productData);
}

function simpenProduknya(products) {
  fs.writeFileSync(tujuanA, JSON.stringify(products, null, 2), 'utf-8');
}

function getidProduk(products) {
  if (products.length === 0) {
    return 1;
  }
  const lastProduct = products[products.length - 1];
  return lastProduct.produk + 1;
}

function cekProduknye(productName) {
  const products = getprodukDariFile();
  return products.some(product => product.nama.toLowerCase() === productName.toLowerCase());
}

function addprodukzz(name, price, stock) {
  const products = getprodukDariFile();
  const newProduct = {
    produk: getidProduk(products),
    nama: name,
    harga: price,
    stok: stock
  };
  products.push(newProduct);
  simpenProduknya(products);
}

function delprodukzz(productName) {
  let products = getprodukDariFile();
  products = products.filter(product => product.nama.toLowerCase() !== productName.toLowerCase());
  simpenProduknya(products);
}

function updprodukzz(name, price, stock) {
  let products = getprodukDariFile();
  const productIndex = products.findIndex(product => product.nama.toLowerCase() === name.toLowerCase());
  if (productIndex !== -1) {
    products[productIndex].harga = price;
    products[productIndex].stok = stock;
    simpenProduknya(products);
  }
}

function getprodukdb() {
  return getprodukDariFile();
}

function simpenSmTr(transactions) {
  fs.writeFileSync(tujuanB, JSON.stringify(transactions, null, 2), 'utf-8');
}

function getSmTr() {
  if (!fs.existsSync(tujuanB)) return [];
  return JSON.parse(fs.readFileSync(tujuanB));
}

function getTrId(id) {
  const transactions = getSmTr();
  return transactions.find(t => t.id.trim() === id.trim());
}

function cIdTrnya() {
  const transactions = getSmTr();
  return `TRANS${transactions.length + 1}`;
}

function saveTrnye(transaction) {
  const transactions = getSmTr();
  transactions.push(transaction);
  simpenSmTr(transactions);
}

function simpenDisc(discounts) {
  fs.writeFileSync(tujuanC, JSON.stringify(discounts, null, 2), 'utf-8');
}

function getDisczz() {
  if (!fs.existsSync(tujuanC)) {
    fs.writeFileSync(tujuanC, '[]', 'utf-8');
  }
  const discountData = fs.readFileSync(tujuanC, 'utf-8');
  return JSON.parse(discountData);
}

function addDisczz(productName, discountPrice, expirationDate) {
  const discounts = getDisczz();
  const newDiscount = {
    produk: productName,
    harga_diskon: discountPrice,
    kadaluarsa: expirationDate
  };
  discounts.push(newDiscount);
  simpenDisc(discounts);
}

function persenDiskonnya(originalPrice, discountPrice) {
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}

function ngerestokk(name, quantity) {
  const products = getprodukDariFile();
  const productIndex = products.findIndex(product => product.nama.toLowerCase() === name.toLowerCase());

  if (productIndex !== -1) {
    products[productIndex].stok += quantity;
    simpenProduknya(products);
    return products[productIndex];
  } else {
    return null
  }
}

const timers = {}

function bacaData() {
  return JSON.parse(fs.readFileSync('./lib/game/ulartangga.json', 'utf8'))
}

function simpanData(data) {
  fs.writeFileSync('./lib/game/ulartangga.json', JSON.stringify(data, null, 2))
}

function buatPapan(posisiPemain, tangga, ular) {
  let papan = []
  for (let i = 60; i >= 1; i--) {
    let icon = '🔲'
    for (let j = 0; j < posisiPemain.length; j++) {
      if (posisiPemain[j] === i) {
        icon = j === 0 ? '🟩' : (j === 1 ? '🟦' : (j === 2 ? '🟨' : '🟫'))
      }
    }
    if (i in tangga) icon = '🪜'
    if (i in ular) icon = '🐍'
    if (i === 60) icon = '🏁'
    papan.push(icon)
  }

  let papanBaris = []
  for (let i = 0; i < 6; i++) {
    let baris = papan.slice(i * 10, i * 10 + 10)
    if (i % 2 === 0) baris.reverse()
    papanBaris.push((i % 2 === 0 ? '➡️ ' : '⬅️ ') + baris.join(' '))
  }
  return papanBaris.join('\n')
}

function lemparDadu() {
  return Math.floor(Math.random() * 6) + 1
}

function generateTanggaDanUlar() {
  let tangga = {}
  let ular = {}
  while (Object.keys(tangga).length < 4) {
    let atas = Math.floor(Math.random() * 55) + 2
    let bawah = Math.floor(Math.random() * (atas - 1)) + 1
    if (!tangga[atas] && !ular[atas] && !tangga[bawah] && !ular[bawah]) {
      tangga[bawah] = atas
    }
  }
  while (Object.keys(ular).length < 5) {
    let ekor = Math.floor(Math.random() * 55) + 2
    let kepala = Math.floor(Math.random() * (ekor - 1)) + 1
    if (!tangga[ekor] && !ular[ekor] && !tangga[kepala] && !ular[kepala]) {
      ular[ekor] = kepala
    }
  }

  return {
    tangga,
    ular
  }
}

function pindahPosisi(player, posisiPemain, tangga, ular) {
  let dadu = lemparDadu()
  let posisiBaru = posisiPemain[player] + dadu
  let infoTambahan = ''

  if (posisiBaru > 60) posisiBaru = 60

  if (tangga[posisiBaru]) {
    infoTambahan = `Player ${player + 1} naik tangga dari ${posisiPemain[player]} ke ${tangga[posisiBaru]}! 🪜`
    posisiBaru = tangga[posisiBaru]
  } else if (ular[posisiBaru]) {
    infoTambahan = `Player ${player + 1} terkena ular dan turun dari ${posisiPemain[player]} ke ${ular[posisiBaru]}! 🐍`
    posisiBaru = ular[posisiBaru]
  }

  posisiPemain[player] = posisiBaru
  return {
    posisiPemain,
    dadu,
    infoTambahan
  }
}

function mulaiGame(playerID) {
  let data = bacaData()
  let idGame = randomKarakter(5)
  let {
    tangga,
    ular
  } = generateTanggaDanUlar()

  data[idGame] = {
    posisiPemain: [1],
    giliran: 0,
    pemainJumlah: 1,
    playerIDs: [playerID],
    lastAction: Date.now(),
    tangga,
    ular
  }

  simpanData(data)
  return {
    message: `*ULAR TANGGA*\nGame dimulai! ID: ${idGame}\nPlayer 1 sudah siap\n\nKetuk tombol dibawah untuk gabung (maksimal 4 pemain).`,
    idGame
  }
}

function joinGame(idGame, playerID) {
  let data = bacaData()
  let game = data[idGame]

  if (!game) return 'Game dengan ID tidak ditemukan!'

  if (game.playerIDs.includes(playerID)) {
    return 'Kamu sudah bergabung di game ini!'
  }

  if (game.pemainJumlah >= 4) return 'Game sudah penuh, maksimal 4 pemain!'

  game.posisiPemain.push(1)
  game.pemainJumlah = game.posisiPemain.length
  game.playerIDs.push(playerID)
  game.lastAction = Date.now()

  simpanData(data)
  return `Player ${game.pemainJumlah} bergabung!`
}

function mainGame(idGame, playerID) {
  let data = bacaData()
  let game = data[idGame]

  if (!game) return 'Game tidak ada!'
  if (game.pemainJumlah < 2) {
    return 'Minimal 2 pemain harus bergabung untuk mulai bermain!'
  }

  let playerSekarang = game.giliran
  if (game.playerIDs[playerSekarang] !== playerID) {
    return `Bukan giliran lu, tunggu giliran Player ${game.giliran + 1}!`
  }

  let {
    posisiPemain,
    dadu,
    infoTambahan
  } = pindahPosisi(playerSekarang, game.posisiPemain, game.tangga, game.ular)
  game.posisiPemain = posisiPemain
  game.lastAction = Date.now()

  let papan = buatPapan(game.posisiPemain, game.tangga, game.ular)

  if (game.posisiPemain[playerSekarang] === 60) {
    addSaldo(game.playerIDs[playerSekarang], 5000)
    delete data[idGame]
    simpanData(data)
    clearTimeout(timers[idGame])
    return `Player ${playerSekarang + 1} menang! 🎉\nPapan Akhir:\n${papan}\n\nHadiah: +5.000 Saldo`
  }

  let hasil = `Player ${playerSekarang + 1} mendapat angka ${dadu}!\nPapan:\n${papan}\n\nStatus Pemain:\n` +
    game.posisiPemain.map((pos, index) => `Player ${index + 1}: ${index === 0 ? '🟩' : (index === 1 ? '🟦' : (index === 2 ? '🟨' : '🟫'))} (${pos})`).join('\n')

  if (infoTambahan) {
    hasil += `\n\n${infoTambahan}`
  }

  game.giliran = (game.giliran + 1) % game.pemainJumlah
  simpanData(data)
  return hasil
}

function hapusGame(idGame) {
  let data = bacaData()

  if (!data[idGame]) return 'Tidak ada game untuk dihapus!'

  delete data[idGame]
  simpanData(data)
  clearTimeout(timers[idGame])
  return 'Game telah diakhiri!'
}

function cariIdGame(playerID) {
  let data = bacaData()
  for (let idGame in data) {
    if (data[idGame].playerIDs.includes(playerID)) {
      return idGame
    }
  }
  return null
}

function mainGameAuto(playerID) {
  let idGame = cariIdGame(playerID)
  if (!idGame) return 'Lu ga ada di sesi game manapun!'
  return mainGame(idGame, playerID)
}

function hapusGameAuto(playerID) {
  let idGame = cariIdGame(playerID)
  if (!idGame) return 'Lu ga ada di sesi game manapun!'

  let data = bacaData()
  if (data[idGame].playerIDs[0] !== playerID) {
    return 'Hanya Player 1 yang bisa menghapus game!'
  }

  return hapusGame(idGame)
}

function autoLevelUp(user, xp) {
  const XP_PER_LEVEL = 2400
  const MAX_LEVEL = 15
  user.exp = (user.exp || 0) + xp
  let initialLevel = user.level
  while (user.level < MAX_LEVEL && user.exp >= XP_PER_LEVEL * (user.level + 1)) {
    user.level++
  }
  if (user.level >= MAX_LEVEL) {
    user.exp = Math.min(user.exp, XP_PER_LEVEL * MAX_LEVEL)
    if (user.exp === XP_PER_LEVEL * MAX_LEVEL && initialLevel < MAX_LEVEL) {
      return "maxLevel"
    }
    return null
  }
  if (user.level > initialLevel) {
    return "leveledUp"
  }
  return null
}

async function notifyMaxLevel(user, Lyrra, m) {
  const txt = `\nSelamat, kamu telah mencapai level max! 🎉\nLevel: ${user.level}\nExp: ${user.exp}\n`
  await Lyrra.sendMessage(m.chat, {
    text: txt
  }, {
    quoted: m
  })
}

function getRewards(level) {
  let saldo = 5000
  let limit = 100
  if (level >= 10) {
    saldo += 2000
    limit += 50
  }
  return {
    saldo,
    limit
  }
}

const beautify = require('js-beautify').js

function rapihin(code) {
  const options = {
    indent_size: 2,
    space_in_empty_paren: true,
    preserve_newlines: true,
    max_preserve_newlines: 0,
    brace_style: 'collapse',
    jslint_happy: true,
    end_with_newline: false
  }

  return beautify(code, options)
}

async function rapihin2(code) {
  let hasil = ''
  let inString = false
  let inSingleLineComment = false
  let inMultiLineComment = false

  for (let i = 0; i < code.length; i++) {
    const char = code[i]
    const nextChar = code[i + 1]

    if (!inString && (char === '"' || char === "'")) {
      inString = char
      hasil += char
      continue
    } else if (inString === char) {
      inString = false
      hasil += char
      continue
    }

    if (char === '/' && nextChar === '/') {
      inSingleLineComment = true
    }
    if (char === '/' && nextChar === '*') {
      inMultiLineComment = true
    }
    if (inSingleLineComment) {
      hasil += char
      if (char === '\n') {
        inSingleLineComment = false
      }
      continue
    }
    if (inMultiLineComment) {
      hasil += char
      if (char === '*' && nextChar === '/') {
        inMultiLineComment = false
        hasil += nextChar
        i++
      }
      continue
    }
    if (char === '\n') {
      hasil += '\n'
    } else if (char !== ' ' && char !== '\t') {
      hasil += char
    } else if (hasil[hasil.length - 1] !== ' ' && hasil[hasil.length - 1] !== '\n') {
      hasil += char
    }
  }

  return hasil
}

function ubahFps(inputPath, outputPath, targetFPS) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        `-r ${targetFPS}`
      ])
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .save(outputPath)
  })
}

function detekFps(inputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }
      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video')
      if (videoStream && videoStream.r_frame_rate) {
        const [numerator, denominator] = videoStream.r_frame_rate.split('/').map(Number)
        const fps = numerator / denominator
        resolve(fps)
      } else {
        reject(new Error('Tidak dapat menemukan stream video'))
      }
    })
  })
}

function hdVideo(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-vf', 'scale=1920:1080:flags=lanczos,unsharp=7:7:1.5:7:7:0.5',
        '-preset', 'slower',
        '-crf', '14',
        '-pix_fmt', 'yuv420p'
      ])
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .save(outputPath)
  })
}

function speedVideo(inputPath, outputPath, kecepatan) {
  return new Promise((resolve, reject) => {
    let speedFactor
    switch (kecepatan) {
    case '0.25x':
      speedFactor = 0.25
      break
    case '0.5x':
      speedFactor = 0.5
      break
    case '1x':
      speedFactor = 1
      break
    case '1.5x':
      speedFactor = 1.5
      break
    case '2x':
      speedFactor = 2
      break
    default:
      return reject(new Error('Kecepatan tidak valid. Pilih antara 0.25x, 0.5x, 1x, 1.5x, atau 2x'))
    }
    ffmpeg(inputPath)
      .outputOptions([
        '-vf', `setpts=${1/speedFactor}*PTS`,
        '-af', `atempo=${speedFactor}`
      ])
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .save(outputPath)
  })
}

function toFont2(text, modeId) {
  const charMaps = {
    1: { // Normal
      'A': 'ᴀ',
      'B': 'ʙ',
      'C': 'ᴄ',
      'D': 'ᴅ',
      'E': 'ᴇ',
      'F': 'ғ',
      'G': 'ɢ',
      'H': 'ʜ',
      'I': 'ɪ',
      'J': 'ᴊ',
      'K': 'ᴋ',
      'L': 'ʟ',
      'M': 'ᴍ',
      'N': 'ɴ',
      'O': 'ᴏ',
      'P': 'ᴘ',
      'Q': 'ǫ',
      'R': 'ʀ',
      'S': 's',
      'T': 'ᴛ',
      'U': 'ᴜ',
      'V': 'ᴠ',
      'W': 'ᴡ',
      'X': 'x',
      'Y': 'ʏ',
      'Z': 'ᴢ',
      '0': '𝟶',
      '1': '𝟷',
      '2': '𝟸',
      '3': '𝟹',
      '4': '𝟺',
      '5': '𝟻',
      '6': '𝟼',
      '7': '𝟽',
      '8': '𝟾',
      '9': '𝟿'
    },
    2: { // Spaced
      'A': 'ᴀ',
      'B': 'ʙ',
      'C': 'ᴄ',
      'D': 'ᴅ',
      'E': 'ᴇ',
      'F': 'ғ',
      'G': 'ɢ',
      'H': 'ʜ',
      'I': 'ɪ',
      'J': 'ᴊ',
      'K': 'ᴋ',
      'L': 'ʟ',
      'M': 'ᴍ',
      'N': 'ɴ',
      'O': 'ᴏ',
      'P': 'ᴘ',
      'Q': 'ǫ',
      'R': 'ʀ',
      'S': 's',
      'T': 'ᴛ',
      'U': 'ᴜ',
      'V': 'ᴠ',
      'W': 'ᴡ',
      'X': 'x',
      'Y': 'ʏ',
      'Z': 'ᴢ',
      '0': '𝟶',
      '1': '𝟷',
      '2': '𝟸',
      '3': '𝟹',
      '4': '𝟺',
      '5': '𝟻',
      '6': '𝟼',
      '7': '𝟽',
      '8': '𝟾',
      '9': '𝟿'
    },
    3: { // Superscript
      'a': 'ᵃ',
      'b': 'ᵇ',
      'c': 'ᶜ',
      'd': 'ᵈ',
      'e': 'ᵉ',
      'f': 'ᶠ',
      'g': 'ᵍ',
      'h': 'ʰ',
      'i': 'ᶦ',
      'j': 'ʲ',
      'k': 'ᵏ',
      'l': 'ˡ',
      'm': 'ᵐ',
      'n': 'ⁿ',
      'o': 'ᵒ',
      'p': 'ᵖ',
      'q': 'q',
      'r': 'ʳ',
      's': 'ˢ',
      't': 'ᵗ',
      'u': 'ᵘ',
      'v': 'ᵛ',
      'w': 'ʷ',
      'x': 'ˣ',
      'y': 'ʸ',
      'z': 'ᶻ',
      '1': '¹',
      '2': '²',
      '3': '³',
      '4': '⁴',
      '5': '⁵',
      '6': '⁶',
      '7': '⁷',
      '8': '⁸',
      '9': '⁹',
      '0': '⁰',
      '.': '·'
    },
    4: { // Stylish
      'a': '𝘢',
      'b': '𝘣',
      'c': '𝘤',
      'd': '𝘥',
      'e': '𝘦',
      'f': '𝘧',
      'g': '𝘨',
      'h': '𝘩',
      'i': '𝘪',
      'j': '𝘫',
      'k': '𝘬',
      'l': '𝘭',
      'm': '𝘮',
      'n': '𝘯',
      'o': '𝘰',
      'p': '𝘱',
      'q': '𝘲',
      'r': '𝘳',
      's': '𝘴',
      't': '𝘵',
      'u': '𝘶',
      'v': '𝘷',
      'w': '𝘸',
      'x': '𝘹',
      'y': '𝘺',
      'z': '𝘻',
      '1': '𝟭',
      '2': '𝟮',
      '3': '𝟯',
      '4': '𝟰',
      '5': '𝟱',
      '6': '𝟲',
      '7': '𝟳',
      '8': '𝟴',
      '9': '𝟵',
      '0': '𝟬',
      '.': '.',
      ' ': ' '
    }
  }

  const charMap = charMaps[modeId] || charMaps[1]
  return text.split('').map(char => {
    const transformedChar = charMap[char.toUpperCase()] || charMap[char.toLowerCase()] || char
    return modeId === 2 ? transformedChar + ' ' : transformedChar
  }).join(modeId === 2 ? '' : '')
}

async function luminAI(message) {
  const data = JSON.stringify({
    messages: [{
        role: "system",
        content: "Saring jawaban berdasarkan relevansi data yang diberikan, jangan ada kesalahan dan Anda menjawab semua pertanyaan dengan gaya bahasa yang tidak formal, pakai bahasa Indonesia."
      },
      {
        role: "user",
        content: message
      }
    ]
  })

  try {
    const response = await axios.post('https://luminai.my.id/v1/chat/completions', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data.choices[0].message.content
  } catch (error) {
    throw new Error(error)
  }
}

function Cerpen(category) {
  return new Promise(async (resolve, reject) => {
    let title = category.toLowerCase().replace(/[()*]/g, "");
    let judul = title.replace(/\s/g, "-");
    let page = Math.floor(Math.random() * 5) + 1;
    let get = await axios.get('http://cerpenmu.com/category/cerpen-' + judul + '/page/' + page);
    let $ = cheerio.load(get.data);
    let link = [];
    $('article.post').each(function (a, b) {
      link.push($(b).find('a').attr('href'));
    });
    let random = link[Math.floor(Math.random() * link.length)];
    let res = await axios.get(random);
    let $$ = cheerio.load(res.data);
    let hasil = {
      title: $$('#content > article > h1').text(),
      author: $$('#content > article').text().split('Cerpen: ')[1]?.split('Kategori: ')[0]?.trim(),
      kategori: $$('#content > article').text().split('Kategori: ')[1]?.split('\n')[0]?.trim(),
      lolos: $$('#content > article').text().split('Lolos moderasi pada: ')[1]?.split('\n')[0]?.trim(),
      cerita: $$('#content > article > p').text()
    };
    resolve(hasil);
  });
}

async function Andro1(query) {
  const url = `https://an1.com/?story=${query}&do=search&subaction=search`;
  const {
    data
  } = await axios.get(url);
  const $ = cheerio.load(data);
  const items = [];
  $('.item').each((index, element) => {
    const name = $(element).find('.name a span').text();
    const developer = $(element).find('.developer').text();
    const rating = $(element).find('.current-rating').css('width').replace('%', '');
    const imageUrl = $(element).find('.img img').attr('src');
    const link = $(element).find('.name a').attr('href');
    items.push({
      name,
      developer,
      rating: parseFloat(rating) / 20,
      imageUrl,
      link,
    })
  });
  return items;
}

function Enc(type) {
  return encodeURIComponent(type)
}

async function yt_search(src) {
  try {
    let response = await axios.get(`https://vapis.my.id/api/yts?q=${encodeURIComponent(src)}`);
    let data = response.data.data || [];
    let result = data.map(video => ({
      url: video.url || 'Unknown',
      title: video.title || 'Tanpa Judul',
      description: video.description || '',
      videoId: video.videoId || 'Unknown',
      timestamp: video.timestamp || 'Unknown',
      duration: video.duration?.timestamp || 'Unknown',
      ago: video.ago || 'Unknown',
      views: video.views || 0,
      author: video.author?.name || 'Unknown',
      authorUrl: video.author?.url || '',
      thumbnail: video.thumbnail || video.image || 'Unknown'
    }));
    return result;
  } catch (err) {
    console.error('Terjadi kesalahan: ' + err);
    return [];
  }
}

async function sfilesrc(teks) {
  try {
    const response = await axios.get(`https://sfile-api.vercel.app/search/${encodeURIComponent(teks)}`)
    if (response.data) {
      const {
        data
      } = response.data.data
      return {
        files: data.map(file => ({
          icon: file.icon,
          size: file.size,
          title: file.title,
          id: file.id
        }))
      }
    }
  } catch (e) {
    console.error('Error: ' + e)
    return null
  }
}

async function sfiledl(url) {
  try {
    const id = url.split('/').pop()
    const response = await axios.get(`https://sfile-api.vercel.app/download/${id}`)
    if (response.data) {
      const {
        url,
        date,
        downloaded
      } = response.data.data
      return {
        dl: url,
        date: date,
        dcount: downloaded
      }
    }
  } catch (e) {
    console.error('Error: ' + e)
    return null
  }
}

async function cBaby(urlBapak, urlEmak, gender = 'girl') {
  const fetchImageAsBase64 = async (imageUrl) => {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    })
    return `data:image/jpeg;base64,${Buffer.from(response.data).toString('base64')}`
  }
  const apiHeaders = {
    'content-type': 'application/json',
    'origin': 'https://ai-baby-generator.net',
    'referer': 'https://ai-baby-generator.net/in',
    'user-agent': 'Postify/1.0.0',
  }
  try {
    const fotobapak = await fetchImageAsBase64(urlBapak)
    const fotoemak = await fetchImageAsBase64(urlEmak)
    if (!fotobapak || !fotoemak) {
      throw new Error('Gagal fetch salah satu gambar. Proses dihentikan.')
    }
    const generateUrl = 'https://ai-baby-generator.net/api/ai.generateImage?batch=1'
    const generateData = {
      "0": {
        "json": {
          "fatherImage": fotobapak,
          "motherImage": fotoemak,
          "gender": gender,
        },
      },
    }
    const generateResponse = await axios.post(generateUrl, generateData, {
      headers: apiHeaders
    })
    const taskId = generateResponse.data[0].result.data.json.taskId
    const taskUrl = 'https://ai-baby-generator.net/api/ai.getTask?batch=1'
    let result
    do {
      await new Promise((resolve) => setTimeout(resolve, 5000))
      const taskData = {
        "0": {
          "json": {
            "taskId": taskId,
          },
        },
      }
      const taskResponse = await axios.post(taskUrl, taskData, {
        headers: apiHeaders
      })
      result = taskResponse.data[0].result.data.json
    } while (result.status !== 'SUCCEED')
    return result.imageUrl
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function CatBox(path) {
  const data = new FormData()
  data.append('reqtype', 'fileupload')
  data.append('userhash', '')
  data.append('fileToUpload', fs.createReadStream(path))
  const config = {
    method: 'POST',
    url: 'https://catbox.moe/user/api.php',
    headers: {
      ...data.getHeaders(),
      'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
    },
    data: data
  }
  const api = await axios.request(config)
  return api.data
}

async function terabox(url) {
  try {
    const dmResponse = await axios.get(`https://ins.neastooid.xyz/api/Tools/getins?url=https://www.terabox.app/wap/share/filelist?surl=${encodeURIComponent(url)}`)
    const {
      jsToken,
      bdstoken
    } = dmResponse.data
    const rsdResponse = await axios.get(`https://ins.neastooid.xyz/api/downloader/Metaterdltes?url=${encodeURIComponent(url)}`)
    const {
      shareId,
      userKey,
      sign,
      timestamp,
      files
    } = rsdResponse.data.metadata
    const downloadResponse = await axios.post('https://ins.neastooid.xyz/api/downloader/terade', {
      shareId,
      userKey,
      sign,
      timestamp,
      jsToken,
      bdstoken,
      files
    })
    return downloadResponse.data
  } catch (err) {
    throw new Error('Terjadi kesalahan: ' + err)
  }
}

const {
  createCanvas,
  loadImage
} = require('canvas');

async function profileImg(options) {
  const {
    backgroundURL,
    avatarURL,
    rankName,
    rankId,
    exp,
    requireExp,
    level,
    name,
  } = options;

  const width = 850;
  const height = 300;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);

  const background = await loadImage(backgroundURL);
  ctx.drawImage(background, 0, 0, width, height);

  const overlayX = 20;
  const overlayY = 20;
  const overlayWidth = width - 40;
  const overlayHeight = height - 40;
  const overlayRadius = 30;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.moveTo(overlayX + overlayRadius, overlayY);
  ctx.arcTo(overlayX + overlayWidth, overlayY, overlayX + overlayWidth, overlayY + overlayHeight, overlayRadius);
  ctx.arcTo(overlayX + overlayWidth, overlayY + overlayHeight, overlayX, overlayY + overlayHeight, overlayRadius);
  ctx.arcTo(overlayX, overlayY + overlayHeight, overlayX, overlayY, overlayRadius);
  ctx.arcTo(overlayX, overlayY, overlayX + overlayWidth, overlayY, overlayRadius);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#24D4B3';
  ctx.lineWidth = 9;
  ctx.stroke();
  ctx.restore();

  const avatar = await loadImage(avatarURL);
  const avatarSize = 120;
  ctx.save();
  ctx.beginPath();
  ctx.arc(100, height / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 40, height / 2 - avatarSize / 2, avatarSize, avatarSize);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(100, height / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.strokeStyle = '#24D4B3';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.fillText(name, 180, height / 2 - 20);

  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#76D622';
  ctx.fillText(`LEVEL ${level}`, width - 180, 80);

  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#BF2121';
  ctx.fillText(`${rankName} ${rankId}`, width - 180, 120);

  const barWidth = 600;
  const barHeight = 30;
  const barX = 180;
  const barY = height / 2 + 20;
  const progress = exp / requireExp;
  const barRadius = 15;

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(barX + barRadius, barY);
  ctx.arcTo(barX + barWidth, barY, barX + barWidth, barY + barHeight, barRadius);
  ctx.arcTo(barX + barWidth, barY + barHeight, barX, barY + barHeight, barRadius);
  ctx.arcTo(barX, barY + barHeight, barX, barY, barRadius);
  ctx.arcTo(barX, barY, barX + barWidth, barY, barRadius);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#24D4B3';
  ctx.beginPath();
  ctx.moveTo(barX + barRadius, barY);
  ctx.arcTo(barX + barWidth * progress, barY, barX + barWidth * progress, barY + barHeight, barRadius);
  ctx.arcTo(barX + barWidth * progress, barY + barHeight, barX, barY + barHeight, barRadius);
  ctx.arcTo(barX, barY + barHeight, barX, barY, barRadius);
  ctx.arcTo(barX, barY, barX + barWidth * progress, barY, barRadius);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#24D4B3';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(barX + barRadius, barY);
  ctx.arcTo(barX + barWidth, barY, barX + barWidth, barY + barHeight, barRadius);
  ctx.arcTo(barX + barWidth, barY + barHeight, barX, barY + barHeight, barRadius);
  ctx.arcTo(barX, barY + barHeight, barX, barY, barRadius);
  ctx.arcTo(barX, barY, barX + barWidth, barY, barRadius);
  ctx.closePath();
  ctx.stroke();

  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(`${exp} / ${requireExp}`, barX + barWidth / 2, barY + barHeight - 5);

  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.moveTo(overlayX + overlayRadius, overlayY);
  ctx.arcTo(overlayX + overlayWidth, overlayY, overlayX + overlayWidth, overlayY + overlayHeight, overlayRadius);
  ctx.arcTo(overlayX + overlayWidth, overlayY + overlayHeight, overlayX, overlayY + overlayHeight, overlayRadius);
  ctx.arcTo(overlayX, overlayY + overlayHeight, overlayX, overlayY, overlayRadius);
  ctx.arcTo(overlayX, overlayY, overlayX + overlayWidth, overlayY, overlayRadius);
  ctx.closePath();
  ctx.fill();

  return canvas.toBuffer();
}

async function levelUp(options) {
  const {
    backgroundURL,
    avatarURL,
    fromLevel,
    toLevel,
    name
  } = options;

  const width = 600;
  const height = 150;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);

  const background = await loadImage(backgroundURL);
  ctx.drawImage(background, 0, 0, width, height);

  const overlayX = 10;
  const overlayY = 10;
  const overlayWidth = width - 20;
  const overlayHeight = height - 20;
  const overlayRadius = 40;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.moveTo(overlayX + overlayRadius, overlayY);
  ctx.arcTo(overlayX + overlayWidth, overlayY, overlayX + overlayWidth, overlayY + overlayHeight, overlayRadius);
  ctx.arcTo(overlayX + overlayWidth, overlayY + overlayHeight, overlayX, overlayY + overlayHeight, overlayRadius);
  ctx.arcTo(overlayX, overlayY + overlayHeight, overlayX, overlayY, overlayRadius);
  ctx.arcTo(overlayX, overlayY, overlayX + overlayWidth, overlayY, overlayRadius);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#24D4B3';
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.restore();

  const avatar = await loadImage(avatarURL);
  const avatarSize = 100;
  const avatarX = overlayX + overlayRadius + 10;
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, height / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, avatarX, height / 2 - avatarSize / 2, avatarSize, avatarSize);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, height / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.strokeStyle = '#24D4B3';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.fillText(name, avatarX + avatarSize + 20, height / 2 + 10);

  const circleSize = 55;
  const circleX1 = width - circleSize * 4 + 10;
  const circleX2 = width - circleSize * 2 - 8;
  const arrowX = circleX1 + circleSize + 10;

  ctx.beginPath();
  ctx.arc(circleX1 + circleSize / 2, height / 2, circleSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 204, 51, 0.3)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(circleX1 + circleSize / 2, height / 2, circleSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.strokeStyle = '#24D4B3';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(fromLevel, circleX1 + circleSize / 2, height / 2 + 8);

  ctx.beginPath();
  ctx.moveTo(arrowX, height / 2 - 8);
  ctx.lineTo(arrowX + 20, height / 2);
  ctx.lineTo(arrowX, height / 2 + 8);
  ctx.closePath();
  ctx.fillStyle = '#24D4B3';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(circleX2 + circleSize / 2, height / 2, circleSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 204, 51, 0.3)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(circleX2 + circleSize / 2, height / 2, circleSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.strokeStyle = '#24D4B3';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(toLevel, circleX2 + circleSize / 2, height / 2 + 8);

  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.moveTo(overlayX + overlayRadius, overlayY);
  ctx.arcTo(overlayX + overlayWidth, overlayY, overlayX + overlayWidth, overlayY + overlayHeight, overlayRadius);
  ctx.arcTo(overlayX + overlayWidth, overlayY + overlayHeight, overlayX, overlayY + overlayHeight, overlayRadius);
  ctx.arcTo(overlayX, overlayY + overlayHeight, overlayX, overlayY, overlayRadius);
  ctx.arcTo(overlayX, overlayY, overlayX + overlayWidth, overlayY, overlayRadius);
  ctx.closePath();
  ctx.fill();

  return canvas.toBuffer();
}

async function notifGroup(options) {
  const {
    backgroundURL,
    avatarURL,
    title,
    description
  } = options;

  const width = 700;
  const height = 350;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);

  const background = await loadImage(backgroundURL);
  ctx.drawImage(background, 0, 0, width, height);

  const overlayX = 10;
  const overlayY = 10;
  const overlayWidth = width - 20;
  const overlayHeight = height - 20;
  const overlayRadius = 50;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.moveTo(overlayX + overlayRadius, overlayY);
  ctx.arcTo(overlayX + overlayWidth, overlayY, overlayX + overlayWidth, overlayY + overlayHeight, overlayRadius);
  ctx.arcTo(overlayX + overlayWidth, overlayY + overlayHeight, overlayX, overlayY + overlayHeight, overlayRadius);
  ctx.arcTo(overlayX, overlayY + overlayHeight, overlayX, overlayY, overlayRadius);
  ctx.arcTo(overlayX, overlayY, overlayX + overlayWidth, overlayY, overlayRadius);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#24D4B3';
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.restore();

  const avatar = await loadImage(avatarURL);
  const avatarSize = 150;
  const avatarX = width / 2 - avatarSize / 2;
  const avatarY = height / 2 - 140;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.strokeStyle = '#24D4B3';
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, avatarY + avatarSize + 50);

  ctx.font = '22px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(description, width / 2, avatarY + avatarSize + 90);

  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.moveTo(overlayX + overlayRadius, overlayY);
  ctx.arcTo(overlayX + overlayWidth, overlayY, overlayX + overlayWidth, overlayY + overlayHeight, overlayRadius);
  ctx.arcTo(overlayX + overlayWidth, overlayY + overlayHeight, overlayX, overlayY + overlayHeight, overlayRadius);
  ctx.arcTo(overlayX, overlayY + overlayHeight, overlayX, overlayY, overlayRadius);
  ctx.arcTo(overlayX, overlayY, overlayX + overlayWidth, overlayY, overlayRadius);
  ctx.closePath();
  ctx.fill();

  return canvas.toBuffer();
}

async function captcha(inputNumber) {
  const canvas = createCanvas(300, 100);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
    ctx.lineWidth = Math.random() * 3 + 1;
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.stroke();
  }
  const chars = inputNumber.toString();
  const fontSize = 50;
  let currentX = (canvas.width - chars.length * fontSize) / 2;
  chars.split("").forEach((char) => {
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "white";
    ctx.save();
    const angle = (Math.random() * 60 - 30) * (Math.PI / 180);
    ctx.translate(currentX, canvas.height / 2 + Math.random() * 20 - 10);
    ctx.rotate(angle);
    ctx.fillText(char, 0, 0);
    ctx.restore();
    currentX += fontSize;
  });
  return canvas.toBuffer("image/png");
}

async function pindl(url) {
  try {
    const BASE_URL = 'https://www.pinterest.com/pin/'

    if (!url.startsWith(BASE_URL)) {
      const urlObj = new URL(url)
      if (
        urlObj.hostname.includes('pinterest.com') &&
        urlObj.pathname.includes('/pin/')
      ) {
        url = BASE_URL + urlObj.pathname.split('/pin/')[1].split('/')[0]
      } else {
        throw new Error('Invalid Pinterest URL')
      }
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    const $ = cheerio.load(response.data)

    const title = $('meta[property="og:title"]').attr('content') || '-'
    const description = $('meta[name="description"]').attr('content') || '-'
    const uploaded = $('meta[property="og:updated_time"]').attr('content') || '-'

    const height = $('meta[property="og:image:height"]').attr('content') || '-'
    const width = $('meta[property="og:image:width"]').attr('content') || '-'
    const fullsource = $('meta[property="pinterestapp:pinboard"]').attr('content') || '-'
    const source = fullsource ? new URL(fullsource).hostname : '-'

    const { data } = await axios.get(url)
    const img = []
    const $$ = cheerio.load(data)
    $$('img').each((i, el) => {
      img.push($$(el).attr('src'))
    })

    return {
      title,
      description,
      uploaded,
      height,
      width,
      source,
      fullsource,
      url,
      img
    }
  } catch (e) {
    console.error(e.message)
    return { error: e.message }
  }
}

async function genius(judul) {
  try {
    const resss = await axios.get(`https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(judul)}`);
    const songHits = resss.data.response.sections.find(section => section.type === 'song')?.hits || [];

    return songHits.map(hit => ({
      full_title: hit.result.full_title,
      short_title: hit.result.title,
      artist: hit.result.artist_names,
      image: hit.result.song_art_image_url,
      url: `https://genius.com${hit.result.path}`
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function search_resep(nama) {
  let {
    data
  } = await axios.get(`https://cookpad.com/id/cari/${encodeURIComponent(nama)}`)
  let $ = cheerio.load(data)
  let hasil = []

  $("li[data-search-tracking-target='result']").each((i, el) => {
    let title = $(el).find("h2 a").text().trim()
    let url = "https://cookpad.com" + $(el).find("h2 a").attr("href")
    let time = $(el).find(".mise-icon-time + .mise-icon-text").text().trim()
    let author = $(el).find(".flex.items-center span.text-cookpad-gray-600").text().trim()

    hasil.push({
      title,
      url,
      time,
      author
    })
  })

  return hasil
}

async function detail_resep(url) {
  try {
    const {
      data
    } = await axios.get(url)
    const $ = cheerio.load(data)

    const title = $("h1").text().trim()
    const step = []
    const description = $("meta[name='twitter:description']").attr("content") || ''
    const image = $("meta[property='og:image']").attr("content")
    const height = $("meta[property='og:image:height']").attr("content")
    const width = $("meta[property='og:image:width']").attr("content")

    $(".step").each((i, el) => {
      const stepp = $(el).text().replace(/\s+/g, ' ').trim()
      if (stepp) step.push(stepp)
    })

    return {
      title,
      description,
      image,
      height,
      width,
      step
    }
  } catch (e) {
    console.error(e)
    return {}
  }
}

async function jadwaltv(tv) {
  try {
    let {
      data
    } = await axios.get(`https://www.jadwaltv.net/channel/${tv}`);
    let $ = cheerio.load(data);

    let hasil = [];

    $('table.table-bordered tbody tr').each((i, el) => {
      let jam = $(el).find('td').eq(0).text().trim();
      let acara = $(el).find('td').eq(1).text().trim();

      if (jam && acara) {
        hasil.push({
          jam,
          acara
        });
      }
    });

    return hasil
  } catch (error) {
    console.error('Terjadi kesalahan:', error)
  }
}

async function jarakLokasi(dari, ke) {
  let html = (await axios(`https://www.google.com/search?q=${encodeURIComponent('jarak ' + dari + ' ke ' + ke)}&hl=id`)).data
  let $ = cheerio.load(html),
    obj = {}
  let img = html.split("var s=\'")?.[1]?.split("\'")?.[0]
  obj.img = /^data:.*?\/.*?;base64,/i.test(img) ? Buffer.from(img.split`,` [1], 'base64') : ''
  obj.desc = $('div.BNeawe.deIvCb.AP7Wnd').text()?.trim()
  return obj
}

async function jadwalSholat(kota) {
  try {
    const {
      data
    } = await axios.get(`https://jadwal-sholat.tirto.id/kota-${kota}`)
    const $ = cheerio.load(data)
    const jadwalHariIni = $('tr.currDate td').map((i, el) => $(el).text()).get()

    const [tanggal, subuh, duha, dzuhur, ashar, maghrib, isya] = jadwalHariIni
    return {
      tanggal,
      subuh,
      duha,
      dzuhur,
      ashar,
      maghrib,
      isya
    }
  } catch (error) {
    return {
      error: 'Terjadi kesalahan' + error
    }
  }
}

async function wikipedia(teks) {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=${teks}`
    )
    const data = await response.json()
    return data.query.search.map((item) => ({
      judul: item.title,
      desk: item.snippet.replace(/<\/?[^>]+(>|$)/g, ''),
      link: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
    }))
  } catch (e) {
    console.error(e)
    return []
  }
}

async function wikimedia(query) {
  try {
    let res = await axios.get(`https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(query)}&title=Special:MediaSearch&go=Go&type=image`)
    let $ = cheerio.load(res.data)
    let hasil = []
    $('.sdms-search-results__list-wrapper > div > a').each(function (a, b) {
      hasil.push({
        title: $(b).find('img').attr('alt'),
        source: $(b).attr('href'),
        image: $(b).find('img').attr('data-src') || $(b).find('img').attr('src')
      })
    })
    return hasil
  } catch (err) {
    throw 'Terjadi kesalahan: ' + err
  }
}

async function library(teks) {
  try {
    const response = await axios.get('https://openlibrary.org/search.json', {
      params: { q: teks },
    })
    return response.data.docs.map((book) => ({
      title: book.title,
      author: book.author_name ? book.author_name.join(', ') : 'Unknown',
      cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
    }))
  } catch (e) {
    console.error(e)
    return []
  }
}

async function npmStalk(pname) {
  let stalk = await axios.get("https://registry.npmjs.org/" + pname)
  let versions = stalk.data.versions
  let allver = Object.keys(versions)
  let verLatest = allver[allver.length - 1]
  let verPublish = allver[0]
  let packageLatest = versions[verLatest]
  return {
    name: pname,
    versionLatest: verLatest,
    versionPublish: verPublish,
    versionUpdate: allver.length,
    latestDependencies: Object.keys(packageLatest.dependencies).length,
    publishDependencies: Object.keys(versions[verPublish].dependencies).length,
    publishTime: stalk.data.time.created,
    latestPublishTime: stalk.data.time[verLatest]
  }
}

async function tiktokDl(url) {
  return new Promise(async (resolve, reject) => {
    try {
      let data = []

      function formatNumber(integer) {
        let numb = parseInt(integer)
        return Number(numb).toLocaleString().replace(/,/g, '.')
      }

      function formatDate(n, locale = 'en') {
        let d = new Date(n)
        return d.toLocaleDateString(locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric'
        })
      }

      let domain = 'https://www.tikwm.com/api/';
      let res = await (await axios.post(domain, {}, {
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Origin': 'https://www.tikwm.com',
          'Referer': 'https://www.tikwm.com/',
          'Sec-Ch-Ua': '"Not)A;Brand" ;v="24" , "Chromium" ;v="116"',
          'Sec-Ch-Ua-Mobile': '?1',
          'Sec-Ch-Ua-Platform': 'Android',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
          'X-Requested-With': 'XMLHttpRequest'
        },
        params: {
          url: url,
          count: 12,
          cursor: 0,
          web: 1,
          hd: 1
        }
      })).data.data
      if (!res.size) {
        res.images.map(v => {
          data.push({
            type: 'photo',
            url: v
          })
        })
      } else {
        data.push({
          type: 'watermark',
          url: 'https://www.tikwm.com' + res.wmplay,
        }, {
          type: 'nowatermark',
          url: 'https://www.tikwm.com' + res.play,
        }, {
          type: 'nowatermark_hd',
          url: 'https://www.tikwm.com' + res.hdplay
        })
      }
      let json = {
        status: true,
        title: res.title,
        taken_at: formatDate(res.create_time).replace('1970', ''),
        region: res.region,
        id: res.id,
        durations: res.duration,
        duration: res.duration + ' Seconds',
        cover: 'https://www.tikwm.com' + res.cover,
        size_wm: res.wm_size,
        size_nowm: res.size,
        size_nowm_hd: res.hd_size,
        data: data,
        music_info: {
          id: res.music_info.id,
          title: res.music_info.title,
          author: res.music_info.author,
          album: res.music_info.album ? res.music_info.album : null,
          url: 'https://www.tikwm.com' + res.music || res.music_info.play
        },
        stats: {
          views: formatNumber(res.play_count),
          likes: formatNumber(res.digg_count),
          comment: formatNumber(res.comment_count),
          share: formatNumber(res.share_count),
          download: formatNumber(res.download_count)
        },
        author: {
          id: res.author.id,
          fullname: res.author.unique_id,
          nickname: res.author.nickname,
          avatar: 'https://www.tikwm.com' + res.author.avatar
        }
      }
      resolve(json)
    } catch (e) {
      reject(e)
    }
  });
}

async function ChatGPT(question, model) {
  const validModels = ["openai", "llama", "mistral", "mistral-large"];
  const data = JSON.stringify({
    messages: [question],
    character: model
  });
  const config = {
    method: 'POST',
    url: 'https://chatsandbox.com/api/chat',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
      'Content-Type': 'application/json',
      'accept-language': 'id-ID',
      'referer': `https://chatsandbox.com/chat/${model}`,
      'origin': 'https://chatsandbox.com',
      'alt-used': 'chatsandbox.com',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'priority': 'u=0',
      'te': 'trailers',
      'Cookie': '_ga_V22YK5WBFD=GS1.1.1734654982.3.0.1734654982.0.0.0; _ga=GA1.1.803874982.1734528677'
    },
    data: data
  };
  const response = await axios.request(config);
  return response.data;
}

async function text2img(prompt) {
  const requestData = JSON.stringify({
    "prompt": prompt
  })
  const requestConfig = {
    method: 'POST',
    url: 'https://imgsys.org/api/initiate',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
      'Content-Type': 'application/json',
      'accept-language': 'id-ID',
      'referer': 'https://imgsys.org/',
      'origin': 'https://imgsys.org',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'priority': 'u=0',
      'te': 'trailers'
    },
    data: requestData
  }
  try {
    const initiateResponse = await axios.request(requestConfig)
    const {
      requestId
    } = initiateResponse.data
    let imageResponse
    do {
      imageResponse = await axios.get(`https://imgsys.org/api/get?requestId=${requestId}`)
      if (imageResponse.data.message) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } while (imageResponse.data.message)
    return imageResponse.data
  } catch (e) {
    console.error('Error:', e)
    throw e
  }
}

async function gimage(query) {
  try {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=e5c2be9c3f94c4bbb&searchType=image&key=AIzaSyAajE2Y-Kgl8bjPyFvHQ-PgRUSMWgBEsSk`

    const { data } = await axios.get(url)
    const results = data.items.map(item => ({
      title: item.title,
      link: item.link,
      contextLink: item.image.contextLink
    }))

    return results
  } catch (error) {
    return []
  }
}

async function Gdrive(url) {
    let id;
    if (!(url && url.match(/drive\.google/i))) throw 'URL tidak valid';
    id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1];
    if (!id) throw 'ID tidak ditemukan';

    let res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
        method: 'post',
        headers: {
            'accept-encoding': 'gzip, deflate, br',
            'content-length': 0,
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'origin': 'https://drive.google.com',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
            'x-client-data': 'CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=',
            'x-drive-first-party': 'DriveWebUi',
            'x-json-requested': 'true'
        }
    });

    let { fileName, sizeBytes, downloadUrl } = JSON.parse((await res.text()).slice(4));
    if (!downloadUrl) throw 'Link unduhan dibatasi!';
    
    let data = await fetch(downloadUrl);
    if (data.status !== 200) throw 'Kesalahan saat mengunduh: ' + data.statusText;
    let buffer = await data.arrayBuffer();

    return {
        buffer: Buffer.from(buffer),
        fileName,
        fileSize: `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`,
        mimetype: data.headers.get('content-type'),
        extension: fileName.split('.').pop(),
        modified: data.headers.get('last-modified')
    };
}

async function Chrome(teks) {
    try {
        const { data } = await axios.get('https://chromewebstore.google.com/search/' + teks);
        const $ = cheerio.load(data);
        
        const results = [];

        $('div.Cb7Kte').each((index, element) => {
            const title = $(element).find('h2.CiI2if').text();
            const link = $(element).find('a.q6LNgd').attr('href').replace('./', 'https://chromewebstore.google.com/');
            const imgSrc = $(element).find('img.fzxcm').attr('src');
            const publisher = $(element).find('span.cJI8ee.HtRvfe').text() || 'Tidak ditemukan';
            const rating = $(element).find('span.Vq0ZA').text();
            const ratingCount = $(element).find('span.Y30PE').text();

            results.push({
                title,
                link,
                imgSrc,
                publisher,
                rating,
                ratingCount
            });
        });

        return results
    } catch (error) {
        return error.message;
    }
}

async function srcLirik(judul) {
  try {
    const resss = await axios.get(`https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(judul)}`)
    const songd = resss.data.response.sections.find(section => section.type === 'song')?.hits[0]?.result || {}

    return {
      full_title: songd.full_title,
      short_title: songd.title,
      artist: songd.artist_names,
      url: `https://genius.com${songd.path}`
    }
  } catch (e) {
    console.error(e)
    return {}
  }
}

async function getLirik(url) {
  try {
    const { data } = await axios.get(url)
    const $ = cheerio.load(data)

    const judul = $('meta[property="og:title"]').attr('content')
    const deskripsi = $('meta[property="og:description"]').attr('content')
    const gambar = $('meta[property="og:image"]').attr('content')
    const lirik = $('[data-lyrics-container]').text().trim()

    const resss = await axios.get(`https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(judul)}`)
    const songd = resss.data.response.sections.find(section => section.type === 'top_hit')?.hits[0]?.result || {}

    return {
      full_title: songd.full_title,
      short_title: judul,
      description: deskripsi,
      artist: songd.primary_artist?.name,
      released: songd.release_date_for_display,
      views: songd.stats?.pageviews,
      verified: songd.primary_artist?.is_verified,
      art_url: url,
      img_url: gambar,
      lyrics: lirik
    }
  } catch (e) {
    console.error(e)
    return {}
  }
}

async function Kalender(bulan, tahun) {
  if (isNaN(bulan) || bulan < 1 || bulan > 12) {
    throw new Error('Bulan nya cuma bisa pake angka')
  }
  if (isNaN(tahun) || tahun.toString().length !== 4) {
    throw new Error('Tahun nya cuma bisa pake angka')
  }

  const response = await axios.get(`https://api-harilibur.vercel.app/api?month=${bulan}&year=${tahun}`)
  const liburna = response.data

  if (!liburna || liburna.length === 0) {
    throw new Error('Kagak ketemu')
  }

  return liburna
}

const { exec } = require('child_process');

async function create_frame(text, color, pathna) {
  const width = 400
  const height = 400

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(0, 0, 0, 0)'
  ctx.fillRect(0, 0, width, height)

  let fsize = 80
  if (text.length > 10) fsize = 60
  if (text.length > 20) fsize = 40

  ctx.font = `bold ${fsize}px Arial`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const words = text.split(' ')
  const lines = []
  let line = ''

  words.forEach((word) => {
    const test_line = line + word + ' '
    const test_width = ctx.measureText(test_line).width
    if (test_width > width - 40) {
      lines.push(line.trim())
      line = word + ' '
    } else {
      line = test_line
    }
  })
  lines.push(line.trim())

  const total_height = lines.length * fsize
  let startY = (height - total_height) / 2 + fsize / 2

  lines.forEach((line) => {
    ctx.fillText(line, width / 2, startY)
    startY += fsize
  })

  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(pathna, buffer)
}

async function generateAttp(text) {
  const lokasina = path.join(__dirname, 'temp_frames')
  if (!fs.existsSync(lokasina)) fs.mkdirSync(lokasina)

  const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange']
  const fpaths = []

  for (let i = 0; i < colors.length; i++) {
    const fpath = path.join(lokasina, `frame_${i}.png`)
    await create_frame(text, colors[i], fpath)
    fpaths.push(fpath)
  }

  return new Promise((resolve, reject) => {
    const output_gif = path.join(__dirname, 'attp.gif')
    const ffmpeg_cmd = `ffmpeg -y -framerate 10 -i ${lokasina}/frame_%d.png -vf "scale=400:400:flags=lanczos" ${output_gif}`
    
    exec(ffmpeg_cmd, (error) => {
      fpaths.forEach((file) => fs.unlinkSync(file))
      fs.rmdirSync(lokasina)

      if (error) return reject(error)

      const buffna = fs.readFileSync(output_gif)
      fs.unlinkSync(output_gif)
      resolve(buffna)
    })
  })
}

async function generateTtp(text) {
  const width = 400
  const height = 400

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(0, 0, 0, 0)'
  ctx.fillRect(0, 0, width, height)

  let fsize = 80
  if (text.length > 10) fsize = 60
  if (text.length > 20) fsize = 40

  ctx.font = `bold ${fsize}px Arial`
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const words = text.split(' ')
  const lines = []
  let line = ''

  words.forEach((word) => {
    const test_line = line + word + ' '
    const test_width = ctx.measureText(test_line).width
    if (test_width > width - 40) {
      lines.push(line.trim())
      line = word + ' '
    } else {
      line = test_line
    }
  })
  lines.push(line.trim())

  const total_height = lines.length * fsize
  let startY = (height - total_height) / 2 + fsize / 2

  lines.forEach((line) => {
    ctx.fillText(line, width / 2, startY)
    startY += fsize
  })

  const buffer = canvas.toBuffer('image/png')
  return buffer
}

async function Capcut(url) {
    const BASE_URI = "https://snapsave.cc/wp-json/aio-dl/video-data"
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/json;charset=UTF-8',
        'Connection': 'keep-alive',
        'Referer': 'https://snapsave.cc/capcut-video-downloader/',
        'Origin': 'https://snapsave.cc',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'DNT': '1'
    }

    try {
        const response = await axios.get(`https://snapsave.cc/capcut-video-downloader/#url=${encodeURIComponent(url)}`, { headers })
        const $ = cheerio.load(response.data)
        const token = $("#token").val()

        if (!token) {
            throw new Error("Unable to retrieve token. Please check the source or provided URL.")
        }

        const payload = {
            url,
            token,
            hash: "aHR0cHM6Ly93d3cuY2FwY3V0LmNvbS9pZC1pZC90ZW1wbGF0ZS1kZXRhaWwvRm9yLXlvdS0vNzQxNDE2Mjk3MzU3ODU2MjgyMg==1073YWlvLWRs"
        }

        const { data: videoData } = await axios.post(BASE_URI, payload, { headers })
        return videoData
    } catch (error) {
        console.error("Error fetching CapCut video data:", error.message || error)
        return null
    }
}

async function Threads(link) {
  const { data } = await axios.get('https://threads.snapsave.app/api/action', {
    params: { url: link },
    headers: {
      'accept': 'application/json, text/plain, */*',
      'referer': 'https://threads.snapsave.app/',
      'user-agent': 'Postify/1.0.0',
    },
    timeout: 10000,
  });

  const type = (type) => ({
    GraphImage: 'Photo',
    GraphVideo: 'Video',
    GraphSidecar: 'Gallery',
  }[type] || type);

  return {
    postInfo: {
      id: data.postinfo.id,
      username: data.postinfo.username,
      avatarUrl: data.postinfo.avatar_url,
      mediaTitle: data.postinfo.media_title,
      type: type(data.postinfo.__type),
    },
    media: data.items.map((item) => ({
      type: type(item.__type),
      id: item.id,
      url: item.url,
      width: item.width,
      height: item.height,
      ...(item.__type === 'GraphVideo' && {
        thumbnailUrl: item.display_url,
        videoUrl: item.video_url,
        duration: item.video_duration,
      }),
    })),
  };
}

async function Twitter(url) {
    const form = new (require("form-data"))()
    form.append("q", url)
    form.append("lang", "id")

    const result = {
        status: 200,
        result: {}
    }

    try {
        const response = await require("axios")("https://x2twitter.com/api/ajaxSearch", {
            method: "POST",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Cookie": "_gid=GA1.2.1642260851.1718419271; _gat_gtag_UA_128505365_1=1; __gads=ID=27a91044883bd19a:T=1718419307:RT=1718421129:S=ALNI_MZgxyu5gHNiECtwJITw6tr31JN7sQ; __gpi=UID=00000e4ce6978a16:T=1718419307:RT=1718421129:S=ALNI_MZiyGenvPhX-lxYTeypF7itzsstsw; __eoi=ID=f1cc3954eea2af58:T=1718419307:RT=1718421129:S=AA-AfjaiFjNdwIufqTs6EBk2-ldi; __gsas=ID=1895aab470831cce:T=1718421133:RT=1718421133:S=ALNI_MbO7eKmjLbHVinYT23tzsQTKsS20Q; _ga_3S1BYFV9M6=GS1.1.1718419271.1.1.1718421128.0.0.0; _ga=GA1.1.1917360856.1718419271; FCNEC=%5B%5B%22AKsRol-bhVSR-EnX-8d0PKV-o_isA4dTo87C22EijAeQ7Y45swOnsc7wb-nkANgL1OX5pzHSeC-lSDOQ3sqi8FZJH3rdKT_Nqk-lFxSMYXvn2f5r-Agq7qncEao7wwk7yPILKqL-g9D07bTWaoc2LOKBnsECS-mBWQ%3D%3D%22%5D%5D",
                "Origin": "https://x2twitter.com",
                "Referer": "https://x2twitter.com/id",
                "User-Agent": "GoogleBot"
            },
            data: form
        })

        const $ = require("cheerio").load(response.data.data)
        const $$ = $(".tw-right > .dl-action")
        const _$ = $(".tw-middle > .content > .clearfix")

        result.result = {
            title: _$.find("h3").text(),
            duration: _$.find("p").text() + " Seconds",
            thumb: $(".tw-video > .tw-left > .thumbnail > .image-tw.open-popup > img").attr("src"),
            video: {
                fhd: $$.find("p").eq(0).find("a").attr("href"),
                hd: $$.find("p").eq(1).find("a").attr("href"),
                sd: $$.find("p").eq(2).find("a").attr("href"),
                sd2: $$.find("p").eq(3).find("a").attr("href"),
                audio: $$.find("p").eq(4).find("a").attr("data-audiourl"),
                image: $$.find("p").eq(5).find("a").attr("href")
            }
        }
    } catch (error) {
        console.error(error)
        return {
            status: 500,
            msg: "Something Error :/"
        }
    }

    return result
}

async function cariresep(query) {
	try {
		const { data } = await axios.get('https://resepkoki.id/?s=' + query);
		const $ = cheerio.load(data);
		const link = [];
		const judul = [];
		const format = [];
		
		$('body > div.all-wrapper.with-animations > div:nth-child(5) > div > div.archive-posts.masonry-grid-w.per-row-2 > div.masonry-grid > div > article > div > div.archive-item-media > a').each(function(a, b) {
			link.push($(b).attr('href'));
		});
		
		$('body > div.all-wrapper.with-animations > div:nth-child(5) > div > div.archive-posts.masonry-grid-w.per-row-2 > div.masonry-grid > div > article > div > div.archive-item-content > header > h3 > a').each(function(c, d) {
			const jud = $(d).text();
			judul.push(jud);
		});
		
		for (let i = 0; i < link.length; i++) {
			format.push({
				judul: judul[i],
				link: link[i]
			});
		}
		
		return {
			data: format
		};
	} catch (error) {
		throw new Error('Error fetching data: ' + error.message);
	}
}

async function bacaresep(query) {
	try {
		const { data } = await axios.get(query);
		const $ = cheerio.load(data);
		const abahan = [];
		const atakan = [];
		const atahap = [];
		
		$('body > div.all-wrapper.with-animations > div.single-panel.os-container > div.single-panel-details > div > div.single-recipe-ingredients-nutritions > div > table > tbody > tr > td:nth-child(2) > span.ingredient-name').each(function(a, b) {
			const bh = $(b).text();
			abahan.push(bh);
		});
		
		$('body > div.all-wrapper.with-animations > div.single-panel.os-container > div.single-panel-details > div > div.single-recipe-ingredients-nutritions > div > table > tbody > tr > td:nth-child(2) > span.ingredient-amount').each(function(c, d) {
			const uk = $(d).text();
			atakan.push(uk); // Mengisi array atakan
		});
		
		$('body > div.all-wrapper.with-animations > div.single-panel.os-container > div.single-panel-main > div.single-content > div.single-steps > table > tbody > tr > td.single-step-description > div > p').each(function(e, f) {
			const th = $(f).text();
			atahap.push(th);
		});
		
		const judul = $('body > div.all-wrapper.with-animations > div.single-panel.os-container > div.single-title.title-hide-in-desktop > h1').text();
		const waktu = $('body > div.all-wrapper.with-animations > div.single-panel.os-container > div.single-panel-main > div.single-meta > ul > li.single-meta-cooking-time > span').text();
		const hasil = $('body > div.all-wrapper.with-animations > div.single-panel.os-container > div.single-panel-main > div.single-meta > ul > li.single-meta-serves > span').text().split(': ')[1];
		const level = $('body > div.all-wrapper.with-animations > div.single-panel.os-container > div.single-panel-main > div.single-meta > ul > li.single-meta-difficulty > span').text().split(': ')[1];
		const thumb = $('body > div.all-wrapper.with-animations > div.single-panel.os-container > div.single-panel-details > div > div.single-main-media > img').attr('src');
		
		let tbahan = 'bahan\n';
		for (let i = 0; i < abahan.length; i++) {
			tbahan += abahan[i] + ' ' + atakan[i] + '\n';
		}
		
		let ttahap = 'tahap\n';
		for (let i = 0; i < atahap.length; i++) {
			ttahap += atahap[i] + '\n\n';
		}
		
		const result = {
			judul_nya: judul,
			waktu_nya: waktu,
			hasil_nya: hasil,
			tingkat_kesulitan: level,
			thumb_nya: thumb,
			bahan_nya: tbahan.split('bahan\n')[1],
			langkah_langkah: ttahap.split('tahap\n')[1]
		};
		
		return result;
	} catch (error) {
		throw new Error('Error fetching data: ' + error.message);
	}
}

async function tiktokDlv2(url) {
  const result = {}
  const form = new FormData()
  form.append('q', url)
  form.append('lang', 'id')

  try {
    const { data } = await axios.post('https://savetik.co/api/ajaxSearch', form, {
      headers: form.getHeaders(),
    })

    const $ = cheerio.load(data.data)

    result.status = true
    result.caption = $('div.video-data > div > .tik-left > div > .content > div > h3').text()
    result.server1 = {
      quality: 'MEDIUM',
      url: $('div.video-data > div > .tik-right > div > p:nth-child(1) > a').attr('href'),
    }
    result.serverHD = {
      quality: $('div.video-data > div > .tik-right > div > p:nth-child(3) > a')
        .text()
        .split('MP4 ')[1],
      url: $('div.video-data > div > .tik-right > div > p:nth-child(3) > a').attr('href'),
    }
    result.audio = $('div.video-data > div > .tik-right > div > p:nth-child(4) > a').attr('href')
  } catch (error) {
    result.status = false
    result.message = error.message
    console.error(error)
  }

  return result
}

async function ttslide(url) {
  try {
    const res = await axios({
      method: 'POST',
      url: 'https://tikvideo.app/api/ajaxSearch',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      },
      data: new URLSearchParams({ q: url, lang: 'id' }).toString(),
    })

    const result = []
    if (res.data.status === 'ok') {
      const $ = cheerio.load(res.data.data)
      $('img').each((index, element) => {
        const imgSrc = $(element).attr('src')
        if (imgSrc && !imgSrc.includes('.webp')) {
          result.push(imgSrc)
        }
      })
    }

    return result.length > 0 ? result : null
  } catch (error) {
    console.error(error)
    return null
  }
}

async function v_gd(url) {
  const response = await axios.get('https://v.gd/create.php', {
    params: {
      format: 'simple',
      url: url
    }
  })
  return response.data
}

async function is_gd(url) {
  const response = await axios.get('https://is.gd/create.php', {
    params: {
      format: 'simple',
      url: url
    }
  })
  return response.data
}

async function powerbrain(question) {
    const data = `message=${encodeURIComponent(question)}&messageCount=1`

    const config = {
        method: 'POST',
        url: 'https://powerbrainai.com/chat.php',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
            'Content-Type': 'application/x-www-form-urlencoded',
            'accept-language': 'id-ID',
            'referer': 'https://powerbrainai.com/chat.html',
            'origin': 'https://powerbrainai.com',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'priority': 'u=0',
            'te': 'trailers'
        },
        data: data
    }
    const api = await axios.request(config)
    return api.data.response
}

async function Tts(Lyrra, m, message, lang) {
  try {
    const url = 'https://ttsmp3.com/makemp3_new.php'
    const data = new URLSearchParams()
    data.append('msg', message)
    data.append('lang', lang)
    data.append('source', 'ttsmp3')

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
        'Origin': 'https://ttsmp3.com',
        'Referer': 'https://ttsmp3.com/',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Sec-Ch-Ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        'Sec-Ch-Ua-Mobile': '?1',
        'Sec-Ch-Ua-Platform': '"Android"',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
      },
    })

    const result = response.data

    if (result.Error === 0 && result.URL) {
      Lyrra.sendMessage(m.chat, {
        audio: { url: result.URL },
        mimetype: 'audio/mpeg',
        fileName: `${result.Speaker}-${result.MP3}`,
      }, { quoted: m })
    } else {
      m.reply(`Error: ${result.Error || 'Terjadi kesalahan saat membuat MP3.'}`)
    }
  } catch (error) {
    m.reply(`Error: ${error.response ? JSON.stringify(error.response.data) : error.message}`)
  }
}

async function webp2mp4File(url) {
  try {
    const res = await axios.get(`https://ezgif.com/webp-to-mp4?url=${url}`)
    const $ = cheerio.load(res.data)
    const file = $('input[name="file"]').attr('value')

    if (!file) {
      throw new Error('Gagal mendapatkan file dari respon pertama.')
    }

    const data = new URLSearchParams({
      file: file,
      convert: 'Convert WebP to MP4!'
    })

    const res2 = await axios.post(`https://ezgif.com/webp-to-mp4/${file}`, data)
    const $2 = cheerio.load(res2.data)
    const link = $2('div#output > p.outfile > video > source').attr('src')

    if (!link) {
      throw new Error('Gagal mendapatkan link hasil konversi.')
    }

    return `https:${link}`
  } catch (error) {
    console.error('Terjadi kesalahan:', error.message)
    throw error
  }
}

module.exports = {
  keyURLBase64,
  decodedURL,
  ytdlv2,
  Ytdl,
  remini,
  recolor,
  dehaze,
  ephoto,
  CarbonifyV1,
  CarbonifyV2,
  getMimeType,
  tiktokSearchVideo,
  spotifySearch,
  spotifyDl,
  pinterest,
  toBase64,
  toOriginal,
  obfusc,
  deobfusc,
  toGhRaw,
  toGhOri,
  getInput,
  verifyPhoneNumber,
  toFont,
  kapital,
  addResponList,
  getDataResponList,
  isAlreadyResponList,
  sendResponList,
  isAlreadyResponListGroup,
  delResponList,
  updateResponList,
  removeBg,
  checkSewaGroup,
  addSewaGroup,
  getSewaPosition,
  getSewaExpired,
  expiredCheck,
  listCase,
  isFiltered,
  addFilter,
  addSpam,
  ResetSpam,
  isSpam,
  addAfkUser,
  checkAfkUser,
  getAfkReason,
  getAfkTime,
  getAfkId,
  getAfkPosition,
  getRegisteredRandomId,
  addRegisteredUser,
  checkRegisteredUser,
  createSerial,
  getprodukDariFile,
  simpenProduknya,
  getidProduk,
  cekProduknye,
  addprodukzz,
  delprodukzz,
  updprodukzz,
  getprodukdb,
  simpenSmTr,
  getSmTr,
  getTrId,
  cIdTrnya,
  saveTrnye,
  simpenDisc,
  getDisczz,
  addDisczz,
  persenDiskonnya,
  ngerestokk,
  bacaData,
  simpanData,
  buatPapan,
  lemparDadu,
  generateTanggaDanUlar,
  pindahPosisi,
  mulaiGame,
  joinGame,
  mainGame,
  hapusGame,
  cariIdGame,
  mainGameAuto,
  hapusGameAuto,
  autoLevelUp,
  notifyMaxLevel,
  getRewards,
  rapihin,
  rapihin2,
  ubahFps,
  detekFps,
  hdVideo,
  speedVideo,
  toFont2,
  luminAI,
  Cerpen,
  Andro1,
  Enc,
  yt_search,
  sfilesrc,
  sfiledl,
  cBaby,
  CatBox,
  terabox,
  profileImg,
  levelUp,
  notifGroup,
  captcha,
  pindl,
  genius,
  search_resep,
  detail_resep,
  jadwaltv,
  jarakLokasi,
  jadwalSholat,
  wikipedia,
  wikimedia,
  library,
  npmStalk,
  tiktokDl,
  ChatGPT,
  text2img,
  gimage,
  Gdrive,
  Chrome,
  srcLirik,
  getLirik,
  Kalender,
  generateAttp,
  generateTtp,
  Capcut,
  Threads,
  Twitter,
  cariresep,
  bacaresep,
  tiktokDlv2,
  ttslide,
  v_gd,
  is_gd,
  powerbrain,
  Tts,
  webp2mp4File
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
delete require.cache[file]
require(file)})