import os

replacements = {
    "from models.Article": "from models.Article",
    "from models.ArticleAuthor": "from models.ArticleAuthor",
    "from models.ArticleCategory": "from models.ArticleCategory",
    "from models.ArticlePlace": "from models.ArticlePlace",
    "from models.ArticleTag": "from models.ArticleTag",
    "from models.Author": "from models.Author",
    "from models.Category": "from models.Category",
    "from models.Place": "from models.Place",
    "from models.Tag": "from models.Tag",
    "from models.embedding": "from models.embedding",
    "import models": "import models",
    "from Topics.": "from Topics."
}

def walk_and_replace(directory):
    for root, dirs, files in os.walk(directory):
        if 'models' in root or '.venv' in root or '__pycache__' in root:
            continue
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r') as f:
                        content = f.read()
                    
                    new_content = content
                    for old, new in replacements.items():
                        new_content = new_content.replace(old, new)
                        
                    if new_content != content:
                        with open(filepath, 'w') as f:
                            f.write(new_content)
                        print(f"Updated {filepath}")
                except Exception as e:
                    print(f"Error {filepath}: {e}")

walk_and_replace('/home/alevi/proyecto/scrapper')
