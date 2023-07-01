
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

Array.prototype.alignments = function() {
    const alignments = Array(this.length).fill().map((_,i) => Array(this[i].length).fill())
    for (var i = 0; i < this.length; i++) {
        const message1 = this[i]
        for (var j = i + 1; j < this.length; j++) {
            const message2 = this[j]
            for (var k = 0; k < message1.length; k++) {
                if (message1[k] === message2[k]) {
                    alignments[i][k] = message1[k]
                    alignments[j][k] = message2[k]
                }
            }
        }
    }
    return alignments
}

Array.prototype.last = function() {
    return this[this.length - 1]
}

class Text {
    constructor(s, gaps) {
        this.s = s
        this.gaps = gaps
    }

    isomorphs(max_length, min_pairs, min_count, fit_length) {
        const isomorphs = []
        for (var j = 0; j < this.s.length - max_length; j++) {
            // console.log("gaps", this.gaps)
            if (this.gaps.has(j) && this.gaps.get(j).start == undefined) {
                const isomorph = []
                const counts = new Map()
                for (var k = j; k <= j + max_length; k++) {
                    if (this.gaps.has(k)) {
                        const gap = this.gaps.get(k)
                        // console.log("gap", gap)
                        isomorph.push(gap)
                        if (!counts.has(gap.c)) { counts.set(gap.c, 0) }
                        counts.set(gap.c, counts.get(gap.c) + 1)
                    }
                }
                // console.log("counts", counts)
                // console.log("isomorph", isomorph)
                if (fit_length && (isomorph.last().i - isomorph[0].i) < max_length || isomorph.last().start == undefined) { continue }
                
                const filtered = []
                // min_count 15,1,1/2
                // console.log([...counts.keys()].filter(v => counts.get(v) >= min_count))
                if ([...counts.keys()].filter((v => counts.get(v) >= min_count)).length >= min_pairs) {
                    filtered.push(...isomorph.filter(v => counts.get(v.c) >= min_count ))
                }
                
                // console.log("filtered", filtered)
                if (filtered.length > 0) {
                    isomorphs.set(new Isomorph(filtered))
                }
            }
        }
        return isomorphs
    }
}

Array.prototype.set = function(o) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].equals(o)) { return this; }
    }
    this.push(o)
    return this
}

class Isomorph {
    constructor(indexes) {
        this.indexes = indexes
        this.az = Array.from(new Set(this.indexes.map(v => v.c)))

        this.hash_code = this.indexes.map(v => v.i).join("|")
    }

    equals(isomorph) {
        return this.hash_code == isomorph.hash_code
    }

    string() {
        if (this.indexes.length === 0) { return "" }

        const isomorph = []
        const map = new Map()

        this.indexes.forEach(v => map.set(v.i, v))
        for (var i = this.indexes[0].i; i <= this.indexes.last().i; i++) {
            isomorph.push(map.has(i) ? az26[this.az.indexOf(map.get(i).c)] : "_")
        }
        return isomorph.join("")
    }
}

class Eyes {
    constructor(text) {
        this.text = text
        this.text_editing = new Observable(false, this)
        this.messages = []
        this.messages_max = 0
        this.alignment_unique = new Observable(false, this)
        this.gaps_min = new Observable(1, this)
        this.gaps_max = new Observable(16, this)
        this.gaps_aligned = new Observable(false, this)
        this.gap_ends = new Observable(true, this)
        this.isomorphs_max_length = new Observable(16, this)
        this.isomorphs_min_pairs = new Observable(1, this)
        this.isomorphs_min_count = new Observable(2, this)
        this.isomorphs_fit_length = new Observable(true, this)

        this.color_gradient = new Gradient().setColorGradient("#073b6b", "#2c7e8d").setMidpoint(35).getColors().concat(
        new Gradient().setColorGradient("#2c7e8d", "#fce53f").setMidpoint(48).getColors())

        this.on_change()
    }

    encrypt(text) {
        return text
        return text.map(v => Vigenere.encrypt(v, "i!i", az83))
    }

    char_color(c) {
        // return RGB.spread(c.charCodeAt(0))
        // return this.rgb(c.charCodeAt(0))
        if (c) { return this.color_gradient[c.charCodeAt(0) - 32] }
        return "transparent"
    }

    ratio_color(length, min, max) {
        if (length) {
            const ratio = this.color_gradient.length / (max - min + 1)
            const color = Math.round((length - min) * ratio)
            return this.color_gradient[color]
        }
        return "transparent"
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
        const length = this.isomorphs[i]?.get(j)?.length
        // console.log(length)
        return length
    }

    isomorph_color(i,j) {
        return this.ratio_color(this.isomorph_length(i,j), 1, this.isomorphs_max_length.get())
    }

    isomorph(messages_gaps, max_length, min_pairs, min_count, fit_length) {
        const isomorphs = []
        const isomorphs_shared = new Map()
        for (var i = 0; i < messages_gaps.length; i++) {
            isomorphs.push([])
            const message = this.messages[i]
            const message_gaps = messages_gaps[i]
            const morphs = new Text(message, message_gaps).isomorphs(max_length, min_pairs, min_count, fit_length)
            // console.log("morphs", morphs)
            for (var j = 0; j < morphs.length; j++) {
                const s = morphs[j].string()
                // console.log(s)
                if (!isomorphs_shared.has(s)) { isomorphs_shared.set(s, 0)}
                isomorphs_shared.set(s, isomorphs_shared.get(s) + 1)
            }
            // console.log("shared", isomorphs_shared)
            isomorphs[i].push(...morphs)
        }

        const map =  Array(this.messages.length).fill().map(_ => new Map())

        isomorphs.forEach((v,i) => v.forEach(w => {
            if (isomorphs_shared.get(w.string()) > 1) {
                w.indexes.forEach(x => map[i].set(x.i, x))
            }
        }))
        // console.log("map", map)
        return map
    }

    on_change() {
        // console.log("text", this.text_messages)
        this.messages = this.encrypt(this.text.split("\n"))
        this.messages_max = this.messages.longest().length
        this.alignments = this.messages.alignments()
        this.gaps = (this.gaps_aligned.get() ? this.alignments : this.messages)
            .map(v => Gaps.map(v.gaps(this.gaps_min.get(), this.gaps_max.get()), this.gap_ends.get()))
        // TODO use this.gaps to reduce uneccesary duplicate call to get gets
        this.gap_counts = Gaps.sum(this.messages.map(v => Gaps.counts(v.gaps(this.gaps_min.get(), this.gaps_max.get()))))
        this.isomorphs = this.isomorph(this.messages.map(v =>
                Gaps.map(v.gaps(1, this.isomorphs_max_length.get()), true)),
            this.isomorphs_max_length.get(),
            this.isomorphs_min_pairs.get(),
            this.isomorphs_min_count.get(),
            this.isomorphs_fit_length.get())
        this.frequencies = this.messages.map(v => new Frequencies(v, az83))
        this.frequency_totals = new Frequencies(this.messages.join(""), az83)
    }
}

const eyes = new Eyes(decode(10).join("\r\n"))
// const eyes = new Eyes(pt.join("\n"))
// const eyes = new Eyes("Rb%RbP^-k=8]Jfb^@.q(/n\"=-Q!prH_q53 HSa:.5fOLPJ3P-O3Qh?%8#K[cAQI\\5:>%94g+jX$j3g$SIKpRb%Rb")

console.log("DEBUG")
const length = 5
for (const i of [0]) {
    const isomorphs = new Text(eyes.messages[i], Gaps.map(eyes.messages[i].gaps(1, length), true)).isomorphs(length,2,2)
    console.log(isomorphs)
    isomorphs.forEach(v => console.log(v.string()))
}

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

// console.log(eyes.messages[0].ngrams(2, true, true))
console.log(eyes.messages[0].ngrams(3, true, false))
console.log(eyes.messages.join("\r\n"))
