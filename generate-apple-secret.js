const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');

// 設定値を入力
const config = {
  teamId: 'YOUR_TEAM_ID',           // Apple Developer TeamのID
  serviceId: 'YOUR_SERVICE_ID',     // 作成したService ID
  keyId: 'YOUR_KEY_ID',             // 作成したAuthKeyのKey ID
  keyPath: './AuthKey_XXXXX.p8'     // ダウンロードした.p8ファイルのパス
};

try {
  // 秘密鍵を読み込み
  const privateKey = fs.readFileSync(path.join(__dirname, config.keyPath));

  // JWTトークンを生成
  const token = jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '180d',
    audience: 'https://appleid.apple.com',
    issuer: config.teamId,
    subject: config.serviceId,
    keyid: config.keyId
  });

  console.log('Generated client secret:');
  console.log(token);
} catch (error) {
  console.error('Error generating client secret:', error);
}