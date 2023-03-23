export const unitMap = {
  "active connections": "a-con",
  arrays: "arrays",
  "calls/s": "c/s",
  Celsius: "cels",
  charts: "charts",
  "connected clients": "con-c",
  "connections/s": "c/s",
  containers: "cont",
  "context switches/s": "co-sw",
  dBm: "dBm",
  descriptors: "descr",
  difference: "dif",
  "drops/s": "d/s",
  entropy: "entr",
  "errors/s": "err/s",
  events: "events",
  "events/s": "e/s",
  "faults/s": "f/s",
  "files/s": "f/s",
  "frames/s": "f/s",
  GiB: "GiB",
  "gigabits/s": "gb/s",
  inodes: "inodes",
  "interrupts/s": "i/s",
  KiB: "KiB",
  "KiB/operation": "Kib/op",
  "KiB/s": "KiB/s",
  "kilobits/s": "kb/s",
  load: "load",
  "merged operations/s": "m-o/s",
  "messages/s": "m/s",
  metrics: "metrics",
  MHz: "MHz",
  MiB: "MiB",
  "MiB/s": "MiB/s",
  "megabits/s": "mb/s",
  "microseconds lost/s": "µs l/s",
  milliseconds: "ms",
  "milliseconds/operation": "ms/o",
  "milliseconds/request": "ms/r",
  "milliseconds/run": "ms/run",
  "milliseconds/s": "ms/s",
  ms: "ms",
  "% of time working": "%time",
  "open files": "o-f",
  "open pipes": "o-p",
  "open sockets": "o-s",
  "operations/s": "ops/s",
  "packets/s": "p/s",
  "page faults/s": "p-f/s",
  pages: "pages",
  percentage: "%",
  pcent: "%",
  percent: "%",
  processes: "prc",
  "processes/s": "prc/s",
  "reads/s": "read/s",
  "reports/s": "rep/s",
  "requests/s": "req/s",
  "Rotations/min": "rot/min",
  seconds: "secs",
  segments: "segm",
  semaphores: "semph",
  sockets: "socket",
  "softirqs/s": "s-irq/s",
  state: "state",
  status: "status",
  threads: "thr",
  value: "value",
  Volts: "V",
  Watt: "W",
  bits: "b",
  bytes: "B",
  kilobytes: "KB",
  megabytes: "MB",
  gigabytes: "GB",
  terabytes: "TB",
  petabytes: "PB",
  exabytes: "EB",
  zettabytes: "ZB",
  yottabytes: "YB",
  "bits/s": "b/s",
  "bytes/s": "B/s",
  "kilobytes/s": "KB/s",
  "megabytes/s": "MB/s",
  "gigabytes/s": "GB/s",
  "terabytes/s": "TB/s",
  "petabytes/s": "PB/s",
  "exabytes/s": "EB/s",
  "zettabytes/s": "ZB/s",
  "yottabytes/s": "YB/s",
}

const numRegex = /num\s\(([fpnμmcAhkMGTPE])\)?\s(.+)?/

export default node =>
  (long = false) => {
    let units = node.getAttribute("unitsConversion") || node.getAttribute("units")

    let prefix = ""

    if (numRegex.test(units)) {
      const customMatch = units.match(numRegex)

      prefix = customMatch[1] && customMatch[1] !== "A" ? `${customMatch[1]} ` : ""
      units = customMatch[2]
    }

    if (!units) return null

    return `${prefix}${long ? units : unitMap[units] || units}`
  }
