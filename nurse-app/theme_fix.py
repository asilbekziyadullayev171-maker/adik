import os
import glob
import re

def replace_theme(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Dark to Light replacements
    replacements = [
        (r'bg-slate-950/80', 'bg-white/90'),
        (r'bg-slate-950/60', 'bg-slate-50/80'),
        (r'bg-slate-950/50', 'bg-slate-50/50'),
        (r'bg-slate-950/40', 'bg-slate-50/40'),
        (r'bg-slate-950', 'bg-white'),
        (r'bg-slate-900/90', 'bg-slate-100/90'),
        (r'bg-slate-900/80', 'bg-slate-100/80'),
        (r'bg-slate-900', 'bg-slate-50'),
        (r'bg-slate-850', 'bg-slate-100'),
        (r'bg-slate-800', 'bg-slate-200'),
        (r'bg-slate-750', 'bg-slate-200'),
        (r'bg-slate-700', 'bg-slate-300'),
        
        (r'border-slate-800', 'border-slate-200'),
        (r'border-slate-850', 'border-slate-200'),
        (r'border-slate-750', 'border-slate-300'),
        (r'border-slate-700', 'border-slate-300'),
        
        (r'text-slate-100', 'text-slate-900'),
        (r'text-slate-200', 'text-slate-800'),
        (r'text-slate-300', 'text-slate-700'),
        (r'text-slate-400', 'text-slate-600'),
        (r'text-slate-500', 'text-slate-500'),
        
        (r'text-white', 'text-slate-900'),
        (r'hover:text-white', 'hover:text-slate-900'),
        (r'hover:bg-slate-850', 'hover:bg-slate-100'),
        (r'hover:bg-slate-800', 'hover:bg-slate-200'),
        (r'hover:bg-slate-750', 'hover:bg-slate-300'),
        
        (r'bg-blue-950/60', 'bg-blue-50'),
        (r'bg-blue-950/20', 'bg-blue-50'),
        (r'bg-blue-950', 'bg-blue-50'),
        (r'text-blue-300', 'text-blue-700'),
        (r'text-blue-400', 'text-blue-600'),
        (r'border-blue-800/40', 'border-blue-200'),
        (r'border-blue-800', 'border-blue-200'),
        
        (r'bg-red-950/50', 'bg-red-50'),
        (r'bg-red-950/40', 'bg-red-50'),
        (r'bg-red-950', 'bg-red-50'),
        (r'border-red-800/60', 'border-red-200'),
        (r'border-red-900/60', 'border-red-200'),
        (r'text-red-300', 'text-red-700'),
        (r'text-red-400', 'text-red-600'),
        
        (r'text-emerald-400', 'text-emerald-600'),
        (r'text-emerald-300', 'text-emerald-700'),
    ]

    new_content = content
    for pattern, repl in replacements:
        new_content = re.sub(pattern, repl, new_content)

    # Some manual fixes for primary buttons so they stay white text on colored bg
    new_content = new_content.replace('bg-blue-600 text-slate-900', 'bg-blue-600 text-white')
    new_content = new_content.replace('bg-emerald-600 text-slate-900', 'bg-emerald-600 text-white')
    new_content = new_content.replace('bg-red-600 text-slate-900', 'bg-red-600 text-white')
    new_content = new_content.replace('text-slate-900 shadow-sm', 'text-white shadow-sm')

    if content != new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            replace_theme(os.path.join(root, file))
