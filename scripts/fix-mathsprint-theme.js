const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/activate-mind/MathSprint.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace bg-[#1a1a1c] with bg-card
content = content.replace(/bg-\[#1a1a1c\]/g, 'bg-card');

// Replace border-white/10 with border-black/10 dark:border-white/10
content = content.replace(/border-white\/10(?:(?! dark:border-white\/10))/g, 'border-black/10 dark:border-white/10');

// Replace border-white/5 with border-black/5 dark:border-white/5
content = content.replace(/border-white\/5(?:(?! dark:border-white\/5))/g, 'border-black/5 dark:border-white/5');

// Replace text-white with text-foreground (except inside gradients or specific colored buttons where text-white is needed)
// We will replace text-white with text-foreground globally, then fix the specific ones
content = content.replace(/text-white/g, 'text-foreground');

// Replace bg-white/5 with bg-black/5 dark:bg-white/5
content = content.replace(/bg-white\/5(?:(?! dark:bg-white\/5))/g, 'bg-black/5 dark:bg-white/5');

// Replace hover:bg-white/10 with hover:bg-black/10 dark:hover:bg-white/10
content = content.replace(/hover:bg-white\/10/g, 'hover:bg-black/10 dark:hover:bg-white/10');

// Replace bg-white/10 with bg-black/10 dark:bg-white/10
content = content.replace(/bg-white\/10(?:(?! dark:bg-white\/10))/g, 'bg-black/10 dark:bg-white/10');

// Fix text-foreground back to text-white for gradient buttons
// "bg-gradient-to-r from-primary to-blue-600 ... text-foreground" -> text-white
content = content.replace(/(bg-gradient-[^"']+)text-foreground/g, '$1text-white');

// For text-white/70, it becomes text-foreground/70
content = content.replace(/text-foreground\/70/g, 'text-foreground/70'); // already converted by text-white -> text-foreground? Wait.

// Wait, some other things:
content = content.replace(/bg-\[#2a2a2d\]/g, 'bg-black/5 dark:bg-[#2a2a2d]');
content = content.replace(/bg-\[#1f1f22\]/g, 'bg-black/5 dark:bg-[#1f1f22]');

fs.writeFileSync(filePath, content);
console.log("Updated MathSprint.tsx");
