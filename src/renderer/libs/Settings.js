export const getSetting = (key, defaultValue) => {
  const value =
    localStorage[key] ?
    JSON.parse(localStorage.getItem(key)) :
    defaultValue

  return Promise.resolve(value)
}

export const setSetting = (key, value) => {
  return Promise.resolve(localStorage.setItem(key, JSON.stringify(value)))
}

export default {
  getSetting,
  setSetting,
}
