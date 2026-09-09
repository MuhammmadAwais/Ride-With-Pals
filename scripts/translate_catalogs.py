import os
import re
import time
import polib
from concurrent.futures import ThreadPoolExecutor
from deep_translator import GoogleTranslator

LANGUAGES = ['ar', 'es', 'fr', 'hi', 'it', 'nl', 'pt', 'ru', 'ur']
LOCALES_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'locales')
SEP = " <<<SEP>>> "

def normalize_placeholders(text, original):
    if not text:
        return original
    text = re.sub(r'\{\s*(\w+)\s*\}', r'{\1}', text)
    text = re.sub(r'<\s*(\/?\s*\d+)\s*>', lambda m: f"<{m.group(1).replace(' ', '')}>", text)
    
    orig_placeholders = re.findall(r'\{[^{}]+\}', original)
    res_placeholders = re.findall(r'\{[^{}]+\}', text)
    if len(orig_placeholders) == len(res_placeholders):
        for orig_p, res_p in zip(orig_placeholders, res_placeholders):
            text = text.replace(res_p, orig_p, 1)

    orig_tags = re.findall(r'</?\d+>', original)
    res_tags = re.findall(r'</?\d+>', text)
    if len(orig_tags) == len(res_tags):
        for orig_t, res_t in zip(orig_tags, res_tags):
            text = text.replace(res_t, orig_t, 1)

    return text

def translate_locale(lang):
    po_path = os.path.join(LOCALES_DIR, lang, 'messages.po')
    if not os.path.exists(po_path):
        return

    po = polib.pofile(po_path)
    untranslated = [entry for entry in po if entry.msgid and not entry.msgstr]
    total = len(untranslated)
    
    print(f"[{lang.upper()}] Starting with {total} untranslated", flush=True)
    if not untranslated:
        print(f"[{lang.upper()}] Already 100% translated!", flush=True)
        return

    translator = GoogleTranslator(source='en', target=lang)
    chunk_size = 25
    
    for i in range(0, total, chunk_size):
        chunk = untranslated[i:i + chunk_size]
        msgids = [entry.msgid for entry in chunk]
        
        joined = SEP.join(msgids)
        try:
            translated_joined = translator.translate(joined)
            parts = re.split(r'\s*<<<SEP>>>\s*', translated_joined, flags=re.IGNORECASE)
            if len(parts) == len(chunk):
                for entry, trans in zip(chunk, parts):
                    entry.msgstr = normalize_placeholders(trans.strip(), entry.msgid)
            else:
                for entry in chunk:
                    try:
                        t = translator.translate(entry.msgid)
                        entry.msgstr = normalize_placeholders(t.strip(), entry.msgid) if t else entry.msgid
                    except Exception:
                        entry.msgstr = entry.msgid
        except Exception:
            for entry in chunk:
                try:
                    t = translator.translate(entry.msgid)
                    entry.msgstr = normalize_placeholders(t.strip(), entry.msgid) if t else entry.msgid
                except Exception:
                    entry.msgstr = entry.msgid

        po.save(po_path)
        done = min(i + chunk_size, total)
        print(f"[{lang.upper()}] Progress: {done}/{total} ({int(done / total * 100)}%)", flush=True)
        time.sleep(0.08)

    print(f"[{lang.upper()}] COMPLETE!", flush=True)

def main():
    print(f"Fast batch translation starting for: {', '.join(LANGUAGES)}", flush=True)
    start = time.time()
    with ThreadPoolExecutor(max_workers=len(LANGUAGES)) as executor:
        executor.map(translate_locale, LANGUAGES)
    print(f"\nALL LOCALES TRANSLATED in {round(time.time() - start, 1)}s!", flush=True)

if __name__ == '__main__':
    main()
