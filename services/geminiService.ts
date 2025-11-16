import { GoogleGenAI, Modality, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export interface IdentifiedItem {
  category: string;
  brand?: string;
  productName?: string;
  price?: string;
}

export const generateCollage = async (
  description: string, 
  items: string[], 
  referenceImages: string[]
): Promise<{ image: string, items: IdentifiedItem[] }> => {
  const imageModel = 'gemini-2.5-flash-image';
  
  const parts: any[] = [];
  let prompt: string;

  const itemsText = items.length > 0 
    ? `以下のカテゴリの要素を美しくコラージュして配置してください: ${items.join('、')}。` 
    : "";

  if (referenceImages.length > 0) {
    // Add all reference images to parts
    referenceImages.forEach((img) => {
        const mimeType = img.substring(5, img.indexOf(';'));
        const base64Data = img.split(',')[1];
        parts.push({
            inlineData: {
                mimeType,
                data: base64Data,
            },
        });
    });

    prompt = `
      A4横向きサイズのインテリア提案資料を作成してください。
      背景は完全に白地の資料です。
      
      【指定アイテムカテゴリ】
      ${itemsText}

      【参考画像】
      添付された画像を参考に、部屋のトーンや家具の配置を決定してください。

      全体のスタイルは「${description}」でお願いします。
      個々のアイテムが切り抜かれて、白い背景にきれいに配置されているコラージュ画像を生成してください。
      余計な文字やロゴは入れないでください。
    `;
  } else {
    prompt = `
      A4横向きサイズのインテリア提案資料を作成してください。
      背景は完全に白地の資料です。
      
      【指定アイテムカテゴリ】
      ${itemsText}
      
      基本スタイル: カッシーナ(Cassina)の家具を基調とした「${description}」な空間。
      
      個々のアイテムが切り抜かれて、白い背景にきれいに配置されているコラージュ画像を生成してください。
      余計な文字やロゴは入れないでください。
    `;
  }

  parts.push({ text: prompt });

  let generatedImage: string;
  let base64ImageBytes: string;
  let mimeType: string;

  // Step 1: Generate Image
  try {
    const response = await ai.models.generateContent({
      model: imageModel,
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    // Find the image part in the response
    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (imagePart && imagePart.inlineData) {
      base64ImageBytes = imagePart.inlineData.data;
      mimeType = imagePart.inlineData.mimeType;
      generatedImage = `data:${mimeType};base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image data received from the API.");
    }
  } catch (error) {
    console.error("Error generating collage:", error);
    throw error;
  }

  // Step 2: Analyze Image to identify items
  try {
    const analysisModel = 'gemini-2.5-flash';
    const analysisResponse = await ai.models.generateContent({
        model: analysisModel,
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64ImageBytes
                    }
                },
                {
                    text: `
                      この生成されたインテリア画像に含まれる主要な家具や装飾品をリストアップしてください。
                      
                      【分析要件】
                      1. **カテゴリ**: アイテムの一般的な名称（例：3人掛けソファ、フロアランプ、ガラステーブル）。
                      2. **ブランド・商品名**: 画像の特徴から、特定の有名ブランド（特にCassinaなど）や商品モデルが明確に推定できる場合のみ記述してください。不明確な場合は空欄（null）にしてください。
                      3. **概算価格**: そのアイテムの市場での概算価格（日本円）を推定してください（例：「約1,200,000円」）。不明な場合は空欄（null）にしてください。
                      4. 不確かな情報は含めないでください。

                      結果はJSON配列で返してください。
                    `
                }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING, description: "アイテムのカテゴリ名" },
                        brand: { type: Type.STRING, description: "ブランド名（識別可能な場合のみ）" },
                        productName: { type: Type.STRING, description: "商品名（識別可能な場合のみ）" },
                        price: { type: Type.STRING, description: "概算価格（円）" }
                    },
                    required: ["category"]
                }
            }
        }
    });

    const identifiedItems: IdentifiedItem[] = analysisResponse.text ? JSON.parse(analysisResponse.text) : [];
    return { image: generatedImage, items: identifiedItems };

  } catch (error) {
    console.warn("Error identifying items:", error);
    // If analysis fails, still return the generated image with empty items list
    return { image: generatedImage, items: [] };
  }
};