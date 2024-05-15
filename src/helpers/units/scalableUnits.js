export const keys = {
  binary: ["Ki", "Mi", "Gi", "Ti"],
  decimal: ["K", "M", "B", "T"],
  bit: ["k", "M", "G", "T", "P", "E", "Z", "Y"],
  num: [
    "y",
    "z",
    "a",
    "f",
    "p",
    "n",
    "u",
    "m",
    "c",
    "d",
    "da",
    "h",
    "k",
    "M",
    "G",
    "T",
    "P",
    "E",
    "Z",
    "Y",
  ],
}

export default {
  binary: {
    Ki: 1_024.0,
    Mi: 1_048_576.0,
    Gi: 1_073_741_824.0,
    Ti: 1_099_511_627_776.0,
  },
  decimal: {
    K: 1_000.0,
    M: 1_000_000.0,
    B: 1_000_000_000.0,
    T: 1_000_000_000_000.0,
  },
  num: {
    y: 0.000_000_000_000_000_000_000_001,
    z: 0.000_000_000_000_000_000_001,
    a: 0.000_000_000_000_000_001,
    f: 0.000_000_000_000_001,
    p: 0.000_000_000_001,
    n: 0.000_000_001,
    u: 0.000_001,
    m: 0.001,
    c: 0.01,
    d: 0.1,
    da: 10.0,
    h: 100.0,
    k: 1_000.0,
    M: 1_000_000.0,
    G: 1_000_000_000.0,
    T: 1_000_000_000_000.0,
    P: 1_000_000_000_000_000.0,
    E: 1e18,
    Z: 1e21,
    Y: 1e24,
  },
}
