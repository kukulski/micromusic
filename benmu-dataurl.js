// [255, 0] -> "%FF%00"
function b(values) {
    var out = "";
    for (var i = 0; i < values.length; i++) {
        var hex = values[i].toString(16);
        if (hex.length == 1) hex = "0" + hex;
        out += "%" + hex;
    }
    return out.toUpperCase();
}


//  Modified from:
  // https://github.com/kanaka/noVNC/blob/master/include/base64.js
  var _pad = '=';
  var _to_base_64_table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var _chr_table = _to_base_64_table.split('');

/* string index is same speed as array lookup e.g: myString[charIndex]
 * 7% speed boost on chrome by using increment
*/
  function toBase64(data, offset, length) {
    "use strict";
    var result = '', i, effi;
    length = length || data.length;
    offset = offset || 0;
    // Convert every three bytes to 4 ascii characters.
    for (i = 0; i < (length - 2); i += 3) {
      effi = offset + i;
      result += _chr_table[data[effi] >> 2];
      result += _chr_table[((data[effi++] & 0x03) << 4) + (data[effi] >> 4)];
      result += _chr_table[((data[effi++] & 0x0f) << 2) + (data[effi] >> 6)];
      result += _chr_table[data[effi] & 0x3f];
    }

    // Convert the remaining 1 or 2 bytes, pad out to 4 characters.
    if (length % 3) {
      i = length - (length % 3);
      effi = offset + i;
      result += _chr_table[data[effi] >> 2];
      if ((length % 3) === 2) {
        result += _chr_table[((data[effi++] & 0x03) << 4) + (data[effi] >> 4)];
        result += _chr_table[(data[effi] & 0x0f) << 2];
        result += _pad;
      } else {
        result += _chr_table[(data[effi] & 0x03) << 4];
        result += _pad + _pad;
      }
    }

    return result;
  }





function makeDataUrl(mimeType, byteArray) {
    return "data:" + mimeType + ";base64," + toBase64(byteArray);
//    return "data:" + mimeType + "," + b(byteArray);
}