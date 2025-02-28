// components/CardUploadInput.js
import React from 'react';

const CardUploadInput = ({ index, card, updateCard }) => {
  return (
    <div className="mb-6 p-4 border rounded bg-gray-50">
      <h3 className="font-bold mb-2">Card {index + 1}</h3>
      
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">URL do Arquivo</label>
        <div className="flex">
          <input 
            type="text" 
            className="flex-1 p-2 border rounded-l"
            value={card.fileUrl}
            onChange={(e) => updateCard(index, 'fileUrl', e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <button 
            type="button"
            className="bg-gray-200 text-gray-700 p-2 rounded-r text-sm"
            onClick={() => {
              const testUrls = [
                "https://www.yamaha-motor.com.br/ccstore/v1/images/?source=/file/v4553622368473064581/products/30115.301151.png",
                "https://www.yamaha-motor.com.br/ccstore/v1/images/?source=/file/v2659285799032368481/products/30106.301061.png",
                "https://www.yamaha-motor.com.br/ccstore/v1/images/?source=/file/v3133775529024754871/products/30132.301321.png",
                "https://www.yamaha-motor.com.br/ccstore/v1/images/?source=/file/v5457449167124694502/products/30119.301191.png"
              ];
              updateCard(index, 'fileUrl', testUrls[index % testUrls.length]);
            }}
          >
            Testar URL
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">URL pública da imagem/vídeo que será exibida no carrossel</p>
      </div>
      
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Tipo do Arquivo</label>
        <select 
          className="w-full p-2 border rounded"
          value={card.fileType}
          onChange={(e) => updateCard(index, 'fileType', e.target.value)}
        >
          <option value="image">Imagem</option>
          <option value="video">Vídeo</option>
        </select>
      </div>
    </div>
  );
};

export default CardUploadInput;