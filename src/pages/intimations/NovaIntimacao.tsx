import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const NovaIntimacao: React.FC = () => {
  const [numeroIntimacao, setNumeroIntimacao] = useState('0000000-00.0000.0.00.0000');
  const [tribunal, setTribunal] = useState('Tribunal de Justiça do Tocantins');

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Buscando intimação:', numeroIntimacao);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button className="flex items-center bg-indigo-800 text-white py-2 px-4 rounded mr-4">
          <ChevronLeft size={16} />
          <span>Voltar</span>
        </button>
        <h1 className="text-2xl font-bold">Nova Intimação</h1>
      </div>

      {/* Main Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium mb-2">Buscar Intimação</h2>
        <p className="text-gray-600 mb-6">Informe o número do processo que deseja importar</p>

        <form onSubmit={handleBuscar}>
          <div className="mb-4">
            <label htmlFor="tribunal" className="block mb-2 font-medium">Tribunal</label>
            <div className="relative">
              <select
                id="tribunal"
                value={tribunal}
                onChange={(e) => setTribunal(e.target.value)}
                className="w-full border border-gray-300 rounded p-2.5 pr-10 appearance-none"
              >
                <option value="Tribunal de Justiça do Tocantins">Tribunal de Justiça do Tocantins</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="numeroIntimacao" className="block mb-2 font-medium">Número da Intimação</label>
            <input
              type="text"
              id="numeroIntimacao"
              value={numeroIntimacao}
              onChange={(e) => setNumeroIntimacao(e.target.value)}
              className="w-full border border-gray-300 rounded p-2.5"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-400 text-white py-3 rounded font-medium hover:bg-indigo-500 transition-colors"
          >
            Buscar Intimação
          </button>
        </form>

        <div className="mt-6 py-8 px-4 border border-gray-200 rounded text-center text-gray-600">
          <p>Busque um processo pelo número</p>
        </div>
      </div>
    </div>
  );
};

export default NovaIntimacao; 