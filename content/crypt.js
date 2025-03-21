/* https://gist.github.com/enepomnyaschih/72c423f727d395eeaa09697058238727 */

const base64abc = [
	"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
	"N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
	"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
	"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
	"0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"
];

const base64codes = [
	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 62, 255, 255, 255, 63,
	52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255, 255,
	255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
	15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255,
	255, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
	41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
];

function getBase64Code(charCode) {
	if (charCode >= base64codes.length) {
		throw new Error("Unable to parse base64 string.");
	}
	const code = base64codes[charCode];
	if (code === 255) {
		throw new Error("Unable to parse base64 string.");
	}
	return code;
}

function bytesToBase64(bytes) {
	let result = '', i, l = bytes.length;
	for (i = 2; i < l; i += 3) {
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i] >> 6)];
		result += base64abc[bytes[i] & 0x3F];
	}
	if (i === l + 1) { // 1 octet yet to write
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[(bytes[i - 2] & 0x03) << 4];
		result += "==";
	}
	if (i === l) { // 2 octets yet to write
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += base64abc[(bytes[i - 1] & 0x0F) << 2];
		result += "=";
	}
	return result;
}

function base64ToBytes(str) {
	if (str.length % 4 !== 0) {
		throw new Error("Unable to parse base64 string.");
	}
	const index = str.indexOf("=");
	if (index !== -1 && index < str.length - 2) {
		throw new Error("Unable to parse base64 string.");
	}
	let missingOctets = str.endsWith("==") ? 2 : str.endsWith("=") ? 1 : 0,
		n = str.length,
		result = new Uint8Array(3 * (n / 4)),
		buffer;
	for (let i = 0, j = 0; i < n; i += 4, j += 3) {
		buffer =
			getBase64Code(str.charCodeAt(i)) << 18 |
			getBase64Code(str.charCodeAt(i + 1)) << 12 |
			getBase64Code(str.charCodeAt(i + 2)) << 6 |
			getBase64Code(str.charCodeAt(i + 3));
		result[j] = buffer >> 16;
		result[j + 1] = (buffer >> 8) & 0xFF;
		result[j + 2] = buffer & 0xFF;
	}
	return result.subarray(0, result.length - missingOctets);
}

function base64encode(str, encoder = new TextEncoder()) {
	return bytesToBase64(encoder.encode(str));
}

function base64decode(str, decoder = new TextDecoder()) {
	return decoder.decode(base64ToBytes(str));
}

/* end */

async function decrypt(cipher) {
    cipher = base64ToBytes(cipher);
    let cipherText = base64ToBytes(kkCipherText), newCipher = new Uint8Array(32);

    for(let i = 0, j = 0; j < 32; i++, j++) {
        if(i >= cipher.length) i = 0;
        newCipher[j] = cipher[i];
    }

    cipher = await crypto.subtle.importKey(
        "raw",
        newCipher,
        {
            name: "AES-CBC",
        },
        false,
        ["decrypt"]
    );

    const text = new TextDecoder().decode(await crypto.subtle.decrypt(
        {
            name: "AES-CBC",
            iv: new TextEncoder().encode("KlasterKKlasterK"),
        },
        cipher,
        cipherText
    ));

    if(confirm()) document.body.innerHTML = text;
}

async function encrypt(text) {
    const cipherLength = Math.ceil(Math.random() * 31);

    let cipher = new Uint8Array(32);
    for(let i = 0; i < cipherLength; i++)
        cipher[i] = Math.floor(Math.random() * 256);

    const rawCipher = await crypto.subtle.importKey(
        "raw",
        cipher,
        {
            name: "AES-CBC",
        },
        false,
        ["encrypt"]
    );

    text = bytesToBase64(new Uint8Array(await crypto.subtle.encrypt(
        {
            name: "AES-CBC",
            iv: new TextEncoder().encode("KlasterKKlasterK"),
        },
        rawCipher,
        new TextEncoder().encode(text)
    )));

    return bytesToBase64(cipher.slice(0, cipherLength)) + " " + text;
}

if(location.search.search("encrypt-----") > 0) {
    document.querySelector("main article").innerHTML = '<textarea id="text-field" style="display: block; margin-bottom: 1em;"></textarea><button id="text-submit">Готово</button>';
    document.getElementById("text-submit").addEventListener("click", async () => {
        const cipherText = await encrypt(document.getElementById("text-field").value);
        await navigator.clipboard.writeText(cipherText);
        document.getElementById("text-field").value = cipherText;
        alert("Text in a text field encrypted. Check your clipboard or the text field.");
    });
} else if(typeof kkCipherText !== "string") {
    document.querySelector("main article").innerHTML = '<h1>Ошибка шифрованной страницы</h1><p>На этой странице подключён скрипт дешифратора, но самого шифрованного текста нет.</p>';
} else if(location.hash) {
    decrypt(location.hash.slice(1));
} else {
    document.querySelector("main article").innerHTML = '<h1>Шифрованная страница</h1><p>Эта страница зашифрована. Введите шифр. ' +
                                                       'Если шифр правильный, страница отобразится правильно. Иначе — получится белиберда.</p>' +
                                                       '<input id="cipher-field" style="display: block;"><button id="cipher-submit" style="display: block;">Готово</button>';
    document.getElementById("cipher-submit").addEventListener("click", async () => await decrypt(document.getElementById("cipher-field").value));
}