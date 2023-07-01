
function flip(c) {
    const a = new Map()
    a.set("4", "0") // 42
    a.set("3", "1")
    a.set("1", "3")
    a.set("0", "4")
    if (a.has(c)) {
        return a.get(c)
    }
    return c
}

function eye(i, positions = [0,1,2,3,4]) {
    // if (i === '') { return '0' }
    if (i === '') { return '' }
    // const positions = [1,2,0,3,4] // 87
    // const positions = [4,3,2,1,0] // 83 Shifted 42
    // const positions = [2,3,4,1,0] // 83
    // const positions = [0,1,2,3,4]
    // const positions = [2,1,0,3,4] // 89/83
    // [1,2,0,3,4] // 85[1]/90
    // NOTE When 83 is flipped it shifts char codes by 42
    // return flip(positions[i].toString())
    return positions[i].toString()
}

function parse(e1, e2, p = [0,1,2,3,4]) {
    let eyes = []
    for (var i = 0; i < e1.length; i+=3) {
        // 83
        const g1 = eye(e1.charAt(i + 0), p) + eye(e2.charAt(i + 0), p) + eye(e1.charAt(i + 1), p)
        const g2 = eye(e2.charAt(i + 1), p) + eye(e1.charAt(i + 2), p) + eye(e2.charAt(i + 2), p)

        // const g1 = eye(e1.charAt(i + 0)) + eye(e2.charAt(i + 0)) + eye(e1.charAt(i + 1))
        // const g2 = eye(e2.charAt(i + 0)) + eye(e1.charAt(i + 1)) + eye(e2.charAt(i + 1))
        // 85
        // const g1 = eye(e1.charAt(i + 0), p) + eye(e1.charAt(i + 1), p) + eye(e1.charAt(i + 2), p)
        // const g2 = eye(e2.charAt(i + 0), p) + eye(e2.charAt(i + 1), p) + eye(e2.charAt(i + 2), p)
        // 85
        // const g1 = eye(e2.charAt(i + 0), p) + eye(e2.charAt(i + 1), p) + eye(e2.charAt(i + 2), p)
        // const g2 = eye(e1.charAt(i + 0), p) + eye(e1.charAt(i + 1), p) + eye(e1.charAt(i + 2), p)
        // 99
        // const g1 = eye(e1.charAt(i + 0)) + eye(e2.charAt(i + 1)) + eye(e1.charAt(i + 2))
        // const g2 = eye(e2.charAt(i + 0)) + eye(e1.charAt(i + 1)) + eye(e2.charAt(i + 2))

        const i1 = g1.charAt(0), i2 = g1.charAt(1), i3 = g1.charAt(2)
        eyes.push(i1 + i2 + i3)
        if (g2 === '') { break; }

        const j1 = g2.charAt(0), j2 = g2.charAt(1), j3 = g2.charAt(2)
        eyes.push(j1 + j2 + j3)
    }

    return eyes
}


function encode(eyes) {
    // console.log(eyes)
    let encodings = []

    let permutations = [[0,1,2], [0,2,1], [1,0,2], [1,2,0], [2,0,1], [2,1,0]]
    for (var p = 0; p < permutations.length; p++) {
        encodings[p] = []
        for (var i = 0; i < eyes.length; i++) {
            const i1 = eyes[i].charAt(permutations[p][0])
            const i2 = eyes[i].charAt(permutations[p][1])
            const i3 = eyes[i].charAt(permutations[p][2])

            encodings[p].push(parseInt(i1 + i2 + i3, 5) + 0) // Decimal
        }
    }
    console.log("encodings", encodings)
    return encodings
}

function rotate(encodings) {
    const rotations = []
    for (var i = 0; i < encodings.length; i++) {
        for (var j = 0; j < encodings.length; j++) {
            rotations.push([i,j])
        }
    }
    console.log("rotations", rotations)

    const ordered = []
    for (var r = 0; r < rotations.length; r++) {
        ordered[r] = []
        for (var i = 0; i < encodings[0].length; i++) {
            ordered[r].push(encodings[rotations[r][i % rotations[0].length]][i])
        }
    }
    // console.log(ordered)
    // return encoded.join("")
    return ordered
}

function ascii(encodings) {
    const chars = []
    for (var i = 0; i < encodings.length; i++) {
        chars[i] = []
        for (var j = 0; j < encodings[i].length; j++) {
            // chars[i].push(encodings[i][j])
            chars[i].push(String.fromCharCode(encodings[i][j]))
            // chars[i].push(String.fromCharCode(((encodings[i][j]) % 83) + 32))
        }
    }
    // console.log(chars)
    return chars
}

const m = [
    ['20101322330404113023211431303300402400031022104400020010404014414203302203424101400321211413004111010024124100403100113331220330103113111211210322314',
    '0320412200014222421222201100032013411132313131300311321201422313314413414412110403314323411221010100401204124424424021310424224130304110203123204313'],
    
    ['31101322330404113023211431303300402400402020104400010404404014414203302203413121222330324400024323111022123103102204302414221422203024200123212402323201403',
    '0320412200014222421222201100032013411011112131300011020201422313314413414414014034314012221113402103014133412213301323101322112130203222200422310313224113'],
    
    ['121013223304041130232114313033004024004302013230044210143001214140311024104223014113030144102020311114241034232132112001132210042231043242013103010200300221034201043101100200124',
    '132041220001422242122220110003201341132102441113222231403330130231010322441422141120120040103022122402040000103221040020142240312031330231000103310441201422131402022020141322311'],
    
    ['301014304231111130103200114211142042144110120210044012022014100202130013243312143110223024224201021223142200103111223122201000012143101233312010224203221',
    '132041002441200222141013240022220120402401130112010322313431422313213031100003203401230041222213132220230242140211440011010101321231103032030241320322030'],
    
    ['22101430400010030222023122223214414421131322331212013400414130231000123104313014021422202304200121424121122310401003400124024102023204304303122413131230114200103012422122403300321102421313323100104124012304',
    '3320410022224313410032420000102200424310200201400020212123111000031122201100320030210313002122103100003123320032404222323111302110210202223414121132403212304102101033004320314121114223304034000410423010104'],
    
    ['111014304044023101033232120113240032023033031134224144111303003142234042131112103133214200230011143034143033110122120120120123130011024014133021023002220044120224022234203033120244040200',
    '432041002342120301441212222401420211130431413200210141202112431230203111430021101132211120442310131321231020311022200210312220001440122003232142141332131220002121100141102242103402411442'],
    
    ['10101430400010000001021323312014213300310100422321003430014421422402220030002214323430012024223011030130200104003013021222214313030201310211310223000310323212202423010131123221303',
    '2320410022224312124304303001102034211303034110223132024033020302224411420101410123324013413413024413014124122223033224323314110324032001221031124314401202313421210220100323034034'],
    
    ['301014304000100000010213233120140040002211310214001032122241124300100131223313040210240103202210243021012103012033232204233241203302023301041204241012232101224314114042121114140130',
    '232041002222431212430430300110222113142030221230132301430413420300032332421140402211103132412102142440311122021431141311140311421232122410240132440030221440020231000031000102140011'],
    
    ['111014304000100000010213233120143044133101214223302024014144212222230212213233014110114103111010240110204010013100130102041041221134130133013243011042010221131224220222041',
    '332041002222431212430430300110211112430303411022401202041302002242420240341202211211130110441211112403410122040041213020203002240010120442311042111142031102232442101331431']
]

const abc83 = [...Array(125)].map((v, i) => String.fromCharCode(i + 32)).join('')
const abc25 = "ABCDEFGHIKLMNOPQRSTUVWXYZ"
const abc26 = "abcdefghijklmnopqrstuvwxyz"
const abc30 = [...Array(30)].map((v, i) => String.fromCharCode(i + 95)).join('')
const abc36 = "0123456789abcdefghijklmnopqrstuvwxyz"
console.log("abc83", abc83)

function decode(pattern = 10, positions = [0,1,2,3,4], alphabet = abc83, debug = false) {
    console.log("decode", pattern, positions, alphabet)
    const e1 = ascii(rotate(encode(parse(m[0][0],m[0][1],positions))))
    const w1 = ascii(rotate(encode(parse(m[1][0],m[1][1],positions))))
    const e2 = ascii(rotate(encode(parse(m[2][0],m[2][1],positions))))
    const w2 = ascii(rotate(encode(parse(m[3][0],m[3][1],positions))))
    const e3 = ascii(rotate(encode(parse(m[4][0],m[4][1],positions))))
    const w3 = ascii(rotate(encode(parse(m[5][0],m[5][1],positions))))
    const e4 = ascii(rotate(encode(parse(m[6][0],m[6][1],positions))))
    const w4 = ascii(rotate(encode(parse(m[7][0],m[7][1],positions))))
    const e5 = ascii(rotate(encode(parse(m[8][0],m[8][1],positions))))
    
    const t = [e1,w1,e2,w2,e3,w3,e4,w4,e5]
    
    const t2 = []
    
    for (var i = 0; i < t.length; i++) {
        t2[i] = []
    
        for (var j = 0; j < t[i].length; j++) {
            t2[i].push(t[i][j])
        }
    }
    // console.log(t2)
    
    const stats = []
    for (var i = 0; i < t2.length; i++) {
        for (var j = 0; j < t2[i].length; j++) {
            if (stats[j] === undefined) { stats[j] = [] }
            stats[j].push(t2[i][j])
        }
    }
    
    console.log("stats", stats)
    for (var i = 0; i < stats.length; i++) {
        const s = new Set()
        for (var j = 0; j < stats[i].length; j++) {
            stats[i][j].forEach(k => { s.add(k) })
        }
        const s2 = [...s]
        const min = Math.min(...s2.map(c => c.charCodeAt(0)))
        const max = Math.max(...s2.map(c => c.charCodeAt(0)))
        const unused = (max - min + 1) - s2.length
        // console.log(i)
        const total = max - min + 1
        console.log(i, s2.length, min, max, total, unused)
        const o = [...s].map(v => v.charCodeAt(0)).sort((a, b) =>  a - b)
        console.log("o", o)
        const o1 = []
        for (var j = 0; j < o.length; j++) {
            const d = o[j+1] - o[j]
            if (d > 1) { o1.push([o[j],d]); }
        }
        console.log(o1)
    }

    const decoded = []
    for (var i = 0; i < stats[pattern].length; i++) {
        const order  = [0,1,2,3,4,5,6,7,8]

        const p = stats[pattern][order[i]]
        console.log(p)
        
        if (debug) {
            console.log(p.map(v => v.charCodeAt(0).toString(5).padStart(3,'0'))) // Base5
            console.log(p.map(v => v.charCodeAt(0).toString(2).padStart(7,'0'))) // Base2
            // console.log(p.map(v => v.charCodeAt(0)).join(" ")) // Decimal
            console.log(chunk(p.map(v => base([v.charCodeAt(0)], 83, 26)), 26))
            console.log(p.map(v => v.charCodeAt(0)).join(" ")) // Decimal
            // const ascii = p.map(v => abc[v.charCodeAt(0)]).join("") // Ascii
            // const ascii = p.map(v => alphabet[v.charCodeAt(0)]).join("").match(/.{1,26}/g) // Ascii
            
            // const ascii = p.map(v => v).join("") // Ascii 42
            console.log(ascii)
            // console.log(ascii.map(v => v.split("").map(w => w.charCodeAt(0) - 32)))

            console.log(p.map(v => abc25[v.charCodeAt(0) % 25]).join(""))
            console.log(p.map(v => abc26[v.charCodeAt(0) % 26]).join(""))
            // console.log(p.map(v => abc30[v.charCodeAt(0) % 30]).join(""))

            const m = ["","","","",""]
            p.forEach(v => {
                const u = base([v.charCodeAt(0)], 83, 26)
                m[u[0]] = m[u[0]] + abc26[u[1]]
            })
            console.log(m)

            const s = new Set()
            p.forEach(v => s.add(v.charCodeAt(0)))
            console.log([...s].sort((a, b) =>  a - b))

            console.log(p.map(v => v.charCodeAt(0)).reduce((a,c) => a + c) / p.length)
        }

        const ascii = p.map(v => alphabet[v.charCodeAt(0)]).join("") // Ascii
        decoded.push(ascii)
    }

    return decoded
}

const pt = []
pt.push("1) STARTBYTHINKINGSOMETHINGWHETHERYOUREALLYWANTTOGODOWNFORGODKNOWSTHESEARCHFORKNOWLEDGE[]ISPOWERFORTECHNOLOGY")
pt.push("2) STARTBYTHINKINGSOMETHING IFYOU`RE VISITINGTHISPATHAND,YOU`RELIKELYSEARCHFORKNOWLEDGE A RANDOM NEEDLEINHAYSTACK")
pt.push("3) STARTBYTHINKINGSOMETHING IFSOMETIMES A RANDOMWORD JUST ISN'T ENOUGH, AND!@#$%^&*()THATISWHERE THE MEDITATIONCUBE COMES INTO PLAY AFTER ALL.")
pt.push("4) THEIR ARE MANYPRODUCING RANDOMSENTENCESCANBEHELPFUL IN A NUMBEROFDIFFERENT WAYS. ZOOXYLOPHONE")
pt.push("5) THEN ONE FOR WRITERS,ARANDOM SENTENCE CAN HELP THEM GET THEIR CREATIVEJUICESFLOWING!EXTRA,NEXT NOITA")
pt.push("6) THOSE WHO ARE MANY THEREAREANUMBEROFDIFFERENTWAYS A WRITER: CANUSE AN UNUSUALSENTENCEFORINSPIRATION.")
pt.push("7) THEN GO PRAYING ARETHOSEWRITERSMUCH MORECANDIFFICULTCHALLENGEISTOUSE ITTOENDASTORY QUIXOTIC ZEEBRA ZINCOXIDECRYPTOGRAPHY")
pt.push("8) THEN GO PRAYING FORGODSONLYTHOSEWRITERSWHOHAVEWRITERS \"<*>\" BLOCK,THISCANBE AN EXCELLENT WAY TOTAKE AMASTERTOCRUMBLING THOSE WALLS.")
pt.push("9) THEN GO PRAYING NOWTHOSEWRITERS ARE MORECANALSOSPURACHALLENGEINTHEOTHERTYPES;OFPROJECTSBEINGDONE!JAZZY$MASTERA WALLS")
console.log(pt.join("\n"))
// const pt = []
// pt.push("A. STARTBYTHINKINGSOMETHINGWHETHERYOUREALLYWANTTOGODOWNFORGODKNOWSTHEBYTHINKINGOFKNOWLEDGE[]ISPOWERFORTECHNOLOGY")
// pt.push("B. STARTBYTHINKINGSOMETHING IFYOU`RE VISITINGTHISPATHAND,YOU`RELIKELYBYTHINKINGOFKNOWLEDGE A RANDOM NEEDLEINHAYSTACK")
// pt.push("C. STARTBYTHINKINGSOMETHING IFSOMETIMES A RANDOMWORD JUST ISN'T ENOUGH, AND!@#$%^&*()THATISWHERE THE MEDITATIONCUBE COMES INTO PLAY AFTER ALL.")
// pt.push("D. THEIR ARE MANYPRODUCING RANDOMSENTENCESCANBEHELPFUL IN A NUMBEROFDIFFERENT WAYS. ZOOXYLOPHONE")
// pt.push("E. THEN ONE FOR WRITERS,ARANDOM SENTENCE CAN HELP THEM GET THEIR CREATIVEJUICESFLOWING!EXTRA,NEXT NOITA")
// pt.push("F. THOSE WHO ARE MANY THEREAREANUMBEROFDIFFERENTWAYS A WRITER: CANUSE AN UNUSUALSENTENCEFORINSPIRATION.")
// pt.push("G. THEN GO PRAYING ARETHOSEWRITERSMUCH MORECANDIFFICULTCHALLENGEISTOUSE ITTOENDASTORY QUIXOTIC ZEEBRA ZINCOXIDECRYPTOGRAPHY")
// pt.push("H. THEN GO PRAYING FORGODSONLYTHOSEWRITERSWHOHAVEWRITERS \"<*>\" BLOCK,THISCANBE AN EXCELLENT WAY TOTAKE AMASTERTOCRUMBLING THOSE WALLS.")
// pt.push("I. THEN GO PRAYING NOWTHOSEWRITERS ARE MORECANALSOSPURACHALLENGEINTHEOTHERTYPES;OFPROJECTSBEINGDONE!JAZZY$MASTERA WALLS")
