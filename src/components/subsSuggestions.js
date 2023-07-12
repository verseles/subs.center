import { ref } from 'vue'

let subsSuggestions = [
  {
    title: 'Netflix',
    cost: 56,
    url: 'netflix.com'
  },
  {
    title: 'Spotify',
    cost: 20,
    url: 'spotify.com'
  },
  {
    title: 'Amazon Prime',
    cost: 15,
    url: 'primevideo.com'
  },
  {
    title: 'Disney+',
    cost: 34,
    url: 'disneyplus.com'
  },
  {
    title: 'HBO Max',
    cost: 35,
    url: 'hbomax.com'
  },
  {
    title: 'Globo Play',
    cost: 25,
    url: 'globoplay.globo.com'
  },
  {
    title: 'Paramount+',
    cost: 20,
    url: 'paramountplus.com'
  },
  {
    title: 'Apple TV+',
    cost: 15,
    url: 'apple.com'
  },
  {
    title: 'Peacock',
    cost: 5,
    url: 'peacocktv.com'
  },
  {
    title: 'Tidal',
    cost: 17,
    url: 'tidal.com'
  },
  {
    title: 'Deezer',
    cost: 23,
    url: 'deezer.com'
  },
  {
    title: 'LinkedIn Premium',
    cost: 80,
    url: 'linkedin.com'
  },
  {
    title: 'Amazon Audible',
    cost: 75,
    url: 'audible.com'
  },
  {
    title: 'Adobe Creative Cloud',
    cost: 124,
    url: 'adobe.com'
  },
  {
    title: 'Microsoft Office 365',
    cost: 36,
    url: 'office.com'
  },
  {
    title: 'Google One',
    cost: 10,
    url: 'one.google.com'
  },
  {
    title: 'Apple iCloud',
    cost: 10,
    url: 'icloud.com'
  },
  {
    title: 'Dropbox',
    cost: 20,
    url: 'dropbox.com'
  },
  {
    title: 'Tinder Premium',
    cost: 50,
    url: 'tinder.com'
  },
  {
    title: 'Poe',
    cost: 100,
    url: 'poe.com'
  },
  {
    title: 'ChatGPT',
    cost: 100,
    url: 'chat.openai.com'
  },
  {
    title: 'You Pro',
    cost: 50,
    url: 'you.com'
  },
  {
    title: 'Youtube Premium',
    cost: 21,
    url: 'youtube.com'
  },
  {
    title: 'Playstation',
    cost: 35,
    url: 'playstation.com'
  },
  {
    title: 'Xbox Game Pass',
    cost: 33,
    url: 'xbox.com'
  },
  {
    title: 'Nintendo Switch',
    cost: 20,
    url: 'nintendo.com'
  },
  {
    title: 'Hulu',
    cost: 30,
    url: 'hulu.com'
  },
  {
    title: 'Discovery+',
    cost: 30,
    url: 'discoveryplus.com'
  },
  {
    title: 'Crunchyroll',
    cost: 30,
    url: 'crunchyroll.com'
  },
  {
    title: 'Uber Pass',
    cost: 25,
    url: 'uber.com'
  },
  {
    title: 'Canva Pro',
    cost: 30,
    url: 'canva.com'
  },
  {
    title: 'Grammarly',
    cost: 40,
    url: 'grammarly.com'
  },
  {
    title: 'Notion',
    cost: 30,
    url: 'notion.so'
  },
  {
    title: 'Todoist',
    cost: 30,
    url: 'todoist.com'
  },
  {
    title: 'Duolingo',
    cost: 30,
    url: 'duolingo.com'
  },
  {
    title: 'Udemy',
    cost: 30,
    url: 'udemy.com'
  },
  {
    title: 'Coursera',
    cost: 30,
    url: 'coursera.org'
  },
  {
    title: 'Masterclass',
    cost: 30,
    url: 'masterclass.com'
  },
  {
    title: 'Skillshare',
    cost: 30,
    url: 'skillshare.com'
  },
  {
    title: 'HeadSpace',
    cost: 30,
    url: 'headspace.com'
  },
  {
    title: 'Calm',
    cost: 30,
    url: 'calm.com'
  },
  {
    title: 'Amazon Kindle Unlimited',
    cost: 30,
    url: 'amazon.com'
  },
  {
    title: 'Slack',
    cost: 30,
    url: 'slack.com'
  },
  {
    title: 'Zoom',
    cost: 30,
    url: 'zoom.us'
  },
  {
    title: 'Google Workspace',
    cost: 30,
    url: 'workspace.google.com'
  },
  {
    title: 'Mercado Livre Nível 6',
    cost: 10,
    url: 'mercadolivre.com.br'
  },
  {
    title: 'Evernote',
    cost: 30,
    url: 'evernote.com'
  },
  {
    title: 'Club Smiles',
    cost: 30,
    url: 'smiles.com.br'
  },
  {
    title: 'Rappi Prime',
    cost: 30,
    url: 'rappi.com.br'
  },
  {
    title: 'Uber Eats Pass',
    cost: 30,
    url: 'ubereats.com'
  },
  {
    title: 'iFood Clube',
    cost: 5,
    url: 'ifood.com.br'
  },
  {
    title: 'Journey',
    cost: 30,
    url: 'journey.cloud'
  },
  {
    title: 'Github Pro',
    cost: 21,
    url: 'github.com'
  },
  {
    title: 'Github Copilot',
    cost: 60,
    url: 'github.com'
  },
  {
    title: 'Telegram Premium',
    cost: 13,
    url: 'telegram.org'
  },
  {
    title: 'Skype',
    cost: 30,
    url: 'skype.com'
  },
  {
    title: 'Mozilla Pocket',
    cost: 30,
    url: 'getpocket.com'
  },
  {
    title: '1Password',
    cost: 30,
    url: '1password.com'
  },
  {
    title: 'LastPass',
    cost: 10,
    url: 'lastpass.com'
  },
  {
    title: 'Dashlane',
    cost: 30,
    url: 'dashlane.com'
  },
  {
    title: 'Bitwarden',
    cost: 50,
    url: 'bitwarden.com'
  },
  {
    title: 'NordPass',
    cost: 30,
    url: 'nordpass.com'
  },
  {
    title: 'WhosCall',
    cost: 30,
    url: 'whoscall.com'
  },
  {
    title: 'Envato Elements',
    cost: 30,
    url: 'elements.envato.com'
  },
  {
    title: 'Elsa Speak',
    cost: 30,
    url: 'elsaspeak.com'
  },
  {
    title: 'Mubi',
    cost: 30,
    url: 'mubi.com'
  },
  {
    title: 'Twitch',
    cost: 30,
    url: 'twitch.tv'
  },
  {
    title: 'Discord',
    cost: 30,
    url: 'discord.com'
  },
  {
    title: 'Belas Artes a lá Carte',
    cost: 30,
    url: 'belasartesalacarte.com.br'
  },
  {
    title: 'Kaspersky VPN',
    cost: 30,
    url: 'kaspersky.com'
  },
  {
    title: 'Strava',
    cost: 30,
    url: 'strava.com'
  },
  {
    title: 'Desrotulando',
    cost: 30,
    url: 'desrotulando.com.br'
  },
  {
    title: 'Trello',
    cost: 30,
    url: 'trello.com'
  },
  {
    title: 'Figma',
    cost: 30,
    url: 'figma.com'
  },
  {
    title: 'Monday',
    cost: 30,
    url: 'monday.com'
  },
  {
    title: 'Asana',
    cost: 30,
    url: 'asana.com'
  },
  {
    title: 'IFTTT',
    cost: 30,
    url: 'ifttt.com'
  },
  {
    title: 'Postman',
    cost: 30,
    url: 'postman.com'
  }
]

// order by title
subsSuggestions = subsSuggestions.sort((a, b) => {
  if (a.title > b.title) {
    return 1
  }
  if (a.title < b.title) {
    return -1
  }
  return 0
})
const subsSuggestionsString = subsSuggestions.map((v) => v.title)

const subsSuggestionsOptions = ref(subsSuggestionsString)

export { subsSuggestions, subsSuggestionsString, subsSuggestionsOptions }
