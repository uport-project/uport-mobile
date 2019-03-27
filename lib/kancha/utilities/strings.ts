const abbreviate = (item: string | number, length: number) => {
  return `${item.toString().slice(0, length)}...`
}

const Strings = {
  abbreviate,
}

export default Strings;

