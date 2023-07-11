import { ref } from 'vue'

const subsSuggestions = [
  {
    title: 'Netflix',
    cost: 56,
    url: 'netflix.com'
  },
  {
    title: 'Spotify',
    cost: 16,
    url: 'spotify.com'
  },
  {
    title: 'Amazon Prime',
    cost: 9,
    url: 'primevideo.com'
  },
  {
    title: 'Disney+',
    cost: 28,
    url: 'disneyplus.com'
  },
  {
    title: 'HBO Max',
    cost: 28,
    url: 'hbomax.com'
  },
  {
    title: 'Globo Play',
    cost: 22,
    url: 'globoplay.com'
  },
  {
    title: 'Telecine',
    cost: 37,
    url: 'telecineplay.com'
  },
  {
    title: 'Paramount+',
    cost: 20,
    url: 'paramountplus.com'
  },
  {
    title: 'Apple TV+',
    cost: 10,
    url: 'apple.com'
  },
  {
    title: 'Globoplay',
    cost: 25,
    url: 'globoplay.com'
  }
]
const subsSuggestionsString = subsSuggestions.map((v) => v.title)

const subsSuggestionsOptions = ref(subsSuggestionsString)

export { subsSuggestions, subsSuggestionsString, subsSuggestionsOptions }
