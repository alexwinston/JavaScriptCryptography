
var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
function guid() {
    var d0 = Math.random() * 0xffffffff | 0;
    var d1 = Math.random() * 0xffffffff | 0;
    var d2 = Math.random() * 0xffffffff | 0;
    var d3 = Math.random() * 0xffffffff | 0;
    return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
        lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
        lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
        lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
}

const expected = [0.0815,0.0144,0.0276,0.0379,0.1311,0.0292,0.0199,0.0526,0.0635,0.0013,0.0042,
    0.0339,0.0254,0.0710,0.08,0.0198,0.0012,0.0683,0.061,0.1047,0.0246,0.0092,
    0.0154,0.0017,0.0198,0.0008]

class Homophonic {
    static encrypt(pt, k, az) {
        // console.log([76,15,31,23,128,22,29,58,77,4,12,38,23,85,79,17,2,72,64,93,23,6,29,8,24,2].map((v,i) => expected[i] * v))
        // const k = expected.map(v => Math.round(83 * v))
        // const k = [7,1,2,3,11,2,2,4,5,0,0,3,2,6,7,2,0,6,5,9,2,1,1,0,2,0]
        // console.log(k)
        // console.log(k.reduce((a,c) => a + c, 0))
        const offsets = [0].concat(k.map((s => a => s += a)(0))).slice(0, 26)
        // console.log(offsets)

        var i = 0
        const ct = []
        for (var i = 0, j = 0; i < pt.length; i++) {
            const c = az26.indexOf(pt[i])
            const ki = k[c]
            const offset = offsets[c] + (j++ % ki)
            ct.push(az[offset])
        }
        return ct.join("")
    }
}

String.prototype.rotate = function (n) {
    return this.slice(n) + this.slice(0, n)
}

class Alphabet {
    constructor(characters) {
        this.data = characters
        this.nadirIndex = Math.floor(characters.length / 2)
    }

    permute(newZenith, skipAmount) {
        let permutedCharacters = this.data.rotate(this.data.indexOf(newZenith))
        if (skipAmount === 2) permutedCharacters = permutedCharacters.rotate(1)
        this.data = permutedCharacters.slice(0, skipAmount) +
            permutedCharacters.slice(skipAmount, this.nadirIndex + 1).rotate(1) +
            permutedCharacters.slice(this.nadirIndex + 1)
    }
}

class Chao {
    constructor(ciphertextAlphabet, plaintextAlphabet) {
        this.reinitialize = function () {
            this.alphabets = [new Alphabet(ciphertextAlphabet), new Alphabet(plaintextAlphabet)]
        }
    }

    process(text, select) {
        this.reinitialize()
        return text.split('').map(c => {
            const lastConvertedLetter = this.alphabets[select].data.charAt(this.alphabets[1 - select].data.indexOf(c))
            // Only convert characters in the source alphabet.
            if (lastConvertedLetter === '') return c
            this.alphabets[select].permute(lastConvertedLetter, 1 + select)
            this.alphabets[1 - select].permute(c, 2 - select)
            return lastConvertedLetter
        }).join('')
    }

    encrypt(pt) {
        return this.process(pt, 0)
    }

    decrypt(ct) {
        return this.process(ct, 1)
    }
}

class Hill {
  static eyes = [
    [27, 13, 67],
    [0, 47, 79],
    [0, 31, 7]
  ]

  constructor(key, az) {
    this.alphbetics = az;
    this.n = this.alphbetics.length
    // this.key = [
    //     [this.alphbetics.indexOf("R"), this.alphbetics.indexOf("l"), this.alphbetics.indexOf(";")],
    //     [this.alphbetics.indexOf("p"), this.alphbetics.indexOf("_"), this.alphbetics.indexOf("m")],
    //     [this.alphbetics.indexOf("D"), this.alphbetics.indexOf("B"), this.alphbetics.indexOf("A")]
    // ]
    this.key = key
    this.det = parseInt(this.getDeterminent(this.key))
  }

  getDeterminent(matrix) {
    let x = matrix[0][0] * ((matrix[1][1] * matrix[2][2]) - (matrix[2][1] * matrix[1][2]));
    let y = matrix[0][1] * ((matrix[1][0] * matrix[2][2]) - (matrix[2][0] * matrix[1][2]));
    let z = matrix[0][2] * ((matrix[1][0] * matrix[2][1]) - (matrix[2][0] * matrix[1][1]));
    return (x - y + z);
  }

  modularInverse(m, n) {
    let x = m;
    let y = n;

    let divs = [];
    let adds = [];

    let result;

    if (y > x) {
      let i = 1;
      while (x != 0) {
        divs[i] = Math.floor(y / x);
        let temp = x;
        x = y % x;
        y = temp;
        i++;
      }

      let len = divs.length;
      adds[len - 1] = 0;
      adds[len - 2] = 1;
      for (let index = len - 2; index > 0; index--) {
        adds[index - 1] = (divs[index] * adds[index]) + adds[index + 1];
      }

      if ((adds[0] * m) > (adds[1] * n)) {
        result = adds[0];
      } else {
        result = n - adds[0];
      }

    }
    return result;
  }

  inverseMatrix(matrix) {
    let minorMatrix = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        minorMatrix[i][j] = (matrix[(i + 1) % 3][(j + 1) % 3] * matrix[(i + 2) % 3][(j + 2) % 3]) - (matrix[(i + 1) % 3][(j + 2) % 3] * matrix[(i + 2) % 3][(j + 1) % 3]);
      }
    }

    let adjointMatrix = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
    for (let i = 0; i < minorMatrix.length; i++) {
      for (let j = 0; j < minorMatrix[i].length; j++) {
        adjointMatrix[j][i] = minorMatrix[i][j];
      }
    }
    return adjointMatrix;
  }

  multiplyMatrix(a, b) {
    let result = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = 0;
      for (let j = 0; j < a[i].length; j++) {
        result[i] += b[j] * a[i][j];
      }
    }
    return result;
  }

  gcd(x, y) {
    x = Math.abs(x);
    y = Math.abs(y);
    while (y) {
      var t = y;
      y = x % y;
      x = t;
    }
    return x;
  }

  getRidOfNeg(x, n) {
    while (x < 0) {
      x += n;
    }
    return x;
  }

  checkRelativelyPrime() {
    det = parseInt(getDeterminent(key));
    console.log("det = " + det);

    let g = gcd(det, n);
    console.log("gcd = " + g);

    if (g == 1) {
      return true;
    } else {
      return false;
    }
  }

  encrypt(plain) {
    let cipher = "";
    if (this.alphbetics.indexOf(" ") == -1) {
      plain = plain.split(" ").join("");
    }

    for (let index = 0; index < plain.length; index += 3) {
      let x = this.alphbetics.indexOf(plain[index]);
      let y, z;

      if (index + 1 == plain.length) {
        y = 0;
        z = 1;
      } else {
        y = this.alphbetics.indexOf(plain[index + 1]);
        if (index + 2 == plain.length) {
          z = 0;
        } else {
          z = this.alphbetics.indexOf(plain[index + 2]);
        }
      }

      let res = this.multiplyMatrix(this.key, [x, y, z]);

      for (let i = 0; i < res.length; i++) {
        if (res[i] < 0) {
          res[i] = this.getRidOfNeg(res[i], this.n);
        }
        let j = res[i] % this.n;
        cipher += this.alphbetics[j];
      }
    }
    return cipher;
  }

  decrypt(cipher) {
    let plain = "";
    let m = this.det;
    if (this.det < 0) {
      m = this.getRidOfNeg(this.det, this.n);
    }
    m = m % this.n;

    console.log("n: " + this.n);
    console.log("m:  " + m);

    let modularInv = this.modularInverse(m, this.n);
    let matrixInv = this.inverseMatrix(this.key);
    console.log(modularInv);


    for (let index = 0; index < cipher.length; index += 3) {
      let x = this.alphbetics.indexOf(cipher[index]);
      let y = this.alphbetics.indexOf(cipher[index + 1]);
      let z = this.alphbetics.indexOf(cipher[index + 2]);
      console.log("dec: " + [x, y, z]);

      let res = this.multiplyMatrix(matrixInv, [x, y, z]);
      console.log("matinv: " + res);

      for (let i = 0; i < res.length; i++) {
        res[i] *= modularInv;
        console.log("res[" + i + "]:  " + res[i]);

        if (res[i] < 0) {
          res[i] = this.getRidOfNeg(res[i], this.n);
        }
        let j = res[i] % this.n;

        plain += this.alphbetics[j];
      }
    }
    return plain;
  }
}

class Observable {
    constructor(value, listener) {
        this._value = value
        this._fn = listener.on_change.bind(listener)
    }
    get value() {
        return this.get()
    }
    set value(value) {
        this.set(value)
    }
    get() {
        return this._value
    }
    set(value) {
        this._value = value
        this._fn()
    }
    add(n) {
        this.set(this.get() + n)
    }
}

Array.prototype.last = function() {
    return this[this.length - 1]
}

Array.prototype.set = function(o) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].equals(o)) { return this; }
    }
    this.push(o)
    return this
}

class Modal {
  constructor() {
    this.visible = false
    this.context = undefined
  }

  show(context) {
    this.visible = true
    this.context = context
  }

  hide(fn = () => {}) {
    this.visible = false
    fn()
  }
}

class View  {
    constructor(...analyses) {
        this.analyses = analyses
        this.cipher_help = new Modal()
    }

    on_load() {
        console.log("View on_load")
        this.analyses.forEach(v => v.on_load(this))
    }
}

class Analysis {
    constructor(text, az, encrypt) {
        this.id = guid()
        this.text = text
        this.text_editing = new Observable(false, this)
        this.az = new Observable(az, this)
        this.encrypt = new Observable(encrypt, this)
        this.ciphers = [
          { name: "Vigenere", examples: [
            'Vigenere.encrypt(pt, "SECRET", az)',
            'Vigenere.encrypt(pt, az, az)',
            'Variant.encrypt(pt, "SECRET", az)',
            'Beaufort.encrypt(pt, az.reverse(), az)',
          ]},
          { name: "Autokey", examples: [
            'Autokey.encrypt(pt, "SECRET", az)',
            'Autokey.encrypt(pt, "SECRET", az, Variant)',
            'Autokey.encrypt(pt, az36, az, Shift.chain(Shift.additive, Shift.alternating(Shift.exponential(3), 2)))',
          ]},
          { name: "Cipherkey", examples: [
            'Cipherkey.encrypt(pt, "SECRET", az)',
            'Cipherkey.encrypt(pt, "SECRET", az, Beaufort)',
            'Cipherkey.encrypt(pt, "SECRET", az, Vigenere, Cipherkey.word)',
            'Cipherkey.encrypt(pt, az36.reverse(), az, Shift.chain(Shift.additive, Shift.alternating(Shift.multiplicative(33), 2)))',
          ]},
          { name: "Gronsfeld", examples: [
            'Gronsfeld.encrypt(pt, [3,1,4,1,5,9,2,6,5,3,5], az)',
            'Gronsfeld.encrypt(pt, Array.from({ length: pt.length }, (_,i) => (i + 1)**3), az)',
          ]},
          { name: "Hill", examples: [
            'new Hill([[23,33,73],[0,31,7],[0,54,15]], az).encrypt(pt)',
          ]},
          { name: "Chao", examples: [
            'new Chao(az, az).encrypt(pt)',
          ]},
          { name: "Homophonic", examples: [
            'Homophonic.encrypt(pt, [7,1,2,3,11,2,2,4,5,0,0,3,2,6,7,2,0,6,5,9,2,1,1,0,2,0], az)'
          ]}
        ]
        this.cipher = new Observable(this.ciphers[2].examples[3], this)
        this.messages = []
        this.messages_max = 0
        this.frequencies = []
        this.frequency_totals = undefined
        this.differences = []
        this.counts = []
        this.kappa_periodic = []
        this.kappa_autocorrelation = []
        this.alignment_unique = new Observable(false, this)
        this.gaps_min = new Observable(1, this)
        this.gaps_max = new Observable(16, this)
        this.gaps_aligned = new Observable(false, this)
        this.gap_ends = new Observable(true, this)
        this.isomorphs = []
        this.isomorphs_max_length = new Observable(16, this)
        this.isomorphs_min_pairs = new Observable(1, this)
        this.isomorphs_min_count = new Observable(2, this)
        this.isomorphs_fit_length = new Observable(true, this)

        const az_length = this.az.value.length
        this.color_gradient = new Gradient().setColorGradient("#073b6b", "#2c7e8d").setMidpoint(Math.round(az_length * .42)).getColors().concat(
        new Gradient().setColorGradient("#2c7e8d", "#fce53f").setMidpoint(Math.round(az_length * .58)).getColors())
        console.log(this.color_gradient.length)
    }

    test(cipher) {
      this.cipher.value = cipher
    }
    // "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrR"
    // "aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789"
    format(text, az) {
        return this.encrypt.value ? text.map(v => new Function("pt", "az", "return " + this.cipher.value)(v,az)) : text
    }

    text_randomize() {
      const random = []
      for (const i of this.text.split("\n")) {
        const text = []
        for (var j = 0; j < i.length; j++) {
          const n = Numbers.random(0,this.az.value.length)
          text.push(this.az.value[n])
        }
        random.push(text.join(""))
      }
      this.text = random.join("\n")
      this.on_change()
    }

    az_shuffle() {
      this.az.value = this.az.value.shuffle()
    }

    az_reset() {
      this.az.value = az83
    }

    char_color(c) {
        // return RGB.spread(c.charCodeAt(0))
        // return this.rgb(c.charCodeAt(0))
        if (c) { return this.color_gradient[this.az.value.indexOf(c)] }
        return "transparent"
    }

    ratio_color(length, min, max) {
        if (length === undefined) { return "transparent" }

        return RGB.spread(length)
        // const ratio = this.color_gradient.length / (max - min + 1)
        // const color = Math.round((length - min) * ratio)
        // return this.color_gradient[color]
    }

    difference_color(i,j) {
      return this.color_gradient[this.differences[i][j]]
    }

    alignment_color(i,j) {
      if (!this.alignment_unique.get()) { return this.char_color(this.alignments[i][j]) }
      return this.alignment_unique_color(i,j)
    }

    alignment_unique_color(i,j) {
        if (!this.alignments[i][j]) { return undefined }

        const uniques = new Set()
        for (var k = 0; k <= i; k++) {
            const current_alignment = this.alignments[k][j]
            if (current_alignment) {
                uniques.add(this.alignments[k][j])
            }
        }
        const color = Math.floor(this.color_gradient.length * (uniques.size / (this.messages.length / 2)))
        return this.char_color(String.fromCharCode(color + 32))
    }

    gap_length(i,j) {
        return this.gaps[i].get(j)?.length
    }

    gap_color(length) {
        return this.ratio_color(length, this.gaps_min.get(), this.gaps_max.get())
    }

    isomorph_length(i,j) {
        const length = this.isomorphs[i]?.get(j)
        // console.log(i,j,length)
        return length
    }

    isomorph_color(i,j) {
        return this.ratio_color(this.isomorph_length(i,j), 1, this.isomorphs_max_length.get())
    }

    isomorph(messages, length) {
        const isomorphs = []
        for (var i = 0; i < messages.length; i++) {
            const map = new Map()
            for (const j of messages[i].isomorphs(length)) {
                for (const k of j.isomorph) {
                    if (k.p !== undefined) {
                        map.set(k.i, k.p)
                    }
                }
            }
            isomorphs.push(map)
        }
        // console.log("isomorphs", isomorphs)
        return isomorphs
    }

    on_load(view) {
      console.log("Analysis on_load")

      // Charts
      this.counts_chart = new CanvasJS.Chart("counts_" + this.id, {
        animationEnabled: false,
        theme: "light2",
        title: {
          text: "Counts"
        },
        legend: {
          cursor: "pointer",
        },
        axisY: {
            title: "Count",
            interval: 10
        },
        data: [{
          type: "column",
          legendMarkerType: "none",
          name: "Trigram",
          showInLegend: true,
          dataPoints: this.counts
        }]
      });

      this.kappa_periodic_chart = new CanvasJS.Chart("kappa_periodic_" + this.id, {
        animationEnabled: false,
        theme: "light2",
        title: {
          text: "Kappa (Periodic)"
        },
        legend: {
          cursor: "pointer",
        },
        axisY:{
            title: "Count",
            maximum: 70,
            interval: 10
        },
        data: [
        {
          type: "column",
          legendMarkerType: "none",
          name: "Offset",
          showInLegend: true,
          dataPoints: this.kappa_periodic
        }, 
        {
          type: "line",
          name: "Expected (English)",
          markerType: "none",
          showInLegend: true,
          toolTipContent: null,
          dataPoints: [
            { x: 0, y: 66 },
            { x: this.kappa_periodic.length, y: 66},
          ]
        }, 
        {
          type: "line",
          name: "Expected (Random)",
          markerType: "none",
          showInLegend: true,
          toolTipContent: null,
          dataPoints: [
            { x: 0, y: 12 },
            { x: this.kappa_periodic.length, y: 12},
          ]
        }]
      });

      this.kappa_autocorrelation_chart = new CanvasJS.Chart("kappa_autocorrelation_" + this.id, {
        animationEnabled: false,
        theme: "light2",
        title: {
          text: "Kappa (Autocorrelation)"
        },
        legend: {
          cursor: "pointer",
        },
        axisY:{
            title: "Count",
            maximum: 70,
            interval: 10
        },
        data: [
        {
          type: "column",
          legendMarkerType: "none",
          name: "Offset",
          showInLegend: true,
          dataPoints: this.kappa_autocorrelation
        }, 
        {
          type: "line",
          name: "Expected (English)",
          markerType: "none",
          showInLegend: true,
          toolTipContent: null,
          dataPoints: [
            { x: 0, y: 66 },
            { x: this.kappa_autocorrelation.length, y: 66},
          ]
        }, 
        {
          type: "line",
          name: "Expected (Random)",
          markerType: "none",
          showInLegend: true,
          toolTipContent: null,
          dataPoints: [
            { x: 0, y: 12 },
            { x: this.kappa_autocorrelation.length, y: 12},
          ]
        }]
    });

      this.on_change()
    }

    on_change() {
        this.messages = this.format(this.text.split("\n"), this.az.value)
        // this.messages.forEach(v => console.log(v))
        this.messages_max = this.messages.longest().length
        // this.differences = this.messages.map(v => v.difference())
        this.alignments = this.messages.alignments()
        this.gaps = (this.gaps_aligned.get() ? this.alignments : this.messages)
            .map(v => Gaps.map(v.gaps(this.gaps_min.get(), this.gaps_max.get()), this.gap_ends.get()))
        // TODO??? use this.gaps to reduce uneccesary duplicate call to get gaps
        this.gap_counts = Gaps.sum(this.messages.map(v => Gaps.counts(v.gaps(this.gaps_min.get(), this.gaps_max.get()))))
        this.isomorphs = this.isomorph(this.messages, this.isomorphs_max_length.get())
            // this.isomorphs_min_pairs.get(),
            // this.isomorphs_min_count.get(),
            // this.isomorphs_fit_length.get())
        this.frequencies = this.messages.map(v => new Frequencies(v, this.az.value))
        this.frequency_totals = new Frequencies(this.messages.join(""), this.az.value)

        this.counts = new Frequencies(this.messages.join(""), this.az.value).sorted.sort((a,b) => a[0].charCodeAt(0) - b[0].charCodeAt(0)).map((v,i) => ({ x:i, y:v[1],  }))
        this.counts_chart.options.data[0].dataPoints = this.counts
        this.counts_chart.render()

        this.kappa_periodic = Kappa.periodic(this.messages, 1, 100).map((v,i) => ({ x:i + 1, y:v }))
        this.kappa_periodic_chart.options.data[0].dataPoints = this.kappa_periodic
        this.kappa_periodic_chart.options.data[1].dataPoints[1].x = this.kappa_periodic.length
        this.kappa_periodic_chart.options.data[2].dataPoints[1].x = this.kappa_periodic.length
        this.kappa_periodic_chart.render()

        this.kappa_autocorrelation = Kappa.autocorrelation(this.messages, 1, 100).map((v,i) => ({ x:i + 1, y:v }))
        this.kappa_autocorrelation_chart.options.data[0].dataPoints = this.kappa_autocorrelation
        this.kappa_autocorrelation_chart.options.data[1].dataPoints[1].x = this.kappa_autocorrelation.length
        this.kappa_autocorrelation_chart.options.data[2].dataPoints[1].x = this.kappa_autocorrelation.length
        this.kappa_autocorrelation_chart.render()
    }
}

const az = ABC.ascii(32, 83)
// const az = ABC.ascii(42, 83)
// const az = az125.shift(32).slice(0, 122)
console.log(az)

const messages = decode(10, [0,1,2,3,4], az)

const eyes = new Analysis(messages.join("\n"), az, false)
const comparison = new Analysis(pt.join("\n"), az, true)

const view = new View(eyes, comparison)

String.prototype.ngrams = function(n, sliding = true, repeats = false) {
    const indexes = new Map()

    const ngrams = new Map()
    for (var i = 0; i <= this.length - n; i += sliding ? 1 : n) {
        const ngram = this.slice(i, i + n)
        if (repeats && new Set(ngram).size > 1) { continue }
        if (!ngrams.has(ngram)) { ngrams.set(ngram, 0); indexes.set({ i:i, length:i + n, c: ngram }) }
        ngrams.set(ngram, ngrams.get(ngram) + 1)
    }
    return ngrams
}

console.log("DEBUG")

// console.log(eyes.messages[0].ngrams(2, true, true))
console.log(messages[0].ngrams(3, true, false))
// console.log(messages.join("\n"))

console.log(Cipherkey.decrypt(messages[0], "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrR", az, Shift.chain(Shift.additive, Shift.alternating(Shift.exponential(3), 2))))
console.log(Cipherkey.decrypt(messages[1], "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrR", az, Shift.chain(Shift.additive, Shift.alternating(Shift.exponential(3), 2))))
console.log(Cipherkey.decrypt(messages[2], "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrR", az, Shift.chain(Shift.additive, Shift.alternating(Shift.exponential(3), 2))))

class Balanced {
    static cipher(pt, kt, az = az26) {
        // console.log("cipher", pt, kt, az)
        const k = kt.split("").map(v => az.indexOf(v))
        const pi = pt.split("").map(v => az.indexOf(v))
        const ki = pi.map((v, i) => k[i % k.length])
        const subs = pi.map((v, i) => (ki[i] - v) + az.length)
        const mods = subs.map(v => v % az.length)
        const ct = mods.map(v => az[v])
    
        return ct.join("")
    }

    static encrypt = Balanced.cipher
    // TODO
    static decrypt = Balanced.cipher
}

console.log(messages[0].split("").map(v => v.charCodeAt(0) - 32))
console.log(messages[0].difference().map(v => String.fromCharCode(v + 32)).join(""))
console.log(messages[1].difference().map(v => String.fromCharCode(v + 32)).join(""))
console.log(Balanced.encrypt("AAA", az26, az26))
console.log(Balanced.encrypt("BBB", az26, az26))
console.log(Balanced.encrypt("CCC", az26, az26))
console.log(Balanced.encrypt("DDD", az26, az26))
console.log(Balanced.encrypt("EEE", az26, az26))

console.log(az83_42)

{
  // Shift.encrypt(pt, az36.reverse(), az, [Shift.additive, Shift.alternate(Shift.multiplicative(33), 2), Shift.alternating(Shift.exponential(5), 5)])
  const ct = pt.map(v => Shift.encrypt(v, az83, az83, [Shift.additive, Shift.alternate(Shift.additive, Shift.exponential(3), 2), Shift.alternate(Shift.multiplicative(33), 3)]))
  ct.forEach(v => console.log(v))
  const pt2 = ct.map(v => Shift.decrypt(v, az83, az83, [Shift.additive, Shift.alternate(Shift.additive, Shift.exponential(3), 2), Shift.alternate(Shift.multiplicative(33), 3)]))
  pt2.forEach(v => console.log(v))
}

{
  const k = [7,1,2,3,11,2,2,4,5,0,0,3,2,6,7,2,0,6,5,9,2,1,1,0,2,0]
  const ct = Homophonic.encrypt(pt[8], k, az83)
}