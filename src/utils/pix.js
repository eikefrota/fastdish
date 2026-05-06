function tag(id, value) {
  const text = String(value);
  const len = text.length.toString().padStart(2, "0");
  return `${id}${len}${text}`;
}

export function crc16(str) {
  let crc = 0xffff;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if ((crc & 0x8000) !== 0) crc = ((crc << 1) ^ 0x1021) & 0xffff;
      else crc = (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixPayload({
  key,
  amount,
  merchantName = "FastDish",
  merchantCity = "FORTALEZA",
  txid = "*",
} = {}) {
  if (!key) throw new Error("Chave Pix obrigatoria");

  const amountStr = amount ? String(Number(amount).toFixed(2)) : undefined;
  let payload = "";
  payload += tag("00", "01");
  payload += tag("01", "12");

  let merchantAccountInfo = "";
  merchantAccountInfo += tag("00", "BR.GOV.BCB.PIX");
  merchantAccountInfo += tag("01", key);
  payload += tag("26", merchantAccountInfo);

  payload += tag("52", "0000");
  payload += tag("53", "986");
  if (amountStr) payload += tag("54", amountStr);
  payload += tag("58", "BR");
  payload += tag("59", merchantName.substring(0, 25));
  payload += tag("60", merchantCity.substring(0, 15));
  payload += tag("62", tag("05", txid.substring(0, 25)));

  return payload + tag("63", crc16(payload + "6304"));
}

export function buildPixQrUrlFromPayload(payload) {
  const encoded = encodeURIComponent(payload);
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=300x300`;
}
