export const onlyHost = (url) => {
  return url
    .replace(/(^\w+:|^)\/\//, '')
    .replace('www.', '')
    .split('/')[0]
}
