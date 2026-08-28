const store = {}

export function setNavIntent(key, value) {
  store[key] = value
}

export function consumeNavIntent(key) {
  const value = store[key]
  delete store[key]
  return value
}