
import React, { useState } from 'react';
import { Category } from '../../../types';
import Icon from '../../Icon';

type ShowToastFn = (message: string, type?: 'success' | 'error') => void;

interface ManageCategoriesModalProps {
    categories: Category[];
    onClose: () => void;
    onAddCategory: (name: string) => Promise<void>;
    onUpdateCategory: (category: Category) => Promise<void>;
    onDeleteCategory: (id: string) => Promise<void>;
    showToast: ShowToastFn;
}

const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({ categories, onClose, onAddCategory, onUpdateCategory, onDeleteCategory, showToast }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleAdd = async () => {
        if (!newCategoryName.trim()) return;
        await onAddCategory(newCategoryName);
        showToast(`Categoria "${newCategoryName}" criada.`, 'success');
        setNewCategoryName('');
    };

    const handleUpdate = async () => {
        if (!editingCategory || !editingCategory.name.trim()) return;
        await onUpdateCategory(editingCategory);
        showToast(`Categoria "${editingCategory.name}" atualizada.`, 'success');
        setEditingCategory(null);
    };
    
    const handleDelete = async (category: Category) => {
        if(window.confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)){
            await onDeleteCategory(category.id);
            showToast(`Categoria "${category.name}" excluída.`, 'success');
        }
    };


    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-base-300 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-base-200">
                    <h2 className="text-xl font-bold text-white">Gerenciar Categorias</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-base-200">
                        <Icon name="close" className="w-6 h-6 text-gray-400" />
                    </button>
                </header>

                <main className="p-6 overflow-y-auto space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nova Categoria</label>
                        <div className="flex space-x-2">
                            <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="flex-grow bg-base-200 p-2 rounded"/>
                            <button onClick={handleAdd} className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded">Adicionar</button>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        {categories.map(cat => (
                            <div key={cat.id} className="bg-base-200 p-2 rounded flex items-center justify-between">
                                {editingCategory?.id === cat.id ? (
                                    <input 
                                        type="text" 
                                        value={editingCategory.name}
                                        onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                        className="flex-grow bg-base-100 p-1 rounded"
                                    />
                                ) : (
                                    <span className="p-1">{cat.name}</span>
                                )}
                                <div className="flex space-x-1">
                                    {editingCategory?.id === cat.id ? (
                                        <button onClick={handleUpdate} className="p-2 text-green-400 hover:bg-base-300 rounded"><Icon name="check-circle" className="w-5 h-5"/></button>
                                    ) : (
                                        <button onClick={() => setEditingCategory(cat)} className="p-2 text-gray-400 hover:bg-base-300 rounded"><Icon name="pencil" className="w-5 h-5"/></button>
                                    )}
                                    <button onClick={() => handleDelete(cat)} className="p-2 text-red-500 hover:bg-base-300 rounded"><Icon name="trash" className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ))}
                    </div>

                </main>
            </div>
        </div>
    );
};

export default ManageCategoriesModal;
