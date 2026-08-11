const WELCOME_SEEN_KEY = 'karate-welcome-seen'

export function hasSeenWelcome() {
  return localStorage.getItem(WELCOME_SEEN_KEY) === 'true'
}

export function markWelcomeSeen() {
  localStorage.setItem(WELCOME_SEEN_KEY, 'true')
}
