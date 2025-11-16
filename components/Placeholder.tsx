
import React from 'react';

const Placeholder: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg p-4">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
      <h3 className="font-semibold text-lg text-gray-600">生成された提案書</h3>
      <p className="text-sm mt-1">
        条件を入力して「生成」ボタンを押すと、<br />ここにA4サイズのコラージュが表示されます。
      </p>
    </div>
  );
};

export default Placeholder;
