import React, { useState, useCallback, useRef } from 'react';
import { generateCollage, IdentifiedItem } from './services/geminiService';
import { FURNITURE_ITEMS } from './constants';
import Header from './components/Header';
import Checkbox from './components/Checkbox';
import Loader from './components/Loader';
import Placeholder from './components/Placeholder';
import { ArrowUpTrayIcon, PhotoIcon, XCircleIcon, TagIcon, CurrencyYenIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [description, setDescription] = useState<string>('モダンで洗練されたスタイル');
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // Initially empty
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [identifiedItems, setIdentifiedItems] = useState<IdentifiedItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCheckboxChange = useCallback((item: string) => {
    setSelectedItems(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const promises = files.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file as Blob);
        });
      });

      Promise.all(promises).then(newImages => {
        setReferenceImages(prev => [...prev, ...newImages]);
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (selectedItems.length === 0) {
      setError('コラージュに含めるアイテムを少なくとも1つ選択してください。');
      return;
    }
    setIsLoading(true);
    setGeneratedImage(null);
    setIdentifiedItems([]);
    setError(null);
    try {
      const result = await generateCollage(description, selectedItems, referenceImages);
      setGeneratedImage(result.image);
      setIdentifiedItems(result.items);
    } catch (err) {
      setError('画像の生成中にエラーが発生しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-700">提案書の条件を入力</h2>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-2">
                インテリアのスタイル
              </label>
              <textarea
                id="description"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-500 transition"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例: 温かみのある北欧風、ミニマル、インダストリアル..."
              />
            </div>

            {/* Reference Images */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                イメージ写真 (任意・複数可)
              </label>
              
              {referenceImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {referenceImages.map((img, index) => (
                    <div key={index} className="relative aspect-square group">
                      <img src={img} alt={`Reference ${index}`} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 text-gray-600 hover:text-red-500 transition shadow-sm opacity-80 hover:opacity-100"
                        aria-label="画像を削除"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400 transition bg-gray-50 hover:bg-gray-100"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-1 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <p className="pl-1">画像を追加 (クリックまたはD&D)</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3">コラージュに含めるアイテム (選択)</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {FURNITURE_ITEMS.map(({ name }) => (
                  <Checkbox
                    key={name}
                    id={name}
                    label={name}
                    checked={selectedItems.includes(name)}
                    onChange={() => handleCheckboxChange(name)}
                  />
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="mt-auto w-full bg-gray-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  生成・解析中...
                </>
              ) : (
                'インテリア提案書を生成'
              )}
            </button>
          </div>

          {/* Image Display Section */}
          <div className="flex flex-col gap-4">
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 aspect-[297/210] flex items-center justify-center">
              {isLoading ? (
                <Loader />
              ) : generatedImage ? (
                <img src={generatedImage} alt="Generated Interior Collage" className="w-full h-full object-contain rounded-lg"/>
              ) : (
                <Placeholder />
              )}
            </div>
            
            {generatedImage && !isLoading && (
              <>
                <a
                  href={generatedImage}
                  download="interior-collage.png"
                  className="w-full bg-white text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 border border-gray-300 transition-all duration-300 ease-in-out flex items-center justify-center"
                >
                  <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                  ダウンロード
                </a>

                {/* Identified Items List */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
                  <h3 className="text-md font-bold text-gray-700 mb-3 flex items-center">
                    <TagIcon className="h-5 w-5 mr-2 text-gray-500" />
                    コラージュ内アイテム (推定)
                  </h3>
                  {identifiedItems.length > 0 ? (
                    <>
                      <div className="grid gap-3">
                        {identifiedItems.map((item, i) => (
                          <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                <div>
                                    <p className="text-sm font-bold text-gray-700">{item.category}</p>
                                    {(item.brand || item.productName) && (
                                        <p className="text-sm text-gray-600">
                                            {item.brand} <span className="text-gray-400">|</span> {item.productName}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {item.price && (
                                <div className="flex items-center text-gray-500 text-xs sm:text-sm whitespace-nowrap pl-3.5 sm:pl-0">
                                    <CurrencyYenIcon className="h-4 w-4 mr-1" />
                                    {item.price}
                                </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-3 text-right">
                        ※AIによる画像解析のため、ブランド、商品名、価格は推測に基づく参考情報です。
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic">アイテムの詳細情報を特定できませんでした。</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;