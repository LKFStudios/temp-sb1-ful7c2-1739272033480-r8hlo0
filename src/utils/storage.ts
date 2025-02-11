import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { analytics } from '../services/analytics';

export async function uploadAnalysisImage(imageData: string): Promise<string> {
  try {
    // First ensure we have an anonymous session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('Creating anonymous session...');
      // Generate random credentials
      const tempEmail = `${uuidv4()}@temp.bijumax.com`;
      const tempPassword = uuidv4();
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          data: {
            type: 'anonymous'
          }
        }
      });
      
      if (signUpError || !data.session) {
        console.error('Anonymous auth failed:', signUpError);
        throw new Error('一時的なセッションの作成に失敗しました');
      }
    }

    // Validate image data
    const matches = imageData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('画像データの形式が不正です');
    }

    const [, mimeType, base64Data] = matches;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      throw new Error('対応していない画像形式です');
    }

    // Generate unique filename
    const extension = mimeType.split('/')[1];
    const fileName = `${uuidv4()}.${extension}`;
    const filePath = `public/${fileName}`;

    // Convert base64 to Blob with chunking for large files
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    const chunkSize = 1024;
    
    for (let offset = 0; offset < byteCharacters.length; offset += chunkSize) {
      const slice = byteCharacters.slice(offset, offset + chunkSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: mimeType });

    // Check file size
    if (blob.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('画像サイズが大きすぎます（上限: 10MB）');
    }

    // Upload with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`Upload attempt ${retryCount + 1}/${maxRetries}`);
        
        const { data, error: uploadError } = await supabase.storage
          .from('analyses')
          .upload(filePath, blob, {
            contentType: mimeType,
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Upload failed:', uploadError);
          
          if (uploadError.statusCode === '403' || uploadError.statusCode === 401) {
            throw new Error('ストレージへのアクセス権限がありません');
          }
          
          throw uploadError;
        }

        if (!data?.path) {
          throw new Error('アップロードパスの取得に失敗しました');
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('analyses')
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          throw new Error('公開URLの取得に失敗しました');
        }

        analytics.track('Image Upload Success', {
          mimeType,
          size: blob.size,
          retryCount
        });

        return urlData.publicUrl;

      } catch (error) {
        console.error(`Upload attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        
        if (retryCount === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, retryCount) * 1000)
        );
      }
    }

    throw new Error('アップロードの最大試行回数を超えました');
  } catch (error) {
    console.error('Storage error:', error);
    analytics.trackError(error instanceof Error ? error : new Error('Storage operation failed'));
    throw new Error('画像のアップロードに失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
  }
}

export function isFirstVisit(): boolean {
  const visited = localStorage.getItem('hasVisitedBefore');
  if (!visited) {
    localStorage.setItem('hasVisitedBefore', 'true');
    return true;
  }
  return false;
}