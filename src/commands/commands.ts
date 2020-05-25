/* eslint-disable no-unused-vars */
import type { RedisClient } from 'redis'
import type { CommandClient } from 'eris'
import https from 'https'
import { translate } from 'google-translate-api-browser'
/* eslint-enable no-unused-vars */

const emojiScrapeRegex = /<ol class="search-results">[^]*?<h2>[^]*?<span class="emoji">(.)*<\/span>[^]*?<\/ol>/u

export function loadCommands (bot: CommandClient, db: RedisClient) {
  // Simple commands
  bot.registerCommand('echo', (_, args) => args.join(' '))

  bot.registerCommand('clapback', (_, args) => args.join('👏') + '👏')

  bot.registerCommand('linegoesdown', 'https://twitter.com/moarajuliana/status/1252318965864464387')

  bot.registerCommand('dollarmachinegoesbrr', 'https://twitter.com/NorthernForger/status/1252412693274755074')

  bot.registerCommand('unemployme', 'https://www.youtube.com/watch?v=M5FGuBatbTg')

  // Complex commands
  bot.registerCommand('yee', (msg) => {
    db.zrevrange(`highlights:${msg.channel}`, 0, 1, async (err, res) => {
      if (err) console.error(err)
      if (res == null) return 'no messages saved in this channel'
      const found = await msg.channel.getMessage(res[0])
      msg.channel.createMessage(found.content)
    })
  })

  bot.registerCommand('t', async (msg, args) => {
    const from = 'auto'
    const to = 'en'
    const tr = await translate(args.join(' '), { from, to }) as { text: string }
    msg.channel.createMessage(tr.text)
  })

  const yturl = 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&key=AIzaSyAMTINdBOQCIE0ArDVVED2Ia5f0zwpIi1w&q='
  bot.registerCommand('yt', (msg, args) => {
    https.get(yturl + encodeURIComponent(args.join(' ')), res => {
      const { statusCode } = res
      if (!statusCode || statusCode < 200 || statusCode >= 300) return

      res.setEncoding('utf8')
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const id = JSON.parse(data).items[0].id.videoId
          console.log(id)
          if (id) msg.channel.createMessage(`https://youtube.com/watch?v=${id}`)
        } catch (err) {
          console.log(err)
        }
      })
    })
  })
}

// TODO colours

function emojify (word: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get('https://emojipedia.org/search/?q=' + word, res => {
      const { statusCode } = res
      if (!statusCode || statusCode < 200 || statusCode >= 300) resolve(' ' + word + ' ')

      res.setEncoding('utf8')
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        const match = data.match(emojiScrapeRegex)
        resolve(match ? match[1] : ' ' + word + ' ')
      })
    })
  })
}