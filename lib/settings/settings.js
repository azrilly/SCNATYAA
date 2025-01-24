const fs = require('fs')

//SETTINGS BOT

global.storename = "Natya Moon" //Store Nama
global.botname = "Natya Moon" //Bot Nama
global.ownername = "azrilly" //Name Owner

global.owner = "6285157457662" //Owner Kontak 
//ubah juga di bagian folder ./data/owner.json

global.version = "2.0" //Versi Bot
global.packname = "" //Pack Nama Sticker
global.author = "" //Pack Nama Author Sticker
global.web = "https://natya.web.app/" //Web link kamu
global.wm = "JOIN CH" //Nama Channel WhatsApp
global.chjid = "63372705892863" //Cannel id, gaush pake @
global.sessionName = "session" //Ndak Usah Diganti 
global.botNumber = "6285183267263" //Bot Nomor
global.sch = "https://whatsapp.com/channel/0029Vaz59YcCXC3DsSrtgO0a" // Group Link 
global.sgc = "https://whatsapp.com/channel/0029Vaz59YcCXC3DsSrtgO0a" //Link Channel WhatsApp 
global.stg = "https://t.me/" //Telegram Link
global.syt = "https://youtube.com/" //YouTube Link
global.sig = "https://instagram.com/azrillikethis" //Instagram Link 
global.thumb = "https://files.catbox.moe/smh5nc.mp4" //Url Thumb
global.thumb2 = "https://files.catbox.moe/ndlspc.mp4" //Url Thumb

//Payment, isi aja kalo mau, kalo ngga ada dikosongin aja
global.dana = "089627309641"
global.gopay = "-"
global.ovo = "-"
global.pulsa = "-"
global.rek = "-"
global.qris = "https://telegra.ph/file/url_qris.jpg" //Link Url Qris

/* Api buat domain, vps, cpanel dan lain lain, 
bisa dikosongin kalo ngga ada */
global.neoxrapi = "ViooS"
global.ariekey = "APIKEY"
global.onekey = "APIKEY"
global.domain = ""
global.apikey = ""
global.capikey = ""
global.eggs = "15"
global.locc = "1"
// Cvps, dll.
global.doToken = "APIKEY"
global.linodeToken = "APIKEY"

//Ini Code Input Apis buat dipersingkat,
//ngga di sarankan buat diganti/dihapus, biar ngga error
global.apis0 = "0"
global.apis1 = "1"
global.apis2 = "2"
global.apis3 = "3"
global.apis4 = "4"
global.apis5 = "5"
global.apis6 = "6"
global.apis7 = "7"
global.apis8 = "8"
global.apis9 = "9"

//Input alfabet
global.apis1a = "a"
global.apis1b = "b"
global.apis1c = "c"
global.apis1d = "d"
global.apis1e = "e"
global.apis1f = "f"
global.apis1g = "g"
global.apis1h = "h"
global.apis1i = "i"
global.apis1j = "j"
global.apis1k = "k"
global.apis1l = "l"
global.apis1m = "m"
global.apis1n = "n"
global.apis1o = "o"
global.apis1p = "p"
global.apis1q = "q"
global.apis1r = "r"
global.apis1s = "s"
global.apis1t = "t"
global.apis1u = "u"
global.apis1v = "v"
global.apis1w = "w"
global.apis1x = "x"
global.apis1y = "y"
global.apis1z = "z"

//Mess Buat Atur Opsi Info Peringatan
global.mess = {
owner: "Fitur khusus owner!",
prem: "Fitur khusus premium!",
grup: "Fitur khusus grup chat!",
privat: "Fitur khusus privat chat!",
admin: "Fitur khusus admin!",
botadmin: "Bot bukan admin!",
op: "Fitur khusus owner dan premium!",
or: "Fitur khusus owner dan reseller!",
ob: "Fitur khusus owner dan bot!",
oa: "Fitur khusus owner dan admin!"
}

/* Saweria Akun Payment, isi aja kalo mau, 
buat bot donasi dll */
global.sw = {
email: "@gmail.com",
password: "",
username: ""
}

//List harga pay
global.listsc = {
Lyrra: "50000",
lenwy: "15000",
rafa: "65000",
kym: "30000",
okuota: "20000"
}

//Setting Home, ada beberapa yg off/mati, udah ditandai 
global.prefixx = true // X
global.tipemenu = "v1" // X
global.tipeallmenu = "v1" // X
global.gconly = false // X
global.pconly = false // X
global.autotyping = false // X
global.autoread = true // X
global.autobio = false // X
global.anticall = true // X
global.antispam = false // X
global.antibot = false // X
global.welcome = false // X
//Setting Set Member Join Grup 
global.tekswelcome = "Welcome @user\n\nGrup: @group" // X
global.teksgoodbye = "Goodbye @user\n\nGrup: @group" // X
global.gamewaktu = 60 // XXX - Dead
global.limit = 100 // X

/* 
Beberapa bagian set false - true yang 
di atas ini telah dipindahkan di bagian 
config-db-set.json, dan ada beberapa yang 
dipindahkan di bagian database user ataupun data chats,
dipindah ke file.json stringfy,
agar lebih memudahkan buat menyimpan data
dan supaya tidak restart di saat kondisi run/bot aktif
*/

global.bejir = (a, b) => {
let Ayyana = 
{key: {remoteJid: 'status@broadcast', 
participant: '0@s.whatsapp.net'}, 
message: {orderMessage: {itemCount: 1000, 
status: 1, surface: 1, 
message: a, orderTitle: '', thumbnail: b, 
sellerJid: '0@s.whatsapp.net'}}};
return Ayyana
}

// True - Hidup || False - Mati

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
delete require.cache[file]
require(file)})

// By - Ayyana >_<