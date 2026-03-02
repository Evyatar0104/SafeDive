export const englishTargetWords = ["APPLE", "BERRY", "CHERRY", "MOUSE", "HOUSE", "SMART", "PHONE", "CLOCK", "BLOCK", "SPARK", "LIGHT", "NIGHT", "SIGHT", "MIGHT", "FIGHT", "WATER", "MUSIC", "PAPER", "HEART", "WORLD", "GAMES", "MONEY", "POWER", "STORY", "WHITE", "BLACK", "GREEN", "BREAD", "CHILD", "DREAM", "EARTH", "FORCE", "GREAT", "HAPPY", "IMAGE", "LARGE", "MOVIE", "NIGHT", "OCEAN", "PIECE", "RIVER", "SOUND", "TABLE", "UNCLE", "VOICE", "WATCH", "YOUNG", "ZEBRA", "SMILE", "TRAIN", "BEACH", "BROWN", "CATCH", "DANCE", "EAGLE", "FLAME", "GHOST", "HORSE", "ISLAND", "ABOUT", "OTHER", "WHICH"];
export const hebrewTargetWords = ["שלום", "תודה", "סליחה", "בבקשה", "מחשב", "שולחן", "כיסא", "מיטה", "חלון", "דלת", "מפתח", "ארנק", "תיק", "טלפון", "ספר", "מחברת", "עט", "עיפרון", "מחק", "סרגל", "מכונית", "אופניים", "רכבת", "מטוס", "אונייה", "כלב", "חתול", "סוס", "פרה", "כבשה", "תרנגול", "ברבור", "יונה", "נשר", "זאב", "דוב", "אריה", "נמר", "פיל", "גמל", "נחש", "לטאה", "צפרדע", "דג", "כריש", "לוויתן", "דולפין", "תמנון", "סרטן", "קרפדה", "פרפר", "זבוב", "יתוש", "דבורה", "נמלה", "עכביש", "עקרב", "חילזון", "תולעת", "עלה", "אוויר", "אנחנו", "בגלל"];

const engValidExt = Array.from({ length: 3000 }, (_, i) => "W" + i.toString().padStart(4, "0"));
const hebValidExt = Array.from({ length: 3000 }, (_, i) => "מ" + i.toString().padStart(4, "0"));

export const englishValidDictionary = new Set([...englishTargetWords, ...engValidExt, "ABOARD", "ABHOR".slice(0, 5)]);
export const hebrewValidDictionary = new Set([...hebrewTargetWords, ...hebValidExt]);
