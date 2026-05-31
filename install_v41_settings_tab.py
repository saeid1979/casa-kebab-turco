from pathlib import Path
import shutil
import re

ROOT = Path(r"D:\Python_project\Site_resturante")
MAIN = ROOT / "frontend" / "src" / "main.jsx"

if not MAIN.exists():
    raise FileNotFoundError(f"File not found: {MAIN}")

shutil.copy2(MAIN, MAIN.with_suffix(MAIN.suffix + ".before_v41_settings_tab"))

text = MAIN.read_text(encoding="utf-8", errors="replace")

if "tabSettings" not in text:
    text = text.replace(
        "tabHistory: 'Historial',",
        "tabHistory: 'Historial',\n    tabSettings: 'Configuración',",
        1
    )
    text = text.replace(
        "tabHistory: 'History',",
        "tabHistory: 'History',\n    tabSettings: 'Settings',",
        1
    )

text = text.replace(
    """    <main className="stack">
      <RestaurantSettingsAdminV43 lang={lang} restaurantSettings={restaurantSettings} setRestaurantSettings={setRestaurantSettings} />
      <section className="admin-title">""",
    """    <main className="stack">
      <section className="admin-title">""",
    1
)

text = re.sub(
    r'(\s*<main className="stack">\s*)<RestaurantSettingsAdminV43\s+lang=\{lang\}\s+restaurantSettings=\{restaurantSettings\}\s+setRestaurantSettings=\{setRestaurantSettings\}\s*/>\s*',
    r'\1',
    text,
    count=1
)

settings_button = """          {role === 'admin' && <button className={adminTab === 'settings' ? 'active' : ''} onClick={() => setAdminTab('settings')}>{t.tabSettings || 'Configuración'}</button>}
"""

if "adminTab === 'settings'" not in text:
    text = text.replace(
        "          <button className={adminTab === 'history' ? 'active' : ''} onClick={() => setAdminTab('history')}>{t.tabHistory}</button>",
        settings_button + "          <button className={adminTab === 'history' ? 'active' : ''} onClick={() => setAdminTab('history')}>{t.tabHistory}</button>",
        1
    )

settings_panel = """
      {role === 'admin' && adminTab === 'settings' && (
        <RestaurantSettingsAdminV43
          lang={lang}
          restaurantSettings={restaurantSettings}
          setRestaurantSettings={setRestaurantSettings}
        />
      )}

"""

if "adminTab === 'settings' &&" not in text:
    marker = "      {role === 'admin' && adminTab === 'customers' && ("
    if marker in text:
        text = text.replace(marker, settings_panel + marker, 1)
    else:
        marker = "      {adminTab === 'live' && ("
        text = text.replace(marker, settings_panel + marker, 1)

MAIN.write_text(text, encoding="utf-8")

print("v41 Settings Tab installed.")
print("Run:")
print(r"cd D:\Python_project\Site_resturante\frontend")
print("npm run dev")
