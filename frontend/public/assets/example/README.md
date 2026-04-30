# GEDCOM X example files

Use these files to test **Import GEDCOM X** in the Trees builder.

## Files

| File | Description |
|------|-------------|
| `gedcomx-example.json` | GEDCOM X in JSON format |
| `gedcomx-example.xml`  | GEDCOM X in XML format |
| `gedcomx-example.gedx` | GEDCOM X as .gedx file (same XML content) |

## Example data

All three files describe the same small family:

- **Ahmed Benali** (male) – birth 1950, Fes, Morocco  
- **Fatima Zohra** (female) – birth 1955, Marrakech, Morocco  
- **Samir Benali** (male) – birth 1980, Casablanca, Morocco  

- Ahmed and Fatima are a **couple**.  
- Samir is the **child** of Ahmed (father) and Fatima (mother).

## How to import

1. Open **Trees** in the admin area and edit or create a tree.
2. In the toolbar, click **Import GEDCOM X** and choose:
   - **XML format** → pick `gedcomx-example.xml` or `gedcomx-example.gedx`
   - **JSON format** → pick `gedcomx-example.json`
   - **.gedx file** → pick `gedcomx-example.gedx`
3. After import, the tree should show three people with parent–child and couple links.

## File locations (for developers)

- In dev: `public/assets/example/` (served at `/assets/example/`)
- Example URLs: `/assets/example/gedcomx-example.json`, `/assets/example/gedcomx-example.xml`
