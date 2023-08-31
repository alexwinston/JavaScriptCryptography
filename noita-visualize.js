
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

class Integer {
  static random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
}

const expected = [0.0815,0.0144,0.0276,0.0379,0.1311,0.0292,0.0199,0.0526,0.0635,0.0013,0.0042,
    0.0339,0.0254,0.0710,0.08,0.0198,0.0012,0.0683,0.061,0.1047,0.0246,0.0092,
    0.0154,0.0017,0.0198,0.0008]

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
        // if (this[i].equals(o)) { return this; }
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
    constructor(text, az, ciphering, cipher = "") {
        this.id = guid()
        this.text = text
        this.text_editing = new Observable(false, this)
        this.az = new Observable(az, this)
        this.ciphering = new Observable(ciphering, this)
        this.ciphers = Object.freeze([
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
            'Hill.encrypt(pt, [[23,33,73],[0,31,7],[0,54,15]], az)',
          ]},
          { name: "Chao", examples: [
            'Chao.encrypt(pt, az, az)',
          ]},
          { name: "Progressive", examples: [
            'Progressive.encrypt(pt, 0, 27, 1, 47, az)'
          ]},
          { name: "Homophonic", examples: [
            'Homophonic.encrypt(pt, [7,1,2,3,11,2,2,3,4,1,1,3,2,6,6,2,1,6,5,9,2,1,1,1,1,0], az)'
          ]},
          { name: "Alberti", examples: [
            'Alberti.encrypt(pt, az, 1, 35, 3)'
          ]},
          { name: "Composite", examples: [
            'Vigenere.encrypt(Progressive.encrypt(pt, 0, 27, 1, 47, az), "SECRET", az)',
            'Multiplicative.encrypt(Cipherkey.encrypt(pt, "i!i", az), 33, az)',
            'Homophonic.encrypt(Gronsfeld.encrypt(pt, Array.from({ length: pt.length }, (_,i) => (i + 1)*13), az26), [6,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3], az)'
          ]}
        ])
        // this.cipher = new Observable(this.ciphers[2].examples[3], this)
        // this.cipher = new Observable(this.ciphers[7].examples[0], this)
        this.cipher = new Observable(cipher, this)
        this.messages = Object.freeze([])
        this.messages_max = 0
        this.frequencies = Object.freeze([])
        this.frequency_totals = undefined
        this.differences = Object.freeze([])
        this.counts = Object.freeze([])
        this.kappa_periodic = Object.freeze([])
        this.kappa_autocorrelation = Object.freeze([])
        this.alignment_unique = new Observable(false, this)
        this.gaps_min = new Observable(0, this)
        this.gaps_max = new Observable(16, this)
        this.gaps_aligned = new Observable(false, this)
        this.gap_ends = new Observable(true, this)
        this.isomorphs = Object.freeze([])
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
        return this.ciphering.value ? text.map(v => new Function("pt", "az", "return " + this.cipher.value)(v,az)) : text
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

    isomorph(messages, length, min = 2) {
      const shared = Isomorphs.shared(messages.map(v => v.isomorphs(length)), min)

        const isomorphs = []
        for (var i = 0; i < shared.length; i++) {
            const map = new Map()
            for (const j of shared[i]) {
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
        console.log(this.messages.join("\n"))
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

        // console.log(this.messages.join("\n"))
        // const bigrams = Ngrams.sum(this.messages.map(v => v.ngrams(2)))
        // console.log("bigrams", bigrams)
        // console.log(bigrams.length)
        // console.log(bigrams[0])
        // console.log(bigrams[1])
        // console.log(bigrams[2])
        // console.log(bigrams.map(v => v[1]).avg())
        // const trigrams = Ngrams.sum(this.messages.map(v => v.ngrams(3)))
        // console.log(trigrams)
        // console.log(trigrams.length)
        // console.log(trigrams[0])
        // console.log(trigrams[1])
        // console.log(trigrams[2])
        // console.log(trigrams.map(v => v[1]).avg())
    }
}

String.prototype.chunk = function(n) {
  return chunk(this.split(""), n).map(v => v.join(""))
}

const az = ABC.ascii(32, 83)
// const az = ABC.ascii(42, 83)
// const az = az125.shift(32).slice(0, 122)
// const az = ABC.ascii(0, 125)
console.log(az)

// const permutations = [0,1,2,3,4].permute()
// permutations.forEach(v => decode(7, v, az))
// const messages = decode(7, [2,1,0,3,4], az)
// const messages = decode(10, [4,3,2,1,0], ABC.ascii(0, 125))
const messages = decode(10, [0,1,2,3,4], az)

const eyes = new Analysis(messages.join("\n"), az, false, "Homophonic.decrypt(pt, [5,1,1,2,11,2,2,3,5,2,2,4,3,5,7,1,1,4,4,8,2,1,2,1,2,2], az)")
const comparison = new Analysis(pt.join("\n"), az, true, "Homophonic.encrypt(pt, [5,1,1,2,11,2,2,3,5,2,2,4,3,5,7,1,1,4,4,8,2,1,2,1,2,2], az)")

const view = new View(eyes, comparison)

console.log("DEBUG")

{
  // const az = ABC.ascii(32, 64)
  const az = ABC.key("FELIXMARIEDELASTELLE", az26 + ".")

  console.log(Trifid.encrypt("AIDETOILECIELTAIDERA", 3, 5, az))
  console.log(Trifid.encrypt(pt[0], 4, 5, ABC.ascii(32, 64)))
}

class Cipher {
  static encrypt(pt, az, fn) {
    const ct = []
    for (var i = 0; i < pt.length; i++) {
      ct.push(az[fn({ pt:pt, ct:ct, i:i, c:pt[i], a:az.indexOf(pt[i]), az:az })])
    }
    return ct.join("")
  }
}

{
  console.log(Gronsfeld.encrypt("TEST", Array.from({ length: pt.length }, (_,i) => (i + 1)**3), az))
  // const ct = Cipher.encrypt("TEST", az, (v) => (v.a + (v.i + 1)**3) % az.length)
  const ct = Cipher.encrypt("TEST", az, (v) => ((v.a * 33) + (v.i + 1)**3) % az.length)
  console.log(ct)
}

{
  console.log(Homophonic2.encrypt("AABBCCDDAABABD", [4,2,1,1], "ABCD1234"))
  const k = [3,3,4,3,7,3,2,3,4,2,2,3,2,5,6,2,2,5,4,6,2,2,2,2,2,2]
  console.log(k.reduce((p,c) => p + c, 0))
  console.log(Homophonic.encrypt("AABBCCDDAABABD", k, az83))
  console.log(Homophonic2.encrypt("AABBCCDDAABABD", k, az83))
  console.log(Homophonic2.decrypt(Homophonic2.encrypt("AABBCCDDAABABD", k, az83), k, az83))
}

{
  const pt = "THISISATESTOFTHEEMERGENCYBROADCASTSYSTEM"
  console.log(Alberti.encrypt(pt, "usqomkhfdbacegilnprtxz&y01", 0, 2, 3))
}

{
  const ct = Chao.encrypt("THISISATESTOFTHEEMERGENCYBROADCASTSYSTEM", az83, az26)
  console.log(ct)
  console.log(Chao.decrypt(ct, az83, az26))
  console.log(Chao.decrypt(ct, az83, az26))
}

{ 
  const k = [5,1,1,2,11,2,2,3,5,2,2,4,3,5,7,1,1,4,4,8,2,1,2,1,2,2]
  console.log("reduce", k.reduce((c,p) => c + p, 0))

  // const ct = Homophonic.encrypt("AZTHISLAZYDOGEMERGENCYBROADCAST", k, az83)
  const ct = Homophonic.encrypt(az26 + az26.reverse() + az26, k, az83)
  console.log(ct)
  console.log(Homophonic.decrypt(ct, k, az83))
}

// TODO Kappa positional
{
  console.log(Kappa.positional(messages, 0))
  console.log(Kappa.positional(messages, 25))
  console.log(Kappa.positional(messages, 50))
}

// TODO N-gram counts, max w/ multiples
{
  const m = new Map()
  messages.forEach(v => {
    for (var i = 0; i < v.length - 1; i++) {
      const k = v[i] + v[i+1]
      if (!m.has(k)) { m.set(k, 0) }
      m.set(k, m.get(k) + 1)
    }
  })
  console.log(m)
}

// TODO Difference counts, UI?
{ 
  const m = new Map()
  messages.forEach(w => w.difference().forEach(v => {
    if (!m.has(v)) { m.set(v,0) }
    m.set(v,m.get(v) + 1)
  }))
  console.log(m)
}

// TODO Entropy

// N-grams but only consider the first min number of chars
String.prototype.grams = function(length, min = 1, sliding = true) {
  const ngrams = new Map()
    for (var i = 0; i <= this.length - length; i += sliding ? 1 : length) {
        const ngram = this.slice(i, i + length)
        const k = ngram.substring(0,min)
        if (!ngrams.has(k)) { ngrams.set(k, [])}
        ngrams.get(k).push(new Ngram(ngram))
        ngrams.get(k).last().indexes.add(i)
    }
    // console.log(ngrams)
    return ngrams
    // return [...ngrams.values()].sort((a,b) => b.length - a.length)
}

{
  // console.log(messages[0].grams(2,1))
  const m = new Map()
  for (var i = 0; i < messages.length; i++) {
    const grams = messages[i].grams(2,1)
    grams.forEach((v,k) => { if (!m.has(k)) { m.set(k,[]) }; m.get(k).push(...v) })
  }
  // console.log(m)
  // console.log("grams", [...m.values()].sort((a,b) => b.length - a.length))
}

// TODO Average distances
{
  const m = new Map()
  for (var i = 0; i < messages.length; i++) {
    const difference = messages[i].difference()
    // console.log(difference)
    difference.forEach(v => { if (!m.has(v)) { m.set(v, 0) }; m.set(v, m.get(v) + 1) })
  }
  console.log(m)
  console.log([...m.values()].sort((a,b) => b.length - a.length))
}

{
  const ct = [
    "$kn$8kABCDEA1",
    " $kn$8kabcdefghd",
    "AB$kn$8kd1fghd123456789",
  ]
  console.log("$kn$8k".isomorphs(6))
  console.log(Isomorphs.shared(ct.map(v => v.isomorphs(6)),2))
}

{
  const gaps = new Map()
  for (var i = 0; i < messages.length; i++) {
    const message = messages[i]
    // console.log(message)
    for (const j of message.gaps(1,message.length)) {
      // console.log(j)
      if (!gaps.has(j.c)) { gaps.set(j.c, []) }
      gaps.get(j.c).push(j)
    }
  }
  console.log(gaps)
}

String.prototype.step = function(n) {
  const step = []
  for (var i = 0, j = 0, k = 1; i < this.length; i++, j+=n) {
    console.log(j, j / this.length)
    if (j >= this.length) { j = k++ }
    step.push(this[j % this.length])
  }
  return step.join("")
}

{
  console.log("differences", messages[3].difference().map(v => String.fromCharCode(v + 32)).join(""))
}

{ 
  console.log(messages.map(v => v.map(w => w.charCodeAt(0) - 32).join("")))
}