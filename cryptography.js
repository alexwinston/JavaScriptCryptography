const az26 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const az83 = Array.from({ length:83 }, (_, i) => String.fromCharCode(i + 32)).join("")
const az83_42 = Array.from({ length:83 }, (_, i) => String.fromCharCode(i + 42)).join("")
const az85 = Array.from({ length:85 }, (_, i) => String.fromCharCode(i + 32)).join("")
const az125 = Array.from({ length:125 }, (_, i) => String.fromCharCode(i)).join("")

// const factorial = n =>  n - 1n > 0 ? n * factorial(n - 1n) : n;
const factorial = n => !n ? 1n : n * factorial(--n);

const chunk = (a, n) =>
    Array.from(
        new Array(Math.ceil(a.length / n)),
        (_, i) => a.slice(i * n, i * n + n)
    );

function base(digits, srcb, destb){
    let val = 0n
    srcb = BigInt(srcb)
    destb = BigInt(destb)
    for(let i = 0; i < digits.length; i++){
        val = val * srcb + BigInt(digits[i])
    }
    let res = []
    while(val !== 0n){
        res.unshift(Number(val % destb))
        val = val / destb
    }
    if (res.length == 0) { res.unshift(0,0) }
    if (res.length == 1) { res.unshift(0) }
    return res
}

const shift = (a,n) => [...a.slice(n, a.length), ...a.slice(0, n)]

const xor = (a, b) => {
    let s = '';
    // use the longer of the two words to calculate the length of the result
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      // append the result of the char from the code-point that results from
      // XORing the char codes (or 0 if one string is too short)
      s += String.fromCharCode(a.charCodeAt(i) ^ b.charCodeAt(i));
    }
    return s;
};

function cipher(pt, kt, az) {
    // console.log("cipher", pt, kt, az)
    const k = kt.split("").map(v => az.indexOf(v))
    const pi = pt.split("").map(v => az.indexOf(v))
    const ki = pi.map((v, i) => k[i % (k.length)])
    const sums = pi.map((v, i) => pi[i] + ki[i])
    // const mods = sums.map((v, i) => (v + sums.length + i) % (az.length - 1))
    const mods = sums.map(v => v % (az.length))
    const ct = mods.map(v => az[v])

    return ct//.join("")
}

function decipher(ct, kt, az) {
    // console.log("decipher", ct, kt, az)
    const k = kt.split("").map(v => az.indexOf(v))
    // console.log(k)
    const ci = ct.split("").map(v => az.indexOf(v))
    // console.log(ci)
    // const sums = ci.map((v, i) => az.indexOf(v))
    const pt = ci.map((v, i) => az[(((v - k[i % k.length])) + az.length) % az.length])
    // console.log(pt)

    return pt//.join("")
}

class Shift {
    // TODO additive(n) k + n, k - n
    static additive = {
        shift: (p, k, i, az) => (p + k).mod(az.length),
        unshift: (p, k, i, az) => (p - k).mod(az.length)
    }

    static multiplicative = (m) => Multiplicative.f(m)

    // Only 1,3,5,7 are valid exponents for mod(83), all others produce fewer unique values than the modulo
    static exponetial = (e) => Exponentiation.f(e)

    static alternate = (cipher, n = 2) => ({
        shift: (p, k, i, az) => i % n === 0 ? cipher.shift(p, k, i, az) : p,
        unshift: (p, k, i, az) => i % n === 0 ? cipher.unshift(p, k, i, az) : p
    })

    static alternating = (cipher, n = 2, index = []) => ({
        shift: (p, k, i, az) => { index.push(index.length % n === 0 ? cipher.shift(p, k, i.length, az) : p); return index.at(-1) },
        unshift: (p, k, i, az) => { index.push(index.length % n === 0 ? cipher.unshift(p, k, i.length, az) : p); return index.at(-1) }
    })

    static index(string, key, az, cipher) {
        // console.log("Shift.index", string, key, az, cipher)
        const k = key.split("").map(v => az.indexOf(v))
        const si = string.split("").map(v => az.indexOf(v))
        // console.log(si)
        const ki = si.map((v, i) => k[i % (k.length)])
        // console.log(ki)
        // TODO reduce ciphers here instead of after each indexing
        const shifts = si.map((v, i) => cipher(si[i], ki[i], i, az))
        // console.log(shifts)
        const ct = shifts.map(v => az[v])
    
        return ct.join("")
    }

    // https://www.freecodecamp.org/news/reduce-f47a7da511a9/
    static cipher(pt, kt, az = az26, ciphers = [Shift.additive]) {
        return ciphers.reduce((s,f) => Shift.index(s, kt, az, f.shift), pt)
    }

    static decipher(ct, kt, az = az26, ciphers = [Shift.additive]) {
        return Array.from(ciphers).reverse().reduce((s,f) => Shift.index(s, kt, az, f.unshift), ct)
    }

    static chain = (...ciphers) => ({
        encrypt: (pt, kt, az) => Shift.encrypt(pt, kt, az, ciphers),
        decrypt: (ct, kt, az) => Shift.decrypt(ct, kt, az, ciphers)
    })

    static encrypt = Shift.cipher
    static decrypt = Shift.decipher
}

class Vigenere {
    static cipher(pt, kt, az = az26) {
        return Shift.cipher(pt, kt, az, [Shift.additive])
    }
    static decipher(ct, kt, az = az26) {
        return Shift.decipher(ct, kt, az, [Shift.additive])
    }

    static encrypt = Vigenere.cipher
    static decrypt = Vigenere.decipher
}

// class Vigenere {
//     static cipher(pt, kt, az = az26, shift = ) {
//         // console.log("cipher", pt, kt, az)
//         const k = kt.split("").map(v => az.indexOf(v))
//         const pi = pt.split("").map(v => az.indexOf(v))
//         const mi = pi
//         // console.log(mi)
//         const ki = mi.map((v, i) => k[i % (k.length)])
//         const sums = pi.map((v, i) => mi[i] + ki[i])
//         const mods = sums.map(v => v % (az.length))
//         const ct = mods.map(v => az[v])
    
//         return ct.join("")
//     }

//     static decipher(ct, kt, az = az26) {
//         // console.log("decipher", ct, kt, az)
//         const k = kt.split("").map(v => az.indexOf(v))
//         const ci = ct.split("").map(v => az.indexOf(v))
//         const ki = ci.map((v, i) => k[i % (k.length)])
//         const sums = ci.map((v, i) => (ci[i] - ki[i]) + az.length)
//         const mods = sums.map((v, i) => v % (az.length))
//         const pt = mods.map(v => az[v])
    
//         return pt.join("")
//     }

//     static encrypt = Vigenere.cipher
//     static decrypt = Vigenere.decipher
// }

// https://macs4200.org/chapters/07/4/autokey-cipher.html
class Autokey {
    static encrypt(pt, k, az = az26, cipher = Vigenere) {
        const ks = k + pt

        const ct = []
        for (var i = 0; i < pt.length; i++) {
            ct.push(cipher.encrypt(pt[i], ks[i], az)[0])
        }
        return ct.join("")
    }
    
    static decrypt(ct, k, az = az26, cipher = Vigenere) {
        const pt = []
        pt.push(...k)
        pt.push(...cipher.decrypt(ct.substring(0, k.length), k, az))
        for (var i = k.length; i < ct.length; i++) {
            pt.push(cipher.decrypt(ct[i], pt[i], az)[0])
            // console.log(pt)
        }
        return pt.join("").substring(k.length)
    }
}

// https://www.nsa.gov/portals/75/documents/news-features/declassified-documents/friedman-documents/publications/FOLDER_257/41751589079090.pdf
class Cipherkey {
    static letter(pt, kt, az = az26, cipher = Vigenere) {
        const ct = Array.from(cipher.encrypt(pt[0], kt[0], az)[0])
        for (var i = 1; i < kt.length; i++) {
            // console.log(pt[i], ct[i-1], az)
            ct.push(cipher.encrypt(pt[i], kt[i], az)[0])
        }
        for (var i = kt.length; i < pt.length; i++) {
            ct.push(cipher.encrypt(pt[i], ct[i-1], az)[0])
        }
        return ct.join("")
    }

    static word(pt, k, az = az26, cipher = Vigenere) {
        // console.log("encrypt", pt, k, az)
        const ct = Array.from(cipher.encrypt(pt.substring(0,k.length), k, az))
        for (var i = k.length, j = 0; i < pt.length; i++) {
            ct.push(cipher.encrypt(pt[i], ct[++j -1], az)[0])
        }
        return ct.join("")
    }

    static encrypt(pt, kt, az = az26, cipher = Vigenere, keying = Cipherkey.letter) {
        // Ensure kt is not longer than pt
        if (kt.length > pt.length) { kt = kt.slice(0, pt.length) }
        return keying(pt, kt, az, cipher)
    }

    static decrypt(ct, kt, az = az26, cipher = Vigenere, keying) {
        // TODO Accept function that handles keying
        if (keying != undefined) { kt = kt + ct }

        const pt = []
        pt.push(cipher.decrypt(ct[0], kt[0], az)[0])
        // console.log(pt)
        for (var i = 1; i < ct.length && i < kt.length; i++) {
            pt.push(cipher.decrypt(ct[i], kt[i], az)[0])
            // console.log(i, pt)
        }
        for (var i = kt.length; i < ct.length; i++) {
            pt.push(cipher.decrypt(ct[i], ct[i-1], az)[0])
            // console.log(i, pt)
        }
        return pt.join("")
    }
}

class Beaufort {
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

    static encrypt = Beaufort.cipher
    // TODO
    static decrypt = Beaufort.cipher
}

class Mod {
    static inverse(a, m) {
        for(let x = 1; x < m; x++)
            if (((a % m) * (x % m)) % m == 1)
                return x;
    
        return 0
    }
}

// https://www.researchgate.net/publication/304913747_A_Study_on_Network_Security_Services_with_Cryptography_and_an_Implementation_of_Vigenere-_Multiplicative_Cipher
// https://macs4200.org/chapters/04/5/multiplicative-cipher.html
class Multiplicative {
    static f = (m) => ({
        shift: (p, k, i, az = az26) => (p * m).mod(az.length),
        unshift: (p, k, i, az = az26) => Multiplicative.inverse(p, m, az.length)
    })

    static encrypt(pt, k, az = az26) {
        return Shift.encrypt(pt, "", az, [Multiplicative.f(k)])
    }

    static decrypt(ct, k, az = az26) {
        return Shift.decrypt(ct, "", az, [Multiplicative.f(k)])
    }

    static inverse(n, multiplier, modulus) {
        return (n * Mod.inverse(multiplier, modulus)).mod(modulus)
    }
}

class Exponentiation {
    static f = (e) => ({
        shift: (p, k, i, az) => (p**e).mod(az.length),
        unshift: (p, k, i, az) => Exponentiation.inverse(e, az.length, p)
    })
    static inverse = (e, m, r) => {
        for (var i = 0; i < m; i++) {
            const a = (i**e) % m
            if (a == r) {
                return i
            }
        }
    }

    static encrypt(pt, kt, k, az = az26) {
        return Shift.encrypt(pt, kt, az, [Exponentiation.f(k)])
        // return Shift.encrypt(Vigenere.encrypt(pt, kt, az), kt, az, Exponentiation.f(k))
    }

    static decrypt(ct, kt, k, az = az26) {
        return Shift.decrypt(ct, kt, az, [Exponentiation.f(k)])
        // return Vigenere.decrypt(Shift.decrypt(ct, kt, az, Exponentiation.f(k)), kt, az)
    }
}

class Trithemius {
    static encrypt(s, kt = az26, az = az26, cipher = Vigenere) {
        return cipher.encrypt(s, kt, az)
    }

    static decrypt(s, kt = az26, az = az26, cipher = Vigenere) {
        return cipher.decrypt(s, kt, az)
    }
}

function split(s, n) {
    if (n === 1) { return s.split("") }
    var regex = new RegExp('.{' + n + '}|.{1,' + Number(n-1) + '}', 'g');
    return s.match(regex);
}

const cshift = (a,c) => { c = a.indexOf(c); return [...a.slice(c, a.length), ...a.slice(0, c)] }

function tshift(abc, s) {
    const t = []
    for (var i = 0; i < s.length; i++) {
        t.push(cshift(abc, s[i]))
    }
    return t
}

function think(ct, abc, table) {
    // console.log(abc)
    // console.log(table)
    const pt = []
    for (var i = 0; i < ct.length; i++) {
        const c = ct[i]
        const j = table[i % table.length].indexOf(c)
        pt.push(abc[j])
    }
    return pt
}

function abc(key, alphabet) {
    const s = new Set(key)
    alphabet.split("").forEach(v => s.add(v))
    return [...s]
}

const shuffle = s => [...s].sort(()=>Math.random()-.5).join('');

class Numbers {
    static gcf(a) {
        const gcf = []
        for (var i = 0; i < a.length; i++) {
            gcf.push(factors(a[i]))
        }
        return gcf.reduce((p,c) => p.filter(v => c.includes(v))).reverse()[0];
    }

    static gcd(a, b) {
        if (a == 0)
            return b;
        return NUmbers.gcd(b % a, a);
    }
}

class ABC {
    constructor(p, c) {
        this.p = p
        this.c = c
    }

    // TODO rename to offset?
    static shift(az, c) {
        return cshift(az, c).join("")
    }

    static offset(az, n) {
        return shift(az, n).join("")
    }

    static step(az, n) {
        const step = []
        for (var i = 0, j = 0; i < az.length; i++, j+=n) {
            step.push(az[j % az.length])
        }
        return step.join("")
    }

    static filter(s, az = az26) {
        return s.split("").filter(v => az.split("").includes(v)).join("")
    }

    static key(k, az) {
        return abc(k, az).join("")
    }

    static counter(az) {
        const m = {}
        for (var i = 0; i < az.length; i++) {
            m[az[i]] = 0
        }
        return m
    }

    cipher(pt) {
        const ct = []
        for (var i = 0; i < pt.length; i++) {
            ct.push(this.c[this.p.indexOf(pt[i])])
        }
        return ct.join("")
    }

    decipher(pt) {
        const ct = []
        for (var i = 0; i < pt.length; i++) {
            ct.push(this.p[this.c.indexOf(pt[i])])
        }
        return ct.join("")
    }

}

class Frequencies {
    // static English = "ETAOINSHRDLCUMWFGYPBVKJXQZ"
    static English = "ETAOINSRHLDCUMFGPWYBVKJXZQ"
    // static English = "ESIARNTOLCDUGPMHBYFVKWZXJQ"

    constructor(s, az = az26) {
        this.phi_r = 1/az.length * s.length * (s.length - 1)
        this.s = [...s].reduce((a, c) => az.includes(c) ? a.concat(c) : a, "")
        this.s_az = az
        this.f = [...s].reduce((a, c) => az.indexOf(c) >= 0 ? (a[c] = ++a[c] || 1) && a : a, ABC.counter(az))
        // const f = [...s].reduce((a,c) => az.indexOf(c) >= 0 ? a.get(c) ? a.set(c, a.get(c) + 1) : a.set(c,1) : a, new Map()) 
        this.sorted = Object.entries(this.f).sort((a,b) => b[1] - a[1])
        this.az = this.sorted.map(el => el[0]).join("")
    }

    substitute(az = Frequencies.English) {
        return this.s.split("").map(v => this.az.indexOf(v) >= 0 ? az[this.az.indexOf(v)] : v).join("")
    }

    x2() {
        const x2 = []
        for (var i = 0; i < this.s_az.length; i++) {
            const counts = shift(this.s_az.split("").map(v => this.f[v]), i)
            x2.push(Chi.fit(counts))
        }
        // return x2.indexOf(Math.min(...x2))
        return this.s_az[x2.indexOf(Math.min(...x2))]
    }

    // https://en.wikipedia.org/wiki/Index_of_coincidence
    // Currently returning the Kp (Kappa plaintext) rather than IC
    // Monographic IC is calculated by multiplying Kp by 26 for English, ie 0.067 * 26
    ic_mono() {
        var ic = 0
        for (var a in this.f) {
            ic += (this.f[a]/this.s.length)**2
        }
        return ic
    }

    // MILCRYP1 pg 41
    ic(width = 1) {
        const freqs = []
        // Observed (delta o) across width
        const w = split(this.s, width)
        // console.log(w)
        for (var i = 0; i < width; i++) {
            const d = []
            for (var j = 0; j < w.length; j++) {
                d.push(w[j][i])
            }
            freqs.push(new Frequencies(d.join(""), this.s_az).f)
        }
        // console.log(freqs)

        var phi_o = 0
        for (var i = 0; i < freqs.length; i++) {
            var i_phi_o = 0
            const freq = freqs[i]
            for (var a in freq) {
                const f = freq[a]
                i_phi_o += f * (f - 1)
            }
            phi_o += i_phi_o
        }
        // console.log(phi_o)

        const length = this.s.length / width
        // console.log(length)
        return (this.s_az.length * phi_o) / (width * (length * (length - 1)))
    }

    static occurance(s, n, m) {
        var matches = []
        for (var i = 0; i < s.length; i++) {
            const c = s[i].charCodeAt(0)
            if (c >= n && c <= m) {
                matches.push(c)
            }
        }
        return matches.length / s.length
    }
}

class Kasiski {
    constructor(ct) {
        this.ct = ct
    }

    index(duplicate) {
        const indexes = []
        for (var i = this.ct.indexOf(duplicate); i !== -1; i = this.ct.indexOf(duplicate, i + 1)) {
            indexes.push(i)
        }
        return factors(indexes[1] - indexes[0])
    }

    indexes(duplicates) {
        const indexes = []
        for (const [key, value] of duplicates) {
            indexes.push(this.index(key))
        }
        return indexes
    }

    distances(min, max) {
        const duplicates = [...this.ct.duplicates(min,max).keys()]
        // console.log(duplicates)
        const distances = new Map()
        for (var i = 0; i < duplicates.length; i++) {
            const indexes = this.index(duplicates[i])
            // console.log(indexes)
            for (var j = 0; j < indexes.length; j++) {
                const distance = indexes[j]
                if (!distances.has(distance)) { distances.set(distance, 0) }
                distances.set(distance, distances.get(distance) + 1)
            }
        }
        return [...distances].sort((a, b) => b[1] - a[1])
        // return distances
    }

    frequency(length, az = az26) {
        const frequencies = []

        const rows = chunk(this.ct, length)
        for (var i = 0; i < rows[0].length; i++) {
            const column = []
            for (var j = 0; j < rows.length; j++) {
                column.push(rows[j][i])
            }
            const f = new Frequencies(column.join(""), az)
            // console.log(f)
            // console.log(f.x2())
            frequencies.push(f)
        }

        return frequencies
    }

    key(length, az = az26) {
        return this.frequency(length, az).map(v => v.x2()).join("")
    }
}

class Hilbert {
    static sequence(n) {
        const a = []
        for (var i = 0; i < n; i++) {
            a.push(4 * i + 1)
        }
        return a
    }

    static primes(n) {
        const sequence = Hilbert.sequence(n).slice(1)
        const a = sequence.filter(v => !factors(v).slice(0, -1).some(w => sequence.includes(w)))
        return a
    }

    static curve(t, n) {
        const h = []
        for (var i = 0; i < 256; i++) {
            const hc = HilbertCurve.point(i, n)
            // console.log(hc)
            h.push(t[hc.y][hc.x])
        }
        return h.join("")
    }
}

Number.prototype.mod = function (n) {
    return ((this % n) + n) % n
}

class Gronsfeld {
    static decrypt(ct, k, az = az26) {
        // console.log(pt)
        // console.log(k)
        const pt = []
        for (var i = 0; i < ct.length; i++) {
            const az_i = az.indexOf(ct[i])
            pt.push(az_i === -1 ? ct[i] : az[(az_i - k[i]).mod(az.length)])
        }
        return pt.join("")
    }
}

class Variant {
    static encrypt(pt, kt, az = az26) {
        return Vigenere.decrypt(pt, kt, az)
    }

    static decrypt(pt, kt, az = az26) {
        return Vigenere.encrypt(pt, kt, az)
    }
}

class Trifid {
    // https://en.wikipedia.org/wiki/Trifid_cipher
    constructor(key = 3, az = az26 + " ") {
        this.key = key
        const offset = { 3: 65, 4: 32, 5: 0}
        const length = this.key**this.key
        // const tabula = Array.from({ length }, (_, i) => i + offset[this.key])
        const tabula = az.split("").map(v => v.charCodeAt(0))
        console.log("tabula", tabula)
        this.z = Array(this.key).fill().map(e => Array(this.key).fill().map(e => Array(this.key).fill("").map(e => e)));

        let c = 0
        for (var i = 0; i < this.key; i++) {
            for (var j = 0; j < this.key; j++) {
                for (let k = 0; k < this.key; k++) {
                    const char = String.fromCharCode(tabula[c++])
                    // console.log(i,j,k,char)
                    this.z[i][j][k] = char
                }
            }
        }
        console.log([this.z])
    }

    scan(c, reverse = false) {
        const key = this.key
        for (var i = 0; i < key; i++) {
            for (var j = 0; j < key; j++) {
                for (let k = 0; k < key; k++) {
                    if (this.z[i][j][k] === c) {
                        const s = i.toString() + j.toString() + k.toString()
                        // console.log(c, i, j, k, s)
                        return reverse ? s.split("").reverse().join("") : s
                    }
                }
            }
        }
        console.log("undefined", c)
        return undefined
    }

    encipher(s, size) {
        let encipher = []
        Array.from(s).forEach(c => { encipher.push(this.scan(c)) })
        console.log("encipher", encipher)

        const groupings = Math.floor(s.length / size)
        console.log("groupings", groupings)
        const remainder = s.length % (groupings * size)
        // console.log(groupings, remainder)
        let groups = Array.from(Array(3), _ => Array())
        for (var i = 0; i < encipher.length; i++) {
            groups[0].push(encipher[i].charAt(0))
            groups[1].push(encipher[i].charAt(1))
            groups[2].push(encipher[i].charAt(2))
        }
        console.log("groups", groups)

        let grouped = Array.from(Array(groupings), _ => Array.from(Array(3), _ => ""))
        for (var i = 0; i < groupings; i++) {
            groups[i]
            for (var j = 0; j < size; j++) {
                grouped[i][0] += groups[0][(i * size) + j]
                grouped[i][1] += groups[1][(i * size) + j]
                grouped[i][2] += groups[2][(i * size) + j]
            }
        }
        console.log("grouped", grouped)

        let remainders = Array.from(Array(3), _ => "")
        for (var j = groupings * size; j < s.length; j++) {
            remainders[0] += groups[0][j]
            remainders[1] += groups[1][j]
            remainders[2] += groups[2][j]
        }
        // console.log(remainders)

        return [size, grouped, remainder, remainders]
    }

    encrypt(cipher) {
        console.log("cipher", cipher)

        const size = cipher[0]
        const grouped = cipher[1]
        const remain = cipher[2]
        const remainders = cipher[3]

        let ct = ""
        for (var i = 0; i < grouped.length; i++) {
            const group = grouped[i].join("")
            // console.log(group)
            for (var j = 0; j < size; j++) {
                const a = parseInt(group.charAt((j * 3) + 0))
                const b = parseInt(group.charAt((j * 3) + 1))
                const c = parseInt(group.charAt((j * 3) + 2))
                // console.log(a, b, c)
                ct += this.z[a][b][c]
            }
        }

        const remainder = remainders.join("")
        console.log("remainder", remainder)
        for (var i = 0; i < remain; i++) {
            const a = parseInt(remainder.charAt((i * 3) + 0))
            const b = parseInt(remainder.charAt((i * 3) + 1))
            const c = parseInt(remainder.charAt((i * 3) + 2))
            // console.log(a, b, c)
            ct += this.z[a][b][c]
        }

        return ct
    }

    decrypt(s, size, reverse = false) {
        const groupings = Math.floor(s.length / size)
        const remainder = s.length % (groupings * size)
        console.log("decrypt", groupings, remainder)

        let groups = ""
        for (var i = 0; i < s.length; i++) {
            groups += this.scan(s.charAt(i), false)
        }
        const grouped = groups.match(new RegExp('.{1,' + (3 * size) + '}', 'g'));
        console.log("grouped", grouped)

        let decrypted = ""
        for (var i = 0; i < groupings; i++) {
            const group = grouped[i].match(new RegExp('.{1,' + (size) + '}', 'g'))
            for (var j = 0; j < size; j++) {
                // NOTE Reversed index
                const a = group[reverse ? 2 : 0].charAt(j)
                const b = group[1].charAt(j)
                const c = group[reverse ? 0 : 2].charAt(j)
                decrypted += this.z[a][b][c]
            }
        }

        if (remainder) {
            const group = grouped[i].match(new RegExp('.{1,' + (remainder) + '}', 'g'))
            for (var i = 0; i < remainder; i++) {
                // NOTE Reversed index
                const a = group[reverse ? 2 : 0].charAt(i)
                const b = group[1].charAt(i)
                const c = group[reverse ? 0 : 2].charAt(i)
                decrypted += this.z[a][b][c]
            }
        }

        console.log("decrypted", decrypted)
        return decrypted
    }
}

String.prototype.swap = function(c1, c2) {
    const s = this.split("")
    var i1 = this.indexOf(c1);
    var i2 = this.indexOf(c2);
    s[i1] = c2
    s[i2] = c1

    return s.join("")
}

String.prototype.shift = function(n) {
    return shift(this, n).join("")
}

String.prototype.ngrams = function(n, sliding = true, repeats = false) {
    const ngrams = new Map()
    for (var i = 0; i <= this.length - n; i += sliding ? 1 : n) {
        const ngram = this.slice(i, i + n)
        if (repeats && new Set(ngram).size > 1) { continue }
        if (!ngrams.has(ngram)) { ngrams.set(ngram, 0)}
        ngrams.set(ngram, ngrams.get(ngram) + 1)
    }
    return ngrams
}

String.prototype.reverse = function() {
    return this.split("").reverse().join("")
}

Array.prototype.rotate = function(n) {
    return [...this.slice(-n, this.length), ...this.slice(0, -n)]
}

Array.prototype.shuffle = function() {
    return this.sort(() => Math.random() - .5);
}

Array.prototype.deduplicate = function(a) {
    const deduplicated = []
    this.forEach(v => { if (a.indexOf(v) === -1) { deduplicated.push(v) } })
    return deduplicated
}

String.prototype.isomorph = function(az = az26) {
    const a = Array.from(new Set(this))
    const isomorph = []
    for (var i = 0; i < this.length; i++) {
        const c = this[i]
        isomorph.push(az[a.indexOf(c)])
    }
    return { s: this, set: a, abc: isomorph.join(""), pairs: this.length - a.length }
}

const prune = function(a, m) {
    if (a.length === 1) { return }

    // console.log(a)
    const k1 = a[0]
    const indexes = m.get(k1)
    // console.log(indexes)
    for (var i = 1; i < a.length; i++) {
        const k2 = a[i]
        const indexes2 = m.get(k2)
        // console.log(k1, indexes, k2, indexes2)
        m.set(k2, indexes2.deduplicate(indexes))
    }
    prune(a.slice(1), m)
}

String.prototype.isomorphs = function(min = 5, max = 13, pairs = 2, size = 8, az = az26) {
    const m = new Map()
    for (var i = 0; i < this.length - min; i++) {
        const m2 = []
        for (var j = min; j <= max && i + j < this.length; j++) {
            // console.log(i, j, min, max)
            const isomorph = this.substring(i, i + j).isomorph(az)
            // console.log("i", isomorph)
            const abc = isomorph.abc
            if (isomorph.pairs >= pairs && isomorph.set.length <= size
                    && abc.substring(1).includes("A")
                    && abc.substring(0, abc.length - 1).includes(abc[abc.length - 1])
            ) {
                if (!m.has(isomorph.abc)) { m.set(isomorph.abc, []) }
                m.get(isomorph.abc).push(i)
                m2.push(isomorph.abc)
            }
        }
    }

    return m
}

const factors = n => [...Array(n + 1).keys()].filter(i => n % i === 0)

String.prototype.duplicates = function(min = 3, max = 13) {
    const m = new Map()
    for (var i = 0; i < this.length; i++) {
        if (i > this.length - max) { max = this.length - i}
        for (var j = min; j <= max; j++) {
            // console.log(i, j, min, max)
            const d = this.substring(i, i + j)
            // console.log("i", d)
            if (!m.has(d)) { m.set(d, 0) }
            m.set(d, m.get(d) + 1)
        }
    }

    // Remove duplicates that only occur at a single index
    for (const [key, value] of m) {
        const indexes = m.get(key)
        if (!(indexes > 1)) {
            m.delete(key)
        }
    }

    // Remove shorter duplicates
    const keys = [...m.keys()].sort((a,b) => b.length - a.length)
    // console.log(keys)
    for (var k of keys) {
        const k_substring1 = k.substring(0, k.length - 1)
        const k_substring2 = k.substring(1)
        // console.log(k, k_substring)
        if (m.has(k_substring1)) {
            m.delete(k_substring1)
        }
        if (m.has(k_substring2)) {
            m.delete(k_substring2)
        }
        
    }

    return m
}

Array.prototype.isomorphs = function(min = 5, max = 13, pairs = 2, size = 8, az = az26) {
    const isomorphs = []
    for (var i of this) {
        isomorphs.push(i.isomorphs(min, max, pairs, size, az))
    }

    return isomorphs
}

class Isomorphs {
    static shared(isomorphs) {
        const keys = new Set()
        for (var i of isomorphs) {
            for (var k of i.keys()) {
                keys.add(k)
            }
        }

        const shared = new Set()
        for (var k of [...keys]) {
            for (var i of isomorphs) {
                shared.add(k)
                if (!i.has(k)) { shared.delete(k); break }
            }
        }
        return shared
    }

    static index(isomorphs, strings) {
        const indexes = new Map()

        const shared = Isomorphs.shared(isomorphs)
        // console.log("shared", shared)
        for (const i of shared) {
            // console.log(i)
            indexes.set(i, [])
            for (var j = 0; j < isomorphs.length; j++) {
                isomorphs[j].get(i).forEach(v => indexes.get(i).push( { s:strings[j], i:v, v:strings[j].substring(v, v + i.length), k:i }))
            }
        }

        return indexes
    }

    static prune(isomorphs, min = 1) {
        // Remove isomorphs that only occur at a single index
        for (const [key, value] of isomorphs) {
            const indexes = isomorphs.get(key)
            if (!(indexes.length > min)) {
                isomorphs.delete(key)
            }
        }
        return isomorphs
    }
}

// https://docs.google.com/document/d/12sCi3OrTuy4PPcu3zUykue7suHvAPyK-uFKcm8Rp4Go
class Gaps {
    static sum(counts) {
        // console.log(counts)
        const sums = new Map()
        for (const count of counts) {
            for (const [key, value] of count) {
                // console.log(key)
                if (!sums.has(key)) { sums.set(key, 0) }
                sums.set(key, sums.get(key) + value)
            }
        }
        return [...sums].sort((a,b) => a[0] - b[0])
    }

    // Counts each gap size
    static counts(gaps) {
        const counts = new Map()
        for (const gap of gaps) {
            const key = gap.length
            if (!counts.has(key)) { counts.set(key, 0) }
            counts.set(key, counts.get(key) + 1)
        }
        return counts
    }

    static map(gaps, ends = false) {
        // console.log(gaps)
        const map = new Map()
        gaps.forEach(v => { map.set(v.i, v); if (ends) {
            map.set(v.i + v.length + 1, { i:v.i + v.length + 1, start: v.i, length: v.length, c:v.c })
        } })
        // gaps.forEach(v => { map.set(v.i, v) })
        return map
    }
}

Array.prototype.gaps = function(min = 1, max = 16) {
    const gaps = []
    for (var i = 0; i < this.length; i++) {
        for (var j = min + 1; j <= max + 1; j++) {
            if (this[i] && this[i] == this[i+j]) {
                // console.log(i, j, e1[i], e1[i+j])
                gaps.push({ i:i, length:j-1, c:this[i] })
                break
            }
        }
    }
    // console.log(gaps)
    return gaps
}

String.prototype.gaps = function(min = 1, max = 16) {
    return this.split("").gaps(min, max)
}

String.prototype.ascii = function(shift) {
    return this.split("").map(v => String.fromCharCode(v.charCodeAt(0) + shift))
}

Array.prototype.longest = function() {
    return this.reduce((a,b) => a.length > b.length ? a : b)
}

class Chi {
    static get expected() {
        // return [0.08167,0.01492,0.02782,0.04253,0.12702,0.02228,0.02015,0.06094,0.06966,0.00153,0.00772,
        //     0.04025,0.02406,0.06749,0.07507,0.01929,0.00095,0.05987,0.06327,0.09056,0.02758,0.00978,
        //     0.02360,0.00150,0.01974,0.00074];
        return [0.0815,0.0144,0.0276,0.0379,0.1311,0.0292,0.0199,0.0526,0.0635,0.0013,0.0042,
            0.0339,0.0254,0.0710,0.08,0.0198,0.0012,0.0683,0.061,0.1047,0.0246,0.0092,
            0.0154,0.0017,0.0198,0.0008];
        // return Array.from({ length: 83 }, (_, i) => 1/83)
    }

    static fit(counts) {
        const totcount = counts.reduce((a,b) => a + b) 
        var sum1 = 0.0;
        for(var i=0; i<counts.length; i++) {
            sum1 = sum1 + Math.pow((counts[i] - totcount * Chi.expected[i]),2)/(totcount * Chi.expected[i]);
        }
        return sum1
    }

    static squared(s, az = az26) {
        
        const offsets = []
        offsets[26] = 97
        offsets[83] = 32
        const offset = offsets[az.length]
        // console.log(offset)

        const plaintext = s.toLowerCase().replace(/[^a-z]/g, ""); 
        const counts = new Array(az.length);
        
        var totcount=0;
        for(var i=0; i<az.length; i++) { counts[i] = 0 }
        for(var i=0; i<plaintext.length; i++){
            // counts[plaintext.charCodeAt(i) - 97]++;
            counts[plaintext.charCodeAt(i) - offset]++;
            totcount++;
        }
        var sum1 = 0.0;
        for(var i=0; i<az.length; i++) {
            sum1 = sum1 + Math.pow((counts[i] - totcount * Chi.expected[i]),2)/(totcount * Chi.expected[i]);
        }
        var sum2 = 0.0;
        for(var i=0; i<az.length; i++) {
            sum2 = sum2 + Math.pow((counts[i] - totcount/az.length),2)/(totcount/az.length);
        }

        // console.log(counts)

        const c = { english: sum1, uniform: sum2 }
        return c
    }

    static uniform(s, az = az26) {
        const counts = new Array(az.length);
        const plaintext = s
        var totcount=0;

        const offsets = []
        offsets[26] = 97
        offsets[83] = 32
        const offset = offsets[az.length]

        for(var i=0; i<az.length; i++) { counts[i] = 0 }
        for(var i=0; i<plaintext.length; i++){
            counts[plaintext.charCodeAt(i) - offset]++;
            totcount++;
        }
        var sum2 = 0.0;
        for(var i=0; i<az.length; i++) {
            sum2 = sum2 + Math.pow((counts[i] - totcount/az.length),2)/(totcount/az.length);
        }

        // console.log(counts)

        return sum2
    }

    static key(ct, length, az = az26) {
        const key = []
        for (var i = 0; i < length; i++) {
            const ct_nth = ct.substring(i).nth(length)
            // const ct5 = ct8.substring(1).nth(5)
            const squares = []
            for (var c of az) {
                squares.push({ c:c, squared:Chi.squared(Vigenere.decrypt(ct_nth, c, az)).english })
            }
            const sorted = squares.sort((a,b) => a.squared - b.squared || isNaN(a.squared)-isNaN(b.squared))
            // console.log(sorted)
            key.push(sorted[0].c)
        }
        return key.join("")
    }
}

String.prototype.nth = function(n) {
    return [...this].filter((_, i) => (i) % n === 0).join('');
}

Array.prototype.avg = function() {
    return this.reduce((a, b) => a + b) / this.length
};

String.prototype.ic = function(min, max, az = az26) {
    const ic_avg = []
    for (var i = min; i <= max; i++) {
        const ic = []
        for (var j = 0; j < i; j++) {
            // ic.push(new Frequencies(this.substring(j).nth(i), az).ic_mono())
            ic.push(new Frequencies(this.substring(j).nth(i), az).ic())
        }
        ic_avg.push({ length:i, avg: ic.avg() })
    }
    return ic_avg
}
