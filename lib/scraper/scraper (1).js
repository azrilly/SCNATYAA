/* Scrape And API
 * By Sanjaya (V-APIs)
 * Mampir vapisz.web.app
 */

const axios = require('axios')
const fetch = require('node-fetch')
const cheerio = require('cheerio')

async function wikiImage(teks) {
  try {
    const response = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        format: 'json',
        generator: 'search',
        gsrsearch: teks,
        prop: 'pageimages',
        piprop: 'original',
        pilimit: 'max',
      },
    })

    const halaman = response.data.query.pages
    return Object.values(halaman).map((page) => ({
      title: page.title,
      image: page.original ? page.original.source : null,
    }))
  } catch (e) {
    console.error(e)
    return []
  }
}

wikiImage('tiger')

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

library('tiger')

async function unplash(query) {
  try {
    const response = await axios.get(`https://unsplash.com/napi/search/photos`, {
      params: { query, per_page: 10 },
    })
    return response.data.results.map((rorr) => ({
      judul: rorr.alt_description,
      gambar: rorr.urls.regular,
      link: rorr.links.html,
    }))
  } catch (e) {
    console.error(e)
    return []
  }
}

unplash('tiger')

async function bing(teks) {
  try {
    const response = await axios.get(`https://www.bing.com/images/async`, {
      params: {
        q: teks,
        async: 'content',
        first: 0,
        count: 10,
      },
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })

    const resultx = [...response.data.matchAll(/murl&quot;:&quot;(.*?)&quot;/g)].map((match) => match[1])
    return resultx
  } catch (e) {
    console.error(e)
    return []
  }
}

bing('tiger')

async function bingv2(teks) {
  try {
    const response = await axios.get(`https://www.bing.com/images/async`, {
      params: {
        q: teks,
        async: 'content',
        first: 0,
        count: 10,
      },
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })

    const $ = cheerio.load(response.data)
    const resultx = []
    $('img').each((_, img) => {
      const imgu = $(img).attr('src') || $(img).attr('data-src')
      if (imgu) resultx.push(imgu)
    })

    return resultx
  } catch (e) {
    console.error(e)
    return []
  }
}

bingv2('tiger')

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

wikipedia('tiger')

async function streetmap(lok) {
  try {
    const { data } = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${lok}`)
    return data.map((location) => ({
      nama: location.display_name,
      latitude: location.lat,
      longitude: location.lon,
    }))
  } catch (e) {
    console.error(e)
    return []
  }
}

streetmap('tokyo')

async function lirik(msc) {
    try {
        const ress = await axios.get(`https://www.lyricsfreak.com/search.php?a=search&q=${encodeURIComponent(msc)}`)
        const $ = cheerio.load(ress.data)
        const song = $('.song').first().attr('href')
        if (!song) return []
        const lirikna = `https://www.lyricsfreak.com${song}`

        const respon = await axios.get(lirikna)
        const $$ = cheerio.load(respon.data)

        const lyrics = $$('.lyrictxt').text().trim()
        const titles = $$('h1').text().split('-')
        const title = titles[0].trim() || '-'
        let artist = titles[1]?.trim() || '-'
        if (artist === '-' || artist === '') {
            artist = $$('a[href*="/n/"]').first().text().trim();
        }

        const source = lirikna
        return {
            title,
            artist: artist || '-',
            lyrics: lyrics || '-',
            source
        }
    } catch (e) {
        console.error(e)
        return []
    }
}

lirik('laskar pelangi')

async function lirikv2(query) {
  try {
    let { data } = await axios.get(`https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Connection': 'keep-alive',
        'DNT': '1'
      }
    });

    const sresult = data.response.sections
      .find(section => section.type === 'song')
      ?.hits[0]?.result;

    if (!sresult) {
      return { title: '', artist: '', lyrics: '', source: '' };
    }

    const songs = sresult.url
    let { data: songPage } = await axios.get(songs, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'DNT': '1'
      }
    });

    let $ = cheerio.load(songPage)
    const title = $('.header_with_cover_art-primary_info-title').text().trim() || $('h1[class*="SongHeader__Title"]').text().trim() || $('div[class*="SongPageHeader__Title"]').text().trim() || $('h1').first().text().trim()
    const artist = $('.header_with_cover_art-primary_info-primary_artist').text().trim() || $('a[href*="/artists/"]').first().text().trim()

    const ress = await axios.get(`https://www.lyricsfreak.com/search.php?a=search&q=${encodeURIComponent(query)}`)
    const $$ = cheerio.load(ress.data)
    const song = $$('.song').first().attr('href')
    if (!song) return []

    const respon = await axios.get(`https://www.lyricsfreak.com${song}`)
    const $$$ = cheerio.load(respon.data)

    const lyrics = $$$('.lyrictxt').text().trim()
    return {
      title: title || '-',
      artist: artist || '-',
      source: songs || '-',
      lyrics: lyrics || '-'
    }
  } catch (e) {
    console.error(e)
    return []
  }
}

lirikv2('laskar pelangi')

async function pinterest(query) {
  const options = {
    query,
    scope: "pins",
    redux_normalize_feed: true,
    page_size: 50
  }

  const response = await axios.get(`https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=/search/pins/?q=${encodeURIComponent(query)}&data=${encodeURIComponent(JSON.stringify({
    options,
    context: {}
  }))}&_=${Date.now()}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })

  const data = response.data.resource_response?.data?.results || []
  const results = data.map(item => ({
    src: item.images.orig?.url || item.images['564x']?.url || '',
    title: item.rich_metadata?.title || item.grid_title || '',
    link: `https://www.pinterest.com/pin/${item.id}`,
    source: item.rich_metadata?.site_name || item.domain || ''
  })).filter(item => item.src)

  return results
}

pinterest('mbappe')

async function pindl(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
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
      img,
    }
  } catch (e) {
    console.error(e)
    return []
  }
}

pindl('https://www.pinterest.com/pin/1133218324978578597')

async function google(query) {
  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://www.google.com/search?q=${encodedQuery}`

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    const $ = cheerio.load(data)
    const results = []
    $('div.tF2Cxc').each((index, element) => {
      const title = $(element).find('h3').text()
      const link = $(element).find('a').attr('href')
      const snippet = $(element).find('.VwiC3b').text()
      if (title && link) {
        results.push({ title, link, snippet })
      }
    })

    return results
  } catch (error) {
    return []
  }
}

google('mbappe')

async function gimage(query) {
  const url = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`
  
  try {
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const $ = cheerio.load(data)
    const images = []

    $('img').each((_, el) => {
      const hdSrc = $(el).attr('srcset')?.split(' ')[0] || $(el).attr('src')
      if (hdSrc && hdSrc.startsWith('http')) {
        images.push(hdSrc)
      }
    })

    return images
  } catch (error) {
    console.error('Error fetching images', error)
    return []
  }
}

gimage('mbappe')

async function jadwaltv(nama) {
  try {
    let { data } = await axios.get(`https://www.jadwaltv.net/channel/${nama}`)
    let $ = cheerio.load(data)
    let hasil = []
    $('table.table-bordered tbody tr').each((i, el) => {
      let jam = $(el).find('td').eq(0).text().trim()
      let acara = $(el).find('td').eq(1).text().trim()
      
      if (jam && acara) {
        hasil.push({ jam, acara })
      }
    })
    return hasil
  } catch (e) {
    console.error(e)
    return []
  }
}

jadwaltv('sctv')

async function imgur(teks) {
  const hasilna = []

  try {
    for (let halaman = 1; hasilna.length < 30; halaman++) {
      const url = `https://imgur.com/search?q=${encodeURIComponent(teks)}&page=${halaman}`
      
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
      })
      const $ = cheerio.load(data)

      $('a').each((i, el) => {
        const href = $(el).attr('href')
        if (href && href.startsWith('/')) {
          const imgurl = 'https://imgur.com' + href
          hasilna.push({
            link: imgurl
          })
        }
      })
      
      if (hasilna.length >= 30) {
        break
      }
    }

    const hasill = []
    for (const hasil of hasilna) {
      const { data: data_halaman } = await axios.get(hasil.link, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
      })
      const $$ = cheerio.load(data_halaman)
      const imgurll = $$('meta[property="og:image"]').attr('content')
      const desk = $$('meta[name="description"]').attr('content')

      if (imgurll && desk && !imgurll.includes('logo-')) {
        hasill.push({
          link: imgurll,
          desk: desk
        })
      }
      if (hasill.length >= 30) {
        break
      }
    }

    return hasill
  } catch (e) {
    console.error(e)
  }
}

imgur('mbappe')

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

srcLirik("Laskar Pelangi")

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

getLirik("https://genius.com/Nidji-laskar-pelangi-lyrics")

async function search_resep(nama) {
  let { data } = await axios.get(`https://cookpad.com/id/cari/${encodeURIComponent(nama)}`)
  let $ = cheerio.load(data)
  let hasil = []

  $("li[data-search-tracking-target='result']").each((i, el) => {
    let title = $(el).find("h2 a").text().trim()
    let url = "https://cookpad.com" + $(el).find("h2 a").attr("href")
    let time = $(el).find(".mise-icon-time + .mise-icon-text").text().trim()
    let author = $(el).find(".flex.items-center span.text-cookpad-gray-600").text().trim()

    hasil.push({ title, url, time, author })
  })

  return hasil
}

async function detail_resep(url) {
  try {
    const { data } = await axios.get(url)
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

async function Gdrive(url) {
    let id
    if (!(url && url.match(/drive\.google/i))) throw 'URL tidak valid'
    id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1]
    if (!id) throw 'ID tidak ditemukan'
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
    })
    let { fileName, sizeBytes, downloadUrl } = JSON.parse((await res.text()).slice(4))
    let data = await fetch(downloadUrl)
    if (data.status !== 200) throw 'Kesalahan: '+data.statusText
    return {
        downloadUrl,
        fileName,
        fileSize: `${(sizeBytes / (1024 * 1024)).toFixed(2)}`,
        mimetype: data.headers.get('content-type'),
        extension: fileName.split('.').pop(),
        modified: data.headers.get('last-modified')
    }
}

Gdrive('https://drive.google.com/file/d/1YTD7Ymux9puFNqu__5WPlYdFZHcGI3Wz/view?usp=drivesdk')

async function fr_search(tema) {
    try {
        const { data } = await axios.get(`https://addons.mozilla.org/en-US/firefox/search/?q=${encodeURIComponent(tema)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })

        const $ = cheerio.load(data)

        const result = []
        $('a').each((_, element) => {
            const text = $(element).text().trim()
            const href = $(element).attr('href')

            if (text && href) {
                if (text.toLowerCase().includes(tema.toLowerCase())) { result.push({ text, url: href.startsWith('http') ? href : `https://addons.mozilla.org${href}` })
                }
            }
        })

        return {
            title: $('title').text().trim() || '-',
            result
        }
    } catch (e) {
        return {}
        console.error(e)
    }
}

fr_search("Ronaldo")

async function fr_download(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })

        const $ = cheerio.load(data)

        const title = $('title').text().trim()

        let author = ''
        $('h1').each((_, element) => {
            const header_text = $(element).text().trim()
            if (header_text) {
                author = header_text.replace('by ', '')
            }
        })

        let download = ''
        $('a').each((_, element) => {
            const text = $(element).text().trim()
            const href = $(element).attr('href')
            if (text && href) {
                if (text.toLowerCase().includes('download file')) { download = href.startsWith('http') ? href : `https://addons.mozilla.org${href}`
                }
            }
        })

        return {
            title,
            author,
            download
        }
    } catch (e) {
        return {}
        console.error(e)
    }
}

fr_download("https://addons.mozilla.org/en-US/firefox/addon/cristiano-ronaldo-cr9-real-mad/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search")

async function duckduckgo(src) {
    const pala = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    const response = await axios.get(`https://duckduckgo.com/html/?q=${encodeURIComponent(src)}`, { pala })
    const $ = cheerio.load(response.data)

    const hasil = []
    $(".result").each((_, element) => {
        const title = $(element).find(".result__a").text()
        const description = $(element).find(".result__snippet").text()
        const link = $(element).find(".result__a").attr("href")
        if (title && link) {
            hasil.push({ title, description, link })
        }
    })

    return hasil
}

duckduckgo("mbappe")

async function yahoo(query) {
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    const response = await axios.get(`https://search.yahoo.com/search?p=${encodeURIComponent(query)}`, { headers })
    const $ = cheerio.load(response.data)

    const hasilnya = []
    $("div.dd.algo").each((_, element) => {
        let title = $(element).find("h3.title").text().trim()
        const link = $(element).find("h3.title a").attr("href")
        const description = $(element).find("p").text().trim()

        title = title.replace(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9.-]+ · /, '').trim()

        if (title && link) {
            hasilnya.push({ title, link, description })
        }
    })

    return hasilnya
}

yahoo("mbappe")

async function quotes() {
  try {
    const { data } = await axios.get('https://quotes.toscrape.com/')
    const $ = cheerio.load(data)
    const results = []
    $('.quote').each((_, el) => {
      const quote = $(el).find('.text').text()
      const author = $(el).find('.author').text()
      results.push({ quote, author })
    })
    return results
  } catch (e) {
    console.error(e)
    return []
  }
}