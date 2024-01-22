export function write(str: string) { console.log(str); }

export function list(header: string, items: string[]) {
  write(header);
  if (items.length) {
    write(`\t${items.join('\n\t')}\n`);
  }
}