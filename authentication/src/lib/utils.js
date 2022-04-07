import crypto from "crypto";

class Utils {
  static sha1(data, digest = 'base64') {
    const hash = crypto.createHash("sha1");
    hash.update(data);
    return hash.digest(digest)
  }
}


export {Utils};